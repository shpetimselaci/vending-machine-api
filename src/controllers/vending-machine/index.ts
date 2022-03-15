import { Coins } from "@/constants/coins";
import { RouteHandlerFunction, RouteHandlerSchema } from "@/types";
import { Static, Type } from "@sinclair/typebox";
import { User } from "../auth/schema";

export const DepositMoneySchema = Type.Object(
  {
    // for swagger
    deposit: Type.Enum(Coins)
  },
  { additionalProperties: false, description: "Deposit money required fields" }
);

type DepositRouteOptionsType = { Body: Static<typeof DepositMoneySchema> };

const vendingMachineSchema: RouteHandlerSchema = (server) => ({
  schema: {
    response: {
      200: User
    }
  },
  preHandler: [server.authenticated, server.buyerOnly]
});

const depositMoneySchema: RouteHandlerSchema = (server) => ({
  schema: {
    response: {
      200: User
    },
    body: DepositMoneySchema
  },
  preHandler: [server.authenticated, server.buyerOnly]
});

export const buy: RouteHandlerFunction = (server) =>
  server.post("/vending-machine/buy", vendingMachineSchema(server), async (request) => {
    return request?.session?.user;
  });

export const deposit: RouteHandlerFunction = (server) =>
  server.post<DepositRouteOptionsType>("/vending-machine/deposit", depositMoneySchema(server), async (request) => {
    await server.db.models.User.updateOne(
      { _id: request.session.user._id },
      { $push: { deposit: request.body.deposit } }
    );
    const updatedUser = await server.db.models.User.findById(request.session.user._id);
    return updatedUser;
  });

export const resetDeposit: RouteHandlerFunction = (server) =>
  server.post("/vending-machine/reset", vendingMachineSchema(server), async (request) => {
    await server.db.models.User.updateOne({ _id: request.session.user._id }, { $set: { deposit: [] } });

    const updatedUser = await server.db.models.User.findById(request.session.user._id);
    return updatedUser;
  });

export default [buy, deposit, resetDeposit];
