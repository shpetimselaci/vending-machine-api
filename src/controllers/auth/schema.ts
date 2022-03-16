import { Coins } from "@/constants/coins";
import { UserRole } from "@/models/user";
import { Type } from "@sinclair/typebox";

export const User = Type.Object(
  {
    // for swagger
    _id: Type.String({ minimum: 12 }),
    username: Type.String({ minimum: 6 }),
    deposit: Type.Array(Type.Enum(Coins)),
    role: Type.Enum(UserRole),
    createdAt: Type.String(),
    updatedAt: Type.String()
  },
  { additionalProperties: false, description: "User Model" }
);

export const CreateUserSchema = Type.Object(
  {
    username: Type.String({ minLength: 6 }),
    role: Type.Enum(UserRole),
    password: Type.String({ minLength: 6 })
  },
  { additionalProperties: false, description: "Sign up body params needed to create user" }
);

export const LoginSchema = Type.Object(
  {
    username: Type.String({ minimum: 3 }),
    password: Type.String({ minimum: 7 })
  },
  { additionalProperties: false }
);

export const loginResponseSchema = Type.Object({
  user: User,
  token: Type.String()
});
