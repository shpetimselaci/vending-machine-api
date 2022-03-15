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
    return server.db.models.User.findById(request.session.user._id);
  });

export const deleteUser: RouteHandlerFunction = (server) =>
  server.delete("/user/delete", deleteUserSchema(server), async (request, reply) => {
    await server.db.models.User.deleteOne({ _id: request.session.user._id });
    await new Promise((res, reject) =>
      request.destroySession((err) => {
        if (err) {
          reject(err);
        }
        res("ok");
      })
    );
    reply.code(200).send("User deleted");
  });

export default [me, deleteUser];
