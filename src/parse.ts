import { parse } from "@babel/parser";

export default (input: string) =>
  parse(input, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });
