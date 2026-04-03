import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command, requireApClient, sendHintCommand } from "../commandUtils";
import { logWithTime, safeReply } from "../utils";

export const hintDefinition = new SlashCommandBuilder()
  .setName(Command.Hint)
  .setDescription("Request a hint from the Archipelago server")
  .addStringOption((option) =>
    option
      .setName("item")
      .setDescription("The name of the item to hint for")
      .setRequired(true)
  );

export const handleHint = async (interaction: ChatInputCommandInteraction) => {
  const apClient = await requireApClient(interaction);
  if (!apClient) return;

  try {
    const itemName = interaction.options.getString("item", true);
    await sendHintCommand(apClient, interaction, `!${Command.Hint} ${itemName}`, itemName);
  } catch (err) {
    logWithTime(`Hint command error: ${err}`);
    await safeReply(interaction, "Failed to send hint request. The server may be disconnected.");
  }
};
