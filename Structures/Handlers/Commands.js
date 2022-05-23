const { Perms } = require("../Validation/Permissions");
const { Client } = require("discord.js");
const Cron = require("node-cron");

/**
 * @param {Client} client
 */
module.exports = async (client, PG, Ascii) => {
  const Table = new Ascii("Commands");

  CommandsArray = [];

  (await PG(`${process.cwd()}/Commands/*/*.js`)).map(async (file) => {
    const command = require(file);

    if (!command.name) {
      return Table.addRow(file.split("/")[5], "🔸 FAILED", "Missing a name.");
    }

    if (!command.context && !command.description) {
      return Table.addRow(command.name, "🔸 FAILED", "Missing a description.");
    }

    if (command.permission) {
      if (Perms.includes(command.permission)) {
        command.defaultPermission = false;
      } else {
        return Table.addRow(
          command.name,
          "🔸 FAILED",
          "Permission is invalid."
        );
      }
    }

    client.commands.set(command.name, command);
    CommandsArray.push(command);

    await Table.addRow(command.name, "💚 OK");
  });

  console.log(Table.toString());

  //-------- PERMISSION CHECK -----------//
  client.on("ready", async () => {
    client.application.commands.set([]);

    let AssignTask = Cron.schedule("* */3 * * *", async () => {
      client.guilds.cache.forEach((g) => {
        g.commands.set(CommandsArray);
      });
    });

    AssignTask.start();
  });

  client.on("guildCreate", async (guild) => {
    guild.commands.set(CommandsArray);
  });
};
