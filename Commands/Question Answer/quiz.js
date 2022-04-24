const { CommandInteraction, MessageEmbed } = require("discord.js");
const axios = require("axios");

module.exports = {
  name: "quiz",
  description: "Have a quiz. Gets a winner by collecting messages after the command",
  options: [
    {
      name: "topic",
      description: "Select a topic.",
      type: "STRING",
      required: true,
      choices: [
        {
          name: "General Knowledge",
          value: "9",
        },
        {
          name: "Books",
          value: "10",
        },
        {
          name: "Film",
          value: "11",
        },
        {
          name: "Music",
          value: "12",
        },
        {
          name: "Musicals & Theaters",
          value: "13",
        },
        {
          name: "Television",
          value: "14",
        },
      ],
    },
    {
      name: "difficulty",
      description: "Select the difficulty.",
      type: "STRING",
      required: true,
      choices: [
        {
          name: "Easy",
          value: "easy",
        },
        {
          name: "Medium",
          value: "medium",
        },
        {
          name: "Hard",
          value: "hard",
        },
      ],
    },
  ],

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, user } = interaction;
    const topic = options.getString("topic");
    const difficulty = options.getString("difficulty");

    // Basic metadata
    const Response = new MessageEmbed()
      .setFooter({
        text: `API Powered By: opentdb | Created By: XIO84`,
      })
      .setColor("YELLOW")
      .setAuthor({ name: `Quizzes` });

    // Check if the variables are correct
    if (!(parseInt(topic) >= 9 && parseInt(topic) <= 14 && ["easy", "medium", "hard"].includes(difficulty))) {
      console.log(topic, difficulty)
      return interaction.reply({
        embeds: [
          Response.setDescription("??? That's not a right command query...").setColor(
            "RED"
          ),
        ],
      });
    }
    // Reply while waiting for API return
    interaction.reply({
      content:
        `Big brain time! Creating a quiz for you...`,
    });

    // Create the API request
    const quizContent = await axios({
      method: "get",
      url: `https://opentdb.com/api.php?amount=1&category=${topic}&difficulty=${difficulty}&type=multiple`,
    });

    if (quizContent.status == 200 && quizContent.data.response_code == 0) {
      const question = quizContent.data.results[0].question
      const answers = quizContent.data.results[0].incorrect_answers
      const correctAnswer = quizContent.data.results[0].correct_answer
      console.log(correctAnswer);
      // Check validity of response
      if (question == undefined || answers == undefined || correctAnswer == undefined) {
        console.log(quizContent.data)
        console.log(Object.keys(quizContent.data.results[0]))
        return interaction.editReply({
          content: undefined,
          embeds: [
            Response.setDescription("😭 API Mismatch, Please contact dev!").setColor(
              "RED"
            ),
          ],
        })
      }

      if (!(Array.isArray(answers))) {
        console.log(quizContent.data)
        console.log(quizContent.data.results[0])
        return interaction.editReply({
          content: undefined,
          embeds: [
            Response.setDescription("😭 API Mismatch, Please contact dev!").setColor(
              "RED"
            ),
          ],
        })
      }

      answers.push(correctAnswer)
      // Scramble array
      answers.sort(() => Math.random() - 0.5)
      interaction.followUp({
        content:
          `Question: ${question} \n\nChoices: (${answers.join('/')}) \n\nPlease answer within 10 seconds! Multiple entries will not be recorded. Please write the answer exactly as the choices given.`
      })

      // Start collecting messages
      const collector = interaction.channel.createMessageCollector({ time: 10000 });

      
      // collector.on('collect', m => {
      //   console.log(`Collected ${m.content}`);
      // });

      // Find a unique and first correct answer
      collector.on('end', collected => {
        console.log(`Collected ${collected.size} items`);
        const answered_users = new Set()
        let filtered_ans = collected.filter((message) => {
          return !(message.author.bot)
        })
        .filter((message) => {
          if (answered_users.has(message.author)) {
            return false
          } else {
            answered_users.add(message.author)
            return true
          }
        })
        .filter((message) => {
          return message.content.toUpperCase() === correctAnswer.toUpperCase()
        })
        
        // Get winner if any
        if (filtered_ans.size > 0) {
          const winner = filtered_ans.first().author
          interaction.channel.send({
            content:
            `Congratulations <@${winner.id}>! You won the quiz!!`
          })
        } else {
          interaction.channel.send({
            content:
            `No one got it correct... The answer was ${correctAnswer}`
          })
        }

        collector.stop("quiz ended");
      });
      return

    } else {
      return interaction.editReply({
        embeds: [
          Response.setDescription("🥲 API Error... Please wait / contact dev...").setColor(
            "RED"
          ),
        ],
      })
    }
  },
};
