import { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { decode, sign, verify } from "hono/jwt";
import { userRouter } from "./routes/user";
import { blogRouter } from "./routes/blog";
import { cors } from "hono/cors";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();
app.use("/*", cors());
app.route("api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);

//middlewares
// app.use("/api/v1/blog/*" , async(c , next)=>{
//   console.log("middleware use started");

//   const jwt = c.req.header('Authorization');
//   if(!jwt){
//     c.status(401);
//     return c.json({error:"unauthorized"});
//   }
//   console.log(jwt)

//   const token  = jwt.split(' ')[1];

//   const payload = await verify(token, c.env.JWT_SECRET);
//   console.log(payload);

//   if(!payload){
//     c.status(401);
//     return c.json({error:"unauthorized"});

// }

// c.set('userId', payload.id);

// console.log("middleware fully used");
// await next();
// })

//

// c here is the context which has all the request data, respnse data and all the env data

export default app;
