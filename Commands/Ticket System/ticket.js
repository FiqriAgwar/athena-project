const { MessageEmbed, CommandInteraction } = require("discord.js");
const DB = require("../../Structures/Schemas/Ticket");

module.exports = {
  name: "ticket",
  description: "Ticket Actions",
  permission: "ADMINISTRATOR",
  options: [
    {
      name: "action",
      type: "STRING",
      description: "Add or Remove a member from this ticket.",
      required: true,
      choices: [
        { name: "Add", value: "add" },
        { name: "Remove", value: "remove" },
      ],
    },
    {
      name: "member",
      description: "Select a member",
      type: "USER",
      required: true,
    },
  ],

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { guildId, options, channel } = interaction;

    const Action = options.getString("action");
    const Member = options.getMember("member");

    const Embed = new MessageEmbed();

    switch (action) {
      case "add": {
        DB.findOne(
          { GuildId: guildId, ChannelId: channel.id },
          async (err, docs) => {
            if (err) throw err;
            if (!docs)
              return interaction.reply({
                embeds: [
                  Embed.setColor("RED").setDescription(
                    `🛑 | This channel is not tied with a ticket.`
                  ),
                ],
                ephemeral: true,
              });

            if (docs.MembersId.includes(Member.id))
              return interaction.reply({
                embeds: [
                  Embed.setColor("RED").setDescription(
                    `🛑 | This member is already added to this ticket.`
                  ),
                ],
                ephemeral: true,
              });

            docs.MembersId.push(Member.id);
            channel.permissionOverwrites.edit(Member.id, {
              SEND_MESSAGE: true,
              VIEW_CHANNEL: true,
              READ_MESSAGE_HISTORY: true,
            });

            interaction.reply({
              embeds: [
                Embed.setColor("GREEN").setDescription(
                  `✅ | ${Member} has been added to the ticket.`
                ),
              ],
            });

            docs.save();
          }
        );
      }

      case "remove": {
        DB.findOne(
          { GuildId: guildId, ChannelId: channel.id },
          async (err, docs) => {
            if (err) throw err;
            if (!docs)
              return interaction.reply({
                embeds: [
                  Embed.setColor("RED").setDescription(
                    `🛑 | This channel is not tied with a ticket.`
                  ),
                ],
                ephemeral: true,
              });

            if (!docs.MembersId.includes(Member.id))
              return interaction.reply({
                embeds: [
                  Embed.setColor("RED").setDescription(
                    `🛑 | This member is not in this ticket.`
                  ),
                ],
                ephemeral: true,
              });

            docs.MembersId.remove(Member.id);
            channel.permissionOverwrites.edit(Member.id, {
              SEND_MESSAGE: false,
              VIEW_CHANNEL: false,
              READ_MESSAGE_HISTORY: false,
            });

            interaction.reply({
              embeds: [
                Embed.setColor("GREEN").setDescription(
                  `✅ | ${Member} has been removed from the ticket.`
                ),
              ],
            });

            docs.save();
          }
        );
      }
    }
  },
};
