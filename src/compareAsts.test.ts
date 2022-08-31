import { parse } from "./parser";
import compareAsts from "./compareAsts";

describe("equivalent ASTs", () => {
  it("strictly equal", () => {
    expect(
      compareAsts(parse(`const elt = <div/>`), parse(`const elt = <div/>`), [])
    ).toEqual({ equal: true });
  });
  it("differs by whitespace", () => {
    expect(
      compareAsts(
        parse(`const elt = <div>hello</div>`),
        parse(
          `const elt = <div>
            hello
          </div>`
        ),
        []
      )
    );
  });
  it("differs by parenthesis", () => {
    expect(
      compareAsts(
        parse(`const elt = <div>hello</div>`),
        parse(`const elt = (<div>hello</div>)`),
        []
      )
    );
  });
});
describe("different ASTs", () => {
  it("differs by text content", () => {
    expect(
      compareAsts(parse("<div>hello</div>"), parse("<div>bye</div>"), [])
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
      compareAsts(parse("<h1>hello</h1>"), parse("<h2>hello</h2>"), [])
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
        parse(`<div class="hello">world</div>`),
        parse(`<div class="bye">world</div>`),
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
