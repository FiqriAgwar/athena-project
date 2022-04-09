const { model, Schema } = require("mongoose");

module.exports = model(
  "RoleSetup",
  new Schema({
    ChannelId: String,
    MessageId: String,
    Roles: [
      {
        RoleId: String,
        Emoji: String,
      },
    ],
  })
);
