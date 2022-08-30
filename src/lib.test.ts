import { resolve } from "path";
import { readdirSync } from "fs";
import { readFile } from "fs/promises";
import lib from "./lib";
import expectAstsToBeEquivalent from "./expectAstsToBeEquivalent";
import parse from "./parse";

const dir = readdirSync(resolve(__dirname, "../fixtures"));

for (const tsxPath of dir.filter((name) => name.endsWith(".tsx"))) {
  const testName = /^[^\.]*/.exec(tsxPath)![0];
  it(testName, async () => {
    const tsxStr = await readFile(
      resolve(__dirname, "../fixtures", tsxPath),
      "utf8"
    );
    const tsxAst = parse(tsxStr);
    const vuePath = tsxPath.replace(/\.tsx$/, ".vue");
    const vueStr = await readFile(
      resolve(__dirname, "../fixtures", vuePath),
      "utf8"
    );
    const actualAst = lib(vueStr);
    expectAstsToBeEquivalent(actualAst, tsxAst);
  });
}
