import { useState } from "react";
import React from "react";

export default () => {
  const [foo, setFoo] = useState(10);
  const [bar, setBar] = useState(20);
  return (
    <div>
      <Foo foo={foo} />
      <Bar>{bar}</Bar>
    </div>
  );
};
