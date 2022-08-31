import { ObjectExpression } from "@babel/types";
import computeReactData from "./computeReactData";
import { parse, parseExpression } from "./parser";
import removeIgnoredAstFieldsInPlace from "./removeIgnoredAstFieldsInPlace";

describe("computeReactData", () => {
  it("creates one setState per data entry", () => {
    const dataCode = '{ data: { foo: 10, bar: "hello".slice(2) } }';
    const variableDeclarations = computeReactData(
      parseExpression(dataCode) as ObjectExpression
    );
    removeIgnoredAstFieldsInPlace(variableDeclarations);
    const expectedVariableDeclarations = parse(
      'const [foo, setFoo] = useState(10); const [bar, setBar] = useState("hello".slice(2));'
    ).program.body;
    removeIgnoredAstFieldsInPlace(expectedVariableDeclarations);
    expect(variableDeclarations).toEqual(expectedVariableDeclarations);
  });
});
