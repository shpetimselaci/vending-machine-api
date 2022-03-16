import { beforeAll, test, expect, afterAll } from "vitest";
import server, { startServer } from "@/server";
import { UserRole } from "@/models/user";
import { getProfile, logIn, signUp } from "../shared/utils.test";

beforeAll(async () => {
  await startServer();
});

afterAll(() => server.close());

test("Testing whether the only get endpoint works", async () => {
  const user = { username: String(Math.random()), role: UserRole.BUYER, password: "123456" };
  const { parsedUser, response: signup } = await signUp(user);

  expect(signup.statusCode).toBe(201);

  expect(parsedUser.username).toBe(user.username);
  expect(parsedUser.role).toBe(user.role);

  const { token, loginBody } = await logIn(user);

  const me = await getProfile(token);
  expect(JSON.parse(me.body)).toStrictEqual(loginBody.user);

  const { token: secondLoginToken } = await logIn(user);

  const failedProfileFetch = await server.inject({
    url: "http://localhost:2000/user/delete",
    method: "delete",
    headers: { authorization: `Bearer ${secondLoginToken}` }
  });
  expect(failedProfileFetch.statusCode).toBe(200);
  expect(failedProfileFetch.body).toStrictEqual("User deleted");
  const thirdLoginThatFails = await server.inject({
    url: "http://localhost:2000/login",
    method: "post",
    payload: user
  });
  expect(thirdLoginThatFails.statusCode).toBe(400);
  expect(JSON.parse(thirdLoginThatFails.body).message).toStrictEqual("Bad Request");
});
