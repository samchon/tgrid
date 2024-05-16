import { NodeModule } from "../../../utils/internal/NodeModule";

/**
 * @internal
 */
export async function WebSocketPolyfill() {
  const modulo = await NodeModule.ws.get();
  return modulo.default;
}
