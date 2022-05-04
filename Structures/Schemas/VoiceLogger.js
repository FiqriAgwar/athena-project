const { model, Schema } = require("mongoose");

module.exports = model(
  "VoiceTimer",
  new Schema({
    UserId: String,
    GuildId: String,
    StartTime: Number,
  })
);
