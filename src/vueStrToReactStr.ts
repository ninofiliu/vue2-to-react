import generate from "@babel/generator";
import vueStrToTsxAst from "./vueStrToTsxAst";

export default (vueStr: string): string =>
  generate(vueStrToTsxAst(vueStr)).code;
