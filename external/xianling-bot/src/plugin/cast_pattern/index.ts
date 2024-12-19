import { Context, Schema, Random, h } from "koishi";
import { 添加物品, 删除物品 } from '../wilderness/index';
export const name = "xianling-bot-cast-pattern";

import { } from "@koishijs/canvas";

import cast_pattern from "../../data/cast_pattern.json";

export interface Config { }

export const Config: Schema<Config> = Schema.object({});

let randoms = new Random(() => Math.random());

declare module "koishi" {
    interface Tables {
        xianling_cast_Pattern: XC;
    }
}

export interface XC {
    id: number; // id
    userId: string; // userid
    frequency: number; // 铸纹次数
    grade: number; // 铸纹等级
    bonus: number; // 铸纹加成
    probability_of_success: number; // 下次成功概率
}

export async function apply(ctx: Context) {

    ctx.model.extend(
        "xianling_cast_Pattern",
        {
            id: "unsigned", // id
            userId: "string", // userid
            frequency: "unsigned",// 铸纹次数
            grade: "unsigned", // 铸纹等级
            bonus: "float",// 铸纹加成
            probability_of_success: "float",// 下次成功概率
        },
        { autoInc: true }
    );

    const GRADE = ["玄级初入", "玄级小成", "玄级大成", "黄级初入", "黄级小成", "黄级大成", "地级小成", "地级大成", "天级初入", "天级小成", "天级大成", "无上"];
    const BONUS = [0.21, 0.24, 0.27, 0.31, 0.34, 0.37, 0.41, 0.44, 0.47, 0.51, 0.54, 0.57, 0.70];
    const FREQUENCY = [0, 5, 10, 20, 30, 40, 60, 80, 100, 130, 160, 190, 500];

    ctx.command("仙灵")
        .subcommand('转职')
        .action(async ({ session }) => {
            const { userId } = session;
            const player_data = await ctx.database.get("xianling_user", { userId });
            const player_1_bag = await ctx.database.get('xianling_bag', { userId })
            const castPattern_data = await ctx.database.get("xianling_cast_Pattern", { userId });
            if (player_data?.length == 0) {
                return `══转职职业══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
            } else if (castPattern_data.length > 0) {
                return `══转职职业══\n【${player_data[0]['name']}】\n你已经转职了\n不能再转职了`
            } else if (player_data[0]['GF_Restrictions'] < 1) {
                return `══转职职业══\n【${player_data[0]['name']}】\n不满足条件归凡一次`
            } else if (player_data[0]['Spirit_Stone'] < 50000) {
                return `══转职职业══\n【${player_data[0]['name']}】\n你的灵石不够`
            } else if (player_1_bag[0]['bag']['转职令'] <= 0) {
                return `══转职职业══\n【${player_data[0]['name']}】\n你没有转职令`
            } else {
                await ctx.database.set('xianling_user', { userId }, { 'Spirit_Stone': player_data[0]['Spirit_Stone'] - 50000 })
                await ctx.database.create('xianling_cast_Pattern', { userId, frequency: 0, grade: 0, bonus: BONUS[0], probability_of_success: BONUS[0] })
                return `══转职职业══\n【${player_data[0]['name']}】\n转职铸纹师成功`
            }
        })
    ctx.command("仙灵")
        .subcommand("铸纹晋级")
        .action(async ({ session }) => {
            const { userId } = session;
            const player_data = await ctx.database.get("xianling_user", { userId });
            const castPattern_data = await ctx.database.get("xianling_cast_Pattern", { userId });
            if (player_data?.length == 0) {
                return `══晋级系统══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
            } else if (castPattern_data.length == 0) {
                return `══晋级系统══\n【小友】\n你还没转职铸纹师`;
            } else if (castPattern_data[0]['frequency'] < FREQUENCY[castPattern_data[0]['grade']]) {
                return `══晋级系统══\n【${player_data[0]['name']}】\n你的铸纹次数不够`;
            } else if (castPattern_data[0]['grade'] >= 12) {
                return `══晋级系统══\n【${player_data[0]['name']}】\n你的境界已经是最高的`;
            } else if (Random.bool(0.4)) {
                await ctx.database.set('xianling_cast_Pattern', { userId }, { grade: castPattern_data[0]['grade'] + 1 })
                return `══晋级系统══\n【${player_data[0]['name']}】\n晋级成功\n已晋升为【${GRADE[castPattern_data[0]['grade'] + 1]}】`;
            } else {
                await ctx.database.set('xianling_cast_Pattern', { userId }, { frequency: castPattern_data[0]['frequency'] - 5 })
                return `══晋级系统══\n【${player_data[0]['name']}】\n晋级失败\n扣除5次铸纹次数`;
            }
        })
    ctx.command("仙灵")
        .subcommand("铸纹面板")
        .action(async ({ session }) => {
            const { userId } = session;
            const player_data = await ctx.database.get("xianling_user", { userId });
            const castPattern_data = await ctx.database.get("xianling_cast_Pattern", { userId });
            if (player_data?.length == 0) {
                return `══铸纹面板══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
            } else if (castPattern_data.length == 0) {
                return `══铸纹面板══\n【小友】\n你还没转职铸纹师`;
            } else {
                return `══铸纹面板══
道号：${player_data[0]['name']}
辅修职业：铸纹师
铸纹次数：${castPattern_data[0]['frequency']}
铸纹等级：${GRADE[castPattern_data[0]['grade']]}
铸纹加成：${(castPattern_data[0]['bonus'] * 100).toFixed(2) + '%'}
铸纹排名：${await display_the_top_ranking(ctx, userId)}
下次铸纹概率：${(castPattern_data[0]['probability_of_success'] * 100).toFixed(2) + '%'}`
            }
        })
    ctx.command("仙灵")
        .subcommand("铸纹 <goods>")
        .action(async ({ session }, goods) => {
            const { userId } = session;
            const player_data = await ctx.database.get("xianling_user", { userId });
            const player_bag = await ctx.database.get("xianling_bag", { userId })
            const castPattern_data = await ctx.database.get("xianling_cast_Pattern", { userId });
            if (player_data?.length == 0) {
                return `══铸纹系统══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
            } else if (castPattern_data.length == 0) {
                return `══铸纹系统══\n【小友】\n你还没转职铸纹师`;
            } else if (!cast_pattern[goods]) {
                return `══铸纹系统══\n【${player_data[0]['name']}】\n铸纹列表里找不到此物品`;
            } else if (player_bag[0]['bag']['金灵蕴'] >= cast_pattern[goods]['材料']['金'] && player_bag[0]['bag']['木灵蕴'] >= cast_pattern[goods]['材料']['木'] && player_bag[0]['bag']['水灵蕴'] >= cast_pattern[goods]['材料']['水'] && player_bag[0]['bag']['火灵蕴'] >= cast_pattern[goods]['材料']['火'] && player_bag[0]['bag']['土灵蕴'] >= cast_pattern[goods]['材料']['土']) {
                let bag = player_bag[0]['bag'];
                bag['金灵蕴'] -= cast_pattern[goods]['材料']['金'];
                bag['木灵蕴'] -= cast_pattern[goods]['材料']['木'];
                bag['水灵蕴'] -= cast_pattern[goods]['材料']['水'];
                bag['火灵蕴'] -= cast_pattern[goods]['材料']['火'];
                bag['土灵蕴'] -= cast_pattern[goods]['材料']['土'];
                await ctx.database.set('xianling_bag', { userId }, { bag });
                const msg = `金灵蕴:${cast_pattern[goods]['材料']['金']},木灵蕴:${cast_pattern[goods]['材料']['木']},水灵蕴:${cast_pattern[goods]['材料']['水']},火灵蕴:${cast_pattern[goods]['材料']['火']},土灵蕴:${cast_pattern[goods]['材料']['土']}`
                return await determine_the_casting_pattern(ctx, userId, goods, msg);
            } else {
                return `══铸纹系统══\n【${player_data[0]['name']}】\n你的物品不足   `;
            }
        })
    // await 添加物品(ctx, '6A95763E7E3FAD8333CD1B6CD77F362F', {}, '土灵蕴', 999)
    // {"金灵蕴":999,"木灵蕴":999,"水灵蕴":999,"火灵蕴":999,"土灵蕴":999}
}

