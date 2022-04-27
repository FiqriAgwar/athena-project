const { CommandInteraction, MessageEmbed, Client } = require("discord.js");
const ms = require("ms");
const UserDB = require("../../Structures/Schemas/UserLevelling");

module.exports = {
  name: "leaderboard",
  description: "Leaderboard of this server, based on EXP, Coin or even more.",
  options: [
    {
      name: "type",
      description: "The type of leaderboard that you want to see.",
      type: "STRING",
      required: true,
      choices: [
        {
          name: "Experience",
          value: "xp",
        },
        {
          name: "Coins",
          value: "coin",
        },
        {
          name: "PP Length",
          value: "ppl",
        },
        {
          name: "Message Sent",
          value: "msg",
        },
        {
          name: "Voice Activity",
          value: "va",
        },
      ],
    },
  ],

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { guild, options, user } = interaction;

    const type = options.getString("type");

    const Embed = new MessageEmbed()
      .setAuthor({
        name: `${guild.name}'s Leaderboard`,
        iconURL: guild.iconURL({ dynamic: true }),
      })
      .setColor("RANDOM");

    let rank = [];
    let valuelist = [];
    let userlist = [];
    let valueUnit = "";

    switch (type) {
      case "xp":
        {
          valueUnit = "Experience";
          Embed.setColor("BLUE");

          const Players = await UserDB.find({ GuildId: guild.id })
            .sort({ Experience: -1 })
            .limit(10);

          if (!Players)
            return interaction.reply({
              embeds: [
                Embed.setDescription("There is no player in this server."),
              ],
            });

          Players.forEach((Player) => {
            rank.push(rank.length + 1);
            userlist.push(`<@${Player.UserId}>`);
          });

          Players.forEach((Player) => {
            const nextXP = ((Player.Level * (Player.Level + 1)) / 2) * 10 + 1;
            const neededXP = Player.Level * 10;
            const currentXP = neededXP - (nextXP - Player.Experience);

            valuelist.push(
              `\`Level ${Player.Level.toString()} (${currentXP.toString()} / ${neededXP.toString()})\``
            );
          });
        }
        break;
      case "coin":
        {
          valueUnit = "Coin";
          Embed.setColor("GOLD");

          const Players = await UserDB.find({ GuildId: guild.id })
            .sort({ Coin: -1 })
            .limit(10);

          if (!Players)
            return interaction.reply({
              embeds: [
                Embed.setDescription("There is no player in this server."),
              ],
            });

          Players.forEach((Player) => {
            rank.push(rank.length + 1);
            userlist.push(`<@${Player.UserId}>`);
          });

          Players.forEach((Player) => {
            valuelist.push(`\`${Player.Coin.toString()}\``);
          });
        }
        break;

      case "ppl":
        {
          valueUnit = "Length";
          Embed.setColor("DARK_VIVID_PINK");

          const Players = await UserDB.find({ GuildId: guild.id })
            .sort({ Coin: -1 })
            .limit(10);

          if (!Players)
            return interaction.reply({
              embeds: [
                Embed.setDescription("There is no player in this server."),
              ],
            });

          Players.forEach((Player) => {
            rank.push(rank.length + 1);
            userlist.push(`<@${Player.UserId}>`);
          });

          Players.forEach((Player) => {
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
            valuelist.push(`\`${PPLength} ${PPUnit[PPIndex]}\``);
          });
        }
        break;
      case "msg":
        {
          valueUnit = "Words Sent (Message Sent)";
          Embed.setColor("DARK_GREEN");

          const Players = await UserDB.find({ GuildId: guild.id })
            .sort({ WordCount: -1 })
            .limit(10);

          if (!Players)
            return interaction.reply({
              embeds: [
                Embed.setDescription("There is no player in this server."),
              ],
            });

          Players.forEach((Player) => {
            rank.push(rank.length + 1);
            userlist.push(`<@${Player.UserId}>`);
          });

          Players.forEach((Player) => {
            valuelist.push(
              `\`${Player.WordCount.toString()} (${Player.Message.toString()})\``
            );
          });
        }
        break;
      case "va": {
        valueUnit = "Time Spent";
        Embed.setColor("DARK_RED");

        const Players = await UserDB.find({ GuildId: guild.id })
          .sort({ Time: -1 })
          .limit(10);

        if (!Players)
          return interaction.reply({
            embeds: [
              Embed.setDescription("There is no player in this server."),
            ],
          });

        Players.forEach((Player) => {
          rank.push(rank.length + 1);
          userlist.push(`<@${Player.UserId}>`);
        });

        Players.forEach((Player) => {
          let time = Player.Time;
          let timeValue = "";

          if (Math.floor(time / 86400000) > 0) {
            timeValue += `${Math.floor(time / 86400000)} day${
              time / 86400000 >= 2 ? "s " : " "
            }`;

            time %= 86400000;
          }

          if (Math.floor(time / 3600000) > 0) {
            timeValue += `${Math.floor(time / 3600000)} hour${
              time / 3600000 >= 2 ? "s " : " "
            }`;

            time %= 3600000;
          }

          if (Math.floor(time / 60000) > 0) {
            timeValue += `${Math.floor(time / 60000)} minute${
              time / 60000 >= 2 ? "s " : " "
            }`;

            time %= 60000;
          }

          if (Math.floor(time / 1000) > 0) {
            timeValue += `${Math.floor(time / 1000)} second${
              time / 1000 >= 2 ? "s " : " "
            }`;

            time %= 1000;
          }

          timeValue += `${time} ms`;
          valuelist.push(`\`${timeValue}\``);
        });
      }
    }

    Embed.addFields(
      { name: "#", value: `${rank.join("\n")}`, inline: true },
      { name: "User", value: `${userlist.join("\n")}`, inline: true },
      { name: valueUnit, value: `${valuelist.join("\n")}`, inline: true }
    );

    return interaction.reply({ embeds: [Embed] });
  },
};
