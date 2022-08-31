import type { BlockStatement, ObjectExpression } from "@babel/types";

const getReturnedObject = (
  blockStatement: BlockStatement
): ObjectExpression => {
  for (const statement of blockStatement.body) {
    if (statement.type === "ReturnStatement") {
      const { argument } = statement;
      if (argument && argument.type === "ObjectExpression") {
        return argument;
      }
      throw new Error("Should return an object");
    }
  }
  throw new Error("Should return something");
};

export default (componentConfigNode: ObjectExpression): ObjectExpression => {
  for (const prop of componentConfigNode.properties) {
    if (prop.type === "SpreadElement") continue;
    if (prop.type === "ObjectProperty") {
      if (prop.key.type !== "Identifier") continue;
      if (prop.key.name !== "data") continue;
      // found { data: ... }
      if (prop.value.type === "ObjectExpression") {
        // found { data: { ... } }
        return prop.value;
      }
      if (prop.value.type === "ArrowFunctionExpression") {
        // found { data: () => ... }
        if (prop.value.body.type === "ObjectExpression") {
          // found { data: () => ({ ... }) }
          return prop.value.body;
        }
        if (prop.value.body.type === "BlockStatement") {
          // found { data: () => { ... } }
          return getReturnedObject(prop.value.body);
        }
        throw new Error("Data arrow should return an object");
      }
      if (prop.value.type === "FunctionExpression") {
        // found { data: function() { ... } }
        return getReturnedObject(prop.value.body);
      }
      throw new Error(
        `Data should be an ObjectExpression or an ArrowFunctionExpression, found a ${prop.value.type} instead`
      );
    }
    if (prop.type === "ObjectMethod") {
      if (prop.key.type !== "Identifier") continue;
      if (prop.key.name !== "data") continue;
      // found { data() { ... } }
      return getReturnedObject(prop.body);
    }
  }
  // returning {}
  return { type: "ObjectExpression", properties: [] };
};
