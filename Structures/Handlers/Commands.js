const { Perms } = require("../Validation/Permissions");
const { Client } = require("discord.js");

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
    client.guilds.cache.forEach((g) => {
      // g.commands.set([]);
      client.application.commands.set([]); //DANGEROUS! DON'T TOUCH
      // g.commands.set(CommandsArray).then(async (command) => {
      client.application.commands.set(CommandsArray).then(async (command) => {
        const Roles = (commandName) => {
          const cmdPerms = CommandsArray.find(
            (c) => c.name === commandName
          ).permission;

          if (!cmdPerms) return null;

          return g.roles.cache.filter((r) => r.permissions.has(cmdPerms));
        };

        const fullPermissions = command.reduce((accumulator, r) => {
          const roles = Roles(r.name);

          if (!roles) return accumulator;

          const permissions = roles.reduce((a, r) => {
            return [...a, { id: r.id, type: "ROLE", permission: true }];
          }, []);

          return [...accumulator, { id: r.id, permissions }];
        }, []);

        await g.commands.permissions.set({ fullPermissions });
      });
    });
  });
};
