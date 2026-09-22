import path from "path";

const SOURCE_ROOT = path.resolve(process.cwd(), "test");
const COMPILED_ROOT = path.resolve(process.cwd(), "bin", "test");

/**
 * Resolve a test worker from source to the JavaScript emitted by `ttsc`.
 *
 * `ttsx` runs the test entrypoint from `test`, while workers are separate
 * Node processes and therefore still need emitted JavaScript files.
 */
export function resolve_runtime_path(source: string): string {
  const location = path.resolve(source).replace(/\.ts$/, ".js");
  return location.startsWith(SOURCE_ROOT + path.sep)
    ? path.join(COMPILED_ROOT, path.relative(SOURCE_ROOT, location))
    : location;
}
