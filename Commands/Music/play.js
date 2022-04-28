const { CommandInteraction, Client, MessageEmbed } = require("discord.js");

module.exports = {
  name: "play",
  description: "Play a Song.",
  options: [
    {
      name: "query",
      description: "Provide a Name or a URL of the Song",
      type: "STRING",
      required: true,
    },
  ],
  /**
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { options, member, guild, channel } = interaction;
    const VoiceChannel = member.voice.channel;
    const Query = options.getString("query");

    if (!VoiceChannel)
      return interaction.reply({
        content:
          "<:Error:944848097232711702> | You must be in a Voice Channel.",
        ephemeral: true,
      });

    if (
      guild.me.voice.channelId &&
      VoiceChannel.id !== guild.me.voice.channelId
    )
      return interaction.reply({
        content: `<:Error:944848097232711702> | I'm already Playing Music in <#${guild.me.voice.channelId}>.`,
        ephemeral: true,
      });

    client.distube.play(VoiceChannel, Query, {
      textChannel: channel,
      member: member,
    });
    interaction
      .reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`<:Play:944845462790344775> | Request Recieved!`)
            .setColor("GREEN")
            .setTimestamp(),
        ],
      })
      .catch((e) => console.log(e));

    setTimeout(() => interaction.deleteReply(), 10 * 1000);
  },
};
