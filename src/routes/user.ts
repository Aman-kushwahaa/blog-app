import { Hono } from "hono";
import { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";
import { signinInput } from "../../../common/src/index";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const { success } = signinInput.safeParse(body);
  //creating and gettting back the user obj

  if (!success) {
    return c.json({
      message: "invalid Details",
    });
  }
  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: body.password,
    },
  });

  //generating the jwt token
  if (user) {
    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({
      jwt: token,
    });
  }
});

//signin
userRouter.post("/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        email: body.email,
        password: body.password,
      },
    });
    if (user) {
      const token = await sign({ id: user.id }, c.env.JWT_SECRET);
      return c.json({
        jwt: token,
      });
    }
  } catch (error) {
    console.error(error);
  }

  return c.text("No user Found");
});
