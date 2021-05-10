import {Client, Message, TextChannel} from 'discord.js';
import cron from 'cron';
import * as config from '../config.json';
import fs from 'fs';
import {getCommand, getDiscordChannel, getJson, round} from './utils';
import {MineJobs} from './mine_jobs';

const CronJob = cron.CronJob;

const billingUrl = `https://hiveon.net/api/v1/stats/miner/${config.miningId}/ETH/billing-acc`;
const currencyUrl = "https://api2.hiveos.farm/api/v2/hive/currencies";

const bot = new Client();
const getChannel = getDiscordChannel(bot);
let jobs: MineJobs = {
  realTime: undefined,
  summary: undefined
}

const COMMANDS: {[key: string]: (a: Message) => void} = {
  "realtime": (message: Message) => {
    startStopJob("realTime", message);
  },
  "summary": (message: Message) => {
    startStopJob("summary", message);
  },
  "status": (message: Message) => {
    sendMessage(`Statut:
      Temps réel: ${(jobs.realTime?.running) ? "RUNNING" : "STOPPED"}
      Résumé: ${(jobs.summary?.running) ? "RUNNING" : "STOPPED"}
      `, message.channel.id);
  },
  "clear": (message: Message) => {
    const channel = getChannel(message.channel.id) as any | undefined;
    channel?.messages.fetch({limit: 99}).then((fetched: any) => {
      channel?.bulkDelete(fetched.filter((msg: Message) => msg.author.username === config.botName && !msg.pinned && !msg.content.startsWith("*keep*"))).then();
    });
  },
  "help": (message: Message) => {
    sendMessage(`
    Help :
    - **${config.prefix}realTime *<start|stop>* **: Lance ou arrête la mise à jour en temps réel du message
    - **${config.prefix}summary *<start|stop>* **: Lance ou arrête la publication du résumé journalier
    - **${config.prefix}clear** : Supprime les messages du bot
    - **${config.prefix}status** : Défini le status des jobs en cours d'exécution
    `, message.channel.id);
  }
};

function startStopJob(category: "realTime" | "summary", message: Message) {
  const parts = message.content.split(" ");
  switch (parts[1]) {
    case "start": {
      configureCronIfNotExists(category, message.channel.id);
      break;
    }
    case "stop": {
      jobs[category]?.stop();
      jobs[category] = undefined;
      sendMessage(`[${category}] Tâche périodique désactivée`, message.channel.id);
      break;
    }
    default: {
      sendMessage(`Paramètre '${parts[1]}' non supporté`, message.channel.id);
    }
  }
}

function updateConfig(config: any) {
  fs.writeFile("./config.json", JSON.stringify(config, (key, value) => (key === "default") ? undefined : value, 2), () => {});
}

function postSummary(billing: any, currency: any) {
  const totalReward = billing.earningStats.reduce((sum: number, stat: any) => sum + stat.reward, 0);
  const rate = currency.data.find((cur: any) => cur.currency === "ETH")?.rate;
  const message = `*keep*
  **Résumé des dernières 24h**:
  > **Total gagné**: ${totalReward} ETH / ${round(totalReward * rate)} USD

  *Dernière mise à jour : ${new Date().toLocaleString()}*`;

  sendMessage(message, config.summary.channelId);
}

function updateRealTimeMessage(billing: any, currency: any) {
  const rate = currency.data.find((cur: any) => cur.currency === "ETH")?.rate;
  const message = `*keep*
  > **Total non payé**\t:\t${billing.totalUnpaid} ETH / ${round(billing.totalUnpaid * rate)} USD
  > **Total payé**\t\t\t:\t${billing.totalPaid} ETH / ${round(billing.totalPaid * rate)} USD

  *Dernière mise à jour : ${new Date().toLocaleString()}*
  `;

  const sendRealTimeMessage = () =>
    sendMessage(message, config.realTime.channelId).then((msg: Message) => {
      config.realTime.messageId = msg.id;
      updateConfig(config);
    });
  if (config.realTime.messageId) {
    updateMessage(config.realTime.messageId, message, config.realTime.channelId)
      .catch(() => sendRealTimeMessage());
  } else {
    sendRealTimeMessage();
  }
}

async function updateMessage(messageId: string, message: string, channel: string) {
  console.info(`Edit message ${messageId}: ${message}`);
  return getChannel(channel)?.messages?.fetch(messageId)
    .then(msg => msg.edit(message));
}

function sendMessage(msg: string, channel: string) {
  console.info(`Sending message : ${msg}`);
  let chan: any = getChannel(channel);
  return chan.send(msg);
}

async function deleteLastCommand(message: Message) {
  const last = await message.channel.messages.fetch({limit: 1});
  (message.channel as TextChannel).bulkDelete(last);
}

function configureCronIfNotExists(category: "realTime" | "summary", channelId: string) {
  if (jobs[category]?.running)
    sendMessage(`[${category}] Cette tâche est déjà en cours d'exécution`, channelId);
  else {
    jobs[category] = configureCron(config[category].cron, (category === "realTime") ? updateRealTimeMessage : postSummary);
    config[category].channelId = channelId;
    updateConfig(config);
    sendMessage(`[${category}] Tâche périodique activée`, channelId);
  }
}

/**
 * Configure crons
 */
function configureCron(cron: string, callback: (a: any, b: any) => void) {
  var job = new CronJob(cron, () => Promise
    .all([getJson(billingUrl), getJson(currencyUrl)])
    .then.catch((error) => {
  console.error(error);
})(([billing, currency]) => callback(billing, currency))
  );

  job.start();
  return job;
}

/*
 * BOT LISTENERS
 */

bot.on('ready', () => {
  console.info(`Logged in as ${bot?.user?.tag}!`);
  jobs = {
    "realTime": (config.realTime.channelId) ? configureCron(config.realTime.cron, updateRealTimeMessage) : undefined,
    "summary": (config.summary.channelId) ? configureCron(config.summary.cron, postSummary) : undefined
  };
});

bot.on('message', (message) => {
  const command = getCommand(message.content, config);
  if (command && COMMANDS[command.command]) {
    deleteLastCommand(message).then(() => COMMANDS[command.command](message));
  }
});

bot.login(config.token);
