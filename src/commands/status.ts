import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { clientStatuses, slotTypes } from "archipelago.js";
import { Players } from "../config";
import { apClients, onlinePlayers } from "../archipelago";
import { logWithTime } from "../utils";
import { Command } from "../commandUtils";

export const statusDefinition = new SlashCommandBuilder()
  .setName(Command.Status)
  .setDescription("Show the online and completion status of all players");

export const handleStatus = async (interaction: ChatInputCommandInteraction) => {
  const client = apClients.find((c) => c.authenticated);
  if (!client) {
    await interaction.reply({
      content: "Not connected to the Archipelago server.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const playerNames = Object.keys(Players);
    const ourPlayers: { name: string; game: string; fetchStatus: () => Promise<number> }[] = [];
    const playerClients: typeof apClients = [];

    for (const team of client.players.teams) {
      for (const player of team) {
        if (player.slot === 0) continue;
        if (player.type === slotTypes.group) continue;
        if (playerNames.includes(player.name)) {
          ourPlayers.push(player);
          const apClient = apClients.find((c) => c.name === player.name);
          playerClients.push(apClient!);
        }
      }
    }

    const statuses = await Promise.all(ourPlayers.map((p) => p.fetchStatus()));

    const lines = ourPlayers.map((player, i) => {
      const status = statuses[i];
      const online = onlinePlayers.has(player.name);
      const completed = status === clientStatuses.goal;

      const circle = online ? "🟢" : "⚪";
      const discordId = Players[player.name as keyof typeof Players];
      const mention = discordId ? `<@${discordId}>` : player.name;

      if (completed) {
        return `${circle} ${mention} — ${player.game} ✅`;
      }

      const checked = playerClients[i].room.checkedLocations.length;
      const total = playerClients[i].room.allLocations.length;
      const percent = total > 0 ? Math.round((checked / total) * 100) : 0;

      return `${circle} ${mention} — ${player.game} (${percent}%)`;
    });

    const legend = "\n\n🟢 Online | ⚪ Offline | ✅ Goal Complete";

    const content =
      lines.length > 0
        ? `**Archipelago Player Status**\n\n${lines.join("\n")}${legend}`
        : "No configured players found in the current session.";

    await interaction.editReply({ content });
  } catch (err) {
    logWithTime(`Status command error: ${err}`);
    await interaction.editReply({
      content: "Failed to fetch player statuses. The server may be disconnected.",
    });
  }
};
