const path = require("path");
const typescript = require("@rollup/plugin-typescript");
const terser = require("@rollup/plugin-terser");

/**
 * Bundle the ESM entry file for the given platform.
 *
 * The `#platform` alias is resolved by the `paths` of each tsconfig file, so
 * that the same `src/index.ts` produces two different bundles.
 *
 * @param {"node" | "browser"} platform
 */
const build = (platform) => ({
  input: "./src/index.ts",
  output: {
    dir: `lib/${platform}`,
    format: "esm",
    entryFileNames: "[name].mjs",
    sourcemap: true,
  },
  // bare specifiers (tstl, ws, node builtins) are left to the runtime
  external: (id) => id.startsWith(".") === false && path.isAbsolute(id) === false,
  plugins: [
    typescript({
      tsconfig: `tsconfig.${platform}.json`,
      module: "ES2020",
      target: "ES2020",
    }),
    terser({
      format: {
        comments: "some",
        beautify: true,
        ecma: "2020",
      },
      compress: false,
      mangle: false,
      module: true,
    }),
  ],
});

module.exports = [build("node"), build("browser")];
