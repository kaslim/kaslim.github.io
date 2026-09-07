(function () {
  'use strict';

  const zh = {
    'skip': '跳到主要内容',
    'nav.primary': '主导航',
    'nav.experience': '经历',
    'nav.research': '研究',
    'nav.publications': '论文',
    'nav.demos': '演示',
    'nav.resume': '简历 ↗',
    'hero.eyebrow': '机器学习研究作品集',
    'hero.tagline': '我致力于构建可信赖的音频与音乐机器学习系统。',
    'hero.availability': '<strong>西交利物浦大学博士候选人 · 预计 2027 年 3 月毕业</strong> · 中国苏州 · 寻找 2027 年研究科学家与机器学习工程师岗位',
    'hero.viewResearch': '查看研究',
    'hero.downloadResume': '下载简历',
    'hero.portraitAlt': '刘宇轩证件照',
    'proof.label': '个人概况',
    'proof.publications': '论文发表',
    'proof.firstPapers': '第一／共同第一作者论文',
    'proof.poc': '担任项目负责人完成的 PoC',
    'proof.months': '8 个月',
    'proof.internship': '唱吧音频算法实习',
    'focus.number': '00 · 研究方向',
    'focus.title': '用可验证的边界定义研究问题。',
    'focus.lede': '我的工作覆盖音频理解、生成式音乐、隐私审计，以及把研究方法推进为创作者可使用系统的完整路径。',
    'focus.audioTitle': '音频理解<span>先理解结构，再做出预测。</span>',
    'focus.audioBody': '我研究音乐信息检索、声场景分类和符合听觉感知的音频评测，将信号层面的证据与严谨的实验方法连接起来。',
    'focus.genTitle': '生成式音频<span>把生成过程作为可测量的系统。</span>',
    'focus.genBody': '我研究扩散模型与符号音乐生成模型，也开发从 MusicXML 到表现力音频的渲染系统，重点是可控生成与可复现评测。',
    'focus.trustTitle': '可信人工智能<span>把隐私与版权问题转化为可检验的方法。</span>',
    'focus.trustBody': '我开发面向生成式音频的成员推断、对抗攻击与声音保护方法。成员推断用于审计某个作品是否参与了模型训练。',
    'focus.productTitle': '从研究到产品<span>把方法推进为可使用的概念验证。</span>',
    'focus.productBody': '作为苏州市概念验证项目负责人，我负责面向创作者的音乐工具的模型研发、macOS 产品需求、评测设计和用户试用。',
    'experience.number': '01 · 经历',
    'experience.title': '方法研发与端到端项目负责。',
    'experience.lede': '一条贯穿始终的方法论主线：明确主张，设计证伪方式，再把最可靠的结果推进为可使用系统。',
    'experience.phdDate': '2023–2027<br>预计',
    'experience.phdTitle': '博士研究 · 可信生成式音频与音乐 AI',
    'experience.phdBody1': '面向生成式音频和符号音乐模型开发成员推断与审计方法，尤其关注严格低误报率下的可靠识别。',
    'experience.phdBody2': '提出生成式音乐补全攻击与感知对齐的评测方法，同时检验技术有效性与听众实际能够听到的差异。',
    'experience.pocTitle': '参数化乐谱到音频的表现力渲染',
    'experience.pi': '项目负责人',
    'experience.pocBody1': '主持苏州市具身智能未来教育概念验证中心 PoC，负责表现力渲染研究、macOS 产品需求、评测设计与用户试用。',
    'experience.pocBody2': '系统可将同一份 MusicXML 乐谱渲染为多种演奏风格，并通过相关环境中的小规模验证达到 <strong>TRL 5</strong>。',
    'experience.pocLink': '查看交互式 PoC →',
    'experience.internTitle': '音频算法实习生',
    'experience.changba': '唱吧',
    'experience.internBody': '参与在线 K 歌场景中的歌声生成与增强，通过音频仿真、算法测试和评测支持研发。',
    'education.number': '02 · 教育经历',
    'education.title': '工程基础之上，聚焦博士阶段研究。',
    'education.lede': '物联网、网络安全与智能工程的跨领域训练，构成我当前可信音频 AI 研究的基础。',
    'education.bupt': '北京邮电大学',
    'education.iot': '物联网工程',
    'education.warwick': '华威大学',
    'education.cyber': '网络安全工程',
    'education.phdDegree': '博士 · 2023–2027 预计',
    'education.xjtlu': '西交利物浦大学',
    'education.school': '智能工程学院',
    'research.number': '03 · 研究',
    'research.title': '可信安全、听觉感知与音频理解方向的代表性工作。',
    'research.lede': '每个项目都把技术机制与清晰的评测问题配对，使研究贡献可以被检验和证伪。',
    'research.lsaTag': 'ICASSP 2026 · 第一作者',
    'research.lsaTitle': '审计音乐扩散模型记住了什么',
    'research.lsaBody': '成员推断用于判断某个作品是否参与过模型训练。我提出基于生成流形扰动的审计方法，并在严格低误报率下评估识别能力。',
    'research.lsaLink': '查看交互式方法页 →',
    'research.maiaTag': 'ISMIR 2025 · 第一作者',
    'research.maiaTitle': 'MAIA · 音乐对抗补全攻击',
    'research.maiaBody': 'MAIA 定位关键音频片段，并利用生成式补全构造面向音乐信息检索任务的白盒与黑盒攻击。',
    'research.maiaLink': '试听真实示例 →',
    'research.tsTag': 'AAAI Workshop 2026 · 第一作者',
    'research.tsTitle': '审计符号音乐模型记住了什么',
    'research.tsBody': 'TS-RaMIA 将结构化 token 的敏感性转化为成员证据，形成面向符号音乐生成模型的可审计攻击流程。',
    'research.tsLink': '查看交互式审计 →',
    'research.ddscTag': '共同第一作者 · DCASE / ICASSP 2026',
    'research.ddscTitle': '域偏移下的数据高效音频理解',
    'research.ddscBody': '课程学习方法利用不确定性和多个训练信号，在声学条件变化与数据受限时动态调整样本优先级。',
    'research.ddscLink': '查看动态课程学习 →',
    'publications.number': '04 · 论文',
    'publications.title': '11 篇论文中包含 5 篇第一／共同第一作者论文。',
    'publications.lede': '论文发表于 ICASSP、INTERSPEECH、ISMIR、AAAI Workshop、CMMR、FG 与 DCASE 等会议。',
    'publications.entropyAuthors': 'P. Zhang 与 <strong>Yuxuan Liu</strong> · 共同第一作者，其他作者：Z. Li、R. Sang、Y. Cai、Y. Tan、S. Li',
    'demos.number': '05 · 项目演示',
    'demos.title': '可以查看、操作与试听的研究项目。',
    'demos.lede': '九个当前项目页分别展示研究问题、方法、证据与评测边界；仅在研究资产支持时提供音频示例。',
    'demos.currentPage': '当前项目页',
    'demos.maiaAlt': '当前 MAIA 研究页面，展示方法标题与经过核验的局部重生成 Demo',
    'demos.maiaBody': '定位关键音乐区域，只对有限片段进行局部重生成。',
    'demos.maiaLink': '打开真实音频 Demo →',
    'demos.lsaAlt': '当前 LSA-Probe 研究页面，展示论文题目与证据摘要',
    'demos.lsaBody': '通过局部反向生成过程的稳定性审计音乐扩散模型。',
    'demos.lsaLink': '打开证据优先型审计页 →',
    'demos.tsAlt': '当前 TS-RaMIA 研究页面，展示基于证据的符号音乐审计',
    'demos.tsBody': '利用结构 token 证据，同时控制评测中的混杂因素。',
    'demos.tsLink': '查看受控实验结果 →',
    'demos.musicRenderAlt': '当前 Music Render Alpha 创作者应用与表现力渲染控制界面',
    'demos.musicRenderBody': '把同一份 MusicXML 乐谱转化为可控的表现力演奏。',
    'demos.musicRenderLink': '打开创作者 PoC →',
    'demos.ddscAlt': '当前 DDSC 页面，展示动态双信号课程学习方法',
    'demos.ddscBody': '随着训练从不变性学习转向潜力挖掘，动态调整样本优先级。',
    'demos.ddscLink': '查看动态课程学习 →',
    'demos.entropyTitle': '熵引导课程学习',
    'demos.entropyAlt': '当前熵引导课程学习页面，展示从设备不确定性构建分阶段训练',
    'demos.entropyBody': '先学习能够揭示声场景、而非录音设备的样本。',
    'demos.entropyLink': '查看分阶段课程学习 →',
    'demos.topsegAlt': '当前 TopSeg 页面，展示用于心音分割的三种时间尺度',
    'demos.topsegBody': '在符合生理过程的多个时间尺度上表征心音结构。',
    'demos.topsegLink': '查看拓扑方法 →',
    'demos.sceneguardAlt': '当前 SceneGuard 页面，展示场景一致的可听见声音保护',
    'demos.sceneguardBody': '使用符合环境场景的可听背景声保护公开语音。',
    'demos.sceneguardLink': '查看声音保护流程 →',
    'demos.lborAlt': '当前 LBOR 页面，展示用于手语识别的类特定图几何',
    'demos.lborBody': '将每个类别正则化为连通的特征空间区域。',
    'demos.lborLink': '查看几何正则化方法 →',
    'skills.number': '06 · 技术栈',
    'skills.title': '兼顾研究深度与工程交付路径。',
    'skills.lede': '工具链支持可复现实验、音频评测、研究原型与面向产品的快速迭代。',
    'skills.genTitle': '生成式音频',
    'skills.genBody': '扩散模型、音乐与语音生成、符号音乐建模、MusicXML 工作流',
    'skills.trustTitle': '可信人工智能',
    'skills.trustBody': '成员推断、模型隐私、版权审计、数据来源追踪、对抗鲁棒性',
    'skills.audioTitle': '音频智能',
    'skills.audioBody': '音乐信息检索、音频信号处理、声场景分类、感知评测',
    'skills.mlTitle': '机器学习',
    'skills.mlBody': 'Python、PyTorch、C/C++、MATLAB、实验设计、统计分析',
    'skills.agentTitle': 'Agent 工具链',
    'skills.agentBody': '使用 Codex、Cursor 与 Claude Code 进行实现、调试、原型迭代与文档自动化',
    'skills.commTitle': '科研表达',
    'skills.commBody': '学术写作、同行评审论文发表、用户试验设计、技术演示',
    'background.number': '07 · 补充信息',
    'background.title': '面向招聘方与合作伙伴的快速问答。',
    'background.q1': '刘宇轩正在寻找哪些岗位？',
    'background.a1': '面向音频理解、音乐智能、生成式音频与可信人工智能的机器学习科学家和工程师岗位。',
    'background.q2': '刘宇轩何时可以入职？',
    'background.a2': '预计于 2027 年 3 月完成博士学位，目标为 2027 届校招或早期职业阶段岗位。',
    'background.q3': '核心研究贡献是什么？',
    'background.a3': '开发生成式音频模型审计方法、音乐系统攻击与评测方法，并让技术指标更贴近真实听觉感知。',
    'background.q4': '是否包含产品负责人经验？',
    'background.a4': '是。作为 MusicXML 到音频 PoC 的项目负责人，他负责模型、应用、评测与用户试验，项目达到 TRL 5。',
    'background.q5': '是否有音频行业经验？',
    'background.a5': '有。在唱吧实习期间，他通过音频仿真、算法测试和评测参与歌声生成与增强研发。',
    'background.q6': '在哪里查看完整论文列表？',
    'background.a6': '本页展示代表性论文；完整记录可在 <a href="https://scholar.google.com/citations?user=00WQZLYAAAAJ" target="_blank" rel="noopener">Google Scholar</a> 查看。',
    'contact.number': '08 · 联系方式',
    'contact.title': '一起构建经得起检验的音频系统。',
    'contact.body': '可于 2027 年 3 月起入职，寻找新加坡及其他地区的研究科学家与机器学习工程师岗位。',
    'contact.email': '邮件',
    'contact.resume': '简历',
    'footer.ethos': '认真聆听的方法，经得起检验的主张。'
  };

  const textDefaults = new Map();
  const htmlDefaults = new Map();
  const altDefaults = new Map();
  const ariaDefaults = new Map();

  document.querySelectorAll('[data-i18n]').forEach((element) => textDefaults.set(element, element.textContent));
  document.querySelectorAll('[data-i18n-html]').forEach((element) => htmlDefaults.set(element, element.innerHTML));
  document.querySelectorAll('[data-i18n-alt]').forEach((element) => altDefaults.set(element, element.getAttribute('alt') || ''));
  document.querySelectorAll('[data-i18n-aria]').forEach((element) => ariaDefaults.set(element, element.getAttribute('aria-label') || ''));

  const languageButton = document.getElementById('language-toggle');
  const publicationToggle = document.getElementById('publication-toggle');
  const publicationList = document.getElementById('publication-list');
  let currentLanguage = 'en';

  function isChinese(value) {
    return value === 'zh' || value === 'zh-CN';
  }

  function getInitialLanguage() {
    const value = new URL(window.location.href).searchParams.get('lang');
    return isChinese(value) ? 'zh-CN' : 'en';
  }

  function updatePublicationToggle() {
    if (!publicationToggle || !publicationList) return;
    const expanded = publicationToggle.getAttribute('aria-expanded') === 'true';
    if (currentLanguage === 'zh-CN') {
      publicationToggle.textContent = expanded ? '收起扩展论文列表 ↑' : '显示全部 11 篇论文 ↓';
    } else {
      publicationToggle.textContent = expanded ? 'Show selected publications ↑' : 'Show all 11 publications ↓';
    }
  }

  function setLanguage(language, updateUrl) {
    currentLanguage = isChinese(language) ? 'zh-CN' : 'en';
    const useChinese = currentLanguage === 'zh-CN';

    textDefaults.forEach((defaultValue, element) => {
      const key = element.getAttribute('data-i18n');
      element.textContent = useChinese && zh[key] ? zh[key] : defaultValue;
    });
    htmlDefaults.forEach((defaultValue, element) => {
      const key = element.getAttribute('data-i18n-html');
      element.innerHTML = useChinese && zh[key] ? zh[key] : defaultValue;
    });
    altDefaults.forEach((defaultValue, element) => {
      const key = element.getAttribute('data-i18n-alt');
      element.setAttribute('alt', useChinese && zh[key] ? zh[key] : defaultValue);
    });
    ariaDefaults.forEach((defaultValue, element) => {
      const key = element.getAttribute('data-i18n-aria');
      element.setAttribute('aria-label', useChinese && zh[key] ? zh[key] : defaultValue);
    });

    document.documentElement.lang = useChinese ? 'zh-CN' : 'en';
    document.title = useChinese ? '刘宇轩 · 可信音频与音乐人工智能' : 'Yuxuan Liu · Trustworthy Audio & Music AI';
    const description = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (description) description.content = useChinese ? '刘宇轩，研究可信赖的音频与音乐机器学习系统，预计于 2027 年 3 月完成博士学位。' : 'Yuxuan Liu is a Ph.D. candidate building trustworthy machine learning systems for audio and music. Available from March 2027.';
    if (ogTitle) ogTitle.content = document.title;
    if (ogDescription) ogDescription.content = useChinese ? '覆盖音频理解、生成式音乐与可信人工智能的研究、论文与产品工作。' : 'Research, publications, and product work across audio understanding, generative music, and trustworthy AI.';

    if (languageButton) {
      languageButton.textContent = useChinese ? 'EN' : '中文';
      languageButton.setAttribute('aria-label', useChinese ? '切换到英文' : 'Switch to Chinese');
    }
    updatePublicationToggle();

    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', currentLanguage);
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
    document.dispatchEvent(new CustomEvent('home:languagechange', { detail: { language: currentLanguage } }));
  }

  if (publicationToggle && publicationList) {
    publicationToggle.addEventListener('click', function () {
      const expanded = publicationToggle.getAttribute('aria-expanded') === 'true';
      publicationList.classList.toggle('show-all', !expanded);
      publicationToggle.setAttribute('aria-expanded', String(!expanded));
      updatePublicationToggle();
    });
  }

  if (languageButton) {
    languageButton.addEventListener('click', function () {
      setLanguage(currentLanguage === 'en' ? 'zh-CN' : 'en', true);
    });
  }

  setLanguage(getInitialLanguage(), false);
  window.__homeI18n = { setLanguage, getLanguage: () => currentLanguage };
})();
