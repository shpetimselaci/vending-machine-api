import mongoose, { Document, Model } from "mongoose";

import { ModelName } from "@/constants/model-name";
import { UserModel } from "@/models/user";

export interface IProduct {
  _id: string;
  amountAvailable: number;
  cost: number;
  productName: string;
  sellerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TProductModel = Model<IProduct>;

export const ProductSchema = new mongoose.Schema<IProduct>(
  {
    amountAvailable: { type: Number, required: true, default: 0 },
    cost: {
      type: Number,
      required: true,
      validate: {
        validator: function (v: number) {
          return v % 5 === 0;
        },
        message: (props) => `${props.value} is not a valid phone number!`
      }
    },
    productName: { type: String },
    sellerId: {
      type: String,
      ref: UserModel.name
    },
    createdAt: {
      type: Date,
      default: () => new Date()
    },
    updatedAt: {
      type: Date,
      default: () => new Date()
    }
  },
  { timestamps: true }
);

export const ProductModel = mongoose.model(ModelName.PRODUCT, ProductSchema);
