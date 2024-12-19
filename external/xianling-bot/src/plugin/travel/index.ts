import { Context, Schema, Random, h } from "koishi";

export const name = "xianling-bot-travel";

import { } from "@koishijs/canvas";

import spirits from "../../data/travel_data.json";

export interface Config { }

export const Config: Schema<Config> = Schema.object({});

let randoms = new Random(() => Math.random());

declare module "koishi" {
  interface Tables {
    xianling_travel: XU;
  }
}

export interface XU {
  id: number; // id
  userId: string; // userid
  travel_name: string; // 游历名称
  travel_time: number; // 游历时长
  travel_restriction: Object; // 游历限制
}

export async function apply(ctx: Context) {
  ctx.model.extend(
    "xianling_travel",
    {
      id: "unsigned", // id
      userId: "string", // userid
      travel_name: "string", // 游历名称
      travel_time: "unsigned", // 游历时长
      travel_restriction: { type: "json", initial: { date: 0, time: 0 } }, // 游历限制 date当前时间 time次数
    },
    {
      autoInc: true,
    }
  );
  ctx
    .command("仙灵")
    .subcommand("游历")
    .action(async ({ session }) => {
      const { userId } = session;
      const player_data = await ctx.database.get("xianling_user", { userId });
      const travel_data = await ctx.database.get("xianling_travel", { userId });
      const Time = Math.floor(Date.now() / 1000);
      const time = Math.floor(Date.now() / 1000);
      const currentDate = new Date(time * 1000);
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      if (player_data?.length == 0) {
        return `══游历══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
      } else if (travel_data[0]['travel_restriction']['date'] == formattedDate && travel_data[0]['travel_restriction']['time'] >= 8) {
        return `══游历══\n【${player_data[0]["name"]}】\n你今天已经游历8次了`;
      } else if (travel_data[0]['travel_restriction']['date'] != formattedDate && travel_data[0]['travel_restriction']['time'] >= 8) {
        let restriction = travel_data[0]['travel_restriction'];
        restriction['date'] = formattedDate;
        restriction['time'] = 0;
        await ctx.database.set("xianling_travel", { userId }, { travel_restriction: restriction });
        return `══游历══\n【${player_data[0]["name"]}】\n请重新发送游历`;
      } else if (player_data[0]["status"] == 0) {
        const travel = randoms.pick(spirits);
        await ctx.database.set("xianling_user", { userId }, { status: 3 }
        );
        let restriction = travel_data[0]['travel_restriction'];
        restriction['date'] = formattedDate;
        restriction['time'] += 1;
        await ctx.database.set("xianling_travel", { userId }, { travel_restriction: restriction, travel_name: travel["事件"], travel_time: Time + 60 * 1 });
        setTimeout(async () => {
          const distinguish =
            travel["奖励"][0] == "Spirit_Stone"
              ? player_data[0][travel["奖励"][0]] + Number(travel["奖励"][1])
              : player_data[0][travel["奖励"][0]] +
              player_data[0][travel["奖励"][0]] * Number(travel["奖励"][1]);
          await ctx.database.set(
            "xianling_user",
            { userId },
            { status: 0, [travel["奖励"][0]]: distinguish }
          );
          session.send(`══结束游历══\n【${player_data[0]["name"]}】\n游历结束已离开\n${travel["事件"]}`);
        }, 180000 / 3);
        return `══游历══\n【${player_data[0]["name"]}】\n你正在外面游历，耗时：${60 * 1}秒`;
      } else {
        return `══游历══\n【${player_data[0]["name"]}】\n你现在正在进行其他活动~`;
      }
    });
}