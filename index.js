const Discord = require("discord.js");
const ytdl = require("ytdl-core");

const token = process.env.TOKEN;

const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_VOICE_STATES"],
});

client.on("ready", () => {
  console.log("El bot está listo!");
});

client.on("message", async (message) => {
  if (message.content.startsWith("/play")) {
    const song = message.content.slice(5);
    const stream = await ytdl.getInfo(song);

    const voiceChannel = message.guild.voiceChannels.find(
      channel => channel.members.has(message.author)
    );

    if (!voiceChannel) {
      message.reply("Debes estar en un canal de voz para reproducir música.");
      return;
    }

    message.guild.voice.play(stream, {
      channelId: voiceChannel.id,
    });

    message.reply("Reproduciendo " + song);
  }
});

client.login(token);
