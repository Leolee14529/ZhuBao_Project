const zhCN = {
  common: {
    cancel: "取消", confirm: "确认", save: "保存", saving: "保存中", delete: "删除",
    retry: "重试", close: "关闭", back: "返回", none: "暂无", loading: "加载中"
  },
  nav: { home: "首页", data: "记录", settings: "设置" },
  profile: { user: "用户 {{suffix}}", guest: "珠宝用户" },
  settings: {
    device: "设备", preferences: "偏好设置", privacy: "隐私与数据", language: "语言",
    chinese: "简体中文", english: "English", ring: "指环连接", sleep: "睡眠模式",
    notifications: "消息通知", connected: "已连接", disconnected: "未连接", unavailable: "暂未接入",
    agreement: "用户协议", privacyPolicy: "隐私政策", wechatPrivacy: "微信隐私保护指引",
    clearCycle: "清除经期本地数据", deleteBirth: "删除出生资料和五行结果",
    withdrawConsent: "撤回同意", deleteAccount: "注销账号并删除服务器数据", logout: "退出登录",
    languageHint: "选择显示语言", noDeviceModel: "暂无设备型号", noDeviceVersion: "暂无设备版本",
    clearCycleTitle: "清除经期记录", clearCycleContent: "将清除本机保存的经期记录和确认状态，不会影响服务器账号。",
    clearCycleDone: "已清除本机经期记录", deleteBirthTitle: "删除出生资料",
    deleteBirthContent: "将删除出生资料和五行结果，本地和服务器记录都会清空。", deleteBirthDone: "已删除五行资料",
    withdrawTitle: "撤回同意", withdrawContent: "撤回后将退出登录并清除本机个人数据。再次使用登录或保存功能时需重新同意。",
    deleteAccountTitle: "注销账号", deleteAccountContent: "将删除账号、全部服务器业务数据、出生资料、五行结果，并清除本机经期记录。该操作不可恢复。",
    deleteFailed: "删除失败，请重试", logoutFailed: "退出失败，请稍后再试"
  },
  errors: {
    requestFailed: "请求失败，请稍后再试", network: "网络请求失败，请稍后再试", apiMissing: "当前版本尚未配置服务器地址",
    loginRequired: "请先登录后使用", privacyRead: "请先阅读隐私政策", privacyAgree: "请先同意隐私保护指引",
    validation: "提交信息有误，请检查后重试", saveFailed: "保存失败，请重试", unsupported: "功能暂未开放"
  },
  entry: { entering: "正在进入首页", failed: "首页加载失败，请重试", retry: "重新进入" },
  login: {
    description: "智能珠宝与个人定制", wechat: "微信", account: "账号", welcome: "欢迎来到 Ting's",
    title: "保存你的专属定制与生活记录", summary: "登录后可保存五行结果、珠宝风格参考和每日状态记录。",
    unavailable: "登录暂时不可用", retry: "重试", accountPlaceholder: "账号 / 邮箱", passwordPlaceholder: "密码",
    accountLogin: "账号登录", createAccount: "创建账号", wechatLogin: "微信登录", agreementPrefix: "我已阅读并同意",
    agreement: "《用户协议》", and: "和", privacy: "《隐私政策》", wechatGuide: "微信隐私保护指引", guest: "暂不登录，先浏览",
    accountUnavailable: "账号登录暂未开放，请使用微信登录", accountRequired: "请输入账号和密码", agreementRequired: "请先阅读并同意用户协议与隐私政策",
    timeout: "微信登录超时，请稍后再试", privacyOpenFailed: "微信隐私保护指引暂时无法打开",
    wechatOneTap: "微信一键登录", accountNotice: "账号登录与微信登录为独立账号，数据不会自动同步。"
  },
  home: {
    hello: "你好", inspiration: "今日灵感", customize: "五行定制", deviceStatus: "设备状态", pendingConnect: "待连接",
    pendingConnectDesc: "连接设备后展示今日数据", elementResult: "五行结果", pendingResult: "待生成",
    pendingResultDesc: "完成定制后生成专属结果", seasonal: "本季臻选", preview: "灵感预览", new: "新品",
    noDevice: "暂无设备", disconnected: "未连接", device: "设备",
    homeIntro: "今日灵感与珠宝风格参考", dailyInspiration: "今日灵感", todayColor: "今日色彩", inspirationTitle: "清润", inspirationColor: "青绿色", inspirationTip: "把注意力放回手边的一件小事，慢慢呼吸 6 次。", flipHint: "点击翻面",
    mood: "今日状态", moodName: "今天也慢慢来", moodDesc: "不用急，先照顾好自己的节奏。", colorDesc: "为今天选择一件喜欢的饰品。", styleReference: "风格参考", moreReferences: "更多参考", signInToRecord: "登录后记录今天", loadingRecord: "正在读取今日记录", recordUnavailable: "记录暂不可用", recordToday: "记录今天", viewToday: "查看今日记录", navHome: "首页", navData: "记录", navSettings: "设置"
  },
  products: {
    title: "风格参考", subtitle: "色彩与材质参考", back: "返回", kicker: "STYLE REFERENCE", featureTitle: "珠宝风格灵感",
    search: "搜索", searchPlaceholder: "搜索名称、类型或风格", clearSearch: "清除", noResults: "没有找到对应风格，试试其他关键词。",
    filters: [{ id: "all", label: "全部" }, { id: "new", label: "近期" }, { id: "necklace", label: "项链" }, { id: "earwear", label: "耳饰" }, { id: "ring", label: "戒指" }, { id: "material", label: "材质" }],
    moodFilterTitle: "按此刻的情绪选择", moodFilterHint: "情绪风格", moods: [{ id: "all", label: "全部情绪" }, { id: "calm", label: "平静" }, { id: "focused", label: "专注" }, { id: "bright", label: "明亮" }, { id: "relaxed", label: "松弛" }, { id: "grounded", label: "沉稳" }],
    tags: { recent: "近期", display: "展示", material: "材质" }, styleNotes: "风格说明",
    detailTitle: "风格展示", detailSubtitle: "完整图文参考", previewImage: "点击查看大图", colorMaterial: "色彩与材质", stylingReference: "搭配参考", moodReference: "情绪与色彩参考", moodReferenceDesc: "从当下的感受出发选择色彩与材质，只作为穿搭灵感，不替代你的真实感受。", recordFeeling: "记录今日感受", recordFeelingHint: "进入记录页，保存你此刻真实的状态",
    shareList: "海米算力 | 珠宝风格参考", shareDetail: "海米算力 | {{name}}"
  },
  data: {
    title: "数据记录", subtitle: "今日记录", score: "今日记录", noRecord: "今天还没有记录。", recorded: "已读取今天保存的真实记录。", calendar: "周期记录", entriesUnit: "条",
    loading: "加载中", loadFailed: "记录加载失败，请检查网络后重试。", retry: "重试", emptyTitle: "暂无今日记录", emptyDesc: "完成今日记录后，这里会显示你保存的状态。",
    sleep: "睡眠记录", sleepSource: "来自今日记录中的睡眠时长", noSleep: "暂无睡眠记录", hoursUnit: "小时", minutesUnit: "分钟", sleepTrend: "近 7 日睡眠", sleepTrendSubtitle: "只统计你主动保存的睡眠时长", viewSleepTrend: "查看详情", averageSleep: "平均时长", recordedNights: "记录晚数", recordedNightsUnit: "晚", averageSleepEmpty: "--", noSleepTrend: "记录睡眠时长后，这里会形成趋势。",
    recordDetails: "今日状态", moodScore: "心情", energyScore: "精力", wearing: "饰品佩戴", wearingYes: "今日已佩戴", wearingNo: "今日未佩戴", note: "备注", noNote: "暂无备注",
    weekRhythm: "近 7 日节奏", weekRhythmSubtitle: "只呈现你真实保存的记录", weekDays: ["日", "一", "二", "三", "四", "五", "六"], weekRecorded: "记录天数", averageMood: "平均心情", jewelryDays: "饰品陪伴", weekRecordedUnit: "天", averageMoodUnit: "分", jewelryDaysUnit: "天", timesUnit: "次", weekSummary: "你的近 7 日节奏已根据真实记录更新。", noWeeklyRecords: "记录几天后，这里会出现你的节奏。", weeklyLoadFailed: "近 7 日记录暂时无法读取。",
    feelings: "感受记录", feelingsSubtitle: "近 7 日出现较多的关键词", noFeelings: "保存感受标签后，这里会形成你的关键词。", todayFeeling: "今日感受", feelingReady: "已生成", feelingPending: "待记录", calmPace: "状态较稳，适合把注意力留给眼前的一件事。", gentlePace: "今天可以放慢一点，先照顾好自己的节奏。", brightPace: "今天的状态有光，可以顺着这份能量做喜欢的事。", jewelryCompanion: "饰品是今天的一份陪伴，不替代你的感受与判断。", selfCompanion: "没有佩戴也没关系，真正重要的是你当下的感受。", noTodayFeeling: "完成今日记录后，这里会生成一条只基于真实记录的提示。",
    createRecord: "记录今天", editRecord: "编辑记录", deleteRecord: "删除记录", saveRecord: "保存记录", saving: "保存中", saved: "记录已保存", saveFailed: "保存失败，请重试", formInvalid: "请检查评分和睡眠时长",
    sleepDuration: "睡眠时长", feelingTags: "感受标签", notePlaceholder: "可选，最多 200 字", deleteTitle: "删除今日记录", deleteContent: "删除后可在 5 秒内撤销。", deleteConfirm: "删除", deleteFailed: "删除失败，请重试", deleted: "今日记录已删除", undo: "撤销", undoFailed: "撤销失败，请重新记录",
    tagOptions: [{ value: "专注", label: "专注" }, { value: "放松", label: "放松" }, { value: "社交", label: "社交" }, { value: "疲惫", label: "疲惫" }, { value: "平静", label: "平静" }]
  },
  sleepDetail: {
    title: "睡眠记录", overview: "睡眠概览", source: "来自每日记录", total: "记录时长", loading: "加载中", retry: "重试", rangeDay: "日", rangeWeek: "周", rangeMonth: "月", previous: "上一段", next: "下一段", trendTitle: "睡眠时长趋势", averageSleep: "平均时长", recordedNights: "记录晚数", recordedNightsUnit: "晚", averageSleepEmpty: "--", noSleepTrend: "这段时间还没有保存睡眠时长。", weekDays: ["日", "一", "二", "三", "四", "五", "六"],
    noRecord: "暂无睡眠记录", loadFailed: "睡眠记录加载失败，请稍后重试。", stageTitle: "睡眠阶段", stageUnavailable: "暂无睡眠阶段数据",
    recordOnly: "当前只记录用户填写的睡眠总时长，不推测深睡、浅睡或清醒比例。", hoursUnit: "小时", minutesUnit: "分钟"
  },
  five: {
    title: "五行定制", introTitle: "输入出生时间", introDesc: "你可以先体验本地预览；登录后可保存结果并进行跨设备同步。",
    birthDate: "出生日期", birthTime: "出生时间", gender: "性别", female: "女", male: "男", preview: "当前参考结果",
    focus: "主势：{{element}}", saveLoggedIn: "保存并更新五行", saveGuest: "登录后保存结果", updated: "已更新五行",
    loginToSave: "登录后可保存和同步五行结果", noticeTitle: "出生资料用途说明",
    noticeContent: "将保存出生日期、出生时间、性别，用于五行计算和饰品风格推荐；可在设置中删除；不构成医疗、健康或功效承诺。",
    consent: "同意保存", cancelled: "已取消保存", unavailable: "暂时无法保存，请稍后重试"
  },
  elements: {
    none: "无", wood: "木", fire: "火", earth: "土", metal: "金", water: "水",
    noData: "暂无真实数据", strong: "{{strong}}势偏强 · {{weak}}需补足", serverReady: "五行结果已由服务器计算",
    empty: "暂无真实五行数据", balanced: "当前状态：五行能量分布均衡。", recorded: "出生时间已录入，可查看五行分布与饰品风格参考", radarTitle: "五行分布", radarSubtitle: "饰品风格参考"
  },
  calendar: {
    title: "智能经期日历", reminder: "今天经期来了吗？", emptyTitle: "还没有周期记录", emptyDesc: "先设置你的经期信息，系统会生成预测日历", setup: "去设置周期",
    status: "状态：", remark: "备注：", until: "距离下次经期还有", day: "天", adjust: "调整经期周期", clear: "清除本机经期记录",
    setupTitle: "设置周期", setupDesc: "只做前端保存，设置完成后会直接显示预测日历与倒计时结果。", privacyTitle: "我已知晓经期数据说明",
    privacyDesc: "经期记录仅保存在本机，不上传服务器，不构成医疗、诊断、避孕、生育或健康建议；清除缓存或卸载可能导致数据丢失。",
    lastStart: "上次经期开始日期", averageCycle: "平均周期", periodLength: "经期持续天数", example28: "例：28", example5: "例：5", saveView: "保存并查看日历",
    saved: "周期设置完成", privacyRequired: "请先勾选经期数据说明", cannotAdjust: "当前日期无法调整预测", adjusted: "已重新预测后续周期"
  },
  legal: {
    back: "返回", agreeAndBack: "同意并返回", privacyAccepted: "已同意隐私政策",
    agreementTitle: "用户协议", agreementHeading: "海米算力用户协议", privacyTitle: "隐私政策", privacyHeading: "海米算力隐私政策",
    meta: "更新时间：2026-06-27　生效日期：2026-06-27",
    agreementParagraphs: [
      "海米算力由北京海米莱科技有限公司运营。使用本小程序前，请阅读并理解本协议及隐私政策。",
      "本产品提供生活方式记录、五行娱乐参考和饰品风格推荐。相关内容不构成医疗建议、诊断、避孕、生育建议、健康建议或功效承诺。",
      "用户应确保提交的信息真实、合法，并自行判断参考内容是否适合自身情况。涉及身体不适或健康管理问题时，请咨询专业机构。",
      "未满 14 周岁的用户应在监护人同意和指导下使用。本产品不主动面向儿童提供服务，不主动收集儿童个人信息。",
      "用户可在设置页退出登录、删除出生资料和五行结果、清除经期本地记录、撤回同意或注销账号。",
      "如需联系我们，请发送邮件至 qq13238367306@163.com。"
    ],
    privacyParagraphs: [
      "运营主体：北京海米莱科技有限公司。联系方式：qq13238367306@163.com。",
      "我们处理微信账号标识、登录凭证/会话标识，用于登录、账号识别和安全认证。openid、unionid 仅保存在服务端，不返回小程序前端展示。",
      "如用户选择账号密码登录，我们会处理账号名或邮箱形式的账号标识；密码仅以不可逆哈希形式保存在服务端，不以明文保存或返回前端。",
      "出生日期、出生时间、性别用于五行计算和饰品风格推荐。用户可在设置中删除，删除后本地和服务器结果将清空。",
      "用户主动提交的心情、精力、睡眠时长、饰品佩戴状态、标签和备注用于生成每日生活记录，并保存在服务器。用户可更新或删除自己的记录，其他用户无法访问。",
      "经期开始日期、周期、持续天数和预测记录属于敏感生理周期记录，仅保存在本机，不上传服务器、不备份、不同步。用户可随时在经期页或设置页清除，卸载或清理缓存可能导致数据丢失。",
      "设备窗口和状态栏信息仅用于界面适配。服务日志仅用于安全审计和排障，保留 180 天，不记录密钥、登录凭证、出生时间原文或经期记录。",
      "我们不收集手机号、微信昵称、微信头像、位置、相册、相机、麦克风、通讯录、剪贴板、地址或支付信息。",
      "用户可请求查阅、更正、删除个人信息，撤回同意或注销账号。账号、出生资料和五行结果删除申请将在 15 个工作日内完成。",
      "未满 14 周岁的用户应在监护人同意和指导下使用。本产品不主动面向儿童提供服务，不主动收集儿童个人信息。",
      "五行、珠宝、经期内容仅作生活记录、娱乐参考和饰品风格推荐，不构成医疗建议、诊断、避孕、生育建议、健康建议或功效承诺。"
    ]
  },
  cycle: {
    period: "经期", forecast: "预测经期", ovulation: "参考日", fertile: "参考窗口", safe: "其他日期",
    noPrediction: "暂无预测结果", estimatedStart: "预计 {{date}} 开始", noRemark: "暂无",
    month: "{{year}}年{{month}}月", fullDate: "{{year}}年{{month}}月{{day}}日",
    weekday: ["日", "一", "二", "三", "四", "五", "六"]
  }
};

