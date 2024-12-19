import { Context, Schema, Random, h } from "koishi";

export const name = "xianling-bot-card_draw";

import { } from "@koishijs/canvas";

import { resolve } from "path";
import spirits from "../../data/xianling_card_pool.json";
export interface Config { }

export const Config: Schema<Config> = Schema.object({});

let randoms = new Random(() => Math.random());
// ctx.command('仙灵')
//     .subcommand('')
//     .action(async ({ session }) => {
//         const { userId } = session;
//         const data = await ctx.database.get('xianling_user', { userId });
//     })
// 假设这是你的仙灵数组
export async function apply(ctx: Context) {
  ctx
    .command("仙灵")
    .subcommand("我的仙灵")
    .action(async ({ session }) => {
      const { userId } = session;
      const data = await ctx.database.get("xianling_user", { userId });
      const xianling = spirits.find(
        (xianling) => xianling.name === data?.[0]["XL_str"]
      );
      if (data?.length == 0) {
        return `══仙灵信息══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
      } else if (!xianling) {
        return `══仙灵信息══\n【${data[0]["name"]}】\n您还没有仙灵\nTips：请发送“重聚仙灵”获得专有天赋`;
      } else {
        return `══仙灵信息══\n【${data[0]["name"]}】\n仙灵:${xianling["name"]}\n评级:${xianling["type"]}\n简介:${xianling["description"]}\n效果:${xianling["effects"]}`;
      }
    });

  ctx
    .command("仙灵")
    .subcommand("重聚仙灵")
    .action(async ({ session }) => {
      const { userId } = session;
      let data = await ctx.database.get("xianling_user", { userId });
      if (data?.length == 0) {
        return `══重聚仙灵══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
      } else if (data[0]["Spirit_Stone"] < 1000) {
        return `══重聚仙灵══\n【${data[0]["name"]}】\n你的灵石不够哦!`;
      } else {
        const msg = await consumeSpiritStones(ctx, userId, 1000);
        await ctx.database.set("xianling_user", { userId }, { Spirit_Stone: data[0]["Spirit_Stone"] - 1000 });
        const spirit = drawSpirit();
        const stone = drawStone();
        if (stone) {
          let data = await ctx.database.get("xianling_user", { userId });
          await ctx.database.set(
            "xianling_user",
            { userId },
            {
              Spirit_Stone: data[0]["Spirit_Stone"] + stone.cost,
            }
          );
          return `══重聚仙灵══\n【${data[0]["name"]}】\n恭喜你重聚到了：${stone.cost}灵石${msg}`;
        } else if (spirit) {
          await ctx.database.set(
            "xianling_user",
            { userId },
            {
              XL_str: spirit.name,
              XL_bonus: {
                shut_in_bonus: spirit.shut_in_bonus,
                Gai_per_second: spirit.Gai_per_second,
              },
            }
          );
          // setTimeout(async () => {
          //   session.send(`══仙灵信息══\n【${data[0]["name"]}】\n仙灵:${spirit["name"]}\n评级:${spirit["type"]}\n简介:${spirit["description"]}\n效果:${spirit["effects"]}`);
          // }, 6000);
          return `══重聚仙灵══\n【${data[0]["name"]}】\n恭喜你重聚到了：${spirit.name}${msg}`;
        } else {
          let data = await ctx.database.get("xianling_user", { userId });
          await ctx.database.set(
            "xianling_user",
            { userId },
            {
              Spirit_Stone: data[0]["Spirit_Stone"] + 500,
            }
          );
          return `══重聚仙灵══\n【${data[0]["name"]}】\n恭喜你重聚到了：500灵石${msg}`;
        }
      }
    });
}
// for (let i = 0; i <= 100; i++) {
//     const spirit = drawSpirit();
//     const stone = drawStone();
//     if (stone) {
//         console.log(`══重聚仙灵══\n恭喜你重聚到了：${stone.cost}灵石`)
//     } else if (spirit) {
//         console.log(`══重聚仙灵══\n恭喜你重聚到了：${spirit.name}`)
//     } else {
//         console.log(`══重聚仙灵══\n恭喜你重聚到了：500灵石`)
//     }
// }

// 抽取仙灵
function drawSpirit() {
  for (const spirit of spirits) {
    if (Random.bool(spirit.probability)) {
      return spirit;
    }
  }
  return null; // 如果没有抽中，返回null
}
// 抽取灵石
function drawStone() {
  // 灵石数据
  const spiritStones = [
    { cost: 500, probability: 0.1 },
    { cost: 1000, probability: 0.3 },
    { cost: 1500, probability: 0.03 },
    { cost: 5000, probability: 0.01 },
    { cost: 10000, probability: 0.005 },
  ];
  for (const stone of spiritStones) {
    if (Random.bool(stone.probability)) {
      return stone;
    }
  }
  return null; // 如果没有抽中，返回null
}

async function consumeSpiritStones(ctx: Context, userId: string, amount: number) {
  const data = await ctx.database.get("xianling_user", { userId });
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const date = currentDate.getDate();
  const formattedTime = `${year}-${month}-${date}`;
  const thresholds = [100, 1000, 10000, 100000, 1000000];
  // 检查是否需要重置奖励
  if (data[0]["Spirit_Stone_Reward"]["time"] != formattedTime) {
    let Spirit_Stone_Reward = data[0]["Spirit_Stone_Reward"];
    Spirit_Stone_Reward["consume"] = 0;
    Spirit_Stone_Reward["time"] = formattedTime; // 使用正确的日期格式
    // 重置奖励状态
    let rewards = data[0]["rewards"];
    thresholds.forEach((threshold) => {
      rewards[threshold] = false;
    });
    // 一次性更新所有数据
    await ctx.database.set(
      "xianling_user",
      { userId },
      { rewards, Spirit_Stone_Reward }
    );
    console.log(`重置${data[0]['name']}奖励`);
  }
  // 更新消费灵石
  let Spirit_Stone_Reward = data[0]["Spirit_Stone_Reward"];
  Spirit_Stone_Reward["consume"] += amount;
  await ctx.database.set("xianling_user", { userId }, { Spirit_Stone_Reward });
  // 检查并发放奖励
  let rewards = data[0]["rewards"];
  let Spirit_Stone = data[0]["Spirit_Stone"];
  let msg = "";
  thresholds.forEach(async (threshold) => {
    if (Spirit_Stone_Reward["consume"] >= threshold && !rewards[threshold]) {
      rewards[threshold] = true; // 标记为已领取
      console.log(threshold)
      Spirit_Stone += threshold;
      msg += `\n恭喜你，消费达到${threshold}灵石，获得${threshold}灵石奖励！`;
    }
  });
  await ctx.database.create('xianling_user', { userId: '1', Spirit_Stone })
  // await ctx.database.upsert('xianling_user', [{ userId, Spirit_Stone, rewards }], 'userId')
  await ctx.database.set("xianling_user", { userId }, { rewards, Spirit_Stone });
  console.log(msg);
  return msg;
}