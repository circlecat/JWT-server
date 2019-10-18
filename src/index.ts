import "reflect-metadata";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import { UserResolver } from "./UserResolver";
import { createConnection } from "typeorm";
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import { verify } from "jsonwebtoken";
import { User } from "./entity/User";
import { createAccessToken, createRefreshToken } from "./auth";
import { sendRefreshToken } from "./sendRefreshToken";

(async () => {
  const app = express();

  app.get('/', (_req, res) => res.send('hello'));

  app.use(cookieParser());

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver]
    }),
    context: ({ req, res }) => ({ req, res })
  })

  app.post("/refresh_token", async (req, res) => {
    const token = req.cookies.jid;
    if(!token) {
      return res.send({ ok:false, accessToken: '' })
    }

    let payload: any = null;
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch (error) {
      console.log(error);
      return res.send({ ok:false, accessToken: '' })
    }

    // Token is valid and we can send back an access

    const user = await User.findOne({ id: payload.userId, email: payload.email });

    if (!user) {
      return res.send({ ok:false, accessToken: '' })
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok:false, accessToken: '' })
    }

    sendRefreshToken(res, createRefreshToken(user));

    return res.send({ ok:true, accessToken: createAccessToken(user) });
  })

  await createConnection();

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => console.log('started at 4000...'));
})()

