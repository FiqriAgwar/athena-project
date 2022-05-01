const { Client, MessageEmbed } = require("discord.js");
const mongoose = require("mongoose");
const Database = process.env.DATABASE;
const AnnDB = require("../../Structures/Schemas/ScheduledAnnounce");
const Schedule = require("node-schedule");
const { schedule } = require("node-cron");
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
      .then(async () => {
        console.log("The client is now connected to database.");
        const announcement = await AnnDB.find({
          Schedule: { $gte: Date.now() },
        });

        announcement.forEach((ann) => {
          try {
            Schedule.scheduleJob(ann.Schedule, async () => {
              client.guilds.cache.forEach((g) => {
                if (!g.systemChannel) return;

                g.systemChannel.send({
                  embeds: [
                    new MessageEmbed()
                      .setAuthor({
                        name: "Announcement from Pantheon",
                        iconURL: client.user.displayAvatarURL({
                          dynamic: true,
                        }),
                      })
                      .setTitle(ann.Title)
                      .setDescription(ann.Content),
                  ],
                });
              });

              ann.delete();
            });

            console.log("All announcement has been set.");
          } catch (err) {
            console.log(err);
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
  },
};
