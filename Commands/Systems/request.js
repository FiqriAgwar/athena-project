const { CommandInteraction, MessageEmbed } = require("discord.js");

module.exports = {
  name: "request",
  description: "Create a request for your server.",
  options: [
    {
      name: "feature",
      description: "Select the feature.",
      type: "STRING",
      required: true,
      choices: [
        {
          name: "Emote",
          value: "Emote",
        },
        {
          name: "Sticker",
          value: "Sticker",
        },
        {
          name: "Channel",
          value: "Channel",
        },
        {
          name: "Other",
          value: "Other",
        },
      ],
    },
    {
      name: "type",
      description: "Select the type of request.",
      type: "STRING",
      required: true,
      choices: [
        {
          name: "Add",
          value: "Add",
        },
        {
          name: "Change",
          value: "Change",
        },
        {
          name: "Delete",
          value: "Delete",
        },
      ],
    },
    {
      name: "description",
      description: "Describe your request.",
      type: "STRING",
      required: true,
    },
  ],

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, user } = interaction;
    const feature = options.getString("feature");
    const type = options.getString("type");
    const description = options.getString("description");

    const Response = new MessageEmbed()
      .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL({ dynamic: true }),
      })
      .addFields(
        { name: "Type:", value: type, inline: true },
        { name: "Feature:", value: feature, inline: true },
        { name: "Description:", value: description, inline: false }
      )
      .setTimestamp();

    switch (type) {
      case "Add":
        {
          Response.setColor("DARK_GREEN");
        }
        break;
      case "Change":
        {
          Response.setColor("DARK_GOLD");
        }
        break;
      case "Delete":
        {
          Response.setColor("DARK_RED");
        }
        break;
    }

    const msg = await interaction.reply({
      embeds: [Response],
      fetchReply: true,
    });
    msg.react("👍");
    msg.react("👎");
  },
};
