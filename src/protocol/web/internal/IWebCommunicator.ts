import { ICommunicator } from "../../internal/ICommunicator";

/**
 * @hidden
 */
export interface IWebCommunicator extends ICommunicator
{
	/**
	 * Communication error handler.
	 * 
	 * A function called when a communication (protocol) error has been occured. Note that, the error means the protocol level error, not means the logic level error occured by controller or provider.
	 */
	handleError: (error: Error) => void;
}