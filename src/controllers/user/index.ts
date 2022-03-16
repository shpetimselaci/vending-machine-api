import { RouteHandlerFunction, RouteHandlerSchema } from "@/types";
import { User } from "../auth/schema";

const getUser: RouteHandlerSchema = (server) => ({
  schema: {
    response: {
      200: User
    }
  },
  preHandler: [server.authenticated]
});

const deleteUserSchema: RouteHandlerSchema = (server) => ({
  schema: {
    response: {
      200: User
    }
  },
  preHandler: [server.authenticated]
});

export const me: RouteHandlerFunction = (server) =>
  server.get("/user/me", getUser(server), async (request) => {
    return request.userObj;
  });

export const deleteUser: RouteHandlerFunction = (server) =>
  server.delete("/user/delete", deleteUserSchema(server), async (request, reply) => {
    await server.db.models.User.deleteOne({ _id: request.userObj._id });

    reply.code(200).send("User deleted");
  });

export default [me, deleteUser];
