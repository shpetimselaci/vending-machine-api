import { Static, Type } from "@sinclair/typebox";

enum Limit {
  TEN = 10,
  TWENTY = 20,
  FIFTY = 50,
  ONE_HUNDRED = 100
}

export const PaginationQuery = Type.Optional(
  Type.Object({
    skip: Type.Optional(Type.Integer({ minimum: 0 })),
    limit: Type.Optional(Type.Enum(Limit))
  })
);

export type PaginationQueryType = Static<typeof PaginationQuery>;
