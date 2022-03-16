import { IUser, UserRole } from "@/models/user";
import server from "@/server";
import { expect, test } from "vitest";

export const getHeaders = (token: string) => ({ authorization: `Bearer ${token}` });
export const logIn = async (user: { username: string; password: string }) => {
  const response = await server.inject({
    url: "http://localhost:2000/login",
    method: "post",
    payload: user
  });
  const loginBody = JSON.parse(response.body);
  const token = loginBody.token as string;
  expect(token).toBeTypeOf("string");
  return { token, response, loginBody };
};

export const signUp = async (user: { username: string; password: string; role: UserRole }) => {
  const response = await server.inject({
    url: "http://localhost:2000/signup",
    method: "post",
    payload: user
  });

  const parsedUser: IUser = JSON.parse(response.body);

  expect(response.statusCode).toBe(201);

  expect(parsedUser.username).toBe(user.username);

  expect(parsedUser.role).toBe(user.role);
  return { parsedUser, response };
};

export const getProfile = async (token: string) =>
  server.inject({
    url: "http://localhost:2000/user/me",
    method: "get",
    headers: getHeaders(token)
  });

test("test", () => {
  //
});
