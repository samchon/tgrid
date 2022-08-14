/**
 * @packageDocumentation
 * @module tgrid.utils
 */
//----------------------------------------------------------------
import { Vector } from "tstl/container/Vector";
import { XML } from "./XML";

/**
 * List of {@link XML}.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export class XMLList extends Vector<XML> {
    public getTag(): string {
        return this.front().getTag();
    }

    public toString(): string;

    /**
     * @internal
     */
    public toString(level: number): string;

    public toString(level: number = 0): string {
        const lines: string[] = [];
        for (const xml of this) lines.push(xml.toString(level));
        return lines.join("\n");
    }
}

export namespace XMLList {
    export type Iterator = Vector.Iterator<XML>;
    export type ReverseIterator = Vector.ReverseIterator<XML>;
}
