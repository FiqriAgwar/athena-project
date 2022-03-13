const {
  CommandInteraction,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");

const DB = require("../../Structures/Schemas/SuggestDB");

module.exports = {
  name: "suggest",
  description: "Create a suggestion FOR THE BOT in an organized matter.",
  options: [
    {
      name: "type",
      description: "Select the type.",
      required: true,
      type: "STRING",
      choices: [
        {
          name: "Command",
          value: "Command",
        },
        {
          name: "Event",
          value: "Event",
        },
        {
          name: "System",
          value: "System",
        },
        {
          name: "Other",
          value: "Other",
        },
      ],
    },
    {
      name: "suggestion",
      description: "Describe your suggestion.",
      type: "STRING",
      required: true,
    },
  ],

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, guildId, member, user } = interaction;
    const type = options.getString("type");
    const suggestion = options.getString("suggestion");

    const Response = new MessageEmbed()
      .setColor("DARK_NAVY")
      .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL({ dynamic: true }),
      })
      .addFields(
        { name: "Suggestion:", value: suggestion, inline: false },
        { name: "Type:", value: type, inline: true },
        { name: "Status:", value: "Pending", inline: true }
      )
      .setTimestamp();

    const Buttons = new MessageActionRow();
    Buttons.addComponents(
      new MessageButton()
        .setCustomId("suggest-accept")
        .setLabel("👍 Accept")
        .setStyle("PRIMARY"),
      new MessageButton()
        .setCustomId("suggest-deny")
        .setLabel("👎 Deny")
        .setStyle("SECONDARY")
    );

    try {
      const Msg = await interaction.reply({
        embeds: [Response],
        components: [Buttons],
        fetchReply: true,
      });

      await DB.create({
        GuildID: guildId,
        MessageID: Msg.id,
        Detail: [
          {
            MemberID: member.id,
            Type: type,
            Suggestion: suggestion,
          },
        ],
      });
    } catch (err) {
      console.log(err);
    }
  },
};
