const {
  CommandInteraction,
  MessageEmbed,
  Client,
  User,
  MessageAttachment,
} = require("discord.js");
const UserDB = require("../../Structures/Schemas/UserLevelling");
const BuyDB = require("../../Structures/Schemas/ItemBuy");
const { ShopItems, findItem } = require("../../Enums/ShopItems");
const Canvas = require("canvas");

const ppMinusURL = "./Structures/Images/PPminus.jpg";
const ppPlusURL = "./Structures/Images/PPplus.jpg";

module.exports = {
  name: "buy",
  description: "Transfer your money to your friend.",
  options: [
    {
      name: "item",
      description: "Item that you want to buy.",
      type: "STRING",
      required: true,
      choices: ShopItems,
    },
  ],

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { guild, options, user } = interaction;

    const item = options.getString("item");

    const Embed = new MessageEmbed()
      .setAuthor({
        name: `Fery Funny Shop`,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      })
      .setTitle("Purchase Success")
      .setColor("GREEN");

    const Player = await UserDB.findOne({
      UserId: user.id,
      GuildId: guild.id,
    });

    if (!Player) {
      await UserDB.create({
        UserId: user.id,
        GuildId: guild.id,
        Experience: 0,
        Level: 0,
        Coin: 0,
        PPMeasure: 0,
        IsPremium: false,
      });

      return interaction.reply({
        embeds: [
          Embed.setDescription("You have 0 money in your account.")
            .setTitle("Purchase Failed")
            .setColor("RED"),
        ],
      });
    }

    if (Player.Coin < findItem(item).price) {
      return interaction.reply({
        embeds: [
          Embed.setDescription("You have not enough money on your account.")
            .setTitle("Transaction Failed")
            .setColor("RED"),
        ],
      });
    }

    const canvas = Canvas.createCanvas(647, 385);
    const ctx = canvas.getContext("2d");

    let bg = null;

    switch (item) {
      case "pluspp":
        {
          Player.PPMeasure *= 1.2;

          bg = await Canvas.loadImage(ppPlusURL);
        }
        break;
      case "minuspp":
        {
          bg = await Canvas.loadImage(ppMinusURL);
          await UserDB.updateMany(
            {
              UserId: { $ne: user.id },
              GuildId: guild.id,
            },
            {
              $mul: {
                PPMeasure: 0.5,
              },
            }
          );
        }
        break;
    }

    Player.Coin -= findItem(item).price;
    Player.save();

    await BuyDB.create({
      GuildId: guild.id,
      UserId: user.id,
      Item: findItem(item).name,
    });

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    const attachment = new MessageAttachment(canvas.toBuffer(), "image.png");
    Embed.setImage("attachment://image.png");

    return interaction.reply({
      embeds: [
        Embed.setDescription(
          `Thank you for purchasing **${findItem(item).name}**`
        ).setFooter({
          text: `Don't forget to comeback for another purchase.`,
        }),
      ],
      files: [attachment],
    });
  },
};
