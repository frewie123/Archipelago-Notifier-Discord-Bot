import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command, requireAdmin } from "../commandUtils";
import { enableTracker, trackerEnabled } from "../archipelago";
import { logWithTime } from "../utils";

export const enableTrackerDefinition = new SlashCommandBuilder()
  .setName(Command.EnableTracker)
  .setDescription("Enable the tracker and connect to the Archipelago server");

export const handleEnableTracker = async (
  interaction: ChatInputCommandInteraction
) => {
  if (!(await requireAdmin(interaction))) return;

  if (trackerEnabled) {
    await interaction.reply({
      content: "The tracker is already enabled.",
      ephemeral: true,
    });
    return;
  }

  enableTracker();
  logWithTime("Tracker enabled via command.");

  await interaction.reply({
    content: "✅ Tracker enabled. Connecting to the Archipelago server...",
    ephemeral: true,
  });
};
