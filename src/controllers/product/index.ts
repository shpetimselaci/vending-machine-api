import { Static } from "@sinclair/typebox";
import { PaginationQuery, PaginationQueryType } from "@/shared/pagination";
import { RouteHandlerFunction, RouteHandlerSchema } from "@/types";
import { Forbidden, NotFound } from "@/shared/errors";
import { CreateProductSchema, GetProduct, Products, Product, UpdateProductSchema } from "./schema";

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
  preHandler: [server.authenticated, server.sellerOnly]
});

const putProductOptions: RouteHandlerSchema = (server) => ({
  schema: {
    body: UpdateProductSchema,
    response: {
      200: Product
    }
  },
  preHandler: [server.authenticated, server.sellerOnly]
});

export const getProduct: RouteHandlerFunction = (server) =>
  server.get<GetProductRouteOptionsType>("/products/:id", getProductIdOptions(server), async (request, reply) => {
    const product = await server.db.models.Product.findById(request.params.id);
    if (!product) {
      throw NotFound("No product found with id: ${request.params.id}`");
    }
    return reply.code(200).send(product);
  });

export const getProducts: RouteHandlerFunction = (server) =>
  server.get<GetProductsRouteOptionsType>("/products", getProductsOptions(server), async (request, reply) => {
    const { limit, skip } = request.query;
    const products = await server.db.models.Product.find({}, {}, { limit, skip });
    return products;
  });

export const createProduct: RouteHandlerFunction = (server) =>
  server.post<CreateProductRouteOptionsType>("/products", createProductOptions(server), async (request, reply) => {
    const products = await server.db.models.Product.create({ ...request.body, sellerId: request.session.user._id });
    return products;
  });

export const updateProduct: RouteHandlerFunction = (server) =>
  server.put<CreateProductRouteOptionsType & GetProductRouteOptionsType>(
    "/products/:id",
    putProductOptions(server),
    async (request, reply) => {
      const product = await server.db.models.Product.findOne({ id: request.params.id });

      if (!product) {
        throw NotFound(`No product found with id: ${request.params.id}`);
      }

      const updatedProduct = await server.db.models.Product?.updateOne({ _id: request.params.id }, request.body);
      console.log(updatedProduct);
      return server.db.models.Product.findOne({ id: request.params.id });
    }
  );

export const deleteProduct: RouteHandlerFunction = (server) =>
  server.delete<GetProductRouteOptionsType>("/products/:id", createProductOptions(server), async (request, reply) => {
    const product = await server.db.models.Product.findOne({ _id: request.params.id });

    if (!product) {
      throw NotFound(`No product with id ${request.params.id} found!`);
    }

    if (product.sellerId !== request.session.user._id) {
      throw Forbidden("You are not allowed to delete this product");
    }

    await server.db.models.Product.deleteOne({ _id: product.id });
    return product;
  });

export default [deleteProduct, updateProduct, createProduct, getProduct, getProducts];
