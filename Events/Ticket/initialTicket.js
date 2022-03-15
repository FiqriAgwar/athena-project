const {
  ButtonInteraction,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");

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

    const { guild, member, customId } = interaction;

    const Data = await DBsetup.findOne({ GuildId: guild.id });
    if (!Data) return;

    if (!Data.Buttons.includes(customId)) return;

    const ID = Math.floor(Math.random() * 1e16) + 1;

    await guild.channels
      .create(`${member.user.username}-${member.user.discriminator}`, {
        type: "GUILD_TEXT",
        parent: Data.Category,
        permissionOverwrites: [
          {
            id: member.id,
            allow: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
          },
          {
            id: Data.GuildId,
            deny: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
          },
          {
            id: Data.Handlers,
            allow: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
          },
        ],
      })
      .then(async (channel) => {
        await DB.create({
          GuildId: guild.id,
          MembersId: member.id,
          TicketId: ID,
          ChannelId: channel.id,
          Closed: false,
          Locked: false,
          Type: customId,
          Claimed: false,
        });

        const Embed = new MessageEmbed()
          .setAuthor({ name: `${guild.name} | Ticket : ${ID}` })
          .setDescription(
            "Please wait while we are connecting you with our staff (well, it's me alone btw). You can describe the problem in details while you waiting."
          )
          .setFooter({
            text: "The buttons below are only available for staff.",
          });

        const Buttons = new MessageActionRow();
        Buttons.addComponents(
          new MessageButton()
            .setCustomId("close-ticket")
            .setLabel("Save & Close Ticket")
            .setStyle("PRIMARY")
            .setEmoji("💾"),
          new MessageButton()
            .setCustomId("lock-ticket")
            .setLabel("Lock")
            .setStyle("SECONDARY")
            .setEmoji("🔒"),
          new MessageButton()
            .setCustomId("unlock-ticket")
            .setLabel("Unlock")
            .setStyle("SUCCESS")
            .setEmoji("🔓"),
          new MessageButton()
            .setCustomId("claim-ticket")
            .setLabel("Claim")
            .setStyle("PRIMARY")
            .setEmoji("🥡")
        );

        channel.send({
          embeds: [Embed],
          components: [Buttons],
        });

        await channel
          .send({ content: `${member} here is your ticket.` })
          .then((msg) => {
            setTimeout(() => {
              msg.delete().catch(() => {});
            }, 3000);
          });

        interaction.reply({
          content: `${member} your ticket has been created in ${channel}`,
          ephemeral: true,
        });
      });
  },
};
