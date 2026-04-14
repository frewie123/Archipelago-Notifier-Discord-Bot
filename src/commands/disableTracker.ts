import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command, requireAdmin } from "../commandUtils";
import { disableTracker, trackerEnabled } from "../archipelago";
import { logWithTime } from "../utils";

export const disableTrackerDefinition = new SlashCommandBuilder()
  .setName(Command.DisableTracker)
  .setDescription("Disable the tracker and disconnect from the Archipelago server");

export const handleDisableTracker = async (
  interaction: ChatInputCommandInteraction
) => {
  if (!(await requireAdmin(interaction))) return;

  if (!trackerEnabled) {
    await interaction.reply({
      content: "The tracker is already disabled.",
      ephemeral: true,
    });
    return;
  }

  disableTracker();
  logWithTime("Tracker disabled via command.");

  await interaction.reply({
    content: "⛔ Tracker disabled. All clients disconnected.",
    ephemeral: true,
  });
};
