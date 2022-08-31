import vueStrToReactStr from "./vueStrToReactStr";

const vueCode = `
<template>
  <div>
    Hello world!
  </div>
</template>
`;

const reactCode = `import React from "react";
export default (() => {
  return <div>
  Hello world!
  </div>;
});`;

it("generates react code", () => {
  expect(vueStrToReactStr(vueCode)).toEqual(reactCode);
});
