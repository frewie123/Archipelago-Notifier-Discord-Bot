import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

export interface Config {
  host: string;
  port: number;
  discordToken: string;
  guildId: string;
  trackerChannelId: string;
  hintsChannelId: string;
  generalChannelId: string;
  players: Record<string, string>;
  admins: string[];
  serverOwner?: string;
  goalImagesPath?: string;
}

let configPath: string;

const loadConfig = (): Config => {
  const exeDir = dirname(process.execPath);
  const cwd = process.cwd();
  const candidates = [join(exeDir, "config.json"), join(cwd, "config.json")];
  for (const p of candidates) {
    try {
      const raw = readFileSync(p, "utf-8");
      configPath = p;
      return JSON.parse(raw) as Config;
    } catch {
      continue;
    }
  }
  throw new Error(
    `config.json not found. Place it next to the executable or in the current directory. Tried: ${candidates.join(
      ", "
    )}`
  );
};

export const saveConfig = () => {
  writeFileSync(configPath, JSON.stringify(CONFIG, null, 4), "utf-8");
};

export const CONFIG = loadConfig();
export const Players = CONFIG.players;
export const Address = `${CONFIG.host}:${CONFIG.port}`;
