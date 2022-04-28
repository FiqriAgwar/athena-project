const { model, Schema } = require("mongoose");

module.exports = model(
  "GamblingResult",
  new Schema({
    UserId: String,
    GuildId: String,
    Type: { type: String, enum: ["Coinflip", "Diceroll"] },
    Winstreak: { type: Number, default: 0 },
    Logs: [
      {
        Result: String,
        Bet: Number,
      },
    ],
  })
);
