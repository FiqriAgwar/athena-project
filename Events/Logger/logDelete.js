const { MessageEmbed, Message, Client } = require("discord.js");
const DBLogger = require("../../Structures/Schemas/LoggerSetup");

module.exports = {
  name: "messageDelete",

  /**
   *
   * @param {Message} message
   * @param {Client} client;
   */
  async execute(message, client) {
    if (message.author.bot) return;

    const LoggerGuild = await DBLogger.findOne({ GuildId: message.guildId });

    if (!LoggerGuild) return;

    const LoggerChannel = LoggerGuild.ChannelId;

    const Log = new MessageEmbed()
      .setColor("RED")
      .setDescription(
        `A [message](${message.url}) by ${message.author.tag} was **deleted**.\n
        **Deleted Message:**\n ${
          message.content ? message.content : "None"
        }`.slice(0, 4096)
      )
      .setFooter({
        text: `Member: ${message.author.tag} | ID: ${message.author.id}`,
      });

    if (message.attachments.size >= 1) {
      Log.addField(
        `Attachments:``${message.attachments.map((a) => a.url)}`,
        true
      );
    }

    client.channels.cache.get(LoggerChannel).send({ embeds: [Log] });
  },
};
