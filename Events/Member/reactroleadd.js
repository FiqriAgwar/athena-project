const { MessageReaction, User } = require("discord.js");
const DBReact = require("../../Structures/Schemas/RoleSetup");

module.exports = {
  name: "messageReactionAdd",

  /**
   *
   * @param {MessageReaction} reaction
   * @param {User} user
   */
  async execute(reaction, user) {
    if (reaction.message.partial) {
      try {
        await reaction.message.fetch();
      } catch (err) {
        console.log(err);
        return;
      }
    }

    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (err) {
        console.log(err);
        return;
      }
    }

    if (user.bot) return;
    if (!reaction.message.guild) return;

    const roleDB = await DBReact.findOne({ MessageId: reaction.message.id });
    if (!roleDB) return;

    const roles = roleDB.Roles;

    roles.forEach(async (role) => {
      if (role.Emoji == `<:${reaction.emoji.identifier}>`) {
        const roleAdd = reaction.message.guild.roles.cache.find(
          (r) => r.id === role.RoleId
        );
        const member = reaction.message.guild.members.cache.get(user.id);

        await member.roles.add(roleAdd);
      }
    });
  },
};
