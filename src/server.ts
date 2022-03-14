import fastify from "fastify";
import cors from "fastify-cors";
import db from "./models/db";
import fastifySession from "@fastify/session";
import MongoStore from "connect-mongo";
import swagger from "fastify-swagger";
import cookie from "fastify-cookie";
import fastifyEnv from "fastify-env";
import { Config } from "config";
import { controllers } from "controllers";
import { addProtectedRouteDecoration } from "shared/auth";

export const startServer = async () => {
  const server = fastify({ logger: true });

  await server.register(fastifyEnv, Config);

  await server.register(cookie);

  await server.register(cors);
  await server.register(db, { uri: server.config.MONGO_DB_URI });

  await server.register(fastifySession, {
    cookieName: "sessionId",
    secret: server.config.SESSION_SECRET,
    cookie: { secure: process.env.NODE_ENV !== "development", httpOnly: true, maxAge: 100000 },
    store: MongoStore.create({ client: server.db.client, collectionName: "sessions" })
  });

  await server.register(addProtectedRouteDecoration);

  await server.register(swagger, { routePrefix: `/swagger`, exposeRoute: true, openapi: {} });

  controllers.forEach((addRoute) => addRoute(server));

  return new Promise((resolve, reject) => {
    server.listen(Number(server.config.PORT), (err, address) => {
      if (err) {
        console.error(err);
        reject(err);
        process.exit(1);
      }
      console.log(`Server listening at ${address}`);
      console.log(server.printRoutes());

      resolve(server);
    });
  });
};
