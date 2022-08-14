import type * as __fs from "fs";
import type * as __ws from "ws";

import { Singleton } from "tstl/thread/Singleton";

export namespace NodeModule {
    export const cp = new Singleton(() => import("child_process"));
    export const fs: Singleton<Promise<typeof __fs>> = new Singleton(
        () => import("fs"),
    );
    export const http = new Singleton(() => import("http"));
    export const https = new Singleton(() => import("https"));
    export const os = new Singleton(() => import("os"));
    export const thread = new Singleton(() => import("worker_threads"));
    export const ws = new Singleton<Promise<typeof __ws>>(() => import("ws"));
}
