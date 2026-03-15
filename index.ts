import { readFileSync } from "fs";
import { dirname, join } from "path";
import { Client as APClient, Item } from "archipelago.js";
import {
  Client as DiscordClient,
  GatewayIntentBits,
  TextChannel,
} from "discord.js";

interface Config {
  host: string;
  port: number;
  discordToken: string;
  trackerChannelId: string;
  hintsChannelId: string;
  players: Record<string, string>;
}

const loadConfig = (): Config => {
  const exeDir = dirname(process.execPath);
  const cwd = process.cwd();
  const candidates = [join(exeDir, "config.json"), join(cwd, "config.json")];
  for (const p of candidates) {
    try {
      const raw = readFileSync(p, "utf-8");
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

const CONFIG = loadConfig();

const Players = CONFIG.players;
const Address = `${CONFIG.host}:${CONFIG.port}`;

const discord = new DiscordClient({
  intents: [GatewayIntentBits.Guilds],
});

let channel: TextChannel;
let hintsChannel: TextChannel;
let messageEventsSet = false;

let apClients: APClient[] = [];

const connectArchipelago = async (slot: string) => {
  const ap = new APClient();

  if (!messageEventsSet) {
    ap.messages.on("message", (content: string) => {
      logWithTime(content);
    });

    ap.messages.on("itemSent", async (text, item) => {
      let message = item.progression ? "‼️**PROGRESSION**‼️ : " : "";
      var sender = item.sender.name as keyof typeof Players;

      if (item.sender.name === item.receiver.name) {
        message += `<@${Players[sender]}> found their **${item.name}**! (${item.locationName})`;
      } else {
        var receiver = item.receiver.name as keyof typeof Players;
        message += `<@${Players[sender]}> just sent <@${Players[receiver]}> their **${item.name}**! (${item.locationName})`;
      }

      logWithTime(message);
      channel.send(message).catch(console.error);
    });

    logWithTime("Message events set!");
    messageEventsSet = true;
  }

  ap.messages.on("itemHinted", async (text, item) => {
    var sender = item.sender.name as keyof typeof Players;
    var receiver = item.receiver.name as keyof typeof Players;

    if (item.receiver.name === ap.name) {
      const recieverName = item.receiver.name === item.sender.name ? "their" : `<@${Players[sender]}>'s`;
      const message = `**HINT**: <@${Players[receiver]}>'s **${item.name}** is at ${item.locationName} in ${recieverName} world.`;

      logWithTime(message);
      hintsChannel.send(message).catch(console.error);
    }
  });

  apClients.push(ap);
  login(slot, ap);
};

const login = (slot: string, ap: APClient) => {
  ap.login(Address, slot)
    .then(() => {
      logWithTime(`Connected ${slot} to the Archipelago server!`);
    })
    .catch((err) => {
      console.error(err);
      logWithTime(
        `Failed to connect. Please inspect server or restart script.`
      );
    });
};

discord.once("clientReady", async () => {
  logWithTime(`Logged in as ${discord.user?.tag}`);

  channel = (await discord.channels.fetch(
    CONFIG.trackerChannelId
  )) as TextChannel;
  hintsChannel = (await discord.channels.fetch(
    CONFIG.hintsChannelId
  )) as TextChannel;

  const playerSlots = Object.keys(Players);

  playerSlots.forEach((playerSlot) => {
    logWithTime(`${playerSlot}`);
    connectArchipelago(playerSlot);
  });

  setInterval(checkConnectionStatus, 300000);
});

discord.login(CONFIG.discordToken);

const checkConnectionStatus = () => {
  if (apClients[0].authenticated) {
    console.log("Connection check successful.");
  } else {
    console.log("Connection check failed. Going to log all slots back in.");

    const playerSlots = Object.keys(Players);
    apClients.forEach((client, index) => {
      login(playerSlots[index], client);
    });
  }
};

const logWithTime = (message: string) => {
  var currentTime = new Date().toLocaleString();
  console.log(`${currentTime} - ${message}`);
};
