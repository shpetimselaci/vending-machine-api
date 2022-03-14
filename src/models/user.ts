import { ModelName } from "@/constants/model-name";
import mongoose, { Model } from "mongoose";

export enum UserRole {
  BUYER = "buyer",
  SELLER = "seller"
}

export interface IUser {
  _id: string;
  username: string;
  password: string;
  deposit: number;
  role: UserRole;
}

export type TUserModel = Model<IUser, unknown, IUser>;

export const User = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    deposit: {
      type: Number,
      default: 0
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const UserModel = mongoose.model(ModelName.USER, User);
