import { Context, Schema, Random, h } from "koishi";
import { 添加物品, 删除物品 } from './plugin/wilderness/index';

export const name = "xianling-bot";

import { } from "@koishijs/canvas";

import { resolve } from "path";

export interface Config { }

export const Config: Schema<Config> = Schema.object({});

import * as card_draw from "./plugin/card_draw/index";
import * as replica from "./plugin/replica/index";
import * as travel from "./plugin/travel/index";
import * as wilderness from "./plugin/wilderness/index";
import * as taoist_couple from "./plugin/taoist_couple/index";
import * as xiuxiangalmark from "./plugin/xiuxiangalmark/index";
import * as help from "./plugin/help/index";
import * as cast_pattern from "./plugin/cast_pattern/index";

export const inject = {
  required: ["canvas", "database", "localstorage"],
  optional: ['word']
};

declare module "koishi" {
  interface Tables {
    xianling_user: XU;
  }
}

export interface XU {
  id: number; // id
  userId: string; // userid
  name: string; // 玩家名称
  gender: string; // 玩家性别
  Time: number; // 玩家时间 修炼时间
  Fairy_label: string; // 玩家签到
  realm: number; // 玩家境界
  Psychic_power: number; // 玩家灵力
  Spirit_Stone: number; // 玩家灵石
  status: number; // 玩家状态
  breakthrough_probability: number; //突破概率 tips:0.10
  Next_breakthrough: number; // 下次突破概率： 0.0
  GF_Restrictions: number; // 归凡限制
  shut_in_bonus: number; // 归凡闭关加成
  XL_str: string; // 仙灵字符
  XL_bonus: object; // 仙灵加成
  Spirit_Stone_Reward: object; //灵石奖励
  rewards: object; //消费奖励
}
let randoms = new Random(() => Math.random());

let realm = [
  "人境",
  "凡境悟法",
  "凡境凝纹",
  "凡境铸纹",
  "灵境",
  "灵境蕴灵",
  "灵境通灵",
  "灵境妙法",
  "半步地境",
  "地境铸则",
  "地境悟道",
  "地境通天",
  "半步天境",
  "天境归凡",
  "尊者境",
  "尊者寂灵",
  "尊境破虚",
  "尊境合道",
  "尊境化神",
  "大帝",
  "天帝",
  "圣帝",
  "入圣境",
  "圣境（散魄）",
  "圣境（斩魂）",
  "圣境（弑情）",
  "圣境（归一）",
  "神境",
  "神境一阶",
  "神境二阶",
  "神境三阶",
  "神境四阶",
  "神境五阶",
  "神境六阶",
  "神境七阶",
  "神境八阶",
  "神境九阶",
  "无上",
];
let lingli = [
  0, 2500, 5000, 10000, 50000, 100000, 200000, 400000, 1000000, 2000000,
  4000000, 8000000, 10000000, 1.0e8, 1.0e9, 2.0e9, 4.0e9, 8.0e9, 1.0e10, 2.0e10,
  4.0e10, 1.0e11, 2.0e11, 4.0e11, 8.0e11, 1.6e12, 3.2e12, 1.0e13, 2.0e13,
  4.0e13, 8.0e13, 1.6e14, 3.2e14, 6.4e14, 1.0e15, 2.0e15, 4.0e15, 1.0e16,
];
export let realm_spiritual_power = [
  1, 3, 6, 9, 13, 16, 19, 22, 25, 30, 35, 40, 50, 70, 100, 140,
  190, 260, 340, 430, 530, 640, 760, 890, 1020, 1160, 1310,
  10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000,
  1,
]; // 每个境界的每秒灵力
let status = ["空闲中", "闭关中", "探索中", "游历中"];

