const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("link")
        .setDescription(
            "Muestra el link de la sala de Haxball si está abierto el host."
        ),
    async execute(interaction) {
        if (
            !global.roomsList ||
            (global.roomsList && !global.roomsList.length)
        ) {
            await interaction.reply("No hay servers abiertos.");
        } else {
            let str = "**Salas abiertas:**\n\n--\n";
            global.roomsList.forEach((r) => {
                str += `- **${r.name}**\n ${r.players}/${r.maxPlayers} jugadores - ${r.link}\n--\n`;
            });
            await interaction.reply(str);
        }
    },
};
