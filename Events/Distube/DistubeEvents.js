const client = require("../../Structures/index");
const { MessageEmbed } = require("discord.js");

const status = (queue) =>
  `Volume: \`${queue.volume}%\` | Filter: \`${
    queue.filters.join(", ") || "Off"
  }\` | Loop: \`${
    queue.repeatMode
      ? queue.repeatMode === 2
        ? "All Queue"
        : "This Song"
      : "Off"
  }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

client.distube
  .on("playSong", (queue, song) => {
    queue.textChannel.send({
      embeds: [
        new MessageEmbed()
          .setDescription(
            `Playing \`${song.name}\` - \`${
              song.formattedDuration
            }\`\nRequested by: ${song.user}\n${status(queue)}`
          )
          .setColor("GREEN"),
      ],
    });

    // client.user.setActivity(`${song.name}`, { type: "LISTENING" });
  })
  .on("addSong", (queue, song) =>
    queue.textChannel.send({
      embeds: [
        new MessageEmbed()
          .setDescription(
            `Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
          )
          .setColor("GREEN"),
      ],
    })
  )
  .on("addList", (queue, playlist) =>
    queue.textChannel.send({
      embeds: [
        new MessageEmbed()
          .setDescription(
            `Added \`${playlist.name}\` playlist (${
              playlist.songs.length
            } songs) to queue\n${status(queue)}`
          )
          .setColor("GREEN"),
      ],
    })
  )
  .on("error", (channel, e) => {
    channel.send({
      embeds: [
        new MessageEmbed()
          .setDescription(
            `An error encountered: ${e.toString().slice(0, 1974)}`
          )
          .setColor("RED"),
      ],
    });
    console.error(e);
  })
  .on("empty", (queue) =>
    queue.textChannel.send({
      embeds: [
        new MessageEmbed()
          .setDescription("Voice channel is empty! Leaving the channel....")
          .setColor("RED"),
      ],
    })
  )
  .on("searchNoResult", (message, query) =>
    message.channel.send({
      embeds: [
        new MessageEmbed()
          .setDescription(`No result found for \`${query}\`!`)
          .setColor("RED"),
      ],
    })
  )
  .on("finish", (queue) =>
    queue.textChannel.send({
      embeds: [
        new MessageEmbed()
          .setDescription(`Queue finished, leaving the channel....`)
          .setColor("RED"),
      ],
    })
  );
