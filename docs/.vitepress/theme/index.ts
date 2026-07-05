import Teek from "vitepress-theme-teek"
import "vitepress-theme-teek/index.css"
import "vitepress-theme-teek/theme-chalk/tk-doc-h1-gradient.css" // 一级标题渐变色
import "vitepress-theme-teek/theme-chalk/tk-sidebar.css" // 侧边栏优化
import "vitepress-theme-teek/theme-chalk/tk-aside.css" // 右侧目栏录文字悬停和激活样式
// import "vitepress-theme-teek/theme-chalk/tk-mark.css" // <mark></mark> 样式
import "vitepress-theme-teek/theme-chalk/tk-fade-up-animation.css" // 首次加载的动画效果
import "./styles/theme.css"
import "./styles/collapsed-sidebar.css"
import "./styles/extends/index.scss"

import NoticeContent from "./components/NoticeContent.vue"
import LayoutWrap from "./components/LayoutWrap.vue"
import SoundAuthors from "./components/SoundAuthors.vue"
import { h } from "vue"

export default {
    extends: Teek,
    Layout: () =>
        h(LayoutWrap, null, {
            default: () =>
                h(Teek.Layout, null, {
                    "teek-notice-content": () => h(NoticeContent)
                }),
        }),
    enhanceApp({ app }: { app: import('vue').App }) {
        app.component('SoundAuthors', SoundAuthors)
    },
}
