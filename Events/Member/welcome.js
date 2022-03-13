const { MessageEmbed, GuildMember, Client } = require("discord.js");
const DBWelcome = require("../../Structures/Schemas/WelcomeSetup");

module.exports = {
  name: "guildMemberAdd",

  /**
   *
   * @param {GuildMember} member
   * @param {Client} client
   */
  async execute(member, client) {
    const { user, guild } = member;

    const WelcomeGuild = await DBWelcome.findOne({ GuildId: member.guild.id });

    if (!WelcomeGuild) return;

    const WelcomeChannel = WelcomeGuild.ChannelId;

    const WelcomeMessage = new MessageEmbed()
      .setColor("RANDOM")
      .setAuthor({
        name: `A new ${user.bot ? "bot" : "member"} has appeared!`,
        iconURL: user.avatarURL({ dynamic: true, size: 512 }),
      })
      .setThumbnail(user.avatarURL({ dynamic: true, size: 512 }))
      .setDescription(
        `Welcome ${member} to the **${guild.name}**!\n
      Account Created: <t:${parseInt(user.createdTimestamp / 1000)}:R>\n
      Latest Member Count: **${guild.memberCount}**`
      )
      .setFooter({ text: `${user.tag} | ${user.id}` });

    client.channels.cache
      .get(WelcomeChannel)
      .send({ embeds: [WelcomeMessage] });
  },
};
