import { Interaction, REST, Routes } from "discord.js";
import { CONFIG } from "./config";
import { logWithTime } from "./utils";
import { Command } from "./commandUtils";
import { hintDefinition, handleHint } from "./commands/hint";
import { hintLocationDefinition, handleHintLocation } from "./commands/hintLocation";
import { hintBalanceDefinition, handleHintBalance } from "./commands/hintBalance";
import { statusDefinition, handleStatus } from "./commands/status";

export const registerCommands = async (clientId: string) => {
  const rest = new REST({ version: "10" }).setToken(CONFIG.discordToken);
  await rest.put(Routes.applicationGuildCommands(clientId, CONFIG.guildId), {
    body: [
      hintDefinition.toJSON(),
      hintLocationDefinition.toJSON(),
      hintBalanceDefinition.toJSON(),
      statusDefinition.toJSON(),
    ],
  });

  logWithTime("Slash commands registered.");
};

export const handleInteraction = async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  switch (interaction.commandName) {
    case Command.Hint:
      return handleHint(interaction);
    case Command.HintLocation:
      return handleHintLocation(interaction);
    case Command.HintBalance:
      return handleHintBalance(interaction);
    case Command.Status:
      return handleStatus(interaction);
  }
};
