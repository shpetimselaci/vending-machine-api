import { Type } from "@sinclair/typebox";

export const Product = Type.Object({
  // for swagger
  _id: Type.String({ format: "uuid" }),
  amountAvailable: Type.Integer({ minimum: 0 }),
  cost: Type.Number({ multipleOf: 5 }),
  productName: Type.String(),
  sellerId: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String()
});

export const Products = Type.Array(Product);

export const CreateProductSchema = Type.Object(
  {
    amountAvailable: Type.Integer({ minimum: 0 }),
    cost: Type.Number({ multipleOf: 5 }),
    productName: Type.String()
  },
  { additionalProperties: false }
);

export const UpdateProductSchema = Type.Object(
  {
    amountAvailable: Type.Optional(Type.Integer({ minimum: 0 })),
    cost: Type.Optional(Type.Number({ multipleOf: 5 })),
    productName: Type.Optional(Type.String())
  },
  { additionalProperties: false }
);

export const GetProduct = Type.Object(
  {
    id: Type.String()
  },
  { additionalProperties: false }
);
