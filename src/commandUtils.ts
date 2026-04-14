import { ChatInputCommandInteraction } from "discord.js";
import { Client as APClient } from "archipelago.js";
import { CONFIG, Players } from "./config";
import { apClients } from "./archipelago";
import { logWithTime } from "./utils";

export enum Command {
  Hint = "hint",
  HintLocation = "hint_location",
  HintBalance = "hint_balance",
  Status = "status",
  Track = "track",
  RemoveTrack = "remove_track",
  EnableTracker = "enable_tracker",
  DisableTracker = "disable_tracker",
  LatestReceived = "latest_received",
}

export const requireAdmin = async (
  interaction: ChatInputCommandInteraction
): Promise<boolean> => {
  const adminDiscordIds = CONFIG.admins
    .map((slot) => Players[slot])
    .filter(Boolean);

  if (!adminDiscordIds.includes(interaction.user.id)) {
    await interaction.reply({
      content: "Only admins can use this command.",
      ephemeral: true,
    });
    return false;
  }
  return true;
};

export const findApClientsForUser = (
  discordUserId: string,
  botUserId?: string
): APClient[] => {
  const playerNames = Object.entries(Players)
    .filter(([, id]) => id === discordUserId || (!!botUserId && id === botUserId))
    .map(([name]) => name);
  if (playerNames.length === 0) return [];
  return apClients.filter((c) => playerNames.includes(c.name));
};

export const resolveApClient = async (
  interaction: ChatInputCommandInteraction,
  slotName?: string
): Promise<APClient | null> => {
  const ownClients = findApClientsForUser(interaction.user.id);
  const userClients = findApClientsForUser(
    interaction.user.id,
    interaction.client.user?.id
  );

  if (userClients.length === 0) {
    await interaction.reply({
      content: "You are not mapped to any player slot in this session.",
      ephemeral: true,
    });
    return null;
  }

  let apClient: APClient | undefined;
  if (slotName) {
    apClient = userClients.find(
      (c) => c.name.toLowerCase() === slotName.toLowerCase()
    );
    if (!apClient) {
      const available = userClients.map((c) => `\`${c.name}\``).join(", ");
      await interaction.reply({
        content: `No slot named \`${slotName}\` is mapped to you. Your slots: ${available}.`,
        ephemeral: true,
      });
      return null;
    }
  } else if (ownClients.length === 1) {
    apClient = ownClients[0];
  } else if (ownClients.length === 0 && userClients.length === 1) {
    apClient = userClients[0];
  } else {
    const available = ownClients.map((c) => `\`${c.name}\``).join(", ");
    await interaction.reply({
      content: `You are mapped to multiple slots: ${available}. Re-run the command with the \`slot\` option.`,
      ephemeral: true,
    });
    return null;
  }

  if (!apClient.authenticated) {
    await interaction.reply({
      content: "Your Archipelago client is not currently connected. Please wait for reconnection.",
      ephemeral: true,
    });
    return null;
  }

  return apClient;
};

export const requireApClient = async (
  interaction: ChatInputCommandInteraction
): Promise<APClient | null> => resolveApClient(interaction);

export const sendHintCommand = async (
  apClient: APClient,
  interaction: ChatInputCommandInteraction,
  command: string,
  displayName: string
) => {
  const responsePromise = new Promise<string | null>((resolve) => {
    const timeout = setTimeout(() => {
      apClient.messages.off("userCommand", listener);
      resolve(null);
    }, 5000);

    const listener = (text: string) => {
      clearTimeout(timeout);
      apClient.messages.off("userCommand", listener);
      resolve(text);
    };

    apClient.messages.on("userCommand", listener);
  });

  await interaction.deferReply({ ephemeral: true });
  await apClient.messages.say(command);

  const serverResponse = await responsePromise;
  await interaction.editReply({
    content: serverResponse ?? `Hint requested for **${displayName}**.`,
  });
};
