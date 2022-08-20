import generate from "@babel/generator";
import { ParseResult } from "@babel/parser";
import { File } from "@babel/types";
import compareAsts from "./compareAsts";

type Node = Parameters<typeof generate>["0"];

const isJsxNode = (x: unknown): x is Node =>
  x !== null &&
  typeof x === "object" &&
  "type" in x &&
  // @ts-ignore
  x.type === "JSXElement";

type RecResult =
  | { equal: true }
  | {
      equal: false;
      a: unknown;
      b: unknown;
      path: string[];
      reason: string;
    };

const get = (obj: unknown, path: string[]): unknown =>
  path.length
    ? obj !== null &&
      typeof obj === "object" &&
      get(obj[path[0] as keyof typeof obj], path.slice(1))
    : obj;

const errMsg = (result: RecResult & { equal: false }) =>
  [
    "ASTs are not equivalent",
    result.path.join(" > "),
    result.a,
    result.b,
    result.reason,
  ].join("\n");
const errMsgWithCode = (
  result: RecResult & { equal: false },
  codeA?: string,
  codeB?: string
) => [errMsg(result), codeA, codeB].join("\n");

export default (astA: ParseResult<File>, astB: ParseResult<File>) => {
  const result = compareAsts(astA, astB, []);
  if (result.equal === true) return;
  const path = [...result.path];

  do {
    let codeA = "";
    let codeB = "";
    const maybeNodeA = get(astA, path);
    const maybeNodeB = get(astB, path);
    if (isJsxNode(maybeNodeA)) {
      try {
        codeA = generate(maybeNodeA).code;
      } catch (e) {}
    }
    if (isJsxNode(maybeNodeB)) {
      try {
        codeB = generate(maybeNodeB).code;
      } catch (e) {}
    }
    if (codeA && codeB) {
      throw new Error(errMsgWithCode(result, codeA, codeB));
    }
    path.pop();
  } while (path.length);
  throw new Error(
    errMsgWithCode(result, generate(astA).code, generate(astB).code)
  );
};
