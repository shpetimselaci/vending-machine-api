import { RouteHandlerFunction, RouteHandlerSchema } from "@/types";
import { User } from "../auth/schema";

const getUser: RouteHandlerSchema = (server) => ({
  schema: {
    response: {
      200: User
    }
  },
  preHandler: server.authenticated
});

export const me: RouteHandlerFunction = (server) =>
  server.get("/user/me", getUser(server), async (request) => {
    console.log(request.session.user);
    return request?.session?.user;
  });

export default [me];
