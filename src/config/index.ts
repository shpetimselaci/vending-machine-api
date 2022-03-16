const schema = {
  type: "object",
  required: ["PORT", "MONGO_DB_URI", "JWT_SECRET"],
  properties: {
    PORT: {
      type: "string",
      default: 3000
    },
    MONGO_DB_URI: {
      type: "string"
    },
    MONGO_DB_TEST_URI: {
      type: "string"
    },
    JWT_SECRET: {
      type: "string"
    }
  }
};

export const Config = {
  schema: schema,
  dotenv: true
};

declare module "fastify" {
  interface FastifyInstance {
    config: {
      PORT: string;
      TEST_PORT: string;
      MONGO_DB_URI: string;
      MONGO_DB_TEST_URI: string;
      JWT_SECRET: string;
    };
  }
}
