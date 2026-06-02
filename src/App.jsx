import { useState, useRef, useEffect } from "react";

const SUPABASE_URL = "https://jmddyrmvicpmyawhjybe.supabase.co";
const SUPABASE_KEY = "sb_publishable_TpoXUuvsBQeqE1MS-CQ5rg_2DCFIdbH";

const QUESTIONS = [
  { id:1, dim:"stress", weight:1.2, text:"考试前三天，你通常会：", options:[
    {label:"高强度复习，失眠但可以接受",score:5},{label:"有计划复习，睡眠略差但还好",score:3},
    {label:"容易焦虑到无法集中",score:1},{label:"干脆放弃，反正尽力了",score:0}]},
  { id:2, dim:"stress", weight:1.0, text:"一个项目被否定后重来，你的第一反应是：", options:[
    {label:"有点沮丧但很快重整旗鼓",score:4},{label:"需要一天缓一缓再继续",score:3},
    {label:"开始怀疑自己的能力",score:1},{label:"感到愤怒和不公平",score:2}]},
  { id:3, dim:"stress", weight:1.1, text:"你能接受多长时间没有明显进展的状态？", options:[
    {label:"半年以上，我相信长期积累",score:5},{label:"2-3个月，之后需要一些反馈",score:4},
    {label:"一个月，之后焦虑感会爆发",score:2},{label:"两周，我需要持续的正向反馈",score:1}]},
  { id:4, dim:"stress", weight:1.0, text:"你在公开场合出了错（演讲卡壳、数据写错），你会：", options:[
    {label:"当场调整，事后一笑而过",score:5},{label:"有些尴尬，但几小时后就过了",score:3},
    {label:"事后反复回想，影响情绪1-2天",score:2},{label:"非常痛苦，长时间难以释怀",score:1}]},
  { id:5, dim:"stress", weight:1.0, text:"你在截止日前的工作状态是：", options:[
    {label:"效率飙升，截止压力能激发我",score:5},{label:"稳定推进，不太受截止影响",score:3},
    {label:"开始拖延，然后最后冲刺",score:2},{label:"截止日前常常焦虑崩溃",score:1}]},
  { id:6, dim:"stress", weight:0.9, text:"你对竞争的感受是：", options:[
    {label:"喜欢，竞争让我更兴奋",score:5},{label:"可以接受，但不主动找竞争",score:3},
    {label:"压力很大，但还能撑住",score:2},{label:"非常抗拒，竞争让我窒息",score:1}]},
  { id:7, dim:"certainty", weight:1.2, text:"你更喜欢哪种工作方式？", options:[
    {label:"有清晰规则和标准答案",score:5},{label:"有大方向，细节可以自己定",score:3},
    {label:"完全开放，自己探索方向",score:1},{label:"介于有规则和没规则之间",score:2}]},
  { id:8, dim:"certainty", weight:1.1, text:"你对这道题没有标准答案的感受是：", options:[
    {label:"很兴奋，我喜欢这种探索感",score:1},{label:"稍微不安，但能适应",score:3},
    {label:"很焦虑，我需要知道对错",score:5},{label:"无所谓，我自己定答案",score:2}]},
  { id:9, dim:"certainty", weight:1.0, text:"如果你的工作结果要等3个月才能知道好坏，你会：", options:[
    {label:"可以接受，过程就是收获",score:1},{label:"有点难受，但还能撑住",score:3},
    {label:"非常焦虑，我需要即时反馈",score:5},{label:"主动设定中间节点来确认进度",score:2}]},
  { id:10, dim:"certainty", weight:1.0, text:"你选专业/工作时，最看重：", options:[
    {label:"薪资区间和就业率数据",score:5},{label:"这个领域的发展潜力",score:3},
    {label:"自己的感受和兴趣",score:1},{label:"是否有清晰的晋升路径",score:4}]},
  { id:11, dim:"certainty", weight:0.9, text:"你更欣赏哪类人？", options:[
    {label:"精通一门，极致深挖的专家",score:5},{label:"跨界整合，左右逢源的通才",score:2},
    {label:"创业冒险，愿赌服输的探索者",score:1},{label:"稳扎稳打，积累资源的实干家",score:4}]},
  { id:12, dim:"social", weight:1.2, text:"高强度社交（会议、谈判、演讲）一整天后，你通常：", options:[
    {label:"感觉充能，精神更好了",score:5},{label:"有些疲惫，休息一晚就好",score:3},
    {label:"需要独处半天才能恢复",score:2},{label:"筋疲力尽，两天都没恢复",score:1}]},
  { id:13, dim:"social", weight:1.1, text:"你理想的工作伙伴关系是：", options:[
    {label:"像家人，彼此非常了解",score:4},{label:"专业同事，配合默契即可",score:3},
    {label:"点头之交，各做各的",score:1},{label:"不需要伙伴，我喜欢单打独斗",score:1}]},
  { id:14, dim:"social", weight:1.0, text:"别人不同意你的想法，你需要开口说服他们，这时你会：", options:[
    {label:"很享受，我喜欢这种交锋感",score:5},
    {label:"没问题，说服别人是正常工作",score:4},
    {label:"能做，但做完会有点累",score:3},
    {label:"有些不舒服，但可以硬撑过去",score:2},
    {label:"非常排斥，我不想去改变别人想法",score:1}]},
  { id:15, dim:"social", weight:1.0, text:"理想中，你的工作中有多少直接和人打交道的时间？", options:[
    {label:"80%以上，我靠人际关系工作",score:5},{label:"50%左右，平衡就好",score:3},
    {label:"20%以下，偶尔开会就好",score:2},{label:"几乎不需要，越少越好",score:1}]},
  { id:16, dim:"social", weight:0.9, text:"你在陌生人群体中自我介绍，通常：", options:[
    {label:"主动出击，轻松搭讪",score:5},{label:"等别人开口，然后接上话",score:3},
    {label:"有点尴尬，但能撑过去",score:2},{label:"非常不舒服，尽量避免",score:1}]},
  { id:17, dim:"patience", weight:1.2, text:"重复做同一类任务（如反复校对、反复实验），你的耐受极限是：", options:[
    {label:"可以做很久，这种感觉让我安心",score:5},{label:"几天后开始厌倦，但还能继续",score:3},
    {label:"一天后就开始找新刺激",score:2},{label:"几乎无法重复做同一件事",score:1}]},
  { id:18, dim:"patience", weight:1.1, text:"你是否能接受一个需要5年才能出成果的研究方向？", options:[
    {label:"完全可以，我有这种耐心",score:5},{label:"可以，但需要阶段性里程碑",score:3},
    {label:"很难，我需要更快的成果",score:2},{label:"不可能，我需要即时回报",score:1}]},
  { id:19, dim:"patience", weight:1.0, text:"你偏好哪种工作节奏？", options:[
    {label:"稳步推进，节奏固定",score:5},{label:"冲刺-休整交替，不喜欢一成不变",score:3},
    {label:"越快越好，效率就是生命",score:2},{label:"随心所欲，不喜欢被节奏约束",score:1}]},
  { id:20, dim:"patience", weight:1.0, text:"对于学一个东西需要3个月才能上手，你的感受是：", options:[
    {label:"正常，深度积累就是这样",score:5},{label:"稍长，但可以接受",score:3},
    {label:"太慢了，我偏好更快上手的技能",score:2},{label:"无法接受，我需要快速看到成果",score:1}]},
  { id:21, dim:"patience", weight:0.9, text:"你对细节的态度是：", options:[
    {label:"魔鬼在细节，我享受抠细节",score:5},{label:"大方向对了，细节可以后补",score:3},
    {label:"细节让我焦虑，我更喜欢宏观",score:2},{label:"细节是别人的工作，我管策略",score:1}]},
  { id:22, dim:"resource", weight:1.3, text:"你的家庭经济状况（如实回答，这影响现实路径）：", options:[
    {label:"宽裕，可以支持长期求学或出国",score:5},{label:"中等，可以读到本科/硕士，但需兼顾就业",score:3},
    {label:"有压力，毕业后需要尽快经济独立",score:2},{label:"困难，就业优先级高于深造",score:1}]},
  { id:23, dim:"resource", weight:1.1, text:"你目前所在地区的教育和就业资源是：", options:[
    {label:"国际化大城市（纽约/伦敦/新加坡/北上广深等），资源极丰富",score:5},
    {label:"中型城市或发达地区，有一定资源",score:3},
    {label:"小城市或资源一般的地区",score:2},
    {label:"资源匮乏地区，主要依靠网络获取信息",score:1}]},
  { id:24, dim:"resource", weight:1.0, text:"你现在读的或刚毕业的高中，大概是什么层次？", options:[
    {label:"顶级高中（IB/AP/A-Level重点校，或国内省级示范校），升学率很高",score:5},
    {label:"较好的高中，升学率中等偏上",score:4},
    {label:"普通高中，升学率一般",score:3},
    {label:"职高/中专，或成绩在校内偏弱",score:2},
    {label:"还没确定/不好评估",score:2}]},
  { id:25, dim:"resource", weight:1.0, text:"你有没有可以利用的行业人脉或家庭背景资源？", options:[
    {label:"有，家庭有明显的行业资源",score:5},{label:"有一些，但不稳定",score:3},
    {label:"基本靠自己，没有明显资源",score:2},{label:"完全白手起家",score:1}]},
  { id:26, dim:"resource", weight:0.9, text:"你愿意为了最好的发展机会，离开家乡去外地甚至国外吗？", options:[
    {label:"完全愿意，机会在哪我去哪（包括出国）",score:5},
    {label:"愿意去大城市或另一个国家，但有偏好地区",score:4},
    {label:"希望留在本国的大城市发展",score:3},
    {label:"必须留在本地，这是硬约束",score:1}]},
  { id:27, dim:"meaning", weight:1.2, text:"你工作/学习最大的动力来源是：", options:[
    {label:"解决真实问题、看到世界变好",score:5},{label:"个人成长，能力越来越强",score:4},
    {label:"收入和生活质量提升",score:3},{label:"别人的认可和社会地位",score:2}]},
  { id:28, dim:"meaning", weight:1.1, text:"如果这份工作收入一般但极有意义，你会：", options:[
    {label:"接受，意义比钱更重要",score:5},{label:"接受，但会努力通过其他方式补收入",score:3},
    {label:"拒绝，收入是基本前提",score:1},{label:"纠结，取决于具体情况",score:2}]},
  { id:29, dim:"meaning", weight:1.0, text:"做一件事如果要很久才能看到结果，你通常会：", options:[
    {label:"没问题，我能为长远目标持续投入",score:5},
    {label:"还好，只要有阶段性进展就行",score:4},
    {label:"有些难熬，但能坚持",score:3},
    {label:"很难，我需要比较快地看到成果",score:2},
    {label:"很抗拒，看不到结果我就失去动力",score:1}]},
  { id:30, dim:"meaning", weight:1.0, text:"你如何看待职业这件事？", options:[
    {label:"职业是我的身份认同，我就是我的工作",score:5},{label:"职业是实现目标的载体",score:3},
    {label:"职业是谋生手段，生活才是重心",score:2},{label:"不太想太多，随缘",score:1}]},
  { id:31, dim:"meaning", weight:0.9, text:"你更愿意在哪种场景中工作？", options:[
    {label:"帮助弱势群体或解决社会问题",score:5},{label:"推动技术前沿或科学进步",score:4},
    {label:"在商业世界里创造价值",score:3},{label:"艺术或文化领域",score:4}]},
  { id:32, dim:"patience", weight:1.0, text:"长时间坐在桌前做同一件事（读书、写代码、画图），你的感受是：", options:[
    {label:"完全没问题，我很享受这种专注状态",score:5},
    {label:"可以，习惯了就好",score:4},
    {label:"还行，但每隔一段时间需要起来动一动",score:3},
    {label:"比较难受，我需要经常换环境或走动",score:2},
    {label:"很难接受，久坐让我非常烦躁",score:1}]},
  { id:33, dim:"stress", weight:1.0, text:"你能接受工作中生死攸关类的压力吗（如医生、飞行员）？", options:[
    {label:"可以，这让我感到生命意义",score:5},{label:"可以在可控范围内承受",score:3},
    {label:"很难，这种压力会压垮我",score:1},{label:"完全无法接受，太沉重了",score:0}]},
  { id:34, dim:"certainty", weight:1.0, text:"对于你的工作成果很难被量化评估，你的感受是：", options:[
    {label:"无所谓，我知道自己做了什么",score:1},{label:"有些不安，但能接受",score:3},
    {label:"很焦虑，我需要数字来证明自己",score:5},{label:"会主动设计指标来衡量自己",score:4}]},
  { id:35, dim:"social", weight:1.0, text:"你能否接受工作中有大量情绪劳动（照顾他人感受、处理冲突）？", options:[
    {label:"很擅长，这是我的强项",score:5},{label:"可以做，但比较耗能",score:3},
    {label:"经常让我感到精疲力竭",score:1},{label:"完全排斥，我不想管别人情绪",score:0}]},
  { id:36, dim:"meaning", weight:1.0, text:"你对专业壁垒的态度是：", options:[
    {label:"越深越好，我愿意成为少数人能做的专家",score:5},{label:"有一定壁垒，但不想太封闭",score:3},
    {label:"不在乎壁垒，我靠综合能力",score:2},{label:"壁垒越低越好，我不想被困住",score:1}]},
  { id:37, dim:"resource", weight:1.0, text:"你对需要考证或专业资格才能从业的态度是：", options:[
    {label:"没问题，证书是硬实力",score:5},{label:"可以接受，但希望考证周期短",score:3},
    {label:"比较排斥，太耗时间",score:1},{label:"完全不想走需要大量考证的路",score:0}]},
  { id:38, dim:"stress", weight:1.0, text:"如果你的专业/职业领域正在被AI取代，你会：", options:[
    {label:"提前布局，转型或利用AI",score:5},{label:"有些担忧，但相信自己能适应",score:3},
    {label:"非常焦虑，这让我很不安",score:1},{label:"选择一个AI难以取代的方向",score:4}]},
  { id:39, dim:"patience", weight:1.0, text:"你更喜欢哪种工作产出方式？", options:[
    {label:"深度文章、报告、代码等可沉淀的东西",score:5},{label:"方案和演示，过程即价值",score:3},
    {label:"即时反应，谈判、演讲、决策",score:2},{label:"人际关系网络本身就是我的产出",score:4}]},
  { id:40, dim:"certainty", weight:1.0, text:"你怎么看待做了5年发现选错了这件事？", options:[
    {label:"会认真评估再转，经历都是资产",score:3},{label:"无法接受，我必须一开始选对",score:5},
    {label:"转就转，我对试错有较高接受度",score:1},{label:"会在选方向时极度谨慎来避免这种情况",score:4}]},
  { id:41, dim:"academic_math", weight:1.5, text:"你的数学成绩在班级/年级中的水平大致是：", options:[
    {label:"前10%，数学是我的强项",score:5},
    {label:"前30%，中上水平",score:4},
    {label:"中等，不算突出也不差",score:3},
    {label:"偏弱，经常需要花大力气才能跟上",score:2},
    {label:"很差，数学是我明显的短板",score:1}]},
  { id:42, dim:"academic_science", weight:1.4, text:"理科综合（物理+化学+生物，或IB/AP理科课程）中，你的整体表现是：", options:[
    {label:"都不错，理科是我的方向",score:5},
    {label:"物理/化学较好，生物一般",score:4},
    {label:"生物较好，物理/化学偏弱",score:3},
    {label:"整体偏弱，理科不是我的强项",score:2},
    {label:"选的文科/人文方向，没有深入学理科",score:1}]},
  { id:43, dim:"academic_lang", weight:1.3, text:"语文/写作/文字表达方面（包括你的母语写作能力），你的水平大致是：", options:[
    {label:"很强，写作是我的强项，表达清晰有力",score:5},
    {label:"中上，能写出较好的文章",score:4},
    {label:"中等，能完成任务但不算突出",score:3},
    {label:"偏弱，文字表达让我有些吃力",score:2},
    {label:"很差，写作是我的明显短板",score:1}]},
  { id:44, dim:"academic_eng", weight:1.2, text:"你的英语能力（读/写/听/说综合）大致是：", options:[
    {label:"母语级别或接近母语，流利无障碍",score:5},
    {label:"很强，能流利读写英文学术资料",score:5},
    {label:"中上，基本能看懂英文文献和课程",score:4},
    {label:"中等，日常交流可以，学术英语有挑战",score:3},
    {label:"偏弱，英语是我的短板",score:2}]},
  { id:45, dim:"academic_avg", weight:1.5, text:"你的总体学业成绩（GPA/高考/IB分数等）在同龄人中的位置大约是：", options:[
    {label:"前5%，属于顶尖学生",score:5},
    {label:"前20%，成绩良好",score:4},
    {label:"前50%，中等偏上",score:3},
    {label:"后50%，中等偏下",score:2},
    {label:"后20%，成绩明显偏弱",score:1}]},
  { id:46, dim:"academic_math", weight:1.2, text:"面对一道需要多步推导的逻辑/数学题，你通常：", options:[
    {label:"很享受，推导过程让我有成就感",score:5},
    {label:"可以完成，但需要较长时间",score:4},
    {label:"能做，但不喜欢这类题",score:3},
    {label:"经常卡住，需要大量辅助",score:2},
    {label:"基本放弃，这类题让我绝望",score:1}]},
  { id:47, dim:"academic_memory", weight:1.2, text:"你的记忆力和知识积累能力大致是：", options:[
    {label:"很强，背诵和记忆是我的优势",score:5},
    {label:"中上，记得住大部分重要内容",score:4},
    {label:"中等，正常水平",score:3},
    {label:"偏弱，记忆对我来说比较费力",score:2},
    {label:"很差，死记硬背类的任务让我很痛苦",score:1}]},
  { id:48, dim:"academic_science", weight:1.1, text:"你的空间感知和动手能力（实验/制作/绘图）大致是：", options:[
    {label:"很强，我擅长动手和空间想象",score:5},
    {label:"中上，比一般人好一些",score:4},
    {label:"中等，普通水平",score:3},
    {label:"偏弱，动手和空间类任务让我吃力",score:2},
    {label:"很差，这是我明显的短板",score:1}]},
  { id:49, dim:"academic_lang", weight:1.1, text:"你在人文社科类科目（历史/政治/地理/文学，或IB/AP相关课程）的表现是：", options:[
    {label:"很好，这类科目是我的强项",score:5},
    {label:"中上，理解和记忆都还行",score:4},
    {label:"中等，能过但不突出",score:3},
    {label:"偏弱，记概念和背材料让我很痛苦",score:2},
    {label:"很差，文科类科目我整体不擅长",score:1}]},
  { id:50, dim:"academic_avg", weight:1.3, text:"你有没有某一门学科特别突出（远超其他科目）？", options:[
    {label:"有，数学/物理/CS特别突出",score:5},
    {label:"有，语文/写作/历史/人文特别突出",score:4},
    {label:"有，英语或其他外语特别突出",score:3},
    {label:"有，艺术/体育/设计类特别突出",score:2},
    {label:"没有，我各科比较均衡或整体一般",score:1}]},
  { id:51, dim:"meaning", weight:1.1, text:"毕业后第一份工作，你能接受的薪资预期是：", options:[
    {label:"当地生活成本以下也可以，我更看重成长空间",score:1},
    {label:"刚好覆盖当地基本生活成本",score:2},
    {label:"当地中等收入水平（能过得不错）",score:3},
    {label:"当地较高收入水平，收入是我选专业的重要因素",score:5},
    {label:"我对薪资没有明确预期",score:2}]},
  { id:52, dim:"resource", weight:1.0, text:"你的家庭对你选专业这件事，态度是：", options:[
    {label:"完全支持我自己决定",score:5},
    {label:"有建议但尊重我的想法",score:4},
    {label:"有明确偏好，希望我选某类专业",score:3},
    {label:"强烈要求我选特定方向（如医学/法学/金融）",score:2},
    {label:"家庭意见是我做决定的主要依据",score:1}]},
  { id:53, dim:"resource", weight:1.0, text:"你希望未来工作的城市/地区是：", options:[
    {label:"欧美顶级城市（纽约/伦敦/旧金山等）",score:5},
    {label:"亚洲国际城市（新加坡/东京/香港/首尔等）",score:5},
    {label:"中国一线城市（北上广深）",score:4},
    {label:"本国其他大城市或省会",score:3},
    {label:"还没想好，哪里机会好去哪里",score:4}]},
  { id:54, dim:"meaning", weight:1.0, text:"对你来说，选专业最重要的是：", options:[
    {label:"未来能赚到钱，经济稳定",score:2},
    {label:"做自己感兴趣的事",score:4},
    {label:"有社会地位和认可",score:3},
    {label:"能帮助别人或改变社会",score:5},
    {label:"工作轻松，生活和工作平衡",score:1}]},
];

