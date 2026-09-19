import fs from "fs";

/**
 * @internal
 */
export namespace FileSystem {
  /* ----------------------------------------------------------------
    ACCESSORS
  ---------------------------------------------------------------- */
  export function exists(path: string): Promise<boolean> {
    return new Promise((resolve) => {
      fs.exists(path, resolve);
    });
  }

  export function dir(path: string): Promise<string[]> {
    return fs.promises.readdir(path);
  }

  export function lstat(path: string): Promise<fs.Stats> {
    return fs.promises.lstat(path);
  }

  export function read(path: string): Promise<Buffer>;
  export function read(path: string, encoding: string): Promise<string>;

  export function read(
    path: string,
    encoding?: string,
  ): Promise<Buffer | string> {
    return encoding === undefined
      ? fs.promises.readFile(path)
      : fs.promises.readFile(path, encoding as "utf8");
  }

  /* ----------------------------------------------------------------
    ARCHIVERS
  ---------------------------------------------------------------- */
  export async function mkdir(path: string): Promise<void> {
    if ((await exists(path)) === false) await fs.promises.mkdir(path);
  }

  export function write(path: string, content: string | Buffer): Promise<void> {
    return content instanceof Buffer
      ? fs.promises.writeFile(path, content)
      : fs.promises.writeFile(path, content, "utf8");
  }

  export function unlink(path: string): Promise<void> {
    return fs.promises.unlink(path);
  }
}
