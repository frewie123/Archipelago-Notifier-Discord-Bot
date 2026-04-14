import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { CONFIG, saveConfig } from "../config";
import { Command, requireAdmin } from "../commandUtils";
import { connectPlayer, trackerEnabled } from "../archipelago";

export const trackDefinition = new SlashCommandBuilder()
  .setName(Command.Track)
  .setDescription("Add a player slot to the tracking list")
  .addStringOption((option) =>
    option
      .setName("slot")
      .setDescription("The Archipelago slot name")
      .setRequired(true)
  )
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("The Discord user to associate with this slot")
      .setRequired(true)
  );

export const handleTrack = async (
  interaction: ChatInputCommandInteraction
) => {
  if (!(await requireAdmin(interaction))) return;

  const slot = interaction.options.getString("slot", true);
  const user = interaction.options.getUser("user", true);

  CONFIG.players[slot] = user.id;
  saveConfig();

  if (trackerEnabled) {
    connectPlayer(slot);
  }

  await interaction.reply({
    content: `Now tracking **${slot}** as <@${user.id}>.`,
    ephemeral: true,
  });
};
