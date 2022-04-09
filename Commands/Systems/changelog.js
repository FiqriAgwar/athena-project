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
        name: `v2.5 (April 09, 2022)`,
        value: `🟢 Added \`/role\` with options \`/role setup\`, \`/role add\` and \`/role remove\` for giving a role to someone.\n*Automated role system (and free) is really necessary for a good server.*`,
      },
      {
        name: `v2.4 (April 04, 2022)`,
        value: `🟢 Added \`/praytime\` for praying time in Bandung.\n*Currenly limited to Bandung only to avoid 500 Error.*`,
      },
      {
        name: `v2.3 (April 01, 2022)`,
        value: `🟢 Added \`/recipe\` to find your favorite recipe around Indonesia.\n*Indomie is excluded.*\n
        🟢 Added \`/changelog\`\n*To know what feature is updated.*`,
      }
    );

    Embed.fields.forEach((field) => {
      field.value += `\n---------------------------------------------------------------------`;
    });
    return interaction.reply({ embeds: [Embed] });
  },
};
