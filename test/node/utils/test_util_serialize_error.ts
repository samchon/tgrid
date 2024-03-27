import { serializeError } from "tgrid/lib/utils/internal/serializeError";

export async function test_util_serialize_error(): Promise<void> {
  const e: TypeError = new TypeError("something wrong");
  const p: object = JSON.parse(JSON.stringify(serializeError(e)));
  const keys: string[] = Object.keys(p);
  for (const expected of ["name", "message", "stack"])
    if (keys.indexOf(expected) === -1)
      throw new Error(`Error object does not have ${expected}`);
}
