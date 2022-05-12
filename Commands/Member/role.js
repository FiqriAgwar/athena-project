const { CommandInteraction, MessageEmbed } = require("discord.js");

const DB = require("../../Structures/Schemas/RoleSetup");

module.exports = {
  name: "role",
  description: "Setup a reaction role for your server.",
  permission: "MANAGE_ROLES",
  options: [
    {
      name: "setup",
      description: "Set up your reaction role system.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "title",
          description: "Describe the title of the reaction role.",
          required: true,
          type: "STRING",
        },
      ],
    },
    {
      name: "add",
      description: "Add role to one of the reaction role system.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "message-id",
          description: "Fill the message ID of the role system.",
          required: true,
          type: "STRING",
        },
        {
          name: "roles",
          description: "Add the desired role.",
          required: true,
          type: "ROLE",
        },
        {
          name: "emoji",
          description: "Add the emoji of the desired role.",
          required: true,
          type: "STRING",
        },
      ],
    },
  ],

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { channel, options } = interaction;
    const Sub = options.getSubcommand();

    switch (Sub) {
      case "setup": {
        const title = options.getString("title");

        const Message = await channel.send({
          embeds: [
            new MessageEmbed()
              .setAuthor({ name: `${title} Reaction Role` })
              .setDescription("Choose your role by reacting to these emojis!")
              .addField(
                "Available Roles",
                `Use \`/role add\` to add a new role.`
              )
              .setColor("RANDOM"),
          ],
        });

        await DB.create({
          ChannelId: channel.id,
          MessageId: Message.id,
          Roles: [],
        });

        return interaction.reply({
          content: `Reaction role system has been set up.`,
          ephemeral: true,
        });
      }

      case "add": {
        const role = options.getRole("roles");
        const emoji = options.getString("emoji");
        const message = options.getString("message-id");

        const system = await DB.findOne({ MessageId: message });
        if (!system) {
          return interaction.reply({
            content: "No reaction role system found in the message.",
            ephemeral: true,
          });
        }

        for (let i = 0; i < system.Roles.length; i++) {
          if (system.Roles[i].Emoji == emoji) {
            return interaction.reply({
              content: "You can not add the same emoji for different role.",
              ephemeral: true,
            });
          }
        }

        system.Roles.push({
          RoleId: role.id,
          Emoji: emoji,
        });

        system.save(async (err, newSys) => {
          if (err)
            return interaction.reply({
              content: err.toString(),
              ephemeral: true,
            });

          if (newSys) {
            const channel = interaction.guild.channels.cache.get(
              newSys.ChannelId
            );

            const msg = await channel.messages.fetch(message);
            const embed = msg.embeds[0];

            let rolesStr = "";

            if (newSys.Roles.length == 0) {
              rolesStr = `Use \`/role add\` to add a new role.`;
            } else {
              for (let i = 0; i < newSys.Roles.length; i++) {
                rolesStr += `${newSys.Roles[i].Emoji} <@&${newSys.Roles[i].RoleId}>\n`;
              }
            }

            embed.fields = [];
            embed.addField("Available Roles", rolesStr);
            msg.edit({
              embeds: [embed],
            });

            msg.react(`${emoji}`);

            return interaction.reply({
              content: "A new role has been added.",
              ephemeral: true,
            });
          } else {
            return interaction.reply({
              content:
                "There is an error when adding the role.",
              ephemeral: true,
            });
          }
        });
      }
    }
  },
};
