const { CommandInteraction, MessageEmbed, Client } = require("discord.js");
const UserDB = require("../../Structures/Schemas/UserLevelling");

module.exports = {
  name: "transfer",
  description: "Transfer your money to your friend.",
  options: [
    {
      name: "user",
      description: "Your friend's username",
      type: "USER",
      required: true,
    },
    {
      name: "amount",
      description: "Amount of money that you want to transfer",
      type: "INTEGER",
      required: true,
    },
  ],

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { guild, options, user } = interaction;

    const TargetUser = options.getUser("user");
    const amount = options.getInteger("amount");

    const Embed = new MessageEmbed()
      .setAuthor({
        name: `Bank Rotten Oil`,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      })
      .setTitle("Transaction Success")
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor("GREEN");

    const Player = await UserDB.findOne({
      UserId: user.id,
      GuildId: guild.id,
    });

    if (!Player) {
      await UserDB.create({
        UserId: user.id,
        GuildId: guild.id,
        Experience: 0,
        Level: 0,
        Coin: 0,
        PPMeasure: 0,
        IsPremium: false,
      });

      return interaction.reply({
        embeds: [
          Embed.setDescription("You have 0 money on your account.")
            .setTitle("Transaction Failed")
            .setColor("RED"),
        ],
      });
    }

    if (amount <= 0 || Player.Coin <= amount) {
      return interaction.reply({
        embeds: [
          Embed.setDescription(
            "You have not enough money on your account / you have entered 0 or less money for transfer."
          )
            .setTitle("Transaction Failed")
            .setColor("RED"),
        ],
      });
    }

    const Target = await UserDB.findOne({
      UserId: TargetUser.id,
      GuildId: guild.id,
    });

    if (!Target) {
      return interaction.reply({
        embeds: [
          Embed.setDescription("Player doesn't exist / inactive.")
            .setTitle("Transaction Failed")
            .setColor("RED"),
        ],
      });
    }

    Player.Coin -= amount;
    Target.Coin += amount;

    Player.save();
    Target.save();

    return interaction.reply({
      embeds: [
        Embed.addFields(
          { name: "From", value: user.tag, inline: true },
          { name: "To", value: TargetUser.tag, inline: true },
          { name: "Amount", value: amount.toLocaleString(), inline: true }
        ).setFooter({
          text: `${
            user.id === TargetUser.id
              ? "Thank you for wasting our time. 🙄"
              : "Thank you for using our service 🙏"
          }`,
        }),
      ],
    });
  },
};
