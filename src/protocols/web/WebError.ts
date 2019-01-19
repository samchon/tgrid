//================================================================ 
/** @module tgrid.protocols.web */
//================================================================
import { SystemError } from "tstl/exception/SystemError";

import { ErrorCategory } from "tstl/exception/ErrorCategory";
import { TreeMap } from "tstl/container/TreeMap";

/**
 * Web Socket Error.
 * 
 * @reference https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
 * @author Jeongho Nam <samchon@samchon.org>
 */
export class WebError extends SystemError
{
    /**
     * Initializer Constructor.
     * 
     * @param code Closing code.
     * @param reason Reason why.
     */
    public constructor(code: number, reason: string)
    {
        super(code, new WebError.Category(), reason);
    }

    /**
     * @inheritDoc
     */
    public get name(): string
    {
        return "web_error";
    }
}

export namespace WebError
{
    /**
     * Category of Web Socket Error.
     */
    export class Category extends ErrorCategory
    {
        /**
         * @inheritDoc
         */
        public name(): string
        {
            return "web";
        }

        /**
         * @inheritDoc
         */
        public message(val: number): string
        {
            let it = DESCRIPTIONS.upper_bound(val).prev();
            return it.second;
        }
    }
}

/**
 * @hidden
 */
const DESCRIPTIONS = new TreeMap<number, string>
([
    // HTTP PROTOCOL
    {first: 0, second: "Reserved and not used."},

    // WEB-SOCKET PROTOCOL
    {first: 1000, second: "Normal closure; the connection successfully completed whatever purpose for which it was created."},
    {first: 1001, second: "The endpoint is going away, either because of a server failure or because the browser is navigating away from the page that opened the connectio"},
    {first: 1002, second: "The endpoint is terminating the connection due to a protocol error."},
    {first: 1003, second: "The connection is being terminated because the endpoint received data of a type it cannot accept (for example, a text-only endpoint received binary data)."},
    {first: 1004, second: "Reserved. A meaning might be defined in the future."},
    {first: 1005, second: "Indicates that no status code was provided even though one was expected."},
    {first: 1006, second: "Used to indicate that a connection was closed abnormally (that is, with no close frame being sent) when a status code is expected."},
    {first: 1007, second: "The endpoint is terminating the connection because a message was received that contained inconsistent data (e.g., non-UTF-8 data within a text message)."},
    {first: 1008, second: "The endpoint is terminating the connection because it received a message that violates its policy. This is a generic status code, used when codes 1003 and 1009 are not suitable."},
    {first: 1009, second: "The endpoint is terminating the connection because a data frame was received that is too large."},
    {first: 1010, second: "The client is terminating the connection because it expected the server to negotiate one or more extension, but the server didn't."},
    {first: 1011, second: "The server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request."},
    {first: 1012, second: "The server is terminating the connection because it is restarting."},
    {first: 1013, second: "The server is terminating the connection due to a temporary condition, e.g. it is overloaded and is casting off some of its clients."},
    {first: 1014, second: "The server was acting as a gateway or proxy and received an invalid response from the upstream server. This is similar to 502 HTTP Status Code."},
    {first: 1015, second: "Indicates that the connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified)."},
    {first: 1016, second: "Reserved for future use by the WebSocket standard."},
    {first: 2000, second: "Reserved for use by WebSocket extensions."},
    {first: 3000, second: "Available for use by libraries and frameworks. May not be used by applications. Available for registration at the IANA via first-come, first-serve."},
    {first: 4000, second: "Available for use by applications."},
]);