import { AST, parse } from "@typescript-eslint/typescript-estree";
import { parseComponent } from "vue-template-compiler";

export default (vueStr: string): AST<{ jsx: true }> => {
  const scfDescriptor = parseComponent(vueStr);
  if (!scfDescriptor.template) {
    return parse(`import React from "react";export default () => <></>;`, {
      jsx: true,
    });
  }
};
