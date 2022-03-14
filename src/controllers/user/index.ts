import { RouteShorthandOptions } from "fastify";
import { Static, Type } from "@sinclair/typebox";
import { UserRole } from "@/models/user";
import { RouteHandlerFunction } from "@/types";

const User = Type.Object(
  {
    // for swagger
    username: Type.Integer({ minimum: 0 }),
    deposit: Type.Number({ minimum: 0 }),
    role: Type.Enum(UserRole),
    createdAt: Type.String(),
    updatedAt: Type.String()
  },
  { additionalProperties: false }
);

const GetProduct = Type.Object(
  {
    id: Type.String()
  },
  { additionalProperties: false }
);

type GetProductRouteOptionsType = {
  Params: Static<typeof GetProduct>;
};

const getProductIdOptions: RouteShorthandOptions = {
  schema: {
    params: GetProduct,
    response: {
      200: User
    }
  }
};

export const me: RouteHandlerFunction = (server) =>
  server.get<GetProductRouteOptionsType>("/user/me", getProductIdOptions, async (request, reply) => {
    try {
      return request.session;
    } catch (error) {
      request.log.error(error);
      return reply.send(500);
    }
  });

export default [me];
