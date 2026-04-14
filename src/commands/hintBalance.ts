import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command, resolveApClient } from "../commandUtils";

export const hintBalanceDefinition = new SlashCommandBuilder()
  .setName(Command.HintBalance)
  .setDescription("Show your current hint point balance and hint cost")
  .addStringOption((option) =>
    option
      .setName("slot")
      .setDescription("Which of your slots to use (only required if you control multiple)")
      .setRequired(false)
  );

export const handleHintBalance = async (interaction: ChatInputCommandInteraction) => {
  const slot = interaction.options.getString("slot") ?? undefined;
  const apClient = await resolveApClient(interaction, slot);
  if (!apClient) return;

  const points = apClient.room.hintPoints;
  const cost = apClient.room.hintCost;
  await interaction.reply({
    content: `**Hint Balance**\nPoints: ${points}\nHint Cost: ${cost}`,
    ephemeral: true,
  });
};
