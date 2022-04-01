const {
  CommandInteraction,
  MessageEmbed,
  Client,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const axios = require("axios");

module.exports = {
  name: "recipe",
  description: "Find a food recipe. Have fun in cooking!",
  options: [
    {
      name: "query",
      description: "Search the recipe that you want.",
      type: "STRING",
      required: true,
    },
  ],

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { options } = interaction;
    const queryInput = options.getString("query");
    const query = queryInput.split(" ").join("%20");

    const Response = new MessageEmbed()
      .setFooter({
        text: `API Powered By: tomorisakura | Sponsored By: Kecap Manis Bango | Requested By: ArThreeMis`,
      })
      .setColor("YELLOW")
      .setAuthor({ name: `Recipes` });

    const Buttons = new MessageActionRow();

    if (!query) {
      return interaction.reply({
        embeds: [
          Response.setDescription("Please input a valid query.").setColor(
            "RED"
          ),
        ],
      });
    }

    interaction.reply({
      content:
        "Have fun in cooking! Please wait for around 5 seconds before the list of recipes appears. After that, pick one of the recipes by clicking one of the buttons.",
      ephemeral: true,
    });

    const recipeArray = await axios({
      method: "get",
      url: `https://masak-apa-tomorisakura.vercel.app/api/search/?q=${query}`,
    });

    if (recipeArray.data.results.length > 0) {
      const arr = recipeArray.data.results;
      let recipes = "";

      for (let i = 0; i < Math.min(5, arr.length); i++) {
        recipes += `${i + 1}. ${recipeArray.data.results[i].title}\n`;

        Buttons.addComponents(
          new MessageButton()
            .setCustomId(recipeArray.data.results[i].key)
            .setLabel(
              `${i + 1}. ${recipeArray.data.results[i].title.substring(
                0,
                9
              )}...`
            )
            .setStyle("PRIMARY")
        );
      }

      Response.addField(`List of recipes:`, recipes);

      const Message = await interaction.channel.send({
        embeds: [Response],
        components: [Buttons],
      });

      const filter = (buttonInt) => {
        return interaction.user.id === buttonInt.user.id;
      };

      const Collector =
        await interaction.channel.createMessageComponentCollector({
          filter,
          componentType: "BUTTON",
          max: 1,
        });

      Collector.on("collect", (i) => {});

      Collector.on("end", async (collection) => {
        collection.forEach(async (click) => {
          if (click.customId) {
            const Recipe = await axios({
              method: "get",
              url: `https://masak-apa-tomorisakura.vercel.app/api/recipe/${click.customId}`,
            });

            Response.fields = [];

            Response.setDescription(
              `Recipe by: **${Recipe.data.results.author.user}** at ${
                Recipe.data.results.author.datePublished
              }\n
              ${Recipe.data.results.desc.substring(0, 255) + "..."}`
            )
              .setColor("GREEN")
              .setAuthor({ name: Recipe.data.results.title })
              .setThumbnail(Recipe.data.results.thumb)
              .addFields(
                {
                  name: `Recipe Data`,
                  value: `Untuk ${Recipe.data.results.servings}. Waktu Persiapan: ${Recipe.data.results.times}.`,
                },
                {
                  name: `Ingredients`,
                  value: Recipe.data.results.ingredient.join("\n"),
                },
                {
                  name: `Steps`,
                  value: Recipe.data.results.step.join("\n"),
                }
              );

            Message.edit({
              embeds: [Response],
              components: [],
            });
          } else {
            return interaction.editReply({
              embeds: [
                Response.setDescription(
                  "An error occured when connecting to Discord API."
                ).setColor("RED"),
              ],
              components: [],
            });
          }
        });
      });
    } else {
      return interaction.editReply({
        embeds: [
          Response.setDescription(
            `No recipes exist in query: **${queryInput}**.`
          ),
        ],
      });
    }
  },
};
