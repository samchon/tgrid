import include from "import2";
import type * as __cp from "child_process";
import type * as __fs from "fs";
import type * as __http from "http";
import type * as __https from "https";
import type * as __os from "os";
import type * as __thread from "worker_threads";
import type * as __ws from "ws";

import { Singleton } from "tstl/thread/Singleton";

export namespace NodeModule {
    export const cp: Singleton<Promise<typeof __cp>> = new Singleton(() =>
        include("child_process"),
    );
    export const fs: Singleton<Promise<typeof __fs>> = new Singleton(() =>
        include("fs"),
    );
    export const http: Singleton<Promise<typeof __http>> = new Singleton(() =>
        include("http"),
    );
    export const https: Singleton<Promise<typeof __https>> = new Singleton(() =>
        include("https"),
    );
    export const os: Singleton<Promise<typeof __os>> = new Singleton(() =>
        include("os"),
    );
    export const thread: Singleton<Promise<typeof __thread>> = new Singleton(
        () => include("worker_threads"),
    );
    export const ws: Singleton<Promise<typeof __ws>> = new Singleton(() =>
        include("ws"),
    );
}
