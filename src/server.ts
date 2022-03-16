import fastify from "fastify";
import cors from "fastify-cors";
import db from "./models/db";
import swagger from "fastify-swagger";
import fastifyEnv from "fastify-env";
import { Config } from "@/config";
import authValidatior from "@/shared/auth";
import roleValidator from "@/shared/roles";
import fastifyJwt from "fastify-jwt";

import { controllers } from "@/controllers";

const server = fastify({ logger: true });

export const startServer = async () => {
  await server.register(fastifyEnv, Config);

  const mongodbURI = process.env.NODE_ENV === "test" ? server.config?.MONGO_DB_TEST_URI : server.config.MONGO_DB_URI;
  await server.register(db, {
    uri: mongodbURI
  });

  await server.register(fastifyJwt, {
    secret: server.config?.JWT_SECRET
  });

  await server.register(cors, {
    origin: true,
    methods: "GET,PUT,POST,DELETE,OPTIONS",

    credentials: true
  });

  await server.register(authValidatior);

  await server.register(roleValidator);
  await server.register(swagger, { routePrefix: `/swagger`, exposeRoute: true, openapi: {} });

  controllers.forEach((addRoute) => addRoute(server));

  const port = process.env.NODE_ENV === "test" ? server.config?.TEST_PORT : server.config?.PORT;
  return new Promise((resolve, reject) => {
    server.listen(Number(port), (err, address) => {
      if (err) {
        console.error(err);
        reject(err);
        process.exit(1);
      }
      console.log(`Server listening at ${address}`);
      if (process.env.NODE_ENV === "development") {
        console.log(server.printRoutes());
      }

      resolve(server);
    });
  });
};

export default server;
