<template>
    <div ref="root" class="yl-act4">
        <!-- 文案横排在上：左标题块 + 右卖点 -->
        <div class="yl-act4__head">
            <div class="yl-act4__head-main">
                <p class="yl-act__kicker" data-rise>功能长廊 · ACT 04 / 05</p>
                <h3 class="yl-act__title" data-rise style="--d: 0.06s">装备规划，T级精准操控<span class="yl-act__badge">POE2</span></h3>
                <p class="yl-act4__desc" data-rise style="--d: 0.12s">
                    装备规划器——黄蓝装基底手动分 T1/T2/T3，防具按防御属性分列降序——档位标准由你定。
                </p>
            </div>
            <ul class="yl-act4__points">
                <li v-for="(s, i) in listCopy" :key="i" data-rise :style="{ '--d': 0.18 + i * 0.07 + 's' }">
                    <span class="yl-act__num">{{ String(i + 1).padStart(2, "0") }}</span>
                    <span>{{ s }}</span>
                </li>
            </ul>
        </div>

        <!-- 演示面板全宽在下：mini 版装备规划器（顶层规划 tab 同编辑器，黄蓝装内三视图切换） -->
        <div ref="panel" class="yl-panel yl-eq" data-rise style="--d: 0.14s">
            <div class="yl-panel__head">
                <span class="yl-panel__dots" aria-hidden="true"><i /><i /><i /></span>
                <span class="yl-panel__title">装备规划器 · {{ actTab }}</span>
            </div>

            <!-- 顶层：规划器 tab（同编辑器三 tab，暗金装规划待做） -->
            <div class="yl-eq__tabs" data-rise style="--d: 0.16s">
                <button
                    v-for="t in TABS"
                    :key="t"
                    type="button"
                    :class="{ 'is-on': actTab === t }"
                    @click="actTab = t"
                >{{ t }}</button>
            </div>

            <!-- 黄蓝装规划：三视图（已分级 / 快速分级·武器 / 快速分级·防具） -->
            <template v-if="actTab === '黄蓝装规划'">
            <!-- 视图切换 -->
            <div class="yl-eq__views" data-rise style="--d: 0.2s">
                <button
                    v-for="v in VIEWS"
                    :key="v.key"
                    type="button"
                    :class="{ 'is-on': view === v.key }"
                    @click="view = v.key"
                >{{ v.label }}</button>
            </div>

            <!-- 视图一：已分级（T1/T2/T3 三列汇总） -->
            <div v-if="view === 'graded'" class="yl-eq__graded" data-rise style="--d: 0.22s">
                <div v-for="t in ([1, 2, 3] as const)" :key="t" class="yl-eq__zone" :class="'is-t' + t">
                    <div class="yl-eq__zone-head">
                        <span class="yl-eq__zone-title">T{{ t }}</span>
                        <span class="yl-eq__zone-count">{{ tierOf(t).length }}</span>
                    </div>
                    <div class="yl-eq__zone-body">
                        <template v-if="tierOf(t).length > 0">
                            <div v-for="it in tierOf(t)" :key="it.value" class="yl-eq__chip" :class="'is-t' + t">
                                <img v-if="!failedIcons.has(it.value)" :src="iconUrl(it)" :alt="it.label" loading="lazy" @error="failedIcons.add(it.value)">
                                <span>{{ it.label }}</span>
                                <button type="button" class="yl-eq__chip-x" aria-label="移出分级" @click="remove(it.value)">×</button>
                            </div>
                        </template>
                        <p v-else class="yl-eq__zone-empty">暂无基底，去快速分级添加</p>
                    </div>
                </div>
            </div>

            <!-- 视图二/三：快速分级（笔刷 + 点基底分档，实时联动已分级） -->
            <template v-else>
                <div class="yl-eq__brush" data-rise style="--d: 0.22s">
                    <div class="yl-eq__brush-btns">
                        <button
                            v-for="t in ([1, 2, 3] as const)"
                            :key="t"
                            type="button"
                            class="yl-eq__brush-btn"
                            :class="{ 'is-on': brush === t }"
                            @click="brush = t"
                        >T{{ t }}</button>
                    </div>
                    <span class="yl-eq__brush-tip">选中档位后点击基底分入该档，再点一次取消；点击已分入其它档的基底会改档</span>
                    <span class="yl-eq__brush-count">
                        <span class="yl-eq__brush-count-label">已分:</span>
                        <span v-for="t in ([1, 2, 3] as const)" :key="t" class="yl-eq__brush-badge" :class="'is-t' + t">T{{ t }} {{ tierOf(t).length }}</span>
                    </span>
                </div>

                <!-- 快速分级 · 武器：卡片平铺（按需求等级降序，图标 + 属性短标签） -->
                <div v-if="view === 'weapon'" class="yl-eq__cards" data-rise style="--d: 0.26s">
                    <button
                        v-for="it in bows"
                        :key="it.value"
                        type="button"
                        class="yl-eq__card"
                        :class="cardCls(it.value)"
                        @click="toggle(it.value)"
                    >
                        <span class="yl-eq__card-top">
                            <img v-if="!failedIcons.has(it.value)" :src="iconUrl(it)" :alt="it.label" loading="lazy" @error="failedIcons.add(it.value)">
                            <span v-else class="yl-eq__card-imgfall"></span>
                            <span class="yl-eq__card-name">
                                <b>{{ it.label }}</b>
                                <i>{{ it.value }}</i>
                            </span>
                            <span class="yl-eq__card-check" :class="{ 'is-on': tierMap.get(it.value) === brush }"></span>
                        </span>
                        <span class="yl-eq__card-stats">
                            <span class="is-lv">Lv.{{ it.level }}</span>
                            <span>物伤 <b>{{ it.pd }}</b></span>
                            <span>攻速 <b>{{ it.aps }}</b></span>
                            <span>暴击 <b>{{ it.crit }}</b></span>
                        </span>
                    </button>
                </div>

                <!-- 快速分级 · 防具：分列视图（按防御属性分列，列内从高到低） -->
                <div v-else class="yl-eq__cols" data-rise style="--d: 0.26s">
                    <div v-for="col in armourCols" :key="col.label" class="yl-eq__col">
                        <div class="yl-eq__col-head">
                            <span v-for="seg in col.labelSegments" :key="seg.text" :style="seg.color ? { color: seg.color } : undefined">{{ seg.text }}</span>
                            <i>{{ col.items.length }}</i>
                        </div>
                        <div class="yl-eq__col-body">
                            <button
                                v-for="row in col.items"
                                :key="row.value"
                                type="button"
                                class="yl-eq__row"
                                :class="rowCls(row.value)"
                                @click="toggle(row.value)"
                            >
                                <span class="yl-eq__row-check" :class="{ 'is-on': tierMap.get(row.value) === brush }"></span>
                                <span class="yl-eq__row-name">{{ row.label }}</span>
                                <span class="yl-eq__row-val">{{ row.sortVal }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </template>
            </template>

            <!-- 白装规划：物价门槛填充（左物价列表 + 右块，mini 版核心交互） -->
            <div v-else-if="actTab === '白装规划'" class="yl-eq__white" data-rise style="--d: 0.2s">
                <!-- 头部行：DE 比 + 门槛按钮 + 追加/重置 -->
                <div class="yl-eq__whead">
                    <span class="yl-eq__ratio">国服当前DE比: <b>148</b><i>示例</i></span>
                    <div class="yl-eq__tholds">
                        <button
                            v-for="t in THRESHOLDS"
                            :key="t"
                            type="button"
                            :class="{ 'is-on': threshold === t }"
                            @click="threshold = threshold === t ? null : t"
                        >≥{{ t }}E</button>
                    </div>
                    <span class="yl-eq__thold-tip">选门槛后列表高亮命中基底，追加进当前选中块</span>
                    <div class="yl-eq__wacts">
                        <button type="button" class="yl-eq__wbtn is-main" :disabled="!canAppend" @click="appendFill">追加到「{{ activeWBlock.key }}」</button>
                        <button type="button" class="yl-eq__wbtn" @click="resetWhite">重置</button>
                    </div>
                </div>

                <div class="yl-eq__wbody">
                    <!-- 左：物价列表（原序固定，命中高亮、已收录绿点） -->
                    <div class="yl-eq__wlist">
                        <div
                            v-for="it in whiteItems"
                            :key="it.value"
                            class="yl-eq__wrow"
                            :class="{ 'is-hit': fillHits.has(it.value), 'is-inblock': whiteBlocks[activeWBlock.key].includes(it.value) }"
                        >
                            <img v-if="!failedIcons.has(it.value)" :src="ICON_BASE + it.icon" :alt="it.label" loading="lazy" @error="failedIcons.add(it.value)">
                            <span class="yl-eq__wname">
                                <b>{{ it.label }}</b>
                                <i v-if="it.sockets > 0" :class="it.sockets === 3 ? 'is-s3' : 'is-s2'">{{ it.sockets }}孔</i>
                            </span>
                            <span v-if="whiteBlocks[activeWBlock.key].includes(it.value)" class="yl-eq__wdot" aria-label="已收录"></span>
                            <span class="yl-eq__wval">{{ it.price }}<i>E</i></span>
                        </div>
                    </div>

                    <!-- 右：白装块（点选编辑目标，追加进此处） -->
                    <div class="yl-eq__wblocks">
                        <button
                            v-for="b in WHITE_BLOCKS"
                            :key="b.key"
                            type="button"
                            class="yl-eq__wblock"
                            :class="{ 'is-on': activeWBlock.key === b.key }"
                            @click="activeWBlock = b"
                        >
                            <span class="yl-eq__wblock-head">
                                <b>{{ b.key }}</b>
                                <i>{{ whiteBlocks[b.key].length }}</i>
                            </span>
                            <span class="yl-eq__wblock-body">
                                <span v-for="v in whiteBlocks[b.key]" :key="v" class="yl-eq__wchip">{{ whiteByValue.get(v)?.label ?? v }}</span>
                                <span v-if="whiteBlocks[b.key].length === 0" class="yl-eq__wempty">空块 · 追加后写入</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- 暗金装规划：门槛分档（ninja 物价，T0 单一基底只读区） -->
            <div v-else-if="actTab === '暗金装规划'" class="yl-eq__white" data-rise style="--d: 0.2s">
                <div class="yl-eq__whead">
                    <span class="yl-eq__ratio">国际服当前DE比: <b>152</b><i>示例</i></span>
                    <div class="yl-eq__tholds">
                        <button
                            v-for="(p, i) in U_PLANS"
                            :key="i"
                            type="button"
                            :class="{ 'is-on': uPlan === i }"
                            @click="uPlan = i"
                        >T1≥{{ p.t1 }} / T2≥{{ p.t2 }} / T3≥{{ p.t3 }}</button>
                    </div>
                    <span class="yl-eq__thold-tip">选门槛组合，按 ninja 物价自动分档</span>
                    <div class="yl-eq__wacts">
                        <button type="button" class="yl-eq__wbtn is-main" @click="uSorted = !uSorted">{{ uSorted ? "恢复原序" : "按物价排序" }}</button>
                        <button type="button" class="yl-eq__wbtn" @click="resetUnique">重置</button>
                    </div>
                </div>

                <div class="yl-eq__wbody yl-eq__wbody--u">
                    <!-- 左：暗金物价列表（原序固定） -->
                    <div class="yl-eq__wlist">
                        <div v-for="it in uniqueItems" :key="it.name" class="yl-eq__wrow">
                            <img v-if="it.icon && !failedIcons.has(it.name)" :src="ICON_BASE + it.icon" :alt="it.name" loading="lazy" @error="failedIcons.add(it.name)">
                            <span class="yl-eq__wname">
                                <b>{{ it.name }}</b>
                                <i>{{ it.base }}</i>
                            </span>
                            <span class="yl-eq__wval">{{ it.price }}<i>E</i></span>
                        </div>
                    </div>

                    <!-- 右：分档结果（T0 只读 + T1/T2/T3 门槛组） -->
                    <div class="yl-eq__utiers">
                        <div class="yl-eq__t0">
                            <div class="yl-eq__t0-head">
                                <span class="yl-eq__t0-label">T0</span>
                                <span class="yl-eq__t0-title">单一基底暗金 · 价值可精确确定</span>
                            </div>
                            <div class="yl-eq__t0-body">
                                <span v-for="it in uniqueItems.filter(x => x.single)" :key="it.name" class="yl-eq__uchip is-t0">{{ it.name }} <i>{{ it.price }}E</i></span>
                            </div>
                            <p class="yl-eq__t0-note">自动写入「超高价值」过滤块，配超级传奇音效</p>
                        </div>

                        <template v-if="!uSorted">
                            <div class="yl-eq__uempty">点击「按物价排序」，按所选门槛组合生成分档</div>
                        </template>
                        <template v-else>
                            <div
                                v-for="(g, gi) in uTierGroups"
                                :key="g.tier"
                                class="yl-eq__utgroup"
                                :style="{ animationDelay: gi * 0.12 + 's' }"
                            >
                                <span class="yl-eq__utlabel" :class="'is-t' + g.tier">T{{ g.tier }}</span>
                                <span v-for="it in g.items" :key="it.name" class="yl-eq__uchip" :class="'is-t' + g.tier">{{ it.name }} <i>{{ it.price }}E</i></span>
                            </div>
                            <p class="yl-eq__uleft">其余暗金进「剩余全部传奇」过滤块</p>
                        </template>
                    </div>
                </div>
            </div>

            <div class="yl-eq__foot" data-rise style="--d: 0.3s">
                <span class="yl-eq__foot-note">{{ footNote }}</span>
            </div>
        </div>

        <!-- 编辑器实际界面：五张截图（黄蓝装 / 白装 / 暗金，按 tab 顺序排列） -->
        <div class="yl-eq__shots" data-rise style="--d: 0.36s">
            <ShotThumb src="/assets/index/装备规划器1.webp" alt="编辑器黄蓝装规划已分级界面" caption="编辑器实际界面 · 黄蓝装规划（已分级）" pos="50% 55%" />
            <ShotThumb src="/assets/index/装备规划器2.webp" alt="编辑器黄蓝装规划快速分级界面" caption="编辑器实际界面 · 黄蓝装规划（快速分级）" pos="50% 18%" />
            <ShotThumb src="/assets/index/装备规划器4.webp" alt="编辑器白装规划界面" caption="编辑器实际界面 · 白装规划" pos="50% 45%" />
            <ShotThumb src="/assets/index/装备规划器3.webp" alt="编辑器暗金装规划界面" caption="编辑器实际界面 · 暗金装规划" pos="50% 50%" />
            <ShotThumb src="/assets/index/装备规划器5.webp" alt="编辑器暗金装规划分档编辑界面" caption="编辑器实际界面 · 暗金装规划（分档编辑）" pos="50% 22%" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import { armours, bows } from "./equip-data"
import ShotThumb from "./ShotThumb.vue"

// 第四幕：装备规划器（POE2）——mini 版黄蓝装规划，复刻编辑器三视图交互
// 数据为全量真实基底（equip-data.ts：弓 25 条 / 胸甲 136 条按 7 防御组分列）
// 图标走 edit.filtereditor.cn 在线直链（同第一幕策略），加载失败自动隐藏

const ICON_BASE = "https://edit.filtereditor.cn"

// 防御组列头：护甲红 / 闪避绿 / 护盾蓝（同编辑器 defenseLabelSegments 配色）
// 展示 4 列（3 纯 + 1 混合代表）；equip-data.ts 保留全量 7 组分组，只挑这几组展示
const SHOWN_GROUPS: { group: number, labelSegments: { text: string, color?: string }[] }[] = [
    { group: 0, labelSegments: [{ text: "纯" }, { text: "护甲", color: "#FF2800" }] },
    { group: 1, labelSegments: [{ text: "纯" }, { text: "闪避", color: "#42B883" }] },
    { group: 2, labelSegments: [{ text: "纯" }, { text: "护盾", color: "#409EFF" }] },
    { group: 4, labelSegments: [{ text: "护甲", color: "#FF2800" }, { text: "&" }, { text: "闪避", color: "#42B883" }] },
]

const listCopy = [
    "黄蓝装基底手动分档，识别更精准",
    "防具按防御属性分列降序，高底子一眼挑出",
    "黄装、蓝装同步写入，全阶级块一键应用",
    "配置导入导出，赛季迁移不重配",
]

const VIEWS = [
    { key: "graded", label: "已分级" },
    { key: "weapon", label: "快速分级 · 武器" },
    { key: "armour", label: "快速分级 · 防具" },
] as const
type ViewKey = typeof VIEWS[number]["key"]

// 顶层规划 tab（同编辑器：黄蓝装规划 / 白装规划 / 暗金装规划）
const TABS = ["黄蓝装规划", "白装规划", "暗金装规划"] as const
const actTab = ref<(typeof TABS)[number]>("黄蓝装规划")

// 底注按 tab 切换
const footNote = computed(() => {
    if (actTab.value === "黄蓝装规划")
        return "真实基底数据（POE2 弓 / 胸甲全量）· 点击基底体验分级，切换视图查看汇总"
    if (actTab.value === "白装规划")
        return "示例数据 · 选块、选门槛、追加，体验白装物价填充（多孔块自动按孔数过滤）"
    return "示例数据 · ninja 物价排序（国际服），门槛可调、分档实时重算"
})

const root = ref<HTMLElement>()
const view = ref<ViewKey>("graded")
const brush = ref<1 | 2 | 3>(1)

// 分级状态（value -> 档位唯一数据源；初始预置少量分级，同从过滤读出的真实使用态）
// 预置口径：T1 = 三把高阶弓 + 各防具组榜首；T2/T3 = 防具各展示组降序第 2/3 名
const grade = reactive<{ t1: string[], t2: string[], t3: string[] }>({
    t1: ["Obliterator Bow", "Warmonger Bow", "Gemini Bow", "Soldier Cuirass", "Slipstrike Vest", "Vile Robe"],
    t2: ["Conqueror Plate", "Exquisite Vest", "Flowing Raiment", "Dastard Armour"],
    t3: ["Ornate Plate", "Armoured Vest", "Sacramental Robe", "Heroic Armour"],
})

const failedIcons = reactive(new Set<string>())

const allItems = [...bows, ...armours]
const byValue = new Map(allItems.map(it => [it.value, it]))

const tierMap = computed(() => {
    const map = new Map<string, 1 | 2 | 3>()
    for (const key of ["t1", "t2", "t3"] as const) {
        for (const value of grade[key])
            map.set(value, Number(key[1]) as 1 | 2 | 3)
    }
    return map
})

function tierOf(t: 1 | 2 | 3) {
    return grade[`t${t}` as "t1" | "t2" | "t3"].map(v => byValue.get(v)).filter(Boolean) as { label: string, value: string, icon: string }[]
}

// 防具分列（按展示组挑列，组内已按 sortVal 降序排好，切列不受分级影响）
const armourCols = SHOWN_GROUPS.map(g => ({
    labelSegments: g.labelSegments,
    items: armours.filter(it => it.group === g.group).sort((a, b) => b.sortVal - a.sortVal),
}))

function iconUrl(it: { icon: string }) {
    return ICON_BASE + it.icon
}

function cardCls(value: string) {
    const t = tierMap.value.get(value)
    return t ? `is-t${t}` : ""
}

function rowCls(value: string) {
    const t = tierMap.value.get(value)
    return t ? `is-t${t}` : ""
}

// 点击基底：已分当前档取消，未分/他档分入当前笔刷档（同编辑器笔刷交互）
function toggle(value: string) {
    const cur = tierMap.value.get(value)
    const key = `t${brush.value}` as "t1" | "t2" | "t3"
    for (const k of ["t1", "t2", "t3"] as const)
        grade[k] = grade[k].filter(v => v !== value)
    if (cur !== brush.value)
        grade[key].push(value)
}

function remove(value: string) {
    for (const k of ["t1", "t2", "t3"] as const)
        grade[k] = grade[k].filter(v => v !== value)
}

// ==================== 白装规划：物价门槛填充（mini 版） ====================

// 物价列表：基底名/图标真实（75+ 顶段基底跨 12 类目），价格/孔数为示例值
interface WhiteItem {
    label: string
    value: string
    icon: string
    price: number
    sockets: number // 0=无孔位概念，2/3=卓越多孔
}

const whiteItems: WhiteItem[] = [
    { label: "乌扎尔胸甲", value: "Utzaal Cuirass", icon: "/images/equipment/435f61469c5a.webp", price: 32, sockets: 3 },
    { label: "瓦尔护手", value: "Vaal Mitts", icon: "/images/equipment/94de7866a441.webp", price: 18, sockets: 2 },
    { label: "瓦尔胫甲", value: "Vaal Greaves", icon: "/images/equipment/c7b81c67e88c.webp", price: 12, sockets: 2 },
    { label: "典范巨盔", value: "Paragon Greathelm", icon: "/images/equipment/7c75ce370965.webp", price: 65, sockets: 3 },
    { label: "守护者之弓", value: "Guardian Bow", icon: "/images/equipment/92d0c522df32.webp", price: 8, sockets: 2 },
    { label: "弯曲战弩", value: "Flexed Crossbow", icon: "/images/equipment/c6a48fb92727.webp", price: 5, sockets: 2 },
    { label: "瓦尔塔盾", value: "Vaal Tower Shield", icon: "/images/equipment/a503c632c995.webp", price: 120, sockets: 3 },
    { label: "永霜法杖", value: "Permafrost Staff", icon: "/images/equipment/da3c806e589e.webp", price: 45, sockets: 3 },
    { label: "潜行战矛", value: "Stalking Spear", icon: "/images/equipment/eaab87ccfc4c.webp", price: 15, sockets: 2 },
    { label: "打击节杖", value: "Striking Quarterstaff", icon: "/images/equipment/7502dd0e69ce.webp", price: 3, sockets: 0 },
    { label: "圣洁法器", value: "Sacred Focus", icon: "/images/equipment/f31d5ac6c74c.webp", price: 9, sockets: 0 },
    { label: "远古轻盾", value: "Ancient Buckler", icon: "/images/equipment/a5f5cb40029f.webp", price: 2, sockets: 0 },
]

const whiteByValue = new Map(whiteItems.map(it => [it.value, it]))

// 门槛按钮档位（演示用预设，编辑器里是自由输入）
const THRESHOLDS = [5, 20, 60] as const

// 白装块（真实块名：白装底子 82白 + 多孔 3孔T1/3孔T2）；多孔块追加时自动按孔数过滤（同编辑器）
const WHITE_BLOCKS = [
    { key: "82白", sockets: 0 },
    { key: "3孔T1", sockets: 3 },
    { key: "3孔T2", sockets: 3 },
] as const

const WBLOCK_INIT: Record<string, string[]> = {
    "82白": ["Utzaal Cuirass"],
    "3孔T1": [],
    "3孔T2": [],
}

const whiteBlocks = ref<Record<string, string[]>>({ "82白": ["Utzaal Cuirass"], "3孔T1": [], "3孔T2": [] })
const activeWBlock = ref<(typeof WHITE_BLOCKS)[number]>(WHITE_BLOCKS[0])
const threshold = ref<number | null>(null)

// 门槛命中池：价格过线；当前选中多孔块时自动只收对应孔数（同编辑器 fillPool 行为）
const fillPool = computed(() => {
    if (threshold.value == null)
        return [] as WhiteItem[]
    let pool = whiteItems.filter(it => it.price >= threshold.value)
    if (activeWBlock.value.sockets > 0)
        pool = pool.filter(it => it.sockets === activeWBlock.value.sockets)
    return pool
})

// 高亮预览：命中且未收录（已收录显示绿点不再高亮，同编辑器 fillHitValues）
const fillHits = computed(() => {
    const existing = new Set(whiteBlocks.value[activeWBlock.value.key] ?? [])
    return new Set(fillPool.value.filter(it => !existing.has(it.value)).map(it => it.value))
})

const canAppend = computed(() => threshold.value != null && fillHits.value.size > 0)

// 追加：命中未收录项并入当前块（去重合并不覆盖，同编辑器）
function appendFill() {
    const key = activeWBlock.value.key
    const existing = whiteBlocks.value[key] ?? []
    whiteBlocks.value[key] = [...existing, ...fillHits.value]
}

function resetWhite() {
    whiteBlocks.value = Object.fromEntries(Object.entries(WBLOCK_INIT).map(([k, v]) => [k, [...v]]))
    threshold.value = null
}

// ==================== 暗金装规划：ninja 门槛分档（mini 版） ====================

// 暗金名/基底名真实（传奇装备.json，text 拆分），价格为示例值；single=单一基底（该基底仅一个暗金，价值可精确确定，T0 规则）
interface UniqueItem {
    name: string
    base: string
    icon: string
    price: number
    single: boolean
}

const uniqueItems: UniqueItem[] = [
    { name: "库勒马克之握", base: "深渊印戒", icon: "/images/equipment/a955f250aad8.webp", price: 480, single: true },
    { name: "脆弱的诗文", base: "月影项链", icon: "/images/equipment/ef86c89e27f9.webp", price: 210, single: true },
    { name: "腐朽迸发", base: "潜能之戒", icon: "/images/equipment/e542237b1c75.webp", price: 96, single: true },
    { name: "均衡之符", base: "星辉项链", icon: "/images/equipment/c3154ff47552.webp", price: 120, single: false },
    { name: "贪欲之记", base: "金光戒指", icon: "/images/equipment/bc5d79967338.webp", price: 90, single: false },
    { name: "猎首", base: "重革腰带", icon: "/images/equipment/ae906af5295d.webp", price: 300, single: false },
    { name: "阿吉斯的道标", base: "日曜项链", icon: "/images/equipment/db7be09ead71.webp", price: 40, single: false },
    { name: "贝雷克的冰与雷之曲", base: "双玉戒指", icon: "/images/equipment/a955f250aad8.webp", price: 25, single: false },
    { name: "天赋扣带", base: "宽大腰带", icon: "/images/equipment/2b39e466c27d.webp", price: 12, single: false },
    { name: "黑焰", base: "紫晶戒指", icon: "/images/equipment/10c99450538f.webp", price: 8, single: false },
    { name: "沸腾桎梏", base: "红玉戒指", icon: "/images/equipment/3264f16d77f2.webp", price: 3, single: false },
    { name: "幽暗之语", base: "锻铁戒指", icon: "/images/equipment/a955f250aad8.webp", price: 0.5, single: false },
]

// 门槛组合预设（编辑器为三档自由输入，演示给两组组合）
const U_PLANS = [
    { t1: 50, t2: 15, t3: 5 },
    { t1: 100, t2: 30, t3: 10 },
] as const

const uPlan = ref(0)
const uSorted = ref(false)

// 门槛分档（价格降序不参与——直接按阈值归档；单一基底走 T0 不进组；已排序时切组合实时重算）
const uTierGroups = computed(() => {
    if (!uSorted.value)
        return []
    const plan = U_PLANS[uPlan.value]
    const groups: { tier: number, items: UniqueItem[] }[] = [
        { tier: 1, items: [] },
        { tier: 2, items: [] },
        { tier: 3, items: [] },
    ]
    for (const it of uniqueItems) {
        if (it.single)
            continue
        if (it.price >= plan.t1)
            groups[0].items.push(it)
        else if (it.price >= plan.t2)
            groups[1].items.push(it)
        else if (it.price >= plan.t3)
            groups[2].items.push(it)
    }
    return groups.filter(g => g.items.length > 0)
})

function resetUnique() {
    uPlan.value = 0
    uSorted.value = false
}

let io: IntersectionObserver | undefined
let riseFallback: ReturnType<typeof setTimeout> | undefined

function riseIn() {
    root.value?.classList.add("is-in")
}

onMounted(() => {
    if (!root.value) return
    root.value.classList.add("js-anim")
    io = new IntersectionObserver(
        (entries) => {
            if (entries.some(e => e.isIntersecting)) {
                // 双 rAF：先让隐藏初始态绘制一帧再触发过渡，修复"载入时已在视口内→无动画直接显示"
                requestAnimationFrame(() => requestAnimationFrame(riseIn))
                io?.disconnect()
            }
        },
        { threshold: 0.25 },
    )
    io.observe(root.value)
    // 兜底：仅在元素已进入视口却未收到 IO 回调时补触发，避免加载数秒后在屏幕外提前播完动画
    riseFallback = setTimeout(() => {
        const el = root.value
        if (el && !el.classList.contains("is-in")) {
            const r = el.getBoundingClientRect()
            if (r.top < innerHeight && r.bottom > 0) riseIn()
        }
    }, 3000)
})

onBeforeUnmount(() => {
    io?.disconnect()
    if (riseFallback) clearTimeout(riseFallback)
})
</script>

<style scoped lang="scss">
.yl-act4 {
    width: min(var(--yl-container), 100%);
    margin-inline: auto;
    box-sizing: border-box;
    padding-inline: var(--yl-space-content);
    margin-top: clamp(64px, 9vh, 120px);
    padding-top: clamp(48px, 7vh, 88px);
    border-top: 1px dashed var(--yl-border);
}

/* —— 入场：淡入 + 上浮（对齐各幕 data-rise 体系） —— */
.yl-act4.js-anim [data-rise] {
    opacity: 0;
    transform: translateY(24px);
}

.yl-act4.js-anim.is-in [data-rise] {
    opacity: 1;
    transform: none;
    /* 注意：本站构建管线会吃掉 transition 简写里的 var()，必须拆成 longhand */
    transition-property: opacity, transform;
    transition-duration: 0.65s;
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: var(--d, 0s);
}

/* —— 文案横排在上：左标题块 / 右卖点 2x2 —— */
.yl-act4__head {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 4fr);
    gap: clamp(28px, 4vw, 56px);
    align-items: end;
    margin-bottom: clamp(28px, 4vh, 44px);
}

