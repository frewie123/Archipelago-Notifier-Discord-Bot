import { Client as APClient } from "archipelago.js";
import { TextChannel } from "discord.js";
import { readdirSync } from "fs";
import { join, extname } from "path";
import { Players, Address, CONFIG } from "./config";
import { logWithTime } from "./utils";

export let apClients: APClient[] = [];
export const onlinePlayers = new Set<string>();
let messageEventsSet = false;
let serverDown = false;

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp"];

const getRandomGoalImage = (): string | null => {
  const imagesPath = CONFIG.goalImagesPath || "./goal_images";
  try {
    const files = readdirSync(imagesPath).filter((file) =>
      IMAGE_EXTENSIONS.includes(extname(file).toLowerCase())
    );
    if (files.length === 0) return null;
    const randomFile = files[Math.floor(Math.random() * files.length)];
    return join(imagesPath, randomFile);
  } catch {
    return null;
  }
};

export const connectArchipelago = async (
  slot: string,
  channel: TextChannel,
  hintsChannel: TextChannel,
  generalChannel: TextChannel
) => {
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

    ap.messages.on("connected", (text, player, tags) => {
      if (!tags.includes("TextOnly")) {
        onlinePlayers.add(player.name);
        logWithTime(`${player.name} is now online.`);
      }
    });

    ap.messages.on("disconnected", (text, player) => {
      onlinePlayers.delete(player.name);
      logWithTime(`${player.name} is now offline.`);
    });

    ap.messages.on("goaled", (text, player) => {
      const playerName = player.name as keyof typeof Players;
      const discordId = Players[playerName];
      const message = `🎉 <@${discordId}> just completed their goal! 🎉\nPrepare for incoming release spam...`;

      logWithTime(message);

      const imagePath = getRandomGoalImage();
      if (imagePath) {
        generalChannel.send({ content: message, files: [imagePath] }).catch(console.error);
      } else {
        generalChannel.send(message).catch(console.error);
      }
    });

    logWithTime("Message events set!");
    messageEventsSet = true;
  }

  ap.messages.on("itemHinted", async (text, item) => {
    var sender = item.sender.name as keyof typeof Players;
    var receiver = item.receiver.name as keyof typeof Players;

    if (item.receiver.name === ap.name) {
      const recieverName = item.receiver.name === item.sender.name ? "their" : `<@${Players[sender]}>'s`;
      const message = `**HINT**: <@${Players[receiver]}>'s **${item.name}** is at **${item.locationName}** in ${recieverName} world.`;

      logWithTime(message);
      hintsChannel.send(message).catch(console.error);
    }
  });

  apClients.push(ap);
  login(slot, ap);
};

export const login = (slot: string, ap: APClient) => {
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

export const checkConnectionStatus = (channel: TextChannel) => {
  if (apClients[0].authenticated) {
    console.log("Connection check successful.");

    if (serverDown) {
      serverDown = false;
      const message = "✅ **The AP server is back up and running!**";
      logWithTime(message);
      channel.send(message).catch(console.error);
    }
  } else {
    console.log("Connection check failed. Going to log all slots back in.");

    if (!serverDown) {
      serverDown = true;
      const ownerDiscordId =
        CONFIG.serverOwner && Players[CONFIG.serverOwner as keyof typeof Players];
      const message = ownerDiscordId
        ? `⚠️ <@${ownerDiscordId}> **The bot failed to connect to the AP server. Please check on it!**`
        : "⚠️ **The bot failed to connect to the AP server. The server may be down.**";
      logWithTime(message);
      channel.send(message).catch(console.error);
    }

    const playerSlots = Object.keys(Players);
    apClients.forEach((client, index) => {
      login(playerSlots[index], client);
    });
  }
};
