import { Coins } from "@/constants/coins";
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
  deposit: number[];
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
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
      type: [Number],
      enum: Object.values(Coins).filter((value) => isNaN(Number(value)))
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
