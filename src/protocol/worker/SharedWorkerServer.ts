import { SharedWorkerAcceptor } from "./SharedWorkerAcceptor";

export class SharedWorkerServer
{
	public open(callback: (acceptor: SharedWorkerAcceptor) => void): void
	{
		addEventListener("open", (evt: OpenEvent) =>
		{
			let port: MessagePort = evt.ports[evt.ports.length - 1];
			let acceptor = new SharedWorkerAcceptor(port);
			
			callback(acceptor);
		});
	}

	public close(): void
	{
		close();
	}
}

type OpenEvent = Event & {ports: MessagePort[]};