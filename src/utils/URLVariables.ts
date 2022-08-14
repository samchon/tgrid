/**
 * @packageDocumentation
 * @module tgrid.utils
 */
//----------------------------------------------------------------
import { HashMap } from "tstl/container/HashMap";

import { Dictionary } from "./internal/Dictionary";
import { Primitive } from "../typings/Primitive";

/**
 * URLVariables class is for representing variables of HTTP.
 *
 * The `URLVariables` class allows you to transfer variables between an application and server.
 *
 * When transfering, the `URLVariables` should be converted to a *URI* string through {@link toString}().
 * - URI: Uniform Resource Identifier
 *
 * @reference http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/net/URLVariables.html
 * @author Migrated by Jeongho Nam - https://github.com/samchon
 */
export class URLVariables
    extends Dictionary<string>
    implements Omit<HashMap<string, string>, "toJSON">
{
    /**
     * Default Constructor.
     */
    public constructor();

    /**
     * Construct from a URL-encoded string.
     *
     * The {@link decode decode()} method is automatically called to convert the string to properties of the {@link URLVariables} object.
     *
     * @param str A URL-encoded string containing name/value pairs.
     */
    public constructor(str: string);

    public constructor(str: string = "") {
        super();

        if (str !== "") this._Parse(str);
    }

    /**
     * @hidden
     */
    private _Parse(str: string): void {
        this.clear();
        if (str.trim() === "") return;

        if (str.indexOf("?") !== -1) str = str.substr(str.indexOf("?") + 1);
        if (str.indexOf("#") !== -1) str = str.substr(0, str.indexOf("#"));

        const elements: string[] = str.split("&");
        for (const pair of elements) {
            const equal_index: number = pair.indexOf("=");
            this.emplace(
                equal_index === -1 ? pair : pair.substring(0, equal_index),
                equal_index === -1
                    ? ""
                    : decodeURIComponent(pair.substring(equal_index + 1)),
            );
        }
    }

    /**
     * Returns a string containing all enumerable variables, in the MIME content encoding application/x-www-form-urlencoded.
     */
    public toString(): string {
        const elements: string[] = [];
        for (const it of this)
            if (it.second !== "")
                elements.push(`${it.first}=${encodeURIComponent(it.second)}`);
            else elements.push(it.first);
        return elements.join("&");
    }

    public toJSON(): string {
        return this.toString();
    }
}

export namespace URLVariables {
    export type Iterator = HashMap.Iterator<string, string>;
    export type ReverseIterator = HashMap.ReverseIterator<string, string>;

    export type Serialize<Instance extends object> = {
        [P in keyof Instance]: Primitive<Instance[P]> extends object
            ? never
            : Primitive<Instance[P]>;
    };

    export function parse<T extends object>(
        str: string,
        autoCase: boolean = true,
    ): Serialize<T> {
        const variables: URLVariables = new URLVariables(str);
        const ret: any = {};

        for (const entry of variables) {
            if (!autoCase || entry.second === "") {
                ret[entry.first] = entry.second;
                continue;
            }

            if (entry.second.length === 0) ret[entry.first] = true;
            else if (entry.second === "true" || entry.second === "false")
                ret[entry.first] = entry.second === "true";
            else if (Number.isNaN(Number(entry.second)) === false)
                ret[entry.first] = Number(entry.second);
            else ret[entry.first] = entry.second;
        }
        return ret as Serialize<T>;
    }

    export function stringify<T extends object>(obj: T): string {
        if (typeof obj === "boolean" || typeof obj === "number")
            return String(obj);
        else if (typeof obj === "string") return obj;
        else if (obj instanceof URLVariables) return obj.toString();

        const variables: URLVariables = new URLVariables();
        for (const key in obj) variables.set(key, String(obj[key]));

        return variables.toString();
    }
}
