import { Context, Schema, Random, h } from "koishi";
import { 添加物品, 删除物品 } from '../wilderness/index';

export const name = "xianling-bot-taoist-couple";

import marriage_props from "../../data/marriage_props.json";


import { } from "@koishijs/canvas";

export interface Config { }

export const Config: Schema<Config> = Schema.object({});

let randoms = new Random(() => Math.random());

declare module "koishi" {
    interface Tables {
        xianling_taoist_couple: XT;
    }
}

class TaoistCouple {
    userId: string // 用户id
    applicant: string // 申请人id
    constructor(userId: string, applicant: string) {
        // // 初始化用户和申请人
        this.userId = userId
        this.applicant = applicant
    }
    static async get(userId: string, applicant) {
        return new TaoistCouple(userId, applicant);
    }
}

interface PlayerData {
    [userId: string]: TaoistCouple;
}
let Player_Data: PlayerData = {};

export interface XT {
    id: number; // id
    userId: string; // userid
    taoist_couple_id: string; // 道侣id
    taoist_couple_name: string; // 道侣名称
    marriage_value: number;//姻缘值
    application_status: number; //申请状态 0代表无 1代表申请中
    double_major: object; // 双修 {date:"2024-1-1",frequency:1}
}

export async function apply(ctx: Context) {
    ctx.model.extend("xianling_taoist_couple",
        {
            id: "unsigned", // id
            userId: "string", // userId
            taoist_couple_id: "string", // 道侣id
            taoist_couple_name: 'string', // 道侣名称
            marriage_value: "unsigned",//姻缘值
            application_status: "unsigned",
            double_major: { type: "json", initial: { date: "", frequency: 3, } }, // 双修
        },
        {
            autoInc: true,
        }
    );

    ctx.command('仙灵')
        .subcommand('道侣面板')
        .action(async ({ session }) => {
            const { userId } = session;
            await theNumberOfRefreshes(ctx, userId)
            const player_data = await ctx.database.get('xianling_user', { userId });
            const player_taoist_couple = await ctx.database.get('xianling_taoist_couple', { userId });
            if (player_data.length == 0) {
                return `══道侣面板══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
            } else if (player_taoist_couple[0]['taoist_couple_id'] == "") {
                return `══道侣面板══\n【小友】\n别自欺欺人了~你没有道侣~`;
            } else {
                return `══道侣面板══
☯️道号：【${player_data[0]['name']}】
💕道侣：【${player_taoist_couple[0]['taoist_couple_name']}】
❣️姻缘值：${player_taoist_couple[0]['marriage_value']}
💝情缘等级：${relationship_level_display(player_taoist_couple[0]['marriage_value'])}
三生石排名：${await display_the_top_ranking(ctx, userId)}
💗双修剩余次数：${player_taoist_couple[0]['double_major']['frequency']}`;
            }
        })
    ctx.command("仙灵")
        .subcommand("结缘 <name:string>")
        .action(async ({ session }, name) => {
            const { userId } = session;
            const player_1_data = await ctx.database.get('xianling_user', { userId });
            const player_2_data = await ctx.database.get('xianling_user', { name });
            const player_1_taoist_couple = await ctx.database.get('xianling_taoist_couple', { userId });
            const player_2_taoist_couple = await ctx.database.get('xianling_taoist_couple', { userId: player_2_data?.[0]?.['userId'] });
            if (player_1_data.length == 0) {
                return `══结为道侣══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
            } else if (!name) {
                return `══结为道侣══\n【${player_1_data[0]['name']}】\n格式错误\n正确格式：结缘 玩家名`;
            } else if (player_2_data.length == 0) {
                return `══结为道侣══\n【${player_1_data[0]['name']}】\n找不到这个人`;
            } else if (name == player_1_data[0]['name']) {
                return `══结为道侣══\n【${player_1_data[0]['name']}】\n不能和自己结为道侣`;
            } else if (player_2_taoist_couple[0]['taoist_couple_id'] != "") {
                return `══结为道侣══\n【${player_1_data[0]['name']}】\n对方有道侣了`;
            } else if (player_1_taoist_couple[0]['taoist_couple_id'] != "") {
                return `══结为道侣══\n【${player_1_data[0]['name']}】\n你已经有道侣了`;
            } else if (player_1_taoist_couple[0]['application_status'] == 1) {
                return `══结为道侣══\n【${player_1_data[0]['name']}】\n你已经向他人申请结缘了`;
            } else {
                setTimeout(async () => {
                    if (!Player_Data[player_2_data[0]['userId']]) { } else {
                        await ctx.database.set('xianling_taoist_couple', { userId }, { application_status: 0 })
                        delete Player_Data[player_2_data[0]['userId']]
                        session.send(`══结为道侣══\n【${player_1_data[0]["name"]}】\n1分钟已到,取消申请结缘`);
                    }
                }, 60000);
                await ctx.database.set('xianling_taoist_couple', { userId }, { application_status: 1 })
                Player_Data[player_2_data[0]['userId']] = await TaoistCouple.get(player_2_data[0]['userId'], userId);
                return `══结为道侣══\n【${player_1_data[0]['name']}】\n已经向对方申请结缘啦💌！等待对方回应\n`;
            }
        });
    ctx.command("仙灵")
        .subcommand('情缘使用 <prop>')
        .action(async ({ session }, prop) => {
            const { userId } = session;
            const player_1_data = await ctx.database.get('xianling_user', { userId });
            const player_1_bag = await ctx.database.get('xianling_bag', { userId })
            const player_1_taoist_couple = await ctx.database.get('xianling_taoist_couple', { userId });
            if (player_1_data.length == 0) {
                return `══情缘使用══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
            } else if (player_1_taoist_couple[0]['taoist_couple_id'] == "") {
                return `══情缘使用══\n【${player_1_data[0]['name']}】\n你并没有道侣`;
            } else if (player_1_bag[0]['bag'][prop] <= 0 || !player_1_bag[0]['bag'][prop]) {
                return `══情缘使用══\n【${player_1_data[0]['name']}】\n你沒有这个道具`;
            } else if (!marriage_props[prop]) {
                return `══情缘使用══\n【${player_1_data[0]['name']}】\n没有这种情缘道具`;
            } else {
                await 删除物品(ctx, userId, player_1_bag[0]['bag'], prop, 1);
                await ctx.database.set('xianling_user', { userId }, { Spirit_Stone: player_1_data[0]['Spirit_Stone'] + marriage_props[prop]["效果"]["Spirit_Stone"] });
                await ctx.database.set('xianling_taoist_couple', { userId }, { marriage_value: player_1_taoist_couple[0]['marriage_value'] + marriage_props[prop]["效果"]["marriage_value"] })
                return `══情缘使用══\n【${player_1_data[0]['name']}】\n使用成功\n增加灵石${marriage_props[prop]["效果"]["Spirit_Stone"]}颗\n姻缘值增加${marriage_props[prop]["效果"]["marriage_value"]}`;
            }
        })
    ctx.command("仙灵")
        .subcommand("缘尽")
        .action(async ({ session }) => {
            const { userId } = session;
            const player_1_data = await ctx.database.get('xianling_user', { userId });
            const player_1_taoist_couple = await ctx.database.get('xianling_taoist_couple', { userId });
            if (player_1_data.length == 0) {
                return `══缘至意尽══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
            } else if (player_1_taoist_couple[0]['taoist_couple_id'] == "") {
                return `══缘至意尽══\n【${player_1_data[0]['name']}】\n你并没有道侣`;
            } else {
                let confirm = '';
                if (confirm == '') {
                    session.send(`道友真的准备和自己的道侣离婚吗，如果依然坚持请在一分钟内发送【确认姻缘解除】`)
                    confirm = await session.prompt(60000);
                }
                if (confirm == '确认姻缘解除' || confirm == '【确认姻缘解除】') {
                    await ctx.database.set('xianling_taoist_couple', { userId: player_1_taoist_couple[0]['taoist_couple_id'] }, {
                        taoist_couple_id: '',
                        taoist_couple_name: '',
                        marriage_value: 0
                    })
                    await ctx.database.set('xianling_taoist_couple', { userId }, {
                        taoist_couple_id: '',
                        taoist_couple_name: '',
                        marriage_value: 0
                    })
                    session.send(`确认解除成功`)
                } else {
                    session.send(`一分钟到了，取消解除`)
                }
            }
        })
    ctx.command("仙灵")
        .subcommand("同意结缘")
        .action(async ({ session }) => {
            const { userId } = session;
            const player_1_data = await ctx.database.get('xianling_user', { userId });
            const players_apply = Player_Data[userId];
            const player_2_data = await ctx.database.get('xianling_user', { userId: players_apply?.['applicant'] });
            if (player_1_data.length == 0) {
                return `══同意结缘══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
            } else if (!players_apply) {
                return `══同意结缘══\n【${player_1_data[0]['name']}】\n还没有人向你申请结缘\n不要自欺欺人啦`;
            } else {
                delete Player_Data[userId]
                await ctx.database.set('xianling_taoist_couple', { userId }, {
                    taoist_couple_id: players_apply['applicant'],
                    taoist_couple_name: player_2_data[0]['name'],
                    marriage_value: 100
                })
                await ctx.database.set('xianling_taoist_couple', { userId: players_apply['applicant'] }, {
                    taoist_couple_id: userId,
                    taoist_couple_name: player_1_data[0]['name'],
                    marriage_value: 100
                })
                return `══同意结缘══\n【${player_1_data[0]['name']}】\n同意结缘成功，目前状态已结缘`;
            }
        })
    ctx.command("仙灵")
        .subcommand("道侣双修")
        .action(async ({ session }) => {
            const { userId } = session;
            const player_1_data = await ctx.database.get('xianling_user', { userId });
            const player_1_taoist_couple = await ctx.database.get('xianling_taoist_couple', { userId });
            const player_2_data = await ctx.database.get('xianling_user', { userId: player_1_taoist_couple?.[0]['taoist_couple_id'] });
            const player_2_taoist_couple = await ctx.database.get('xianling_taoist_couple', { userId: player_2_data?.[0]?.['userId'] });
            const time = Math.floor(Date.now() / 1000);
            const currentDate = new Date(time * 1000);
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, "0");
            const day = String(currentDate.getDate()).padStart(2, "0");
            const formattedDate = `${year}-${month}-${day}`;
            if (player_1_data.length == 0) {
                return `══双人修行══\n【小友】\n你还未踏入这片世界\nTips：发送“踏入世界 昵称 性别”`;
            } else if (player_1_taoist_couple?.[0]?.['taoist_couple_id'] == '') {
                return `══双人修行══\n【${player_1_data[0]['name']}】\n你没道侣`;
            } else if (player_1_taoist_couple[0]['double_major']['date'] == formattedDate && player_1_taoist_couple[0]['double_major']['frequency'] <= 0) {
                return `══双人修行══\n【${player_1_data[0]['name']}】\n今日双修次数已用完`;
            } else {
                return await double_major(ctx, userId);
            }
        })
    ctx.command("仙灵")
        .subcommand("三生石")
        .action(async ({ session }) => {
            const { userId } = session;
            const allData = await ctx.database.get("xianling_taoist_couple", {}); // 一次性从数据库中获取所有修仙者数据
            const validData = allData.filter(item => item["marriage_value"] > 0); // filter函数，快速筛选
            validData.sort((a, b) => b["marriage_value"] - a["marriage_value"]); // 降序排序
            const topTen = validData.slice(0, 10); // 取前10名
            let text = ""; // 内容
            // 异步获取用户信息并构建text字符串
            for (let index = 0; index < topTen.length; index++) {
                const pride = topTen[index];
                const userId = pride['userId'];
                const data = await ctx.database.get('xianling_user', { userId });
                text += `${index + 1} ${data[0]['name']} ${relationship_level_display(pride["marriage_value"])} ${pride['taoist_couple_name']}\n`;
            }
            const carolIndex = validData.findIndex((entry) => entry.userId === userId) + 1;
            const message = carolIndex !== 0 ? `你的排名为${carolIndex}名` : "你暂未上榜";
            return `════三生石════\n${text}\n${message}`;
        });
}

function relationship_level_display(num: number) {
    //  恋人（100），燕尔（1000），长青（10000），婉安（100000），不渝（1000000）
    if (num <= 100) {
        return '恋人';
    } else if (num <= 1000) {
        return '燕尔';
    } else if (num <= 10000) {
        return '长青';
    } else if (num <= 100000) {
        return '婉安';
    } else if (num <= 1000000) {
        return '不渝';
    } else {
        return '出错!请联系开发者';
    }
}
async function display_the_top_ranking(ctx: Context, userId: string) {
    const allData = await ctx.database.get("xianling_taoist_couple", {}); // 一次性从数据库中获取所有修仙者数据
    const validData = allData.filter((item) => item["marriage_value"] > 0); //filter函数，快速排序
    validData.sort((a, b) => b["marriage_value"] - a["marriage_value"]); // 这部分进行排序，降序排序，b大于a的话 b排在前面
    const carolIndex = validData.findIndex((entry) => entry.userId === userId) + 1;
    return `${carolIndex}`
}

async function double_major(ctx: Context, userId: string) {
    const player_1_data = await ctx.database.get('xianling_user', { userId });
    const player_1_taoist_couple = await ctx.database.get('xianling_taoist_couple', { userId });
    const player_2_data = await ctx.database.get('xianling_user', { userId: player_1_taoist_couple?.[0]['taoist_couple_id'] });
    const player_2_taoist_couple = await ctx.database.get('xianling_taoist_couple', { userId: player_2_data[0]['userId'] });
    const time = Math.floor(Date.now() / 1000);
    const currentDate = new Date(time * 1000);
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    if (player_1_taoist_couple[0]['double_major']['date'] != formattedDate) {
        let obj = player_1_taoist_couple[0]['double_major'];
        obj['date'] = formattedDate;
        obj['frequency'] = 3;
        // 一次性更新所有数据
        await ctx.database.set("xianling_taoist_couple", { userId }, { double_major: obj });
        await ctx.database.set("xianling_taoist_couple", { userId: player_2_data[0]['userId'] }, { double_major: obj });
    }
    const sum = player_1_data[0]['Psychic_power'] + player_2_data[0]['Psychic_power']; // 玩家1总灵力 + 玩家2总灵力
    const compute = sum * 0.05; //灵力和的5%
    const limit = compute > 10000000 ? 10000000 : compute; //判断是否超过1000w不超过的话返回原来的
    let obj = player_1_taoist_couple[0]['double_major'];
    obj['date'] = formattedDate;
    obj['frequency']--;
    // 一次性更新所有数据
    await ctx.database.set("xianling_taoist_couple", { userId }, {
        'marriage_value': player_1_taoist_couple[0]['marriage_value'] + 10,
        'double_major': obj
    });
    await ctx.database.set("xianling_user", { userId: player_1_data[0]['userId'] }, {
        'Psychic_power': player_1_data[0]['Psychic_power'] + limit
    });
    await ctx.database.set("xianling_taoist_couple", { userId: player_2_data[0]['userId'] }, {
        'marriage_value': player_2_taoist_couple[0]['marriage_value'] + 10,
        'double_major': obj
    });
    await ctx.database.set("xianling_user", { userId: player_2_data[0]['userId'] }, {
        'Psychic_power': player_2_data[0]['Psychic_power'] + limit
    });
    return `══双人修行══\n【${player_1_data[0]['name']}】\n和你道侣双修获得10情缘值\n并各获得${limit}灵力`;
}

async function theNumberOfRefreshes(ctx: Context, userId: string) {
    const player_1_data = await ctx.database.get('xianling_user', { userId });
    const player_1_taoist_couple = await ctx.database.get('xianling_taoist_couple', { userId });
    const player_2_data = await ctx.database.get('xianling_user', { userId: player_1_taoist_couple?.[0]['taoist_couple_id'] });
    const player_2_taoist_couple = await ctx.database.get('xianling_taoist_couple', { userId: player_2_data[0]['userId'] });
    const time = Math.floor(Date.now() / 1000);
    const currentDate = new Date(time * 1000);
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    if (player_1_taoist_couple[0]['double_major']['date'] != formattedDate) {
        let obj = player_1_taoist_couple[0]['double_major'];
        obj['date'] = formattedDate;
        obj['frequency'] = 3;
        // 一次性更新所有数据
        await ctx.database.set("xianling_taoist_couple", { userId }, { double_major: obj });
        await ctx.database.set("xianling_taoist_couple", { userId: player_2_data[0]['userId'] }, { double_major: obj });
    }
}