import { resolve } from "path";
import { readFile, readdir } from "fs/promises";
import vueStrToReactAst from "./vueStrToReactAst";
import expectAstsToBeEquivalent from "./expectAstsToBeEquivalent";
import { parse } from "./parser";

it("works on all fixtures", async () => {
  const dir = await readdir(resolve(__dirname, "../fixtures"));

  for (const tsxPath of dir.filter((name) => name.endsWith(".tsx"))) {
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
    const actualAst = vueStrToReactAst(vueStr);
    expectAstsToBeEquivalent(actualAst, tsxAst);
  }
});
