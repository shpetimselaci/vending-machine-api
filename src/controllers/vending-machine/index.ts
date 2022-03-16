import { Coins } from "@/constants/coins";
import { BadRequest, Forbidden, NotFound } from "@/shared/errors";
import { RouteHandlerFunction, RouteHandlerSchema } from "@/types";
import { coinChange } from "@/utils/coin-change";
import { Static, Type } from "@sinclair/typebox";
import { User } from "../auth/schema";
import { Product } from "../product/schema";

export const DepositMoneySchema = Type.Object(
  {
    // for swagger
    deposit: Type.Enum(Coins)
  },
  {
    additionalProperties: false,
    description: "Deposit coins that are 5, 10, 20, 50, 100",
    errorMessage: { _: `Vending machine only accepts ${Object.values(Coins).join()} coins! ` }
  }
);
export const BuyProductInVendingMachineSchema = Type.Object(
  {
    // for swagger
    productId: Type.String({ minLength: 12 }),
    amount: Type.Integer({ minimum: 1 })
  },
  {
    additionalProperties: false,
    description: "Buy product with money that you got, product should not exceed the deposits you got."
  }
);

const BuyProductResponse = Type.Object({
  change: Type.Array(Type.Enum(Coins)),
  product: Product,
  amountPurchased: Type.Integer()
});

type DepositRouteOptionsType = { Body: Static<typeof DepositMoneySchema> };
type BuyRouteOptionsType = { Body: Static<typeof BuyProductInVendingMachineSchema> };

const resetDepositSchema: RouteHandlerSchema = (server) => ({
  schema: {
    response: {
      200: User
    }
  },
  preHandler: [server.authenticated, server.buyerOnly]
});

const buyProductsInVendingMachineSchema: RouteHandlerSchema = (server) => ({
  schema: {
    response: {
      200: BuyProductResponse
    },
    body: BuyProductInVendingMachineSchema
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
  server.post<BuyRouteOptionsType>(
    "/vending-machine/buy",
    buyProductsInVendingMachineSchema(server),
    async (request) => {
      const {
        userObj: { _id },
        body: { productId, amount }
      } = request;
      const user = await server.db.models.User.findById(_id);
      const userDeposit = user?.deposit;
      const product = await server.db.models.Product.findById(productId);

      if (!product) {
        throw NotFound(`Product with id: ${productId} not found!`);
      }

      if (!product.amountAvailable) {
        throw Forbidden("There are no products like this left in the vending machine!");
      }

      if (product.amountAvailable < amount) {
        throw Forbidden(`There are only ${product.amountAvailable} of these products you can buy!`);
      }

      const costToBuy = product.cost * amount;

      let userAmount = userDeposit?.reduce((a, b) => a + b, 0) || 0;
      if (costToBuy > userAmount) {
        throw Forbidden(`You need an additional ${costToBuy - userAmount}€ to buy this product`);
      }

      userAmount = userAmount - costToBuy;

      const change = coinChange(userAmount);

      await Promise.all([
        server.db.models.Product.updateOne({ _id: productId }, { $inc: { amountAvailable: -amount } }),
        await server.db.models.User.updateOne({ _id: user?._id }, { $set: { deposit: [] } })
      ]);
      return {
        change,
        product: { ...product?.toJSON(), amountAvailable: product.amountAvailable - amount },
        amountPurchased: amount
      };
    }
  );

export const deposit: RouteHandlerFunction = (server) =>
  server.post<DepositRouteOptionsType>("/vending-machine/deposit", depositMoneySchema(server), async (request) => {
    await server.db.models.User.updateOne({ _id: request.userObj._id }, { $push: { deposit: request.body.deposit } });
    const updatedUser = await server.db.models.User.findById(request.userObj._id);
    return updatedUser;
  });

export const resetDeposit: RouteHandlerFunction = (server) =>
  server.post("/vending-machine/reset", resetDepositSchema(server), async (request) => {
    await server.db.models.User.updateOne({ _id: request.userObj._id }, { $set: { deposit: [] } });

    const updatedUser = await server.db.models.User.findById(request.userObj._id);
    return updatedUser;
  });

export default [buy, deposit, resetDeposit];
