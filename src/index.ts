import { Prisma } from '@prisma/client'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import {decode, sign , verify} from 'hono/jwt';

const app = new Hono<{
  Bindings:{
    DATABASE_URL:string,
    JWT_SECRET:string
  },
  Variables:{
    userId:string
  }
}>()


//middlewares
app.use("/api/v1/blog/*" , async(c , next)=>{
  console.log("middleware use started");

  const jwt = c.req.header('Authorization');
  if(!jwt){
    c.status(401);
    return c.json({error:"unauthorized"});
  }
  console.log(jwt)

  const token  = jwt.split(' ')[1];

  const payload = await verify(token, c.env.JWT_SECRET);
  console.log(payload);

  if(!payload){
    c.status(401);
    return c.json({error:"unauthorized"});

}

c.set('userId', payload.id);

console.log("middleware fully used");
await next();
})
//

app.post('/api/v1/blog', (c) => {
	console.log(c.get('userId'));
	return c.text('signin route')
})

// c here is the context which has all the request data, respnse data and all the env data

app.post('/api/v1/signup', async (c) => {
const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

  

  const body = await c.req.json();

//creating and gettting back the user obj 
 const user =  await prisma.user.create({
    data:{
      email: body.email,
      password : body.password
    }
  })
  //generating the jwt token 

  const token = await sign({id:user.id},c.env.JWT_SECRET)

//returning the jwt token 
	return c.json({
    jwt:token

  })
})



//sign in api 
app.post('/api/v1/signin', async (c) => {

  const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

  const body = await c.req.json();

 try{
  const user =  await prisma.user.findUniqueOrThrow({
      
    where:{
      email: body.email,
      password:body.password
     
    }
    
  })
  if(user){
      const token = await  sign({id:user.id}, c.env.JWT_SECRET)
      	return c.json({
    jwt:token  })
    } 

  
}
catch(error){

  console.error(error);

}

return c.text("No user Found");
})









app.get('/api/v1/blog/:id', (c) => {
	const id = c.req.param('id')
	console.log(id);
	return c.text('get blog route')
})

app.post('/api/v1/blog', (c) => {

	return c.text('signin route')
})

app.put('/api/v1/blog', (c) => {
	return c.text('signin route')
})



export default app
