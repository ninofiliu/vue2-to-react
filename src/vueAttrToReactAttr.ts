import type { JSXAttribute } from "@babel/types";
import { ASTElement } from "vue-template-compiler";
import { parseExpression } from "./parser";

export default (vueAttr: ASTElement["attrsList"][number]): JSXAttribute => {
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
