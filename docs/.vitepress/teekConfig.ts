import { defineTeekConfig } from "vitepress-theme-teek/config"
import { version } from "vitepress-theme-teek/es/version"
import mdCustomAttrs from "./plugins/mdCustomAttrs"

export const teekConfig = defineTeekConfig({
    teekHome: false,
    markdown: {
        config: (md) => {
            md.use(mdCustomAttrs)
        },
    },
    vpHome: true,
    sidebarTrigger: true,
    author: { name: "一乐", link: "https://www.caimogu.cc/user/1083041.html" },
    // 是否显示最近更新文章
    articleUpdate: {
        enabled: false,
    },
    // 图片预览
    articleAnalyze: {
        imageViewer: {
            enabled: false, // 是否启用图片查看器
            hideOnClickModal: true, // 是否可以通过点击遮罩层关闭预览
        },
    },
    // 风险链接
    riskLink: {
        enabled: true,
        whitelist: ["https://qm.qq.com", "https://edit.filtereditor.cn", "https://www.caimogu.cc", "https://github.com/JMY-2068", "https://space.bilibili.com/20940843","https://ug.9game.cn","https://poecurrency.top","https://v.douyin.com"],
    },
    // 右下角回到顶部配置
    backTop: {
        enabled: true, // 是否启动回到顶部功能
        content: "icon", // 回到顶部按钮的显示内容，可选配置 progress | icon
    },
    // 滚动到评论区配置
    toComment: {
        enabled: false, // 是否启动滚动到评论区功能
    },
    // 代码块配置
    codeBlock: {
        enabled: true, // 是否启用新版代码块
        collapseHeight: false, // 超出高度后自动折叠，设置 true 则默认折叠，false 则默认不折叠
        overlay: false, // 代码块底部是否显示展开/折叠遮罩层
        overlayHeight: 400, // 当出现遮罩层时，指定代码块显示高度，当 overlay 为 true 时生效
        langTextTransform: "uppercase", // 语言文本显示样式，为 text-transform 的值:none, capitalize, lowercase, uppercase
        copiedDone: TkMessage => TkMessage.success("复制成功！"), // 复制代码完成后的回调
    },
    // 文章分享配置
    articleShare: {
        enabled: true, // 是否开启文章链接分享功能
        text: "分享此页面", // 分享按钮文本
        copiedText: "链接已复制", // 复制成功文本
        query: false, // 是否包含查询参数
        hash: false, // 是否包含哈希值
    },
    // 主题增强配置，当开启后，右上角将有主题增强面板出现。
    themeEnhance: {
        enabled: true, // 启用主题增强功能
        position: "top", // 位置，top 为导航栏右侧，bottom 为右下角
        // 布局切换配置
        layoutSwitch: {
            disabled: true, // 禁用布局切换
            defaultMode: "original", // 布局切换的默认模式
            disableHelp: false, // 禁用帮助提示
            disableAnimation: false, // 禁用布局切换动画
            defaultDocMaxWidth: 85, // 内容布局最大宽度的默认百分比，仅限 0-100
            disableDocMaxWidthHelp: false, // 禁用帮助提示
            defaultPageMaxWidth: 95, // 页面布局最大宽度的默认百分比，仅限 0-100
            disablePageMaxWidthHelp: false, // 禁用帮助提示
        },
        // 布局主题色配置
        themeColor: {
            disabled: false, // 禁用布局主题色切换
            defaultColorName: "ep-yellow", // 布局默认主题色
            defaultSpread: false, // 是否将主题色扩散到其他元素（根据主题色计算其他元素需要的颜色）
            disableHelp: false, // 禁用帮助提示
            disabledInMobile: true, // 是否在移动端禁用
            // 主题色拓展
            append: [
                {
                    label: "扩展主题", // 主题组名称
                    tip: "扩展主题", // 主题组提示信息，鼠标悬停时显示
                    options: [
                        { label: "紫罗兰", value: "violet", color: "#7166f0" },
                        { label: "珊瑚粉", value: "coral-pink", color: "#ff6b6b" },
                        { label: "天空蓝", value: "sky-blue", color: "#00bbf9" },
                        { label: "皇家蓝", value: "royal-blue", color: "#2563EB" },
                        { label: "静谧黄", value: "silent-yellow", color: "#E8B576" },  
                        { label: "樱花粉", value: "pink", color: "#f15bb5" },
                        { label: "薄荷绿", value: "mint-green", color: "#10B981" },
                        { label: "落日橙", value: "orange-red", color: "#ff9e6b" },
                    ],
                },
            ],
        },
        // 聚光灯配置
        spotlight: {
            disabled: false, // 禁用聚光灯
            defaultStyle: "aside", //  聚光灯默认样式
            disableHelp: false, // 禁用帮助提示
            defaultValue: true, // 聚光灯默认开关状态
        },
    },
    // 公告配置
    notice: {
        enabled: true, // 是否启用公告功能
        title: "公告", // 公告标题，支持函数式：需要和国际化搭配使用，根据不同语言环境返回不同标题
        initOpen: true,
        duration: 0, // 弹框定时自动关闭，0 不自动消失
        mobileMinify: false, // 移动端自动最小化
        reopen: true,
        useStorage: true, // 是是否使用 localStorage 存储公告状态，如：当打开公告弹框后，下次进来则自动打开弹框
        twinkle: false, // 公告图标是否打开闪烁提示
        position: "center", // 公告弹框出现位置
    },
    // 站点信息卡片配置
    docAnalysis: {
        enabled: true, // 是否启用站点信息卡片
        createTime: "2025-06-01", // 站点创建时间
        wordCount: true, // 是否开启文章页的字数统计
        readingTime: true, // 是否开启文章页的阅读时长统计
        // 访问量、访客数统计配置
        statistics: {
            provider: "busuanzi", // 网站流量统计提供商
            siteView: true, // 是否开启首页的访问量和排名统计
            pageView: true, // 是否开启文章页的浏览量统计
            tryRequest: false, // 如果请求网站流量统计接口失败，是否重试
            tryCount: 5, // 重试次数，仅当 tryRequest 为 true 时有效
            tryIterationTime: 2000, // 重试间隔时间，单位：毫秒，仅当 tryRequest 为 true 时有效
            permalink: true, // 是否只统计永久链接的浏览量，如果为 false，则统计 VitePress 默认的文档目录链接
        },
        // 自定义现有信息
        overrideInfo: [
            {
                key: "lastActiveTime",
                label: "活跃时间",
                value: (_, currentValue) => (currentValue + "").replace("前", ""),
                show: true,
            },
        ],
        // 自定义额外信息
        appendInfo: [{ key: "index", label: "站点作者", value: "一乐" }],
    },
    // 社交信息配置，通常为一个社交图标，点击后将会跳转到社交软件的个人主页
    social: [
        {
            icon: "mingcute:qq-fill",
            name: "QQ",
            link: "https://qm.qq.com/cgi-bin/qm/qr?k=Vh2A8llzd6sbarwP_IQUoBw1LpmM1ob9",
        },
        {
            icon: "mdi:mushroom",
            name: "踩蘑菇论坛",
            link: "https://www.caimogu.cc/user/1083041.html",
        },
        {
            icon: "mingcute:bilibili-line",
            name: "哔哩哔哩",
            link: "https://space.bilibili.com/20940843",
        },
        {
            icon: "ic:baseline-tiktok",
            name: "抖音",
            link: "https://v.douyin.com/MFb7gqSe648/",
        },
        {
            icon: "mdi:github",
            name: "GitHub",
            link: "https://github.com/JMY-2068",
        },
    ],
    // 页脚配置
    footerInfo: {
        topMessage: "适合自己的过滤才是最好的过滤~",
        // 主题版权配置
        theme: {
            name: `Theme By Teek@${version}`,
        },
        // 博客版权配置
        copyright: {
            createYear: 2025,
            suffix: "一乐过滤",
        },
        // ICP 备案信息配置
        icpRecord: {
            name: "苏ICP备2021052248号-2",
            link: "http://beian.miit.gov.cn/",
        },
    },
})
