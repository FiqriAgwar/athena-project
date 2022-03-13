const { MessageEmbed, Message, Client } = require("discord.js");
const DBLogger = require("../../Structures/Schemas/LoggerSetup");

module.exports = {
  name: "messageUpdate",

  /**
   *
   * @param {Message} oldMessage
   * @param {Message} newMessage
   * @param {Client} client
   */
  async execute(oldMessage, newMessage, client) {
    if (oldMessage.author.bot) return;

    if (oldMessage.content === newMessage.content) return;

    const LoggerGuild = await DBLogger.findOne({ GuildId: oldMessage.guildId });

    if (!LoggerGuild) return;

    const LoggerChannel = LoggerGuild.ChannelId;

    const Count = 1950;

    const Original =
      oldMessage.content.slice(0, Count) +
      (oldMessage.content.length > Count ? " ..." : "");
    const Edited =
      newMessage.content.slice(0, Count) +
      (newMessage.content.length > Count ? " ..." : "");

    const Log = new MessageEmbed()
      .setColor("YELLOW")
      .setDescription(
        `A [message](${newMessage.url}) by ${newMessage.author} was **edited** in ${newMessage.channel}.\n
        **Original**:\n ${Original} \n**Edited**:\n ${Edited}`
      )
      .setFooter({
        text: `Member: ${newMessage.author.tag} | ID: ${newMessage.author.id}`,
      });

    client.channels.cache.get(LoggerChannel).send({ embeds: [Log] });
  },
};
