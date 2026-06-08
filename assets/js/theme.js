// 深色模式切换 + 导航滚动状态
(function () {
  var root = document.documentElement;

  // —— 主题切换 ——
  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // —— 首页导航：滚过 hero 后加上实底背景 ——
  var header = document.getElementById('site-header');
  if (header && document.body.classList.contains('is-home')) {
    var onScroll = function () {
      if (window.scrollY > window.innerHeight - 80) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  } else if (header) {
    header.classList.add('scrolled');
  }
})();
