const { Client, MessageEmbed, Guild } = require("discord.js");
const mongoose = require("mongoose");
const Database = process.env.DATABASE;
const AnnDB = require("../../Structures/Schemas/ScheduledAnnounce");
// const { Database } = require("../../Structures/config.json");

module.exports = {
  name: "guildCreate",
  once: true,

  /**
   * @param {Guild} guild
   * @param {Client} client
   */
  execute(guild, client) {
    const version = process.env.NODE_ENV;

    guild.systemChannel.send({
      embeds: [
        new MessageEmbed()
          .setColor("LUMINOUS_VIVID_PINK")
          .setAuthor({
            name: client.user.username,
            iconURL: client.user.displayAvatarURL(),
          })
          .setThumbnail(guild.iconURL({ dynamic: true }))
          .setDescription(
            `Thank you for inviting me to your server.\nThis bot is not a perfect bot to replace all of the other bot out there but good enough for you to learn how to make it.\nType \`/help\` to see how you can contribute in this project.`
          )
          .setFooter({ text: `Made by: SorrowInRain | Credit to: LyxCode` }),
      ],
    });
    client.user.setActivity(
      `${
        version === "production"
          ? client.guilds.cache.size + " servers"
          : "this idiot ngoding"
      }`,
      {
        type: "WATCHING",
      }
    );
  },
};
