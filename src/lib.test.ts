import { resolve } from "path";
import { readdirSync } from "fs";
import { readFile } from "fs/promises";
import { parse } from "@typescript-eslint/typescript-estree";
import lib from "./lib";

const dir = readdirSync(resolve(__dirname, "../fixtures"));

const expectAstsToBeEquivalent = (
  a: unknown,
  b: unknown,
  path: string[]
): void => {
  if (a === null || typeof a !== "object") {
    if (a !== b) {
      throw new Error(
        `Primitives are not equal: ${JSON.stringify({ path, a, b }, null, 2)}`
      );
    }
    return;
  }
  if (b === null || typeof b !== "object") {
    throw new Error(
      `b should be an object: ${JSON.stringify({ path, a, b }, null, 2)}`
    );
  }
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    expectAstsToBeEquivalent(a[key], b[key], [...path, key]);
  }
};

for (const tsxPath of dir.filter((name) => name.endsWith(".tsx"))) {
  const testName = /^[^\.]*/.exec(tsxPath)[0];
  it(testName, async () => {
    const tsxStr = await readFile(
      resolve(__dirname, "../fixtures", tsxPath),
      "utf8"
    );
    const tsxAst = parse(tsxStr, { jsx: true });
    const vuePath = tsxPath.replace(/\.tsx$/, ".vue");
    const vueStr = await readFile(
      resolve(__dirname, "../fixtures", vuePath),
      "utf8"
    );
    const actualAst = lib(vueStr);
    expectAstsToBeEquivalent(actualAst, tsxAst, []);
  });
}
