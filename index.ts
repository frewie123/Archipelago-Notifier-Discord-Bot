import { Client as APClient } from "archipelago.js";
import {
  Client as DiscordClient,
  GatewayIntentBits,
  TextChannel,
} from "discord.js";
import CONFIG from './config.json';

const Players = CONFIG.players;
const Address = `${CONFIG.host}:${CONFIG.port}`

const discord = new DiscordClient({
  intents: [GatewayIntentBits.Guilds],
});

let channel: TextChannel;
let hintsChannel: TextChannel;
let retryCount = 5;

const ap = new APClient();

const connectArchipelago = async () => {
  ap.messages.on("message", (content: string) => {
    logWithTime(content);
  })

  ap.messages.on("connected", (content: string) => {
    if (!content.includes("Client(0.5.1)")) {
      channel.send(content).catch(console.error);
    }
  });

  ap.messages.on("disconnected", (content: string) => {
    channel.send(content).catch(console.error);
  });

  ap.messages.on("itemSent", (text, item) => {
    let message = "";
    if (item.sender.name === item.receiver.name) {
      var sender = item.sender.name as keyof typeof Players;

      message = `<@${Players[sender]}> found their **${item.name}**! (${item.locationName})`;
    } else {
      var sender = item.sender.name as keyof typeof Players;
      var receiver = item.receiver.name as keyof typeof Players;

      message = `<@${Players[sender]}> just sent <@${Players[receiver]}> their **${item.name}**! (${item.locationName})`;
    }

    channel.send(message).catch(console.error);
  });

  ap.messages.on("itemHinted", async (text, item) => {
      let message = "**HINT:** ";

      if (item.sender.name === item.receiver.name) {
        var sender = item.sender.name as keyof typeof Players;

        message += `<@${Players[sender]}>'s **${item.name}** is in their world at **${item.locationName}**.`;
      } else {
        var sender = item.sender.name as keyof typeof Players;
        var receiver = item.receiver.name as keyof typeof Players;

        message += `<@${Players[receiver]}>'s **${item.name}** is at **${item.locationName}** in <@${Players[sender]}>'s world.`;
      }

      const channelMessages = await hintsChannel.messages.fetch();
      if(channelMessages.hasAny(message))
        return;

      hintsChannel.send(message).catch(console.error);
  })

  login();
}

const login = () => {
  ap.login(Address, CONFIG.slot)
    .then(() => {
      logWithTime("Connected to the Archipelago server!");
      retryCount = 5;
    })
    .catch((err) => {
      console.error(err);
      logWithTime(`Retrying server connection. Retry count: ${retryCount}`);

      if (retryCount > 0) {
        --retryCount;
        login();
      } else {
        logWithTime(
          `Failed to reconnect after retries. Please inspect server or restart script.`
        );
      }
    });
}

discord.once("ready", async () => {
  logWithTime(`Logged in as ${discord.user?.tag}`);

  channel = (await discord.channels.fetch(CONFIG.trackerChannelId)) as TextChannel;
  hintsChannel = (await discord.channels.fetch(CONFIG.hintsChannelId)) as TextChannel;

  connectArchipelago();
});

discord.login(CONFIG.discordToken);

const logWithTime = (message: string) => {
  var currentTime = new Date().toLocaleString();
  console.log(`${currentTime} - ${message}`)
}