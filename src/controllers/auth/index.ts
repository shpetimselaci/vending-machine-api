import { Static, Type } from "@sinclair/typebox";
import { UserRole } from "@/models/user";
import { comparePassword, hashPassword } from "@/shared/auth";
import { RouteHandlerFunction, RouteHandlerSchema } from "@/types";
import { BadRequest } from "@/shared/errors";

const User = Type.Object(
  {
    // for swagger
    username: Type.String({ minimum: 6 }),
    deposit: Type.Number({ minimum: 0 }),
    role: Type.Enum(UserRole),
    createdAt: Type.String(),
    updatedAt: Type.String()
  },
  { additionalProperties: false, description: "User Model" }
);
const CreateUserSchema = Type.Object(
  {
    username: Type.String({ minLength: 6 }),
    role: Type.Enum(UserRole),
    password: Type.String({ minLength: 6 })
  },
  { additionalProperties: false, description: "Sign up body params needed to create user" }
);

const LoginSchema = Type.Object(
  {
    username: Type.String({ minimum: 3 }),
    password: Type.String({ minimum: 7 })
  },
  { additionalProperties: false }
);

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
    console.log("BODY", request.body);
    const hashedPassword = await hashPassword(request.body.password);

    const user = await server.db.models.User.create({ ...request.body, password: hashedPassword });

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
        deposit: user.deposit
      };
      new Promise((resolve, reject) =>
        request.sessionStore.set(user.username, request.session, (err) => {
          if (err) {
            reject(err);
          }
          resolve("");
        })
      );

      request.session.user = formattedUser;

      return user;
    }

    reply.code(400).send("Bad Credentials");
  });

export const logOut: RouteHandlerFunction = (server) =>
  server.post("/logout", logoutOptions(server), async (request, reply) => {
    if (!request.session?.user?.authenticated) {
      throw BadRequest("You have to be logged in to log out!");
    }
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
