import { AST, AST_NODE_TYPES } from "@typescript-eslint/typescript-estree";
import { ASTElement, compile, parseComponent } from "vue-template-compiler";
// HACK
import { ArrowFunctionExpression } from ".pnpm/@typescript-eslint+types@5.32.0/node_modules/@typescript-eslint/types/dist/generated/ast-spec";
import { JsxElement } from "typescript";

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

const templateAstToJsxAst = (templateAst: ASTElement): any => {
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
      type: AST_NODE_TYPES.JSXText,
      value: templateAst.text,
      raw: templateAst.text,
    };
};

export default (vueStr: string): AST<{ jsx: true }> => {
  const scfDescriptor = parseComponent(vueStr);

  if (!scfDescriptor.template || !scfDescriptor.template.content) {
    return createReactAst([], {
      children: [],
      // @ts-ignore
      closingFragment: { type: AST_NODE_TYPES.JSXClosingFragment },
      // @ts-ignore
      openingFragment: { type: AST_NODE_TYPES.JSXOpeningFragment },
      type: AST_NODE_TYPES.JSXFragment,
    });
  }

  const templateAst = compile(scfDescriptor.template.content).ast;
  return createReactAst([], templateAstToJsxAst(templateAst));
};
