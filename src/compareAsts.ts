const nodeIsUseless = (node: unknown) =>
  node !== null &&
  typeof node === "object" &&
  "type" in node &&
  // @ts-ignore
  node.type === "JSXText" &&
  // @ts-ignore
  node.value.trim() === "";

type RecResult =
  | { equal: true }
  | {
      equal: false;
      a: unknown;
      b: unknown;
      path: string[];
      reason: string;
    };

const compareAsts = (a: unknown, b: unknown, path: string[]): RecResult => {
  if (a === null || typeof a !== "object") {
    if (a !== b) {
      if (
        typeof a === "string" &&
        typeof b === "string" &&
        a.trim().replaceAll(/\s+/g, " ") === b.trim().replaceAll(/\s+/g, " ")
      ) {
        return { equal: true };
      }
      return { equal: false, a, b, path, reason: "Primitives are not equal" };
    }
    return { equal: true };
  }
  if (b === null || typeof b !== "object") {
    return { equal: false, a, b, path, reason: "a is an object but b is not" };
  }

  for (const c of [a, b]) {
    if (nodeIsUseless(c)) return { equal: true };
  }

  if (Array.isArray(a)) {
    if (!Array.isArray(b)) {
      return { equal: false, a, b, path, reason: "a is an array but b is not" };
    }
    const aChildrenToCompare = a.filter((node) => !nodeIsUseless(node));
    const bChildrenToCompare = b.filter((node) => !nodeIsUseless(node));
    if (aChildrenToCompare.length !== bChildrenToCompare.length) {
      return {
        equal: false,
        a,
        b,
        path,
        reason: "a and b do not have the same number of useful children",
      };
    }
    for (let i = 0; i < aChildrenToCompare.length; i++) {
      const childResult = compareAsts(
        aChildrenToCompare[i],
        bChildrenToCompare[i],
        [...path, `${a.indexOf(aChildrenToCompare[i])}`]
      );
      if (!childResult.equal) return childResult;
    }
  } else {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    const ignoredKeys = ["start", "end", "loc", "extra", "id"];
    for (const key of ignoredKeys) {
      keys.delete(key);
    }
    for (const key of keys) {
      const childResult = compareAsts(
        a[key as keyof typeof a],
        b[key as keyof typeof b],
        [...path, key]
      );
      if (!childResult.equal) return childResult;
    }
  }

  return { equal: true };
};

export default compareAsts;
