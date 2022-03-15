import { beforeAll, test, expect, afterAll } from "vitest";
import server, { startServer } from "@/server";
import { IUser, UserRole } from "@/models/user";
import { coinChange } from "@/utils/coin-change";
import { Coins } from "@/constants/coins";
import { IProduct } from "@/models/product";

beforeAll(async () => {
  await startServer();
});

afterAll(() => server.close());

const logIn = async (user: { username: string; password: string }) => {
  const login = await server.inject({
    url: "http://localhost:2000/login",
    method: "post",
    payload: user
  });

  const cookie = login.headers["set-cookie"] as string;
  expect(cookie).toBeTypeOf("string");
  return [cookie, login.body];
};

const signUp = async (user: { username: string; password: string; role: UserRole }) => {
  const signup = await server.inject({
    url: "http://localhost:2000/signup",
    method: "post",
    payload: user
  });

  const parsedUser: IUser = JSON.parse(signup.body);

  expect(signup.statusCode).toBe(201);

  expect(parsedUser.username).toBe(user.username);

  expect(parsedUser.role).toBe(user.role);
  return parsedUser;
};

const getProfile = async (cookie: string) =>
  server.inject({
    url: "http://localhost:2000/user/me",
    method: "get",
    headers: { cookie }
  });

const depositMoney = async (cookie: string, deposit: Coins) => {
  return server.inject({
    url: "http://localhost:2000/vending-machine/deposit",
    method: "post",
    headers: { cookie },
    payload: {
      deposit
    }
  });
};

const buyProduct = async (cookie: string, productId: string, amount: number) =>
  server.inject({
    url: "http://localhost:2000/vending-machine/buy",
    method: "post",
    headers: { cookie },
    payload: { productId, amount }
  });

const resetDeposit = async (cookie: string) =>
  await server.inject({
    url: "http://localhost:2000/vending-machine/reset",
    method: "post",
    headers: { cookie }
  });

const createProduct = async (cookie: string, product: Omit<IProduct, "_id" | "createdAt" | "updatedAt" | "sellerId">) =>
  server.inject({
    url: "http://localhost:2000/products",
    method: "post",
    headers: { cookie },
    payload: product
  });

test("Test user deposit, reset of deposits", async () => {
  const user = { username: String(Math.random()), role: UserRole.BUYER, password: "123456" };
  await signUp(user);

  const [cookie, loginBody] = await logIn(user);

  const me = await getProfile(cookie);
  expect(me.body).toStrictEqual(loginBody);

  expect(JSON.parse(me.body).deposit).toHaveLength(0);

  const userWith5 = await depositMoney(cookie, Coins.FIVE);

  expect(JSON.parse(userWith5.body).deposit).toStrictEqual([5]);

  const userWith15 = await await depositMoney(cookie, Coins.TEN);
  expect(JSON.parse(userWith15.body).deposit).toStrictEqual([5, 10]);

  const userWith35 = await depositMoney(cookie, Coins.TWENTY);

  expect(JSON.parse(userWith35.body).deposit).toStrictEqual([5, 10, 20]);

  const userWith85 = await depositMoney(cookie, Coins.FIFTY);

  expect(JSON.parse(userWith85.body).deposit).toStrictEqual([5, 10, 20, 50]);

  const userWith185 = await depositMoney(cookie, Coins.ONE_HUNDRED);

  expect(JSON.parse(userWith185.body).deposit).toStrictEqual([5, 10, 20, 50, 100]);

  const testOtherCoins = await depositMoney(cookie, 101);

  expect(testOtherCoins.statusCode).toStrictEqual(400);

  const updatedUser = await getProfile(cookie);

  expect(JSON.parse(updatedUser.body).deposit).toStrictEqual([5, 10, 20, 50, 100]);

  const userAfterReset = await resetDeposit(cookie);

  expect(JSON.parse(userAfterReset.body).deposit).toStrictEqual([]);

  const userProfileWithDepositReseted = await getProfile(cookie);

  expect(coinChange(150)).toStrictEqual([50, 100]);
  expect(coinChange(205)).toStrictEqual([5, 100, 100]);

  expect(JSON.parse(userProfileWithDepositReseted.body).deposit).toStrictEqual([]);
});

test("Purchase product", async () => {
  const buyer = { username: String(Math.random()), role: UserRole.BUYER, password: "123456" };
  const seller = { username: String(Math.random()), role: UserRole.SELLER, password: "123456" };

  await Promise.all([signUp(buyer), signUp(seller)]);

  const [[buyerCookie], [sellerCookie]] = await Promise.all([logIn(buyer), logIn(seller)]);

  await depositMoney(buyerCookie, Coins.ONE_HUNDRED);
  const product = { cost: 100, amountAvailable: 1, productName: "First product" };
  const { body } = await createProduct(sellerCookie, product);

  const createdProduct: IProduct = JSON.parse(body);

  expect(createdProduct.cost).toBe(product.cost);
  expect(createdProduct.productName).toBe(product.productName);
  expect(createdProduct.amountAvailable).toBe(product.amountAvailable);

  const myProfile = await getProfile(sellerCookie);
  const sellerProfile = JSON.parse(myProfile.body);

  expect(createdProduct.sellerId).toBe(sellerProfile._id);

  const response = await buyProduct(buyerCookie, createdProduct._id, 1);

  const { change, product: purchasedProduct, amountPurchased } = JSON.parse(response.body);

  expect(change).toStrictEqual([]);
  expect(purchasedProduct.amountAvailable).toBe(0);
  expect(amountPurchased).toBe(1);
});
