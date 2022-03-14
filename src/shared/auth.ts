import bcrypt from "bcrypt";
import { FastifyInstance, FastifyPluginAsync, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import { IUser } from "@/models/user";
import { UnAuthenticated } from "./errors";
import fp from "fastify-plugin";

declare module "fastify" {
  interface Session {
    user: Omit<IUser, "password"> & { authenticated: boolean };
  }
  interface FastifyRequest {
    user?: IUser;
  }
  export interface FastifyInstance {
    authenticated: RouteHandlerMethod;
  }
}

export const comparePassword = (password: string, hashedPassword: string) => bcrypt.compare(password, hashedPassword);

export const hashPassword = async (plainTextPassword: string) => {
  const salt = await bcrypt.genSalt(5);

  return bcrypt.hash(plainTextPassword, salt);
};

const isAuthenticated: preHandlerHookHandler = (request, reply, next) => {
  if (!request.session?.user?.authenticated) {
    throw UnAuthenticated();
  }
  next();

  // const userSessions = request.sessionStore.get(request?.session?.user.username, (err) => {
  //   console.log(err);
  // };
};
const addAuthenticatorDecoration: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.decorate("authenticated", isAuthenticated);
};

export default fp(addAuthenticatorDecoration);
