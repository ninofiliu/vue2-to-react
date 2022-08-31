import parse from "./parse";
import { ExportDefaultDeclaration, JSXElement, JSXText } from "@babel/types";
import { ASTNode, compile, parseComponent } from "vue-template-compiler";

const templateAstToJsxAst = (templateAst: ASTNode): JSXElement | JSXText => {
  // html
  if (templateAst.type === 1)
    return {
      type: "JSXElement",
      openingElement: {
        attributes: [],
        name: {
          name: templateAst.tag,
          type: "JSXIdentifier",
        },
        selfClosing: false,
        type: "JSXOpeningElement",
        typeParameters: undefined,
      },
      closingElement: {
        name: {
          name: templateAst.tag,
          type: "JSXIdentifier",
        },
        type: "JSXClosingElement",
      },
      children: templateAst.children.map(templateAstToJsxAst),
    };
  // text
  if (templateAst.type === 3)
    return {
      type: "JSXText",
      value: templateAst.text || "",
    };
  throw new Error(`Unknown type ${templateAst.type}`);
};

export default (vueStr: string) => {
  const sfcDescriptor = parseComponent(vueStr);
  const templateAst = compile(sfcDescriptor.template?.content || "").ast;
  const scriptContent =
    sfcDescriptor.script?.content || "export default Vue.extend({});";

  const ast = parse(scriptContent);

  // add react import at the top of the file
  ast.program.body.unshift(parse('import React from "react";').program.body[0]);

  const exportDefault = ast.program.body.find(
    (node) => node.type == "ExportDefaultDeclaration"
  ) as ExportDefaultDeclaration;
  if (!exportDefault)
    throw new Error("Can not transpile file with no default export");
  exportDefault.declaration = {
    type: "ArrowFunctionExpression",
    generator: false,
    async: false,
    params: [],
    // @ts-ignore
    body: templateAst
      ? templateAstToJsxAst(templateAst)
      : {
          type: "JSXFragment",
          openingFragment: { type: "JSXOpeningFragment" },
          closingFragment: { type: "JSXClosingFragment" },
          children: [],
        },
  };

  return ast;
};
