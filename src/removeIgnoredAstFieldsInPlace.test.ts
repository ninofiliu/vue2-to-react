import removeIgnoredAstFieldsInPlace from "./removeIgnoredAstFieldsInPlace";

describe("removeIgnoredAstFieldsInPlace", () => {
  it("removes ignored AST fields in place", () => {
    const obj = { toKeep: 10, loc: 20 };
    removeIgnoredAstFieldsInPlace(obj);
    expect(obj).toEqual({ toKeep: 10 });
  });
});