const MAJORS = [
  {id:"cs",name:"计算机科学与技术",category:"理工",
   scoreRequire:{math:4,science:3,lang:2,eng:3,avg:3,memory:3,spatial:3},
   profile:{stress:4,certainty:3,social:2,patience:4,resource:3,meaning:3},
   dailyLife:"80%时间写代码、调Bug、看文档；大量独立作业；偶尔开会",
   riskTags:["以为可以靠兴趣撑过去，实际需要极强的逻辑耐受","算法竞争极激烈"],
   regrets:["三四年后才发现不喜欢坐着敲代码","行业内卷导致精神消耗超预期"],
   validation:["去LeetCode刷3道中等题，看自己会不会享受这个过程","在GitHub找一个开源项目哪怕读3小时代码"]},
  {id:"software_eng",name:"软件工程",category:"理工",
   scoreRequire:{math:4,science:3,lang:2,eng:3,avg:3,memory:3,spatial:3},
   profile:{stress:4,certainty:4,social:3,patience:4,resource:3,meaning:3},
   dailyLife:"工程化开发、文档、流程规范；更多团队协作；产品迭代",
   riskTags:["比CS更工程化，创意空间更小","中期容易陷入螺丝钉困境"],
   regrets:["以为软件工程比CS轻松，实际一样卷","需要长期与不合理需求周旋"],
   validation:["参与一次团队hackathon，看自己能否适应协作开发"]},
  {id:"data_science",name:"数据科学/统计学",category:"理工",
   scoreRequire:{math:4,science:2,lang:2,eng:3,avg:3,memory:3,spatial:2},
   profile:{stress:3,certainty:4,social:2,patience:5,resource:3,meaning:3},
   dailyLife:"大量数字处理、建模、可视化；报告撰写；与业务方沟通",
   riskTags:["统计学本质是数学+耐心，兴趣驱动容易失真","就业依赖行业背景"],
   regrets:["以为数据科学是AI，实际大量时间在清洗数据","商业环境下常被当成Excel工具"],
   validation:["用Kaggle做一个入门项目，看你能否享受数据清洗过程"]},
  {id:"medicine",name:"临床医学",category:"医学",
   scoreRequire:{math:3,science:5,lang:3,eng:3,avg:4,memory:5,spatial:3},
   profile:{stress:5,certainty:4,social:4,patience:5,resource:4,meaning:5},
   dailyLife:"长达8-10年训练期；高强度值班；情绪劳动极重；终身学习",
   riskTags:["入学时热血，5年后精疲力竭是常态","医患关系压力长期存在"],
   regrets:["没想到规培那么苦","职业早期收入与付出严重不匹配"],
   validation:["在医院实习或见习至少一周，体验真实节奏","和住院医聊聊他们的真实状态"]},
  {id:"pharmacy",name:"药学",category:"医学",
   scoreRequire:{math:3,science:4,lang:2,eng:3,avg:3,memory:4,spatial:3},
   profile:{stress:3,certainty:5,social:2,patience:5,resource:3,meaning:4},
   dailyLife:"实验室研究或药店工作；规范严格；相对稳定",
   riskTags:["行业天花板较低","临床药师方向竞争开始激烈"],
   regrets:["以为和医学一样有成就感，实际更接近化工"],
   validation:["在药店实习一周，看每天的工作是否让你有兴趣"]},
  {id:"nursing",name:"护理学",category:"医学",
   scoreRequire:{math:2,science:3,lang:3,eng:2,avg:2,memory:4,spatial:2},
   profile:{stress:5,certainty:4,social:5,patience:4,resource:2,meaning:5},
   dailyLife:"轮班、体力劳动、高强度情绪劳动；职业成就感强但身体消耗大",
   riskTags:["社会认可度偏低","职业晚期体力透支风险高"],
   regrets:["没想到情绪劳动这么重","需要高压下维持专业冷静"],
   validation:["了解护理工作者真实的一天，尤其是ICU或急诊护士"]},
  {id:"law",name:"法学",category:"社科",
   scoreRequire:{math:2,science:1,lang:4,eng:3,avg:3,memory:4,spatial:1},
   profile:{stress:5,certainty:4,social:4,patience:4,resource:4,meaning:4},
   dailyLife:"大量阅读法律文书；律师方向需要极强社交能力；法考是高门槛",
   riskTags:["考证通过率低，未过等于入错行","诉讼方向需要高压谈判能力"],
   regrets:["以为法律很酷，没想到90%是案卷和文书","考证前几年极其煎熬"],
   validation:["阅读一份真实的合同或判决书，看你是否感兴趣","了解执照考试的通过率和备考强度"]},
  {id:"economics",name:"经济学",category:"社科",
   scoreRequire:{math:3,science:2,lang:3,eng:3,avg:3,memory:3,spatial:1},
   profile:{stress:3,certainty:3,social:3,patience:3,resource:3,meaning:3},
   dailyLife:"学术方向大量数学建模；应用方向偏政策分析",
   riskTags:["纯经济学方向就业非常窄","容易被误以为是万能专业"],
   regrets:["发现经济学研究与现实脱节","金融方向竞争没有预想的优势"],
   validation:["读一本初级经济学教材，评估你是否喜欢这种思维方式"]},
  {id:"finance",name:"金融学",category:"社科",
   scoreRequire:{math:4,science:2,lang:3,eng:4,avg:4,memory:3,spatial:1},
   profile:{stress:5,certainty:4,social:4,patience:3,resource:5,meaning:3},
   dailyLife:"投行/基金方向高强度、长时间工作；银行方向相对稳定",
   riskTags:["顶级金融岗位极度依赖名校光环和人脉","普通金融工作与想象差距大"],
   regrets:["以为金融等于高薪，没想到高薪需要极高资源门槛","工作内容常常机械重复"],
   validation:["调查清楚目标岗位的真实工作内容和入职门槛"]},
  {id:"accounting",name:"会计学",category:"社科",
   scoreRequire:{math:3,science:1,lang:2,eng:2,avg:2,memory:3,spatial:1},
   profile:{stress:3,certainty:5,social:2,patience:5,resource:2,meaning:2},
   dailyLife:"大量数字处理、凭证、报表；季末年末高压；规范严格",
   riskTags:["AI替代风险中等偏高","工作内容重复性强"],
   regrets:["以为会计稳定，没想到职业后期被软件取代了很多工作"],
   validation:["实习感受真实的账务处理工作，评估你对数字的耐受性"]},
  {id:"marketing",name:"市场营销",category:"社科",
   scoreRequire:{math:2,science:1,lang:3,eng:3,avg:2,memory:2,spatial:2},
   profile:{stress:4,certainty:2,social:5,patience:2,resource:3,meaning:3},
   dailyLife:"创意策划、用户洞察、活动执行；需要快速迭代；社交密度高",
   riskTags:["成就感依赖市场环境，周期波动大","ROI压力随着行业成熟越来越高"],
   regrets:["以为营销是有创意的工作，实际大量时间在对齐和汇报"],
   validation:["执行一个完整的小型营销活动，感受整个流程"]},
  {id:"journalism",name:"新闻传播学",category:"社科",
   scoreRequire:{math:1,science:1,lang:4,eng:3,avg:2,memory:3,spatial:1},
   profile:{stress:4,certainty:2,social:5,patience:3,resource:3,meaning:5},
   dailyLife:"内容创作、采访、信息筛选；快节奏；社会影响感强但收入一般",
   riskTags:["传统媒体持续萎缩","自媒体方向收入极不稳定"],
   regrets:["没想到新闻理想与现实操作空间之间差距那么大"],
   validation:["独立完成一篇深度调查报道，评估你能否承受信息混乱和截止压力"]},
  {id:"psychology",name:"心理学",category:"社科",
   scoreRequire:{math:2,science:2,lang:3,eng:3,avg:3,memory:3,spatial:1},
   profile:{stress:3,certainty:3,social:4,patience:4,resource:3,meaning:5},
   dailyLife:"临床方向高情绪劳动；研究方向大量实验设计；就业需要证书积累",
   riskTags:["咨询方向需要长期积累执照和口碑","学术研究与临床应用差距大"],
   regrets:["以为学心理学能解决自己的问题，其实更难"],
   validation:["做心理咨询的来访者，体验咨询关系，评估你是否适合这个角色"]},
  {id:"education",name:"师范/教育学",category:"社科",
   scoreRequire:{math:2,science:1,lang:3,eng:2,avg:2,memory:3,spatial:1},
   profile:{stress:3,certainty:4,social:5,patience:4,resource:2,meaning:5},
   dailyLife:"课堂教学、备课、与家长沟通；情绪劳动持续；寒暑假是补偿",
   riskTags:["假期掩盖了高强度情绪劳动本质","职业天花板相对明确"],
   regrets:["没想到家长沟通这么消耗精力","课堂管理挑战超出预期"],
   validation:["找机会给一群孩子上30分钟课，看你之后是累还是充能"]},
  {id:"architecture",name:"建筑学",category:"理工",
   scoreRequire:{math:4,science:3,lang:2,eng:3,avg:3,memory:3,spatial:5},
   profile:{stress:5,certainty:3,social:3,patience:5,resource:4,meaning:4},
   dailyLife:"大量手绘/建模/熬夜改图；创作痛苦感强；从业周期长才能出成果",
   riskTags:["5年学制加执照考试，前期回报极慢","就业市场周期波动大"],
   regrets:["没想到建筑图纸工作这么重复机械","行业收缩期对年轻人极不友好"],
   validation:["用SketchUp做一个小模型，感受建模是否让你兴奋"]},
  {id:"civil_eng",name:"土木工程",category:"理工",
   scoreRequire:{math:4,science:3,lang:1,eng:2,avg:3,memory:3,spatial:4},
   profile:{stress:4,certainty:4,social:3,patience:4,resource:3,meaning:3},
   dailyLife:"工地现场+办公室两栖；风吹日晒；施工期高强度；行业目前寒冬",
   riskTags:["行业整体下行，就业压力大增","需要长期驻场，地域约束强"],
   regrets:["行业周期与个人发展不匹配","工地生活不是所有人都能接受"],
   validation:["去建筑工地参观或实习，评估你对现场环境的接受度"]},
  {id:"mech_eng",name:"机械工程",category:"理工",
   scoreRequire:{math:4,science:4,lang:1,eng:2,avg:3,memory:3,spatial:4},
   profile:{stress:3,certainty:5,social:2,patience:5,resource:3,meaning:3},
   dailyLife:"设计制图、实验室、工厂测试；规范严格；需要动手能力",
   riskTags:["制造业自动化压缩部分岗位","工资增长相对有限"],
   regrets:["以为机械有创造感，实际大量是规范化设计和验算"],
   validation:["拆开一个机械设备尝试理解其结构，看是否有天然兴奋感"]},
  {id:"electrical",name:"电气/电子工程",category:"理工",
   scoreRequire:{math:4,science:4,lang:1,eng:3,avg:3,memory:3,spatial:3},
   profile:{stress:4,certainty:4,social:2,patience:4,resource:3,meaning:3},
   dailyLife:"电路设计、嵌入式开发、实验室；精度要求高；新能源方向热门",
   riskTags:["入门门槛高，理论学习枯燥期长"],
   regrets:["入门曲线陡峭，前两年非常痛苦"],
   validation:["买一个Arduino套件，尝试实现一个小项目"]},
  {id:"biotech",name:"生物技术/生命科学",category:"理工",
   scoreRequire:{math:3,science:5,lang:2,eng:4,avg:3,memory:5,spatial:3},
   profile:{stress:4,certainty:3,social:2,patience:5,resource:4,meaning:5},
   dailyLife:"大量实验室工作；科研方向需要极强耐心；产业方向相对有限",
   riskTags:["产业出路依赖继续深造（博士）","科研回报周期极长"],
   regrets:["做了3年发现不想读博，而本科生物技术就业很窄"],
   validation:["在实验室做一个月助理，体验真实的实验节奏"]},
  {id:"env_sci",name:"环境科学",category:"理工",
   scoreRequire:{math:3,science:4,lang:2,eng:3,avg:3,memory:3,spatial:3},
   profile:{stress:3,certainty:3,social:3,patience:4,resource:3,meaning:5},
   dailyLife:"政策研究+野外调查+实验室三栖；意义感强但薪资偏低",
   riskTags:["政策驱动性强，行业波动与政治周期关联","高薪岗位集中在头部企业"],
   regrets:["意义感很高但现实薪资不匹配预期"],
   validation:["参与一次环保志愿者行动，评估你能否在艰苦条件下坚持意义驱动"]},
  {id:"design",name:"视觉/平面设计",category:"艺术",
   scoreRequire:{math:1,science:1,lang:2,eng:2,avg:2,memory:2,spatial:4},
   profile:{stress:4,certainty:2,social:3,patience:3,resource:3,meaning:4},
   dailyLife:"客户改稿是常态；创意与执行的拉扯；自由职业可能性高",
   riskTags:["以为设计是纯创意，实际大量服务于甲方需求","AI对基础设计冲击明显"],
   regrets:["没想到甲方改稿这么消耗心力","创意独立性在职场中极有限"],
   validation:["接一个真实的设计需求完整体验从沟通到交付"]},
  {id:"fine_arts",name:"纯艺术（油画/雕塑等）",category:"艺术",
   scoreRequire:{math:1,science:1,lang:2,eng:1,avg:1,memory:2,spatial:5},
   profile:{stress:3,certainty:1,social:2,patience:5,resource:4,meaning:5},
   dailyLife:"创作、展览、教学；经济来源极不稳定；精神自由度高",
   riskTags:["经济可持续性是最大风险","家庭经济资源是关键约束"],
   regrets:["没有资源支撑的艺术梦是高风险路径"],
   validation:["在没有任何外部驱动下连续创作一个月，看动力是否持续"]},
  {id:"music",name:"音乐表演/作曲",category:"艺术",
   scoreRequire:{math:1,science:1,lang:2,eng:2,avg:1,memory:4,spatial:2},
   profile:{stress:4,certainty:2,social:4,patience:5,resource:5,meaning:5},
   dailyLife:"大量练习、演出、教学；收入来源碎片化；顶端成功率极低",
   riskTags:["成功分布极度不均","家庭资源是必要支撑条件"],
   regrets:["以为热爱可以克服一切，没想到市场竞争如此残酷"],
   validation:["评估你在无任何外部鼓励下，是否仍然每天主动练习"]},
  {id:"chinese_lit",name:"中文/汉语言文学",category:"人文",
   scoreRequire:{math:1,science:1,lang:5,eng:2,avg:2,memory:4,spatial:1},
   profile:{stress:2,certainty:3,social:3,patience:4,resource:2,meaning:4},
   dailyLife:"阅读、写作、文献研究；就业依赖考研或跨行；学术路径长",
   riskTags:["就业转化率低，需要明确方向","以为会写作就适合，实际是学术文献研究"],
   regrets:["发现中文系不是培养作家的"],
   validation:["阅读一篇古典文学论文，看你是否对这种研究方式感兴趣"]},
  {id:"history",name:"历史学",category:"人文",
   scoreRequire:{math:1,science:1,lang:4,eng:2,avg:2,memory:5,spatial:1},
   profile:{stress:2,certainty:3,social:2,patience:5,resource:3,meaning:4},
   dailyLife:"大量阅读文献、写论文；学术路径漫长；转行多数靠能力迁移",
   riskTags:["就业方向极窄，非学术需要主动跨界","社会认可度有限"],
   regrets:["爱好历史不等于适合历史学专业的研究方式"],
   validation:["认真写一篇5000字的历史研究文章，感受研究文献的耐受度"]},
  {id:"philosophy",name:"哲学",category:"人文",
   scoreRequire:{math:2,science:1,lang:5,eng:3,avg:3,memory:4,spatial:1},
   profile:{stress:2,certainty:1,social:2,patience:5,resource:3,meaning:5},
   dailyLife:"文本研究、逻辑推演、论文写作；非学术路径需要大量自我设计",
   riskTags:["非常窄的直接就业出口","需要极强的自我意义建构能力"],
   regrets:["哲学爱好者不等于哲学研究者；学术哲学与日常思考体验截然不同"],
   validation:["读康德或维特根斯坦原典，看你是否能忍受这种密度的阅读"]},
  {id:"public_admin",name:"公共管理/行政学",category:"社科",
   scoreRequire:{math:2,science:1,lang:3,eng:2,avg:2,memory:3,spatial:1},
   profile:{stress:3,certainty:4,social:4,patience:3,resource:3,meaning:4},
   dailyLife:"政策分析、文件处理、会议协调；公务员方向稳定但节奏缓慢",
   riskTags:["体制内路径依赖地区和关系资源","创新空间有限"],
   regrets:["以为公务员轻松稳定，没想到体制内有另一种压力"],
   validation:["去政府机构实习，体验真实的行政节奏"]},
  {id:"international_biz",name:"国际贸易/国际商务",category:"社科",
   scoreRequire:{math:2,science:1,lang:3,eng:4,avg:3,memory:3,spatial:1},
   profile:{stress:4,certainty:3,social:5,patience:3,resource:4,meaning:3},
   dailyLife:"跨文化沟通、合同谈判、外贸文件；出差多；语言能力要求强",
   riskTags:["贸易摩擦和地缘政治影响大","行业红利在减弱"],
   regrets:["以为国际贸易有国际范，实际大量时间在核对单据"],
   validation:["尝试用英文与外国供应商或客户进行一次完整沟通"]},
  {id:"sports_sci",name:"体育科学/运动医学",category:"理工",
   scoreRequire:{math:2,science:3,lang:2,eng:2,avg:2,memory:3,spatial:4},
   profile:{stress:3,certainty:3,social:4,patience:4,resource:3,meaning:4},
   dailyLife:"训练指导、运动分析、康复工作；需要既懂理论又懂实践",
   riskTags:["就业集中在学校/专业队/康复机构","天花板相对明确"],
   regrets:["爱好运动不等于适合做运动科学研究或康复工作"],
   validation:["去运动康复中心实习，了解真实工作内容"]},
  {id:"social_work",name:"社会工作",category:"社科",
   scoreRequire:{math:1,science:1,lang:3,eng:2,avg:2,memory:2,spatial:1},
   profile:{stress:4,certainty:3,social:5,patience:4,resource:1,meaning:5},
   dailyLife:"高强度情绪劳动；面对弱势群体；社会意义极强但薪资偏低",
   riskTags:["薪资长期偏低是职业风险","情绪代入过深容易职业倦怠"],
   regrets:["意义感没法解决生活压力","长期高情绪劳动导致职业耗竭"],
   validation:["在社会服务机构做志愿者一个月，评估情绪耐受和意义感的平衡"]},
];

