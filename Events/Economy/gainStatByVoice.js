const { Message, MessageEmbed, Client, VoiceState } = require("discord.js");
const ms = require("ms");
const UserDB = require("../../Structures/Schemas/UserLevelling");
const TimerDB = require("../../Structures/Schemas/VoiceLogger");
const LoggerChannel = process.env.LEVELLOGGER;

module.exports = {
  name: "voiceStateUpdate",

  /**
   *
   * @param {VoiceState} oldState
   * @param {VoiceState} newState
   */
  async execute(oldState, newState, client) {
    if (newState.member.user.bot) return;

    const userId = newState.member.id;
    const guildId = newState.guild.id;
    const channel = await client.channels.cache.get(LoggerChannel);
    const oneXPperTime = 30000;

    if (
      newState.channel &&
      !(await TimerDB.findOne({ UserId: userId, guildId: guildId }))
    ) {
      //user join a voice channel
      console.log(
        `${newState.member.user.tag} has joined ${newState.channel.name}.`
      );

      new TimerDB({
        UserId: userId,
        GuildId: guildId,
        StartTime: Date.now(),
      }).save();
    }

    if (oldState.channel?.id && !newState.channel?.id) {
      //user leave a voice channel
      console.log(
        `${newState.member.user.tag} has left ${oldState.channel.name}.`
      );

      TimerDB.findOne(
        { UserId: userId, GuildId: guildId },
        async (err, timerData) => {
          if (err) console.log(err);
          if (!timerData) return;

          UserDB.findOne(
            { UserId: userId, GuildId: guildId },
            async (err, userData) => {
              const Time = Date.now() - timerData.StartTime;
              timerData.delete();

              console.log(Time);

              let Exp = Math.floor(Time / oneXPperTime);

              const coin = Exp + Math.ceil(Math.random() * 10);

              if (!userData) {
                let startLevel = 0;
                let currentExp = Exp;
                let neededExp = 1;
                while (currentExp >= neededExp) {
                  startLevel += 1;
                  currentExp -= neededExp;
                  neededExp = startLevel * 10 + (startLevel === 0 ? 1 : 0);
                }

                new UserDB({
                  UserId: userId,
                  GuildId: guildId,
                  Experience: Exp,
                  Level: startLevel,
                  Coin: coin,
                  PPMeasure: 1,
                  IsPremium: false,
                  Time: Time,
                  JoinCount: 1,
                  Message: 0,
                  WordCount: 0,
                  StickerCount: 0,
                  AttachmentCount: 0,
                }).save();

                if (!channel) return;

                const NewPlayerEmbed = new MessageEmbed()
                  .setAuthor({
                    name: "New Player has been registered",
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                  })
                  .setTitle("Voice Channel Activation")
                  .setColor("AQUA")
                  .setThumbnail(
                    oldState.member.displayAvatarURL({ dynamic: true })
                  )
                  .addFields(
                    {
                      name: `Username`,
                      value: oldState.member.user.tag,
                      inline: true,
                    },
                    {
                      name: `ID`,
                      value: oldState.member.id.toString(),
                      inline: true,
                    },
                    {
                      name: `Guild`,
                      value: `${oldState.guild.name.toString()}\n${oldState.guild.id.toString()}`,
                      inline: true,
                    },
                    {
                      name: `Level`,
                      value: `${startLevel.toString()}`,
                      inline: true,
                    },
                    {
                      name: `Exp.`,
                      value: `${currentExp.toString()} / ${neededExp.toString()}`,
                      inline: true,
                    },
                    {
                      name: `Money`,
                      value: `💰 ${coin.toString()}`,
                      inline: true,
                    }
                  );

                await channel.send({ embeds: [NewPlayerEmbed] });
              } else {
                userData.Time += Time;
                userData.JoinCount += 1;

                userData.Experience += Exp;
                userData.Coin += Math.floor(
                  coin * (userData.IsPremium ? 1 : 1.25)
                );

                let nextXP =
                  ((userData.Level * (userData.Level + 1)) / 2) * 10 + 1;
                let levelUp = 0;

                while (userData.Experience >= nextXP) {
                  userData.Level += 1;
                  nextXP =
                    ((userData.Level * (userData.Level + 1)) / 2) * 10 + 1;
                  levelUp += 1;
                }

                const neededXP = userData.Level * 10;
                const currentXP = neededXP - (nextXP - userData.Experience);

                userData.save();

                if (!channel) return;

                if (levelUp > 0) {
                  const LevelUpEmbed = new MessageEmbed()
                    .setAuthor({
                      name: `Player has been leveled up by ${levelUp}`,
                      iconURL: client.user.displayAvatarURL({ dynamic: true }),
                    })
                    .setTitle("Voice Channel Level Up")
                    .setColor("GREEN")
                    .setThumbnail(
                      oldState.member.displayAvatarURL({ dynamic: true })
                    )
                    .addFields(
                      {
                        name: `Username`,
                        value: oldState.member.user.tag,
                        inline: true,
                      },
                      { name: `ID`, value: oldState.member.id, inline: true },
                      {
                        name: `Guild`,
                        value: `${oldState.guild.name}\n${oldState.guild.id}`,
                        inline: true,
                      },
                      {
                        name: `Current Level`,
                        value: `${userData.Level}`,
                        inline: true,
                      },
                      {
                        name: `Exp.`,
                        value: `${currentXP} / ${neededXP}`,
                        inline: true,
                      },
                      { name: `Money`, value: `${userData.Coin}`, inline: true }
                    );

                  await channel.send({ embeds: [LevelUpEmbed] });
                }
              }
            }
          );
        }
      );
    }
  },
};
