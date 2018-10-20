import { Invoke } from "./Invoke";

export interface IProtocol
{
	sendData(invoke: Invoke): void;
	replyData(invoke: Invoke): void;
}