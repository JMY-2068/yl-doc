/**
 * yl-editor 部署脚本
 *
 * 流程:dist 打包 tar.gz → scp 上传 → ssh 解压覆盖到目标目录 → 清理
 *
 * 用法:
 *   node deploy.mjs          部署生产(默认)
 *   node deploy.mjs test     部署测试环境(如配置了 test 相关变量)
 *
 * 安全:服务器配置和私钥路径从 .env.deploy 读取(已 gitignore)
 */
import { execSync } from 'node:child_process'
import { existsSync, readFileSync, unlinkSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// 脚本所在目录(scripts/),用于定位 .env.deploy 和 deploy_key
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
// 项目根目录(scripts 的上一级),用于定位 dist
const ROOT = resolve(SCRIPT_DIR, '..')

/** 简易 .env 解析(零依赖,不依赖 dotenv) */
function loadEnv(file) {
    if (!existsSync(file))
        return
    const text = readFileSync(file, 'utf-8')
    for (const line of text.split('\n')) {
        const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i)
        if (m && !process.env[m[1]])
            process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
    }
}
loadEnv(resolve(SCRIPT_DIR, '.env.deploy'))

const HOST = process.env.DEPLOY_HOST || '124.221.123.162'
const PORT = process.env.DEPLOY_PORT || '22'
const USER = process.env.DEPLOY_USER || 'root'
const REMOTE_PATH = process.env.DEPLOY_PATH || '/www/wwwroot/edit.filtereditor.cn'
// 私钥:优先用 .env.deploy 里的值,作为 scripts/ 下的相对路径解析为绝对路径
const KEY_FILE = resolve(SCRIPT_DIR, process.env.DEPLOY_KEY || 'deploy_key')
const CHOWN = process.env.DEPLOY_CHOWN || 'www:www'
// 构建产物目录:默认 dist,VitePress 项目可配为 docs/.vitepress/dist
const DIST_REL = process.env.DEPLOY_DIST || 'dist'
const KEEP_FILES = (process.env.DEPLOY_KEEP || '').split(',').map(s => s.trim()).filter(Boolean)

// 绝对路径(用于 Node fs 检查);相对路径(用于 tar 命令,基于 cwd=ROOT)
const DIST_DIR = resolve(ROOT, DIST_REL)
const ARCHIVE = resolve(ROOT, 'dist-deploy.tar.gz')
const REMOTE_ARCHIVE = '/tmp/yl-doc-deploy.tar.gz'

// ssh 用小写 -p 指定端口,scp 用大写 -P
const SSH_OPTS = `-i "${KEY_FILE}" -o StrictHostKeyChecking=no -o ConnectTimeout=15`
const SSH_BASE = `ssh ${SSH_OPTS} -p ${PORT} ${USER}@${HOST}`
const SCP_BASE = `scp ${SSH_OPTS} -P ${PORT}`

function run(cmd, label) {
    console.log(`\n▶ ${label || cmd}`)
    execSync(cmd, { stdio: 'inherit', cwd: ROOT })
}

function fail(msg) {
    console.error(`\n✘ ${msg}`)
    process.exit(1)
}

// 1. 检查 dist
if (!existsSync(DIST_DIR))
    fail('dist 目录不存在,请先执行 npm run build')

if (!existsSync(KEY_FILE))
    fail(`私钥文件 ${KEY_FILE} 不存在`)

const startedAt = Date.now()
console.log(`🚀 开始部署到 ${USER}@${HOST}:${REMOTE_PATH}`)

// 2. 本地打包 dist 内容(进入 dist 后打包,解压时不带 dist 层级)
//    命令在 ROOT 下执行,用相对路径避免 Git Bash 的 tar 把 "E:" 误判为远程主机
run(
    `tar -czf dist-deploy.tar.gz -C ${DIST_REL} .`,
    `打包 ${DIST_REL} → dist-deploy.tar.gz`,
)

// 3. 上传
run(
    `${SCP_BASE} dist-deploy.tar.gz ${USER}@${HOST}:${REMOTE_ARCHIVE}`,
    `上传到服务器 ${REMOTE_ARCHIVE}`,
)

// 4. 远程:覆盖解压 + 清理 dist.rar + chown + 删除临时包
//    覆盖模式:解压直接覆盖同名旧文件。保留文件(KEEP_FILES)不在 dist 内,不受影响。
//    构建排除条件:KEEP_FILES 为空时不排除任何文件;有值时用 find ! -name 排除
const chownExclude = KEEP_FILES.length
    ? KEEP_FILES.map(f => `! -name '${f}'`).join(' ')
    : ''
const remoteCmd = [
    `set -e`,
    // 解压覆盖(--no-same-owner 避免 Windows 打包产生的属主 197609:197121 带到服务器)
    `tar --no-same-owner -xzf ${REMOTE_ARCHIVE} -C ${REMOTE_PATH}`,
    // 清理旧打包残留
    `rm -f ${REMOTE_PATH}/dist.rar`,
    // 修正属主(nginx 以 www 运行),包含目录本身。保留文件可能被锁,stderr 静默 + true 容错
    CHOWN ? `find ${REMOTE_PATH} ${chownExclude} -exec chown ${CHOWN} {} + 2>/dev/null; true` : true,
    // 删除服务器临时包
    `rm -f ${REMOTE_ARCHIVE}`,
]
    .filter(Boolean)
    .join(' && ')

run(
    `${SSH_BASE} "${remoteCmd}"`,
    '远程解压覆盖 + 清理',
)

// 5. 清理本地临时包(用 Node 原生删除,跨平台不依赖 shell 的 rm)
console.log('\n▶ 清理本地临时包')
if (existsSync(ARCHIVE))
    unlinkSync(ARCHIVE)

const cost = ((Date.now() - startedAt) / 1000).toFixed(1)
const DEPLOY_URL = process.env.DEPLOY_URL || `http://${HOST}/`
console.log(`\n✅ 部署成功!耗时 ${cost}s`)
console.log(`   访问:${DEPLOY_URL}`)
