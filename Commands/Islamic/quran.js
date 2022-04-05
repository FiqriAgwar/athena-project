const { CommandInteraction, MessageEmbed } = require("discord.js");
const { Surah } = require("../../Enums/QuranSurah");
const axios = require("axios");

module.exports = {
  name: "quran",
  description:
    "Check an ayat from a surah. If parameter ayat or surah is empty, will return random ayat.",
  options: [
    {
      name: "surah",
      description: "Number of the Surah that you want to see.",
      type: "NUMBER",
    },
    {
      name: "ayat",
      description: "Number of the ayat that you want to see.",
      type: "NUMBER",
    },
  ],

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { options } = interaction;

    const surah = options.getNumber("surah");
    const ayat = options.getNumber("ayat");

    const Response = new MessageEmbed().setFooter({
      text: `API Powered By: rzkytmgr`,
    });

    try {
      if (surah && ayat) {
        const result = await axios({
          method: "get",
          url: `https://quran-endpoint.vercel.app/quran/${surah}/${ayat}`,
        });

        if (result.data.status === 200) {
          Response.setColor("GREEN")
            .setAuthor({
              name: `Surah ${result.data.data.surah.id.short} (${result.data.data.surah.translation.id}), Ayat ${result.data.data.ayah.number.insurah}`,
            })
            .setDescription(
              `${result.data.data.ayah.text.ar}\n${result.data.data.ayah.text.read}`
            )
            .addFields(
              {
                name: `Translation`,
                value: result.data.data.ayah.translation.id,
              },
              {
                name: `Tafsir`,
                value:
                  result.data.data.ayah.tafsir.id.substring(0, 1000) + "...",
              }
            );

          return interaction.reply({ embeds: [Response] });
        } else {
          return interaction.reply({
            embeds: [
              Response.setColor("RED")
                .setAuthor({ name: "Error has been occured." })
                .setDescription(
                  `${
                    result.data.status === 404
                      ? "Surah and/or Ayat is not found."
                      : result.data.status
                  }`
                ),
            ],
          });
        }
      } else if (surah) {
        const surahConst = await axios({
          method: "get",
          url: `https://quran-endpoint.vercel.app/quran/${surah}`,
        });

        if (surahConst.data.status === 200) {
          const ayatRandom = Math.floor(
            Math.random() * surahConst.data.data.ayahs.length + 1
          );

          const result = await axios({
            method: "get",
            url: `https://quran-endpoint.vercel.app/quran/${surah}/${ayatRandom}`,
          });

          if (result.data.status === 200) {
            Response.setColor("GREEN")
              .setAuthor({
                name: `Surah ${result.data.data.surah.id.short} (${result.data.data.surah.translation.id}), Ayat ${result.data.data.ayah.number.insurah}`,
              })
              .setDescription(
                `${result.data.data.ayah.text.ar}\n${result.data.data.ayah.text.read}`
              )
              .addFields(
                {
                  name: `Translation`,
                  value: result.data.data.ayah.translation.id,
                },
                {
                  name: `Tafsir`,
                  value:
                    result.data.data.ayah.tafsir.id.substring(0, 1000) + "...",
                }
              );

            return interaction.reply({ embeds: [Response] });
          } else {
            return interaction.reply({
              embeds: [
                Response.setColor("RED")
                  .setAuthor({ name: "Error has been occured." })
                  .setDescription(
                    `${
                      result.data.status === 404
                        ? "Surah and/or Ayat is not found."
                        : result.data.status
                    }`
                  ),
              ],
            });
          }
        } else {
          return interaction.reply({
            embeds: [
              Response.setColor("RED")
                .setAuthor({ name: "Error has been occured." })
                .setDescription(
                  `${
                    result.data.status === 404
                      ? "Surah and/or Ayat is not found."
                      : result.data.status
                  }`
                ),
            ],
          });
        }
      } else if (ayat) {
        return interaction.reply({
          embeds: [
            Response.setColor("RED")
              .setAuthor({ name: "Invalid input." })
              .setDescription(`Please state the surah first before the ayat.`),
          ],
        });
      } else {
        const surahRandom = Math.floor(Math.random() * 114) + 1;

        const surahConst = await axios({
          method: "get",
          url: `https://quran-endpoint.vercel.app/quran/${surahRandom.toString()}`,
        });

        if (surahConst.data.status === 200) {
          const ayatRandom = Math.floor(
            Math.random() * surahConst.data.data.ayahs.length + 1
          );

          const result = await axios({
            method: "get",
            url: `https://quran-endpoint.vercel.app/quran/${surahRandom.toString()}/${ayatRandom.toString()}`,
          });

          if (result.data.status === 200) {
            Response.setColor("GREEN")
              .setAuthor({
                name: `Surah ${result.data.data.surah.id.short} (${result.data.data.surah.translation.id}), Ayat ${result.data.data.ayah.number.insurah}`,
              })
              .setDescription(
                `${result.data.data.ayah.text.ar}\n${result.data.data.ayah.text.read}`
              )
              .addFields(
                {
                  name: `Translation`,
                  value: result.data.data.ayah.translation.id,
                },
                {
                  name: `Tafsir`,
                  value:
                    result.data.data.ayah.tafsir.id.substring(0, 1000) + "...",
                }
              );

            return interaction.reply({ embeds: [Response] });
          } else {
            return interaction.reply({
              embeds: [
                Response.setColor("RED")
                  .setAuthor({ name: "Error has been occured." })
                  .setDescription(
                    `${
                      result.data.status === 404
                        ? "Surah and/or Ayat is not found."
                        : result.data.status
                    }`
                  ),
              ],
            });
          }
        }
      }
    } catch (err) {
      console.log(err);
      return interaction.reply({
        embeds: [Response.setDescription(err.toString()).setColor("DARK_RED")],
      });
    }
  },
};
