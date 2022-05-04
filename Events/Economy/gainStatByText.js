const { Message, MessageEmbed, Client } = require("discord.js");
const UserDB = require("../../Structures/Schemas/UserLevelling");
const LoggerChannel = process.env.LEVELLOGGER;

module.exports = {
  name: "messageCreate",

  /**
   *
   * @param {Message} message
   * @param {Client} client
   */
  async execute(message, client) {
    if (!message.author) return;
    if (message.author.bot) return;

    const { author, guild, content, stickers, attachments } = message;
    let words = content.split(" ");

    let Exp = 0;
    Exp += words.length; //text message
    Exp += stickers.size; //sticker
    Exp += attachments.size; //pic, vid, etc.

    const coin = Exp * 10 + Math.ceil(Math.random() * 10);

    const Player = await UserDB.findOne({
      UserId: author.id,
      GuildId: guild.id,
    });
    const channel = await client.channels.cache.get(LoggerChannel);

    if (!Player) {
      let startLevel = 0; //start variable for new user
      let displayExp = Exp;
      let neededExp = 1;
      while (displayExp >= neededExp) {
        startLevel += 1;
        displayExp -= neededExp;
        neededExp = startLevel * 10 + (startLevel === 0 ? 1 : 0);
      }

      await UserDB.create({
        UserId: author.id,
        GuildId: guild.id,
        Experience: Exp,
        Level: startLevel,
        Coin: coin,
        PPMeasure: 1,
        IsPremium: false,
        Message: 1,
        WordCount: words.length,
        StickerCount: stickers.size,
        AttachmentCount: attachments.size,
      });

      if (!channel) return;

      const NewPlayerEmbed = new MessageEmbed()
        .setAuthor({
          name: "New Player has been registered",
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
        })
        .setTitle("Text Channel Activation")
        .setColor("AQUA")
        .setThumbnail(author.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: `Username`, value: author.tag, inline: true },
          { name: `ID`, value: author.id, inline: true },
          {
            name: `Guild`,
            value: `${guild.name}\n${guild.id}`,
            inline: true,
          },
          { name: `Level`, value: startLevel.toString(), inline: true },
          { name: `Exp.`, value: `${displayExp} / ${neededExp}`, inline: true },
          { name: `Money`, value: `💰 ${coin}`, inline: true }
        );

      await channel.send({ embeds: [NewPlayerEmbed] });
    } else {
      Player.Message += 1;
      Player.WordCount += words.length;
      Player.StickerCount += stickers.size;
      Player.AttachmentCount += attachments.size;

      Player.Experience += Exp;
      Player.Coin += Math.floor(coin * (Player.IsPremium ? 1 : 1.5));

      let nextXP = ((Player.Level * (Player.Level + 1)) / 2) * 10 + 1;
      let levelUp = 0;

      while (Player.Experience >= nextXP) {
        Player.Level += 1;
        nextXP = ((Player.Level * (Player.Level + 1)) / 2) * 10 + 1;
        levelUp += 1;
      }

      const neededXP = Player.Level * 10;
      const currentXP = neededXP - (nextXP - Player.Experience);

      await Player.save();

      if (levelUp > 0) {
        const LevelUpEmbed = new MessageEmbed()
          .setAuthor({
            name: `Player has been leveled up by ${levelUp}`,
            iconURL: client.user.displayAvatarURL({ dynamic: true }),
          })
          .setTitle("Text Channel Level Up")
          .setColor("GREEN")
          .setThumbnail(author.displayAvatarURL({ dynamic: true }))
          .addFields(
            { name: `Username`, value: author.tag, inline: true },
            { name: `ID`, value: author.id, inline: true },
            {
              name: `Guild`,
              value: `${guild.name}\n${guild.id}`,
              inline: true,
            },
            { name: `Current Level`, value: `${Player.Level}`, inline: true },
            {
              name: `Exp.`,
              value: `${currentXP} / ${neededXP}`,
              inline: true,
            },
            { name: `Money`, value: `${Player.Coin}`, inline: true }
          );

        await channel.send({ embeds: [LevelUpEmbed] });
      }
    }
  },
};
