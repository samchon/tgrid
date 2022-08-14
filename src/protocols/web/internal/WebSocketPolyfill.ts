/**
 * @packageDocumentation
 * @module tgrid.protocols.web
 */
//----------------------------------------------------------------
import { NodeModule } from "../../../utils/internal/NodeModule";

export async function WebSocketPolyfill() {
    const modulo = await NodeModule.ws.get();
    return modulo.default;
}
