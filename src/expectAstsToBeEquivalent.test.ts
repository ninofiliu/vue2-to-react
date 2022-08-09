import { parse } from "@typescript-eslint/typescript-estree";
import expectAstsToBeEquivalent from "./expectAstsToBeEquivalent";

const success = (name: string, codeA: string, codeB: string) => {
  it(name, () => {
    expectAstsToBeEquivalent(
      parse(codeA, { jsx: true }),
      parse(codeB, { jsx: true })
    );
  });
};

const codeCompressed = "<ul><li>hello</li><li>world</li></ul>";
const codeExpanded = `
  <ul>
    <li>hello</li>
    <li>world</li>
  </ul>
`;

success("empty", "", "");
success("same code", codeCompressed, codeCompressed);
success("white space", codeCompressed, codeExpanded);
