import type {
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
import computeReactData from "./computeReactData";
import getComponentConfig from "./getComponentConfig";
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
