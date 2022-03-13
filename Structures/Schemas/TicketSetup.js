const { model, Schema } = require("mongoose");

module.exports = model(
  "TicketSetup",
  new Schema({
    GuildId: String,
    Channel: String,
    Category: String,
    Transcripts: String,
    Handlers: String,
    Description: String,
    Buttons: [String],
  })
);
