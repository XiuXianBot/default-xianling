import { Context, Schema, h } from 'koishi';
import { } from 'koishi-plugin-smmcat-localstorage'
import fs from 'fs/promises';
import path from 'path';
import { createPathMapByDir, createDirMapByObject } from './mapTool';

export const name = 'smmcat-xiuxiangalmark'
import { } from 'koishi-plugin-word-core';

export interface Config {
  mapAddress: string;
  overtime: number;
  debug: boolean;
  tipsProp: boolean;
}

export const usage = `
通过创建文件夹生成对应映射关系的多分支简单修仙剧情向制作插件 是 galmark 的改版
 
 - result.text 中的内容代表最终的结局（会忽略同级并同级后续的文件夹）
 - title.text 中的内容代表该层级剧情的描述

只要上述文件放置在对应文件夹中，就会有对应的效果

通过 %标识符% 去实现 跳转分支、条件跳转、获得道具、失去道具、判断道具是否持有 等功能

- %jumpByLostProp% 标识符，通过交出持有物才可跳转分支 举例：参数示例：%jumpByLostProp|金币*4?1-1-1%
- %jumpByCheckProp%标识符，通过查询是否携带持有物才可跳转分支，参数示例：%jumpByCheckProp|金币*4?1-1-1%
- %getProp%标识符，获得道具 参数示例：%getProp|金币*4%
- %lostProp%标识符，失去道具 参数示例：%getProp|金币*4%
- %getAchievements%标识符，获得成就 用户在该分支下将获得对应成就名的成就 参考示例：%getAchievements|冒险王%
    

从 0.1.0 版本后，需要使用 [smmcat-localstorage](/market?keyword=smmcat-localstorage) 服务来实现本地化存档操作，用于重启 Koishi 后仍然保留玩家数据
当启用[word-core](/market?keyword=word-core)与[word-core-grammar-basic](/market?keyword=word-core-grammar-basic)插件后，可以将回复接入词库解析
***
如果你对 galgame 感兴趣，或者想一起写剧本；[欢迎加群](https://qm.qq.com/q/i1OHiS7aD0)
`

export const Config: Schema<Config> = Schema.object({
  mapAddress: Schema.string().default('./data/smm-xiuxiangalmark').description('剧本结构放置位置'),
  overtime: Schema.number().default(30000).description('对话访问的超时时间'),
  debug: Schema.boolean().default(false).description('日志查看更多信息'),
  tipsProp: Schema.boolean().default(true).description('当不满足要求将提示所需要的物品')
});

