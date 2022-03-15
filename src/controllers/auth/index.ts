import { Static } from "@sinclair/typebox";
import { comparePassword, hashPassword } from "@/shared/auth";
import { RouteHandlerFunction, RouteHandlerSchema } from "@/types";
import { BadRequest } from "@/shared/errors";
import { CreateUserSchema, LoginSchema, User } from "./schema";

type SignUpRouteOptionsType = { Body: Static<typeof CreateUserSchema> };

type LoginRouteOptionsType = { Body: Static<typeof LoginSchema> };

const signUpOptions: RouteHandlerSchema = () => ({
  schema: {
    body: CreateUserSchema,
    response: {
      201: User
    }
  }
});

const loginOptions: RouteHandlerSchema = () => ({
  schema: {
    body: LoginSchema,
    response: {
      200: User
    }
  }
});

const logoutOptions: RouteHandlerSchema = (server) => ({
  preHandler: server.authenticated
});

export const signUp: RouteHandlerFunction = (server) =>
  server.post<SignUpRouteOptionsType>("/signup", signUpOptions(server), async (request, reply) => {
    const hashedPassword = await hashPassword(request.body.password);

    const user = await server.db.models.User.create({ ...request.body, password: hashedPassword, deposit: [] });

    reply.code(201);
    return user;
  });

export const login: RouteHandlerFunction = (server) =>
  server.post<LoginRouteOptionsType>("/login", loginOptions(server), async (request, reply) => {
    const { username, password } = request.body;
    const user = await server.db.models.User.findOne({ username }, {}, {});
    if (!user) {
      throw BadRequest();
    }
    const valid = await comparePassword(password, user.password);

    if (valid) {
      const formattedUser = {
        _id: user._id,
        authenticated: true,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      request.session.user = formattedUser;

      new Promise((resolve, reject) =>
        request.sessionStore.set(request.session.sessionId, request.session, (err) => {
          if (err) {
            reject(err);
          }
          resolve("");
        })
      );

      return user;
    }

    reply.code(400).send("Bad Credentials");
  });

export const logOut: RouteHandlerFunction = (server) =>
  server.post("/logout", logoutOptions(server), async (request, reply) => {
    await new Promise((res, reject) =>
      request.destroySession((err) => {
        if (err) {
          reject(err);
        }
        res("ok");
      })
    );
    reply.code(200).send("Logout complete");
  });

export default [signUp, login, logOut];
