const { Client } = require("discord.js");

/**
 *
 * @param {Client} client
 */
module.exports = async (client, PG, Ascii) => {
  const Table = new Ascii("Buttons");

  const buttonFolder = await PG(`${process.cwd()}/Buttons/*/*.js`);

  buttonFolder.map(async (file) => {
    const buttonFile = require(file);
    if (!buttonFile.id) {
      return;
    }

    client.buttons.set(buttonFile.id, buttonFile);
    Table.addRow(buttonFile.id, "🔃 LOADED");
  });

  console.log(Table.toString());
};
