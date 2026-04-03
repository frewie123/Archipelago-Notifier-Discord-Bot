import { ChatInputCommandInteraction } from "discord.js";
import { Client as APClient } from "archipelago.js";
import { Players } from "./config";
import { apClients } from "./archipelago";
import { logWithTime } from "./utils";

export enum Command {
  Hint = "hint",
  HintLocation = "hint_location",
  HintBalance = "hint_balance",
  Status = "status",
}

export const findApClientForUser = (discordUserId: string) => {
  const playerName = Object.entries(Players).find(
    ([, id]) => id === discordUserId
  )?.[0];
  if (!playerName) return undefined;
  return apClients.find((c) => c.name === playerName);
};

export const requireApClient = async (
  interaction: ChatInputCommandInteraction
): Promise<APClient | null> => {
  const apClient = findApClientForUser(interaction.user.id);
  if (!apClient) {
    await interaction.reply({
      content: "You are not mapped to any player slot in this session.",
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
