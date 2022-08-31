import getComponentConfig from "./getComponentConfig";
import { parse, parseExpression } from "./parser";
import removeIgnoredAstFieldsInPlace from "./removeIgnoredAstFieldsInPlace";

describe("getComponentConfig", () => {
  it("success", () => {
    const actual = getComponentConfig(
      parse(
        [
          'import Vue from "vue"',
          "const x = 20;",
          "export default Vue.extend({ foo: 10 });",
        ].join("\n")
      )
    );
    removeIgnoredAstFieldsInPlace(actual);
    const expected = {
      exportDefaultStatement: parse("export default Vue.extend({ foo: 10 });")
        .program.body[0],
      componentConfigNode: parseExpression("{ foo: 10 }"),
    };
    removeIgnoredAstFieldsInPlace(expected);
    expect(actual).toEqual(expected);
  });
});
