import { useState } from 'react';
import { vocabService } from '../services/vocabService';
import { reviewService } from '../services/reviewService';
import { checkInService } from '../services/checkInService';
import './ChineseLearnPage.css';

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
    title: '小学语文基础',
    icon: '🌱',
    level: 'primary',
    description: '拼音、汉字、词语基础知识',
    items: [
      {
        id: 1,
        title: '拼音声母韵母',
        content: '声母23个：b p m f d t n l g k h j q x zh ch sh r z c s y w\n韵母24个：a o e i u ü ai ei ui ao ou iu ie üe er an en in un ün ang eng ing ong\n\n整体认读音节16个：\nzhi chi shi ri zi ci si yi wu yu ye yue yuan yin yun ying',
        example: '例如：妈妈(mā ma)、爸爸(bà ba)、学习(xué xí)\n声调练习：\n一声平(ā)、二声扬(á)、三声拐弯(ǎ)、四声降(à)',
        tips: '记忆技巧：声母像辅音，韵母像元音。多读多练，注意声调变化。可以通过儿歌记忆：b p m f 真有趣，去找 d t n l。',
        category: '拼音'
      },
      {
        id: 2,
        title: '汉字笔画笔顺',
        content: '基本笔画：横(一)、竖(丨)、撇(丿)、捺(㇏)、点(丶)、提(㇀)、折(乛)、钩(亅)\n\n笔顺规则：\n1. 先横后竖：十、王、干\n2. 先撇后捺：人、八、入\n3. 从上到下：三、竖、音\n4. 从左到右：川、州、顺\n5. 先外后内：月、用、风\n6. 先中间后两边：小、水、承\n7. 先进人后关门：国、园、圆',
        example: '例如：\n"人"字：撇→捺\n"木"字：横→竖→撇→捺\n"国"字：先写外框，再写里面的"玉"，最后封口\n"火"字：点→撇→撇→捺',
        tips: '正确的笔顺能让字写得更工整美观，也有助于记忆汉字结构。建议每天练习5-10个汉字。',
        category: '汉字'
      },
      {
        id: 3,
        title: '汉字结构与部首',
        content: '汉字结构类型：\n1. 独体字：人、木、日、月\n2. 左右结构：明、林、好、江\n3. 上下结构：字、花、草、思\n4. 左中右结构：树、湖、做\n5. 上中下结构：意、草、莫\n6. 全包围结构：国、圆、困\n7. 半包围结构：区、医、匠\n\n常见部首：\n氵(水)、木、艹(草)、亻(人)、口、扌(手)、心、日、月、火',
        example: '例如：\n氵旁的字多与水有关：江、河、湖、海\n木旁的字多与树木有关：林、森、树、枝\n亻旁的字多与人有关：你、他、们、位',
        tips: '认识部首可以帮助理解字义，也能帮助查字典。同一部首的字往往有相关的意思。',
        category: '汉字'
      },
      {
        id: 4,
        title: '近义词与反义词',
        content: '近义词：意思相近的词语\n反义词：意思相反的词语\n\n常见近义词：\n美丽-漂亮、高兴-快乐、立刻-马上、仔细-认真\n著名-有名、特别-非常、忽然-突然、喜欢-喜爱\n\n常见反义词：\n大-小、高-低、多-少、快-慢、好-坏\n美-丑、黑-白、冷-热、胖-瘦、强-弱',
        example: '例句：\n近义词：这朵花很美丽/漂亮。他立刻/马上跑了过来。\n反义词：这个苹果很大，那个苹果很小。今天很热，昨天很冷。',
        tips: '积累近义词可以让作文更生动，理解反义词有助于对比理解词义。建议建立词语积累本。',
        category: '词语'
      },
      {
        id: 5,
        title: '多音字与形近字',
        content: '多音字：一个字有两个或多个读音\n常见多音字：\n长：cháng(长短) zhǎng(长大)\n重：zhòng(重要) chóng(重复)\n还：hái(还有) huán(还书)\n\n形近字：字形相似但意义不同\n常见形近字：\n己-已-巳、土-士、末-未\n戊-戌-戍、日-曰、刀-力',
        example: '多音字例句：\n这条路很长(cháng)，我慢慢长(zhǎng)大了。\n这件事很重(zhòng)要，请重(chóng)新做一遍。\n\n形近字例句：\n自己的"己"，已经的"已"，巳时的"巳"。',
        tips: '多音字要根据词语意思判断读音。形近字要仔细观察字形差异，避免写错别字。',
        category: '词语'
      },
      {
        id: 6,
        title: '标点符号用法',
        content: '常用标点符号：\n句号(。)：陈述句末尾\n问号(？)：疑问句末尾\n感叹号(！)：感叹句末尾\n逗号(，)：句子中间的停顿\n顿号(、)：并列词语之间\n分号(；)：并列分句之间\n冒号(：)：提示下文\n引号("")：引用的话\n书名号(《》)：书名、篇名\n省略号(……)：省略或语意未尽\n破折号(——)：解释说明或话题转换',
        example: '例句：\n今天天气真好！(感叹)\n你吃饭了吗？(疑问)\n我喜欢苹果、香蕉、橙子。(顿号)\n老师说："上课了。"(引号)\n我读了《西游记》。(书名号)\n他走了……(省略号)',
        tips: '标点符号是书面语言的重要组成部分，用对标点能让句子意思更清楚。注意中文标点是全角符号。',
        category: '标点'
      },
      {
        id: 7,
        title: '简单句子结构',
        content: '基本句式：主语 + 谓语 + 宾语\n\n主语：句子说的是谁/什么\n谓语：主语做什么/怎么样\n宾语：动作的对象\n\n扩展成分：\n定语：修饰名词(什么样的)\n状语：修饰动词(怎么样地)\n补语：补充说明(得怎么样)\n\n句子类型：\n陈述句、疑问句、祈使句、感叹句',
        example: '例句：\n基本句：小明吃苹果。\n扩展句：聪明的小明高兴地吃着红红的苹果。\n(定语)(主语)(状语)(谓语)(定语)(宾语)\n\n补语例句：他跑得很快。(快是补语)',
        tips: '理解句子成分有助于写出完整、生动的句子。可以用"缩句"和"扩句"练习。',
        category: '句子'
      },
      {
        id: 8,
        title: '常用关联词',
        content: '关联词的作用：连接词语或句子，表达不同的逻辑关系\n\n并列关系：既…又…、一边…一边…、不是…而是…\n递进关系：不但…而且…、不仅…还…\n选择关系：或者…或者…、不是…就是…、是…还是…\n转折关系：虽然…但是…、尽管…还是…\n因果关系：因为…所以…、既然…就…\n条件关系：只要…就…、只有…才…、无论…都…\n假设关系：如果…就…、即使…也…',
        example: '例句：\n并列：他既聪明又勤奋。\n递进：他不但学习好，而且体育也好。\n转折：虽然下雨了，但是我还是要去。\n因果：因为下雨了，所以我带了伞。\n条件：只要努力，就能成功。',
        tips: '使用关联词能让句子之间的关系更清楚。注意关联词要配套使用，不能混用。',
        category: '句子'
      },
      {
        id: 9,
        title: '成语积累',
        content: '成语：固定的词组，多为四字格式，有特定含义\n\n描写人物品质：\n拾金不昧、舍己为人、大公无私、助人为乐\n\n描写学习态度：\n专心致志、全神贯注、废寝忘食、孜孜不倦\n\n描写景色：\n鸟语花香、山清水秀、风和日丽、春暖花开\n\n描写数量多：\n成千上万、数不胜数、不计其数、多如牛毛',
        example: '例句：\n他拾金不昧的精神值得我们学习。\n春天来了，到处鸟语花香。\n图书馆里的书多如牛毛。\n他学习时总是专心致志。',
        tips: '成语是中华文化的瑰宝，要理解成语的意思和来源。建议每天积累2-3个成语。',
        category: '词语'
      },
      {
        id: 10,
        title: '看图写话',
        content: '看图写话的步骤：\n1. 仔细观察图画\n2. 确定时间、地点、人物\n3. 想象事情的经过\n4. 按顺序写清楚\n5. 加上合理的想象\n\n写作要点：\n- 开头：交代时间、地点、人物\n- 中间：写清楚事情经过\n- 结尾：写出结果或感受\n\n常用句式：\n在…的时候…\n只见…正在…\n突然…\n最后…',
        example: '例文：\n一个阳光明媚的早晨，小明在公园里散步。只见一位老奶奶提着很重的菜篮，走得很慢。小明连忙跑过去，说："奶奶，我来帮您提吧！"老奶奶笑着说："谢谢你，好孩子！"',
        tips: '看图写话要展开想象，但不能脱离图画内容。注意用上学过的好词好句，让文章更生动。',
        category: '写作'
      }
    ]
  },
  {
    id: 2,
    title: '初中语文进阶',
    icon: '🌿',
    level: 'middle',
    description: '修辞手法、文言文、阅读理解',
    items: [
      {
        id: 11,
        title: '常用修辞手法',
        content: '1. 比喻：用相似的事物来比方(明喻、暗喻、借喻)\n2. 拟人：把物当作人来写，赋予人的动作、情感\n3. 排比：三个或以上结构相似的句子，增强气势\n4. 夸张：故意言过其实，突出特征\n5. 对偶：字数相等、结构相同的两句\n6. 反问：用疑问形式表达肯定意思\n7. 设问：自问自答，引起注意\n8. 反复：重复使用某些词语或句子\n9. 借代：用相关事物代替本体\n10. 引用：引用名言、典故等',
        example: '例句：\n比喻：她的脸红得像苹果。(明喻)\n拟人：春风轻轻地抚摸着我的脸。\n排比：我们要学习，要进步，要成长。\n夸张：他饿得能吃下一头牛。\n对偶：两个黄鹂鸣翠柳，一行白鹭上青天。\n反问：难道你不知道吗？(表示你应该知道)\n设问：什么是幸福？幸福就是…',
        tips: '修辞手法能让语言更生动形象，写作时适当运用能提升文采。要注意区分不同修辞手法的特点。',
        category: '修辞'
      },
      {
        id: 12,
        title: '文言文基础知识',
        content: '文言文特点：\n1. 用词简练，惜墨如金\n2. 多用单音节词\n3. 省略句子成分\n4. 词类活用现象\n5. 特殊句式\n\n常见虚词：\n之：的、他、到\n乎：吗、啊、于\n者：…的人/事物\n也：表判断或语气\n矣：了、啦\n焉：于此、怎么\n哉：啊、呀\n而：而且、却、来\n则：就、那么\n以：用、因为\n于：在、对、从\n为：做、是、被\n其：他的、难道',
        example: '例句：\n学而时习之，不亦说乎？\n(学习并时常温习，不也很愉快吗？)\n\n温故而知新，可以为师矣。\n(温习旧知识能有新体会，可以当老师了。)\n\n三人行，必有我师焉。\n(三个人一起走，其中必定有我的老师。)',
        tips: '理解文言文要注意：1.积累实词虚词 2.了解古今异义 3.掌握句式特点 4.联系上下文理解',
        category: '文言文'
      },
      {
        id: 13,
        title: '文言文实词积累',
        content: '常见文言实词：\n\n表示"说"：曰、云、言、语、道、白、陈\n表示"看"：见、视、望、观、睹、瞻\n表示"走"：行、步、趋、走、奔、驰\n表示"死"：卒、殁、崩、薨、殂、逝\n\n古今异义词：\n走：古义"跑"，今义"行走"\n去：古义"离开"，今义"到…去"\n妻子：古义"妻子和儿女"，今义"配偶"\n亲戚：古义"内外亲属"，今义"旁系亲属"',
        example: '例句：\n"走"的古今异义：\n古：扁鹊望桓侯而还走。(跑)\n今：我走在路上。(行走)\n\n"去"的古今异义：\n古：委而去之。(离开)\n今：我去北京。(到…去)',
        tips: '积累文言实词要注意一词多义和古今异义。建议建立文言词汇本，分类整理。',
        category: '文言文'
      },
      {
        id: 14,
        title: '说明文阅读',
        content: '说明文特点：\n1. 说明对象明确\n2. 说明顺序清晰\n3. 说明方法多样\n4. 语言准确严密\n\n说明顺序：\n- 时间顺序：按时间先后\n- 空间顺序：按空间位置\n- 逻辑顺序：按事理关系(总分、因果、主次)\n\n说明方法：\n- 举例子：具体说明，增强说服力\n- 列数字：准确说明，科学严密\n- 作比较：突出特点，鲜明对比\n- 打比方：生动说明，通俗易懂\n- 分类别：条理清楚，层次分明\n- 下定义：揭示本质，科学准确\n- 作诠释：具体解释，便于理解\n- 摹状貌：描摹形象，生动形象\n- 引资料：增强说服力，权威可信',
        example: '例句：\n举例子：许多动物都会冬眠，比如熊、蛇、青蛙等。\n列数字：长城全长约21196.18千米。\n作比较：太阳比地球大130万倍。\n打比方：石拱桥的桥洞成弧形，就像虹。\n分类别：图书馆的书分为文学类、科技类、历史类等。',
        tips: '阅读说明文要抓住：说明对象、说明特征、说明顺序、说明方法、语言特点。答题时要结合文本具体分析。',
        category: '阅读'
      },
      {
        id: 15,
        title: '记叙文阅读',
        content: '记叙文六要素：\n时间、地点、人物、事件的起因、经过、结果\n\n记叙顺序：\n- 顺叙：按时间先后顺序\n- 倒叙：先写结果，再写经过\n- 插叙：叙述中插入相关内容\n\n表达方式：\n- 记叙：叙述事件经过\n- 描写：人物、景物、环境描写\n- 抒情：直接抒情、间接抒情\n- 议论：画龙点睛，揭示主题\n- 说明：补充交代\n\n人物描写方法：\n外貌、语言、动作、心理、神态\n正面描写、侧面描写',
        example: '例文分析：\n《背影》朱自清\n- 六要素：车站送别父亲\n- 顺序：倒叙(开头点题)\n- 描写：外貌"戴着黑布小帽"、动作"蹒跚地走"、细节"爬月台买橘子"\n- 抒情：通过"背影"抒发父子深情',
        tips: '阅读记叙文要理清文章脉络，把握情感变化，体会表达效果。注意分析关键词句的作用。',
        category: '阅读'
      },
      {
        id: 16,
        title: '议论文三要素',
        content: '议论文三要素：\n1. 论点：作者的观点和主张(中心论点、分论点)\n2. 论据：证明论点的材料\n3. 论证：用论据证明论点的过程\n\n论据类型：\n- 事实论据：真实的事例、数据、史实\n- 道理论据：名言警句、科学原理、公理定律\n\n论证方法：\n- 举例论证：用事实说话，有说服力\n- 道理论证：引用名言，增强权威性\n- 对比论证：正反对比，鲜明有力\n- 比喻论证：生动形象，通俗易懂\n\n论证结构：\n- 总分总、分总、总分',
        example: '例文结构：\n论点：读书使人进步\n\n论据1：高尔基说"书籍是人类进步的阶梯"(道理论据)\n论据2：鲁迅通过大量阅读成为文学大师(事实论据)\n论据3：对比不读书的人和读书的人(对比论证)\n\n结论：我们要多读书，读好书',
        tips: '写议论文要做到：论点明确、论据充分、论证严密、结构清晰。论据要典型、真实、有代表性。',
        category: '写作'
      },
      {
        id: 17,
        title: '古诗词鉴赏',
        content: '鉴赏要点：\n1. 理解诗意：读懂字面意思\n2. 体会情感：作者的思想感情\n3. 分析手法：修辞、表现手法\n4. 品味语言：炼字、意境\n5. 把握主题：诗歌的中心思想\n\n常见意象：\n月亮-思乡、柳树-离别、梅花-坚强\n春风-希望、秋风-悲凉、杜鹃-思归\n菊花-高洁、莲花-清廉、竹子-气节\n\n表现手法：\n借景抒情、托物言志、动静结合\n虚实结合、对比衬托、欲扬先抑',
        example: '例诗：\n《静夜思》李白\n床前明月光，疑是地上霜。\n举头望明月，低头思故乡。\n\n赏析：\n意象："明月"象征思乡\n手法：借景抒情\n情感：思念家乡的愁绪\n语言：平实自然，朗朗上口',
        tips: '鉴赏古诗要结合时代背景、作者经历，理解诗歌的深层含义。注意诗歌的意境美和语言美。',
        category: '诗词'
      },
      {
        id: 18,
        title: '文言文句式',
        content: '特殊句式：\n\n1. 判断句：\n- …者…也：陈胜者，阳城人也。\n- …者也：项羽者，力能扛鼎也。\n- 为：此为何若人？\n\n2. 被动句：\n- 为…所：为天下笑\n- 见…于：见笑于大方之家\n- 于：受制于人\n\n3. 倒装句：\n- 宾语前置：何陋之有？(有何陋)\n- 定语后置：马之千里者(千里之马)\n- 状语后置：生于忧患(于忧患生)\n- 主谓倒装：甚矣，汝之不惠！\n\n4. 省略句：\n- 省略主语、宾语、介词等',
        example: '例句分析：\n\n"何陋之有？"(宾语前置)\n正常语序：有何陋？\n翻译：有什么简陋的呢？\n\n"马之千里者"(定语后置)\n正常语序：千里之马\n翻译：能日行千里的马\n\n"生于忧患"(状语后置)\n正常语序：于忧患生\n翻译：在忧患中生存',
        tips: '掌握文言句式有助于准确理解文言文，翻译时要调整为现代汉语语序。多读多练，培养语感。',
        category: '文言文'
      },
      {
        id: 19,
        title: '作文审题立意',
        content: '审题的重要性：\n审题是作文的第一步，决定文章的方向\n\n审题要点：\n1. 审文体：记叙文、议论文、说明文\n2. 审题目：抓住关键词\n3. 审要求：字数、内容、范围\n4. 审限制：时间、地点、人物\n\n立意要求：\n1. 正确：符合题意，积极向上\n2. 集中：一个中心，不能分散\n3. 深刻：有思想深度\n4. 新颖：角度独特，不落俗套\n\n常见题型：\n命题作文、半命题作文、材料作文、话题作文',
        example: '例题：《成长的烦恼》\n\n审题：\n- 关键词："成长""烦恼"\n- 文体：记叙文为主\n- 内容：写成长过程中遇到的困扰\n\n立意：\n角度1：学习压力带来的烦恼\n角度2：与父母沟通的烦恼\n角度3：友谊中的烦恼\n角度4：烦恼也是成长的财富(深刻)',
        tips: '审题要仔细，不能偏题跑题。立意要积极向上，有真情实感。可以用"一题多角度"的方法训练。',
        category: '写作'
      },
      {
        id: 20,
        title: '作文开头结尾技巧',
        content: '开头技巧：\n1. 开门见山：直接点题\n2. 引用开头：名言、诗句\n3. 设问开头：引起思考\n4. 描写开头：环境、人物\n5. 对比开头：形成反差\n6. 排比开头：增强气势\n\n结尾技巧：\n1. 总结全文：点明中心\n2. 首尾呼应：结构完整\n3. 抒情结尾：升华主题\n4. 引用结尾：意味深长\n5. 展望未来：留有余味\n6. 反问结尾：发人深省\n\n注意事项：\n开头要简洁，不要拖沓\n结尾要有力，不要草率',
        example: '例文：\n\n开头(引用)：\n"失败是成功之母"，这句话一直激励着我。\n\n结尾(首尾呼应)：\n现在我终于明白，"失败是成功之母"这句话的真正含义。\n\n开头(设问)：\n什么是幸福？每个人都有不同的答案。\n\n结尾(抒情)：\n幸福其实很简单，它就在我们身边，等待我们去发现。',
        tips: '好的开头能吸引读者，好的结尾能升华主题。平时要多积累优美的开头结尾，形成自己的风格。',
        category: '写作'
      }
    ]
  },
  {
    id: 3,
    title: '高中语文深化',
    icon: '🌳',
    level: 'high',
    description: '文学鉴赏、写作技巧、语言运用',
    items: [
      {
        id: 21,
        title: '小说三要素与鉴赏',
        content: '小说三要素：\n1. 人物：主要人物、次要人物、人物形象\n2. 情节：开端、发展、高潮、结局(序幕、尾声)\n3. 环境：自然环境、社会环境\n\n人物塑造方法：\n- 外貌描写：刻画外在形象\n- 语言描写：展现性格特点\n- 动作描写：表现人物行为\n- 心理描写：揭示内心世界\n- 神态描写：反映情感变化\n- 正面描写：直接刻画\n- 侧面描写：间接烘托\n\n情节作用：\n- 推动故事发展\n- 刻画人物性格\n- 揭示主题思想\n- 制造悬念，吸引读者',
        example: '例如《祝福》：\n人物：祥林嫂(主)、鲁四老爷(次)\n情节：祥林嫂的悲惨遭遇(三次到鲁家)\n环境：鲁镇的封建社会环境\n\n人物塑造：\n外貌："头发花白""眼角带着泪痕"\n语言："我真傻，真的"\n动作："机械地做事"\n侧面：通过他人议论烘托',
        tips: '分析小说要关注：人物形象、情节结构、环境作用、主题思想、艺术手法。注意细节描写的作用。',
        category: '小说'
      },
      {
        id: 22,
        title: '散文鉴赏方法',
        content: '散文特点：\n1. 形散神聚：选材自由，中心明确\n2. 语言优美：讲究文采，富有韵味\n3. 情感真挚：抒发真情实感\n4. 意境深远：含蓄隽永\n\n散文类型：\n- 叙事散文：以记叙为主，叙事中抒情\n- 抒情散文：以抒情为主，借景抒情\n- 议论散文：以议论为主，夹叙夹议\n- 哲理散文：蕴含哲理，启迪思考\n\n散文线索：\n- 人物线索、事件线索、物品线索\n- 时间线索、空间线索、情感线索\n\n表现手法：\n借景抒情、托物言志、欲扬先抑\n对比衬托、象征手法、联想想象',
        example: '例如朱自清《背影》：\n类型：叙事抒情散文\n线索：父亲的背影\n情感：父子深情\n手法：细节描写、对比\n语言：朴实自然，情真意切\n\n通过"背影"这一细节，表达了深沉的父爱。\n开头结尾呼应，结构完整。',
        tips: '鉴赏散文要把握：线索、情感、手法、语言特色。注意分析关键句段的作用和含义。',
        category: '散文'
      },
      {
        id: 23,
        title: '议论文写作技巧',
        content: '议论文结构：\n1. 引论：提出问题(是什么)\n2. 本论：分析问题(为什么)\n3. 结论：解决问题(怎么办)\n\n论证结构：\n- 并列式：几个分论点并列展开\n- 递进式：层层深入，步步推进\n- 对照式：正反对比，鲜明有力\n- 总分式：先总后分，条理清晰\n\n分论点设置：\n- 是什么、为什么、怎么办\n- 个人、集体、国家\n- 过去、现在、未来\n\n写作要求：\n观点明确、论据充分、论证严密\n语言准确、逻辑清晰、结构完整',
        example: '例文框架：《谈坚持》\n\n引论：坚持是成功的关键(提出论点)\n\n本论(并列式)：\n分论点1：坚持能克服困难\n- 事例：爱迪生发明电灯\n- 分析：正是坚持让他成功\n\n分论点2：坚持能积累经验\n- 事例：王羲之练字\n- 分析：日积月累终成大家\n\n分论点3：坚持能实现目标\n- 对比：坚持与放弃的不同结果\n\n结论：我们要学会坚持，持之以恒',
        tips: '写议论文要做到：论点鲜明、论据典型、论证有力、结构严谨。注意论据的真实性和典型性。',
        category: '写作'
      },
      {
        id: 24,
        title: '文言文句式与翻译',
        content: '特殊句式：\n\n1. 判断句：\n- …者…也：陈胜者，阳城人也。\n- …也：此诚危急存亡之秋也。\n- 为：此为何若人？\n- 是：是进亦忧，退亦忧。\n\n2. 被动句：\n- 为…所：为天下笑\n- 见…于：见笑于大方之家\n- 于：受制于人\n- 被：被发左衽\n\n3. 倒装句：\n- 宾语前置：何陋之有？\n- 定语后置：马之千里者\n- 状语后置：生于忧患\n- 主谓倒装：甚矣，汝之不惠！\n\n4. 省略句：省略主语、宾语、介词\n\n翻译原则：\n信(忠实原文)、达(通顺流畅)、雅(文雅优美)',
        example: '翻译技巧：\n\n1. 留：保留专有名词\n例：陈胜者，阳城人也。\n译：陈胜是阳城人。\n\n2. 补：补充省略成分\n例：(项羽)乃悉引兵渡河。\n译：项羽于是率领全部军队渡过黄河。\n\n3. 删：删去无实义的词\n例：夫战，勇气也。\n译：作战，靠的是勇气。\n\n4. 换：替换古今异义词\n例：率妻子邑人来此绝境。\n译：率领妻子儿女和乡邻来到这与世隔绝的地方。',
        tips: '翻译文言文要注意：实词、虚词、句式、语气。做到字字落实，句句通顺。',
        category: '文言文'
      },
      {
        id: 25,
        title: '诗歌鉴赏技巧',
        content: '鉴赏角度：\n\n1. 形象：诗歌中的人、物、景\n- 人物形象：性格特点、精神品质\n- 景物形象：特征、氛围\n- 事物形象：象征意义\n\n2. 语言：炼字、炼句\n- 动词、形容词的妙用\n- 叠词、数词的作用\n- 语言风格：豪放、婉约、清新、沉郁\n\n3. 表达技巧：\n- 修辞手法：比喻、拟人、夸张等\n- 表现手法：借景抒情、托物言志、对比衬托\n- 结构技巧：首尾呼应、卒章显志\n\n4. 思想情感：\n- 思乡怀人、羁旅愁思\n- 忧国忧民、建功立业\n- 闲适恬淡、热爱自然',
        example: '例诗：《春望》杜甫\n国破山河在，城春草木深。\n感时花溅泪，恨别鸟惊心。\n烽火连三月，家书抵万金。\n白头搔更短，浑欲不胜簪。\n\n鉴赏：\n形象：忧国忧民的诗人形象\n语言："溅""惊"拟人，"抵万金"夸张\n手法：借景抒情，情景交融\n情感：忧国思家的沉痛情怀',
        tips: '鉴赏诗歌要结合背景、意象、手法、情感综合分析。答题要有条理，结合诗句具体分析。',
        category: '诗词'
      },
      {
        id: 26,
        title: '现代文阅读答题技巧',
        content: '常见题型及答题方法：\n\n1. 概括题：\n- 概括段意：找中心句或关键词\n- 概括主旨：人物+事件+情感/道理\n\n2. 理解题：\n- 理解词语：结合语境，解释含义\n- 理解句子：表层含义+深层含义\n\n3. 赏析题：\n- 赏析句子：修辞+内容+效果+情感\n- 赏析段落：内容+结构+手法+作用\n\n4. 作用题：\n- 内容作用：写了什么，表达什么\n- 结构作用：承上启下、铺垫伏笔\n- 表达作用：突出主题、深化中心\n\n5. 探究题：\n- 观点+理由+文本依据\n- 联系实际，言之有理',
        example: '答题示例：\n\n题：赏析"春风又绿江南岸"中"绿"字的妙处。\n\n答：(1)修辞：化静为动，使"绿"由形容词变为动词。\n(2)内容：生动形象地写出了春风吹过，江南大地草木返青的景象。\n(3)效果：富有动感和生机，增强了画面的感染力。\n(4)情感：表达了诗人对江南春色的喜爱和对家乡的思念。',
        tips: '答题要规范：审清题意、找准角度、分点作答、结合文本。注意答题的完整性和条理性。',
        category: '阅读'
      },
      {
        id: 27,
        title: '作文素材积累',
        content: '素材类型：\n\n1. 名人事例：\n- 古代：司马迁、苏轼、陶渊明\n- 近代：鲁迅、钱学森、袁隆平\n- 外国：爱因斯坦、居里夫人、海伦·凯勒\n\n2. 名言警句：\n- 励志类：天行健，君子以自强不息\n- 读书类：读书破万卷，下笔如有神\n- 品德类：勿以恶小而为之\n\n3. 诗词名句：\n- 爱国：位卑未敢忘忧国\n- 友情：海内存知己，天涯若比邻\n- 亲情：谁言寸草心，报得三春晖\n\n4. 时事热点：\n- 科技发展、环境保护\n- 社会现象、文化传承\n\n素材运用：\n- 一材多用：从不同角度使用\n- 新旧结合：古今对比\n- 详略得当：重点详写',
        example: '素材示例：\n\n司马迁：\n角度1：坚持理想(忍辱著《史记》)\n角度2：客观公正(秉笔直书)\n角度3：人生价值(人固有一死)\n\n袁隆平：\n角度1：科技创新(杂交水稻)\n角度2：造福人类(解决粮食问题)\n角度3：淡泊名利(一生只做一件事)',
        tips: '积累素材要分类整理，注重素材的典型性和新颖性。同一素材可以从多个角度使用。',
        category: '写作'
      },
      {
        id: 28,
        title: '语言表达与运用',
        content: '语言表达技巧：\n\n1. 准确性：用词精确，避免歧义\n- 区分近义词的细微差别\n- 注意词语的感情色彩\n- 把握词语的适用范围\n\n2. 生动性：运用修辞，形象具体\n- 比喻、拟人、排比\n- 动词、形容词的选用\n- 细节描写\n\n3. 简洁性：言简意赅，不拖沓\n- 删除冗余词语\n- 避免重复啰嗦\n- 提炼关键信息\n\n4. 得体性：符合场合、对象\n- 书面语与口语\n- 正式与非正式\n- 尊称与谦称\n\n语言运用题型：\n- 仿写：模仿句式、修辞\n- 扩写：增加细节描写\n- 缩写：提炼主要内容\n- 改写：改变表达方式\n- 衔接：语句连贯',
        example: '例题：\n\n仿写：\n原句：青春是一首歌，唱出生命的激情。\n仿写：青春是一幅画，描绘人生的色彩。\n\n扩写：\n原句：春天来了。\n扩写：温暖的春天悄悄地来了，万物复苏，大地一片生机勃勃，到处都是鸟语花香。\n\n缩写：\n原句：聪明的小明高兴地吃着红红的苹果。\n缩写：小明吃苹果。',
        tips: '提高语言表达能力要多读、多写、多练，注意积累优美词句。做题时要注意题目要求。',
        category: '语言'
      },
      {
        id: 29,
        title: '文学常识积累',
        content: '中国古代文学：\n\n先秦：\n- 《诗经》：我国第一部诗歌总集\n- 《论语》：儒家经典，记录孔子言行\n- 屈原：《离骚》，浪漫主义源头\n\n唐代：\n- 李白：诗仙，浪漫主义\n- 杜甫：诗圣，现实主义\n- 白居易：新乐府运动\n\n宋代：\n- 苏轼：豪放派词人\n- 李清照：婉约派词人\n- 辛弃疾：豪放派词人\n\n明清：\n- 四大名著：《红楼梦》《西游记》《水浒传》《三国演义》\n\n现当代文学：\n- 鲁迅：《呐喊》《彷徨》\n- 巴金：《家》《春》《秋》\n- 老舍：《骆驼祥子》《茶馆》\n- 莫言：诺贝尔文学奖获得者',
        example: '记忆技巧：\n\n唐代诗人：\n李白-诗仙-浪漫主义-《将进酒》\n杜甫-诗圣-现实主义-《春望》\n白居易-诗魔-新乐府-《琵琶行》\n\n宋代词人：\n苏轼-豪放派-《念奴娇·赤壁怀古》\n李清照-婉约派-《声声慢》\n辛弃疾-豪放派-《破阵子》',
        tips: '文学常识要系统积累，按时代、体裁、作家分类记忆。注意作家的代表作品和文学地位。',
        category: '文学常识'
      },
      {
        id: 30,
        title: '高考作文应试技巧',
        content: '高考作文要求：\n\n1. 审题立意：\n- 准确理解题意\n- 立意积极向上\n- 角度新颖独特\n\n2. 结构安排：\n- 开头：简洁有力，引出论点\n- 主体：分论点清晰，论证充分\n- 结尾：总结升华，呼应开头\n\n3. 素材运用：\n- 素材典型新颖\n- 详略得当\n- 古今中外结合\n\n4. 语言表达：\n- 准确规范\n- 生动形象\n- 有文采\n\n5. 书写卷面：\n- 字迹工整\n- 卷面整洁\n- 标点正确\n\n作文类型：\n- 任务驱动型作文\n- 材料作文\n- 话题作文',
        example: '高分作文特点：\n\n1. 立意深刻：\n不仅停留在表面，能挖掘深层含义\n\n2. 结构严谨：\n总分总结构，分论点并列或递进\n\n3. 素材丰富：\n古今中外，名人事例，时事热点\n\n4. 语言优美：\n运用修辞，引用诗词，句式多样\n\n5. 书写规范：\n字迹清晰，段落分明，标点正确',
        tips: '高考作文要注意：审题准确、立意深刻、结构清晰、素材典型、语言优美、书写工整。平时多练习，形成自己的写作风格。',
        category: '写作'
      }
    ]
  }
];

export function ChineseLearnPage() {
  const [selectedLevel, setSelectedLevel] = useState<'primary' | 'middle' | 'high'>('primary');
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [completedItems, setCompletedItems] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('completed-chinese-items');
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
      // 更新打卡数据
      checkInService.updateTodayProgress({ lessonsCompleted: 1 });
    }
    setCompletedItems(newCompleted);
    localStorage.setItem('completed-chinese-items', JSON.stringify([...newCompleted]));
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
    <div className="chinese-learn-page">
      <div className="page-header">
        <h1>📚 语文知识学习</h1>
        <p className="subtitle">小学、初中、高中语文知识体系</p>
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
          🌱 小学基础
        </button>
        <button
          className={`level-btn ${selectedLevel === 'middle' ? 'active' : ''}`}
          onClick={() => {
            setSelectedLevel('middle');
            setSelectedChapter(null);
            setSelectedItem(null);
          }}
        >
          🌿 初中进阶
        </button>
        <button
          className={`level-btn ${selectedLevel === 'high' ? 'active' : ''}`}
          onClick={() => {
            setSelectedLevel('high');
            setSelectedChapter(null);
            setSelectedItem(null);
          }}
        >
          🌳 高中深化
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
              <h3>📝 例句示例</h3>
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
