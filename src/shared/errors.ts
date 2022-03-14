import createError from "http-errors";

export const Forbidden = (msg?: string) => new createError.Forbidden(msg);

export const UnAuthenticated = (msg?: string) => new createError.Unauthorized(msg);

export const NotFound = (msg?: string) => new createError.NotFound(msg);

export const BadRequest = (msg?: string) => new createError.BadRequest(msg);
