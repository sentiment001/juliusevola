(function () {
  'use strict';

  var root = document.documentElement;
  var meta = document.getElementById('themeColor');

  var ICON_SOLAR =
    '<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="3.1" fill="none" stroke="currentColor" stroke-width="1.35"/>' +
    '<path fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" d="' +
    'M12 1.8c.35 1.15-.15 2.15-.95 2.7M12 1.8c-.35 1.15.15 2.15.95 2.7' +
    'M22.2 12c-1.15.35-2.15-.15-2.7-.95M22.2 12c-1.15-.35-2.15.15-2.7.95' +
    'M12 22.2c.35-1.15-.15-2.15-.95-2.7M12 22.2c-.35-1.15.15-2.15.95-2.7' +
    'M1.8 12c1.15.35 2.15-.15 2.7-.95M1.8 12c1.15-.35 2.15.15 2.7.95' +
    'M19.1 4.9c-.85.9-2 .8-2.85.15M19.1 4.9c-.85-.9-2-.8-2.85.15' +
    'M4.9 19.1c.85-.9.8-2 .15-2.85M4.9 19.1c-.85-.9-.8-2 .15-2.85' +
    'M19.1 19.1c-.85-.9-2-.8-2.85-.15M19.1 19.1c-.85.9-2 .8-2.85-.15' +
    'M4.9 4.9c.85.9.8 2 .15 2.85M4.9 4.9c-.85.9-.8 2 .15 2.85' +
    '"/>' +
    '</svg>';

  var ICON_POLAR =
    '<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">' +
    '<line x1="12" y1="21" x2="12" y2="6.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
    '<circle cx="12" cy="4.2" r="2.1" fill="none" stroke="currentColor" stroke-width="1.35"/>' +
    '<line x1="8.5" y1="11" x2="15.5" y2="11" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/>' +
    '<line x1="9.5" y1="15.5" x2="14.5" y2="15.5" stroke="currentColor" stroke-width="1.05" stroke-linecap="round"/>' +
    '</svg>';

  var LANGS = [
    { code: 'en', label: 'English', dir: '', days: null },
    { code: 'de', label: 'Deutsch', dir: 'de', days: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25] },
    { code: 'it', label: 'Italiano', dir: 'it', days: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] }
  ];

  function isDark() {
    return root.getAttribute('data-theme') === 'dark';
  }

  function ensureHeaderRight() {
    var header = document.querySelector('header');
    if (!header) return null;
    var right = header.querySelector('.header-right');
    if (!right) {
      right = document.createElement('div');
      right.className = 'header-right';
      header.appendChild(right);
    }
    var existingToggle = header.querySelector('#themeToggle');
    if (existingToggle && existingToggle.parentNode !== right) {
      right.appendChild(existingToggle);
    }
    var staticLang = right.querySelector('a.lang-toggle');
    if (staticLang) staticLang.remove();
    return right;
  }

  function paintTheme(toggle) {
    if (!toggle) return;
    toggle.innerHTML = isDark() ? ICON_SOLAR : ICON_POLAR;
    toggle.setAttribute('aria-label', isDark() ? 'Switch to day mode' : 'Switch to night mode');
    toggle.title = isDark() ? 'Day' : 'Night';
    if (meta) meta.setAttribute('content', isDark() ? '#0f0f0f' : '#F7F3ED');
  }

  function pathInfo() {
    var path = location.pathname || '';
    var lang = 'en';
    if (/\/de(?:\/|$)/.test(path)) lang = 'de';
    else if (/\/it(?:\/|$)/.test(path)) lang = 'it';
    var m = path.match(/day-(\d+)\.html/i);
    var dayNum = m ? parseInt(m[1], 10) : null;
    return { lang: lang, dayNum: dayNum, path: path };
  }

  function dayFile(n) {
    return 'day-' + (n < 10 ? '0' : '') + n + '.html';
  }

  function hrefForLang(code, info) {
    var up = info.lang === 'en' ? '' : '../';
    if (!info.dayNum) {
      if (code === 'en') return up + 'index.html';
      return up + code + '/day-01.html';
    }
    var file = dayFile(info.dayNum);
    if (code === info.lang) return file;
    if (code === 'en') return '../' + file;
    if (info.lang === 'en') return code + '/' + file;
    return '../' + code + '/' + file;
  }

  function langAvailable(lang, info) {
    if (lang.code === 'en') return true;
    if (!lang.days || !lang.days.length) return false;
    if (!info.dayNum) return lang.days.indexOf(1) !== -1;
    return lang.days.indexOf(info.dayNum) !== -1;
  }

  function buildLangControl(right) {
    if (!right || right.querySelector('.lang-menu')) return;
    var info = pathInfo();
    var current = info.lang;
    var wrap = document.createElement('div');
    wrap.className = 'lang-menu';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lang-btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Language');
    btn.innerHTML = '<span class="lang-code">' + current.toUpperCase() + '</span><span class="lang-caret" aria-hidden="true">\u25be</span>';
    var list = document.createElement('div');
    list.className = 'lang-dropdown';
    list.setAttribute('role', 'listbox');
    list.hidden = true;
    LANGS.forEach(function (lang) {
      var available = langAvailable(lang, info);
      var isCurrent = lang.code === current;
      var item = document.createElement(available && !isCurrent ? 'a' : 'span');
      item.className = 'lang-option' + (isCurrent ? ' is-current' : '') + (!available ? ' is-disabled' : '');
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      item.textContent = lang.label;
      if (available && !isCurrent) item.href = hrefForLang(lang.code, info);
      if (!available) item.title = 'Not yet available';
      list.appendChild(item);
    });
    function close() {
      list.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      wrap.classList.remove('open');
    }
    function open() {
      list.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      wrap.classList.add('open');
    }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (list.hidden) open();
      else close();
    });
    document.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
    wrap.appendChild(btn);
    wrap.appendChild(list);
    right.insertBefore(wrap, right.firstChild);
  }

  var right = ensureHeaderRight();
  var toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.classList.add('theme-toggle');
    paintTheme(toggle);
    toggle.addEventListener('click', function () {
      if (isDark()) {
        root.removeAttribute('data-theme');
        try { localStorage.setItem('theme', 'light'); } catch (e) {}
      } else {
        root.setAttribute('data-theme', 'dark');
        try { localStorage.setItem('theme', 'dark'); } catch (e) {}
      }
      paintTheme(toggle);
    });
  }
  if (right) buildLangControl(right);
})();
