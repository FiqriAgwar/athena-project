const { Message, MessageEmbed } = require("discord.js");
const DB = require("../../Structures/Schemas/AFKSystem");

module.exports = {
  name: "messageCreate",

  /**
   *
   * @param {Message} message
   * @returns
   */
  async execute(message) {
    if (message.author.bot) return;

    await DB.deleteOne({
      GuildId: message.guild.id,
      UserId: message.author.id,
    });

    if (message.mentions.members.size) {
      const Embed = new MessageEmbed().setColor("RED");

      message.mentions.members.forEach((member) => {
        DB.findOne(
          { GuildId: message.guild.id, UserId: member.id },
          async (err, data) => {
            if (err) throw err;
            if (data) {
              Embed.setDescription(
                `${member} went AFK <t:${data.Time}:R>\n **Status**: ${data.Status}`
              );
              return message.reply({ embeds: [Embed], ephemeral: true });
            }
          }
        );
      });
    }
  },
};
