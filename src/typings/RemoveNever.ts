/** 
 * @packageDocumentation
 * @module tgrid.typings
 */
//----------------------------------------------------------------
import { SpecialFields } from "./SpecialFields";

/**
 * Omit never typed member.
 * 
 * @author Jeongho Nam - https://github.com/samchon
 */
export type RemoveNever<T extends object> = Omit<T, SpecialFields<T, never>>;