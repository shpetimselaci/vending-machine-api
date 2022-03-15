import { FastifyPluginAsync, preHandlerHookHandler } from "fastify";
import { UserRole } from "@/models/user";
import { Forbidden } from "@/shared/errors";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
  export interface FastifyInstance {
    buyerOnly: preHandlerHookHandler;
    sellerOnly: preHandlerHookHandler;
  }
}

export const roleValidator: (allowedRoles: UserRole[]) => preHandlerHookHandler =
  (allowedRoles) => (request, reply, next) => {
    const {
      user: { role }
    } = request.session;
    if (!allowedRoles.includes(role)) {
      next(Forbidden(`Only users with role ${allowedRoles.join()} are allowed to do this action`));

      return;
    }
    next();
  };

const addRolesValidator: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.decorate("buyerOnly", roleValidator([UserRole.BUYER]));
  fastify.decorate("sellerOnly", roleValidator([UserRole.SELLER]));
};

export default fp(addRolesValidator);
