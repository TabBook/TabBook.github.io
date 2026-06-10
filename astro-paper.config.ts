import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  // SEO 声明信息
  site: {
    url: "https://tabbook.github.io/",
    title: "TypeWrite",
    description: "记录 CTF / PWN 题解，以及一些日常的思考与生活。",
    author: "TabBook",
    profile: "https://github.com/TabBook",
    ogImage: "default-og.jpg",
    lang: "zh",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 10,
    perIndex: 8,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: false,
    showArchives: false,
    showTags: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: false,
    coverUrl: "",
  },
  timeBasedTheme: {
    enabled: true,
    lightStart: "08:00",
    darkStart: "18:00",
  },
  socials: [
    { name: "github", url: "https://github.com/TabBook" },
    { name: "mail", url: "mailto:fiqancii@gmail.com" },
  ],
  shareLinks: [],
});
