import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command, requireApClient } from "../commandUtils";

export const hintBalanceDefinition = new SlashCommandBuilder()
  .setName(Command.HintBalance)
  .setDescription("Show your current hint point balance and hint cost");

export const handleHintBalance = async (interaction: ChatInputCommandInteraction) => {
  const apClient = await requireApClient(interaction);
  if (!apClient) return;

  const points = apClient.room.hintPoints;
  const cost = apClient.room.hintCost;
  await interaction.reply({
    content: `**Hint Balance**\nPoints: ${points}\nHint Cost: ${cost}`,
    ephemeral: true,
  });
};
