import { Static, Type } from "@sinclair/typebox";
import { PaginationQuery, PaginationQueryType } from "@/shared/pagination";
import { RouteHandlerFunction, RouteHandlerSchema } from "@/types";

const Product = Type.Object({
  // for swagger
  _id: Type.String({ format: "uuid" }),
  amountAvailable: Type.Integer({ minimum: 0 }),
  cost: Type.Number({ minimum: 0 }),
  productName: Type.String(),
  sellerId: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String()
});

const Products = Type.Array(Product);

const CreateProductSchema = Type.Object(
  {
    amountAvailable: Type.Integer({ minimum: 0 }),
    cost: Type.Number({ minimum: 0 }),
    productName: Type.String()
  },
  { additionalProperties: false }
);

const UpdateProductSchema = Type.Object(
  {
    amountAvailable: Type.Optional(Type.Integer({ minimum: 0 })),
    cost: Type.Optional(Type.Number({ minimum: 0 })),
    productName: Type.Optional(Type.String())
  },
  { additionalProperties: false }
);

const GetProduct = Type.Object(
  {
    id: Type.String()
  },
  { additionalProperties: false }
);

type CreateProductRouteOptionsType = { Body: Static<typeof CreateProductSchema> };

type GetProductRouteOptionsType = {
  Params: Static<typeof GetProduct>;
};

type GetProductsRouteOptionsType = {
  Querystring: PaginationQueryType;
};

const getProductsOptions: RouteHandlerSchema = () => ({
  schema: {
    querystring: PaginationQuery,
    response: {
      200: Products
    }
  }
});

const getProductIdOptions: RouteHandlerSchema = (server) => ({
  schema: {
    params: GetProduct,
    response: {
      200: Product
    }
  },
  preHandler: server.authenticated
});

const createProductOptions: RouteHandlerSchema = (server) => ({
  schema: {
    body: CreateProductSchema,
    response: {
      200: Product
    }
  },
  preHandler: server.authenticated
});

const putProductOptions: RouteHandlerSchema = (server) => ({
  schema: {
    body: UpdateProductSchema,
    response: {
      200: Product
    }
  },
  preHandler: server.authenticated
});

export const getProduct: RouteHandlerFunction = (server) =>
  server.get<GetProductRouteOptionsType>("/products/:id", getProductIdOptions(server), async (request, reply) => {
    try {
      const product = await server.db.models.Product.findById(request.params.id);
      if (!product) {
        throw new Error("No Product found");
      }
      return reply.code(200).send(product);
    } catch (error) {
      request.log.error(error);
      return reply.send(500);
    }
  });

export const getProducts: RouteHandlerFunction = (server) =>
  server.get<GetProductsRouteOptionsType>("/products", getProductsOptions(server), async (request, reply) => {
    try {
      const { limit, skip } = request.query;
      const products = await server.db.models.Product.find({}, {}, { limit, skip });
      return products;
    } catch (error) {
      request.log.error(error);
      return reply.send(500);
    }
  });

export const createProduct: RouteHandlerFunction = (server) =>
  server.post<CreateProductRouteOptionsType>("/products", createProductOptions(server), async (request, reply) => {
    try {
      console.log(request.session.user);
      const products = await server.db.models.Product.create({ ...request.body, sellerId: request.session.user._id });
      console.log(products);
      return products;
    } catch (error) {
      console.error(error);
      request.log.error(error);
      return reply.send(500);
    }
  });

export const updateProduct: RouteHandlerFunction = (server) =>
  server.put<CreateProductRouteOptionsType & GetProductRouteOptionsType>(
    "/products/:id",
    putProductOptions(server),
    async (request, reply) => {
      try {
        const products = await server.db.models.Product.findOneAndUpdate({ id: request.params.id }, request.body);
        return products;
      } catch (error) {
        request.log.error(error);
        return reply.send(500);
      }
    }
  );

export const deleteProduct: RouteHandlerFunction = (server) =>
  server.delete<GetProductRouteOptionsType>("/products/:id", createProductOptions(server), async (request, reply) => {
    try {
      const product = await server.db.models.Product.findOneAndDelete({ id: request.params.id });

      if (!product) {
        throw new Error(`No product with id ${request.params.id} found!`);
      }
      return product;
    } catch (error) {
      request.log.error(error);
      return reply.send(500);
    }
  });

export default [deleteProduct, updateProduct, createProduct, getProduct, getProducts];
