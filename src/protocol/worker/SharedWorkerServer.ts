import { SharedWorkerAcceptor } from "./SharedWorkerAcceptor";

export class SharedWorkerServer
{
	public async open(callback: (acceptor: SharedWorkerAcceptor) => void): Promise<void>
	{
		addEventListener("open", (evt: OpenEvent) =>
		{
			let port: MessagePort = evt.ports[evt.ports.length - 1];
			let acceptor = new SharedWorkerAcceptor(port);
			
			callback(acceptor);
		});
	}

	public async close(): Promise<void>
	{
		close();
	}
}

type OpenEvent = Event & {ports: MessagePort[]};