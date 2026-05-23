import { defineConfig } from 'vitepress'
import { teekConfig } from "./teekConfig"
import mdCustomAttrs from "./plugins/mdCustomAttrs"

export default defineConfig({
    extends: teekConfig,
    title: "一乐过滤",
    vite: {
        server: {
            proxy: {
                '/api': {
                    target: 'https://api.filtereditor.cn/prod',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api/, ''),
                },
            },
        },
    },
    description: "一乐过滤 — Path of Exile 滤镜工具",
    cleanUrls: false,
    lastUpdated: true,
    lang: "zh-CN",
    head: [
        ["link", { rel: "icon", type: "image/png", href: "/logo.png" }],
        ["meta", { property: "og:type", content: "website" }],
        ["meta", { property: "og:locale", content: "zh-CN" }],
        ["meta", { property: "og:title", content: "一乐过滤" }],
        ["meta", { property: "og:site_name", content: "一乐过滤" }],
        // 引入图片灯箱js和css文件
        [
            'link',
            { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox.css' },
        ],
        [
            'script',
            { src: 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@4.0/dist/fancybox.umd.js' }
        ],
    ],
    markdown: {
        lineNumbers: true,
        config: (md) => {
            md.use(mdCustomAttrs)
        },
        image: {
            lazyLoading: true,
        },
        container: {
            tipLabel: "提示",
            warningLabel: "警告",
            dangerLabel: "危险",
            infoLabel: "信息",
            detailsLabel: "详细信息",
        },
    },
    themeConfig: {
        logo: "/logo.png",
        darkModeSwitchLabel: "主题",
        sidebarMenuLabel: "菜单",
        returnToTopLabel: "返回顶部",
        lastUpdatedText: "上次更新",
        editLink: {
            pattern: "https://github.com/JMY-2068/yl-doc/edit/main/docs/:path",
            text: "在 GitHub 上编辑此页面",
        },
        outline: {
            level: [2, 4],
            label: "本页导航",
        },
        docFooter: {
            prev: "上一页",
            next: "下一页",
        },
        notFound: {
            title: "页面未找到",
            quote: "你访问的页面不存在",
            linkLabel: "返回首页",
            linkText: "返回首页",
        },
        nav: [
            { text: "首页", link: "/" },
            { text: "过滤基础", link: "/base/intro", activeMatch: "/01.过滤基础/" },
            { text: "过滤编辑", link: "/edit/intro", activeMatch: "/02.过滤编辑/" },
            { text: "过滤语法", link: "/syntax/intro", activeMatch: "/03.过滤语法/" },
            { text: "过滤下载", link: "/download", activeMatch: "/04.过滤下载/" },
            {
                text: "相关链接",
                items: [
                    { text: "一乐过滤编辑网站", link: "https://edit.filtereditor.cn/" },
                    { text: "官方过滤语法文档", link: "https://poe.game.qq.com/item-filter/about" },
                ],
            },
            { text: "✨ 赞赏", link: "/personal/", activeMatch: "/personal" },
        ],
        socialLinks: [
            { icon: "github", link: "https://github.com/JMY-2068/yl-doc" },
        ],
        search: {
            provider: "local",
            options: {
                locales: {
                    root: {
                        translations: {
                            button: { buttonText: "搜索", buttonAriaLabel: "搜索" },
                            modal: {
                                noResultsText: "无法找到相关结果",
                                resetButtonTitle: "清除查询条件",
                                footer: { selectText: "选择", navigateText: "切换", closeText: "关闭" },
                            },
                        },
                    },
                },
            },
        },
    }
})
