import { compile, parseComponent } from "vue-template-compiler";
import computeReactData from "./computeReactData";
import getComponentConfig from "./getComponentConfig";
import { parse } from "./parser";
import templateAstToJsxAst from "./templateAstToJsxAst";

export default (vueStr: string) => {
  const sfcDescriptor = parseComponent(vueStr);
  const templateAst = compile(sfcDescriptor.template?.content || "").ast;
  const scriptContent =
    sfcDescriptor.script?.content || "export default Vue.extend({});";

  const ast = parse(scriptContent);

  // add react import at the top of the file
  ast.program.body.unshift(parse('import React from "react";').program.body[0]);

  // remove Vue import
  ast.program.body = ast.program.body.filter(
    (statement) =>
      !(
        statement.type === "ImportDeclaration" &&
        statement.source.value === "vue"
      )
  );

  const { exportDefaultStatement, componentConfigNode } =
    getComponentConfig(ast);

  const reactData = computeReactData(componentConfigNode);
  if (reactData.length) {
    ast.program.body.unshift(
      parse('import { useState } from "react";').program.body[0]
    );
  }

  exportDefaultStatement.declaration = {
    type: "ArrowFunctionExpression",
    generator: false,
    async: false,
    params: [],
    body: {
      type: "BlockStatement",
      body: [
        // @ts-ignore
        ...reactData,
        // @ts-ignore
        {
          type: "ReturnStatement",
          argument: templateAst
            ? templateAstToJsxAst(templateAst)
            : {
                type: "JSXFragment",
                openingFragment: { type: "JSXOpeningFragment" },
                closingFragment: { type: "JSXClosingFragment" },
                children: [],
              },
        },
      ],
      directives: [],
    },
  };

  return ast;
};
