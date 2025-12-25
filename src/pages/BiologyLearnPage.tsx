import { useState } from 'react';
import { vocabService } from '../services/vocabService';
import { reviewService } from '../services/reviewService';
import { checkInService } from '../services/checkInService';
import './BiologyLearnPage.css';

interface KnowledgeItem {
  id: number;
  title: string;
  content: string;
  example: string;
  tips: string;
  category: string;
}

interface Chapter {
  id: number;
  title: string;
  icon: string;
  level: 'primary' | 'middle' | 'high';
  description: string;
  items: KnowledgeItem[];
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: '小学生物启蒙',
    icon: '🌱',
    level: 'primary',
    description: '认识生物、植物、动物基础',
    items: [
      {
        id: 1,
        title: '什么是生物',
        content: '生物的特征：\n1. 生物能进行新陈代谢\n2. 生物能生长发育\n3. 生物能繁殖后代\n4. 生物能对外界刺激作出反应\n5. 生物能遗传和变异\n6. 生物都由细胞构成（病毒除外）\n\n生物与非生物的区别：\n生物：有生命活动，能自主进行各种生命活动\n非生物：没有生命，不能自主活动',
        example: '生物举例：\n动物：猫、狗、鸟、鱼\n植物：树、花、草\n微生物：细菌、真菌\n\n非生物举例：\n石头、水、空气、机器人',
        tips: '判断是否是生物，关键看它是否具有生命特征。机器人虽然能动，但不是生物。',
        category: '生物基础'
      },
      {
        id: 2,
        title: '植物的基本结构',
        content: '植物的六大器官：\n1. 根：吸收水分和无机盐\n2. 茎：输送水分和养料，支撑植物\n3. 叶：进行光合作用，制造有机物\n4. 花：繁殖器官，产生种子\n5. 果实：保护种子，帮助传播\n6. 种子：繁殖后代\n\n植物的分类：\n- 被子植物：种子有果皮包被\n- 裸子植物：种子裸露\n- 蕨类植物：有根茎叶，无种子\n- 苔藓植物：无根，有茎叶\n- 藻类植物：无根茎叶分化',
        example: '常见植物器官：\n根：胡萝卜、萝卜\n茎：甘蔗、土豆（地下茎）\n叶：白菜、菠菜\n花：玫瑰、菊花\n果实：苹果、西瓜\n种子：花生、大豆',
        tips: '记住植物六大器官的功能，理解它们之间的关系。土豆是茎不是根！',
        category: '植物'
      },
      {
        id: 3,
        title: '动物的分类',
        content: '动物的主要类群：\n\n脊椎动物（有脊柱）：\n1. 鱼类：生活在水中，用鳃呼吸\n2. 两栖类：幼体水生，成体水陆两栖\n3. 爬行类：体表有鳞片，卵生\n4. 鸟类：体表有羽毛，恒温\n5. 哺乳类：胎生哺乳，恒温\n\n无脊椎动物（无脊柱）：\n- 昆虫、蜘蛛、蜗牛、蚯蚓等',
        example: '动物分类举例：\n鱼类：鲤鱼、鲨鱼\n两栖类：青蛙、蝾螈\n爬行类：蛇、乌龟、鳄鱼\n鸟类：麻雀、老鹰\n哺乳类：猫、狗、人\n昆虫：蝴蝶、蜜蜂',
        tips: '鲸鱼是哺乳动物不是鱼！蝙蝠是哺乳动物不是鸟！',
        category: '动物'
      },
      {
        id: 4,
        title: '人体的基本结构',
        content: '人体的组成层次：\n细胞 → 组织 → 器官 → 系统 → 人体\n\n人体的八大系统：\n1. 运动系统：骨骼和肌肉\n2. 消化系统：消化食物\n3. 呼吸系统：气体交换\n4. 循环系统：运输物质\n5. 泌尿系统：排出废物\n6. 神经系统：调节控制\n7. 内分泌系统：激素调节\n8. 生殖系统：繁殖后代',
        example: '系统举例：\n消化系统：口腔→食道→胃→小肠→大肠\n呼吸系统：鼻→咽→喉→气管→支气管→肺\n循环系统：心脏、血管、血液',
        tips: '人体是一个统一的整体，各系统相互配合，共同完成生命活动。',
        category: '人体'
      },
      {
        id: 5,
        title: '食物链与食物网',
        content: '食物链：\n生物之间通过吃与被吃的关系形成的链条\n\n食物链的组成：\n生产者 → 消费者 → 分解者\n\n生产者：能进行光合作用的绿色植物\n消费者：直接或间接以植物为食的动物\n分解者：细菌、真菌，分解动植物遗体\n\n食物网：\n多条食物链交织在一起形成的网状结构',
        example: '食物链举例：\n草 → 兔子 → 狐狸 → 老鹰\n浮游植物 → 小鱼 → 大鱼 → 人\n\n注意：\n食物链从生产者开始\n箭头指向捕食者',
        tips: '食物链中能量逐级递减，所以食物链一般不超过5个营养级。',
        category: '生态'
      },
      {
        id: 6,
        title: '光合作用简介',
        content: '光合作用：\n绿色植物利用光能，把二氧化碳和水转变成有机物，并释放氧气的过程\n\n光合作用公式：\n二氧化碳 + 水 → 有机物 + 氧气\n（需要光和叶绿体）\n\n光合作用的意义：\n1. 制造有机物，为生物提供食物\n2. 释放氧气，维持大气中氧气含量\n3. 吸收二氧化碳，减缓温室效应',
        example: '光合作用的应用：\n1. 合理密植：让每片叶子都能接受光照\n2. 增加光照：温室种植用补光灯\n3. 增加二氧化碳：温室施放CO2',
        tips: '光合作用需要光，所以只在白天进行。呼吸作用白天晚上都进行。',
        category: '植物'
      },
      {
        id: 7,
        title: '种子的萌发',
        content: '种子的结构：\n1. 种皮：保护种子\n2. 胚：包括胚芽、胚轴、胚根、子叶\n3. 胚乳：储存营养（有些种子没有）\n\n种子萌发的条件：\n外界条件：\n- 适宜的温度\n- 一定的水分\n- 充足的空气\n\n自身条件：\n- 种子完整\n- 胚是活的\n- 度过休眠期',
        example: '种子萌发过程：\n1. 吸水膨胀\n2. 种皮破裂\n3. 胚根先突破种皮，发育成根\n4. 胚芽发育成茎和叶\n5. 子叶提供营养或进行光合作用',
        tips: '种子萌发不需要光！但幼苗生长需要光进行光合作用。',
        category: '植物'
      },
      {
        id: 8,
        title: '动物的行为',
        content: '动物行为的类型：\n\n先天性行为：\n生来就有的，由遗传决定\n例如：蜜蜂采蜜、蜘蛛结网、鸟类迁徙\n\n学习行为：\n后天学习获得的\n例如：小狗握手、鹦鹉学舌\n\n动物行为的意义：\n- 觅食行为：获取食物\n- 防御行为：保护自己\n- 繁殖行为：繁衍后代\n- 社会行为：群体生活',
        example: '行为举例：\n先天性行为：\n- 婴儿吮吸\n- 蚂蚁搬家\n- 候鸟迁徙\n\n学习行为：\n- 黑猩猩用树枝取食\n- 海豚表演',
        tips: '先天性行为是本能，学习行为可以改变。动物越高等，学习能力越强。',
        category: '动物'
      },
      {
        id: 9,
        title: '保护环境',
        content: '环境问题：\n1. 空气污染：工厂废气、汽车尾气\n2. 水污染：工业废水、生活污水\n3. 土壤污染：农药、化肥过量使用\n4. 噪声污染：交通、工厂噪声\n5. 生物多样性减少：物种灭绝\n\n保护措施：\n- 减少污染物排放\n- 植树造林\n- 垃圾分类\n- 节约资源\n- 建立自然保护区',
        example: '我们能做的：\n1. 节约用水用电\n2. 少用一次性物品\n3. 垃圾分类投放\n4. 绿色出行\n5. 爱护花草树木',
        tips: '保护环境从小事做起，每个人都是环境保护的参与者。',
        category: '生态'
      },
      {
        id: 10,
        title: '健康生活方式',
        content: '健康的生活习惯：\n\n饮食方面：\n- 一日三餐，定时定量\n- 营养均衡，不挑食\n- 多吃蔬菜水果\n- 少吃垃圾食品\n\n作息方面：\n- 早睡早起\n- 保证充足睡眠\n- 适当运动\n\n卫生方面：\n- 勤洗手\n- 不随地吐痰\n- 保持环境整洁',
        example: '健康小贴士：\n1. 每天喝够8杯水\n2. 每天运动1小时\n3. 每天睡眠8-10小时\n4. 饭前便后要洗手\n5. 少看电子屏幕',
        tips: '健康是最重要的财富，从小养成良好的生活习惯。',
        category: '健康'
      }
    ]
  },
  {
    id: 2,
    title: '初中生物进阶',
    icon: '🔬',
    level: 'middle',
    description: '细胞、遗传、生态系统',
    items: [
      {
        id: 11,
        title: '细胞的结构',
        content: '细胞是生物体结构和功能的基本单位\n\n动物细胞结构：\n1. 细胞膜：控制物质进出\n2. 细胞质：进行生命活动的场所\n3. 细胞核：含有遗传物质DNA\n4. 线粒体：呼吸作用，提供能量\n5. 核糖体：合成蛋白质\n\n植物细胞特有结构：\n6. 细胞壁：保护和支持\n7. 叶绿体：光合作用\n8. 液泡：储存物质',
        example: '细胞器功能记忆：\n线粒体 - 动力车间（产生能量）\n叶绿体 - 养料制造厂（光合作用）\n核糖体 - 蛋白质加工厂\n细胞核 - 控制中心（遗传信息）',
        tips: '植物细胞有细胞壁、叶绿体、液泡，动物细胞没有。这是区分的关键！',
        category: '细胞'
      },
      {
        id: 12,
        title: '细胞分裂',
        content: '细胞分裂的意义：\n使细胞数目增多，是生物生长的基础\n\n有丝分裂过程：\n1. 间期：DNA复制\n2. 前期：染色体出现，核膜消失\n3. 中期：染色体排列在赤道板\n4. 后期：染色体分开，移向两极\n5. 末期：核膜重现，细胞质分裂\n\n细胞分裂特点：\n- 染色体数目先加倍后减半\n- 分裂后细胞遗传物质相同',
        example: '细胞分裂口诀：\n间期复制准备好\n前期两消两出现\n（核膜核仁消失，染色体纺锤体出现）\n中期排队赤道板\n后期分开向两极\n末期两现两消失',
        tips: '有丝分裂保证了遗传物质的稳定传递，子细胞与母细胞遗传物质相同。',
        category: '细胞'
      },
      {
        id: 13,
        title: '光合作用与呼吸作用',
        content: '光合作用：\n场所：叶绿体\n条件：光\n原料：CO2 + H2O\n产物：有机物 + O2\n能量变化：光能→化学能\n\n呼吸作用：\n场所：线粒体\n条件：有氧或无氧\n原料：有机物 + O2\n产物：CO2 + H2O\n能量变化：化学能→其他能量\n\n两者关系：\n互为原料和产物，相互依存',
        example: '对比记忆：\n光合作用：合成有机物，储存能量\n呼吸作用：分解有机物，释放能量\n\n应用：\n储存蔬菜：低温、低氧（抑制呼吸）\n种植：合理密植（增强光合）',
        tips: '光合作用只在白天进行，呼吸作用昼夜都进行。白天光合作用强于呼吸作用。',
        category: '代谢'
      },
      {
        id: 14,
        title: '人体消化系统',
        content: '消化道：\n口腔→咽→食道→胃→小肠→大肠→肛门\n\n消化腺：\n唾液腺、胃腺、肝脏、胰腺、肠腺\n\n消化过程：\n口腔：淀粉→麦芽糖（唾液淀粉酶）\n胃：蛋白质初步消化（胃蛋白酶）\n小肠：三大营养物质彻底消化\n\n吸收：\n小肠是主要吸收场所\n小肠绒毛增大吸收面积',
        example: '消化酶作用：\n唾液淀粉酶：淀粉→麦芽糖\n胃蛋白酶：蛋白质→多肽\n胰液、肠液：\n淀粉→葡萄糖\n蛋白质→氨基酸\n脂肪→甘油+脂肪酸',
        tips: '肝脏分泌胆汁，胆汁不含消化酶，但能乳化脂肪。小肠是消化吸收的主要场所。',
        category: '人体'
      },
      {
        id: 15,
        title: '人体循环系统',
        content: '循环系统组成：\n心脏、血管、血液\n\n心脏结构：\n四个腔：左心房、左心室、右心房、右心室\n左心室壁最厚（泵血到全身）\n\n血管类型：\n动脉：从心脏运血出去，管壁厚\n静脉：把血液运回心脏，有瓣膜\n毛细血管：物质交换场所，管壁薄\n\n血液循环：\n体循环：左心室→全身→右心房\n肺循环：右心室→肺→左心房',
        example: '血液成分：\n血浆：运输营养物质和废物\n红细胞：运输氧气（含血红蛋白）\n白细胞：吞噬病菌，防御\n血小板：止血凝血',
        tips: '动脉血含氧多，颜色鲜红；静脉血含氧少，颜色暗红。肺静脉里流的是动脉血！',
        category: '人体'
      },
      {
        id: 16,
        title: '人体呼吸系统',
        content: '呼吸系统组成：\n呼吸道：鼻→咽→喉→气管→支气管\n肺：气体交换的场所\n\n呼吸运动：\n吸气：膈肌收缩下降，肋间肌收缩\n      胸廓扩大，肺扩张，气体入肺\n呼气：膈肌舒张上升，肋间肌舒张\n      胸廓缩小，肺收缩，气体出肺\n\n气体交换：\n肺泡与血液之间：O2进入血液，CO2排出\n组织细胞与血液之间：O2进入细胞，CO2排出',
        example: '呼吸过程：\n外界空气 → 肺泡 → 血液 → 组织细胞\n\n气体交换原理：\n气体从浓度高的地方向浓度低的地方扩散',
        tips: '呼吸运动是肺通气的动力，气体交换是通过扩散作用完成的。',
        category: '人体'
      },
      {
        id: 17,
        title: '神经系统与反射',
        content: '神经系统组成：\n中枢神经系统：脑、脊髓\n周围神经系统：脑神经、脊神经\n\n神经元结构：\n细胞体、树突、轴突\n\n反射弧：\n感受器→传入神经→神经中枢→传出神经→效应器\n\n反射类型：\n非条件反射：先天的，如膝跳反射\n条件反射：后天学习的，如望梅止渴',
        example: '反射举例：\n非条件反射：\n- 眨眼反射\n- 膝跳反射\n- 缩手反射\n\n条件反射：\n- 望梅止渴\n- 谈虎色变\n- 红灯停绿灯行',
        tips: '反射弧任何一个环节受损，反射都不能完成。条件反射可以建立也可以消退。',
        category: '人体'
      },
      {
        id: 18,
        title: '遗传的基本规律',
        content: 'DNA与基因：\nDNA是遗传物质，基因是DNA上有遗传效应的片段\n\n染色体、DNA、基因的关系：\n染色体由DNA和蛋白质组成\n基因位于染色体上\n\n遗传规律：\n显性基因（A）：能表现出来的性状\n隐性基因（a）：被掩盖的性状\n\n基因型与表现型：\nAA、Aa → 显性性状\naa → 隐性性状',
        example: '遗传图解：\n父母：Aa × Aa\n子代：AA、Aa、Aa、aa\n比例：显性:隐性 = 3:1\n\n例如：\n双眼皮（A）× 双眼皮（A）\n可能生出单眼皮（aa）的孩子',
        tips: '显性基因用大写字母表示，隐性基因用小写字母表示。Aa表现为显性性状。',
        category: '遗传'
      },
      {
        id: 19,
        title: '生物的变异',
        content: '变异的类型：\n\n可遗传变异：\n由遗传物质改变引起，能遗传给后代\n- 基因突变\n- 基因重组\n- 染色体变异\n\n不可遗传变异：\n由环境因素引起，不能遗传\n例如：晒黑、营养不良导致的矮小\n\n变异的意义：\n为生物进化提供原材料\n为人工选择育种提供素材',
        example: '变异举例：\n可遗传变异：\n- 白化病（基因突变）\n- 杂交水稻（基因重组）\n\n不可遗传变异：\n- 运动员肌肉发达\n- 长期不见光的植物发黄',
        tips: '判断变异是否可遗传，关键看遗传物质是否改变。环境引起的变异一般不可遗传。',
        category: '遗传'
      },
      {
        id: 20,
        title: '生态系统',
        content: '生态系统的组成：\n\n非生物成分：\n阳光、空气、水、温度、土壤\n\n生物成分：\n生产者：绿色植物（光合作用）\n消费者：动物（直接或间接以植物为食）\n分解者：细菌、真菌（分解有机物）\n\n生态系统的功能：\n能量流动：单向流动，逐级递减\n物质循环：循环往复，反复利用\n\n生态平衡：\n生态系统中各种生物数量和比例相对稳定',
        example: '生态系统类型：\n- 森林生态系统\n- 草原生态系统\n- 海洋生态系统\n- 淡水生态系统\n- 农田生态系统\n- 城市生态系统\n\n最大的生态系统：生物圈',
        tips: '生态系统具有一定的自我调节能力，但这种能力是有限的。',
        category: '生态'
      }
    ]
  },
  {
    id: 3,
    title: '高中生物深化',
    icon: '🧬',
    level: 'high',
    description: '分子生物学、遗传学、生态学',
    items: [
      {
        id: 21,
        title: '细胞的分子组成',
        content: '组成细胞的元素：\n大量元素：C、H、O、N、P、S、K、Ca、Mg\n微量元素：Fe、Mn、Zn、Cu、B、Mo\n\n组成细胞的化合物：\n\n无机物：\n水：自由水（代谢）、结合水（结构）\n无机盐：离子形式存在\n\n有机物：\n糖类：单糖、二糖、多糖\n脂质：脂肪、磷脂、固醇\n蛋白质：氨基酸脱水缩合\n核酸：DNA、RNA',
        example: '重要化合物：\n糖类：\n- 葡萄糖：主要能源物质\n- 淀粉：植物储能物质\n- 糖原：动物储能物质\n- 纤维素：植物细胞壁成分\n\n蛋白质功能：\n结构、催化、运输、免疫、调节',
        tips: 'C是最基本元素，蛋白质是生命活动的主要承担者，核酸是遗传信息的携带者。',
        category: '分子'
      },
      {
        id: 22,
        title: '酶与ATP',
        content: '酶的本质：\n大多数是蛋白质，少数是RNA\n\n酶的特性：\n1. 高效性：催化效率极高\n2. 专一性：一种酶只催化一种或一类反应\n3. 多样性：酶的种类很多\n\n影响酶活性的因素：\n温度、pH、底物浓度、酶浓度\n\nATP：\n结构：腺苷-磷酸-磷酸-磷酸\n功能：细胞内直接能源物质\nATP ⇌ ADP + Pi + 能量',
        example: '酶的应用：\n- 加酶洗衣粉（蛋白酶、脂肪酶）\n- 酿酒（酵母菌的酶）\n- 制作酸奶（乳酸菌的酶）\n\nATP的来源：\n- 光合作用（光反应）\n- 呼吸作用',
        tips: '酶只能降低活化能，不能改变反应平衡。ATP是能量"货币"，随用随造。',
        category: '代谢'
      },
      {
        id: 23,
        title: '光合作用详解',
        content: '光合作用场所：叶绿体\n\n光反应（类囊体薄膜）：\n条件：光、色素、酶\n过程：\n1. 水的光解：H2O → [H] + O2\n2. ATP的合成：ADP + Pi → ATP\n产物：[H]、ATP、O2\n\n暗反应（叶绿体基质）：\n条件：酶、[H]、ATP\n过程：\n1. CO2固定：CO2 + C5 → 2C3\n2. C3还原：C3 → (CH2O) + C5\n产物：有机物、C5',
        example: '光合作用总反应式：\n6CO2 + 6H2O → C6H12O6 + 6O2\n（光能、叶绿体）\n\n影响因素：\n- 光照强度\n- CO2浓度\n- 温度\n- 水分',
        tips: '光反应为暗反应提供[H]和ATP，暗反应为光反应提供ADP和Pi。两者相互依存。',
        category: '代谢'
      },
      {
        id: 24,
        title: '细胞呼吸详解',
        content: '有氧呼吸：\n\n第一阶段（细胞质基质）：\n葡萄糖 → 丙酮酸 + [H] + 少量ATP\n\n第二阶段（线粒体基质）：\n丙酮酸 + H2O → CO2 + [H] + 少量ATP\n\n第三阶段（线粒体内膜）：\n[H] + O2 → H2O + 大量ATP\n\n无氧呼吸：\n场所：细胞质基质\n产物：酒精+CO2 或 乳酸\n能量：少量ATP',
        example: '有氧呼吸总反应式：\nC6H12O6 + 6O2 + 6H2O → 6CO2 + 12H2O + 能量\n\n无氧呼吸：\n酒精发酵：C6H12O6 → 2C2H5OH + 2CO2\n乳酸发酵：C6H12O6 → 2C3H6O3',
        tips: '有氧呼吸产生38个ATP，无氧呼吸只产生2个ATP。人剧烈运动时会进行乳酸发酵。',
        category: '代谢'
      },
      {
        id: 25,
        title: 'DNA的结构与复制',
        content: 'DNA双螺旋结构：\n1. 两条链反向平行\n2. 脱氧核糖和磷酸交替连接构成骨架\n3. 碱基配对：A-T、G-C\n4. 碱基对位于内侧\n\nDNA复制：\n时间：细胞分裂间期\n场所：主要在细胞核\n方式：半保留复制\n原则：碱基互补配对\n\n复制过程：\n解旋 → 配对 → 连接',
        example: 'DNA复制特点：\n1. 边解旋边复制\n2. 半保留复制\n3. 需要模板、原料、能量、酶\n\n复制结果：\n一个DNA → 两个相同的DNA\n每个DNA含一条母链一条子链',
        tips: 'DNA复制是半保留复制，子代DNA各含一条母链。复制需要解旋酶和DNA聚合酶。',
        category: '遗传'
      },
      {
        id: 26,
        title: '基因的表达',
        content: '中心法则：\nDNA → RNA → 蛋白质\n（转录）  （翻译）\n\n转录：\n场所：细胞核\n模板：DNA的一条链\n原料：4种核糖核苷酸\n产物：mRNA\n\n翻译：\n场所：核糖体\n模板：mRNA\n原料：20种氨基酸\n工具：tRNA（转运RNA）\n产物：多肽链→蛋白质',
        example: '密码子：\nmRNA上3个相邻碱基决定一个氨基酸\n共64种密码子\n- 起始密码子：AUG\n- 终止密码子：UAA、UAG、UGA\n\n反密码子：\ntRNA上与密码子配对的3个碱基',
        tips: '一个基因可以转录出多个mRNA，一个mRNA可以翻译出多条多肽链。',
        category: '遗传'
      },
      {
        id: 27,
        title: '基因突变与基因重组',
        content: '基因突变：\n定义：DNA分子中碱基对的增添、缺失或替换\n\n特点：\n1. 普遍性：所有生物都可能发生\n2. 随机性：任何时期、任何部位\n3. 低频性：自然突变频率很低\n4. 多害少利性：大多数有害\n5. 不定向性：可以向不同方向突变\n\n基因重组：\n定义：控制不同性状的基因重新组合\n类型：\n1. 自由组合（非同源染色体）\n2. 交叉互换（同源染色体）',
        example: '基因突变举例：\n- 镰刀型细胞贫血症\n- 白化病\n- 色盲\n\n基因重组举例：\n- 杂交育种\n- 基因工程',
        tips: '基因突变是生物变异的根本来源，基因重组是生物多样性的重要来源。',
        category: '遗传'
      },
      {
        id: 28,
        title: '染色体变异',
        content: '染色体结构变异：\n1. 缺失：染色体片段丢失\n2. 重复：染色体片段重复\n3. 倒位：染色体片段颠倒\n4. 易位：非同源染色体片段交换\n\n染色体数目变异：\n1. 个别染色体增减\n   如：21三体综合征（唐氏综合征）\n2. 染色体组成倍增减\n   如：三倍体无籽西瓜\n\n多倍体：\n含有三个或三个以上染色体组\n特点：茎秆粗壮，果实大',
        example: '染色体变异应用：\n\n单倍体育种：\n花药离体培养 → 单倍体 → 秋水仙素处理 → 纯合子\n优点：明显缩短育种年限\n\n多倍体育种：\n秋水仙素处理 → 多倍体\n优点：果实大，营养丰富',
        tips: '染色体变异可以用显微镜观察到，基因突变不能。秋水仙素能抑制纺锤体形成。',
        category: '遗传'
      },
      {
        id: 29,
        title: '生物进化',
        content: '现代生物进化理论：\n\n种群是进化的基本单位\n突变和基因重组产生进化的原材料\n自然选择决定进化的方向\n隔离是物种形成的必要条件\n\n自然选择：\n- 过度繁殖\n- 生存斗争\n- 遗传变异\n- 适者生存\n\n物种形成：\n地理隔离 → 基因频率改变 → 生殖隔离 → 新物种',
        example: '进化证据：\n1. 化石证据\n2. 比较解剖学证据（同源器官）\n3. 胚胎学证据\n4. 分子生物学证据\n\n共同进化：\n不同物种之间、生物与环境之间\n相互影响、共同进化',
        tips: '自然选择是定向的，但变异是不定向的。自然选择只是选择已有的变异。',
        category: '进化'
      },
      {
        id: 30,
        title: '生态系统的能量流动',
        content: '能量流动特点：\n1. 单向流动：不能循环\n2. 逐级递减：传递效率10%-20%\n\n能量流动过程：\n太阳能 → 生产者 → 消费者 → 分解者\n\n每个营养级能量去向：\n1. 呼吸作用消耗\n2. 流向下一营养级\n3. 流向分解者\n4. 未被利用\n\n能量金字塔：\n营养级越高，能量越少\n所以食物链一般不超过5个营养级',
        example: '能量传递效率计算：\n传递效率 = 下一营养级同化量/本营养级同化量 × 100%\n\n例如：\n生产者固定1000kJ\n初级消费者获得100-200kJ\n次级消费者获得10-40kJ',
        tips: '能量传递效率是10%-20%，不是固定的10%或20%。计算时要注意题目条件。',
        category: '生态'
      }
    ]
  }
];


