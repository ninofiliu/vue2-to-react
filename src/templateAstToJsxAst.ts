import type { JSXElement, JSXExpressionContainer, JSXText } from "@babel/types";
import { ASTNode } from "vue-template-compiler";
import { parseExpression } from "./parser";
import vueAttrToReactAttr from "./vueAttrToReactAttr";

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

export default templateAstToJsxAst;
