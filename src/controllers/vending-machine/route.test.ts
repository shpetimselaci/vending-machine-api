import { beforeAll, test, expect, afterAll } from "vitest";
import server, { startServer } from "@/server";
import { UserRole } from "@/models/user";
import { coinChange } from "@/utils/coin-change";
import { Coins } from "@/constants/coins";
import { IProduct } from "@/models/product";
import { getHeaders, getProfile, logIn, signUp } from "../shared/utils.test";

beforeAll(async () => {
  await startServer();
});

afterAll(() => server.close());

const depositMoney = async (token: string, deposit: Coins) => {
  return server.inject({
    url: "http://localhost:2000/vending-machine/deposit",
    method: "post",
    headers: getHeaders(token),
    payload: {
      deposit
    }
  });
};

const buyProduct = async (token: string, productId: string, amount: number) =>
  server.inject({
    url: "http://localhost:2000/vending-machine/buy",
    method: "post",
    headers: getHeaders(token),
    payload: { productId, amount }
  });

const resetDeposit = async (token: string) =>
  await server.inject({
    url: "http://localhost:2000/vending-machine/reset",
    method: "post",
    headers: getHeaders(token)
  });

const createProduct = async (token: string, product: Omit<IProduct, "_id" | "createdAt" | "updatedAt" | "sellerId">) =>
  server.inject({
    url: "http://localhost:2000/products",
    method: "post",
    headers: getHeaders(token),
    payload: product
  });

test("Test user deposit, reset of deposits", async () => {
  const user = { username: String(Math.random()), role: UserRole.BUYER, password: "123456" };
  await signUp(user);

  const { token, loginBody } = await logIn(user);

  const me = await getProfile(token);
  expect(JSON.parse(me.body)).toStrictEqual(loginBody.user);

  expect(JSON.parse(me.body).deposit).toHaveLength(0);

  const userWith5 = await depositMoney(token, Coins.FIVE);

  expect(JSON.parse(userWith5.body).deposit).toStrictEqual([5]);

  const userWith15 = await await depositMoney(token, Coins.TEN);
  expect(JSON.parse(userWith15.body).deposit).toStrictEqual([5, 10]);

  const userWith35 = await depositMoney(token, Coins.TWENTY);

  expect(JSON.parse(userWith35.body).deposit).toStrictEqual([5, 10, 20]);

  const userWith85 = await depositMoney(token, Coins.FIFTY);

  expect(JSON.parse(userWith85.body).deposit).toStrictEqual([5, 10, 20, 50]);

  const userWith185 = await depositMoney(token, Coins.ONE_HUNDRED);

  expect(JSON.parse(userWith185.body).deposit).toStrictEqual([5, 10, 20, 50, 100]);

  const testOtherCoins = await depositMoney(token, 101);

  expect(testOtherCoins.statusCode).toStrictEqual(400);

  const updatedUser = await getProfile(token);

  expect(JSON.parse(updatedUser.body).deposit).toStrictEqual([5, 10, 20, 50, 100]);

  const userAfterReset = await resetDeposit(token);

  expect(JSON.parse(userAfterReset.body).deposit).toStrictEqual([]);

  const userProfileWithDepositReseted = await getProfile(token);

  expect(coinChange(150)).toStrictEqual([50, 100]);
  expect(coinChange(205)).toStrictEqual([5, 100, 100]);

  expect(JSON.parse(userProfileWithDepositReseted.body).deposit).toStrictEqual([]);
});

test("Purchase product", async () => {
  const buyer = { username: String(Math.random()), role: UserRole.BUYER, password: "123456" };
  const seller = { username: String(Math.random()), role: UserRole.SELLER, password: "123456" };

  await Promise.all([signUp(buyer), signUp(seller)]);

  const [{ token: token }, { token: sellerCookie }] = await Promise.all([logIn(buyer), logIn(seller)]);

  await depositMoney(token, Coins.ONE_HUNDRED);
  const product = { cost: 100, amountAvailable: 1, productName: "First product" };
  const { body } = await createProduct(sellerCookie, product);

  const createdProduct: IProduct = JSON.parse(body);

  expect(createdProduct.cost).toBe(product.cost);
  expect(createdProduct.productName).toBe(product.productName);
  expect(createdProduct.amountAvailable).toBe(product.amountAvailable);

  const myProfile = await getProfile(sellerCookie);
  const sellerProfile = JSON.parse(myProfile.body);

  expect(createdProduct.sellerId).toBe(sellerProfile._id);

  const response = await buyProduct(token, createdProduct._id, 1);

  const { change, product: purchasedProduct, amountPurchased } = JSON.parse(response.body);

  expect(change).toStrictEqual([]);
  expect(purchasedProduct.amountAvailable).toBe(0);
  expect(amountPurchased).toBe(1);
});
