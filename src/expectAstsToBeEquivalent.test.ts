import { parse } from "@babel/parser";
import expectAstsToBeEquivalent from "./expectAstsToBeEquivalent";

describe("equivalent ASTs", () => {
  it("should not throw any error", () => {
    expectAstsToBeEquivalent(
      parse("<div>hello</div>", { plugins: ["jsx", "typescript"] }),
      parse("<div> hello </div>", { plugins: ["jsx", "typescript"] })
    );
  });
});

describe("different ASTs", () => {
  it("should throw a pretty error with the smallest different JSX code printed out", () => {
    expect(() => {
      expectAstsToBeEquivalent(
        parse(
          `
            const elt = <ul>
              <li>hello</li>
              <li class="light">world</li>
            </ul>
        `,
          { plugins: ["jsx", "typescript"] }
        ),
        parse(
          `
            const elt = <ul>
              <li>hello</li>
              <li class="dark">world</li>
            </ul>
        `,
          { plugins: ["jsx", "typescript"] }
        )
      );
    }).toThrow(
      [
        "ASTs are not equivalent",
        "program > body > 0 > declarations > 0 > init > children > 3 > openingElement > attributes > 0 > value > value",
        '"light"',
        '"dark"',
        "Primitives are not equal",
        `<li class="light">world</li>`,
        `<li class="dark">world</li>`,
      ].join("\n")
    );
  });
});
