/** 
 * @packageDocumentation
 * @module tgrid.protocols.web
 */
//----------------------------------------------------------------
import { is_node } from "tstl/utility/node";
import type __WebSocket from "ws";

const WebSocket: typeof __WebSocket = is_node() ? require("ws") : null!;
export { WebSocket };