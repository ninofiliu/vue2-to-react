import { AST, parse } from "@typescript-eslint/typescript-estree";

// TODO
export default (vueStr: string): AST<{ jsx: true }> =>
  parse(
    `import React from "react";

export default () => <></>;
`,
    { jsx: true }
  );
