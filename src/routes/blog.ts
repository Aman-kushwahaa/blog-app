import { Prisma } from '@prisma/client'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import {decode, sign , verify} from 'hono/jwt';


export const blogRouter = new Hono<{
    Bindings:{
        JWT_SECRET:string,
        DATABASE_URL:string
    },
    Variables:{
        userId:string
    }

}>()

//creating middleware

blogRouter.use("/*", async (c,next)=>{
    
    const authHeader =  c.req.header("authorization") || "";

    try{

    
    const user   = await verify(authHeader, c.env.JWT_SECRET)

    if(user){
        c.set("userId", user.id);
       await  next();

    }
  
        
       
    }
    catch(e){
             c.status(403);
       
       
        return c.json({
            "message":"Please Log in "
        })

    }
}

  )

    



blogRouter.get("/bulk", async(c)=>{

     try{
       const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());
        const blogs  = await prisma.post.findMany();
        if(blogs){
             return c.json({
        "blogs":blogs})

        }
    }
    catch(e){
        return c.json({
            e
        });
    }
    


   

})



//creating a blog post
blogRouter.post('', async(c) => {

    const body = await c.req.json();
    const authorId = c.get("userId")

    const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

    try{

        
        const blog =  await prisma.post.create({
            data:{
                title:body.title,
                content:body.content,
                authorId:authorId
            }
        })
        
        
        return c.json({
            id:blog.id
        })
    }
    catch(error){
return c.json({
    error
})    }
    
    })

// c here is the context which has all the request data, respnse data and all the env data




//updating a blog post

blogRouter.put("/", async (c)=>{
    const body =await  c.req.json();

   const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

 const blog = await prisma.post.update({
    where: {
        id:body.id

    },
    data:{
        title:body.title,
        content:body.content
    }
 })

 return c.json({
    id:body.id
 })
})

//get a blog

blogRouter.get("/:id" , async(c)=>{
    const body  =  c.req.param("id");
      const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

    try{

        const post  = await prisma.post.findFirst({
            where:{
                id:body
            }
            
        })
        if(post){
            return c.json({
                
            post:post
        })
    }
    }
    catch(error){
        return c.json({  
            "error":error
        })
    }
    
})

