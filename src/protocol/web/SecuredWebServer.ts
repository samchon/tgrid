import * as https from "https";

import { ServerBase } from "./internal/ServerBase";

export class SecuredWebServer extends ServerBase
{
	public constructor(key: any, cert: any)
	{
		super(https.createServer({ key: key, cert: cert }));
	}
}