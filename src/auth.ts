import { User } from "./entity/User";
import { sign } from "jsonwebtoken";

export const createAccessToken = (user: User): String => 
  sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });

export const createRefreshToken = (user: User): String => 
  sign({ userId: user.id, email: user.email }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' })