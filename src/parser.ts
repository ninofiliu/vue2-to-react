import {
  parse as babelParse,
  parseExpression as babelParseExpression,
} from "@babel/parser";

export const parse = (code: string) =>
  babelParse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

export const parseExpression = (code: string) =>
  babelParseExpression(code, {
    plugins: ["jsx", "typescript"],
  });
