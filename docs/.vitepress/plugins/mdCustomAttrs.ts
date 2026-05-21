import type { MarkdownRenderer } from "vitepress"

const mdCustomAttrs = (md: MarkdownRenderer) => {
  const defaultRenderer = md.renderer.rules.image!

  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    tokens[idx].attrSet("data-fancybox", "gallery")
    return defaultRenderer(tokens, idx, options, env, self)
  }
}

export default mdCustomAttrs
