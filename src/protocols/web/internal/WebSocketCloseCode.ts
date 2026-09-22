/**
 * The close code used for a successful WebSocket shutdown.
 *
 * @see https://www.rfc-editor.org/rfc/rfc6455#section-7.4.1
 */
export const NORMAL_CLOSURE: number = 1000;

/**
 * The close code used when an endpoint is shutting down.
 *
 * @see https://www.rfc-editor.org/rfc/rfc6455#section-7.4.1
 */
export const GOING_AWAY: number = 1001;
