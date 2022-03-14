import { UserRole } from "@/models/user";
import { Type } from "@sinclair/typebox";

export const User = Type.Object(
  {
    // for swagger
    username: Type.String({ minimum: 6 }),
    deposit: Type.Number({ minimum: 0 }),
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
