import { Context, Schema, Random, h } from "koishi";
import { realm_spiritual_power } from '../../index';

export const name = "xianling-bot-wilderness";

import { } from "@koishijs/canvas";

import { resolve } from "path";
import { resolveTxt } from "dns";

export interface Config { }

export const Config: Schema<Config> = Schema.object({});

let randoms = new Random(() => Math.random());

declare module "koishi" {
  interface Tables {
    xianling_wilderness: XW;
    xianling_bag: XB;
  }
}

export interface XB {
  id: number; // id
  userId: string; // userid
  bag: Object;
}

export interface XW {
  id: number; // id
  userId: string; // userid
  quantity: number; //灵田数量
  grade: number; // 灵田等级
  time: number; //时间
}

export async function apply(ctx: Context) {
  ctx.model.extend(
    "xianling_bag",
    {
      id: "unsigned", // id
      userId: "string", // userid
      bag: 'json'
    },
    { autoInc: true }
  );
  ctx.model.extend(
    "xianling_wilderness",
    {
      id: "unsigned", // id
      userId: "string", // userid
      quantity: "unsigned",  //灵田数量
      grade: 'unsigned', // 灵田等级
      time: 'unsigned', //时间
    },
    { autoInc: true }
  );
  let lingtian_level = ["灵田", "桃源福地", "宝地", "仙境", "神域"];

  ctx.command("仙灵")
    .subcommand("我的道场")
    .action(async ({ session }) => {
      const { userId } = session;
      const player_data = await ctx.database.get("xianling_user", { userId });
      const wilderness_data = await ctx.database.get("xianling_wilderness", { userId });
      const time = Math.floor(Date.now() / 1000);
      const judgment = (wilderness_data[0]["time"] >= time ? Math.floor((wilderness_data[0]['time'] - time) / 60) : 0)
      if (player_data?.length == 0) {
        return `══开拓道场══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
      } else if (wilderness_data[0]['quantity'] == 0) {
        return "你有没有道场";
      } else {
        const harvest = (wilderness_data[0]['grade'] + 1) * wilderness_data[0]['quantity'] * 1; // 灵田等级*灵田数量*1
        return `══道场信息══
☯️道号:${player_data[0]["name"]}
🕸️道场范围:${wilderness_data[0]['quantity']}
⛲道场等级:${lingtian_level[wilderness_data[0]['grade']]}
⚜️道场产出:${harvest}
💠聚灵效果:${wilderness_data[0]['grade'] + 1}
⏳道场收获剩余时间:${judgment}分钟`
      }
    })
  ctx
    .command("仙灵")
    .subcommand("道场闭关")
    .action(async ({ session }) => {
      const { userId } = session;
      const data = await ctx.database.get("xianling_user", { userId });
      const wilderness_data = await ctx.database.get("xianling_wilderness", { userId });
      const time = Math.floor(Date.now() / 1000);
      const currentDate = new Date(time * 1000);
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      const hours = String(currentDate.getHours()).padStart(2, "0");
      const minutes = String(currentDate.getMinutes()).padStart(2, "0");
      const seconds = String(currentDate.getSeconds()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      if (data?.length == 0) {
        return `══道场闭关══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
      } else if (wilderness_data[0]['quantity'] == 0) {
        return "你有没有道场";
      } else if (data[0].status == 1) {
        return "你已经开始闭关了";
      } else {
        const Gain_spiritual_power = (data[0]["XL_bonus"]["Gai_per_second"] == 0 ?
          realm_spiritual_power[data[0]["realm"]]// 每秒获得灵力
          + data[0]["XL_bonus"]["Gai_per_second"] : // 仙灵每秒灵力
          realm_spiritual_power[data[0]["realm"]]// 每秒获得灵力
          * data[0]["XL_bonus"]["Gai_per_second"]
        )
        await ctx.database.set("xianling_user", { userId: userId },
          { Time: time, status: 1 }
        );
        // （道场等级+1）乘以现有闭关速度
        return `══道场闭关══\n【${data[0]["name"]}】\n开始时间：${formattedDate}\n每秒获得：${((wilderness_data[0]['grade'] + 1) * Gain_spiritual_power).toFixed(2)}灵力\n请努力冲刺最顶峰吧`;
      }
    });
  ctx
    .command("仙灵")
    .subcommand("道场出关")
    .action(async ({ session }) => {
      const { userId } = session;
      const data = await ctx.database.get("xianling_user", { userId });
      const wilderness_data = await ctx.database.get("xianling_wilderness", { userId });
      const time = Math.floor(Date.now() / 1000) - data?.[0]?.["Time"]; // 闭关时间
      if (data?.length == 0) {
        return `══道场出关══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
      } else if (wilderness_data[0]['quantity'] == 0) {
        return "你有没有道场";
      } else if (data?.[0]?.status == 1) {
        const gain_spiritual_power = await retreat_spiritual_power(ctx, userId);
        return `══道场出关══\n【${data[0]["name"]
          }】\n修炼时长：${time}秒\n获得灵力：${gain_spiritual_power.toFixed(2)}`;
      } else {
        return `══道场出关══\n【${data[0]["name"]}】\n你还没有开始闭关修炼'`;
      }
    });
  ctx
    .command("仙灵")
    .subcommand("开拓道场")
    .action(async ({ session }) => {
      const { userId } = session;
      const player_data = await ctx.database.get("xianling_user", { userId });
      const wilderness_data = await ctx.database.get("xianling_wilderness", { userId });
      const expand_your_consumption_list = [10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000]
      if (player_data?.length == 0) {
        return `══开拓道场══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
      } else if (wilderness_data[0]["quantity"] >= 10) {
        return `══开拓道场══\n【${player_data[0]["name"]}】\n你的领地数量已经达到10个了,不能再开拓道场了`;
      } else if (player_data[0]['GF_Restrictions'] < 1) {
        return `══开拓道场══\n【${player_data[0]["name"]}】\n开拓道场的前置条件是有归凡1次`;
      } else if (player_data[0]['Spirit_Stone'] < expand_your_consumption_list[wilderness_data[0]["quantity"]]) {
        return `══开拓道场══\n【${player_data[0]["name"]}】\n你的灵石不足,还需${expand_your_consumption_list[wilderness_data[0]["quantity"]] - player_data[0]['Spirit_Stone']}`;
      } else {
        await ctx.database.set('xianling_user', { userId }, { "Spirit_Stone": player_data[0]['Spirit_Stone'] - expand_your_consumption_list[wilderness_data[0]["quantity"]] })
        await ctx.database.set('xianling_wilderness', { userId }, { 'quantity': wilderness_data[0]['quantity'] + 1 })
        return `══开拓道场══\n【${player_data[0]["name"]}】\n开拓1块领地\n你已开拓了${wilderness_data[0]['quantity'] + 1}块领地`;
      }
    });
  ctx
    .command("仙灵")
    .subcommand("建设道场")
    .action(async ({ session }) => {
      const { userId } = session;
      const player_data = await ctx.database.get("xianling_user", { userId });
      const wilderness_data = await ctx.database.get("xianling_wilderness", { userId });
      const expand_your_consumption_list = [0, 100000, 500000, 1000000, 5000000];
      if (player_data?.length == 0) {
        return `══建设道场══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
      } else if (wilderness_data[0]["quantity"] == 0) {
        return `══建设道场══\n【${player_data[0]["name"]}】\n你一个领地都没有`;
      } else if (wilderness_data[0]['grade'] >= 4) {
        return `══建设道场══\n【${player_data[0]["name"]}】\n你的道场已经到最高等级了`;
      } else if (player_data[0]['Spirit_Stone'] < expand_your_consumption_list[wilderness_data[0]["grade"] + 1]) {
        return `══建设道场══\n【${player_data[0]["name"]}】\n你的灵石不足,还需${expand_your_consumption_list[wilderness_data[0]["grade"] + 1] - player_data[0]['Spirit_Stone']}`;
      } else {
        await ctx.database.set('xianling_user', { userId }, { "Spirit_Stone": player_data[0]['Spirit_Stone'] - expand_your_consumption_list[wilderness_data[0]["grade"] + 1] })
        await ctx.database.set('xianling_wilderness', { userId }, { 'grade': wilderness_data[0]['grade'] + 1 })
        return `══建设道场══\n【${player_data[0]["name"]}】\n建设成功，目前道场等级【${lingtian_level[wilderness_data[0]['grade'] + 1]}】\n聚灵效果增加一。`
      }
    })
  ctx
    .command('仙灵')
    .subcommand("收获道场")
    .action(async ({ session }) => {
      const { userId } = session;
      const player_data = await ctx.database.get("xianling_user", { userId });
      const wilderness_data = await ctx.database.get("xianling_wilderness", { userId });
      const player_bag = await ctx.database.get("xianling_bag", { userId });
      const now_time = Math.floor(Date.now() / 1000);
      if (player_data?.length == 0) {
        return `══收获道场══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
      } else if (wilderness_data[0]["quantity"] == 0) {
        return `══收获道场══\n【${player_data[0]["name"]}】\n你一个领地都没有`;
      } else if (wilderness_data[0]["time"] >= now_time) {
        return `══收获道场══\n【${player_data[0]["name"]}】\n还没到达收获时间`;
      }
      else {
        const harvest = (wilderness_data[0]['grade'] + 1) * wilderness_data[0]['quantity'] * 1; // 灵田等级*灵田数量*1
        const spirit = ["金灵蕴", "木灵蕴", "水灵蕴", "火灵蕴", "土灵蕴"];
        let spirit_list = [];
        for (let i = 0; i < harvest; i++) {
          const extract_the_spirit = randoms.pick(spirit);
          spirit_list.push(extract_the_spirit);
          添加物品(ctx, userId, player_bag[0]['bag'], extract_the_spirit, 1)
        }
        const time = [129600, 118800, 118800, 97200, 86400];
        await ctx.database.set('xianling_wilderness', { userId }, {
          time: now_time + time[wilderness_data[0]['grade']]
        })
        return `══收获道场══\n【${player_data[0]["name"]}】\n总收获了${harvest}产物\n收获了${await find_the_spirit(spirit_list)}`;
      }
    })
}


async function retreat_spiritual_power(ctx: Context, userId: string) {
  // 闭关获得灵力
  const player_data = await ctx.database.get("xianling_user", { userId });
  const wilderness_data = await ctx.database.get("xianling_wilderness", { userId });
  const duration_of_retreat = Math.floor(Date.now() / 1000) - player_data[0]["Time"]; // 闭关时间 公式:现在时间-开始闭关时间= 闭关时间
  let formula = duration_of_retreat * realm_spiritual_power[player_data[0]["realm"]]; // 初始公式: 闭关时间 * 当前境界每秒获得灵力
  if (player_data[0]['shut_in_bonus'] > 0) {
    console.log('道场闭关触发归凡加成')
    formula *= player_data[0]['shut_in_bonus'];
    // 初始公式 + 归凡加成
  }
  if (player_data[0]["XL_bonus"]["shut_in_bonus"] > 0) {
    console.log('道场闭关触发仙灵加成');
    formula *= player_data[0]["XL_bonus"]["shut_in_bonus"];
    formula *= player_data[0]["XL_bonus"]["Gai_per_second"];
    // 初始公式 + 仙灵加成
  }
  const superimposing = (wilderness_data[0]['grade'] + 1) * formula
  await ctx.database.set("xianling_user", { userId },
    { status: 0, Psychic_power: player_data[0]['Psychic_power'] + superimposing }
  );
  return superimposing
}

export async function 添加物品(ctx: Context, userId: string, 数组: object, 物品: string, 数量: number) {
  if (数组.hasOwnProperty(物品)) {//判断数组里面是否有这个物品
    数组[物品] += 数量;
    await ctx.database.set('xianling_bag', { userId }, { 'bag': 数组 });
    return '';
  } else {
    数组[物品] = 数量;
    await ctx.database.set('xianling_bag', { userId }, { 'bag': 数组 });
    return '';
  }
}
export async function 删除物品(ctx: Context, userId: string, 数组: object, 物品: string, 数量: number) {
  if (数组[物品] <= 1) {
    delete 数组[物品];
    await ctx.database.set('xianling_bag', { userId }, { 'bag': 数组 });
    return '';
  } else {
    数组[物品] -= 数量;
    await ctx.database.set('xianling_bag', { userId }, { 'bag': 数组 });
    return '';
  }
}

async function find_the_spirit(elements: string[]) {
  // 创建一个空对象来存储计数
  const countObj = {};

  // 遍历列表，统计每个元素的出现次数
  elements.forEach(element => {
    if (countObj[element]) {
      countObj[element]++;
    } else {
      countObj[element] = 1;
    }
  });
  // 使用 join 方法来自动生成一个字符串，列出所有元素及其数量
  const result = Object.entries(countObj)
    .map(([element, count]) => `${element}: ${count}`)
    .join('\n');
  return result;
}