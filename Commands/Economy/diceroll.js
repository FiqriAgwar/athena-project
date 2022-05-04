const { CommandInteraction, MessageEmbed, Client } = require("discord.js");
const UserDB = require("../../Structures/Schemas/UserLevelling");
const GambleDB = require("../../Structures/Schemas/GamblingResult");

module.exports = {
  name: "diceroll",
  description:
    "Roll a die, 1-3 will make you lose money, 4-6 will make you gain money. 1 is worst and 6 is best.",
  options: [
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
    const bet = options.getInteger("bet");

    const resArr = [1, 0.5, 0.1, 0.1, 0.5, 1];

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

        const result = Math.floor(Math.random() * 6) + 1;
        const actualRes = bet * resArr[result - 1];
        const diffWin = Math.floor(actualRes);
        const diffLose = Math.ceil(actualRes);

        const ResultEmbed = new MessageEmbed().setAuthor({
          name: `${user.tag} has rolled a die.`,
          iconUrl: user.displayAvatarURL({ dynamic: true }),
        });

        let gamblingResult = await GambleDB.findOne({
          UserId: user.id,
          GuildId: guild.id,
          Type: "Diceroll",
        });

        if (!gamblingResult) {
          gamblingResult = await GambleDB.create({
            UserId: user.id,
            GuildId: guild.id,
            Type: "Diceroll",
            Winstreak: 0,
            Logs: [],
          });
        }

        if (result > 3) {
          player.Coin += Math.floor(diffWin);
          gamblingResult.Winstreak += 1;

          const resPush = {
            Result: `win - ${result} (${resArr[result - 1]})`,
            Bet: bet,
          };
          gamblingResult.Logs.push(resPush);

          ResultEmbed.setTitle(
            `The result is ${result}. You win 💰 ${Math.ceil(
              bet * resArr[result - 1]
            )}`
          )
            .setColor("GREEN")
            .setDescription(`Win streak: ${gamblingResult.Winstreak}`);

          if (actualRes % 1 > 0) {
            ResultEmbed.setFooter({
              text: `The extra ${
                actualRes % 1
              } will be donated to **Anti Gambling, Wagering And Ranting** Foundation.`,
            });
          }
        } else {
          player.Coin -= diffLose;
          gamblingResult.Winstreak = 0;

          const resPush = {
            Result: `lose - ${result} (${resArr[result - 1]})`,
            Bet: bet,
          };
          gamblingResult.Logs.push(resPush);

          ResultEmbed.setTitle(
            `The result is ${result}. You lost 💰 ${diffLose}`
          )
            .setColor("RED")
            .setDescription(`Win streak: ${gamblingResult.Winstreak}`);

          if (actualRes % 1 > 0) {
            ResultEmbed.setFooter({
              text: `Extra charge with amount of ${
                diffLose - (actualRes % 1)
              } will be donated to **Anti Gambling, Wagering And Ranting** Foundation.`,
            });
          }
        }

        player.save();
        gamblingResult.save();

        interaction.reply({ embeds: [ResultEmbed] });
      }
    );
  },
};
