/**
 * Markdown 正文字数统计与阅读时长估算。
 * 中日韩字符按字计，连续拉丁字母/数字按词计；
 * 已去除代码块、行内代码、图片与 HTML 标签，避免误计。
 */

export function countWords(body: string): number {
  const text = body
    .replace(/```[\s\S]*?```/g, "") // 围栏代码块
    .replace(/`[^`]*`/g, "") // 行内代码
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // 图片
    .replace(/<[^>]+>/g, ""); // HTML 标签
  const cjk = text.match(/[一-鿿぀-ヿ가-힯]/g)?.length ?? 0;
  const words = text.match(/[A-Za-z0-9]+/g)?.length ?? 0;
  return cjk + words;
}

/** 估算阅读时长（分钟），按约 400 字/分钟，至少 1 分钟。 */
export function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / 400));
}