export function BiologyLearnPage() {
  const [selectedLevel, setSelectedLevel] = useState<'primary' | 'middle' | 'high'>('primary');
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [completedItems, setCompletedItems] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('completed-biology-items');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const filteredChapters = CHAPTERS.filter(c => c.level === selectedLevel);
  const currentChapter = selectedChapter ? CHAPTERS.find(c => c.id === selectedChapter) : null;
  const currentKnowledgeItem = selectedItem && currentChapter
    ? currentChapter.items.find(i => i.id === selectedItem) 
    : null;

  const toggleComplete = (itemId: number) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId);
    } else {
      newCompleted.add(itemId);
      checkInService.updateTodayProgress({ lessonsCompleted: 1 });
    }
    setCompletedItems(newCompleted);
    localStorage.setItem('completed-biology-items', JSON.stringify([...newCompleted]));
  };

  const addToVocab = (item: KnowledgeItem) => {
    const wordData = {
      originalWord: item.title,
      plainExplanation: item.content.substring(0, 100) + '...',
      lifeAnalogy: item.tips,
      essenceExplanation: item.content,
      usageScenarios: [item.example],
      englishWord: item.title,
      phonetic: `[${item.category}]`,
      timestamp: Date.now(),
      category: '学术教育' as const,
    };
    
    vocabService.addWord(wordData);
    reviewService.createReviewPlan(wordData);
    checkInService.updateTodayProgress({ wordsLearned: 1 });
    alert('✅ 已加入生词本！');
  };

  return (
    <div className="biology-learn-page">
      <div className="page-header">
        <h1>🧬 生物知识学习</h1>
        <p className="subtitle">小学、初中、高中生物知识体系</p>
      </div>

      {/* 学段选择 */}
      <div className="level-selector">
        <button
          className={`level-btn ${selectedLevel === 'primary' ? 'active' : ''}`}
          onClick={() => {
            setSelectedLevel('primary');
            setSelectedChapter(null);
            setSelectedItem(null);
          }}
        >
          🌱 小学启蒙
        </button>
        <button
          className={`level-btn ${selectedLevel === 'middle' ? 'active' : ''}`}
          onClick={() => {
            setSelectedLevel('middle');
            setSelectedChapter(null);
            setSelectedItem(null);
          }}
        >
          🔬 初中进阶
        </button>
        <button
          className={`level-btn ${selectedLevel === 'high' ? 'active' : ''}`}
          onClick={() => {
            setSelectedLevel('high');
            setSelectedChapter(null);
            setSelectedItem(null);
          }}
        >
          🧬 高中深化
        </button>
      </div>

      {!selectedChapter ? (
        /* 章节列表 */
        <div className="chapters-grid">
          {filteredChapters.map((chapter) => {
            const completedCount = chapter.items.filter(item => 
              completedItems.has(item.id)
            ).length;
            const totalItems = chapter.items.length;
            const progress = (completedCount / totalItems) * 100;

            return (
              <div
                key={chapter.id}
                className="chapter-card"
                onClick={() => setSelectedChapter(chapter.id)}
              >
                <div className="chapter-icon">{chapter.icon}</div>
                <h3>{chapter.title}</h3>
                <p className="chapter-desc">{chapter.description}</p>
                <div className="chapter-progress">
                  <div className="progress-text">
                    <span>{completedCount}/{totalItems} 完成</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : !selectedItem ? (
        /* 知识点列表 */
        <div className="items-view">
          <button 
            className="back-btn"
            onClick={() => setSelectedChapter(null)}
          >
            ← 返回章节
          </button>
          
          <h2>{currentChapter?.icon} {currentChapter?.title}</h2>
          
          <div className="items-list">
            {currentChapter?.items.map((item) => (
              <div
                key={item.id}
                className={`item-card ${completedItems.has(item.id) ? 'completed' : ''}`}
              >
                <div className="item-header">
                  <h3 onClick={() => setSelectedItem(item.id)}>
                    {item.title}
                  </h3>
                  <div className="item-actions">
                    <button
                      className="complete-btn"
                      onClick={() => toggleComplete(item.id)}
                    >
                      {completedItems.has(item.id) ? '✓ 已完成' : '标记完成'}
                    </button>
                  </div>
                </div>
                <div className="item-category">📌 {item.category}</div>
                <button
                  className="view-btn"
                  onClick={() => setSelectedItem(item.id)}
                >
                  查看详情 →
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 知识点详情 */
        <div className="item-detail">
          <button 
            className="back-btn"
            onClick={() => setSelectedItem(null)}
          >
            ← 返回列表
          </button>

          <div className="detail-card">
            <div className="detail-header">
              <h2>{currentKnowledgeItem?.title}</h2>
              <span className="detail-category">📌 {currentKnowledgeItem?.category}</span>
            </div>

            <div className="detail-section">
              <h3>📖 知识内容</h3>
              <div className="detail-content">
                {currentKnowledgeItem?.content.split('\n').map((line: string, i: number) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>

            <div className="detail-section">
              <h3>📝 例题示例</h3>
              <div className="detail-example">
                {currentKnowledgeItem?.example.split('\n').map((line: string, i: number) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>

            <div className="detail-section">
              <h3>💡 学习技巧</h3>
              <div className="detail-tips">
                {currentKnowledgeItem?.tips}
              </div>
            </div>

            <div className="detail-actions">
              <button
                className="add-vocab-btn"
                onClick={() => currentKnowledgeItem && addToVocab(currentKnowledgeItem)}
              >
                ➕ 加入生词本
              </button>
              <button
                className={`complete-btn ${completedItems.has(currentKnowledgeItem?.id || 0) ? 'completed' : ''}`}
                onClick={() => currentKnowledgeItem && toggleComplete(currentKnowledgeItem.id)}
              >
                {completedItems.has(currentKnowledgeItem?.id || 0) ? '✓ 已完成' : '✓ 标记完成'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
