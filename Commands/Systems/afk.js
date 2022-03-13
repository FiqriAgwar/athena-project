const { CommandInteraction, MessageEmbed, Message } = require("discord.js");
const DB = require("../../Structures/Schemas/AFKSystem");

module.exports = {
  name: "afk",
  description:
    "Set your status as AFK to give your mentioner a description why you are AFK.",
  options: [
    {
      name: "set",
      type: "SUB_COMMAND",
      description: "Set your AFK Status",
      options: [
        {
          name: "status",
          description: "Set your status",
          type: "STRING",
          required: true,
        },
      ],
    },
    {
      name: "return",
      type: "SUB_COMMAND",
      description: "Return from being AFK.",
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

    const afkStatus = options.getString("status");

    try {
      switch (options.getSubcommand()) {
        case "set": {
          await DB.findOneAndUpdate(
            { GuildId: guild.id, UserId: user.id },
            { Status: afkStatus, Time: parseInt(createdTimestamp / 1000) },
            { new: true, upsert: true }
          );

          Embed.setColor("GREEN").setDescription(
            `Your AFK status has been updated to ${afkStatus}`
          );

          return interaction.reply({ embeds: [Embed], ephemeral: true });
        }
        case "return": {
          await DB.deleteOne({ GuildId: guild.id, UserId: user.id });

          Embed.setColor("RED").setDescription(
            `Your AFK status has been removed. Welcome back!`
          );

          return interaction.reply({ embeds: [Embed], ephemeral: true });
        }
      }
    } catch (err) {
      console.log(err);
    }
  },
};
