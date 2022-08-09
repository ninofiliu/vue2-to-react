import { AST } from "@typescript-eslint/typescript-estree";

class NotEquivalentError extends Error {
  constructor(reason: string, a: unknown, b: unknown, path: string[]) {
    super(`${reason}: ${JSON.stringify({ path, a, b }, null, 2)}`);
  }
}

const nodeIsUseless = (node: unknown) =>
  node !== null &&
  typeof node === "object" &&
  "type" in node &&
  // @ts-ignore
  node.type === "JSXText" &&
  // @ts-ignore
  node.value.trim() === "";

const rec = (a: unknown, b: unknown, path: string[]): void => {
  if (a === null || typeof a !== "object") {
    if (a !== b) {
      if (
        typeof a === "string" &&
        typeof b === "string" &&
        a.replaceAll(/\s+/g, " ") === a.replaceAll(/\s+/g, " ")
      ) {
        return;
      }
      throw new NotEquivalentError("Primitives are not equal", a, b, path);
    }
    return;
  }
  if (b === null || typeof b !== "object") {
    throw new NotEquivalentError("a is an object but b is not", a, b, path);
  }

  for (const c of [a, b]) {
    if (nodeIsUseless(c)) return;
  }

  if (Array.isArray(a)) {
    if (!Array.isArray(b)) {
      throw new NotEquivalentError("a is an array but b is not", a, b, path);
    }
    const aChildrenToCompare = a.filter((node) => !nodeIsUseless(node));
    const bChildrenToCompare = a.filter((node) => !nodeIsUseless(node));
    if (aChildrenToCompare.length !== bChildrenToCompare.length) {
      throw new NotEquivalentError(
        "a and b do not have the same number of useful children",
        a,
        b,
        path
      );
    }
    for (let i = 0; i < aChildrenToCompare.length; i++) {
      rec(aChildrenToCompare[i], bChildrenToCompare[i], [...path, `${i}`]);
    }
  } else {
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      rec(a[key], b[key], [...path, key]);
    }
  }
};

const expectAstsToBeEquivalent = (
  astA: AST<{ jsx: true }>,
  astB: AST<{ jsx: true }>
) => rec(astA, astB, []);

export default expectAstsToBeEquivalent;
