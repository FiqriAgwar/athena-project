const { model, Schema } = require("mongoose");

module.exports = model(
  "LoggerSetup",
  new Schema({
    GuildId: String,
    ChannelId: String,
  })
);