const enUS = {
  common: {
    cancel: "Cancel", confirm: "Confirm", save: "Save", saving: "Saving…", delete: "Delete",
    retry: "Try again", close: "Close", back: "Back", none: "None", loading: "Loading…"
  },
  nav: { home: "Home", data: "Journal", settings: "Settings" },
  profile: { user: "User {{suffix}}", guest: "Jewelry user" },
  settings: {
    device: "DEVICE", preferences: "PREFERENCES", privacy: "PRIVACY & DATA", language: "Language",
    chinese: "简体中文", english: "English", ring: "Ring connection", sleep: "Sleep mode",
    notifications: "Notifications", connected: "Connected", disconnected: "Not connected", unavailable: "Not available",
    agreement: "User Agreement", privacyPolicy: "Privacy Policy", wechatPrivacy: "WeChat Privacy Guide",
    clearCycle: "Clear local cycle data", deleteBirth: "Delete birth details and element result",
    withdrawConsent: "Withdraw consent", deleteAccount: "Delete account and server data", logout: "Log out",
    languageHint: "Choose display language", noDeviceModel: "No device model", noDeviceVersion: "No device version",
    clearCycleTitle: "Clear cycle records", clearCycleContent: "This clears cycle records and consent saved on this device. Your server account is not affected.",
    clearCycleDone: "Local cycle data cleared", deleteBirthTitle: "Delete birth details",
    deleteBirthContent: "Birth details and element results will be removed from this device and the server.", deleteBirthDone: "Birth details deleted",
    withdrawTitle: "Withdraw consent", withdrawContent: "You will be logged out and local personal data will be cleared. You must consent again before logging in or saving.",
    deleteAccountTitle: "Delete account", deleteAccountContent: "Your account, server data, birth details, element results, and local cycle records will be deleted. This cannot be undone.",
    deleteFailed: "Could not delete. Please try again.", logoutFailed: "Could not log out. Please try again."
  },
  errors: {
    requestFailed: "Request failed. Please try again.", network: "Network request failed. Please try again.", apiMissing: "This build has no server address configured.",
    loginRequired: "Please log in to continue.", privacyRead: "Please read the Privacy Policy first.", privacyAgree: "Please agree to the privacy guide first.",
    validation: "Please check your information and try again.", saveFailed: "Could not save. Please try again.", unsupported: "This feature is not available yet."
  },
  entry: { entering: "Opening Home", failed: "Could not open Home. Please try again.", retry: "Open again" },
  login: {
    description: "Smart jewelry and personal curation", wechat: "WeChat", account: "Account", welcome: "Welcome to Ting's",
    title: "Save your personal curation and lifestyle journal", summary: "Sign in to save element results, jewelry-style references, and daily state entries.",
    unavailable: "Sign-in is unavailable", retry: "Try again", accountPlaceholder: "Account / email", passwordPlaceholder: "Password",
    accountLogin: "Sign in", createAccount: "Create account", wechatLogin: "Sign in with WeChat", agreementPrefix: "I have read and agree to the",
    agreement: "User Agreement", and: "and", privacy: "Privacy Policy", wechatGuide: "WeChat Privacy Guide", guest: "Browse without signing in",
    accountUnavailable: "Account sign-in is not available. Please use WeChat sign-in.", accountRequired: "Enter your account and password.", agreementRequired: "Please read and agree to the User Agreement and Privacy Policy.",
    timeout: "WeChat sign-in timed out. Please try again.", privacyOpenFailed: "The WeChat Privacy Guide could not be opened.",
    wechatOneTap: "Continue with WeChat", accountNotice: "Account and WeChat sign-ins are separate and do not sync automatically."
  },
  home: {
    hello: "Hello", inspiration: "Today's inspiration", customize: "Element curation", deviceStatus: "Device status", pendingConnect: "Not connected",
    pendingConnectDesc: "Connect a device to see today's data", elementResult: "Element result", pendingResult: "Not ready",
    pendingResultDesc: "Finish curation to generate your result", seasonal: "Seasonal selection", preview: "Inspiration preview", new: "New",
    noDevice: "No device", disconnected: "Not connected", device: "Device",
    homeIntro: "Today’s inspiration and jewelry-style reference", dailyInspiration: "Today’s inspiration", todayColor: "Today’s color", inspirationTitle: "Clear glow", inspirationColor: "Jade green", inspirationTip: "Bring your attention back to one small thing at hand and take six slow breaths.", flipHint: "Tap to flip",
    mood: "Today’s state", moodName: "Take it gently today", moodDesc: "There is no need to rush. Care for your own rhythm first.", colorDesc: "Choose a piece of jewelry you like for today.", styleReference: "Style reference", moreReferences: "More", signInToRecord: "Sign in to record today", loadingRecord: "Loading today's entry", recordUnavailable: "Journal unavailable", recordToday: "Record today", viewToday: "View today's entry", navHome: "Home", navData: "Journal", navSettings: "Settings"
  },
  products: {
    title: "Style reference", subtitle: "Color and material studies", back: "Back", kicker: "STYLE REFERENCE", featureTitle: "Jewelry form library",
    search: "Search", searchPlaceholder: "Search name, type, or style", clearSearch: "Clear", noResults: "No matching style. Try another keyword.",
    filters: [{ id: "all", label: "All" }, { id: "new", label: "Recent" }, { id: "necklace", label: "Necklaces" }, { id: "earwear", label: "Earwear" }, { id: "ring", label: "Rings" }, { id: "material", label: "Materials" }],
    moodFilterTitle: "Choose by how you feel", moodFilterHint: "Mood style", moods: [{ id: "all", label: "All moods" }, { id: "calm", label: "Calm" }, { id: "focused", label: "Focused" }, { id: "bright", label: "Bright" }, { id: "relaxed", label: "Relaxed" }, { id: "grounded", label: "Grounded" }],
    tags: { recent: "Recent", display: "Display", material: "Material" }, styleNotes: "Style notes",
    detailTitle: "Style study", detailSubtitle: "Full image and styling notes", previewImage: "View full image", colorMaterial: "Color and material", stylingReference: "Styling reference", moodReference: "Mood and color reference", moodReferenceDesc: "Begin with how you feel, then use color and material as styling inspiration—not as a substitute for your real feelings.", recordFeeling: "Record today's feeling", recordFeelingHint: "Open the journal and save how you actually feel",
    shareList: "Ting's | Jewelry style reference", shareDetail: "Ting's | {{name}}"
  },
  data: {
    title: "Journal", subtitle: "Today", score: "Today's journal", noRecord: "No entry for today yet.", recorded: "Showing your saved entry for today.", calendar: "Cycle journal", entriesUnit: "entries",
    loading: "Loading", loadFailed: "The entry could not be loaded. Check your network and try again.", retry: "Retry", emptyTitle: "No entry today", emptyDesc: "Your saved state will appear here after you complete today's entry.",
    sleep: "Sleep journal", sleepSource: "From the sleep duration in today's entry", noSleep: "No sleep entry", hoursUnit: "h ", minutesUnit: "m", sleepTrend: "7-day sleep", sleepTrendSubtitle: "Only durations you saved are counted", viewSleepTrend: "View details", averageSleep: "Average", recordedNights: "Nights logged", recordedNightsUnit: " nights", averageSleepEmpty: "--", noSleepTrend: "Save sleep duration to build your trend.",
    recordDetails: "Today's state", moodScore: "Mood", energyScore: "Energy", wearing: "Jewelry", wearingYes: "Worn today", wearingNo: "Not worn today", note: "Note", noNote: "No note",
    weekRhythm: "7-day rhythm", weekRhythmSubtitle: "Built only from entries you saved", weekDays: ["S", "M", "T", "W", "T", "F", "S"], weekRecorded: "Days logged", averageMood: "Avg. mood", jewelryDays: "Jewelry days", weekRecordedUnit: "d", averageMoodUnit: "", jewelryDaysUnit: "d", timesUnit: "x", weekSummary: "Your 7-day rhythm is updated from real entries.", noWeeklyRecords: "Log a few days to reveal your rhythm.", weeklyLoadFailed: "Your 7-day entries could not be loaded.",
    feelings: "Feeling notes", feelingsSubtitle: "Your most frequent tags from the last 7 days", noFeelings: "Save feeling tags to build your personal keywords.", todayFeeling: "Today's reflection", feelingReady: "Ready", feelingPending: "Pending", calmPace: "Your state feels steady. Keep your attention on one thing in front of you.", gentlePace: "Take today a little slower and care for your own rhythm first.", brightPace: "There is light in today's state. Follow that energy toward something you enjoy.", jewelryCompanion: "Jewelry can be a companion today, not a substitute for your own feelings or judgment.", selfCompanion: "It is fine not to wear anything. What matters is how you feel right now.", noTodayFeeling: "Complete today's entry for a reflection grounded only in what you saved.",
    createRecord: "Record today", editRecord: "Edit entry", deleteRecord: "Delete entry", saveRecord: "Save entry", saving: "Saving", saved: "Entry saved", saveFailed: "Could not save. Try again.", formInvalid: "Check the scores and sleep duration.",
    sleepDuration: "Sleep duration", feelingTags: "Feeling tags", notePlaceholder: "Optional, up to 200 characters", deleteTitle: "Delete today's entry", deleteContent: "You can undo this for 5 seconds.", deleteConfirm: "Delete", deleteFailed: "Could not delete. Try again.", deleted: "Today's entry deleted", undo: "Undo", undoFailed: "Undo failed. Create the entry again.",
    tagOptions: [{ value: "专注", label: "Focused" }, { value: "放松", label: "Relaxed" }, { value: "社交", label: "Social" }, { value: "疲惫", label: "Tired" }, { value: "平静", label: "Calm" }]
  },
  sleepDetail: {
    title: "Sleep journal", overview: "Sleep overview", source: "From daily entries", total: "Recorded duration", loading: "Loading", retry: "Retry", rangeDay: "Day", rangeWeek: "Week", rangeMonth: "Month", previous: "Previous", next: "Next", trendTitle: "Sleep-duration trend", averageSleep: "Average", recordedNights: "Nights logged", recordedNightsUnit: " nights", averageSleepEmpty: "--", noSleepTrend: "No sleep duration was saved in this period.", weekDays: ["S", "M", "T", "W", "T", "F", "S"],
    noRecord: "No sleep entry", loadFailed: "The sleep entry could not be loaded. Try again later.", stageTitle: "Sleep stages", stageUnavailable: "No sleep-stage data",
    recordOnly: "Only the sleep duration you entered is recorded. Deep, light, and awake stages are not estimated.", hoursUnit: "h ", minutesUnit: "m"
  },
  five: {
    title: "Element curation", introTitle: "Enter your birth time", introDesc: "Try a local preview first. Sign in to save and sync your result across devices.",
    birthDate: "Birth date", birthTime: "Birth time", gender: "Gender", female: "Female", male: "Male", preview: "Current result",
    focus: "Primary: {{element}}", saveLoggedIn: "Save and update", saveGuest: "Sign in to save", updated: "Updated",
    loginToSave: "Sign in to save and sync your result", noticeTitle: "How birth details are used",
    noticeContent: "Your birth date, birth time, and gender are saved to calculate element results and recommend jewelry styles. You can delete them in Settings. This is not a medical, health, or efficacy claim.",
    consent: "Agree and save", cancelled: "Saving cancelled", unavailable: "Saving is unavailable. Please try again."
  },
  elements: {
    none: "None", wood: "Wood", fire: "Fire", earth: "Earth", metal: "Metal", water: "Water",
    noData: "No data yet", strong: "{{strong}} is stronger · {{weak}} needs balance", serverReady: "Your result has been calculated",
    empty: "No element data yet", balanced: "Current state: your element distribution is balanced.", recorded: "Birth time saved. View your element distribution.", radarTitle: "Element balance", radarSubtitle: "Live element distribution"
  },
  calendar: {
    title: "Cycle calendar", reminder: "Did your period start today?", emptyTitle: "No cycle records yet", emptyDesc: "Set up your cycle information to generate a predicted calendar.", setup: "Set up cycle",
    status: "Status:", remark: "Notes:", until: "Days until next period", day: "days", adjust: "Adjust cycle", clear: "Clear local cycle records",
    setupTitle: "Set up cycle", setupDesc: "Saved only on this device. After setup, the calendar and countdown appear here.", privacyTitle: "I understand the cycle-data notice",
    privacyDesc: "Cycle records are saved only on this device and are not uploaded to the server. They are not medical, diagnostic, contraceptive, fertility, or health advice. Clearing cache or uninstalling may lose them.",
    lastStart: "Last period start date", averageCycle: "Average cycle", periodLength: "Period length", example28: "e.g. 28", example5: "e.g. 5", saveView: "Save and view calendar",
    saved: "Cycle setup saved", privacyRequired: "Please acknowledge the cycle-data notice.", cannotAdjust: "This date cannot adjust the prediction.", adjusted: "Future cycles re-predicted"
  },
  legal: {
    back: "Back", agreeAndBack: "Agree and go back", privacyAccepted: "Privacy Policy accepted",
    agreementTitle: "User Agreement", agreementHeading: "Haimi Computing User Agreement", privacyTitle: "Privacy Policy", privacyHeading: "Haimi Computing Privacy Policy",
    meta: "Updated: 2026-06-27  |  Effective: 2026-06-27",
    agreementParagraphs: [
      "Haimi Computing is operated by Beijing Haimilai Technology Co., Ltd. Please read and understand this agreement and the Privacy Policy before using this Mini Program.",
      "This product provides lifestyle journaling, element-based entertainment references, and jewelry-style recommendations. Its content is not medical advice, diagnosis, contraception, fertility advice, health advice, or an efficacy claim.",
      "You must ensure that submitted information is truthful and lawful, and decide whether reference content is suitable for your circumstances. Consult a qualified professional for physical discomfort or health-management concerns.",
      "Users under 14 must use this product with a guardian's consent and guidance. This product is not actively provided to children and does not actively collect children's personal information.",
      "In Settings, you can log out, delete birth details and element results, clear local cycle records, withdraw consent, or delete your account.",
      "For support, email qq13238367306@163.com."
    ],
    privacyParagraphs: [
      "Operator: Beijing Haimilai Technology Co., Ltd. Contact: qq13238367306@163.com.",
      "We process WeChat account identifiers and login/session credentials for sign-in, account identification, and security authentication. openid and unionid are stored only on the server and are not returned for display in the Mini Program.",
      "If you choose account-password sign-in, we process an account name or email identifier. Passwords are stored only as irreversible hashes on the server and are never stored or returned in plaintext.",
      "Birth date, birth time, and gender are used for element calculations and jewelry-style recommendations. You can delete them in Settings; deletion clears local and server results.",
      "The mood, energy, sleep duration, jewelry-wearing status, tags, and notes you submit are used to create daily lifestyle entries and are stored on the server. You can update or delete your own entries, and other users cannot access them.",
      "Period start dates, cycle length, period duration, and prediction records are sensitive physiological-cycle records. They stay only on this device and are not uploaded, backed up, or synced. You can clear them at any time; uninstalling or clearing cache may lose them.",
      "Device window and status-bar information are used only for layout adaptation. Service logs are used only for security auditing and troubleshooting, retained for 180 days, and do not record secrets, login credentials, raw birth times, or cycle records.",
      "We do not collect phone numbers, WeChat nicknames or avatars, location, photos, camera, microphone, contacts, clipboard, address, or payment information.",
      "You may request access, correction, or deletion of personal information, withdraw consent, or delete your account. Requests to delete accounts, birth details, and element results are completed within 15 working days.",
      "Users under 14 must use this product with a guardian's consent and guidance. This product is not actively provided to children and does not actively collect children's personal information.",
      "Element, jewelry, and cycle content is only for lifestyle journaling, entertainment reference, and jewelry-style recommendations. It is not medical advice, diagnosis, contraception, fertility advice, health advice, or an efficacy claim."
    ]
  },
  cycle: {
    period: "Period", forecast: "Predicted period", ovulation: "Reference day", fertile: "Reference window", safe: "Other day",
    noPrediction: "No prediction yet", estimatedStart: "Estimated start: {{date}}", noRemark: "None",
    month: "{{month}}/{{year}}", fullDate: "{{month}}/{{day}}/{{year}}",
    weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  }
};

module.exports = { "zh-CN": zhCN, "en-US": enUS };
