const { ButtonInteraction, MessageEmbed } = require("discord.js");
const { createTranscript } = require("discord-html-transcripts");

const DB = require("../../Structures/Schemas/Ticket");
const DBsetup = require("../../Structures/Schemas/TicketSetup");

module.exports = {
  name: "interactionCreate",

  /**
   *
   * @param {ButtonInteraction} interaction
   */
  async execute(interaction) {
    if (!interaction.isButton()) return;
    const { guild, customId, channel, member } = interaction;

    if (
      ![
        "close-ticket",
        "lock-ticket",
        "unlock-ticket",
        "claim-ticket",
      ].includes(customId)
    )
      return;

    const TicketSetup = await DBsetup.findOne({ GuildId: guild.id });
    if (!TicketSetup)
      return interaction.reply({
        content: `The data for this system is outdated.`,
      });

    if (
      !member.roles.cache.find((role) => {
        console.log(
          role.id,
          TicketSetup.Handlers,
          role.id == TicketSetup.Handlers
        );
        role.id == TicketSetup.Handlers;
      })
    ) {
      return interaction.reply({
        content: "You can't use this button.",
        ephermal: true,
      });
    }

    const Embed = new MessageEmbed().setColor("DARK_BLUE");

    DB.findOne({ ChannelId: channel.id }, async (err, data) => {
      if (err) throw err;
      if (!data)
        return channel.send({
          content:
            "No data was found related to this ticket. Please delete this channel manually.",
          ephermal: true,
        });

      switch (customId) {
        case "lock-ticket": {
          if (data.Locked) {
            return channel.send({
              content: "The ticket is already locked.",
              ephermal: true,
            });
          }

          await DB.updateOne({ ChannelId: channel.id }, { Locked: true });
          Embed.setDescription("🔒 | This ticket is locked for reviewing.");

          data.MembersId.forEach((mem) => {
            channel.permissionOverwrites.edit(mem, {
              SEND_MESSAGES: false,
            });
          });

          return channel.send({ embeds: [Embed] });
        }

        case "unlock-ticket": {
          if (!data.Locked) {
            return channel.send({
              content: "The ticket is already unlocked.",
              ephermal: true,
            });
          }

          await DB.updateOne({ ChannelId: channel.id }, { Locked: false });
          Embed.setDescription("🔓 | This ticket is unlocked.");
          data.MembersId.forEach((mem) => {
            channel.permissionOverwrites.edit(mem, {
              SEND_MESSAGES: true,
            });
          });

          return channel.send({ embeds: [Embed] });
        }

        case "close-ticket": {
          if (data.Closed) {
            return channel.send({
              content:
                "The ticket is already closed. Please wait for a moment until it is deleted.",
              ephermal: true,
            });
          }

          const attachment = await createTranscript(channel, {
            limit: -1,
            returnBuffer: false,
            fileName: `${data.TicketId} - ${data.Type}.html`,
          });

          await DB.updateOne({ ChannelId: channel.id }, { Closed: true });

          const Message = await guild.channels.cache
            .get(TicketSetup.Transcripts)
            .send({
              embeds: [
                Embed.setTitle(
                  `Transcript Type: ${data.Type}\nTicket ID: ${data.TicketId}`
                ),
              ],
              files: [attachment],
            });

          interaction.reply({
            embeds: [
              Embed.setDescription(
                `The transcript is now saved [in here](${Message.url})`
              ),
            ],
          });

          setTimeout(() => {
            channel.delete();
          }, 10 * 1000);
          break;
        }

        case "claim-ticket": {
          if (data.Claimed) {
            return interaction.reply({
              content: `This ticket has already claimed by <@${data.ClaimedBy}>`,
              ephermal: true,
            });
          }

          await DB.updateOne(
            { ChannelId: channel.id },
            { Claimed: true, ClaimedBy: member.id }
          );

          Embed.setDescription(
            `🥡 | This ticket is now claimed by : ${member}`
          );
          interaction.reply({ embeds: Embed });

          break;
        }
      }
    });
  },
};
