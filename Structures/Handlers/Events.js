const { Events } = require("../Validation/EventNames");
const { Client } = require("discord.js");

/**
 *
 * @param {Client} client
 */
module.exports = async (client, PG, Ascii) => {
  const Table = new Ascii("Events");

  (await PG(`${process.cwd()}/Events/*/*.js`)).map(async (file) => {
    const event = require(file);

    if (event.name) {
      if (!Events.includes(event.name))
        return Table.addRow(
          file.split("/")[5],
          "Event name is missing.",
          "🔸 FAILED"
        );
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }

    if (event.name) {
      await Table.addRow(file.split("/")[5], event.name, "💚 OK");
    } else {
      await Table.addRow(
        file.split("/")[5],
        "Event name is undefined",
        "💚 OK"
      );
    }
  });

  console.log(Table.toString());
};
