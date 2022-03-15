import authControllers from "./auth";
import productControllers from "./product";
import userControllers from "./user";
import vendingMachineControllers from "./vending-machine";

export const controllers = [
  ...authControllers,
  ...productControllers,
  ...userControllers,
  ...vendingMachineControllers
];
