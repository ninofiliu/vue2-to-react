import { parse } from "@babel/parser";
import compareAsts from "./compareAsts";

describe("equivalent ASTs", () => {
  it("strictly equal", () => {
    expect(
      compareAsts(
        parse(`const elt = <div/>`, { plugins: ["jsx", "typescript"] }),
        parse(`const elt = <div/>`, { plugins: ["jsx", "typescript"] }),
        []
      )
    ).toEqual({ equal: true });
  });
  it("differs by whitespace", () => {
    expect(
      compareAsts(
        parse(`const elt = <div>hello</div>`, {
          plugins: ["jsx", "typescript"],
        }),
        parse(
          `const elt = <div>
            hello
          </div>`,
          { plugins: ["jsx", "typescript"] }
        ),
        []
      )
    );
  });
  it("differs by parenthesis", () => {
    expect(
      compareAsts(
        parse(`const elt = <div>hello</div>`, {
          plugins: ["jsx", "typescript"],
        }),
        parse(`const elt = (<div>hello</div>)`, {
          plugins: ["jsx", "typescript"],
        }),
        []
      )
    );
  });
});
describe("different ASTs", () => {
  it("differs by text content", () => {
    expect(
      compareAsts(
        parse("<div>hello</div>", { plugins: ["jsx", "typescript"] }),
        parse("<div>bye</div>", { plugins: ["jsx", "typescript"] }),
        []
      )
    ).toEqual({
      a: "hello",
      b: "bye",
      equal: false,
      path: ["program", "body", "0", "expression", "children", "0", "value"],
      reason: "Primitives are not equal",
    });
  });
  it("differs by tag name", () => {
    expect(
      compareAsts(
        parse("<h1>hello</h1>", { plugins: ["jsx", "typescript"] }),
        parse("<h2>hello</h2>", { plugins: ["jsx", "typescript"] }),
        []
      )
    ).toEqual({
      a: "h1",
      b: "h2",
      equal: false,
      path: [
        "program",
        "body",
        "0",
        "expression",
        "openingElement",
        "name",
        "name",
      ],
      reason: "Primitives are not equal",
    });
  });
  it("differs by attribute", () => {
    expect(
      compareAsts(
        parse(`<div class="hello">world</div>`, {
          plugins: ["jsx", "typescript"],
        }),
        parse(`<div class="bye">world</div>`, {
          plugins: ["jsx", "typescript"],
        }),
        []
      )
    ).toEqual({
      a: "hello",
      b: "bye",
      equal: false,
      path: [
        "program",
        "body",
        "0",
        "expression",
        "openingElement",
        "attributes",
        "0",
        "value",
        "value",
      ],
      reason: "Primitives are not equal",
    });
  });
});
