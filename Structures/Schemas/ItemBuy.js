const { model, Schema } = require("mongoose");

module.exports = model(
  "Purchase",
  new Schema({
    GuildId: String,
    UserId: String,
    Item: String,
  })
);
