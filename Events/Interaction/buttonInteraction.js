const { ButtonInteraction, Client } = require("discord.js");

module.exports = {
  name: "interactionCreate",

  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   */
  execute(interaction, client) {
    if (!interaction.isButton()) return;

    const Button = client.buttons.get(interaction.customId);

    if (!Button) return;

    if (
      Button.permission &&
      !interaction.member.permissions.has(Button.permission)
    ) {
      return interaction.reply({
        content: `You are not permitted to use this button`,
        ephemeral: true,
      });
    }

    if (
      Button.ownerOnly &&
      interaction.member.id != interaction.guild.ownerId
    ) {
      return interaction.reply({
        content: `You are not the owner of this server.`,
        ephemeral: true,
      });
    }

    Button.execute(interaction, client);
  },
};