function computeUserProfile(answers) {
  const dims = ["stress","certainty","social","patience","resource","meaning"];
  const acadDims = ["academic_math","academic_science","academic_lang","academic_eng","academic_avg","academic_memory"];
  const allDims = [...dims, ...acadDims];
  const sums = Object.fromEntries(allDims.map(d => [d, 0]));
  const weights = Object.fromEntries(allDims.map(d => [d, 0]));
  QUESTIONS.forEach(q => {
    const ans = answers[q.id];
    if (ans === undefined) return;
    sums[q.dim] += ans * q.weight;
    weights[q.dim] += 5 * q.weight;
  });
  const profile = {};
  allDims.forEach(d => {
    profile[d] = weights[d] > 0 ? (sums[d] / weights[d]) * 5 : 2.5;
  });
  const acadKeys = ["academic_math","academic_science","academic_lang","academic_eng","academic_avg","academic_memory"];
  profile.acad_overall = acadKeys.reduce((s,k)=>s+profile[k],0) / acadKeys.length;
  profile.acad_stem = (profile.academic_math*1.5 + profile.academic_science*1.3 + profile.academic_eng) / 3.8;
  profile.acad_arts = (profile.academic_lang*1.4 + profile.academic_eng + profile.academic_memory) / 3.4;
  profile.acad_spatial = answers[48] ? answers[48] : 2.5;
  return profile;
}

