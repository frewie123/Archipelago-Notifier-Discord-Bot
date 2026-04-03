import { Client as DiscordClient, GatewayIntentBits, TextChannel } from "discord.js";
import { CONFIG, Players } from "./src/config";
import { connectArchipelago, checkConnectionStatus } from "./src/archipelago";
import { registerCommands, handleInteraction } from "./src/commands";
import { logWithTime } from "./src/utils";

const discord = new DiscordClient({
  intents: [GatewayIntentBits.Guilds],
});

discord.once("clientReady", async () => {
  logWithTime(`Logged in as ${discord.user?.tag}`);

  const channel = (await discord.channels.fetch(
    CONFIG.trackerChannelId
  )) as TextChannel;
  const hintsChannel = (await discord.channels.fetch(
    CONFIG.hintsChannelId
  )) as TextChannel;
  const generalChannel = (await discord.channels.fetch(
    CONFIG.generalChannelId
  )) as TextChannel;

  await registerCommands(discord.user!.id);

  const playerSlots = Object.keys(Players);
  playerSlots.forEach((playerSlot) => {
    logWithTime(`${playerSlot}`);
    connectArchipelago(playerSlot, channel, hintsChannel, generalChannel);
  });

  setInterval(() => checkConnectionStatus(channel), 300000);
});

discord.on("interactionCreate", handleInteraction);

discord.login(CONFIG.discordToken);
