const { CommandInteraction, MessageEmbed, Client } = require("discord.js");
const UserDB = require("../../Structures/Schemas/UserLevelling");

module.exports = {
  name: "rank",
  description: "Know your or your friend's rank and coin",
  options: [
    {
      name: "user",
      description: "Your friend's username (optional)",
      type: "USER",
    },
  ],

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { guild, options, user } = interaction;

    const TargetUser = options.getUser("user") ? options.getUser("user") : user;

    const Embed = new MessageEmbed()
      .setAuthor({
        name: `${TargetUser.tag}'s Information`,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      })
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor("RANDOM");

    const Player = await UserDB.findOne({
      UserId: TargetUser.id,
      GuildId: guild.id,
    });

    if (!Player)
      return interaction.reply({
        embeds: [
          Embed.setDescription(
            "There is no info about this player in this server."
          ),
        ],
      });

    const nextXP = ((Player.Level * (Player.Level + 1)) / 2) * 10 + 1;
    const neededXP = Player.Level * 10;
    const currentXP = neededXP - (nextXP - Player.Experience);

    let PPUnit = [
      "nanometer",
      "micrometer",
      "millimeter",
      "meter",
      "kilometer",
    ];
    let PPIndex = 2;
    let PPLength = Player.PPMeasure;

    while (PPLength / 1000 > 1 && PPIndex < PPUnit.length) {
      PPIndex += 1;
      PPLength /= 1000;
    }

    while (PPLength * 1000 < 1000 && PPIndex > 0) {
      PPIndex -= 1;
      PPLength *= 1000;
    }

    Embed.addFields(
      { name: "🥇 Level", value: `\`${Player.Level}\``, inline: true },
      {
        name: "✨ Exp.",
        value: `\`${currentXP} / ${neededXP}\``,
        inline: true,
      },
      { name: "💰 Coin", value: `\`${Player.Coin}\``, inline: true },
      {
        name: "🙈 PP Length",
        value: `\`${PPLength} ${PPUnit[PPIndex]}\``,
        inline: true,
      },
      {
        name: "💎 Premium User?",
        value: `\`${Player.IsPremium ? "YES" : "NO"}\``,
        inline: true,
      }
    ).setColor(Player.IsPremium ? "GOLD" : "WHITE");

    return interaction.reply({ embeds: [Embed] });
  },
};
