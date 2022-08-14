/**
 * @packageDocumentation
 * @module tgrid.protocols
 */
//----------------------------------------------------------------
/**
 * Common interface for server.
 *
 * @template State Type of state
 * @author Jeongho Nam - https://github.com/samchon
 */
export interface IServer<State extends IServer.State> {
    /**
     * Current state of the server.
     */
    readonly state: State;
}
export namespace IServer {
    export const enum State {
        NONE = -1,
        OPENING,
        OPEN,
        CLOSING,
        CLOSED,
    }
}
