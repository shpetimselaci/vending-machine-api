const schema = {
  type: "object",
  required: ["PORT", "MONGO_DB_URI", "SESSION_SECRET"],
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
    SESSION_SECRET: {
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
      MONGO_DB_URI: string;
      MONGO_DB_TEST_URI: string;
      SESSION_SECRET: string;
    };
  }
}
