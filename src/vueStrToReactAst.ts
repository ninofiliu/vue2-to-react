import type {
  ExportDefaultDeclaration,
  JSXAttribute,
  JSXElement,
  JSXExpressionContainer,
  JSXText,
} from "@babel/types";
import {
  ASTElement,
  ASTNode,
  compile,
  parseComponent,
} from "vue-template-compiler";
import { parse, parseExpression } from "./parser";

const vueAttrToReactAttr = (
  vueAttr: ASTElement["attrsList"][number]
): JSXAttribute => {
  if (vueAttr.name.startsWith(":")) {
    const name = vueAttr.name.slice(1);
    return {
      type: "JSXAttribute",
      name: { type: "JSXIdentifier", name },
      value: {
        type: "JSXExpressionContainer",
        expression: parseExpression(vueAttr.value),
      },
    };
  } else {
    return {
      type: "JSXAttribute",
      name: { type: "JSXIdentifier", name: vueAttr.name },
      value: { type: "StringLiteral", value: vueAttr.value },
    };
  }
};

const templateAstToJsxAst = (
  templateAst: ASTNode
): JSXElement | JSXText | JSXExpressionContainer => {
  switch (templateAst.type) {
    case 1: {
      // html
      return {
        type: "JSXElement",
        openingElement: {
          attributes: templateAst.attrsList.map(vueAttrToReactAttr),
          name: { name: templateAst.tag, type: "JSXIdentifier" },
          selfClosing: false,
          type: "JSXOpeningElement",
          typeParameters: undefined,
        },
        closingElement: {
          name: { name: templateAst.tag, type: "JSXIdentifier" },
          type: "JSXClosingElement",
        },
        children: templateAst.children.map(templateAstToJsxAst),
      };
    }
    case 2: {
      // moustache
      // '{{ foo }}' -> 'foo'
      const expressionStr = templateAst.text.slice(0, -2).slice(2);
      return {
        type: "JSXExpressionContainer",
        expression: parseExpression(expressionStr),
      };
    }
    case 3: {
      // text
      return {
        type: "JSXText",
        value: templateAst.text || "",
      };
    }
  }
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
