import { ParseResult } from "@babel/parser";
import { File } from "@babel/types";

export default (parseResult: ParseResult<File>) => {
  for (const statement of parseResult.program.body) {
    if (statement.type !== "ExportDefaultDeclaration") continue;
    if (
      !(
        statement.declaration.type === "CallExpression" &&
        statement.declaration.callee.type === "MemberExpression" &&
        statement.declaration.callee.object.type === "Identifier" &&
        statement.declaration.callee.object.name === "Vue" &&
        statement.declaration.callee.property.type === "Identifier" &&
        statement.declaration.callee.property.name === "extend" &&
        statement.declaration.arguments.length === 1 &&
        statement.declaration.arguments[0].type === "ObjectExpression"
      )
    ) {
      throw new Error(
        "Vue script default export should be a Vue.extend(object)"
      );
    }
    return {
      exportDefaultStatement: statement,
      componentConfigNode: statement.declaration.arguments[0],
    };
  }
  throw new Error("Vue script should have a default export");
};