function checkScoreGate(userProfile, major) {
  if (!major.scoreRequire) return [];
  const req = major.scoreRequire;
  const blocked = [];
  const map = {
    math: userProfile.academic_math, science: userProfile.academic_science,
    lang: userProfile.academic_lang, eng: userProfile.academic_eng,
    avg: userProfile.academic_avg, memory: userProfile.academic_memory,
    spatial: userProfile.acad_spatial,
  };
  const labelMap = {math:"数学",science:"理科",lang:"语文/写作",eng:"英语",avg:"总体成绩",memory:"记忆力",spatial:"空间/动手"};
  Object.entries(req).forEach(([k,minVal])=>{
    if ((map[k]||2.5) < minVal) blocked.push(labelMap[k]);
  });
  return blocked;
}

function cosineSim(a, b, dims) {
  let dot = 0, normA = 0, normB = 0;
  dims.forEach(d => { dot += a[d]*b[d]; normA += a[d]*a[d]; normB += b[d]*b[d]; });
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-9);
}

function matchMajors(userProfile) {
  const dims = ["stress","certainty","social","patience","resource","meaning"];
  return MAJORS.map(major => {
    let score = cosineSim(userProfile, major.profile, dims);
    if (userProfile.resource < 2.5 && major.profile.resource >= 4) score *= 0.82;
    if (userProfile.stress < 2.5 && major.profile.stress >= 4.5) score *= 0.85;
    if (Math.abs(userProfile.meaning - major.profile.meaning) < 0.5) score = Math.min(1, score + 0.03);
    score = Math.min(1, score);
    const pct = Math.round(score * 100);
    const blocked = checkScoreGate(userProfile, major);
    const gateBlocked = blocked.length > 0;
    const effectivePct = gateBlocked ? Math.min(pct, 54 - blocked.length * 3) : pct;
    const sublabel = gateBlocked ? "门槛不足" :
      pct >= 88 ? "强匹配" : pct >= 78 ? "较强匹配" : pct >= 68 ? "中等匹配" : pct >= 55 ? "弱匹配" : "低匹配";
    const level = gateBlocked ? "risk" : (pct >= 72 ? "high" : pct >= 55 ? "medium" : "risk");
    return { major, score: effectivePct, rawScore: pct, sublabel, level, blocked };
  }).sort((a, b) => b.rawScore - a.rawScore);
}

