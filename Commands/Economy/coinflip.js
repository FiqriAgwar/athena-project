const { CommandInteraction, MessageEmbed, Client } = require("discord.js");
const UserDB = require("../../Structures/Schemas/UserLevelling");
const GambleDB = require("../../Structures/Schemas/GamblingResult");

module.exports = {
  name: "coinflip",
  description:
    "Flip a coin, call head or tail and let's see if you're the winner.",
  options: [
    {
      name: "choice",
      description: "Head or Tail",
      required: true,
      type: "STRING",
      choices: [
        { name: "Head", value: "Head" },
        { name: "Tail", value: "Tail" },
      ],
    },
    {
      name: "bet",
      description: "Wager your bet",
      required: true,
      type: "INTEGER",
    },
  ],

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, guild, user, member } = interaction;

    const choice = options.getString("choice");
    const bet = options.getInteger("bet");

    if (bet <= 0) {
      return interaction.reply({
        content: `Please input your bet more than 0`,
        ephemeral: true,
      });
    }

    UserDB.findOne(
      { UserId: user.id, GuildId: guild.id },
      async (err, player) => {
        if (err) console.log(err);

        if (!player) {
          return interaction.reply({
            content: `Your account in this guild has not been registered.\nPlease join a chat or a voice channel to start your journey.`,
            ephemeral: true,
          });
        }

        if (player.Coin < bet) {
          return interaction.reply({
            content: `Your coin (💰 ${player.Coin}) is not enough to bet with 💰 ${bet}`,
            ephemeral: true,
          });
        }

        const result = Math.floor(Math.random() * 100) + 1;

        const ResultEmbed = new MessageEmbed().setAuthor({
          name: `${user.tag} has flipped a coin.`,
          iconUrl: user.displayAvatarURL({ dynamic: true }),
        });

        let gamblingResult = await GambleDB.findOne({
          UserId: user.id,
          GuildId: guild.id,
          Type: "Coinflip",
        });

        if (!gamblingResult) {
          gamblingResult = await GambleDB.create({
            UserId: user.id,
            GuildId: guild.id,
            Type: "Coinflip",
            Winstreak: 0,
            Logs: [],
          });
        }

        if (result > 50) {
          player.Coin += bet;
          gamblingResult.Winstreak += 1;

          const resPush = { Result: "win", Bet: bet };
          gamblingResult.Logs.push(resPush);

          ResultEmbed.setTitle(`The result is ${choice}. You win 💰 ${bet * 2}`)
            .setColor("GREEN")
            .setDescription(`Win streak: ${gamblingResult.Winstreak}`);
        } else {
          player.Coin -= bet;
          gamblingResult.Winstreak = 0;

          const resPush = { Result: "lose", Bet: bet };
          gamblingResult.Logs.push(resPush);

          ResultEmbed.setTitle(
            `The result is ${
              choice === "Head" ? "Tail" : "Head"
            }. You lost 💰 ${bet}`
          )
            .setColor("RED")
            .setDescription(`Win streak: ${gamblingResult.Winstreak}`);
        }

        player.save();
        gamblingResult.save();

        interaction.reply({ embeds: [ResultEmbed] });
      }
    );
  },
};