.yl-act4__head-main {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.yl-act__kicker {
    font-family: var(--yl-font-mono);
    font-size: 13px;
    letter-spacing: 0.22em;
    color: var(--yl-gold);
}

.yl-act__title {
    position: relative;
    width: fit-content; /* 收缩到文字宽度，徽标挂在文字右外侧，不占标题行宽 */
    font-family: var(--yl-font-display);
    font-weight: 900;
    font-size: clamp(26px, 3.4vw, 38px);
    color: var(--yl-text-primary);
}

/* 版本专属徽标：标题末字右上方（列间隙内，本幕 POE2 专属）；移动端回退为行内 */
.yl-act__badge {
    position: absolute;
    top: -4px;
    right: -58px;
    font-family: var(--yl-font-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    line-height: 1.6;
    color: var(--yl-gold-bright);
    border: 1px solid var(--yl-border-strong);
    background: rgba(232, 162, 60, 0.08);
    border-radius: var(--yl-radius-sm);
    padding: 2px 7px;
    white-space: nowrap;
}

.yl-act4__desc {
    max-width: 520px;
    line-height: 1.8;
    color: var(--yl-text-secondary);
}

.yl-act4__points {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 22px;

    li {
        display: flex;
        gap: 12px;
        align-items: baseline;
        font-size: 14px;
        line-height: 1.7;
        color: var(--yl-text-primary);
    }
}

.yl-act__num {
    font-family: var(--yl-font-mono);
    font-size: 13px;
    color: var(--yl-gold);
}

/* —— 面板外壳 —— */
.yl-panel {
    background: var(--yl-bg-elevated);
    border: 1px solid var(--yl-border-plain);
    border-radius: var(--yl-radius-lg);
    padding: 16px 20px 18px;
    box-shadow: 0 0 32px rgba(0, 0, 0, 0.35);
    text-align: left;
}

.yl-panel__head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 13px;
    border-bottom: 1px solid var(--yl-border-plain);
    margin-bottom: 12px;
}

.yl-panel__dots {
    display: flex;
    gap: 5px;

    i {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--yl-border-strong);
    }
}

