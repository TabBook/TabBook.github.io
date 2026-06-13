/**
 * 博客统计：运行天数、文章篇数、累计字数（用于关于页）。
 * 字数统计复用 wordCount 工具。
 */
import { getCollection } from "astro:content";
import { countWords } from "./wordCount";

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
