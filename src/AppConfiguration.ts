import { FConfiguration } from "@freemework/common";

export class AppConfiguration {
	private constructor(
		public readonly listenHost: string,
		public readonly listenPort: number,
		public readonly dumpFilePrefix: string,
		public readonly dumpDirectory: string,
	) { }

	public static parse(rawCfg: FConfiguration): AppConfiguration {
		return Object.freeze<AppConfiguration>({
			listenHost: rawCfg.getString("LISTEN_HOST", "0.0.0.0"),
			listenPort: rawCfg.getInteger("LISTER_PORT", 8080),
			dumpDirectory: rawCfg.getString("DUMP_DIRECTORY", ""),
			dumpFilePrefix: rawCfg.getString("DUMP_FILE_PREFIX", ""),
		});
	}
}
