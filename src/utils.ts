import { ChatInputCommandInteraction } from "discord.js";

export const logWithTime = (message: string) => {
  var currentTime = new Date().toLocaleString();
  console.log(`${currentTime} - ${message}`);
};

export const safeReply = async (
  interaction: ChatInputCommandInteraction,
  content: string
) => {
  if (interaction.replied || interaction.deferred) {
    await interaction.editReply({ content });
  } else {
    await interaction.reply({ content, ephemeral: true });
  }
};
