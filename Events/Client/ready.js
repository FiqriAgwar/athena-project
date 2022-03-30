const { Client } = require("discord.js");
const mongoose = require("mongoose");
const Database = process.env.DATABASE;
// const { Database } = require("../../Structures/config.json");

module.exports = {
  name: "ready",
  once: true,

  /**
   * @param {Client} client
   */
  execute(client) {
    console.log("The client is now ready");
    const version = process.env.NODE_ENV;

    client.user.setActivity(
      `${
        version === "production"
          ? client.guilds.cache.size + " servers"
          : "this idiot ngoding"
      }`,
      {
        type: "WATCHING",
      }
    );

    if (!Database) return;
    mongoose
      .connect(Database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("The client is now connected to database.");
      })
      .catch((err) => {
        console.log(err);
      });
  },
};
