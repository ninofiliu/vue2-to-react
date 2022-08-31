import { ObjectExpression } from "@babel/types";
import computeReactData from "./computeReactData";
import { parse, parseExpression } from "./parser";

const removeFields = (obj: unknown, fields: string[]) => {
  if (obj === null || typeof obj !== "object") return;
  for (const key in obj) {
    if (fields.includes(key)) {
      delete obj[key as keyof typeof obj];
    } else {
      removeFields(obj[key as keyof typeof obj], fields);
    }
  }
};

describe("computeReactData", () => {
  it("creates one setState per data entry", () => {
    const ignoredFields = [
      "column",
      "comments",
      "end",
      "errors",
      "extra",
      "index",
      "loc",
      "start",
    ];
    const dataCode = '{ data: { foo: 10, bar: "hello".slice(2) } }';
    const variableDeclarations = computeReactData(
      parseExpression(dataCode) as ObjectExpression
    );
    removeFields(variableDeclarations, ignoredFields);
    const expectedVariableDeclarations = parse(
      'const [foo, setFoo] = useState(10); const [bar, setBar] = useState("hello".slice(2));'
    ).program.body;
    removeFields(expectedVariableDeclarations, ignoredFields);
    expect(variableDeclarations).toEqual(expectedVariableDeclarations);
  });
});