.yl-panel__title {
    flex: 1;
    font-family: var(--yl-font-mono);
    font-size: 12px;
    letter-spacing: 0.08em;
    color: var(--yl-text-secondary);
    white-space: nowrap;
}

/* —— 顶层规划 tab（同编辑器三 tab） —— */
.yl-eq__tabs {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 12px;

    button {
        padding: 6px 18px;
        font-size: 14px;
        font-weight: 700;
        color: var(--yl-text-secondary);
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid var(--yl-border-plain);
        border-radius: 999px;
        cursor: pointer;
        transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;

        &:hover {
            color: var(--yl-text-primary);
        }

        &.is-on {
            color: var(--yl-gold-bright);
            border-color: var(--yl-border-strong);
            background: rgba(232, 162, 60, 0.1);
        }
    }
}

/* —— 子级视图切换（黄蓝装 tab 内） —— */
.yl-eq__views {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 14px;

    button {
        padding: 4px 13px;
        font-size: 13px;
        color: var(--yl-text-secondary);
        background: rgba(0, 0, 0, 0.18);
        border: 1px solid var(--yl-border-plain);
        border-radius: 999px;
        cursor: pointer;
        transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;

        &:hover {
            color: var(--yl-text-primary);
        }

        &.is-on {
            color: var(--yl-gold-bright);
            border-color: var(--yl-border-strong);
            background: rgba(232, 162, 60, 0.1);
        }
    }
}

