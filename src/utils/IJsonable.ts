/**
 * Custom serializer for JSON-string.
 * 
 * @typeParam T Custom structure to be serialized
 * @author Jeongho Nam <http://samchon.org>
 */
export interface IJsonable<T>
{
    /**
     * Custom JSON serializer.
     * 
     * When you call `JSON.stringify()` to this object (or some object containg this 
     * object), this object would be serialized not following member variables, but  
     * following the returned value of this method {@link toJSON}().
     * 
     * @return Custom object to be serialized
     */
    toJSON(): T;
}