import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command, resolveApClient, sendHintCommand } from "../commandUtils";
import { logWithTime, safeReply } from "../utils";

export const hintDefinition = new SlashCommandBuilder()
  .setName(Command.Hint)
  .setDescription("Request a hint from the Archipelago server")
  .addStringOption((option) =>
    option
      .setName("item")
      .setDescription("The name of the item to hint for")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("slot")
      .setDescription("Which of your slots to use (only required if you control multiple)")
      .setRequired(false)
  );

export const handleHint = async (interaction: ChatInputCommandInteraction) => {
  const slot = interaction.options.getString("slot") ?? undefined;
  const apClient = await resolveApClient(interaction, slot);
  if (!apClient) return;

  try {
    const itemName = interaction.options.getString("item", true);
    await sendHintCommand(apClient, interaction, `!${Command.Hint} ${itemName}`, itemName);
  } catch (err) {
    logWithTime(`Hint command error: ${err}`);
    await safeReply(interaction, "Failed to send hint request. The server may be disconnected.");
  }
};
