const { model, Schema } = require("mongoose");

module.exports = model(
  "Nickname",
  new Schema({
    GuildId: String,
    UserId: String,
    NickSetterId: String,
    Nickname: String,
  })
);
