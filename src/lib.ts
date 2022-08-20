import { parse } from "@babel/parser";
import { JSXElement, JSXText } from "@babel/types";
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
  const scfDescriptor = parseComponent(vueStr);
  const ast = parse(`import React from "react";export default () => <></>;`, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  if (!scfDescriptor.template || !scfDescriptor.template.content) {
    return ast;
  }

  const templateAst = compile(scfDescriptor.template.content).ast as ASTNode;
  // @ts-ignore
  ast.program.body[1].declaration.body = templateAstToJsxAst(templateAst!);
  return ast;
};