export async function apply(ctx: Context) {
  ctx.plugin(card_draw); // 调用抽卡插件
  ctx.plugin(replica); // 调用副本插件
  ctx.plugin(travel); // 调用游历
  ctx.plugin(wilderness); // 调用道场
  ctx.plugin(taoist_couple); // 调用道侣
  ctx.plugin(xiuxiangalmark); // 剧本姬
  ctx.plugin(cast_pattern); // 铸纹
  ctx.plugin(help) // 帮助

  // ctx.on('before-send', async (session) => {
  //   session.content = '\u200b \n' + session.content
  // })

  let testcanvas: string;
  try {
    testcanvas = "file://";
    await ctx.canvas.loadImage(
      `${testcanvas}${resolve(__dirname, "./img", "ph.png")}`
    );
  } catch (e) {
    testcanvas = "";
  }
  async function Generate_Ranking(
    rankings: string,
    username: string,
    realm: string,
    message: string
  ) {
    const canvas = await ctx.canvas.createCanvas(600, 510); // 设置底图大小
    const context = canvas.getContext("2d");
    const baseImage = await ctx.canvas.loadImage(
      `${testcanvas}${resolve(__dirname, "./img", `ph.png`)}`
    ); // 加载底图
    context.drawImage(baseImage, 0, 0, 600, 510);
    context.globalAlpha = 0.8;
    context.font = `28px xiuxian-soujin`;
    context.fillStyle = "#000000";
    const rankings_ = rankings.split("\n");
    let rankings_y = 80; // 初始 Y 坐标位置
    rankings_.forEach((line) => {
      // 逐行插入文字
      context.fillText(line, 80, rankings_y);
      rankings_y += 35; // 每行文字之间的间距
    });
    const username_ = username.split("\n");
    let username_y = 80; // 初始 Y 坐标位置
    username_.forEach((line) => {
      // 逐行插入文字
      const truncateMiddle = (str, maxLength) =>
        str.length <= maxLength
          ? str
          : `${str.substring(
            0,
            Math.ceil((maxLength - 0) / 2)
          )}...${str.substring(
            str.length - Math.floor((maxLength - 3) / 2)
          )}`;
      const truncatedStr = truncateMiddle(line, 15);
      context.fillText(truncatedStr, 80 + 50, username_y);
      username_y += 35; // 每行文字之间的间距
    });
    const realm_ = realm.split("\n");
    let realm_y = 80; // 初始 Y 坐标位置
    realm_.forEach((line) => {
      // 逐行插入文字
      const a = line.length == 3 ? 80 + 348 : 80 + 320;
      context.fillText(line, a, realm_y);
      realm_y += 35; // 每行文字之间的间距
    });
    context.fillText(message, 80, 450);
    return canvas.toBuffer("image/png");
  }
  ctx.model.extend(
    "xianling_user",
    {
      id: "unsigned", // id
      userId: "string", // userid
      gender: "string", // 玩家名称
      name: "string", // 玩家性别
      Time: "unsigned", // 玩家时间
      realm: "unsigned", // 玩家境界
      Fairy_label: "string",
      Psychic_power: "unsigned", // 玩家灵力
      Spirit_Stone: "unsigned", // 玩家灵石
      status: "unsigned", // 玩家状态
      breakthrough_probability: "float", //突破概率 tips:0.10
      Next_breakthrough: "float", // 下次突破概率： 0.0
      GF_Restrictions: "unsigned", // 归凡限制
      shut_in_bonus: "float", // 闭关加成
      XL_str: "string", //仙灵字符
      XL_bonus: {
        type: "json",
        initial: {
          shut_in_bonus: 0,
          Gai_per_second: 0,
        },
      }, // 闭关加成
      Spirit_Stone_Reward: {
        type: "json",
        initial: {
          time: 0,
          consume: 0,
        },
      }, // 灵石奖励
      rewards: {
        type: "json",
        initial: {
          100: false,
          1000: false,
          10000: false,
          100000: false,
          1000000: false,
        },
      },
    },
    {
      autoInc: true,
    }
  );

  ctx.command("仙灵")
    .subcommand("修仙信息")
    .action(async ({ session }) => {
      const { userId } = session;
      const data = await ctx.database.get("xianling_user", { userId });
      const a = (decimal: number) => {
        let percentage = decimal * 100;
        percentage = Math.max(0, Math.min(100, percentage));
        return percentage.toFixed(2) + "%";
      };
      const player = data[0];
      if (data?.length == 0) {
        return `══修仙信息══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
      } else {
        const Gain_spiritual_power = (data[0]["XL_bonus"]["Gai_per_second"] == 0 ?
          realm_spiritual_power[data[0]["realm"]]// 每秒获得灵力
          + data[0]["XL_bonus"]["Gai_per_second"] : // 仙灵每秒灵力
          realm_spiritual_power[data[0]["realm"]]// 每秒获得灵力
          * data[0]["XL_bonus"]["Gai_per_second"]
        )
        return `══修仙信息══
昵称: ${player["name"]}
性别: ${player["gender"]}
状态: ${status[player["status"]]}
境界: ${realm[player["realm"]]}
灵石: ${player["Spirit_Stone"]}
灵力: ${await shrink_the_numbers(player["Psychic_power"])}/${lingli[player["realm"] + 1]}
每秒灵力: ${await shrink_the_numbers(Gain_spiritual_power)}
突破概率: ${a(data[0]["breakthrough_probability"] + data[0]["Next_breakthrough"])}`;
      }
    });
  ctx.command("仙灵")
    .subcommand("踏入世界 <name> <gender>")
    .action(async ({ session }, name, gender) => {
      const { userId } = session;
      const ALL_data = await ctx.database.get("xianling_user", {});
      const data = await ctx.database.get("xianling_user", { userId });
      const group_data = await ctx.database.get("xianling_user", { name });
      if (data?.length != 0) {
        // 判断是否未注册 姓名和性别不为空
        return "══踏入世界══\n小友,你已经踏入世界了";
      } else if (group_data.length > 0) {
        return "══踏入世界══\n小友,你的名字与同人重复了";
      } else if (name?.length <= 5 && ["男", "女"].includes(gender)) {
        // 判断姓名长度是否符合标准:<=5,性别属于正常性别
        await ctx.database.create("xianling_travel", { userId });
        await ctx.database.create("xianling_bag", { userId });
        await ctx.database.create("xianling_wilderness", { userId });
        await ctx.database.create("xianling_replica", { userId });
        await ctx.database.create("xianling_taoist_couple", { userId });
        await ctx.database.create("xianling_user", {
          userId,
          name,
          gender,
          Time: 0,
          realm: 0,
          Psychic_power: 3000,
          Spirit_Stone: 100000,
          status: 0,
          breakthrough_probability: 0.01,
          Next_breakthrough: 0,
          shut_in_bonus: 0,
        });
        await 添加物品(ctx, userId, { '姻缘令': 1 }, '转职令', 1)
        return (
          "══踏入世界══\n" +
          "首次踏入世界可发送【我要修仙】\n" +
          `昵称:${name}\n` +
          `性别:${gender}\n` +
          `境界:${realm[0]}\n` +
          `状态:${status[0]}\n` +
          `仙灵:\n第${ALL_data.length + 1}个踏入世界之人\n` +
          '已自动开启【新手礼包】礼包内容如下:\n' +
          `10万灵石、转职令、姻缘令。`
        );
      } else {
        return `══踏入世界══
格式错误
正确格式:
踏入世界 小明 男`;
      }
    });

  ctx.command("仙灵")
    .subcommand("每日签到")
    .action(async ({ session }) => {
      const { userId } = session;
      const data = await ctx.database.get("xianling_user", { userId });
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const date = currentDate.getDate();
      const formattedTime = `${year}-${month}-${date}`;
      if (data?.length == 0) {
        return `══仙灵签到══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
      } else if (data?.[0].Fairy_label == formattedTime) {
        return `══仙灵签到══\n【${data?.[0]["name"]}】\n你今日已签到了`;
      } else {
        await ctx.database.set(
          "xianling_user",
          {
            userId: userId,
          },
          {
            Spirit_Stone: data[0]["Spirit_Stone"] + 5000,
            Fairy_label: formattedTime,
            Psychic_power:
              data[0].Psychic_power + Math.ceil(data[0].Psychic_power * 0.05),
          }
        );
        return `══仙灵签到══\n【${data[0]["name"]
          }】\n今日签到成功\n道友获得${Math.ceil(
            data[0].Psychic_power * 0.05
          )}灵力\n1000灵石`;
      }
    });

  ctx.command("仙灵")
    .subcommand("送灵石 <name> <Spirit_Stone:number>")
    .action(async ({ session }, name, Spirit_Stone) => {
      const { userId } = session;
      const player_1_data = await ctx.database.get("xianling_user", { userId });
      const player_2_data = await ctx.database.get("xianling_user", { name });
      if (player_1_data?.length == 0) {
        return `══送灵石══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
      } else if (player_2_data?.length == 0) {
        return `══送灵石══\n【${player_1_data[0]["name"]}】\n找不到这个人呢`;
      } else if (Spirit_Stone > player_1_data[0]["Spirit_Stone"]) {
        return `══送灵石══\n【${player_1_data[0]["name"]}】\n你没那么多灵石啊`;
      } else if (name == player_1_data[0]['name']) {
        return `══送灵石══\n【${player_1_data[0]["name"]}】\n你不能给自己送灵石`;
      } else if (Spirit_Stone < 0) {
        return `══送灵石══\n【${player_1_data[0]["name"]}】\n你想卡bug吗`;
      } else if (!Spirit_Stone) {
        return `══送灵石══\n【${player_1_data[0]["name"]}】\n请输入要送出的灵石数量`;
      } else {
        // 总灵石 - 送出灵石
        await ctx.database.set("xianling_user", { userId }, { Spirit_Stone: player_1_data[0]["Spirit_Stone"] - Spirit_Stone }
        );
        await ctx.database.set("xianling_user", { name }, {
          Spirit_Stone:
            player_2_data[0]["Spirit_Stone"] +
            (Spirit_Stone - Spirit_Stone * 0.2),
        }
        );
        return `══送灵石══\n【${player_1_data[0]["name"]}】\n送出灵石成功\n扣除20%手续费\n送出${Spirit_Stone - Spirit_Stone * 0.2}`;
      }
    });

  ctx.command("仙灵")
    .subcommand("灵石修炼 <quantity:number>")
    .action(async ({ session }, quantity) => {
      const { userId } = session;
      const data = await ctx.database.get("xianling_user", { userId });
      if (data.length == 0) {
        return `══灵石修炼══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
      } else if (!quantity) {
        return `══灵石修炼══\n【${data[0]["name"]}】\n格式错误\n正确格式\n灵石修炼 【数量】`;
      } else if (quantity > data[0]['Spirit_Stone']) {
        return `══灵石修炼══\n【${data[0]["name"]}】\n你并没有那么多灵石`;
      } else {
        await ctx.database.set('xianling_user', { userId }, { "Spirit_Stone": data[0]['Spirit_Stone'] - quantity, "Psychic_power": data[0]['Psychic_power'] + quantity })
        return `══灵石修炼══\n【${data[0]["name"]}】\n使用灵石修炼成功\n消耗${quantity}灵石\n获得${quantity}灵力`;
      }
    })

  ctx.command("仙灵")
    .subcommand("闭关修炼")
    .action(async ({ session }) => {
      const { userId } = session;
      const data = await ctx.database.get("xianling_user", { userId });
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
        return `══闭关修炼══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
      } else if (data[0].status == 1) {
        return "你已经开始闭关了";
      } else {
        const Gain_spiritual_power = (data[0]["XL_bonus"]["Gai_per_second"] == 0 ?
          realm_spiritual_power[data[0]["realm"]]// 每秒获得灵力
          + data[0]["XL_bonus"]["Gai_per_second"] : // 仙灵每秒灵力
          realm_spiritual_power[data[0]["realm"]]// 每秒获得灵力
          * data[0]["XL_bonus"]["Gai_per_second"]
        )
        await ctx.database.set(
          "xianling_user",
          {
            userId: userId,
          },
          {
            Time: time,
            status: 1,
          }
        );
        return `══闭关修炼══\n【${data[0]["name"]}】\n开始时间：${formattedDate}\n每秒获得：${(Gain_spiritual_power).toFixed(2)}灵力\n请努力冲刺最顶峰吧`;
      }
    });

  ctx
    .command("仙灵")
    .subcommand("出关问世")
    .action(async ({ session }) => {
      const { userId } = session;
      const data = await ctx.database.get("xianling_user", { userId });
      const time = Math.floor(Date.now() / 1000) - data[0]["Time"]; // 闭关时间
      if (data?.length == 0) {
        return `══闭关修炼══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
      } else if (data?.[0]?.status == 1) {
        const gain_spiritual_power = await retreat_spiritual_power(ctx, userId);
        return `══出关问世══\n【${data[0]["name"]
          }】\n修炼时长：${time}秒\n获得灵力：${gain_spiritual_power.toFixed(2)}`;
      } else {
        return `══出关问世══\n【${data[0]["name"]}】\n你还没有开始闭关修炼'`;
      }
    });
  ctx
    .command("仙灵")
    .subcommand("归凡")
    .action(async ({ session }) => {
      const { userId } = session;
      let data = await ctx.database.get("xianling_user", { userId });
      if (data?.length == 0) {
        return `══归凡══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
      } else if (data[0]["GF_Restrictions"] >= 9) {
        return `══归凡══\n【${data[0]["name"]}】\n你已经归凡9次了`;
      } else if (data[0]["realm"] == 13) {
        await ctx.database.set(
          "xianling_user", { userId },
          {
            Psychic_power: 1500,
            realm: 0,
            breakthrough_probability:
              data[0]["breakthrough_probability"] + 0.01,
            shut_in_bonus: data[0]["shut_in_bonus"] + 1,
            GF_Restrictions: data[0]["GF_Restrictions"] + 1,
          }
        );
        return `══归凡══\n【${data[0]["name"]}】\n你已归凡${data[0]["GF_Restrictions"] + 1
          }次,清空当前境界及灵力,提升1%突破概率,与100%每秒获得灵力，首次不享受灵力加成。`;
      } else {
        return `══归凡══\n【${data[0]["name"]}】\n你的境界并不是【天境归凡】`;
      }
    });
  ctx
    .command("仙灵")
    .subcommand("突破")
    .action(async ({ session }) => {
      const { userId } = session;
      let data = await ctx.database.get("xianling_user", {
        userId,
      });
      if (data?.length === 0) {
        return `══闭关修炼══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
      } else if (data?.[0]["Psychic_power"] >= lingli[data[0]["realm"] + 1]) {
        const random = Random.bool(
          data[0]["breakthrough_probability"] + data[0]["Next_breakthrough"]
        ); // 突破概率
        if (random) {
          // 如果突破成功
          await ctx.database.set(
            "xianling_user",
            {
              userId: userId,
            },
            {
              realm: data[0].realm + 1,
              Next_breakthrough: 0,
            }
          );
          return `══突破境界══\n【${data[0]["name"]}】\n突破到【${realm[data[0].realm + 1]
            }】\n突破成功`;
        } else {
          // 突破失败
          const lingli = randoms.real(0.1, 0.2);
          const Psychic_power = Math.ceil(
            data[0]["Psychic_power"] - data[0]["Psychic_power"] * lingli
          );
          await ctx.database.set(
            "xianling_user",
            {
              userId: userId,
            },
            {
              Psychic_power,
              Next_breakthrough: data[0]["Next_breakthrough"] + 0.01,
            }
          );
          return `══突破境界══\n【${data[0]["name"]
            }】\n突破失败\n扣除${Math.ceil(
              data[0]["Psychic_power"] * lingli
            )}灵力，下次成功概率提高1%`;
        }
      } else {
        return `══突破境界══\n【${data[0]["name"]
          }】\n你的灵力还不够突破\n距离下个境界还需${lingli[data[0]["realm"] + 1] - data[0]["Psychic_power"]
          }`;
      }
    });
  ctx
    .command("仙灵")
    .subcommand("境界榜")
    .action(async ({ session }) => {
      const { userId } = session;
      const read = await ctx.database.get("xianling_user", {
        userId,
      });
      const allData = await ctx.database.get("xianling_user", {}); // 一次性从数据库中获取所有修仙者数据
      const validData = allData.filter((item) => item.Psychic_power > 0); //filter函数，快速排序
      validData.sort((a, b) => b.Psychic_power - a.Psychic_power); // 这部分进行排序，降序排序，b大于a的话 b排在前面
      const topTen = validData.slice(0, 10); // 排列出10人天骄
      const numeral = [
        "零、",
        "一、",
        "二、",
        "三、",
        "四、",
        "五、",
        "六、",
        "七、",
        "八、",
        "九、",
        "十、",
      ];
      let usename = ""; // 存放玩家昵称
      let realms = ""; //存放玩家境界
      let rankings = "";
      topTen.forEach((pride, index) => {
        const name = pride.name || pride.userId;
        rankings += `${numeral[(index += 1)]}\n`;
        usename += `${name}\n`;
        realms += `${realm[pride.realm]}\n`;
      });
      const carolIndex =
        validData.findIndex((entry) => entry.userId === userId) + 1;
      const message =
        carolIndex !== 0 ? `你的排名为${carolIndex}名` : "你暂未上榜";
      return h.image(
        await Generate_Ranking(rankings, usename, realms, message),
        "image/png"
      );
    });
  ctx
    .command("仙灵")
    .subcommand("灵石排行榜")
    .action(async ({ session }) => {
      const { userId } = session;
      const allData = await ctx.database.get("xianling_user", {}); // 一次性从数据库中获取所有修仙者数据
      const validData = allData.filter((item) => item["Spirit_Stone"] > 0); //filter函数，快速排序
      validData.sort((a, b) => b["Spirit_Stone"] - a["Spirit_Stone"]); // 这部分进行排序，降序排序，b大于a的话 b排在前面
      const topTen = validData.slice(0, 30); // 排列出10人天骄
      const numeral = [
       "零",
        "天一",
        "天二",
        "天三",
        "天四",
        "天五",
        "天六",
        "天七",
        "天八",
        "天九",
        "天十",
        "地一",
        "地二",
        "地三",
        "地四",
        "地五",
        "地六",
        "地七",
        "地八",
        "地九",
        "地十",
        "灵一",
        "灵二",
        "灵三",
        "灵四",
        "灵五",
        "灵六",
        "灵七",
        "灵八",
        "灵九",
        "灵十",
      ];
      let msg = ""; // 内容
      topTen.forEach((pride, index) => {
        const name = pride["name"] || pride.userId;
        msg += `┣ ${numeral[(index += 1)]} ${name} ${pride["Spirit_Stone"]}\n`;
      });
      const carolIndex =
        validData.findIndex((entry) => entry.userId === userId) + 1;
      const message =
        carolIndex !== 0 ? `┗你的排名为${carolIndex}名` : "┗你暂未上榜";
      return `┏━✪灵石排行榜✪━━\n┣ 排名 昵称 灵石\n${msg}${message}`;
    });

  ctx.command('仙灵')
    .subcommand('背包 <Page>')
    .action(async ({ session }, Page) => {
      const { userId } = session;
      let player_data = await ctx.database.get("xianling_user", { userId });
      const bag = await ctx.database.get("xianling_bag", { userId });
      const data = Page === '称号' ? Object.keys(bag[0]['bag']).reduce((acc, key) => (/\【(.+?)\】/.test(key) && (acc[key] = bag[0]['bag'][key]), acc), {}) : bag[0]['bag'];
      const total_page = Math.ceil(Object.keys(data).length / 8);
      const Page_A = Page === undefined || !/^[0-9]+$/.test(Page) ? 1 : Number(Page);
      const startIndex = (Page_A - 1) * 8;
      const endIndex = Page_A * 8;
      const items = Object.keys(data).slice(startIndex, endIndex);
      const itemsString = items.map(item => `┣⧉ ${item} x ${data[item]}`).join('\n');
      if (player_data?.length === 0) {
        return `══玩家背包══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
      } else {
        return `┏━━━玩家背包━━━\n${itemsString}\n┣━━━━━━━━━━━━\n┣ 第${Page_A}页/共${total_page}页\n┗━━━━━━━━━━━━${Page === undefined ? '' : '\nTips:指定页数【背包 [页码]】'}`;
      }
    });
  ctx.command("仙灵")
    .subcommand('境界列表')
    .action(() => {
      // 使用 for 循环遍历列表并拼接成一段文字
      let text = "";
      for (let i = 0; i < realm.length; i++) {
        text += realm[i];
        if (i < realm.length - 1) {
          text += "\n"; // 在每个元素后添加换行符，除了最后一个元素
        }
      }
      return text
    })

}

async function shrink_the_numbers(num) {
  // 定义1亿的数值
  const yi = 100000000;

  // 如果数字大于1亿，则转换为X亿的格式
  if (num > yi) {
    // 计算亿为单位的数值，并保留一位小数
    const yiValue = (num / yi).toFixed(1);
    // 返回格式化后的字符串
    return yiValue + "亿";
  } else {
    // 如果数字不大于1亿，则直接返回原数字
    return num.toFixed(2);
  }
}

async function retreat_spiritual_power(ctx: Context, userId: string) {
  // 闭关获得灵力
  const player_data = await ctx.database.get("xianling_user", { userId });
  const duration_of_retreat = Math.floor(Date.now() / 1000) - player_data[0]["Time"]; // 闭关时间 公式:现在时间-开始闭关时间= 闭关时间
  let formula = duration_of_retreat * realm_spiritual_power[player_data[0]["realm"]]; // 初始公式: 闭关时间 * 当前境界每秒获得灵力
  if (player_data[0]['shut_in_bonus'] > 0) {
    console.log('触发归凡加成')
    formula *= player_data[0]['shut_in_bonus'];
    // 初始公式 * 归凡加成
  }
  if (player_data[0]["XL_bonus"]["shut_in_bonus"] > 0) {
    console.log('触发仙灵加成');
    formula *= player_data[0]["XL_bonus"]["shut_in_bonus"];
    formula *= player_data[0]["XL_bonus"]["Gai_per_second"];
    // 初始公式 * 仙灵加成 * 仙灵时间加成
  }
  await ctx.database.set("xianling_user", { userId },
    { status: 0, Psychic_power: player_data[0]['Psychic_power'] + formula }
  );
  return formula
}