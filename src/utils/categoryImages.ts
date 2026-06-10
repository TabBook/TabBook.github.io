import { slugifyStr } from "./slugify";

export type CategoryImageMap = Record<string, string>;

// 极简：不使用分类封面图，分类卡片显示纯色块
export const CATEGORY_IMAGE_URLS: CategoryImageMap = {};

export function getCategoryImageUrl(nameOrSlug?: string): string | undefined {
  if (!nameOrSlug) return undefined;

  if (CATEGORY_IMAGE_URLS[nameOrSlug]) return CATEGORY_IMAGE_URLS[nameOrSlug];

  const slug = slugifyStr(nameOrSlug);
  return CATEGORY_IMAGE_URLS[slug];
}
