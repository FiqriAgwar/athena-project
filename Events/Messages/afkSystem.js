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

    let AFKList = [];
    let Time = [];
    let Status = [];

    if (message.mentions.roles.size) {
      message.mentions.roles.forEach((role) => {
        if (role.members.size) {
          role.members.forEach((member) => {
            DB.findOne(
              { GuildId: message.guild.id, UserId: member.id },
              async (err, data) => {
                if (err) throw err;
                if (data) {
                  if (!AFKList.includes(member)) {
                    AFKList.push(member);
                    Time.push(`<t:${data.Time}:R>`);
                    Status.push(data.Status);
                  }
                }
              }
            );
          });
        }
      });
    }

    if (message.mentions.members.size) {
      message.mentions.members.forEach((member) => {
        DB.findOne(
          { GuildId: message.guild.id, UserId: member.id },
          async (err, data) => {
            if (err) throw err;
            if (data) {
              if (!AFKList.includes(member)) {
                AFKList.push(member);
                Time.push(`<t:${data.Time}:R>`);
                Status.push(data.Status);
              }
            }
          }
        );
      });
    }

    if (AFKList.length > 0) {
      const Embed = new MessageEmbed().setColor("RED");

      Embed.setDescription(`One or more people in this list is going AFK.`);
      Embed.addField(`Member: `, AFKList.join("\n"), true);
      Embed.addField(`Since: `, Time.join("\n"), true);
      Embed.addField(`Reason: `, Status.join("\n"), true);

      return message.reply({ embeds: [Embed], ephemeral: true });
    }
  },
};
