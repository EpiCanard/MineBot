import {CronJob} from "cron";

export interface MineJobs {
  realTime?: CronJob;
  summary?: CronJob;
}
