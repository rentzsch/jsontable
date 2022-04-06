import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

export default [
  {
    input: "src/index.ts",
    output: {
      file: "jsontable.mjs",
    },
    plugins: [typescript({ module: "ES2015", outDir: "./dist" })],
  },
  {
    input: "src/index.ts",
    output: {
      file: "jsontable.d.ts",
    },
    plugins: [dts()],
  },
];
