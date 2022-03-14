import {
  RouteShorthandOptions,
  FastifySchema,
  RawServerBase,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  fastify
} from "fastify";
import { RouteGenericInterface } from "fastify/types/route";

export type RouteOptions<
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
  ContextConfig = unknown,
  SchemaCompiler = FastifySchema
> = RouteShorthandOptions<
  RawServerBase,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  RouteGeneric,
  ContextConfig,
  SchemaCompiler
>;

export type RouteHandlerFunction = (server: ReturnType<typeof fastify>) => void;

export type RouteHandlerSchema = (server: ReturnType<typeof fastify>) => RouteShorthandOptions;
