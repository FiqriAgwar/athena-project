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
        name: `New transaction has been recorded`,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      })
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor("RANDOM");

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
            .setAuthor({
              name: `Transaction failed.`,
              iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
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
            .setAuthor({
              name: `Transaction failed.`,
              iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
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
            .setAuthor({
              name: `Transaction failed.`,
              iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
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
        ),
      ],
    });
  },
};
