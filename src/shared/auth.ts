import bcrypt from "bcrypt";
import { FastifyInstance, FastifyPluginAsync, preHandlerHookHandler } from "fastify";
import { IUser } from "@/models/user";
import { NotFound, UnAuthenticated } from "./errors";
import fp from "fastify-plugin";
import server from "@/server";

declare module "fastify" {
  interface FastifyRequest {
    userObj: IUser;
  }
  export interface FastifyInstance {
    authenticated: preHandlerHookHandler;
  }
}

export const comparePassword = (password: string, hashedPassword: string) => bcrypt.compare(password, hashedPassword);

export const hashPassword = async (plainTextPassword: string) => {
  const salt = await bcrypt.genSalt(5);

  return bcrypt.hash(plainTextPassword, salt);
};

const isAuthenticated: preHandlerHookHandler = async (request) => {
  try {
    const user = await request.jwtVerify();
    const userObj = await server.db.models.User.findById((user as unknown as IUser)._id);

    if (!userObj) {
      throw NotFound("User was deleted!");
    }
    request.userObj = userObj.toJSON();

    return request;
  } catch (error) {
    console.log(error);
    throw UnAuthenticated();
  }

  // const userSessions = request.sessionStore.get(request?.session?.user.username, (err) => {
  //   console.log(err);
  // };
};
const addAuthenticatorDecoration: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.decorate("authenticated", isAuthenticated);
};

export default fp(addAuthenticatorDecoration);
