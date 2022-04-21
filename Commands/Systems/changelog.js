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
        name: `v3.0 (April 22, 2022)`,
        value: `🟡 FIXED | Bugs when reacting in \`/role\` command.\n*Works on custom emoji but not in normal emoji. Fixed*\n
        🟢 ADD | \`/status\` for detailed information of the bot.\n*Doesn't know means doesn't love.*\n
        🟣 SYSTEM | The bot is now **OPEN SOURCE** 🎉. You can now contribute in [here](https://github.com/SorrowInRain/athena-project).`,
      },
      {
        name: `v2.5 (April 09, 2022)`,
        value: `🟢 ADD | \`/role\` with options \`/role setup\`, \`/role add\` for giving a role to someone.\n*Automated role system (and free) is really necessary for a good server.*`,
      },
      {
        name: `v2.4 (April 04, 2022)`,
        value: `🟢 ADD | \`/praytime\` for praying time in Bandung.\n*Currenly limited to Bandung only to avoid 500 Error.*`,
      }
    );

    Embed.fields.forEach((field) => {
      field.value += `\n---------------------------------------------------------------------`;
    });
    return interaction.reply({ embeds: [Embed] });
  },
};
