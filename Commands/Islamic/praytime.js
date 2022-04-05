const { CommandInteraction, MessageEmbed } = require("discord.js");
const axios = require("axios");
const moment = require("moment");

module.exports = {
  name: "praytime",
  description: "Prayer time for Bandung.",

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { options } = interaction;

    const city = options.getString("city");

    const Response = new MessageEmbed()
      .setFooter({
        text: `API Powered By: prayertimes.date`,
      })
      .setColor("GREEN");

    await interaction.reply({ content: "*Connecting to API...*" });

    try {
      const result = await axios({
        method: "get",
        url: `https://api.pray.zone/v2/times/today.json?city=bandung`,
      });

      if (!result) {
        Response.setDescription("Error when connecting to the API.").setColor(
          "RED"
        );
        return interaction.editReply({ content: "Error!", embeds: [Response] });
      }

      if (result.data.code !== 200) {
        Response.setDescription(result.data.status).setColor("RED");
        return interaction.editReply({ content: "Error!", embeds: [Response] });
      }

      let prayDate = moment(result.data.results.datetime[0].date.gregorian);
      let prayTime =
        `**Imsak**: ${result.data.results.datetime[0].times.Imsak}\n` +
        `**Subuh**: ${result.data.results.datetime[0].times.Fajr}\n` +
        `**Terbit**: ${result.data.results.datetime[0].times.Sunrise}\n` +
        `**Zuhur**: ${result.data.results.datetime[0].times.Dhuhr}\n` +
        `**Asar**: ${result.data.results.datetime[0].times.Asr}\n` +
        `**Maghrib**: ${result.data.results.datetime[0].times.Maghrib}\n` +
        `**Isya**: ${result.data.results.datetime[0].times.Isha}\n`;

      Response.setAuthor({
        name: `Prayer Time`,
      }).setThumbnail(
        "https://blog-static.mamikos.com/wp-content/uploads/2021/03/gambar-masjid-5.png"
      );

      Response.addFields(
        {
          name: "Date",
          value: `${prayDate.format("DD MMMM YYYY")}`,
          inline: true,
        },
        {
          name: "Location",
          value: ` ${result.data.results.location.city}, ${result.data.results.location.country}`,
          inline: true,
        },
        { name: "Pray Time", value: `${prayTime}` }
      );

      return interaction.editReply({
        content: "*Finished*",
        embeds: [Response],
      });
    } catch (err) {
      console.log(err);
      Response.setDescription(err.toString()).setColor("RED");
      return interaction.editReply({ content: "Error!", embeds: [Response] });
    }
  },
};