/* —— 视图一：已分级 —— */
.yl-eq__graded {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    min-height: 340px;
}

.yl-eq__zone {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: var(--yl-radius);
    background: rgba(0, 0, 0, 0.18);

    &.is-t1 .yl-eq__zone-title { color: #ff2800; }
    &.is-t2 .yl-eq__zone-title { color: #e6a23c; }
    &.is-t3 .yl-eq__zone-title { color: #409eff; }
}

.yl-eq__zone-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid var(--yl-border-plain);
}

.yl-eq__zone-title {
    font-family: var(--yl-font-mono);
    font-size: 15px;
    font-weight: 700;
}

.yl-eq__zone-count {
    font-size: 12px;
    color: var(--yl-text-faint);
}

.yl-eq__zone-body {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 6px;
    padding: 10px;
}

.yl-eq__chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border: 1px solid var(--yl-border-plain);
    border-radius: var(--yl-radius-sm);
    padding: 3px 7px;
    font-size: 12px;
    font-weight: 700;
    color: var(--yl-text-primary);

    img {
        width: 18px;
        height: 18px;
        object-fit: contain;
    }

    &.is-t1 { border-color: #ff2800; background: rgba(255, 40, 0, 0.08); }
    &.is-t2 { border-color: #e6a23c; background: rgba(230, 162, 60, 0.1); }
    &.is-t3 { border-color: #409eff; background: rgba(64, 158, 255, 0.08); }
}

.yl-eq__chip-x {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    margin-left: 2px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--yl-text-faint);
    font-size: 13px;
    line-height: 1;
    cursor: pointer;

    &:hover {
        color: #ff5252;
        background: rgba(255, 82, 82, 0.12);
    }
}

.yl-eq__zone-empty {
    width: 100%;
    padding: 22px 8px;
    font-size: 12px;
    color: var(--yl-text-faint);
    text-align: center;
}

/* —— 笔刷行（快速分级两视图共用） —— */
.yl-eq__brush {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 12px;
}

.yl-eq__brush-btns {
    display: flex;
    gap: 6px;
}

.yl-eq__brush-btn {
    min-width: 46px;
    padding: 5px 12px;
    font-family: var(--yl-font-mono);
    font-size: 13px;
    font-weight: 700;
    color: var(--yl-text-secondary);
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--yl-border-plain);
    border-radius: var(--yl-radius-sm);
    cursor: pointer;
    transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;

    &:nth-child(1).is-on {
        color: #ffffff;
        border-color: #ff2800;
        background: #ff2800;
    }

    &:nth-child(2).is-on {
        color: #ffffff;
        border-color: #e6a23c;
        background: #e6a23c;
    }

    &:nth-child(3).is-on {
        color: #ffffff;
        border-color: #409eff;
        background: #409eff;
    }
}

.yl-eq__brush-tip {
    font-size: 12px;
    color: var(--yl-text-faint);
    line-height: 1.6;
}

.yl-eq__brush-count {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-left: auto;
}

.yl-eq__brush-count-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--yl-text-secondary);
}

