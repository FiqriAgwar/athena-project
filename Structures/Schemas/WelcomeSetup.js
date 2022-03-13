const { model, Schema } = require("mongoose");

module.exports = model(
  "WelcomeSetup",
  new Schema({
    GuildId: String,
    ChannelId: String,
  })
);
