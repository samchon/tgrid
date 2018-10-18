import * as http from "http";

import { ServerBase } from "./internal/ServerBase";

export class WebServer extends ServerBase
{
	public constructor()
	{
		super(http.createServer());
	}
}