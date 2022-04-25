const { CommandInteraction, MessageEmbed } = require("discord.js");
const { client } = require("../../Structures/index");

module.exports = {
  name: "help",
  description:
    "Want to contribute for this bot? Or you want to know about this bot? Check this out.",

  /**
   *
   * @param {CommandInteraction} interaction
   */
  execute(interaction) {
    // console.log(client.commands);

    const Embed = new MessageEmbed();
    Embed.setAuthor({
      name: interaction.client.user.username,
      iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }),
    })
      .setColor("PURPLE")
      .setFooter({
        text: `This bot is powered by: SorrowInRain.`,
      });

    Embed.addFields(
      {
        name: `Documentation`,
        value: `All of the commands are documented [here](https://github.com/SorrowInRain/athena-project/wiki). Enhancement of this command will be exist in the future.`,
      },
      {
        name: `What's in the future?`,
        value: `This is the roadmap of upcoming feature of Minerva. Check it [here](https://github.com/SorrowInRain/athena-project/projects/2)`,
      },
      {
        name: `Do you want to request a feature?`,
        value: `You can do it by adding a request in [Github](https://github.com/SorrowInRain/athena-project/issues/new?assignees=&labels=&template=feature_request.md&title=) or use the \`/request\` command.`,
      },
      {
        name: `Do you want to support the project?`,
        value: `You can support this project by enhancing the code (see [How to Contribute](https://github.com/SorrowInRain/athena-project#contributing)) or by donating (see [How to Support](https://github.com/SorrowInRain/athena-project#support)).\nAny kind of good contribution is welcomed with open hands.`,
      }
    );

    return interaction.reply({ embeds: [Embed], ephemeral: true });
  },
};
