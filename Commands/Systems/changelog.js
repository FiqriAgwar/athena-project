const { CommandInteraction, MessageEmbed } = require("discord.js");

module.exports = {
  name: "changelog",
  description: "Explain the newest version and features of this bot.",

  /**
   *
   * @param {CommandInteraction} interaction
   */
  execute(interaction) {
    const Embed = new MessageEmbed();
    Embed.setAuthor({
      name: `Change Log`,
      iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }),
    })
      .setColor("PURPLE")
      .setFooter({
        text: `This bot is powered by: SorrowInRain.\nWant to request some feature but don't want to code? \n👉 saweria.co/SorrowInRain 👈`,
      });

    Embed.addFields(
      {
        name: `v2.3 (April 01, 2022)`,
        value: `🟢 Added \`/recipe\` to find your favorite recipe around Indonesia.\n*Indomie is excluded.*\n
        🟢 Added \`/changelog\`\n*To know what feature is updated.*`,
      },
      {
        name: `v2.2 (March 31, 2022)`,
        value: `🟢 Added \`/quran\` for your better Ramadhan experience.\n*Happy Ramadhan!*`,
      },
      {
        name: `v2.1 (March 30, 2022)`,
        value: `🟡 Changed \`/music play\` and \`/music options\` to \`/play\` and \`/music\`.\n*I realize that it is difficult for new user to use the new slash command.*\n
      🔴 Removed \`/music volume\`.\n*You can change the volume in the user volume slider. This feature is useless right now.*`,
      },
      {
        name: `v2.0 (March 20, 2022)`,
        value: `🟢 Added \`/nick\` with options \`/nick set\` and \`/nick view\` for nicknaming someone in the same guild.\n*Confused by a new user that just join? Add a nickname and never forget who it is.*`,
      }
    );

    Embed.fields.forEach((field) => {
      field.value += `\n---------------------------------------------------------------------`;
    });
    return interaction.reply({ embeds: [Embed] });
  },
};
