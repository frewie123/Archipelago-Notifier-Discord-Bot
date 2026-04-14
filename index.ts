import { Client as DiscordClient, GatewayIntentBits, TextChannel } from "discord.js";
import { CONFIG } from "./src/config";
import { setChannels, checkConnectionStatus } from "./src/archipelago";
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

  setChannels(channel, hintsChannel, generalChannel);
  logWithTime("Bot started in disabled mode. Use /enable-tracker to connect.");

  setInterval(() => checkConnectionStatus(channel), 300000);
});

discord.on("interactionCreate", handleInteraction);

discord.login(CONFIG.discordToken);
