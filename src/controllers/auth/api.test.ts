import { beforeAll, test, expect, afterAll } from "vitest";
import server, { startServer } from "@/server";
import { IUser, UserRole } from "@/models/user";

beforeAll(async () => {
  await startServer();
});

afterAll(() => server.close());

test("Testing whether the only get endpoint works", async () => {
  const user = { username: "user12", role: UserRole.BUYER, password: "123456" };
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
  const { body, statusCode, headers, cookies } = await server.inject({
    url: "http://localhost:2000/logout",
    method: "post",
    payload: user,
    headers: { cookie }
  });

  expect(statusCode).toBe(200);
  expect(body).toStrictEqual("Logout complete");

  expect(headers["set-cookie"]).toBe(undefined);

  expect(cookies).length(0);
});