const C = {
  bg:"#0f0f13", card:"#16161e", border:"#252535", accent:"#7c6af7",
  accentLight:"#a799ff", gold:"#f4c55a", danger:"#f06a6a", success:"#5cc98b",
  muted:"#7070a0", text:"#e8e8f8", textSec:"#9898b8",
};

const btn = (variant) => ({
  background: variant === "primary" ? C.accent : "transparent",
  border: `1px solid ${variant === "primary" ? C.accent : C.border}`,
  color: variant === "primary" ? "#fff" : C.textSec,
  borderRadius: 6, padding: "0.65rem 1.4rem", cursor: "pointer",
  fontSize: "0.88rem", fontFamily: "inherit",
});

// ── 新增：姓名输入界面 ──
function NameScreen({ onConfirm }) {
  const [name, setName] = useState("");
  return (
    <div style={{maxWidth:760,margin:"0 auto",padding:"4rem 1.5rem 2rem",textAlign:"center"}}>
      <div style={{display:"inline-block",fontSize:11,padding:"3px 10px",borderRadius:3,border:`1px solid ${C.accent}`,color:C.accentLight,letterSpacing:2,marginBottom:"1rem"}}>开始之前</div>
      <h2 style={{fontSize:"1.5rem",fontWeight:700,color:C.text,marginBottom:"0.5rem"}}>请输入你的姓名</h2>
      <p style={{color:C.muted,fontSize:"0.85rem",marginBottom:"2rem"}}>仅用于内测记录，不会对外公开</p>
      <div style={{maxWidth:360,margin:"0 auto"}}>
        <input
          type="text"
          value={name}
          onChange={e=>setName(e.target.value)}
          placeholder="你的姓名或昵称"
          onKeyDown={e=>e.key==="Enter"&&name.trim()&&onConfirm(name.trim())}
          style={{
            width:"100%", padding:"0.8rem 1rem",
            background:C.card, border:`1px solid ${C.border}`,
            borderRadius:6, color:C.text, fontSize:"1rem",
            fontFamily:"inherit", outline:"none", marginBottom:"1rem",
            boxSizing:"border-box"
          }}
        />
        <button
          onClick={()=>name.trim()&&onConfirm(name.trim())}
          style={{...btn("primary"),width:"100%",padding:"0.8rem",fontSize:"0.95rem",opacity:name.trim()?1:0.5}}
          disabled={!name.trim()}
        >
          开始测评 →
        </button>
      </div>
    </div>
  );
}

function Welcome({ onStart }) {
  return (
    <div style={{maxWidth:760,margin:"0 auto",padding:"4rem 1.5rem 2rem",textAlign:"center"}}>
      <div style={{display:"inline-block",fontSize:11,padding:"3px 10px",borderRadius:3,border:`1px solid ${C.accent}`,color:C.accentLight,letterSpacing:2,marginBottom:"1rem"}}>专业方向测评系统 v1.1</div>
      <h1 style={{fontSize:"clamp(1.6rem,4vw,2.4rem)",fontWeight:700,color:C.text,lineHeight:1.2,margin:"0 0 1rem"}}>不是兴趣测试<br/>是长期现实兼容性评估</h1>
      <p style={{color:C.muted,maxWidth:480,margin:"0 auto 1.5rem",lineHeight:1.8,fontSize:"0.9rem"}}>
        基于 <span style={{color:C.accentLight}}>6个核心维度 + 学业能力门槛</span>：压力耐受 / 确定性偏好 / 社交能量 / 执行耐心 / 现实资源 / 意义锚点。
        共 <span style={{color:C.accentLight}}>50题</span>，约15分钟。
      </p>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"1.2rem 1.5rem",maxWidth:420,margin:"0 auto 1.5rem",textAlign:"left"}}>
        {["不会说你一定适合某专业","会指出高风险误判方向","会考虑你的现实资源约束","会给出具体的现实验证方式"].map(t=>(
          <div key={t} style={{fontSize:"0.85rem",color:C.textSec,padding:"0.3rem 0"}}>
            <span style={{color:C.success,marginRight:8}}>▸</span>{t}
          </div>
        ))}
      </div>
      <button onClick={onStart} style={{...btn("primary"),padding:"0.8rem 2.5rem",fontSize:"0.95rem"}}>下一步 →</button>
    </div>
  );
}

function QuestionPage({ qIndex, answers, onAnswer, onNext, onPrev }) {
  const q = QUESTIONS[qIndex];
  const dimLabel = {stress:"压力耐受",certainty:"确定性偏好",social:"社交能量",patience:"执行耐心",resource:"现实资源",meaning:"意义锚点",academic_math:"学业能力",academic_science:"学业能力",academic_lang:"学业能力",academic_eng:"学业能力",academic_avg:"学业能力",academic_memory:"学业能力"};
  return (
    <div style={{maxWidth:760,margin:"0 auto",padding:"2rem 1.5rem"}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"1.5rem"}}>
        <div style={{fontSize:11,color:C.muted,letterSpacing:2,marginBottom:"0.6rem"}}>第 {qIndex+1} / {QUESTIONS.length} 题 · {dimLabel[q.dim]}</div>
        <div style={{fontSize:"1.05rem",fontWeight:500,marginBottom:"1.2rem",lineHeight:1.6,color:C.text}}>{q.text}</div>
        {q.options.map((opt,i) => {
          const sel = answers[q.id] === opt.score;
          return (
            <button key={i} onClick={()=>onAnswer(q.id,opt.score)} style={{
              display:"block",width:"100%",textAlign:"left",
              background:sel?`${C.accent}22`:"transparent",
              border:`1px solid ${sel?C.accent:C.border}`,borderRadius:6,
              padding:"0.7rem 1rem",color:sel?C.accentLight:C.textSec,
              cursor:"pointer",marginBottom:"0.5rem",fontSize:"0.88rem",fontFamily:"inherit"
            }}>
              <span style={{color:C.accent,marginRight:8}}>{String.fromCharCode(65+i)}.</span>{opt.label}
            </button>
          );
        })}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"2rem"}}>
        <button onClick={onPrev} style={btn("outline")} disabled={qIndex===0}>← 上一题</button>
        <span style={{color:C.muted,fontSize:"0.8rem"}}>{Math.round(((qIndex+1)/QUESTIONS.length)*100)}%</span>
        <button onClick={onNext} style={btn(answers[q.id]!==undefined?"primary":"outline")} disabled={answers[q.id]===undefined}>
          {qIndex===QUESTIONS.length-1?"查看结果 →":"下一题 →"}
        </button>
      </div>
    </div>
  );
}

