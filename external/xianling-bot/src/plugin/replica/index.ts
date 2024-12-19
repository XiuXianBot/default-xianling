import { Context, Schema, Random, h } from "koishi";

export const name = "xianling-bot-replica";

import { } from "@koishijs/canvas";

import { resolve } from "path";
import spirits from "../../data/replica_data.json";
export interface Config { }

export const Config: Schema<Config> = Schema.object({});

let randoms = new Random(() => Math.random());
declare module "koishi" {
  interface Tables {
    xianling_replica: XU;
  }
}

export interface XU {
  id: number; // id
  userId: string; // userid
  replica_name: string; // 秘境名称
  replica_time: number; // 秘境时长
  replica_restriction: string; // 秘境限制
}

// ctx.command('仙灵')
//     .subcommand('')
//     .action(async ({ session }) => {
//         const { userId } = session;
//         const data = await ctx.database.get('xianling_user', { userId });
//     })

export async function apply(ctx: Context) {
  ctx.model.extend(
    "xianling_replica",
    {
      id: "unsigned", // id
      userId: "string", // userid
      replica_name: "string", // 秘境名称
      replica_time: "unsigned", // 秘境时长
      replica_restriction: "string", // 秘境限制
    },
    {
      autoInc: true,
    }
  );
  ctx
    .command("仙灵")
    .subcommand("探索秘境")
    .action(async ({ session }) => {
      const { userId } = session;
      const player_data = await ctx.database.get("xianling_user", { userId });
      const replica_data = await ctx.database.get("xianling_replica", { userId });
      const time = Math.floor(Date.now() / 1000);
      const currentDate = new Date(time * 1000);
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      const hours = String(currentDate.getHours()).padStart(2, "0");
      const minutes = String(currentDate.getMinutes()).padStart(2, "0");
      const seconds = String(currentDate.getSeconds()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      const Time = Math.floor(Date.now() / 1000);
      if (player_data?.length == 0) {
        return `══探索秘境══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
      } else if (replica_data[0]['replica_restriction'] == formattedDate) {
        return `══探索秘境══\n【${player_data[0]["name"]}】\n你今天已经探索了`;
      } else if (player_data[0]["status"] == 0) {
        const replica = randoms.pick(spirits);
        await ctx.database.set(
          "xianling_user",
          { userId },
          {
            status: 2,
          }
        );
        await ctx.database.set(
          "xianling_replica",
          { userId },
          {
            replica_name: replica["地点"],
            replica_time: Time + replica["时长"],
            replica_restriction: formattedDate,
          }
        );
        return `══探索秘境══\n【${player_data[0]["name"]}】\n你发现一处秘境【${replica["地点"]}】\n正在探索\n耗时：${replica["耗时"]}`;
      } else {
        return `══探索秘境══\n【${player_data[0]["name"]}】\n你现在正在进行其他活动~`;
      }
    });
  ctx
    .command("仙灵")
    .subcommand("离开秘境")
    .action(async ({ session }) => {
      const { userId } = session;
      const player_data = await ctx.database.get("xianling_user", { userId });
      const replica_data = await ctx.database.get("xianling_replica", {
        userId,
      });
      const Time = Math.floor(Date.now() / 1000);
      if (player_data?.length == 0) {
        return `══离开秘境══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
      } else if (
        player_data[0]["status"] == 2 &&
        replica_data[0]["replica_time"] < Time
      ) {
        const replica = spirits.find(
          (replica) => replica["地点"] === replica_data[0]["replica_name"]
        );
        if (replica["奖励"].length == 0) {
          await ctx.database.set("xianling_user", { userId }, { status: 0 });
          return `══离开秘境══\n【${player_data[0]["name"]}】\n探索秘境结束已离开\n${replica["事件"]}`;
        } else {
          const distinguish = replica["奖励"][0] == 'Spirit_Stone' ?
            player_data[0][replica["奖励"][0]] + Number(replica["奖励"][1])
            : player_data[0][replica["奖励"][0]] + (player_data[0][replica["奖励"][0]] * Number(replica["奖励"][1]));
          await ctx.database.set(
            "xianling_user",
            { userId },
            { status: 0, [replica["奖励"][0]]: distinguish }
          );
          return `══离开秘境══\n【${player_data[0]["name"]}】\n探索秘境结束已离开\n${replica["事件"]}`;
        }
      } else {
        return `══离开秘境══\n【${player_data[0]["name"]}】\n离开失败，你还没到时间或没开始探索呢\n还有${replica_data[0]["replica_time"] - Time}秒离开`;
      }
    });
}

/**
幽冥仙府 探秘上古仙人遗迹，挑战禁地BOSS。
奖励3000灵石 时间30分钟
青云试炼 攀登青云梯，战胜各路高手。
奖励15%当前灵力 时间30分钟
九幽迷宫 深入九幽地宫，寻找长生秘籍。
奖励5000灵石 时间40分钟
灵山福地 保护灵山圣地，抵御邪魔入侵。
奖励20%当前灵力 时间40分钟。
天劫雷池 经历天劫洗礼，提升自身境界。
奖励10000灵石 时间60分钟。
仙缘洞府 寻找仙缘奇遇，获取稀世法宝。
奖励30%当前灵力 时间60分钟。
犄角旮旯 偶遇修仙劫匪，不料空手而归。
什么都没有 时间30分钟
 */
