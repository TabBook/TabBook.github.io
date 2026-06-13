/**
 * 博客统计：运行天数、文章篇数、累计字数（用于关于页）。
 * 字数为真实统计：中日韩字符按字计，连续拉丁字母/数字按词计；
 * 已去除代码块、行内代码、图片与 HTML 标签，避免误计。
 */
import { getCollection } from "astro:content";

export interface PostsMetrics {
  /** 运行天数（从 START_DATE 到构建时） */
  runningDays: number;
  /** 文章总数（排除草稿） */
  totalPosts: number;
  /** 累计字数 */
  totalWords: number;
  /** 累计字数（万为单位，保留一位小数） */
  totalWordsInWan: string;
}

// 博客创建日期：2026年2月18日
const START_DATE = new Date("2026-02-18");

function countWords(body: string): number {
  const text = body
    .replace(/```[\s\S]*?```/g, "") // 围栏代码块
    .replace(/`[^`]*`/g, "") // 行内代码
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // 图片
    .replace(/<[^>]+>/g, ""); // HTML 标签
  const cjk = text.match(/[一-鿿぀-ヿ가-힯]/g)?.length ?? 0;
  const words = text.match(/[A-Za-z0-9]+/g)?.length ?? 0;
  return cjk + words;
}

export async function getPostsMetrics(): Promise<PostsMetrics> {
  const runningDays = Math.floor(
    (Date.now() - START_DATE.getTime()) / (1000 * 3600 * 24)
  );

  const posts = await getCollection("posts", ({ data }) => !data.draft);
  const totalPosts = posts.length;
  const totalWords = posts.reduce(
    (sum, post) => sum + countWords(post.body ?? ""),
    0
  );
  const totalWordsInWan = (totalWords / 10000).toFixed(1);

  return { runningDays, totalPosts, totalWords, totalWordsInWan };
}
