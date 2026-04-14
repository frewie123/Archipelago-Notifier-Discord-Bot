import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Item } from "archipelago.js";
import { Command, resolveApClient } from "../commandUtils";
import { Players } from "../config";

export const latestReceivedDefinition = new SlashCommandBuilder()
  .setName(Command.LatestReceived)
  .setDescription("Show the 10 most recent items you received from other players")
  .addStringOption((option) =>
    option
      .setName("slot")
      .setDescription("Which of your slots to use (only required if you control multiple)")
      .setRequired(false)
  );

const formatItem = (item: Item, index: number): string => {
  const senderId = Players[item.sender.name as keyof typeof Players];
  const sender = senderId ? `<@${senderId}>` : `**${item.sender.name}**`;
  return `${index + 1}. **${item.name}** from ${sender} (${item.locationName})`;
};

export const handleLatestReceived = async (interaction: ChatInputCommandInteraction) => {
  const slot = interaction.options.getString("slot") ?? undefined;
  const apClient = await resolveApClient(interaction, slot);
  if (!apClient) return;

  const inbound = apClient.items.received.filter(
    (item) => item.sender.name !== item.receiver.name
  );

  const progression: Item[] = [];
  const other: Item[] = [];
  for (let i = inbound.length - 1; i >= 0; i--) {
    const item = inbound[i];
    const buf = item.progression ? progression : other;
    if (buf.length < 10) buf.push(item);
    if (progression.length === 10 && other.length === 10) break;
  }

  const progLines = progression.length
    ? progression.map(formatItem).join("\n")
    : "_No progression items received yet._";
  const otherLines = other.length
    ? other.map(formatItem).join("\n")
    : "_No other items received yet._";

  await interaction.reply({
    content: `**--Latest Progression Items Received (${apClient.name})--**\n${progLines}\n\n**--Latest Other Items Received (${apClient.name})--**\n${otherLines}`,
    ephemeral: true,
  });
};
