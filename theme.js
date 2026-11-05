(function () {
  'use strict';
  var root = document.documentElement;
  function isDark() { return root.getAttribute('data-theme') === 'dark'; }
  var toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      if (isDark()) {
        root.removeAttribute('data-theme');
        try { localStorage.setItem('theme', 'light'); } catch (e) {}
      } else {
        root.setAttribute('data-theme', 'dark');
        try { localStorage.setItem('theme', 'dark'); } catch (e) {}
      }
    });
  }
  var nav = document.querySelector('header nav');
  if (nav) {
    nav.innerHTML = '<a href="/">Home</a> <a href="/today">Today</a> <a href="/sheets">Sheets</a> <a href="/begin">Where to begin</a> <a href="/books">Books</a>';
  }
})();
