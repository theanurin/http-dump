import { FDisposable, FException, FExecutionContext, FInitable, FLogger, FLoggerConsole, FLoggerLabelsExecutionContext, FLoggerLevel } from "@freemework/common";
import { createWebServer, FLauncherRuntime } from "@freemework/hosting";

import * as fs from "fs";
import * as path from "path";
import * as stream from "stream";

import { AppConfiguration } from "./app_configuration";

export { AppConfiguration } from "./app_configuration";

FLogger.setLoggerFactory((loggerName: string) => FLoggerConsole.create(loggerName, FLoggerLevel.DEBUG));

const { name: serviceName, version: serviceVersion } = require("../package.json");

export default async function (executionContext: FExecutionContext, appConfig: AppConfiguration): Promise<FLauncherRuntime> {
	const logger: FLogger = FLogger.create("HTTP Dump");

	// Append serviceName and serviceVersion in logger context
	executionContext = new FLoggerLabelsExecutionContext(executionContext, {
		"serviceName": serviceName,
		"serviceVersion": serviceVersion
	});

	logger.info(executionContext, "Startup...");

	logger.debug(executionContext, "Preparing Web server...");
	const httpServer = createWebServer({
		type: "http",
		name: "Default",
		listenHost: appConfig.listenHost,
		listenPort: appConfig.listenPort
	});

	let fileCounter: number = 0;
	httpServer.rootExpressApplication.use("/", (req, res) => {
		const reqExecutionContext: FExecutionContext = new FLoggerLabelsExecutionContext(executionContext, {
			"method": req.method,
			"path": req.path,
			"ip": req.ip
		});
		const dumpHeaderStreams: Array<[stream.Writable, boolean]> = [];
		const dumpBodyStreams: Array<[stream.Writable, boolean]> = [];
		try {
			let fullFileName: string | null = null;

			if (appConfig.dumpFile !== null) {
				const fileNumber: number = ++fileCounter;
				const fileName: string = appConfig.dumpFile.prefix + fileNumber.toString(10).padStart(8, "0");
				fullFileName = appConfig.dumpFile.directory !== ""
					? path.join(appConfig.dumpFile.directory, fileName)
					: fileName;

				dumpHeaderStreams.push([fs.createWriteStream(fullFileName + ".head"), true]);
				dumpBodyStreams.push([fs.createWriteStream(fullFileName + ".body"), true]);
			}
			if (appConfig.dumpStdout !== null) {
				dumpHeaderStreams.push([process.stdout, false]);
				dumpBodyStreams.push([process.stdout, false]);
			}

			for (const [dumpHeaderStream, _] of dumpHeaderStreams) {
				dumpHeaderStream.write(`${req.method.toUpperCase()} ${req.url} HTTP/${req.httpVersion}\n\n`, "utf8");
				for (let index = 0; index < req.rawHeaders.length; index = index + 2) {
					if (req.rawHeaders.length > index + 1) {
						const headerName = req.rawHeaders[index];
						const headerValue = req.rawHeaders[index + 1];
						dumpHeaderStream.write(`${headerName}: ${headerValue}\n`, "utf8");
					}
				}
				if (dumpHeaderStream === process.stdout) {
					dumpHeaderStream.write("\n");
				}
			}

			for (const [dumpBodyStream, _] of dumpBodyStreams) {
				req.pipe(dumpBodyStream);
			}
			req.on("close", () => {
				res.writeHead(200);
				res.end();

				for (const [dumpHeaderStream, requiredToClose] of dumpHeaderStreams) {
					try {
						if (requiredToClose) {
							dumpHeaderStream.end();
						}
					} catch (e) {
						const ex = FException.wrapIfNeeded(e);
						logger.error(reqExecutionContext, () => `Unable to close dump header stream. ${ex.message}`);
						logger.debug(reqExecutionContext, "Unable to close dump header stream.", ex);
					}
				}
				for (const [dumpBodyStream, requiredToClose] of dumpBodyStreams) {
					if (dumpBodyStream === process.stdout) {
						dumpBodyStream.write("\n\n");
					}
					try {
						if (requiredToClose) {
							dumpBodyStream.end();
						}
					} catch (e) {
						const ex = FException.wrapIfNeeded(e);
						logger.error(reqExecutionContext, () => `Unable to close dump body stream. ${ex.message}`);
						logger.debug(reqExecutionContext, "Unable to close dump header stream.", ex);
					}
				}

				if (fullFileName !== null && logger.isInfoEnabled) {
					logger.info(reqExecutionContext, fullFileName + ".{head,body}");
				}

			});
		} finally {

		}
	});

	await FInitable.initAll(executionContext,
		httpServer,
	);

	const runtime: FLauncherRuntime = Object.freeze({
		async destroy() {
			logger.info(executionContext, "Destroying DI runtime...");

			await FDisposable.disposeAll(
				httpServer,
			);
		}
	});

	return runtime;
}
