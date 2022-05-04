const { model, Schema } = require("mongoose");

module.exports = model(
  "ScheduledAnnounce",
  new Schema({
    Schedule: { type: Date, required: true },
    Content: String,
    Title: String,
  })
);
