const { CommandInteraction, MessageEmbed, Client } = require("discord.js");
const ms = require("ms");

module.exports = {
  name: "giveaway",
  description: "A complete giveaway system.",
  permission: "ADMINISTRATOR",
  options: [
    {
      name: "start",
      description: "Start a giveaway.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "duration",
          description: "Provide a duration for this giveaway (1m, 1h, 1d).",
          type: "STRING",
          required: true,
        },
        {
          name: "winner",
          description: "Select the amount of winners for this giveaway.",
          type: "INTEGER",
          required: true,
        },
        {
          name: "prize",
          description: "Provide the name of the prize.",
          type: "STRING",
          required: true,
        },
        {
          name: "channel",
          description: "Select a channel to send the giveaway to.",
          type: "CHANNEL",
          channelTypes: ["GUILD_TEXT"],
        },
      ],
    },
    {
      name: "actions",
      description: "Options for giveaway.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "options",
          description: "Select an option.",
          type: "STRING",
          required: true,
          choices: [
            {
              name: "END",
              value: "END",
            },
            {
              name: "PAUSE",
              value: "PAUSE",
            },
            {
              name: "UNPAUSE",
              value: "UNPAUSE",
            },
            {
              name: "REROLL",
              value: "REROLL",
            },
            {
              name: "DELETE",
              value: "DELETE",
            },
          ],
        },
        {
          name: "message-id",
          description: "Provide the message id of the giveaway.",
          type: "STRING",
          required: true,
        },
      ],
    },
  ],

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  execute(interaction, client) {
    const { options } = interaction;
    const Sub = options.getSubcommand();

    const errorEmbed = new MessageEmbed().setColor("GREY");

    const successEmbed = new MessageEmbed().setColor("RED");

    switch (Sub) {
      case "start":
        {
          const gChannel = options.getChannel("channel") || interaction.channel;
          const duration = options.getString("duration");
          const winnerCount = options.getInteger("winner");
          const prize = options.getString("prize");
          const hostedBy = interaction.member;

          client.giveawaysManager
            .start(gChannel, {
              duration: ms(duration),
              winnerCount,
              prize,
              hostedBy,
              messages: {
                winMessage: `Congratulations, {winners}! You won **{this.prize}**!`,
              },
            })
            .then(async () => {
              successEmbed.setDescription("Giveaway was successfully started.");
              return interaction.reply({
                embeds: [successEmbed],
                ephemeral: true,
              });
            })
            .catch((err) => {
              errorEmbed.setDescription(`An error has occured.\n\`${err}\``);
              return interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true,
              });
            });
        }
        break;

      case "actions":
        {
          const choice = options.getString("options");
          const messageId = options.getString("message-id");
          const giveaway = client.giveawaysManager.giveaways.find(
            (g) =>
              g.guildId === interaction.guildId && g.messageId === messageId
          );

          if (!giveaway) {
            errorEmbed.setDescription(
              `Unable to find the giveaway with the message id : ${messageId} in this guild.`
            );

            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
          }

          switch (choice) {
            case "END":
              {
                client.giveawaysManager
                  .end(messageId)
                  .then(() => {
                    successEmbed.setDescription(`Giveaway has been ended!`);
                    return interaction.reply({
                      embeds: [successEmbed],
                      ephemeral: true,
                    });
                  })
                  .catch((err) => {
                    errorEmbed.setDescription(
                      `An error has occured.\n\`${err}\``
                    );
                    return interaction.reply({
                      embeds: [errorEmbed],
                      ephemeral: true,
                    });
                  });
              }
              break;
            case "PAUSE":
              {
                client.giveawaysManager
                  .pause(messageId)
                  .then(() => {
                    successEmbed.setDescription(`Giveaway has been paused!`);
                    return interaction.reply({
                      embeds: [successEmbed],
                      ephemeral: true,
                    });
                  })
                  .catch((err) => {
                    errorEmbed.setDescription(
                      `An error has occured.\n\`${err}\``
                    );
                    return interaction.reply({
                      embeds: [errorEmbed],
                      ephemeral: true,
                    });
                  });
              }
              break;
            case "UNPAUSE":
              {
                client.giveawaysManager
                  .end(messageId)
                  .unpause(() => {
                    successEmbed.setDescription(`Giveaway has been unpaused!`);
                    return interaction.reply({
                      embeds: [successEmbed],
                      ephemeral: true,
                    });
                  })
                  .catch((err) => {
                    errorEmbed.setDescription(
                      `An error has occured.\n\`${err}\``
                    );
                    return interaction.reply({
                      embeds: [errorEmbed],
                      ephemeral: true,
                    });
                  });
              }
              break;
            case "REROLL":
              {
                client.giveawaysManager
                  .reroll(messageId)
                  .then(() => {
                    successEmbed.setDescription(
                      `Giveaway winner(s) has been rerolled!`
                    );
                    return interaction.reply({
                      embeds: [successEmbed],
                      ephemeral: true,
                    });
                  })
                  .catch((err) => {
                    errorEmbed.setDescription(
                      `An error has occured.\n\`${err}\``
                    );
                    return interaction.reply({
                      embeds: [errorEmbed],
                      ephemeral: true,
                    });
                  });
              }
              break;
            case "DELETE":
              {
                client.giveawaysManager
                  .delete(messageId)
                  .then(() => {
                    successEmbed.setDescription(`Giveaway has been deleted!`);
                    return interaction.reply({
                      embeds: [successEmbed],
                      ephemeral: true,
                    });
                  })
                  .catch((err) => {
                    errorEmbed.setDescription(
                      `An error has occured.\n\`${err}\``
                    );
                    return interaction.reply({
                      embeds: [errorEmbed],
                      ephemeral: true,
                    });
                  });
              }
              break;
          }
        }
        break;

      default: {
        console.log("Error in giveaway command");
      }
    }
  },
};
