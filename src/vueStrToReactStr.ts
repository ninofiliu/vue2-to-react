import generate from "@babel/generator";
import vueStrToReactAst from "./vueStrToReactAst";

export default (vueStr: string): string =>
  generate(vueStrToReactAst(vueStr)).code;
