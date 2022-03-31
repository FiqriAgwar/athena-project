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
    const query = options.getString("query").split(" ").join("%20");

    const Response = new MessageEmbed()
      .setFooter({
        text: `API Powered By: tomorisakura`,
      })
      .setColor("YELLOW")
      .setAuthor({ name: `Results` });

    const RecipeResponse = new MessageEmbed()
      .setFooter({
        text: `API Powered By: tomorisakura`,
      })
      .setColor("GREEN");

    const ErrResponse = new MessageEmbed()
      .setFooter({
        text: `API Powered By: tomorisakura`,
      })
      .setColor("RED");

    const Buttons = new MessageActionRow();

    if (!query) {
      return interaction.reply({
        embeds: [ErrResponse.setDescription("Please input a valid query.")],
      });
    }

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

      await interaction.reply({
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
          console.log(click.user.id, click.customId);

          if (click.customId) {
            const Recipe = await axios({
              method: "get",
              url: `https://masak-apa-tomorisakura.vercel.app/api/recipe/${click.customId}`,
            });

            RecipeResponse.setDescription(
              `Recipe by: **${Recipe.data.results.author.user}** at ${Recipe.data.results.author.datePublished}\n
              ${Recipe.data.results.desc}`
            )
              .setAuthor({ name: Recipe.data.results.title })
              .setThumbnail(Recipe.data.results.thumb)
              .addFields(
                {
                  name: `Recipe Data`,
                  value: `Untuk ${Recipe.data.results.servings}. Waktu Persiapan: ${Recipe.data.results.times}.`,
                },
                {
                  name: `Ingredients`,
                  value: Recipe.data.results.ingredient.join("\u200b"),
                },
                {
                  name: `Steps`,
                  value: Recipe.data.results.step.join("\u200b"),
                }
              );

            return interaction.editReply({
              embeds: [RecipeResponse],
              components: [],
            });
          } else {
            return interaction.editReply({
              embeds: [
                ErrResponse.setDescription(
                  "An error occured when connecting to Discord API."
                ),
              ],
              components: [],
            });
          }
        });
      });
    } else {
      return interaction.reply({
        embeds: Response.setDescription(
          `No recipes exist in query: **${query}**.`
        ),
      });
    }
  },
};
