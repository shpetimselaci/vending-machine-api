import bcrypt from "bcrypt";
import { FastifyInstance, FastifyPluginAsync, RouteHandlerMethod } from "fastify";
import { IUser } from "@/models/user";
import { Forbidden, UnAuthenticated } from "./errors";

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

const isAuthenticated: RouteHandlerMethod = function isAuthenticated(request) {
  if (!request.session?.user?.authenticated) {
    throw UnAuthenticated("User must be authenticated!");
  }

  // const userSessions = request.sessionStore.get(request?.session?.user.username, (err) => {
  //   console.log(err);
  // });
};

export const addProtectedRouteDecoration: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  try {
    fastify.decorate("authenticated", isAuthenticated);
  } catch (err) {
    console.warn(err);
  }
};
