import { Promisive } from "./Promisive";

/**
 * Driver RFC (Remote Function Call).
 *
 * The `Controller` is an interface who defines provided functions from the remote system.
 * The `Driver` is an object who makes to call remote functions, defined in the
 * `Controller` and provided by `Provider` in the remote system, possible.
 *
 * In other words, calling a functions in the `Driver<Controller>`, it means to call a
 * matched function in the remote system's `Provider` object.
 *
 *   - `Controller`: Definition only
 *   - `Driver`: Remote Function Call
 *
 * @template Controller An interface defining features (functions & objects) provided from the remote system.
 * @template UseParametric Whether to convert type of function parameters to be compatible with their pritimive.
 * @author Jeongho Nam - https://github.com/samchon
 */
export type Driver<
  Controller extends object,
  Parametric extends boolean = false,
> = typeof Driver & Readonly<Promisive<Controller, Parametric>>;
export const Driver = class {};
