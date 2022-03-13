const { ButtonInteraction } = require("discord.js");
const DB = require("../../Structures/Schemas/SuggestDB");

module.exports = {
  name: "interactionCreate",

  /**
   *
   * @param {ButtonInteraction} interaction
   */
  async execute(interaction) {
    if (!interaction.isButton()) {
      return;
    }

    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
      return interaction.reply({
        content: "You can not use this button.",
        ephemeral: true,
      });
    }
    const { guildId, customId, message } = interaction;

    if (!["suggest-accept", "suggest-deny"].includes(customId)) return;

    DB.findOne(
      { GuildId: guildId, MessageId: message.id },
      async (err, data) => {
        if (err) throw err;
        if (!data) {
          return interaction.reply({
            content: "No data was found.",
            ephemeral: true,
          });
        }

        const Embed = message.embeds[0];
        if (!Embed) {
          return;
        }

        switch (customId) {
          case "suggest-accept": {
            Embed.fields[2] = {
              name: "Status",
              value: "Accepted",
              inline: true,
            };

            message.edit({ embeds: [Embed.setColor("GREEN")], components: [] });
            return interaction.reply({
              content: `Suggestion ID: <#${message.id}> has been accepted.`,
              ephemeral: true,
            });
          }

          case "suggest-deny": {
            Embed.fields[2] = {
              name: "Status",
              value: "Denied",
              inline: true,
            };

            message.edit({ embeds: [Embed.setColor("RED")], components: [] });
            return interaction.reply({
              content: `Suggestion ID: <#${message.id}> has been denied.`,
              ephemeral: true,
            });
          }
        }
      }
    );
  },
};
