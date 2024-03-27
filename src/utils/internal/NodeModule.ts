import type * as __cp from "child_process";
import type * as __fs from "fs";
import type * as __http from "http";
import type * as __https from "https";
import type * as __os from "os";
import type * as __thread from "worker_threads";
import type * as __ws from "ws";
import type * as __process from "process";

import import2 from "import2";
import { Singleton } from "tstl/thread/Singleton";

export namespace NodeModule {
  export const cp: Singleton<Promise<typeof __cp>> = new Singleton(() =>
    import2("child_process"),
  );
  export const fs: Singleton<Promise<typeof __fs>> = new Singleton(() =>
    import2("fs"),
  );
  export const http: Singleton<Promise<typeof __http>> = new Singleton(() =>
    import2("http"),
  );
  export const https: Singleton<Promise<typeof __https>> = new Singleton(() =>
    import2("https"),
  );
  export const os: Singleton<Promise<typeof __os>> = new Singleton(() =>
    import2("os"),
  );
  export const thread: Singleton<Promise<typeof __thread>> = new Singleton(() =>
    import2("worker_threads"),
  );
  export const ws: Singleton<Promise<typeof __ws>> = new Singleton(
    () => import("ws"),
  );
  export const process = () => __global.process;
}

/**
 * @internal
 */
const __global = global;
