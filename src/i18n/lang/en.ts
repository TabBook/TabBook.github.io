import type { UIStrings } from "../types";

export default {
  nav: {
    home: "Home",
    posts: "Posts",
    tags: "Tags",
    friends: "Friends",
    about: "About",
    archives: "Archives",
    search: "Search",
    guestbook: "Guestbook",
  },
  post: {
    publishedAt: "Published at",
    updatedAt: "Updated",
    sharePostIntro: "Share this post:",
    sharePostOn: "Share this post on {{platform}}",
    sharePostViaEmail: "Share this post via email",
    tagLabel: "Tags",
    backToTop: "Back to top",
    goBack: "Go back",
    editPage: "Edit page",
    previousPost: "Previous Post",
    nextPost: "Next Post",
  },
  pagination: {
    prev: "Prev",
    next: "Next",
    page: "Page",
  },
  home: {
    socialLinks: "Social Links",
    featured: "Featured",
    recentPosts: "Recent Posts",
    allPosts: "All Posts",
  },
  pages: {
    tagTitle: "Tag",
    tagDesc: "All the articles with the tag",

    tagsTitle: "Tags",
    tagsDesc: "All the tags used in posts.",

    postsTitle: "Posts",
    postsDesc: "All the articles I've posted.",

    archivesTitle: "Archives",
    archivesDesc: "All the articles I've archived.",

    searchTitle: "Search",
    searchDesc: "Search any article ...",
  },
  theme: {
    light: "Light",
    dark: "Dark",
  },
  a11y: {
    skipToContent: "Skip to content",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    toggleTheme: "Toggle theme",
    searchPlaceholder: "Search posts...",
    noResults: "No results found",
    goToPreviousPage: "Go to previous page",
    goToNextPage: "Go to next page",
  },
  relativeTime: {
    secondsAgo: "a few seconds ago",
    minuteAgo: "1 minute ago",
    minutesAgo: (n: number) => `${n} minutes ago`,
    hourAgo: "1 hour ago",
    hoursAgo: (n: number) => `${n} hours ago`,
    dayAgo: "1 day ago",
    daysAgo: (n: number) => `${n} days ago`,
    monthAgo: "1 month ago",
    monthsAgo: (n: number) => `${n} months ago`,
    yearAgo: "1 year ago",
    yearsAgo: (n: number) => `${n} years ago`,
  },
  notFound: {
    title: "404 Not Found",
    message: "Page Not Found",
    goHome: "Go back home",
  },
  comments: {
    title: "Comments",
    loading: "Loading comments…",
  },
} satisfies UIStrings;
