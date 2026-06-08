source "https://rubygems.org"

# 与 GitHub Pages 完全一致的依赖，本地预览时也用它，避免版本不一致。
gem "github-pages", group: :jekyll_plugins

# 这些插件已在 GitHub Pages 白名单内
group :jekyll_plugins do
  gem "jekyll-feed"
  gem "jekyll-seo-tag"
end

# Windows / 部分平台需要的补丁
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]
