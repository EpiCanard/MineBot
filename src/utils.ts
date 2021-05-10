import {Client, TextChannel} from "discord.js";
import https from 'https';
import {IncomingMessage} from 'node:http';
import {Command} from "./command";

export const getDiscordChannel = (bot: Client) => (channelId: string): TextChannel => bot
  .channels.cache.find(channel => channel instanceof TextChannel && channel.id === channelId) as TextChannel;


export function getJson(url: string) {
  return new Promise((resolve, reject) => {
    const API_URL = url;
    https.get(API_URL, (res: IncomingMessage) => {
      const statusCode = res.statusCode ?? 500;
      if (statusCode >= 200 && statusCode < 300) {
        let body = "";
        res.on('data', e => body += e);
        res.on('end', () => resolve(JSON.parse(body)));
      } else {
        console.error(res.statusCode + " => " + res.statusMessage);
      }
    }).on('error', (e) => {
      console.error(e);
    });
  });
}

export function getCommand(message: string, config: any): Command | undefined {
  const args = message.toLowerCase().split(" ");

  if (args[0].startsWith(config.prefix)) {
    return {
      command: args[0].slice(1),
      args: args.slice(1)
    }
  }

  return undefined;
}

export function round(value: number) {
  return Math.round(value * 100) / 100
}
