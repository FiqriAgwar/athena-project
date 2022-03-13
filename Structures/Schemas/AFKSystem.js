const { model, Schema } = require("mongoose");

module.exports = model(
  "AFK",
  new Schema({
    GuildId: String,
    UserId: String,
    Status: String,
    Time: String,
  })
);
