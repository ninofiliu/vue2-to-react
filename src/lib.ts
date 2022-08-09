import {
  AST,
  AST_NODE_TYPES,
  parse,
} from "@typescript-eslint/typescript-estree";
import { parseComponent } from "vue-template-compiler";
import { ArrowFunctionExpression } from ".pnpm/@typescript-eslint+types@5.32.0/node_modules/@typescript-eslint/types/dist/generated/ast-spec";

const createReactAst = (
  params: ArrowFunctionExpression["params"],
  body: ArrowFunctionExpression["body"]
): AST<{ jsx: true }> => ({
  body: [
    // import React from "react";
    {
      assertions: [],
      importKind: "value",
      // @ts-ignore
      source: {
        raw: '"react"',
        type: AST_NODE_TYPES.Literal,
        value: "react",
      },
      specifiers: [
        {
          // @ts-ignore
          local: { name: "React", type: AST_NODE_TYPES.Identifier },
          type: AST_NODE_TYPES.ImportDefaultSpecifier,
        },
      ],
      type: AST_NODE_TYPES.ImportDeclaration,
    },
    // export default (PARAMS) => BODY
    {
      // @ts-ignore
      declaration: {
        async: false,
        body,
        expression: true,
        generator: false,
        id: null,
        params,
        type: AST_NODE_TYPES.ArrowFunctionExpression,
      },
      exportKind: "value",
      type: AST_NODE_TYPES.ExportDefaultDeclaration,
    },
  ],
  sourceType: "module",
  type: AST_NODE_TYPES.Program,
});

export default (vueStr: string): AST<{ jsx: true }> => {
  const scfDescriptor = parseComponent(vueStr);
  if (!scfDescriptor.template) {
    return createReactAst([], {
      children: [],
      // @ts-ignore
      closingFragment: { type: AST_NODE_TYPES.JSXClosingFragment },
      // @ts-ignore
      openingFragment: { type: AST_NODE_TYPES.JSXOpeningFragment },
      type: AST_NODE_TYPES.JSXFragment,
    });
  }
};
