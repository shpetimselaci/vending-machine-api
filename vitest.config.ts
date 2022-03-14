import { resolve } from "path";
import { defineConfig, AliasOptions } from "vite";
const r = (p: string) => resolve(__dirname, p);

export const alias: AliasOptions = {
  "@": r("./src/")
};
export default defineConfig({
  test: {
    // ...
  },
  resolve: {
    alias
  }
});
