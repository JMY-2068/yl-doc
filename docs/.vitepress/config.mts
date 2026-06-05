import { defineConfig } from 'vitepress'
import { teekConfig } from "./teekConfig"

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
        ["link", { rel: "icon", type: "image/webp", href: "/logo.webp" }],
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
        logo: "/logo.webp",
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
            { text: "过滤教程", items: [
                { text: "过滤使用教程", link: "/base/intro", activeMatch: "/01.过滤基础/" },
                { text: "过滤编辑教程", link: "/edit/intro", activeMatch: "/02.过滤编辑/" },
                { text: "过滤语法教程", link: "/syntax/intro", activeMatch: "/03.过滤语法/" },
            ]},
            { text: "过滤工具", link: "/tool/web-edit", activeMatch: "/07.过滤工具/" },
            { text: "过滤下载", link: "/download", activeMatch: "/04.过滤下载/" },
            { text: "过滤音效", link: "/sound", activeMatch: "/05.过滤音效/" },
            { text: "POE网址导航", link: "/guide", activeMatch: "/06.POE网址导航/" },
            { text: "✨ 赞赏", link: "/personal/", activeMatch: "/personal" },
        ],
        socialLinks: [
            { icon: "github", link: "https://github.com/JMY-2068/yl-doc" },
            {
                icon: {
                    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE --><path fill="currentColor" d="M12 2a10 10 0 0 1 10 10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2A10 10 0 0 1 12 2m0 6a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m5 4a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2M7 12a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m8 3l1.27 4.45l.08.55c0 1.1-.9 2-2 2h-4.7a2 2 0 0 1-2-2l.08-.55L9 15z"/></svg>'
                },
                link: "https://www.caimogu.cc/user/1083041.html"
            },
            {
                icon: {
                    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from MingCute Icon by MingCute Design - https://github.com/Richard9394/MingCute/blob/main/LICENSE --><g fill="none" fill-rule="evenodd"><path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M6.445 3.168a1 1 0 0 1 1.387.277L9.535 6h4.93l1.703-2.555a1 1 0 0 1 1.664 1.11L16.87 6H18a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-7a4 4 0 0 1 4-4h1.131l-.963-1.445a1 1 0 0 1 .277-1.387M8.986 8H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2H9.016zM9 11a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1m6 0a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1"/></g></svg>'
                },
                link: "https://space.bilibili.com/20940843"
            },
            {
                icon: {
                    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from MingCute Icon by MingCute Design - https://github.com/Richard9394/MingCute/blob/main/LICENSE --><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M12 2a6.285 6.285 0 0 0-6.276 5.937l-.146 2.63a28 28 0 0 0-.615 1.41c-1.24 3.073-1.728 5.773-1.088 6.032c.335.135.913-.426 1.566-1.432a6.67 6.67 0 0 0 1.968 3.593c-1.027.35-1.91.828-1.91 1.33c0 .509 2.48.503 4.239.5h.001c.549-.002 1.01-.008 1.38-.057a6.7 6.7 0 0 0 1.76 0c.37.05.833.055 1.382.056c1.76.004 4.239.01 4.239-.499c0-.502-.883-.979-1.909-1.33a6.67 6.67 0 0 0 1.967-3.586c.65 1.002 1.227 1.56 1.56 1.425c.64-.259.154-2.96-1.088-6.032a28 28 0 0 0-.607-1.395l-.147-2.645A6.285 6.285 0 0 0 12 2"/></g></svg>'
                },
                link: "https://qm.qq.com/cgi-bin/qm/qr?k=Vh2A8llzd6sbarwP_IQUoBw1LpmM1ob9"
            },
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
