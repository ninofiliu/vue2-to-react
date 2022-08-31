import { ObjectExpression, VariableDeclaration } from "@babel/types";
import getDataNode from "./getDataNode";

export default (
  componentConfigNode: ObjectExpression
): VariableDeclaration[] => {
  const dataNode = getDataNode(componentConfigNode);
  return dataNode.properties.map((prop) => {
    if (prop.type !== "ObjectProperty") {
      throw new Error(
        `Data properties should only be ObjectProperty, found ${prop.type} instead`
      );
    }
    if (prop.key.type !== "Identifier") {
      throw new Error(
        `Data keys should only be identified, found ${prop.key.type} instead`
      );
    }
    const name = prop.key.name;
    const setName = `set${name[0].toUpperCase()}${name.slice(1)}`;

    return {
      type: "VariableDeclaration",
      kind: "const",
      declarations: [
        {
          type: "VariableDeclarator",
          id: {
            type: "ArrayPattern",
            elements: [
              {
                type: "Identifier",
                name: prop.key.name,
              },
              {
                type: "Identifier",
                name: setName,
              },
            ],
          },
          init: {
            type: "CallExpression",
            callee: {
              type: "Identifier",
              name: "useState",
            },
            arguments: [prop.value as any],
          },
        },
      ],
    };
  });
};
