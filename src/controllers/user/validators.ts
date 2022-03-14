import { RouteHandlerMethod } from "fastify";
import { UserRole } from "@/models/user";
import { Forbidden } from "@/shared/errors";

export const roleValidator: (allowedRoles: UserRole[]) => RouteHandlerMethod = (allowedRoles) => (request) => {
  const {
    user: { role }
  } = request.session;
  if (!allowedRoles.includes(role)) {
    Forbidden(`Only users with ${role}, are not allowed`);
  }
};
