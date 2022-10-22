import { FDisposable, FExecutionContext, FExecutionContextLogger, FInitable, FLogger } from "@freemework/common";
import { createWebServer, FLauncherRuntime } from "@freemework/hosting";

import * as fs from "fs";
import * as path from "path";

import { AppConfiguration } from "./AppConfiguration";

export { AppConfiguration } from "./AppConfiguration";

const { name: serviceName, version: serviceVersion } = require("../package.json");

export default async function (executionContext: FExecutionContext, appConfig: AppConfiguration): Promise<FLauncherRuntime> {
	const logger: FLogger = FLogger.Console;

	// Setup root logger
	executionContext = new FExecutionContextLogger(executionContext, logger);

	// Append serviceName and serviceVersion in logger context
	executionContext = new FExecutionContextLogger(executionContext, { "serviceName": serviceName, "serviceVersion": serviceVersion });

	logger.info(`Package: ${serviceName}@${serviceVersion}`);

	const httpServer = createWebServer({
		type: "http",
		name: "Default",
		listenHost: appConfig.listenHost,
		listenPort: appConfig.listenPort
	});

	let fileCounter: number = 0;
	httpServer.rootExpressApplication.use("/", (req, res) => {
		const fileNumber: number = ++fileCounter;
		const fileName: string = appConfig.dumpFilePrefix + fileNumber.toString(10).padStart(8, "0");
		const fullFileName: string = appConfig.dumpDirectory !== ""
			? path.join(appConfig.dumpDirectory, fileName)
			: fileName

		const fileStreamHeaders = fs.createWriteStream(fullFileName + ".head");
		fileStreamHeaders.write(`${req.method.toUpperCase()} ${req.url}\n\n`, "utf8");
		for (let index = 0; index < req.rawHeaders.length; index = index + 2) {
			if (req.rawHeaders.length > index + 1) {
				const headerName = req.rawHeaders[index];
				const headerValue = req.rawHeaders[index + 1];
				fileStreamHeaders.write(`${headerName}: ${headerValue}\n`, "utf8");
			}
		}
		fileStreamHeaders.end();

		const fileStreamBody = fs.createWriteStream(fullFileName + ".body");
		req.pipe(fileStreamBody);
		req.on("close", () => {
			res.writeHead(200);
			res.end();
			logger.info(fullFileName + ".{head,body}");
		});
	});

	await FInitable.initAll(executionContext,
		httpServer,
	);

	const runtime: FLauncherRuntime = Object.freeze({
		async destroy() {
			logger.info("Destroying DI runtime...");

			await FDisposable.disposeAll(
				httpServer,
			);
		}
	});

	return runtime;
}
