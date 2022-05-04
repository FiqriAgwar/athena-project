const { model, Schema } = require("mongoose");

module.exports = model(
  "Transactions",
  new Schema({
    GuildId: String,
    FromId: String,
    ToId: String,
    Amount: Number,
  })
);
