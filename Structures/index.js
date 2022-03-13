const { Client, Collection } = require("discord.js");

require("dotenv").config();
const TOKEN = process.env.TOKEN;

// const { TOKEN } = require("./config.json");

const { promisify } = require("util");
const { glob } = require("glob");
const PG = promisify(glob);
const Ascii = require("ascii-table");

const client = new Client({ intents: 32767 });
client.commands = new Collection();

const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");

client.distube = new DisTube(client, {
  emitNewSongOnly: true,
  leaveOnFinish: true,
  emitAddSongWhenCreatingQueue: false,
  plugins: [new SpotifyPlugin()],
});
module.exports = client;

require("../Systems/GiveawaySys")(client);

["Events", "Commands"].forEach((handler) => {
  require(`./Handlers/${handler}`)(client, PG, Ascii);
});

client.login(TOKEN);
