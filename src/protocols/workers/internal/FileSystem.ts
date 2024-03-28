import type fs from "fs";

import { NodeModule } from "../../../utils/internal/NodeModule";

/**
 * @hidden
 */
export namespace FileSystem {
  /* ----------------------------------------------------------------
    ACCESSORS
  ---------------------------------------------------------------- */
  export async function exists(path: string): Promise<boolean> {
    const { exists } = await NodeModule.fs.get();
    return new Promise((resolve) => {
      exists(path, resolve);
    });
  }

  export async function dir(path: string): Promise<string[]> {
    const { readdir } = await NodeModule.fs.get();
    return new Promise((resolve, reject) => {
      readdir(path, (err, ret) => {
        if (err) reject(err);
        else resolve(ret);
      });
    });
  }

  export async function lstat(path: string): Promise<fs.Stats> {
    const { lstat } = await NodeModule.fs.get();
    return new Promise((resolve, reject) => {
      lstat(path, (err, stat) => {
        if (err) reject(err);
        else resolve(stat);
      });
    });
  }

  export function read(path: string): Promise<Buffer>;
  export function read(path: string, encoding: string): Promise<string>;

  export async function read(
    path: string,
    encoding?: string,
  ): Promise<Buffer | string> {
    const { readFile } = await NodeModule.fs.get();
    return new Promise((resolve, reject) => {
      const callback = (
        err: NodeJS.ErrnoException | null,
        ret: Buffer | string,
      ) => {
        if (err) reject(err);
        else resolve(ret);
      };
      if (encoding === undefined) readFile(path, callback);
      else readFile(path, encoding as "utf8", callback);
    });
  }

  /* ----------------------------------------------------------------
    ARCHIVERS
  ---------------------------------------------------------------- */
  export async function mkdir(path: string): Promise<void> {
    if ((await exists(path)) === false) await _Mkdir(path);
  }

  async function _Mkdir(path: string): Promise<void> {
    const { mkdir } = await NodeModule.fs.get();
    return new Promise((resolve, reject) => {
      mkdir(path, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  export async function write(
    path: string,
    content: string | Buffer,
  ): Promise<void> {
    const { writeFile } = await NodeModule.fs.get();
    return new Promise((resolve, reject) => {
      const callback = (err: NodeJS.ErrnoException | null) => {
        if (err) reject(err);
        else resolve();
      };
      if (content instanceof Buffer) writeFile(path, content, callback);
      else writeFile(path, content, "utf8", callback);
    });
  }

  export async function unlink(path: string): Promise<void> {
    const { unlink } = await NodeModule.fs.get();
    return new Promise((resolve, reject) => {
      unlink(path, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
