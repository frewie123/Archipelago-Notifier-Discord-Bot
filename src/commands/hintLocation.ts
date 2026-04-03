import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command, requireApClient, sendHintCommand } from "../commandUtils";
import { logWithTime, safeReply } from "../utils";

export const hintLocationDefinition = new SlashCommandBuilder()
  .setName(Command.HintLocation)
  .setDescription("Request a hint for a location from the Archipelago server")
  .addStringOption((option) =>
    option
      .setName("location")
      .setDescription("The name of the location to hint for")
      .setRequired(true)
  );

export const handleHintLocation = async (interaction: ChatInputCommandInteraction) => {
  const apClient = await requireApClient(interaction);
  if (!apClient) return;

  try {
    const locationName = interaction.options.getString("location", true);
    await sendHintCommand(apClient, interaction, `!${Command.HintLocation} ${locationName}`, locationName);
  } catch (err) {
    logWithTime(`Hint command error: ${err}`);
    await safeReply(interaction, "Failed to send hint request. The server may be disconnected.");
  }
};
