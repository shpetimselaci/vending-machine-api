import authControllers from "./auth";
import productControllers from "./product";
import userControllers from "./user";

export const controllers = [...authControllers, ...productControllers, ...userControllers];
