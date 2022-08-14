/**
 * @packageDocumentation
 * @module tgrid.utils
 */
//----------------------------------------------------------------
import { HashMap } from "tstl/container/HashMap";

/**
 * @hidden
 */
export class Dictionary<T> extends HashMap<string, T> {
    /**
     * @inheritDoc
     */
    public toJSON(): any {
        return super.toJSON();
    }
}
