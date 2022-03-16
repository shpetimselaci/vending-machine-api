import { Static } from "@sinclair/typebox";
import { comparePassword, hashPassword } from "@/shared/auth";
import { RouteHandlerFunction, RouteHandlerSchema } from "@/types";
import { BadRequest } from "@/shared/errors";
import { CreateUserSchema, loginResponseSchema, LoginSchema, User } from "./schema";
import hat from "hat";

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
      200: loginResponseSchema
    }
  }
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
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        pepper: hat()
      };

      const token = server.jwt.sign(formattedUser, { expiresIn: "7d" });
      const refreshToken = server.jwt.sign(formattedUser, { expiresIn: "365d" });

      return { user, token, refreshToken };
    }

    reply.code(400).send("Bad Credentials");
  });

export default [signUp, login];
