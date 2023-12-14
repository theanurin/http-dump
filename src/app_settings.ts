import { FConfiguration } from "@freemework/common";

export class AppSettings {
	private constructor(
		public readonly listenHost: string,
		public readonly listenPort: number,
		public readonly dumpFile: null | {
			readonly prefix: string,
			readonly directory: string,
		},
		public readonly dumpStdout: null | {}
	) { }

	public static parse(rawCfg: FConfiguration): AppSettings {
		return Object.freeze<AppSettings>({
			listenHost: rawCfg.get("LISTEN_HOST", "0.0.0.0").asString,
			listenPort: rawCfg.get("LISTEN_PORT", "8080").asPortNumber,
			dumpFile: rawCfg.get("DUMP_FILE", "true").asBoolean ? Object.freeze({
				directory: rawCfg.get("DUMP_FILE_DIRECTORY", "").asString,
				prefix: rawCfg.get("DUMP_FILE_PREFIX", "").asString,
			}) : null,
			dumpStdout: rawCfg.get("DUMP_STDOUT", "true").asBoolean ? Object.freeze({
				// nothing yet
			}) : null
		});
	}
}
