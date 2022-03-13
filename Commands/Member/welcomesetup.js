const { CommandInteraction, MessageEmbed } = require("discord.js");

const DB = require("../../Structures/Schemas/WelcomeSetup");

module.exports = {
  name: "welcomesetup",
  description: "Setup your welcoming party to a new member.",
  permission: "ADMINISTRATOR",
  options: [
    {
      name: "channel",
      description: "Select the welcoming message creation channel.",
      required: true,
      type: "CHANNEL",
      channel: ["GUILD_TEXT"],
    },
  ],

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, options } = interaction;

    try {
      const Channel = options.getChannel("channel");

      await DB.findOneAndUpdate(
        { GuildId: guild.id },
        {
          ChannelId: Channel.id,
        },
        {
          new: true,
          upsert: true,
        }
      );

      interaction.reply({
        content: "Welcoming channel is set.",
        ephemeral: true,
      });
    } catch (err) {
      const errEmbed = new MessageEmbed().setColor("RED").setDescription(`
      ⛔ | An error has been occured while setting up the logging system.\n
      **Make sure to:**\n
      1. Make sure your channel is a text channel.\n
      2. Make sure it's a valid channel.\n
      `);

      interaction.reply({ embeds: [errEmbed] });
    }
  },
};
