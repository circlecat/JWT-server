import { MiddlewareFn } from "type-graphql";
import { MyContext } from "./MyContext";
import { verify } from "jsonwebtoken";

// Bearer 564dsvd54v

export const isAuth:MiddlewareFn<MyContext> = ({ context }, next) => {
  const auth = context.req.headers['authorization'];

  if (!auth) {
    throw new Error('not authenticated');
  }

  try {
    const token = auth.split(' ')[1];
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);
    context.payload = payload as any;
  } catch (error) {
    console.log(error);
    throw new Error('not authenticated');  
  }

  return next();
}
