import vueStrToReactStr from "./vueStrToReactStr";

it("generates react code", () => {
  expect(
    vueStrToReactStr("<template><div>Hello world!</div></template>")
  ).toEqual(
    'import React from "react";\nexport default (() => <div>Hello world!</div>);'
  );
});
