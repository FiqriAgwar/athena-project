const { model, Schema } = require("mongoose");

module.exports = model(
  "Tickets",
  new Schema({
    GuildId: String,
    MembersId: [String],
    TicketId: String,
    ChannelId: String,
    Closed: Boolean,
    Locked: Boolean,
    Type: String,
    Claimed: Boolean,
    ClaimedBy: String,
  })
);
