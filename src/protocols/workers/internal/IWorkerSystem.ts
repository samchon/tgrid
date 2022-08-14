/**
 * @packageDocumentation
 * @module tgrid.protocols.workers
 */
//----------------------------------------------------------------
/**
 * Common interface for communicators based on `Worker`.
 *
 * #### Why workers be network systems?
 * `Worker` is designed to support thread in JavaScript. However, the `Worker` cannot share
 * memory variable at all. The only way to interact with `Worker` and its parent is using
 * the `MessagePort` with inter-promised message (IPC, inter-process communication).
 *
 *  - *Worker*, it's a type of *thread* in physical level.
 *  - *Worker*, it's a type of *process* in logical level.
 *  - **Worker**, it's same with **network system** in conceptual level.
 *
 * It seems like network communication, isn't it? That's the reason why TGrid considers
 * `Worker` as a remote system and supports RFC (Remote Function Call) in such worker
 * environments.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export interface IWorkerSystem {
    /**
     * Close connection.
     *
     * Close connection between the remote worker system.
     *
     * It destroies all RFCs (remote function calls) between this and the remote system
     * (through `Driver<Controller>`) that are not returned (completed) yet. The destruction
     * causes all incompleted RFCs to throw exceptions.
     */
    close(): Promise<void>;
}