.yl-eq__brush-badge {
    font-family: var(--yl-font-mono);
    font-size: 11px;
    font-weight: 700;
    border-radius: var(--yl-radius-sm);
    padding: 2px 7px;
    color: #ffffff;

    &.is-t1 { background: #ff2800; }
    &.is-t2 { background: #e6a23c; }
    &.is-t3 { background: #409eff; }
}

/* —— 快速分级 · 武器：卡片平铺（需求等级降序，全量卡片区域内滚动） —— */
.yl-eq__cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(215px, 1fr));
    gap: 10px;
    min-height: 340px;
    max-height: 480px;
    overflow-y: auto;
    align-content: start;
    padding-right: 4px;
}

.yl-eq__card {
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 10px;
    border: 2px solid var(--yl-border-plain);
    border-radius: var(--yl-radius);
    background: rgba(0, 0, 0, 0.18);
    cursor: pointer;
    text-align: left;
    transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;

    &:hover {
        transform: translateY(-2px);
    }

    &.is-t1 { border-color: #ff2800; background: rgba(255, 40, 0, 0.12); }
    &.is-t2 { border-color: #e6a23c; background: rgba(230, 162, 60, 0.14); }
    &.is-t3 { border-color: #409eff; background: rgba(64, 158, 255, 0.12); }
}

.yl-eq__card-top {
    display: flex;
    align-items: center;
    gap: 9px;

    img {
        width: 34px;
        height: 34px;
        object-fit: contain;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.3);
        flex-shrink: 0;
    }
}

.yl-eq__card-imgfall {
    width: 34px;
    height: 34px;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.3);
    flex-shrink: 0;
}

.yl-eq__card-name {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;

    b {
        font-size: 14px;
        color: var(--yl-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    i {
        font-style: normal;
        font-size: 11px;
        color: var(--yl-text-faint);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

/* 复选指示（选中=当前笔刷档），档位着色由卡片边框表达 */
.yl-eq__card-check {
    width: 14px;
    height: 14px;
    border: 1.5px solid var(--yl-border-strong);
    border-radius: 3px;
    flex-shrink: 0;
    transition: background-color 0.15s ease, border-color 0.15s ease;

    &.is-on {
        background: var(--yl-gold-bright);
        border-color: var(--yl-gold-bright);
    }
}

.yl-eq__card-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 3px 10px;
    font-size: 12px;
    color: var(--yl-text-secondary);

    b {
        color: var(--yl-text-primary);
    }

    .is-lv {
        font-weight: 700;
        color: var(--yl-text-faint);
    }
}

/* —— 快速分级 · 防具：分列视图（防御属性分列，列内降序） —— */
.yl-eq__cols {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 10px;
    min-height: 340px;
    align-content: start;
}

.yl-eq__col {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: var(--yl-radius);
    background: rgba(0, 0, 0, 0.18);
}

.yl-eq__col-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px 11px;
    border-bottom: 1px solid var(--yl-border-plain);
    font-size: 13px;
    font-weight: 700;
    color: var(--yl-text-primary);

    i {
        font-style: normal;
        font-size: 12px;
        color: var(--yl-text-faint);
    }
}

.yl-eq__col-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px;
    max-height: 430px;
    overflow-y: auto;
    padding-right: 6px;
}

/* 细滚动条（暗色面板内） */
.yl-eq__cards,
.yl-eq__col-body {
    scrollbar-width: thin;
    scrollbar-color: var(--yl-border-strong) transparent;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background: var(--yl-border-strong);
        border-radius: 3px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }
}

.yl-eq__row {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 5px 8px;
    border: none;
    border-radius: var(--yl-radius-sm);
    background: transparent;
    font-size: 13px;
    color: var(--yl-text-primary);
    cursor: pointer;
    text-align: left;
    transition: background-color 0.2s ease, color 0.2s ease;

    &.is-t1 { background: #ff2800; color: #ffffff; }
    &.is-t2 { background: #e6a23c; color: #ffffff; }
    &.is-t3 { background: #409eff; color: #ffffff; }
}

.yl-eq__row-check {
    width: 13px;
    height: 13px;
    border: 1.5px solid var(--yl-border-strong);
    border-radius: 3px;
    flex-shrink: 0;
    transition: background-color 0.15s ease, border-color 0.15s ease;

    .yl-eq__row.is-t1 &,
    .yl-eq__row.is-t2 &,
    .yl-eq__row.is-t3 & {
        border-color: rgba(255, 255, 255, 0.85);
    }

    &.is-on {
        background: #ffffff;
        border-color: #ffffff;
    }
}

.yl-eq__row-name {
    flex: 1;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.yl-eq__row-val {
    font-family: var(--yl-font-mono);
    font-size: 12px;
    opacity: 0.85;
}

/* —— 白装规划：门槛填充 —— */
.yl-eq__whead {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 12px;
}

.yl-eq__ratio {
    font-size: 13px;
    color: var(--yl-text-secondary);

    b {
        color: #67c23a;
        font-family: var(--yl-font-mono);
    }

    i {
        font-style: normal;
        font-size: 10px;
        color: var(--yl-text-faint);
        margin-left: 5px;
    }
}

.yl-eq__tholds {
    display: flex;
    gap: 6px;

    button {
        padding: 5px 13px;
        font-family: var(--yl-font-mono);
        font-size: 13px;
        font-weight: 700;
        color: var(--yl-text-secondary);
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid var(--yl-border-plain);
        border-radius: var(--yl-radius-sm);
        cursor: pointer;
        transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;

        &.is-on {
            color: #1b1305;
            background: linear-gradient(135deg, var(--yl-gold-bright), var(--yl-gold-deep));
            border-color: transparent;
        }
    }
}

.yl-eq__thold-tip {
    font-size: 12px;
    color: var(--yl-text-faint);
}

.yl-eq__wacts {
    display: flex;
    gap: 8px;
    margin-left: auto;
}

.yl-eq__wbtn {
    padding: 7px 16px;
    font-size: 13px;
    font-weight: 700;
    color: var(--yl-text-primary);
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--yl-border-plain);
    border-radius: var(--yl-radius);
    cursor: pointer;
    transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, opacity 0.2s ease;

    &:hover {
        border-color: var(--yl-border-strong);
    }

    &.is-main {
        color: #1b1305;
        background: linear-gradient(135deg, var(--yl-gold-bright), var(--yl-gold-deep));
        border: none;
        box-shadow: 0 2px 12px rgba(232, 162, 60, 0.3);
    }

    &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
        box-shadow: none;
    }
}

.yl-eq__wbody {
    display: grid;
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    gap: 12px;
    align-items: start;
}

/* 暗金视图：左列表收窄、右侧分档区放宽 */
.yl-eq__wbody--u {
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
}

/* 左：物价列表 */
.yl-eq__wlist {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-height: 340px;
    max-height: 480px;
    overflow-y: auto;
    padding-right: 4px;
    scrollbar-width: thin;
    scrollbar-color: var(--yl-border-strong) transparent;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background: var(--yl-border-strong);
        border-radius: 3px;
    }
}

.yl-eq__wrow {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 6px 10px;
    border: 1px solid transparent;
    border-radius: var(--yl-radius-sm);
    background: rgba(0, 0, 0, 0.18);
    transition: border-color 0.2s ease, background-color 0.2s ease;

    img {
        width: 26px;
        height: 26px;
        object-fit: contain;
        flex-shrink: 0;
    }

    /* 门槛命中高亮（未收录） */
    &.is-hit {
        border-color: var(--yl-gold);
        background: rgba(232, 162, 60, 0.1);
    }

    /* 已收录进当前块：金色左缘 + 呼应编辑器小绿点 */
    &.is-inblock {
        box-shadow: inset 3px 0 0 #67c23a;
    }
}

.yl-eq__wname {
    display: inline-flex;
    align-items: baseline;
    gap: 7px;
    min-width: 0;
    flex: 1;

    b {
        font-size: 13px;
        color: var(--yl-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    i {
        font-style: normal;
        font-size: 10px;
        font-weight: 700;

        &.is-s3 {
            color: var(--yl-gold-bright);
        }

        &.is-s2 {
            color: var(--yl-text-faint);
        }
    }
}

.yl-eq__wdot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #67c23a;
    flex-shrink: 0;
}

.yl-eq__wval {
    font-family: var(--yl-font-mono);
    font-size: 13px;
    font-weight: 700;
    color: var(--yl-text-primary);

    i {
        font-style: normal;
        font-size: 10px;
        font-weight: 400;
        color: var(--yl-text-faint);
        margin-left: 3px;
    }
}

/* 右：白装块 */
.yl-eq__wblocks {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.yl-eq__wblock {
    display: flex;
    flex-direction: column;
    padding: 9px 11px;
    border: 1px solid var(--yl-border-plain);
    border-radius: var(--yl-radius);
    background: rgba(0, 0, 0, 0.18);
    cursor: pointer;
    text-align: left;
    transition: border-color 0.2s ease, background-color 0.2s ease;

    &:hover {
        border-color: var(--yl-border-strong);
    }

    &.is-on {
        border-color: var(--yl-gold);
        background: rgba(232, 162, 60, 0.06);
    }
}

.yl-eq__wblock-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 7px;

    b {
        font-size: 13px;
        color: var(--yl-text-primary);
    }

    i {
        font-style: normal;
        font-family: var(--yl-font-mono);
        font-size: 11px;
        color: var(--yl-text-faint);
    }
}

.yl-eq__wblock-body {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}

.yl-eq__wchip {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid rgba(103, 194, 58, 0.4);
    background: rgba(103, 194, 58, 0.08);
    color: var(--yl-text-primary);
    white-space: nowrap;
}

.yl-eq__wempty {
    font-size: 11px;
    color: var(--yl-text-faint);
    padding: 2px 0;
}

/* —— 暗金装规划：分档结果 —— */
.yl-eq__utiers {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 340px;
    padding: 12px;
    border-radius: var(--yl-radius);
    background: rgba(0, 0, 0, 0.18);
}

.yl-eq__t0 {
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 10px 12px;
    border: 1px solid rgba(232, 162, 60, 0.45);
    border-radius: var(--yl-radius);
    background: rgba(232, 162, 60, 0.05);
}

.yl-eq__t0-head {
    display: flex;
    align-items: center;
    gap: 9px;
}

.yl-eq__t0-label {
    font-family: var(--yl-font-mono);
    font-size: 11px;
    font-weight: 700;
    color: #1b1305;
    background: linear-gradient(135deg, var(--yl-gold-bright), var(--yl-gold-deep));
    border-radius: var(--yl-radius-sm);
    padding: 2px 7px;
}

.yl-eq__t0-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--yl-gold-bright);
}

.yl-eq__t0-body {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.yl-eq__t0-note {
    font-size: 11px;
    color: var(--yl-text-faint);
}

.yl-eq__utgroup {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 7px;
    animation: yl-act4-utgroup-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes yl-act4-utgroup-in {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: none;
    }
}

.yl-eq__utlabel {
    font-family: var(--yl-font-mono);
    font-size: 11px;
    font-weight: 700;
    text-align: center;
    border-radius: var(--yl-radius-sm);
    padding: 2px 7px;
    color: var(--yl-text-secondary);
    border: 1px solid var(--yl-border-plain);

    &.is-t1 {
        color: #1b1305;
        background: linear-gradient(135deg, var(--yl-gold-bright), var(--yl-gold-deep));
        border-color: transparent;
    }
}

.yl-eq__uchip {
    font-size: 12px;
    padding: 3px 9px;
    border-radius: 999px;
    border: 1px solid var(--yl-border-plain);
    color: var(--yl-text-secondary);
    white-space: nowrap;

    i {
        font-style: normal;
        font-family: var(--yl-font-mono);
        font-size: 10px;
        color: var(--yl-text-faint);
        margin-left: 3px;
    }

    &.is-t0 {
        border-color: rgba(232, 162, 60, 0.45);
        background: rgba(232, 162, 60, 0.08);
        color: var(--yl-gold-bright);
        font-weight: 700;
    }

    &.is-t1 {
        color: var(--yl-gold-bright);
        border-color: var(--yl-border-strong);
        background: rgba(232, 162, 60, 0.08);
        font-weight: 700;
    }

    &.is-t3 {
        color: var(--yl-text-faint);
    }
}

.yl-eq__uempty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: var(--yl-text-faint);
    border: 1px dashed var(--yl-border-plain);
    border-radius: var(--yl-radius-sm);
    padding: 18px 10px;
    text-align: center;
    line-height: 1.7;
}

.yl-eq__uleft {
    font-size: 11px;
    color: var(--yl-text-faint);
    margin-top: auto;
}

/* —— 底部：编辑器实际截图（一行五张） —— */
.yl-eq__shots {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12px;

    :deep(.yl-shot) {
        margin-top: 16px;
    }
}

/* —— 底部说明 —— */
.yl-eq__foot {
    margin-top: 14px;
}

.yl-eq__foot-note {
    font-size: 11px;
    color: var(--yl-text-faint);
}

/* —— 移动端：文案堆叠、卡片/分列自适应、徽标行内 —— */
@media (max-width: 959px) {
    .yl-act__badge {
        position: static;
        margin-left: 10px;
        vertical-align: 0.4em;
    }

    .yl-act4__head {
        grid-template-columns: 1fr;
        gap: 22px;
        align-items: start;
    }

    .yl-act4__points {
        grid-template-columns: 1fr;
        gap: 10px;
    }

    .yl-panel {
        padding: 14px 14px 16px;
    }

    .yl-eq__graded {
        grid-template-columns: 1fr;
        min-height: 0;
    }

    .yl-eq__cards,
    .yl-eq__cols {
        grid-template-columns: 1fr;
        min-height: 0;
    }

    .yl-eq__cards {
        max-height: 420px;
    }

    .yl-eq__col-body {
        max-height: 300px;
    }

    .yl-eq__wbody {
        grid-template-columns: 1fr;
    }

    .yl-eq__wlist {
        min-height: 0;
        max-height: 360px;
    }

    .yl-eq__utiers {
        min-height: 0;
    }

    .yl-eq__wacts {
        margin-left: 0;
    }

    .yl-eq__shots {
        grid-template-columns: 1fr;
        gap: 10px;
    }

    .yl-eq__brush-count {
        margin-left: 0;
        width: 100%;
    }
}
</style>
