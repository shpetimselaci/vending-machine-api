import createError from "http-errors";

export const Forbidden = (msg = "Forbidden") => createError(403, msg);

export const UnAuthenticated = (msg = "You are not authenticated") => createError(401, msg);

export const NotFound = (msg = "Not found") => createError(404, msg);

export const BadRequest = (msg = "Bad Request") => createError(400, msg);
