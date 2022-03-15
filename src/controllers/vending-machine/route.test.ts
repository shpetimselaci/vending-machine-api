import { beforeAll, test, expect, afterAll } from "vitest";
import server, { startServer } from "@/server";
import { IUser, UserRole } from "@/models/user";

beforeAll(async () => {
  await startServer();
});

afterAll(() => server.close());

test("Testing whether the only get endpoint works", async () => {
  const user = { username: String(Math.random()), role: UserRole.BUYER, password: "123456" };
  const signup = await server.inject({
    url: "http://localhost:2000/signup",
    method: "post",
    payload: user
  });

  const parsedUser: IUser = JSON.parse(signup.body);

  expect(signup.statusCode).toBe(201);

  expect(parsedUser.username).toBe(user.username);
  expect(parsedUser.role).toBe(user.role);

  const login = await server.inject({
    url: "http://localhost:2000/login",
    method: "post",
    payload: user
  });

  const cookie = login.headers["set-cookie"];
  expect(cookie).toBeTypeOf("string");

  const me = await server.inject({
    url: "http://localhost:2000/user/me",
    method: "get",
    headers: { cookie }
  });

  expect(me.body).toStrictEqual(login.body);

  expect(JSON.parse(me.body).deposit).toHaveLength(0);

  const userWith5 = await server.inject({
    url: "http://localhost:2000/vending-machine/deposit",
    method: "post",
    headers: { cookie },
    payload: {
      deposit: 5
    }
  });

  expect(JSON.parse(userWith5.body).deposit).toStrictEqual([5]);

  const userWith15 = await server.inject({
    url: "http://localhost:2000/vending-machine/deposit",
    method: "post",
    headers: { cookie },
    payload: {
      deposit: 10
    }
  });
  expect(JSON.parse(userWith15.body).deposit).toStrictEqual([5, 10]);

  const userWith35 = await server.inject({
    url: "http://localhost:2000/vending-machine/deposit",
    method: "post",
    headers: { cookie },
    payload: {
      deposit: 20
    }
  });
  expect(JSON.parse(userWith35.body).deposit).toStrictEqual([5, 10, 20]);

  const userWith85 = await server.inject({
    url: "http://localhost:2000/vending-machine/deposit",
    method: "post",
    headers: { cookie },
    payload: {
      deposit: 50
    }
  });
  expect(JSON.parse(userWith85.body).deposit).toStrictEqual([5, 10, 20, 50]);

  const userWith185 = await server.inject({
    url: "http://localhost:2000/vending-machine/deposit",
    method: "post",
    headers: { cookie },
    payload: {
      deposit: 100
    }
  });

  expect(JSON.parse(userWith185.body).deposit).toStrictEqual([5, 10, 20, 50, 100]);

  const updatedUser = await server.inject({
    url: "http://localhost:2000/user/me",
    method: "get",
    headers: { cookie }
  });

  expect(JSON.parse(updatedUser.body).deposit).toStrictEqual([5, 10, 20, 50, 100]);
});
