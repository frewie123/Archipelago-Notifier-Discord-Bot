import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { CONFIG, saveConfig } from "../config";
import { Command, requireAdmin } from "../commandUtils";
import { disconnectPlayer } from "../archipelago";

export const removeTrackDefinition = new SlashCommandBuilder()
  .setName(Command.RemoveTrack)
  .setDescription("Remove a player slot from the tracking list")
  .addStringOption((option) =>
    option
      .setName("slot")
      .setDescription("The Archipelago slot name to remove")
      .setRequired(true)
  );

export const handleRemoveTrack = async (
  interaction: ChatInputCommandInteraction
) => {
  if (!(await requireAdmin(interaction))) return;

  const slot = interaction.options.getString("slot", true);

  if (!(slot in CONFIG.players)) {
    await interaction.reply({
      content: `Slot **${slot}** is not being tracked.`,
      ephemeral: true,
    });
    return;
  }

  disconnectPlayer(slot);
  delete CONFIG.players[slot];
  saveConfig();

  await interaction.reply({
    content: `Stopped tracking **${slot}**.`,
    ephemeral: true,
  });
};
