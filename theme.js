(function () {
  'use strict';
  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');
  var meta = document.getElementById('themeColor');

  function isDark() { return root.getAttribute('data-theme') === 'dark'; }

  function paint() {
    if (toggle) toggle.textContent = isDark() ? 'Day' : 'Night';
    if (meta) meta.setAttribute('content', isDark() ? '#0f0f0f' : '#F7F3ED');
  }

  paint();

  if (!toggle) return;
  toggle.addEventListener('click', function () {
    if (isDark()) {
      root.removeAttribute('data-theme');
      try { localStorage.setItem('theme', 'light'); } catch (e) {}
    } else {
      root.setAttribute('data-theme', 'dark');
      try { localStorage.setItem('theme', 'dark'); } catch (e) {}
    }
    paint();
  });
})();