async function determine_the_casting_pattern(ctx: Context, userId: string, goods: string, msg: string) {
    const player_data = await ctx.database.get("xianling_user", { userId });
    const player_bag = await ctx.database.get("xianling_bag", { userId })
    const castPattern_data = await ctx.database.get("xianling_cast_Pattern", { userId });
    const probability_of_success = castPattern_data[0]['bonus'] + castPattern_data[0]['probability_of_success'];
    if (Random.bool(probability_of_success)) { // 概率判断
        const bonus_data = parseFloat((Math.random() * (0.05 - 0.01) + 0.01).toFixed(2)); // 概率加成 0.01-0.05
        console.log(bonus_data);
        await ctx.database.set('xianling_cast_Pattern', { userId }, {
            frequency: castPattern_data[0]['frequency']++,
            probability_of_success: parseFloat((castPattern_data[0]['probability_of_success'] - bonus_data).toFixed(2)),
        })
        await 添加物品(ctx, userId, player_bag[0]['bag'], goods, 1)
        return `══铸纹系统══\n【${player_data[0]['name']}】\n铸纹成功\n成功概率${(probability_of_success * 100).toFixed(2) + '%'}\n消耗${msg}\n${goods}已放到背包中`
    } else {
        return `══铸纹系统══\n【${player_data[0]['name']}】\n铸纹失败\n成功概率${(probability_of_success * 100).toFixed(2) + '%'}\n消耗${msg}`
    }
}

async function display_the_top_ranking(ctx: Context, userId: string) {
    const allData = await ctx.database.get("xianling_cast_Pattern", {}); // 一次性从数据库中获取所有修仙者数据
    const validData = allData.filter((item) => item["frequency"] > 0); //filter函数，快速排序
    validData.sort((a, b) => b["frequency"] - a["frequency"]); // 这部分进行排序，降序排序，b大于a的话 b排在前面
    const carolIndex = validData.findIndex((entry) => entry.userId === userId) + 1;
    return `${carolIndex}`
}