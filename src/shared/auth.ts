import bcrypt from "bcrypt";
import { FastifyInstance, FastifyPluginAsync, preHandlerHookHandler } from "fastify";
import { IUser } from "@/models/user";
import { UnAuthenticated } from "./errors";
import fp from "fastify-plugin";

declare module "fastify" {
  interface Session {
    user: Omit<IUser, "password" | "deposit"> & { authenticated: boolean };
  }
  interface FastifyRequest {
    user?: IUser;
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
  if (!request.session?.user?.authenticated) {
    const user = await request.server.db.models.User.findById(request.session?.user?._id);

    if (!user) {
      await new Promise((resolve, reject) =>
        request.destroySession((err) => {
          if (err) {
            reject(err);
          }
          resolve("");
        })
      );
    }

    throw UnAuthenticated();
  }

  return "";

  // const userSessions = request.sessionStore.get(request?.session?.user.username, (err) => {
  //   console.log(err);
  // };
};
const addAuthenticatorDecoration: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.decorate("authenticated", isAuthenticated);
};

export default fp(addAuthenticatorDecoration);
