import { resolve } from "path";
import { readdirSync } from "fs";
import { readFile } from "fs/promises";
import { parse } from "@typescript-eslint/typescript-estree";
import lib from "./lib";

const dir = readdirSync(resolve(__dirname, "../fixtures"));

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
    expect(lib(vueStr)).toEqual(tsxAst);
  });
}
