const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("link")
        .setDescription("Muestra los links de las salas abiertas."),
    async execute(interaction) {
        if (
            !global.roomsList ||
            (global.roomsList && !global.roomsList.length)
        ) {
            await interaction.reply("No hay salas abiertas.");
        } else {
            let str = "**Salas abiertas:**\n\n--\n";
            global.roomsList.forEach((r) => {
                str += `- **${r.name}**\n ${r.players}/${r.maxPlayers} jugadores - ${r.link}\n--\n`;
            });
            await interaction.reply(str);
        }
    },
};