export function apply(ctx: Context, config: Config) {
  // 模板内容
  const addTemplate = async (upath) => {
    const obj = [
      {
        "name": "1.进入剧情模式",
        "child": [
          {
            "name": "1.无视他",
            "child": [
              {
                "name": "1.言尊（域外墟界墟兽抚养长大的不知身世的小男孩）",
                "child": [
                  {
                    "name": "1.继续模拟",
                    "child": [],
                    "title": "%jumpBranch|1-3-1%"
                  }
                ],
                "title": "墟界乃是仙灵大陆以外的域外虚空产物，一切死寂与虚无的统称，同时又被冠以灾厄的称呼。整个墟界因为虚无的力量寸草不生，生命凋零，唯有一种生物才可以在这里长存，它的名字叫墟兽。\r\n墟兽无神无智，生性贪婪，不同于其他的先天神兽，它没有传承和死亡一说，它由域外虚空最纯粹的吞噬和凋零的虚无之力凝聚而成，是活生生的杀戮兵器，但凡它所来到的地方必然生灵涂炭，天地灵气道则弥散。\r\n更有大修士传言，墟界曾经也存在着一个前所未有的辉煌的黄金时代。\r\n仙灵纪前一千二百四十年，你出身了，你的出身极其不合理，你是墟界意志应运所诞生的产物，无父无母，先天而生，人体神魂，一出生就拥有世间五大基础力中的虚无之力，但是很遗憾，你还不会使用他。"
              }
            ],
            "title": "四周的混沌逐渐凝实，浊气下沉托其你的身体，清气上浮扩散遮盖天空，片刻之间，一个广袤无垠的纯白色空间出现在你的眼前，你被这一切震惊并疑惑于自己所处的地方。\r\n那个古老的声音丝毫不在乎你的无视，她更像是跨越时间的某种拟定好的设计，古板教条。\r\n“道友，我们曾经所经历的背叛不应当被重演，世界的尽头已不是重启，而是终点。”\r\n（你无视了她的话语，企图在这里搜寻些什么，却不料一股巨大的吸力讲你拉回现实。）\r\n“这个破碎的未来需要得到有缘人的纠正。”\r\n“道友，可否让我带你去窥 见那古老的过去。”\r\n\r\n请选择您的身份:"
          },
          {
            "name": "2.继续聆听",
            "child": [
              {
                "name": "1.言尊（域外墟界墟兽抚养长大的不知身世的小男孩）",
                "child": [
                  {
                    "name": "1.继续模拟",
                    "child": [],
                    "title": "%jumpBranch|1-3-1%"
                  }
                ],
                "title": "墟界乃是仙灵大陆以外的域外虚空产物，一切死寂与虚无的统称，同时又被冠以灾厄的称呼。整个墟界因为虚无的力量寸草不生，生命凋零，唯有一种生物才可以在这里长存，它的名字叫墟兽。\r\n墟兽无神无智，生性贪婪，不同于其他的先天神兽，它没有传承和死亡一说，它由域外虚空最纯粹的吞噬和凋零的虚无之力凝聚而成，是活生生的杀戮兵器，但凡它所来到的地方必然生灵涂炭，天地灵气道则弥散。\r\n更有大修士传言，墟界曾经也存在着一个前所未有的辉煌的黄金时代。\r\n仙灵纪前一千二百四十年，你出身了，你的出身极其不合理，你是墟界意志应运所诞生的产物，无父无母，先天而生，人体神魂，一出生就拥有世间五大基础力中的虚无之力，但是很遗憾，你还不会使用他。"
              },
              {
                "name": "2.仙灵 （仙灵世界内境由天地衍生的先天水之神灵）",
                "child": [],
                "title": "%jumpBranch|1-3-2%"
              },
              {
                "name": "3.花夭 （卑微弱小的邪魔妖族中年幼桃花妖花夭）",
                "child": [],
                "title": "%jumpByCheckProp|作者更新|1%"
              },
              {
                "name": "4.一只叶子（仙灵大陆上神秘的精灵族的未经世事的圣女）",
                "child": [],
                "title": "%jumpBranch|1-3-3%"
              }
            ],
            "title": "面对莫名奇妙的声音和这里奇异的空间，你沉着冷静，想要以不变胜万变，并试图从这些对话中找到离开这里和你出现的关键。\r\n“我知你所想，闻你所闻，感你所思，”\r\n“道友，我所生活的世界早已经支离破碎。还请求您在之后，能救救仙灵大陆的苍 生。”\r\n（仙灵的声音逐渐变淡，空间也开始弥散，三张金色的卡牌在你眼前一闪而过。）\r\n\r\n请选择您的身份:"
          },
          {
            "name": "3.__discard",
            "child": [
              {
                "name": "1.言尊主线",
                "child": [
                  {
                    "name": "1.继续修炼",
                    "child": [
                      {
                        "name": "1.仍然继续修炼",
                        "child": [
                          {
                            "name": "1.坚持继续修炼",
                            "child": "墟界天地大道残缺，纵使你天赋过人，寿命也不是无穷无限，直到化为尘土，也依然只是领悟到半步地境便仙逝而去。\r\n\r\n本次模拟结束，你已获得言尊的全部生平。"
                          },
                          {
                            "name": "2.寻找离开墟界的办法",
                            "child": [],
                            "title": "%jumpBranch|1-3-1-1-1-2%"
                          }
                        ],
                        "title": "你继续修炼，即使感受到修炼稍微有所停滞。但是这丝毫不影响你凭借天赋继续强大自己的力量。\r\n然而，当你再次破境时，你才发现，你甚至不知道下一个境界达到的条件，你有些迷茫，你最后的境界停滞到了灵境妙法。"
                      },
                      {
                        "name": "2.寻找离开墟界的办法",
                        "child": [
                          {
                            "name": "1.继续寻找离开的办法",
                            "child": "墟界的来历久远，由于特殊的原因你又总能在梦境中窥探到那个世界的点点滴滴。\r\n你放弃了了每日的苦修，选择了主动去接受这些记忆。\r\n.........\r\n五十年后，由于你自身的寿元问题你不得不停止了这种吸收，但此时你也已经博古通今 ，知晓天地大事，并且寻找到了进入其他世界的方法，现在只要找到其他世界的方位即可。\r\n不过想要凿开世界壁垒最差也要是神境，以你的的实力恐怕难以实现。\r\n同时你也知道墟界原先不叫墟界，而是因为一场旷古的世界大战而致使大道崩塌，最终落寞成为位面中的一颗芥子，究其原因，墟界在鼎盛时期时有强大的势力想要合力窥探世间最后的境界，传说中只属于天道的境界。\r\n那个境界的名字和描述已经遗落，你想，不如称其为无上吧。"
                          }
                        ],
                        "title": "墟界大道残缺，而你又缺乏正常的修炼方法，你意识到自己去寻找突破的契机。\r\n你从梦境的一角似乎看到了墟界曾经那个繁荣的时代，在这么多年的苦修中你也知道了虚兽的来源，墟兽乃是无数生魂所聚的强大个体，这些生魂活着的时候无一不是一方镇压天地的强者，哪怕是在死后，神魂也历经万年不灭，并最终在虚无之力的影响下变成了这种恐怖的生物，而你特殊的个体，导致它们误以为你身上的虚无之力是他们高贵的王。\r\n同时，你又窥探到了另一个世界的边境，遗憾的是那里有高高的壁垒，让你无法通过。"
                      }
                    ],
                    "title": "你继续修炼，你得天独厚的天赋和先天而生的强大体制使得你很快步入了灵境，窥探到了墟界记忆里那份名为仙灵的力量。\r\n仙灵之力，乃是个人力量达到极致接近于道的体现，灵境者，悟天地大势，引世间三气五道为己用，开石破甲，肉体凡胎而不损于水火，异于常人。\r\n然而当你继续修炼时，仍然感受到了收取停滞之感，你似乎意识到了自己的修炼缺少了什么。"
                  },
                  {
                    "name": "2.寻找离开墟界的办法",
                    "child": [
                      {
                        "name": "1.继续寻找离开的办法",
                        "child": [
                          {
                            "name": "1.继续探索墟界",
                            "child": [
                              {
                                "name": "1.放弃它继续探索",
                                "child": [
                                  {
                                    "name": "1.选择年轻的那个世界",
                                    "child": [
                                      {
                                        "name": "1.继续",
                                        "child": [
                                          {
                                            "name": "1.继续",
                                            "child": [
                                              {
                                                "name": "1.后续",
                                                "child": [
                                                  {
                                                    "name": "1.返回序章",
                                                    "child": "%jumpBranch%"
                                                  }
                                                ],
                                                "title": "仙灵纪前五百年，墟界主宰言尊破域而来，携带着古老的域外神兽，那些神兽残暴血腥，吞噬万物，所处之地皆化为虚无。\r\n那些追随言尊的背叛者们高呼着虚尊的威名，传颂着“万物皆幻化，终当归虚无”的鬼话，他们致使天下生灵涂炭，根本没有人是它们的对手。\r\n直到........\r\n%getAchievements|言神%"
                                              }
                                            ],
                                            "title": "在历经无数磨难和艰险，你来到了这个正值壮年的世界面前，你能够感受到其中不同于墟界的强大生命力，你心有所感，终于步入地境，沟通自然，可引天地之力为自己所用，翻江倒海，踏空而行。\r\n（你触摸着世界壁垒，用尽全部功力以虚无之力企图在壁垒上撕开一道口子。）\r\n突然间，一道光亮从裂缝中照亮了你的双瞳，你终于窥见了黑白之外的世界。\r\n——仙灵大陆"
                                          }
                                        ],
                                        "title": "历经千辛万苦。来到了这"
                                      }
                                    ],
                                    "title": "%jumpByCheckProp|重生*1|1-3-1-2-1-1-1-1-1%"
                                  },
                                  {
                                    "name": "2.选择老迈的那个世界",
                                    "child": [
                                      {
                                        "name": "1.继续攻克壁垒",
                                        "child": [
                                          {
                                            "name": "1.坚持攻克壁垒",
                                            "child": [
                                              {
                                                "name": "1.选择年轻的世界",
                                                "child": [],
                                                "title": "%getProp|重生*1%\r\n%jumpBranch|1-3-1-2-1-1-1-1-1-1%"
                                              }
                                            ],
                                            "title": "在你即将因为攻克壁垒而耗尽力量的前夕，一股跨越时间和空间的力量洞穿壁垒并最终将你接引入了世界，在你死亡的前夕你才恍然发现这里的世界也早已像墟界那样崩解破碎，早已不具备了生命的存在条件。"
                                          },
                                          {
                                            "name": "2.选择年轻的世界",
                                            "child": [],
                                            "title": "%jumpByCheckProp|重生*1|1-3-1-2-1-1-1-1-1%"
                                          }
                                        ],
                                        "title": "那股视线的窥视愈发不加掩饰，你时常能够感受到那股威压在警告着你，而且你攻克壁垒的工作毫无进度，再这样下去，就算这个恐怖的存在不攻击你，你也会困死在这里。"
                                      },
                                      {
                                        "name": "2.选择年轻的世界",
                                        "child": [],
                                        "title": "%jumpByCheckProp|重生*1|1-3-1-2-1-1-1-1-1%"
                                      }
                                    ],
                                    "title": "你贸然进入，却发现世界壁垒异常坚固，你根本无法破开壁垒，而且在冥冥之间一股强大的气息锁定了你，你被不可名状的存在饶有兴趣的打量着却不知是福是祸。"
                                  }
                                ],
                                "title": "历经磨难，凭借你丰厚的知识你很快就找到了第二，甚至第三个世界壁垒"
                              },
                              {
                                "name": "2.就决定是它了",
                                "child": "你发现就这种强度的世界，简直脆弱不堪，你凭借刚刚达到的半步地境修为轻松进入，却不料世界顷刻间崩溃。"
                              }
                            ],
                            "title": "虽然你的修为依然微薄，但是凭借这些年以来你学习的知识，你已经可以避开大部分的选项，并最终找到了一个世界的壁垒。\r\n这个世界尚未成型，还很年幼。"
                          },
                          {
                            "name": "2.继续寻找离开的其他办法",
                            "child": "对于一个世界来说，处于世界壁垒外的地方被称之为域外，域外对于世界有太多的不可确定性，往往伴随着着灭顶之灾。\r\n你选择了继续寻找其他离开的办法，但是直到寿元枯竭，也一无所获，不过在生命的最后一刻，你突然想到用法阵的方法来层层突破壁垒，但是遗憾的是你已经没有时间去寻找离开的办法了。\r\n不过你明白，未来如果有人像你一样寻找，决不能选择幼年或者老年的世界，因为过于年幼的世界很容易崩溃，过度老迈的世界不确定因素太多。"
                          }
                        ],
                        "title": "墟界的来历久远，由于特殊的原因你又总能在梦境中窥探到那个世界的点点滴滴。\r\n你放弃了了每日的苦修，选择了主动去接受这些记忆。\r\n.........\r\n五十年后，由于你自身的寿元问题你不得不停止了这种吸收，但此时你也已经博古通今， 知晓天地大事，并且寻找到了进入其他世界的方法，现在只要找到其他世界的方位即可。\r\n不过想要凿开世界壁垒最差也要是神境，以你的的实力恐怕难以实现。\r\n同时你也知道墟界原先不叫墟界，而是因为一场旷古的世界大战而致使大道崩塌，最终落寞成为位面中的一颗芥子，究其原因，墟界在鼎盛时期时有强大的势力想要合力窥探世间最后的境界，传说中只属于天道的境界。\r\n那个境界的名字和描述已经遗落，你想，不如称其为无上吧。"
                      },
                      {
                        "name": "2.探索墟界",
                        "child": "你选择了探索墟界，在茫茫星海中，你凭借微薄的修为根本难以为继长时间的旅行，最终老死在了寻找其它世界的路上。\r\n\r\n本次模拟结束，你已获得言尊的全部生平。"
                      }
                    ],
                    "title": "墟界大道残缺，而你又缺乏正常的修炼方法，你意识到自己去寻找突破的契机。\r\n你从梦境的一角似乎看到了墟界曾经那个繁荣的时代，在这么多年的苦修中你也知道了虚兽的来源，墟兽乃是无数生魂所聚的强大个体，这些生魂活着的时候无一不是一方镇压天地的强者，哪怕是在死后，神魂也历经万年不灭，并最终在虚无之力的影响下变成了这种恐怖的生物，而你特殊的个体，导致它们误以为你身上的虚无之力是他们高贵的王。\r\n同时，你又窥探到了另一个世界的边境，遗憾的是那里有高高的壁垒，让你无法通过"
                  }
                ],
                "title": "言尊继续成长，因为他特殊的存在，就连无神无智的墟兽也与他十分亲近，在百年的成长中，他总能梦到一些战乱和残暴血腥的战斗场面，他无比确定这些场景都是在墟界。\r\n言尊渴望能有一个人可以和他交流，在这一百年的时光里，他通过那些古老的梦境学习到了来自人族甚至不止于人族的知识，他似乎有些渴望能遇到这些有血有肉的生命，而不是死寂的墟界和荒谬的墟兽。"
              },
              {
                "name": "2.仙灵主线",
                "child": [
                  {
                    "name": "1.推演历史",
                    "child": [
                      {
                        "name": "1.拒绝推演",
                        "child": [
                          {
                            "name": "1.返回序章",
                            "child": "%jumpBranch|1%"
                          }
                        ],
                        "title": "获得成就：没有成就"
                      },
                      {
                        "name": "2.窥探梦境",
                        "child": [
                          {
                            "name": "1.救助他",
                            "child": [
                              {
                                "name": "1.询问苏啻为何受伤",
                                "child": [
                                  {
                                    "name": "1.也对妖族感到不满",
                                    "child": [
                                      {
                                        "name": "1.助他",
                                        "child": [
                                          {
                                            "name": "1.返回序章",
                                            "child": "%jumpBranch|1%"
                                          }
                                        ]
                                      },
                                      {
                                        "name": "2.让他离开",
                                        "child": [
                                          {
                                            "name": "1.返回序章",
                                            "child": "%jumpBranch|1%"
                                          }
                                        ],
                                        "title": "你又道：“你还尽快离开此地，这里不乏有大危机出现，我护你不了多久。”\r\n（你已改变历史，推演失败。）"
                                      }
                                    ],
                                    "title": "苏啻感受到你愤懑的目光，苦笑一声：“可是妖族大帝花夭翻山倒海，腾云驾雾，它那花海不知我多少战士 成为养分。先天差距，我人族灭亡是早晚的事。”\r\n说着竟然是要撞死在墙壁之上。\r\n你劝阻道：“你若现在走了，你的那些子民可连柱子也没得抱了。”"
                                  },
                                  {
                                    "name": "2.催促他继续讲下去",
                                    "child": [
                                      {
                                        "name": "1.继续支持",
                                        "child": [
                                          {
                                            "name": "1.后续",
                                            "child": [
                                              {
                                                "name": "1.返回序章",
                                                "child": "%jumpBranch|1%"
                                              }
                                            ],
                                            "title": "仙灵纪前四百五十年，弑神之战爆发。\r\n扰乱心智的邪神仙灵屠戮天下苍生，最终被人王斩杀。\r\n歌颂吾王，他坚毅勇敢，无所不能\r\n%getAchievements|仙灵%"
                                          }
                                        ],
                                        "title": "人族终于可以在正面战场上稍稍有些许还击的力量，加之妖族大帝花夭的莫名失踪，人族仙灵力量掌控者得以喘息。\r\n同时苏啻发现了更多可以促使人族用其他方法获得本源力量的方法。\r\n人族急于获得一份属于自己管辖的力量。\r\n同时神族长老斥责了你，怒骂你会引来灾厄。\r\n你也明白自己所做的一切，有些许后悔，并自愿离开神族前往人族，放弃一身力量以忏悔。\r\n可是你万万没有想到，这一去，神族便死伤殆尽。\r\n在所有掌握本源力量的种族中属神族最为特殊，它们空有强大的力量却不知道如何使用，只知道救助异族人。\r\n刚刚崛起的人族很快盯上了这块肥肉。\r\n成为凡人的你还在人族行医救人，却不知种族被灭。\r\n直到有人举报了你用血脉救人的事情你才在牢狱里崩溃大哭。\r\n你希望关押你的人可以让你见到苏啻，但是却被斥责人王的身份非凡，你对人王恨之入骨。\r\n你刹那明悟，强横的力量击溃在场所有仙灵掌控者。\r\n你是神族，天生的神，你要屠了当初的失信的人为全族报仇。\r\n你一路杀到皇都，所过之处寸草不生，生灵涂炭。\r\n当你到达时人王苏啻，至圣都在场。\r\n苏啻欲言又止，似乎羞于见你。\r\n你勃然大怒，刹那间天崩地裂。\r\n这是一场弑神之战。"
                                      },
                                      {
                                        "name": "2.放弃",
                                        "child": [
                                          {
                                            "name": "1.返回序章",
                                            "child": "%jumpBranch|1%"
                                          }
                                        ],
                                        "title": "这是一个明智的选择，人族将走向灭亡，神族得以保全。\r\n但是遗憾的是善良的仙灵在实际的历史仍旧选择了错误的做法。\r\n这是神族先天而生的天性，它们亲近自然，得天地宠爱，劫难无法避过。\r\n及时不是这次，未来也依然会灭亡。\r\n很抱歉，推演失败。"
                                      }
                                    ],
                                    "title": "苏啻道：“妖族之所以如此势不可挡也并不是因为它们先天肉体强大。因为及时那样，我人族勇士悍不畏死 也足以击溃它们。”\r\n苏啻表示，一切都是因为妖族发现来自仙灵大陆五行力量的根源，并且万妖之祖花夭还掌握了其中一种力量，说 着他对你手中的力量竟然闪过一丝贪婪之色。\r\n你下意识的将本源之力收拢了回去，并斥责道：“狂徒，我救了你的命，你竟然窥视我 族至宝。”\r\n苏啻脸一红连忙起身拱手道歉，你对此也明白任何人也难以避免藏私之心。\r\n你道:“更况论，人族体内没有元素力量， 是无法使用本源力量的。”\r\n苏啻陷入长久的沉默，自那以后他也不多发言，但是你却留心到人族的遭遇，在接下来的日子里，你发现 苏啻所说的情况甚至远甚之。\r\n在一番思虑后，你终究动了恻隐之心。\r\n在苏啻即将离开的那天夜晚你将自己的一部分灵魂力量和族内取来的少量不灭之力在夜里注入苏啻体内。\r\n这是苏啻自己的选择，不成功便成仁。\r\n他无法直面同族被当做食物，易子而食，你也唾弃妖族无底线的称霸。\r\n所幸的是，当源于水之本源不灭之力的纹路在他头上蔓延开来的时候，你知道实验成功了。\r\n在你们的喜悦中苏啻对你万分感谢并将这种命名为仙灵纹，简称仙灵。\r\n在后来的日子里，苏啻将这种方法传授给了人族精英。\r\n但是你却开始恐慌。\r\n人族的贪欲已经不可控制，仙灵纹的产生除了继承便只能通过本源力量和神族精血获得，你觉得你好像做错了什么。"
                                  }
                                ],
                                "title": "苏啻苦笑一声，道:“如今妖族势大，屠戮天下生灵，为人不齿。它们四处占地为王，食人血肉。我人族比他不过，只能每日躲藏。”\r\n他停顿一下，又道：“我为人族人王血脉，却只能见人族同袍赴死。”说着他不顾伤势将拳头重重砸在床沿上。\r\n你听他一番叙述："
                              },
                              {
                                "name": "2.杀了他",
                                "child": [
                                  {
                                    "name": "1.返回序章",
                                    "child": "%jumpBranch|1%"
                                  }
                                ],
                                "title": "年纪轻轻，杀心这么重，推演失败。"
                              }
                            ],
                            "title": "你凭借你强大的境界和体内蕴含的水之力唤醒了他，这个年轻人无比的感激你，并自我介绍道：“感谢这位姑娘 ，吾名苏啻，是人族王族子嗣，十分感谢你。”\r\n你很高兴能救助一位危在旦夕的生命，并对目前的一切隐瞒了其他人，然后偷偷将他 带回了家。\r\n因为你知道，他伤至肺腑，若不如此，必死无疑。\r\n你请来了你们的神宝——不灭之力\r\n本源之力强大的造化神力肉白骨，复亡人，苏啻的受到的伤自然算不得什么。\r\n但是你却隐隐感到不安。"
                          },
                          {
                            "name": "2.不管不顾",
                            "child": [
                              {
                                "name": "1.返回序章",
                                "child": "%jumpBranch|1%"
                              }
                            ],
                            "title": "不是，真的假的，你是来搞破坏的吧。\r\n一眼丁真。"
                          },
                          {
                            "name": "3.补刀",
                            "child": [
                              {
                                "name": "1.返回序章",
                                "child": "%jumpBranch|1%"
                              }
                            ],
                            "title": "不过是些许风霜罢了\r\n你的目标果然是大爱仙尊，不过很遗憾，你推演失败。"
                          }
                        ],
                        "title": "很遗憾，由于您的灵魂无法承受，刹那间一道致命的窥视感突破界壁。\r\n你遗憾推演失败。\r\n\r\n你从这种诡异的感觉中被安东尼的哀嚎声勾住后脚根然后腾空而起，在强大的离心感后坠入现实。\r\n视野在破碎的镜片中逐渐凝结，灰褐色的墙壁向两侧扩张蔓延。\r\n你已成功化身。\r\n化身身份 仙灵世界内由天地衍生的先天水之神灵——仙灵\r\n你的背景：你诞生在灵气充裕的 神域内，在这里有无数的先天神灵生活，它们的境界虽然很高，但是由于特殊原因无法驱动自身的力量，神灵们的性格随和，喜好帮助弱小的人类，而你是其中的一员。\r\n这一天你在救助了一只受伤的五色鹿后发现了躺在地上受伤的男人。"
                      }
                    ],
                    "title": "意识恍惚间，你仿佛坠入一片汪洋深海。\r\n窒息，绝望，恐惧，死寂，你试图抓取到自己所能抓取到的一切。\r\n漆黑的终末充斥着空间，祸乱和离奇在无声无息中传播。\r\n听不到，看不见，摸不着。\r\n遥远缥缈的低鸣，古老的呓语似乎跨越时间和空间低沉的萦绕于耳畔。\r\n突然间，你久久闭合的瞳孔中出现了光亮。虽然微弱，但足以让你看清眼前的一切。\r\n一眼望不到边际的肉色大地和巨柱贯穿了天地，庞杂纷乱的是坑坑洼洼的像是肉瘤的山丘。在这抹肉色之上，群星闪耀在星河和云雾的彩晕中，压迫天际的巨型星球遮住了钟闫视野下的半壁天穹。\r\n黑褐色的山脉和谷底清晰可见，阴暗和荒凉从未改变。\r\n你能感受到脚下的大地在围着这个巨型的黑褐色的星球旋转，虽然忽快忽慢但至少目前从未停歇。\r\n倘若没有耳边那离乱怪异的声音，你想，这或许真的是一场很正常的美梦。\r\n声音从星空深处传来，嘶哑阴沉。\r\n众星在呓语中无规律的运作，你脚下的大地随着韵律似乎开始了蠕动。\r\n“砰砰 砰”激烈而急促的敲门声惊醒了你\r\n\r\n你选择"
                  },
                  {
                    "name": "2.拒绝推演",
                    "child": [
                      {
                        "name": "1.返回序章",
                        "child": "%jumpBranch|1%"
                      }
                    ],
                    "title": "获得成就：没有成就"
                  }
                ],
                "title": "仙灵大陆由基础的五行元素构成，它们的力量晦涩难懂且难于控制，在千百年的演化中才趋于平静，并最终衍生万物。\r\n传言当五行之力达到极致，它们最终会演变成创生，毁灭，不灭，灵魂，虚无五大极致力量。\r\n仙灵大陆众生诞生之初，邪神的力量在尚且年幼的世界壁垒下猖獗，远古嗜血的古代神话生物横行霸道，它们翻江倒海，腾云驾雾无所不能。致使弱小的人族只能屈居于妖族之下苟延残喘。\r\n直到第一位人王苏啻发现了那独属于终生夺取天地造化的五行力量的使用和修炼方法才得以改变这种局面，并一度将妖族击退到两界山后，让强大的妖帝花夭也只能避其锋芒。\r\n人王为这种沟通天地的方法起名叫仙灵，可是谁也不知道这个名字的由来。"
              },
              {
                "name": "3.一只叶子主线",
                "child": [
                  {
                    "name": "1.继续修炼",
                    "child": [
                      {
                        "name": "1.返回序章",
                        "child": "%jumpBranch|1%"
                      }
                    ],
                    "title": "你打算达到登峰造极的地步，你选择继续修炼。\r\n在漫长的岁月中，你不断突破新的境界，实力一步一步增长。就在你觉得时候差不多的时候，你出关查看，却发现其他人的境界已经领先你一大截。你回到洞天继续闭关，当你耗尽寿元最后一次突破失败的时候，你明白了一个道理。\r\n人类穷尽一生习武，本以为自己已经天下无敌，但是当他出去，他会发现，有很多人已经远远超过他。尽管你付出再多的努力，天赋带来的差距也是不可弥补的。"
                  },
                  {
                    "name": "2.游历",
                    "child": [
                      {
                        "name": "1.吃下果子",
                        "child": [
                          {
                            "name": "1.归凡",
                            "child": [
                              {
                                "name": "1.继续修炼",
                                "child": [],
                                "title": "%jumpBranch|1-3-3-1%"
                              },
                              {
                                "name": "2.新的世界",
                                "child": [
                                  {
                                    "name": "1.进入木屋",
                                    "child": [
                                      {
                                        "name": "1.领取人物卡和奖励",
                                        "child": [
                                          {
                                            "name": "1.返回序章",
                                            "child": "%jumpBranch|1%"
                                          }
                                        ],
                                        "title": "感谢一只叶子的支持，也欢迎大家投稿，我只选有趣的\r\n%getAchievements|一只叶子%"
                                      }
                                    ],
                                    "title": "你走进了木屋，你发现，并非你想的那样。木屋的主人一脸微笑的看着你，你想进行回溯，可是你发现，你和系统的链接被屏蔽了，接下来发生的所有事情将不可控，你的生命会受到威胁。\r\n\r\n你鼓起勇气，像主人问好，主人回应了你的问好。\r\n主人：不错，还算有礼貌，比那些进来拿了东西不打招呼就想走的人好多了。你进来这里所谓何求呢，功法还是装备，亦或者是灵石。\r\n你：我不求什么，只是听说这里有大能留下的遗产才来寻找一番，没想到主人就在这里。\r\n主人：嗷 ，这样啊。看在你没 说谎还有礼貌的份上，我就指导你修炼一段时间吧，这样我也算是后继有人了。\r\n\r\n你在大能的帮助下进步飞速，但随着境界的提高，你隐约触碰到了这个世界的真相，每当你想找寻真相的时候，在冥冥之中总有一种力量在阻止你。\r\n你：师傅，我想找到这个世界的真相。\r\n主人：徒儿，为师奉劝你一句有些东西不是你应该知道的，为师知道的也不多。\r\n你：可是徒儿心意已决。\r\n主人：既然这样，那你就去吧，也到了你该出关的时候了，记住，一切小心。\r\n\r\n在你出关后，你恢复了和系统的链接。\r\n你在之后的日子里一直在寻找真相，但是，你永远都无法打破那个力量的封锁，寿元耗尽。"
                                  },
                                  {
                                    "name": "2.在外围观察",
                                    "child": [
                                      {
                                        "name": "1.继续",
                                        "child": [],
                                        "title": "%jumpBranch|1-3-3-2-1-1-2-1%"
                                      }
                                    ],
                                    "title": "你一无所获最终决定进入木屋"
                                  }
                                ],
                                "title": "白光闪过 ，你走进了一位陨落大能遗留的小世界，你相信你一定可以得到大能的机缘。\r\n\r\n在寻找了一 番以后，你发现了一间木屋。"
                              }
                            ],
                            "title": "你选择归凡，归凡虽然消耗了你所有的灵力，损失嘞所有的境界，但是增强的天赋可以让你很快追上其他人。\r\n再次修炼至《天境归凡》境界，你深刻的知道天赋的重要性，你决定不惜一切代价提高自己的天赋 ，直到无法更进一步。\r\n你再次 归凡，但是你并不孤独。你的道侣杉杉来到了你身边，你们虽为同性，但是精灵族的特殊性让你们可以双修，在杉杉的陪伴和帮助下，你完成了了第三次归凡。\r\n漫漫长路，你并不孤单，你完成第三次归凡的同时，杉杉也完成了第一次归凡，你们二人注定会越走越远，直至巅峰！\r\n\r\n到此，你恢复了意识，你已经得到了一只叶子的全部修仙经历。\r\n\r\n可是这就够了吗？你继承了她的全部实力。你自然想探索一番。"
                          },
                          {
                            "name": "2.继续修炼",
                            "child": [],
                            "title": "%jumpBranch|1-3-3-1%"
                          }
                        ],
                        "title": "你吃下了树人给你的果子，你感受到了其中蕴含的灵力，在你打坐一段时间后，成功突破了一个境界，随即你返回来时的地方，开始闭关。\r\n\r\n在漫长的岁月之后，你感觉到体内灵力的涌动，又可以突破了，在杉杉的祝福下你成功突破到《天境归凡》的境界。\r\n\r\n你选择："
                      },
                      {
                        "name": "2.继续修炼",
                        "child": [],
                        "title": "%jumpBranch|1-3-3-1%"
                      }
                    ],
                    "title": "刚来到这个世界的你对于周围的一切都充满了好奇，你决定出去游历增长自己的见识。你离开一片平原，来到了一片灵力充裕的地方，这里长满了各种植物，在灵力的作用下都长得十分巨大。你四处探索，突然你面前的一棵树活了过来并开口说话：“尊 敬的圣女，这有一颗蕴含了数百年天地灵力的果子，为您献上，希望您不要嫌弃。”\r\n\r\n你选择"
                  }
                ],
                "title": "随着你的选择，你的意识逐渐模糊，在不知道多久以后，你醒了，但是此时的你已经不是你了，你变成了叶子的样子，你将体验她的一生。"
              }
            ]
          }
        ],
        "title": "你好，我是仙灵，大陆上最早，也亦或是最后一位先天生命，在之后的对话中，我或许应当尊称你为……道？道友！\r\n（在一片深邃的混沌中，你缓缓睁开双眼，并听到了一声呢喃。）\r\n\r\n你选择："
      },
      {
        "name": "2.仙灵史",
        "child": [
          {
            "name": "1.返回序章",
            "child": "%jumpBranch|1%"
          }
        ],
        "title": "本游戏禁止商业化，一经发现抄袭或者相关违背游戏初衷的行为。\r\n关于开源代码需要签订协议后获取，请联系开发者。\r\n赞助渠道：拒绝氪金\r\n\r\n仙灵设计历史：\r\n仙灵1.0    10.20   内容：机器人上线，修仙和境界设置\r\n仙灵1.0    10.22   内容：仙灵加入\r\n仙灵1.1    10.25   内容：秘境，游历加入。\r\n仙灵1.2    11.5     内容：剧情，成就。\r\n\r\n游戏宗旨 ：和谐，共创，服务，进步。\r\n本游戏属于小型开源qq-bot开发，已签署相关隐私协议，具体内容可联系管理查看。\r\n\r\n仙灵之名取自言神建立的玩家互助组织仙灵阁，该组织致力于服务游戏玩家，其他信息保密。\r\n\r\n本游戏由开发者自费，如有bug和其他问题 请反馈，如开发者过忙还请先询问群友然后耐心等待，请遵守法律法规维护和谐网络环境。\r\n感谢开发者：九之川，吃了idw的猫（b站up主），Orwell（b站up主，）\r\n如有其他问题或者bug反馈（有奖）请联系游戏开发设计成员。\r\n联系方式：言神：qq：1356319530 \r\n\r\n游戏内测群（共创群）：453054944"
      }
    ]
    try {
      await createDirMapByObject(obj, upath);
    } catch (error) {
      console.log(error);
    }
  };
  // 分支缓存
  const userBranch = {}
  // 获得的事件只触发一次
  const onlyOneTemp = {}
  // 持有缓存
  const takeIng = {}
  // 用户成就
  const achievements = {}

  // 转义符工具
  /**
   * 参数接收规则
   * @session 会话对象
   * @params 参数 通过 | 右侧传入的内容
   * @ev 内容对象
   */
  const transferTool = {
    // 获取当前时间
    getTime: (session) => new Date().toLocaleString().replaceAll("/", "-"),
    // 获取随机动漫图
    rollACGImg(session) {
      return h.image('https://www.dmoe.cc/random.php')
    },
    // 跳转分支
    jumpBranch(session, params: string, ev) {
      userBranch[session.userId] = params?.split('-') || []
      // 通知渲染层 重置界面
      ev.change = true
    },
    // 通过交出持有物跳转分支 xxx>4?1-1-1
    jumpByLostProp(session, params: string, ev) {
      const dict = params.split('?')
      if (this.lostProp(session, dict[0], ev)) {
        userBranch[session.userId] = dict[1]?.split('-') || []
        // 通知渲染层 重置界面
        ev.change = true
      } else {
        userBranch[session.userId].pop()
        // 通知渲染层 重置界面
        ev.change = true
        const [prop, num] = dict[0].split('*')
        session.send('不满足要求，请重新选择。' + (config.tipsProp ? `\ntip:需要提交${num || 1}个${prop}` : ''))
      }
    },
    // 通过查询是否存在持有物跳转分支 xxx>4?1-1-1
    jumpByCheckProp(session, params: string, ev) {
      const dict = params.split('?')
      if (this.querymentProp(session, dict[0], ev)) {
        userBranch[session.userId] = dict[1]?.split('-') || []
        // 通知渲染层 重置界面 
        ev.change = true
      } else {
        userBranch[session.userId].pop()
        // 通知渲染层 重置界面
        ev.change = true
        const [prop, num] = dict[0].split('*')
        session.send('不满足要求，请重新选择。' + (config.tipsProp ? `\ntip:需要持有${num || 1}个${prop}` : ''))
      }
    }
    ,
    // 获得道具 |xxx>4
    async getProp(session, params: string, ev) {
      const item = params.split('*')
      const prop = item[0]
      const num = isNaN(Number(item[1])) ? 1 : Number(item[1])
      if (!onlyOneTemp[session.userId]) {
        onlyOneTemp[session.userId] = []
      }
      if (!onlyOneTemp[session.userId]?.includes(userBranch[session.userId].join('-'))) {
        if (!takeIng[session.userId]) {
          takeIng[session.userId] = {}
        }

        if (prop !== "灵石") {
          onlyOneTemp[session.userId].push(userBranch[session.userId].join('-'))
          if (takeIng[session.userId][prop] === undefined) {
            takeIng[session.userId][prop] = num
          } else {
            takeIng[session.userId][prop] += num
          }
        } else {
          // -----------------------------------------------------------
          /** 尻川在这里在数据库中修仙表里写入对应获得的灵石 数量已经使用 num 标识 */
          const setProp = { name: "灵石", num } // 填入的数据 name:道具名 num:奖励的数量
          const userId = session.userId // 奖励给 指向的用户
          const data = await ctx.database.get('xianling_user', { userId });
          await ctx.database.set('xianling_user', { userId }, { 'Spirit_Stone': data[0]['Spirit_Stone'] + num })



          // -----------------------------------------------------------
        }
        session.send('你在事件中得到了' + (num || 1) + `个${prop}`)
      }
    },
    // 失去某物 |xxx>1
    lostProp(session, params: string, ev) {
      const item = params.split('*')
      const prop = item[0]
      const num = isNaN(Number(item[1])) ? 1 : Number(item[1])

      if (!onlyOneTemp[session.userId]?.includes(userBranch[session.userId].join('-'))) {
        if (!this.querymentProp(session, prop, num || 1)) return false
        takeIng[session.userId][prop] -= num
        if (!takeIng[session.userId][prop]) {
          delete takeIng[session.userId][prop]
        }
        onlyOneTemp[session.userId].push(userBranch[session.userId].join('-'))
        session.send('你在事件中失去了' + (num || 1) + `个${prop}`)
        return true
      }
    },
    // 判断是否存在某物
    querymentProp(session, prop, num = 1) {
      if (!takeIng[session.userId]) {
        takeIng[session.userId] = {}
      }
      if (takeIng[session.userId][prop] === undefined) {
        return false
      }
      if (takeIng[session.userId][prop] < Number(num)) {
        return false
      }
      return true
    },
    // 获得成就 |初学者
    async getAchievements(session, prop) {
      const { userId } = session;
      if (!achievements[session.userId]) {
        achievements[session.userId] = {}
      }
      if (!achievements[session.userId][prop]) {
        achievements[session.userId][prop] = this.getTime()
        localStoreData.setLocalStoreData(session.userId) // 及时存档
        const data = await ctx.database.get('xianling_user', { userId });
        await ctx.database.set('xianling_user', { userId }, { 'Spirit_Stone': data[0]['Spirit_Stone'] + 1000 })
        session.send(`恭喜你获得成就！【${prop}】\n可在 /剧本成就 指令中查看`)

        // -----------------------------------------------------------
        /** 尻川在这里在数据库中修仙表里写入成就对应获得的奖励 */
        /** 成就一旦获得，不会再次获得。放心做判断即可 */

        // -----------------------------------------------------------
      }
    }
  }




  const galplayMap = {
    // 基地址
    upath: path.join(ctx.baseDir, config.mapAddress),
    mapInfo: [],
    // 初始化路径
    async initPath() {
      try {
        // 是否创建对应内容
        await fs.access(this.upath);
      } catch (error) {
        try {
          // 添加演示模板
          await fs.mkdir(this.upath, { recursive: true });
          await addTemplate(this.upath);
        } catch (error) {
          console.error(error);
        }
      }
    },
    // 初始化菜单结构
    async init() {
      await this.initPath();
      this.mapInfo = createPathMapByDir(this.upath);
      config.debug && console.log(JSON.stringify(this.mapInfo, null, ' '));
      config.debug && console.log("[smmcat-galmake]:剧本姬构建完成");
    },
    getMenu(goal: string, callback?: (event) => void) {

      let selectMenu = this.mapInfo;
      let end = false;
      let indePath = [];
      let PathName = [];
      let change = false;
      if (!goal) {
        callback && callback({ selectMenu, lastPath: "", change, crumbs: "", end });
        return;
      }
      let title = null;
      const indexList = goal.split("-").map((item) => Number(item));
      indexList.some((item) => {
        indePath.push(item);
        PathName.push(selectMenu[item - 1]?.name.length > 6 ? selectMenu[item - 1]?.name.slice(0, 6) + "..." : selectMenu[item - 1]?.name);
        title = selectMenu[item - 1]?.title || null;
        if (selectMenu.length < item) {
          selectMenu = void 0;
          indePath.pop();
          PathName.pop();
          callback && callback({ selectMenu, lastPath: indePath.join("-"), change, crumbs: PathName.slice(-3).reverse().join("<"), end });
          return true;
        }
        if (selectMenu && typeof selectMenu === "object") {
          selectMenu = selectMenu[item - 1].child;
          if (typeof selectMenu === "string") {
            end = true;
            callback && callback({ selectMenu, lastPath: indePath.join("-"), change, crumbs: PathName.slice(-3).reverse().join("<"), end });
            return true;
          }
        }
      });
      end || callback && callback({ selectMenu, title, lastPath: indePath.join("-"), change, crumbs: PathName.slice(-3).reverse().join("<"), end });
    },
    // 菜单渲染到界面
    markScreen(pathLine: string, session) {
      let goalItem = { change: false }
      // 查找对应菜单 获取回调
      this.getMenu(pathLine, (ev: any) => {
        // 分析转义符 %type%
        if (ev.end) {
          ev.selectMenu = ev.selectMenu.replace(/%([^%]*)%/g, (match, capture) => {
            let result = ''
            const temp = capture.split('|')
            if (transferTool[temp[0]]) {
              result = transferTool[temp[0]](session, temp[1], ev) || ''
            }
            return result;
          });
        }
        if (ev.title) {
          ev.title = ev.title.replace(/%([^%]*)%/g, (match, capture) => {
            let result = ''
            const temp = capture.split('|')
            if (transferTool[temp[0]]) {
              result = transferTool[temp[0]](session, temp[1], ev) || ''
            }
            return result;
          });
        }
        goalItem = ev
      })
      return this.format(goalItem, session)
    },
    // 格式化界面输出
    format(goalItem, session) {
      // 通过 change 标识 再一次执行刷新界面操作
      if (goalItem.change) return this.markScreen(userBranch[session.userId].join('-'), session)
      if (!goalItem.selectMenu) {
        return {
          msg: '',
          err: true,
        };
      }
      if (goalItem.name?.includes('__discard')) {
        return {
          msg: '',
          err: true,
        };
      }
      if (goalItem.end) {
        return {
          msg: (h.select(goalItem.selectMenu || '', 'img').length > 0 ? '' : "【内容】\n") +
            (goalItem.selectMenu ? `${goalItem.selectMenu.replace(/\\/g, '')}\n\n` : '') +
            '\n\n0 退出' +
            `\n----------------------------\n` +
            (goalItem.crumbs ? `[当前位置]` + `${goalItem.crumbs}\n` : '序章\n'),
          err: false,
          end: goalItem.end,
        };
      } else {
        return {
          msg: (h.select(goalItem.title || '', 'img').length > 0 ? '' : "【内容】\n") +
            (goalItem.title ? `${goalItem.title.replace(/\\/g, '')}\n\n` : '') +
            `${goalItem.selectMenu.map((item) => item.name.includes('__discard') ? null : item.name).filter(item => item !== null).join('\n')
            + '\n\n0 退出'}` +
            `\n----------------------------\n` +
            (goalItem.crumbs ? `[当前位置]\n` + `${goalItem.crumbs}\n` : '序章\n'),
          err: false,
          end: goalItem.end
        };
      }
    }
  };

  // 本地化存储方案
  const localStoreData = {
    upath: '',
    ready: false,
    async init() {
      this.upath = path.join(ctx.localstorage.basePath, './smm-xiuxiangalmark')
      try {
        // 是否创建对应内容
        await fs.access(this.upath);
      } catch (error) {
        try {
          await fs.mkdir(this.upath, { recursive: true });
        } catch (error) {
          console.error(error);
        }
      }
      const dirList = await fs.readdir(this.upath)
      const dict = { ok: 0, err: 0 }
      const eventList = dirList.map((item) => {
        return new Promise(async (resolve, rejects) => {
          try {
            const res = JSON.parse(await ctx.localstorage.getItem(`smm-xiuxiangalmark/${item}`) || "{}")
            userBranch[item] = res.userBranch
            onlyOneTemp[item] = res.onlyOneTemp
            takeIng[item] = res.takeIng
            achievements[item] = res.achievements
            dict.ok++
            resolve(true)
          } catch (error) {
            dict.err++
            resolve(true)
          }
        })
      })
      await Promise.all(eventList)
      this.ready = true
      config.debug && console.log(`[smmcat-xiuxiangalmark]:读取用户本地数据完成，成功${dict.ok}个，失败${dict.err}个`);
    },
    // 记录存档
    async setLocalStoreData(userId) {
      if (!this.ready || !userId) return
      const temp = {
        userBranch: userBranch[userId] || [],
        onlyOneTemp: onlyOneTemp[userId] || [],
        takeIng: takeIng[userId] || {},
        achievements: achievements[userId] || {}
      }
      config.debug && console.log(userId + '用户存储到本地记录');
      await ctx.localstorage.setItem(`smm-xiuxiangalmark/${userId}`, JSON.stringify(temp))
    },
    // 清除记录
    // async clearLocalStoreData(userId) {
    //   if (!this.ready || !userId) return
    //   const temp = {
    //     userBranch: [],
    //     onlyOneTemp: [],
    //     takeIng: {} // 当前持有物品
    //   }
    //   config.debug && console.log(userId + '用户清空本地记录');
    //   await ctx.localstorage.setItem(`smm-xiuxiangalmark/${userId}`, JSON.stringify(temp))
    // }
  }

  ctx.on('ready', () => {
    galplayMap.init();
    localStoreData.init();
  });

  ctx
    .command('剧本姬')
  ctx
    .command('剧本姬/开始修仙')
    .action(async ({ session }) => {

      if (!userBranch[session.userId]) {
        userBranch[session.userId] = [];
        onlyOneTemp[session.userId] = [];
        takeIng[session.userId] = {}
      }
      while (true) {
        config.debug && console.log('当前持有：' + takeIng[session.userId]);
        config.debug && console.log('已获取/失去过道具的分支：' + onlyOneTemp[session.userId]);

        let data = galplayMap.markScreen(userBranch[session.userId].join('-'), session);
        if (data.err) {
          userBranch[session.userId].pop();
          let data = galplayMap.markScreen(userBranch[session.userId].join('-'), session);
          await session.send('操作不对，请重新输入：\n注意需要输入指定范围的下标');
          await session.send(data.msg);
        }

        if (ctx.word) {
          const msg = await ctx.word.driver.parMsg(data.msg, { saveDB: 'smm' }, session);
          if (msg) {
            await session.send(msg);
          }
        } else {
          await session.send(data.msg);
        }

        const res = await session.prompt(config.overtime);
        if (res === undefined) {
          await localStoreData.setLocalStoreData(session.userId)
          await session.send("长时间未操作，退出剧本，记录保留");
          break;
        }
        if (!res.trim() || isNaN(Number(res)) && res.toLowerCase() !== 'q' && res.toLowerCase() !== 'p') {
          await session.send('请输入指定序号下标');
          continue;
        }
        if (res == '0') {
          await localStoreData.setLocalStoreData(session.userId)
          await session.send("已退出剧本，记录保留");
          break;
        }
        userBranch[session.userId].push(res);
        // 如果已经末尾
        if (data.end) {
          await session.send('已经到底了!');
          userBranch[session.userId].pop();
        }
      }
    });

  ctx
    .command('剧本姬/重置进度')
    .action(async ({ session }) => {
      if (!userBranch[session.userId]?.length) {
        await session.send('你的当前进度不需要重置')
      }
      await session.send('是否要重置当前进度？\n 20秒回复：是/否')
      const res = await session.prompt(20000)
      if (res === '是') {
        userBranch[session.userId] = []
        onlyOneTemp[session.userId] = []
        // takeIng[session.userId] = {}
        // await localStoreData.clearLocalStoreData(session.userId)
        await session.send('已重置当前进度')
      }
    })

  ctx
    .command('剧本姬/当前持有')
    .action(async ({ session }) => {
      const temp = takeIng[session.userId]
      if (!temp || !Object.keys(temp).length) {
        await session.send('你当进度中前还没有任何道具持有...')
        return
      }
      const msg = Object.keys(temp).map(item => {
        return `【${item}】单位：${temp[item]}`
      }).join('\n')
      await session.send('你当前进度中持有:\n\n' + msg)
    })

  ctx
    .command('剧本姬/修仙成就')
    .action(async ({ session }) => {
      const temp = achievements[session.userId]
      if (!temp || !Object.keys(temp).length) {
        await session.send('你当还没有得到任何成就...')
        return
      }
      const msg = Object.keys(temp).map(item => {
        return `【${item}】：${temp[item]}`
      }).join('\n')
      await session.send('你当前获得的成就和对应获取时间如下:\n\n' + msg)
    })
}

