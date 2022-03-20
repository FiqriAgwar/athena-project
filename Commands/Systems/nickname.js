const { CommandInteraction, MessageEmbed, Message } = require("discord.js");
const DB = require("../../Structures/Schemas/Nickname");

module.exports = {
  name: "nick",
  description: "Set your friend's username to whatever nickname you want.",
  options: [
    {
      name: "set",
      type: "SUB_COMMAND",
      description: "Set your friends nickname.",
      options: [
        {
          name: "user",
          description: "Your friend's username",
          type: "USER",
          required: true,
        },
        {
          name: "name",
          description: "The nickname that you want to set.",
          type: "STRING",
          required: true,
        },
      ],
    },
    {
      name: "view",
      type: "SUB_COMMAND",
      description: "View the nicknames from a user.",
      options: [
        {
          name: "user",
          description: "Your friend's username",
          type: "USER",
          required: true,
        },
      ],
    },
  ],

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, options, user, createdTimestamp } = interaction;

    const Embed = new MessageEmbed().setAuthor({
      name: user.tag,
      iconURL: user.displayAvatarURL({ dynamic: true }),
    });

    const nickname = options.getString("name");
    const userNicked = options.getUser("user");

    try {
      switch (options.getSubcommand()) {
        case "set": {
          await DB.findOneAndUpdate(
            { GuildId: guild.id, UserId: userNicked.id, NickSetterId: user.id },
            { Nickname: nickname },
            { new: true, upsert: true }
          );

          Embed.setColor("GREEN").setDescription(
            `Your friend's (${userNicked}) nickname has been updated to ${nickname}`
          );

          return interaction.reply({ embeds: [Embed], ephemeral: true });
        }
        case "view": {
          const nicknames = await DB.find({
            GuildId: guild.id,
            UserId: userNicked.id,
          });

          let nickSetter = "";
          let nickNameSet = "";

          nicknames.forEach((nick) => {
            nickSetter += `<@${nick.NickSetterId}>\n`;
            nickNameSet += `${nick.Nickname}\n`;
          });

          Embed.setColor("FUCHSIA")
            .setDescription(`Nicknames for ${userNicked}:`)
            .addFields(
              { name: `Nickname`, value: nickNameSet, inline: true },
              { name: `Set By`, value: nickSetter, inline: true }
            );

          return interaction.reply({ embeds: [Embed] });
        }
      }
    } catch (err) {
      console.log(err);
    }
  },
};
