import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command, resolveApClient, sendHintCommand } from "../commandUtils";
import { logWithTime, safeReply } from "../utils";

export const hintLocationDefinition = new SlashCommandBuilder()
  .setName(Command.HintLocation)
  .setDescription("Request a hint for a location from the Archipelago server")
  .addStringOption((option) =>
    option
      .setName("location")
      .setDescription("The name of the location to hint for")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("slot")
      .setDescription("Which of your slots to use (only required if you control multiple)")
      .setRequired(false)
  );

export const handleHintLocation = async (interaction: ChatInputCommandInteraction) => {
  const slot = interaction.options.getString("slot") ?? undefined;
  const apClient = await resolveApClient(interaction, slot);
  if (!apClient) return;

  try {
    const locationName = interaction.options.getString("location", true);
    await sendHintCommand(apClient, interaction, `!${Command.HintLocation} ${locationName}`, locationName);
  } catch (err) {
    logWithTime(`Hint command error: ${err}`);
    await safeReply(interaction, "Failed to send hint request. The server may be disconnected.");
  }
};
