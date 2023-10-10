const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays a radio station")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("radio")
        .setDescription("Plays a radio station")
        .addStringOption((option) =>
          option
            .setName("url")
            .setDescription("The radio station URL")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    // Aquí va la lógica para reproducir una estación de radio
  },
};
