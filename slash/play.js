const { Client, Intents } = require('discord.js');
const ytdl = require('ytdl-core');

const TOKEN = 'YOUR_DISCORD_BOT_TOKEN';

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES] });

const queue = new Map();  // Will hold the song queue for each server

client.once('ready', () => {
  console.log('Bot is online!');
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith('/play')) {
    const args = message.content.split(' ');
    if (args.length < 2) {
      message.channel.send('Please provide a YouTube URL.');
      return;
    }
    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url
    };

    if (!serverQueue) {
      const queueConstruct = {
        textChannel: message.channel,
        voiceChannel: message.member.voice.channel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
      };
      queue.set(message.guild.id, queueConstruct);
      queueConstruct.songs.push(song);

      try {
        const connection = await message.member.voice.channel.join();
        queueConstruct.connection = connection;
        play(message.guild, queueConstruct.songs[0]);
      } catch (err) {
        console.error(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(`${song.title} has been added to the queue!`);
    }
  } else if (message.content.startsWith('/skip')) {
    if (!serverQueue) return message.channel.send('There is no song to skip.');
    serverQueue.connection.dispatcher.end();
  } else if (message.content.startsWith('/stop')) {
    if (!serverQueue) return message.channel.send('There is no song to stop.');
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
  } else if (message.content.startsWith('/queue')) {
    if (!serverQueue || serverQueue.songs.length == 0) return message.channel.send('Queue is empty.');
    let response = 'Current Queue:\n';
    serverQueue.songs.forEach((song, index) => {
      response += `${index + 1}. ${song.title}\n`;
    });
    message.channel.send(response);
  }
});

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection.play(ytdl(song.url))
    .on('finish', () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on('error', error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Now playing: **${song.title}**`);
}

client.login(TOKEN);
