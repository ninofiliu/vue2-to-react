import parse from "./parse";
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
  const sfcDescriptor = parseComponent(vueStr);
  const tsxAst = parse(`import React from "react";export default () => <></>;`);

  if (!sfcDescriptor.template || !sfcDescriptor.template.content) {
    return tsxAst;
  }

  const templateAst = compile(sfcDescriptor.template.content).ast as ASTNode;
  // @ts-ignore
  tsxAst.program.body[1].declaration.body = templateAstToJsxAst(templateAst!);
  return tsxAst;
};