function DimDisplay({ profile }) {
  const dims = [
    {key:"stress",label:"压力耐受",color:"#f06a6a"},{key:"certainty",label:"确定性偏好",color:"#f4c55a"},
    {key:"social",label:"社交能量",color:"#5cc98b"},{key:"patience",label:"执行耐心",color:"#7c6af7"},
    {key:"resource",label:"现实资源",color:"#5ab4f4"},{key:"meaning",label:"意义锚点",color:"#f07af0"},
  ];
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1.5rem"}}>
      {dims.map(d=>(
        <div key={d.key} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:"0.8rem 1rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:"0.8rem",color:C.textSec}}>{d.label}</span>
            <span style={{fontSize:"0.85rem",color:d.color,fontWeight:600}}>{profile[d.key].toFixed(1)}</span>
          </div>
          <div style={{background:C.border,borderRadius:3,height:5}}>
            <div style={{height:5,borderRadius:3,width:`${(profile[d.key]/5)*100}%`,background:d.color}}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function LevelTag({ level, sublabel }) {
  const map = {
    high:{bg:`${C.success}22`,color:C.success,border:C.success},
    medium:{bg:`${C.gold}22`,color:C.gold,border:C.gold},
    risk:{bg:`${C.danger}22`,color:C.danger,border:C.danger},
  };
  const m = map[level];
  return <span style={{background:m.bg,color:m.color,border:`1px solid ${m.border}`,borderRadius:4,padding:"2px 8px",fontSize:11,fontWeight:600,marginRight:8}}>{sublabel}</span>;
}

function MajorCard({ result }) {
  const { major, sublabel, level, blocked } = result;
  const [open, setOpen] = useState(false);
  return (
    <div style={{background:C.card,border:`1px solid ${level==="risk"?C.danger:level==="high"?C.accent:C.border}`,borderRadius:8,marginBottom:10,overflow:"hidden"}}>
      <div onClick={()=>setOpen(o=>!o)} style={{padding:"0.9rem 1.2rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:6}}>
          <LevelTag level={level} sublabel={sublabel}/>
          <span style={{fontWeight:600,color:C.text,fontSize:"0.95rem"}}>{major.name}</span>
          <span style={{color:C.muted,fontSize:11,background:C.border,padding:"2px 6px",borderRadius:3}}>{major.category}</span>
        </div>
        <span style={{color:C.muted,fontSize:12,flexShrink:0,marginLeft:8}}>{open?"▲":"▼"}</span>
      </div>
      {open&&(
        <div style={{padding:"0 1.2rem 1.2rem",borderTop:`1px solid ${C.border}`}}>
          {blocked&&blocked.length>0&&(
            <div style={{marginTop:"1rem",padding:"0.6rem 0.8rem",background:`${C.danger}18`,border:`1px solid ${C.danger}55`,borderRadius:6,marginBottom:"0.8rem"}}>
              <div style={{fontSize:11,color:C.danger,fontWeight:600,marginBottom:4}}>🚫 学业门槛未达标</div>
              <div style={{fontSize:"0.82rem",color:C.danger}}>以下科目低于该专业最低要求：{blocked.join("、")}</div>
              <div style={{fontSize:"0.78rem",color:C.muted,marginTop:4}}>即使性格高度匹配，成绩门槛不足会在入学或求职时形成硬性障碍。</div>
            </div>
          )}
          <div style={{paddingTop:"0.8rem",marginBottom:"0.8rem"}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,letterSpacing:1}}>日常真实样貌</div>
            <div style={{fontSize:"0.85rem",color:C.textSec,lineHeight:1.7}}>{major.dailyLife}</div>
          </div>
          <div style={{marginBottom:"0.8rem"}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,letterSpacing:1}}>⚠ 常见误判点</div>
            {major.riskTags.map((t,i)=><div key={i} style={{fontSize:"0.82rem",color:C.danger,padding:"2px 0"}}>· {t}</div>)}
          </div>
          <div style={{marginBottom:"0.8rem"}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,letterSpacing:1}}>后悔点（真实声音）</div>
            {major.regrets.map((r,i)=><div key={i} style={{fontSize:"0.82rem",color:C.gold,padding:"2px 0"}}>· {r}</div>)}
          </div>
          <div>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,letterSpacing:1}}>✓ 验证方式（选前先做）</div>
            {major.validation.map((v,i)=><div key={i} style={{fontSize:"0.82rem",color:C.success,padding:"2px 0"}}>· {v}</div>)}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryGroup({ category, results, level }) {
  const colorMap = {high:C.success, medium:C.gold, risk:C.danger};
  return (
    <div style={{marginBottom:"1rem"}}>
      <div style={{fontSize:11,color:colorMap[level],letterSpacing:1,marginBottom:"0.5rem",padding:"4px 0",borderBottom:`1px solid ${C.border}`}}>
        {category}
      </div>
      {results.map(r=><MajorCard key={r.major.id} result={r}/>)}
    </div>
  );
}

function ProfileSummary({ profile }) {
  const lines = [];
  if (profile.stress>=4) lines.push("你有较强的压力耐受能力，高竞争环境不会轻易击垮你。");
  else if (profile.stress<2.5) lines.push("你对持续高压环境耐受有限，需要回避高竞争、高截止压力的领域。");
  else lines.push("你的压力耐受处于中等水平，适合结构清晰的中强度工作环境。");
  if (profile.certainty>=4) lines.push("你偏好规则明确、有标准答案的工作场景，模糊环境会让你焦虑。");
  else if (profile.certainty<2.5) lines.push("你对开放和模糊的工作方式有较高接受度，探索性工作对你有吸引力。");
  if (profile.social>=4) lines.push("社交是你的充能方式，高频人际互动不会让你枯竭。");
  else if (profile.social<2.5) lines.push("你是内向型工作者，独立深度工作是你的能量来源，避免高情绪劳动岗位。");
  if (profile.resource<2.5) lines.push("⚠ 你的现实资源存在一定约束，建议优先选择就业回报快、不依赖高门槛资源的方向。");
  if (profile.meaning>=4.5) lines.push("你需要强意义感支撑，没有意义感的工作会快速消磨你的动力。");
  return (
    <div style={{background:`${C.accent}11`,border:`1px solid ${C.accent}44`,borderRadius:8,padding:"1.2rem 1.4rem",marginBottom:"1.5rem"}}>
      <div style={{fontSize:11,color:C.accentLight,letterSpacing:2,marginBottom:"0.8rem"}}>你的核心画像</div>
      {lines.map((l,i)=>(
        <div key={i} style={{fontSize:"0.88rem",color:C.textSec,lineHeight:1.8,marginBottom:"0.2rem"}}>
          <span style={{color:C.accentLight,marginRight:6}}>▸</span>{l}
        </div>
      ))}
    </div>
  );
}

const EXCLUDE_CATEGORIES = [
  { id:"stem_hard", label:"理工硬核（大量数学/编程/实验）", majors:["cs","software_eng","data_science","electrical","mech_eng","civil_eng","architecture"] },
  { id:"medical", label:"医疗健康类（需要长期临床训练）", majors:["medicine","pharmacy","nursing","sports_sci"] },
  { id:"law_policy", label:"法律/公共管理/政策类", majors:["law","public_admin"] },
  { id:"business", label:"商科/金融/贸易类", majors:["finance","accounting","economics","marketing","international_biz"] },
  { id:"social_human", label:"社会人文类（大量阅读/写作/研究）", majors:["chinese_lit","history","philosophy","psychology","journalism","education","social_work"] },
  { id:"arts", label:"艺术类（需要专业艺术基础）", majors:["design","fine_arts","music"] },
  { id:"bio_env", label:"生命科学/环境类（长期科研路径）", majors:["biotech","env_sci"] },
];

function ExcludeScreen({ onConfirm }) {
  const [excluded, setExcluded] = useState([]);
  const toggle = (id) => setExcluded(e => e.includes(id) ? e.filter(x=>x!==id) : [...e,id]);
  return (
    <div style={{maxWidth:760,margin:"0 auto",padding:"2rem 1.5rem"}}>
      <div style={{marginBottom:"1.5rem"}}>
        <div style={{display:"inline-block",fontSize:11,padding:"3px 10px",borderRadius:3,border:`1px solid ${C.gold}`,color:C.gold,letterSpacing:2,marginBottom:"0.8rem"}}>最后一步</div>
        <h2 style={{fontSize:"1.3rem",fontWeight:700,color:C.text,margin:"0 0 0.5rem"}}>有没有你直接排除的方向？</h2>
        <p style={{color:C.muted,fontSize:"0.85rem",margin:0,lineHeight:1.7}}>
          不管系统怎么算，你有没有"这个方向我完全不考虑"的领域？<br/>
          勾选后这些专业会从高匹配结果中移除，让推荐更贴近你的真实选择空间。
        </p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr",gap:8,marginBottom:"1.5rem"}}>
        {EXCLUDE_CATEGORIES.map(cat=>{
          const sel = excluded.includes(cat.id);
          return (
            <div key={cat.id} onClick={()=>toggle(cat.id)} style={{
              background: sel ? `${C.danger}18` : C.card,
              border: `1px solid ${sel ? C.danger : C.border}`,
              borderRadius:8, padding:"0.9rem 1.2rem", cursor:"pointer",
              display:"flex", alignItems:"center", gap:12,
            }}>
              <div style={{
                width:20, height:20, borderRadius:4, flexShrink:0,
                border:`2px solid ${sel ? C.danger : C.border}`,
                background: sel ? C.danger : "transparent",
                display:"flex", alignItems:"center", justifyContent:"center"
              }}>
                {sel && <span style={{color:"#fff",fontSize:13,lineHeight:1}}>✕</span>}
              </div>
              <div>
                <div style={{fontSize:"0.9rem",color:sel?C.danger:C.text,fontWeight:sel?600:400}}>{cat.label}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>涵盖：{cat.majors.length}个专业方向</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",gap:12,justifyContent:"center"}}>
        <button onClick={()=>onConfirm([])} style={btn("outline")}>不排除任何方向，直接看结果</button>
        <button onClick={()=>onConfirm(excluded)} style={{...btn("primary"),opacity:excluded.length>0?1:0.6}}>
          {excluded.length>0 ? `排除 ${excluded.length} 类，查看结果 →` : "确认并查看结果 →"}
        </button>
      </div>
    </div>
  );
}

// ── 学业积累诊断组件 ──
function AcadGapAlert({ profile }) {
  const checks = [
    { key:"academic_math",  label:"数学",   threshold:3.0, tip:"高等数学是理工、经济、金融、CS等方向的入场券，建议优先强化。" },
    { key:"academic_science",label:"理科综合",threshold:2.8, tip:"物理/化学基础影响工程、医学、生命科学方向的可及性。" },
    { key:"academic_lang",  label:"语文/写作",threshold:2.8, tip:"文字表达能力影响法学、人文、传播、教育等方向的竞争力。" },
    { key:"academic_eng",   label:"英语",   threshold:2.8, tip:"国际化方向和顶尖院校普遍要求较高英语水平。" },
    { key:"academic_avg",   label:"综合成绩",threshold:2.5, tip:"整体成绩是绝大多数院校录取的基础门槛，直接决定选择空间。" },
    { key:"academic_memory",label:"记忆/积累",threshold:2.5, tip:"医学、法学、历史等方向对系统性知识积累要求极高。" },
  ];
  const gaps = checks.filter(c => (profile[c.key] || 0) < c.threshold);
  if (gaps.length === 0) return null;

  return (
    <div style={{background:`${C.gold}0f`,border:`1px solid ${C.gold}55`,borderRadius:8,padding:"1.2rem 1.4rem",marginBottom:"1.5rem"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:"0.8rem"}}>
        <span style={{fontSize:14,color:C.gold}}>⚠</span>
        <div style={{fontSize:12,color:C.gold,fontWeight:600,letterSpacing:1}}>学业积累诊断</div>
      </div>
      <div style={{fontSize:"0.85rem",color:C.textSec,lineHeight:1.8,marginBottom:"1rem"}}>
        以下维度当前得分低于主流专业的入学门槛，这是你目前选择空间受限的主要原因。
        这不代表方向错了——而是说明<span style={{color:C.gold}}>在正式选择前，还需要针对性积累</span>。
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {gaps.map(g => {
          const val = profile[g.key] || 0;
          const pct = Math.round((val / 5) * 100);
          const needPct = Math.round((g.threshold / 5) * 100);
          return (
            <div key={g.key} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:"0.8rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:"0.8rem",color:C.text,fontWeight:500}}>{g.label}</span>
                <span style={{fontSize:"0.78rem",color:C.danger}}>当前 {val.toFixed(1)} / 需 {g.threshold.toFixed(1)}</span>
              </div>
              <div style={{background:C.border,borderRadius:3,height:5,marginBottom:6,position:"relative"}}>
                <div style={{height:5,borderRadius:3,width:`${pct}%`,background:C.danger}}/>
                <div style={{position:"absolute",top:-1,left:`${needPct}%`,width:2,height:7,background:C.gold,borderRadius:1}}/>
              </div>
              <div style={{fontSize:"0.75rem",color:C.muted,lineHeight:1.6}}>{g.tip}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 性格匹配但学业门槛不足的"潜力方向"组件 ──
function PotentialMatches({ ranked, excludedMajorIds }) {
  // 找出：性格原始匹配分 ≥ 72，但被学业门槛拦掉的专业
  const potential = ranked.filter(r =>
    r.rawScore >= 72 &&
    r.blocked && r.blocked.length > 0 &&
    !excludedMajorIds.has(r.major.id)
  ).slice(0, 6);

  if (potential.length === 0) return null;

  const [open, setOpen] = useState(false);

  return (
    <div style={{marginBottom:"1rem"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,margin:"1.5rem 0 1rem"}}>
        <div style={{fontSize:12,color:"#5ab4f4",letterSpacing:2,fontWeight:600}}>◆ 潜力方向（需学业积累）</div>
        <div style={{fontSize:11,color:C.muted}}>性格契合，但当前成绩门槛不足</div>
      </div>
      <div style={{background:`#5ab4f411`,border:`1px solid #5ab4f455`,borderRadius:8,padding:"1rem 1.2rem",marginBottom:"0.8rem"}}>
        <div style={{fontSize:"0.85rem",color:C.textSec,lineHeight:1.8}}>
          下列方向与你的性格、价值观高度匹配（原始得分 ≥72%），
          但目前学业水平尚未达到该专业的典型入学门槛。
          <span style={{color:"#5ab4f4"}}> 这是值得努力的方向，而不是放弃的理由。</span>
        </div>
      </div>
      {potential.map(r => (
        <div key={r.major.id} style={{background:C.card,border:`1px solid #5ab4f433`,borderRadius:8,marginBottom:8,overflow:"hidden"}}>
          <div onClick={()=>setOpen(o=> o===r.major.id ? false : r.major.id)}
            style={{padding:"0.9rem 1.2rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:6}}>
              <span style={{background:`#5ab4f422`,color:"#5ab4f4",border:`1px solid #5ab4f455`,borderRadius:4,padding:"2px 8px",fontSize:11,fontWeight:600,marginRight:4}}>
                潜力 {r.rawScore}%
              </span>
              <span style={{fontWeight:600,color:C.text,fontSize:"0.95rem"}}>{r.major.name}</span>
              <span style={{color:C.muted,fontSize:11,background:C.border,padding:"2px 6px",borderRadius:3}}>{r.major.category}</span>
            </div>
            <span style={{color:C.muted,fontSize:12,flexShrink:0,marginLeft:8}}>{open===r.major.id?"▲":"▼"}</span>
          </div>
          {open===r.major.id&&(
            <div style={{padding:"0 1.2rem 1.2rem",borderTop:`1px solid ${C.border}`}}>
              <div style={{marginTop:"0.8rem",padding:"0.6rem 0.8rem",background:`${C.danger}18`,border:`1px solid ${C.danger}55`,borderRadius:6,marginBottom:"0.8rem"}}>
                <div style={{fontSize:11,color:C.danger,fontWeight:600,marginBottom:4}}>需要提升的学业维度</div>
                <div style={{fontSize:"0.82rem",color:C.danger}}>{r.blocked.join("、")} — 当前低于该专业最低要求</div>
              </div>
              <div style={{paddingTop:"0.4rem",marginBottom:"0.8rem"}}>
                <div style={{fontSize:11,color:C.muted,marginBottom:4,letterSpacing:1}}>日常真实样貌</div>
                <div style={{fontSize:"0.85rem",color:C.textSec,lineHeight:1.7}}>{r.major.dailyLife}</div>
              </div>
              <div>
                <div style={{fontSize:11,color:C.muted,marginBottom:4,letterSpacing:1}}>✓ 现在可以做的验证</div>
                {r.major.validation.map((v,i)=><div key={i} style={{fontSize:"0.82rem",color:C.success,padding:"2px 0"}}>· {v}</div>)}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ResultScreen({ answers, excluded, userName, onRestart }) {
  const profile = computeUserProfile(answers);
  const ranked = matchMajors(profile);

  const excludedMajorIds = new Set(
    EXCLUDE_CATEGORIES.filter(c=>excluded.includes(c.id)).flatMap(c=>c.majors)
  );

  // 存储这条记录的 id，用于后续 PATCH 写入反馈
  const [recordId, setRecordId] = useState(null);

  // 反馈状态
  const [helpful, setHelpful] = useState(null);
  const [clarity, setClarity] = useState(null);
  const [confusing, setConfusing] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    const topMatchesData = ranked
      .filter(r => r.level === "high" && !excludedMajorIds.has(r.major.id))
      .slice(0, 5)
      .map(r => ({ name: r.major.name, score: r.rawScore }));

    fetch(SUPABASE_URL + "/rest/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        user_name: userName,
        answers,
        profile,
        top_matches: topMatchesData,
        excluded,
      })
    }).then(r => r.json()).then(data => {
      if (data && data[0] && data[0].id) setRecordId(data[0].id);
    }).catch(()=>{});
  }, []);

  const submitFeedback = () => {
    if (!recordId) return;
    fetch(SUPABASE_URL + "/rest/v1/responses?id=eq." + recordId, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({ feedback: { helpful, clarity, confusing } })
    }).then(() => setFeedbackSent(true)).catch(()=>setFeedbackSent(true));
  };

  const ratingBtns = (val, setVal, color) => [1,2,3,4,5].map(n => (
    <button key={n} onClick={()=>setVal(n)} style={{
      width:38, height:38, borderRadius:6, cursor:"pointer", fontFamily:"inherit",
      fontSize:"0.9rem", fontWeight:600,
      background: val===n ? color : "transparent",
      border: `1px solid ${val===n ? color : C.border}`,
      color: val===n ? "#fff" : C.textSec,
    }}>{n}</button>
  ));

  const topMatches = ranked.filter(r=>r.level==="high" && !excludedMajorIds.has(r.major.id));
  const midMatches = ranked.filter(r=>r.level==="medium" && !excludedMajorIds.has(r.major.id));
  const risks = ranked.filter(r=>r.level!=="risk").filter(r=>(
    (r.major.profile.stress > profile.stress+1.5)||
    (r.major.profile.resource > profile.resource+1.5)||
    (r.major.profile.social > profile.social+1.5 && profile.social<2.5)
  )).slice(0,3);
  const gateBlocked = ranked.filter(r=>r.blocked&&r.blocked.length>0&&r.rawScore>=72).slice(0,3);
  const displayRisks = [
    ...risks,
    ...gateBlocked.filter(r=>!risks.find(x=>x.major.id===r.major.id))
  ].slice(0,3);

  function groupByCategory(results) {
    const groups = {};
    results.forEach(r => {
      const cat = r.major.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(r);
    });
    return Object.entries(groups).sort((a,b)=>b[1].length-a[1].length);
  }

  const topGroups = groupByCategory(topMatches);
  const midGroups = groupByCategory(midMatches);

  return (
    <div style={{maxWidth:760,margin:"0 auto",padding:"2rem 1.5rem"}}>
      <div style={{marginBottom:"1.5rem",paddingBottom:"1rem",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"inline-block",fontSize:11,padding:"3px 10px",borderRadius:3,border:`1px solid ${C.accent}`,color:C.accentLight,letterSpacing:2,marginBottom:"0.5rem"}}>测评完成</div>
        <h2 style={{fontSize:"1.5rem",fontWeight:700,margin:"0.3rem 0",color:C.text}}>{userName} 的专业方向报告</h2>
        <p style={{color:C.muted,fontSize:"0.85rem",margin:0}}>基于长期现实兼容性模型 · 30个专业 · 含学业门槛过滤</p>
        {excluded.length>0&&(
          <div style={{marginTop:"0.6rem",fontSize:11,color:C.gold}}>
            已根据你的排除选择过滤掉 {excludedMajorIds.size} 个专业方向
          </div>
        )}
      </div>
      <DimDisplay profile={profile}/>
      <ProfileSummary profile={profile}/>
      <AcadGapAlert profile={profile}/>

      {topMatches.length>0&&<>
        <div style={{display:"flex",alignItems:"center",gap:10,margin:"1.5rem 0 1rem"}}>
          <div style={{fontSize:12,color:C.success,letterSpacing:2,fontWeight:600}}>◆ 高匹配方向</div>
          <div style={{fontSize:11,color:C.muted}}>共 {topMatches.length} 个 · 按学科分组 · 点击展开详情</div>
        </div>
        {topGroups.map(([cat,results])=>(
          <CategoryGroup key={cat} category={cat} results={results} level="high"/>
        ))}
      </>}

      {topMatches.length===0&&(
        <div style={{background:`${C.gold}0f`,border:`1px solid ${C.gold}44`,borderRadius:8,padding:"1.2rem 1.4rem",margin:"1.5rem 0"}}>
          <div style={{fontSize:"0.88rem",color:C.gold,fontWeight:600,marginBottom:"0.4rem"}}>暂无直接匹配的高适配方向</div>
          <div style={{fontSize:"0.83rem",color:C.textSec,lineHeight:1.8}}>
            这通常是因为当前学业积累尚未达到主流专业门槛，而不是性格不适合任何方向。
            请查看下方「潜力方向」——那里列出了与你性格契合、但需要进一步学业提升才能进入的专业。
          </div>
        </div>
      )}

      <PotentialMatches ranked={ranked} excludedMajorIds={excludedMajorIds}/>

      {midMatches.length>0&&<>
        <div style={{display:"flex",alignItems:"center",gap:10,margin:"1.5rem 0 1rem"}}>
          <div style={{fontSize:12,color:C.gold,letterSpacing:2,fontWeight:600}}>◆ 中匹配方向</div>
          <div style={{fontSize:11,color:C.muted}}>共 {midMatches.length} 个 · 有一定契合但存在盲点</div>
        </div>
        {midGroups.map(([cat,results])=>(
          <CategoryGroup key={cat} category={cat} results={results} level="medium"/>
        ))}
      </>}

      {displayRisks.length>0&&<>
        <div style={{display:"flex",alignItems:"center",gap:10,margin:"1.5rem 0 1rem"}}>
          <div style={{fontSize:12,color:C.danger,letterSpacing:2,fontWeight:600}}>◆ 高风险误判方向</div>
          <div style={{fontSize:11,color:C.muted}}>你可能以为适合，但存在关键错配或学业门槛不足</div>
        </div>
        {displayRisks.map(r=><MajorCard key={r.major.id} result={{...r,level:"risk",sublabel:"高风险"}}/>)}
      </>}

      <div style={{marginTop:"2rem",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"1.5rem"}}>
        <div style={{display:"inline-block",fontSize:11,padding:"3px 10px",borderRadius:3,border:`1px solid ${C.gold}`,color:C.gold,letterSpacing:2,marginBottom:"1rem"}}>内测反馈</div>
        {feedbackSent ? (
          <div style={{textAlign:"center",padding:"1rem 0",color:C.success,fontSize:"0.9rem"}}>✓ 感谢你的反馈！</div>
        ) : (
          <>
            <div style={{marginBottom:"1rem"}}>
              <div style={{fontSize:"0.88rem",color:C.text,marginBottom:"0.6rem",fontWeight:500}}>这个测评对你有帮助吗？</div>
              <div style={{display:"flex",gap:8,marginBottom:4}}>{ratingBtns(helpful,setHelpful,C.success)}</div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginTop:4}}>
                <span>完全没帮助</span><span>非常有帮助</span>
              </div>
            </div>
            <div style={{marginBottom:"1rem"}}>
              <div style={{fontSize:"0.88rem",color:C.text,marginBottom:"0.6rem",fontWeight:500}}>题目容易理解吗？</div>
              <div style={{display:"flex",gap:8,marginBottom:4}}>{ratingBtns(clarity,setClarity,C.accent)}</div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginTop:4}}>
                <span>很难理解</span><span>非常清晰</span>
              </div>
            </div>
            <div style={{marginBottom:"1rem"}}>
              <div style={{fontSize:"0.88rem",color:C.text,marginBottom:"0.6rem",fontWeight:500}}>哪道题让你最困惑？（选填）</div>
              <textarea
                value={confusing}
                onChange={e=>setConfusing(e.target.value)}
                placeholder="题目编号或描述，比如'第23题选项不够贴近我的情况'"
                style={{
                  width:"100%", minHeight:70, padding:"0.7rem",
                  background:"transparent", border:`1px solid ${C.border}`,
                  borderRadius:6, color:C.text, fontSize:"0.85rem",
                  fontFamily:"inherit", resize:"vertical", outline:"none",
                  boxSizing:"border-box"
                }}
              />
            </div>
            <button
              onClick={submitFeedback}
              disabled={!helpful && !clarity}
              style={{...btn("primary"),width:"100%",padding:"0.75rem",opacity:(!helpful&&!clarity)?0.4:1}}
            >
              提交反馈
            </button>
          </>
        )}
      </div>

      <div style={{marginTop:"1rem",padding:"1rem",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,fontSize:"0.82rem",color:C.muted,lineHeight:1.8}}>
        ⚠ 免责声明：本测试结果仅供参考，不构成专业建议。建议结合真实实习体验、职业咨询和与从业者的对话综合判断。
      </div>
      <div style={{textAlign:"center",marginTop:"1.5rem"}}>
        <button onClick={onRestart} style={btn("outline")}>重新测评</button>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [excluded, setExcluded] = useState([]);
  const [userName, setUserName] = useState("");
  const topRef = useRef(null);
  const scrollTop = () => topRef.current?.scrollIntoView({behavior:"smooth"});

  const handleAnswer = (id, score) => setAnswers(a=>({...a,[id]:score}));
  const handleNext = () => {
    if (qIndex===QUESTIONS.length-1) { setScreen("exclude"); scrollTop(); return; }
    setQIndex(i=>i+1); scrollTop();
  };
  const handlePrev = () => { if(qIndex>0){setQIndex(i=>i-1);scrollTop();} };
  const handleConfirmExclude = (ex) => { setExcluded(ex); setScreen("result"); scrollTop(); };
  const handleRestart = () => { setScreen("welcome"); setQIndex(0); setAnswers({}); setExcluded([]); setUserName(""); scrollTop(); };

  const progress = screen==="quiz" ? ((qIndex+1)/QUESTIONS.length)*100 :
    (screen==="exclude"||screen==="result") ? 100 : 0;

  return (
    <div ref={topRef} style={{fontFamily:"'IBM Plex Mono','Courier New',monospace",background:C.bg,color:C.text,minHeight:"100vh"}}>
      <div style={{padding:"1.5rem 2rem 1rem",borderBottom:`1px solid ${C.border}`}}>
        <div style={{maxWidth:760,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,color:C.muted,letterSpacing:3,marginBottom:2}}>MAJOR MATCH SYSTEM</div>
            <div style={{fontSize:"0.8rem",color:C.muted}}>专业兼容性 · 现实优先</div>
          </div>
          {screen==="quiz"&&<div style={{fontSize:11,color:C.accentLight,textAlign:"right"}}>{qIndex+1} / {QUESTIONS.length}<br/>{Math.round(progress)}%</div>}
        </div>
        <div style={{maxWidth:760,margin:"0.8rem auto 0"}}>
          <div style={{height:2,background:C.border,borderRadius:1}}>
            <div style={{height:2,background:`linear-gradient(90deg,${C.accent},${C.accentLight})`,width:`${progress}%`,transition:"width 0.4s",borderRadius:1}}/>
          </div>
        </div>
      </div>
      {screen==="welcome"&&<Welcome onStart={()=>setScreen("name")}/>}
      {screen==="name"&&<NameScreen onConfirm={(n)=>{setUserName(n);setScreen("quiz");scrollTop();}}/>}
      {screen==="quiz"&&<QuestionPage qIndex={qIndex} answers={answers} onAnswer={handleAnswer} onNext={handleNext} onPrev={handlePrev}/>}
      {screen==="exclude"&&<ExcludeScreen onConfirm={handleConfirmExclude}/>}
      {screen==="result"&&<ResultScreen answers={answers} excluded={excluded} userName={userName} onRestart={handleRestart}/>}
    </div>
  );
}
