const { CommandInteraction, MessageEmbed, Client } = require("discord.js");

module.exports = {
  name: "music",
  description: "Complete music system.",
  options: [
    {
      name: "options",
      description: "Select an options.",
      type: "STRING",
      required: true,
      choices: [
        { name: "🔢 View Queue", value: "queue" },
        { name: "⏭ Skip Song", value: "skip" },
        { name: "⏸ Pause Song", value: "pause" },
        { name: "⏯ Resume Song", value: "resume" },
        { name: "⏹ Stop Playlist", value: "stop" },
        { name: "🔀 Shuffle Playlist", value: "shuffle" },
        { name: "🔃 Toggle AutoPlay Mode", value: "autoplay" },
        { name: "🆕 Add A Related Song", value: "relatedsong" },
        { name: "🔁 Toggle Repeat Mode", value: "repeat" },
      ],
    },
  ],

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { options, member, guild, channel } = interaction;
    const VoiceChannel = member.voice.channel;

    if (!VoiceChannel) {
      return interaction.reply({
        content:
          "⚠ You must be in a voice channel to be able to use the music commands.",
        ephemeral: true,
      });
    }

    if (
      guild.me.voice.channelId &&
      VoiceChannel.id !== guild.me.voice.channelId
    ) {
      return interaction.reply({
        content: `⚠ I am already playing music in <#${guild.me.voice.channelId}>`,
        ephemeral: true,
      });
    }

    try {
      const queue = await client.distube.getQueue(VoiceChannel);

      if (!queue) {
        return interaction.reply(`🤷‍♂️ There is no queue.`);
      }

      switch (options.getString("options")) {
        case "skip":
          await queue.skip(VoiceChannel);
          return interaction.reply({ content: "⏭ Song has been skipped." });

        case "stop":
          await queue.stop(VoiceChannel);
          return interaction.reply({
            content: "⏹ The music player has been stopped.",
          });

        case "pause":
          await queue.pause(VoiceChannel);
          return interaction.reply({ content: "⏸ Song has been paused." });

        case "resume":
          await queue.resume(VoiceChannel);
          return interaction.reply({ content: "▶ Song has been resumed." });

        case "shuffle":
          await queue.shuffle(VoiceChannel);
          return interaction.reply({
            content: "🔀 Playlist has been shuffled.",
          });

        case "autoplay":
          let mode = await queue.toggleAutoplay(VoiceChannel);
          return interaction.reply({
            content: `🔃 Autoplay mode has been set ${mode ? "On" : "Off"}`,
          });

        case "relatedsong":
          await queue.addRelatedSong(VoiceChannel);
          return interaction.reply({
            content: "🆕 A related song has been added to the queue.",
          });

        case "repeat":
          let mode2 = await client.distube.setRepeatMode(queue);
          return interaction.reply({
            content: `🔁 Repeat mode has been set ${mode2 ? "On" : "Off"}`,
          });

        case "queue":
          return interaction.reply({
            embeds: [
              new MessageEmbed().setColor("AQUA").setDescription(
                `${queue.map((song, id) => {
                  `\n**${id + 1}**. ${song.name} - \`${
                    song.formattedDuration
                  }\``;
                })}`
              ),
            ],
          });
      }

      return;
    } catch (e) {
      const errorEmbed = new MessageEmbed.setColor("RED").setDescription(
        `Alert: ${e}`
      );

      return interaction.reply({ embeds: [errorEmbed] });
    }
  },
};
