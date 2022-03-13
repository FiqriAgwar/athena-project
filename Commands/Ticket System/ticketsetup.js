const {
  CommandInteraction,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");

const DB = require("../../Structures/Schemas/TicketSetup");

module.exports = {
  name: "ticketsetup",
  description: "Setup your ticketing message.",
  permission: "ADMINISTRATOR",
  options: [
    {
      name: "channel",
      description: "Select the ticket creation channel.",
      required: true,
      type: "CHANNEL",
      channel: ["GUILD_TEXT"],
    },
    {
      name: "category",
      description: "Select the ticket channel's creation category.",
      required: true,
      type: "CHANNEL",
      channel: ["GUILD_CATEGORY"],
    },
    {
      name: "transcripts",
      description: "Select the transcripts creation channel.",
      required: true,
      type: "CHANNEL",
      channel: ["GUILD_TEXT"],
    },
    {
      name: "handlers",
      description: "Select the ticket handler's role.",
      required: true,
      type: "ROLE",
    },
    {
      name: "description",
      description: "Set the description of the ticket creation channel.",
      required: true,
      type: "STRING",
    },
    {
      name: "button1",
      description:
        "Give your first button a name and add an emoji by adding a comma followed by the emoji.",
      required: true,
      type: "STRING",
    },
    {
      name: "button2",
      description:
        "Give your second button a name and add an emoji by adding a comma followed by the emoji.",
      required: true,
      type: "STRING",
    },
    {
      name: "button3",
      description:
        "Give your third button a name and add an emoji by adding a comma followed by the emoji.",
      required: true,
      type: "STRING",
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
      const Category = options.getChannel("category");
      const Transcripts = options.getChannel("transcripts");
      const Handlers = options.getRole("handlers");

      const Description = options.getString("description");
      const Button1 = options.getString("button1").split(",");
      const Button2 = options.getString("button2").split(",");
      const Button3 = options.getString("button3").split(",");

      const Emoji1 = Button1[1];
      const Emoji2 = Button2[1];
      const Emoji3 = Button3[1];

      await DB.findOneAndUpdate(
        { GuildId: guild.id },
        {
          Channel: Channel.id,
          Category: Category.id,
          Transcripts: Transcripts.id,
          Handlers: Handlers.id,
          Description: Description.id,
          Buttons: [Button1[0], Button2[0], Button3[0]],
        },
        {
          new: true,
          upsert: true,
        }
      );

      const Buttons = new MessageActionRow();
      Buttons.addComponents(
        new MessageButton()
          .setCustomId(Button1[0])
          .setLabel(Button1[0])
          .setStyle("PRIMARY")
          .setEmoji(Emoji1),
        new MessageButton()
          .setCustomId(Button2[0])
          .setLabel(Button2[0])
          .setStyle("SECONDARY")
          .setEmoji(Emoji2),
        new MessageButton()
          .setCustomId(Button3[0])
          .setLabel(Button3[0])
          .setStyle("SUCCESS")
          .setEmoji(Emoji3)
      );

      const Embed = new MessageEmbed()
        .setColor("DARK_RED")
        .setAuthor({
          name: `${guild.name} | Ticket`,
          iconURL: guild.iconURL({ dynamic: true }),
        })
        .setDescription(Description);

      await guild.channels.cache
        .get(Channel.id)
        .send({ embeds: [Embed], components: [Buttons] });

      interaction.reply({
        content: "Ticket initiation has been done.",
        ephemeral: true,
      });
    } catch (err) {
      const errEmbed = new MessageEmbed().setColor("RED").setDescription(`
      ⛔ | An error has been occured while setting up the ticket system.\n
      **Make sure to:**\n
      1. Make sure none of your buttons' name are duplicated.\n
      2. Make sure you use this format for your buttons. => Name,Emoji\n
      3. Make sure your button names do not exceed 200 characters.\n
      4. Make sure your button emojis, are actually emojis, not ids.
      `);

      interaction.reply({ embeds: [errEmbed] });
    }
  },
};
