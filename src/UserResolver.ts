import { Resolver, Query, Mutation, Arg, ObjectType, Field, Ctx } from 'type-graphql';
import { User } from './entity/User';
import { hash, compare } from 'bcryptjs';
import { MyContext } from './MyContext';
import { createRefreshToken, createAccessToken } from './auth';


@ObjectType()
class LoginResponse {
  @Field()
  accessToken: String
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return 'hi';
  }

  @Query(() => [User])
  users() {
    return User.find();
  }

  @Mutation(() => Boolean)
  async register(
    @Arg('email') email: string,
    @Arg('password') password: string    
  ) {
    const hashedPass = await hash(password, 12)

    try {
    await User.insert({
      email,
      password: hashedPass
    }); 
    } catch (error) {
      console.log(error);
      return false;
    }

    return true;
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: MyContext
  ) : Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } })

    if(!user) {
      throw new Error (`couldn't find user`)
    }

    const valid = await compare(password, user.password);

    if(!valid) {
      throw new Error('Bad password');
    } 

    // Login successful

    res.cookie('jid', createRefreshToken(user),
      {
        httpOnly: true,
      })

    return {
      accessToken: createAccessToken(user)
    };
  }
}