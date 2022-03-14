import mongoose from "mongoose";
import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { MongoClient } from "mongodb";

import { TProductModel, ProductModel } from "./product";
import { TUserModel, UserModel } from "./user";

export interface Models {
  Product: TProductModel;
  User: TUserModel;
}

export interface Db {
  models: Models;
  client: MongoClient;
}

declare module "fastify" {
  export interface FastifyInstance {
    db: Db;
  }
}

const connectDB: FastifyPluginAsync<{ uri: string }> = async (fastify: FastifyInstance, opts: FastifyPluginOptions) => {
  mongoose.connection.on("connected", () => {
    fastify.log.info({ actor: "MongoDB" }, "connected");
  });

  mongoose.connection.on("disconnected", () => {
    fastify.log.error({ actor: "MongoDB" }, "disconnected");
  });

  const db = await mongoose.connect(opts.uri, {
    keepAlive: true
  });

  const models: Models = {
    Product: ProductModel,
    User: UserModel
  };

  const client = db.connection.getClient();

  fastify.decorate("db", { models, client } as Db);
};

export default fastifyPlugin(connectDB);
