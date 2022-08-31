import { parseExpression } from "./parser";
import { ObjectExpression } from "@babel/types";
import getDataNode from "./getDataNode";
import removeIgnoredAstFieldsInPlace from "./removeIgnoredAstFieldsInPlace";

const success = (componentConfigCode: string, expectedDataCode: string) => {
  const componentConfigNode = parseExpression(
    componentConfigCode
  ) as ObjectExpression;
  removeIgnoredAstFieldsInPlace(componentConfigNode);
  const expectedDataNode = parseExpression(expectedDataCode);
  removeIgnoredAstFieldsInPlace(expectedDataNode);
  expect(getDataNode(componentConfigNode)).toEqual(expectedDataNode);
};

const error = (code: string, message: string) => {
  expect(() => {
    getDataNode(parseExpression(code) as ObjectExpression);
  }).toThrow(new Error(message));
};

describe("getDataNode", () => {
  describe("success", () => {
    it("handles objects", () => {
      success("{ data: { foo: 10 } }", "{ foo: 10 }");
    });
    it("handles arrow functions returning directly", () => {
      success("{ data: () => ({ foo: 10 }) }", "{ foo: 10 }");
    });
    it("handles arrow functions using return", () => {
      success("{ data: () => { return { foo: 10 } } }", "{ foo: 10 }");
    });
    it("handles function property", () => {
      success("{ data: function() { return { foo: 10 } } }", "{ foo: 10 }");
    });
    it("handles methods", () => {
      success("{ data() { return { foo: 10 } } }", "{ foo: 10 }");
    });
    it("defaults to {}", () => {
      success("{}", "{}");
      success("{ notData: {} }", "{}");
      success("{ notData: () => ({}) }", "{}");
      success("{ notData() {} }", "{}");
    });
  });
  describe("error", () => {
    it("handles data property that is not an object or arrow", () => {
      error(
        "{ data: 10 }",
        "Data should be an ObjectExpression or an ArrowFunctionExpression, found a NumericLiteral instead"
      );
    });
    it("handles data arrow that immediately does not return an object", () => {
      error("{ data: () => 10 }", "Data arrow should return an object");
    });
    it("handles data arrow that does not return anything", () => {
      error("{ data: () => {} }", "Should return something");
    });
    it("handles data arrow that does not return an object", () => {
      error("{ data: () => { return 10; } }", "Should return an object");
    });
    it("handles data function that does not return anything", () => {
      error("{ data: function() {} }", "Should return something");
    });
    it("handles data function that does not return an object", () => {
      error("{ data: function() { return 10; } }", "Should return an object");
    });
    it("handles data method that does not return anything", () => {
      error("{ data() {} }", "Should return something");
    });
    it("handles data method that does not return an object", () => {
      error("{ data() { return 10; } }", "Should return an object");
    });
  });
});
