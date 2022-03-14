import { startServer } from "server";

if (process.env.NODE_ENV !== "test") {
  startServer();
}
