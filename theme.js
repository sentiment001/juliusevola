(function () {
  'use strict';

  var root = document.documentElement;
  var meta = document.getElementById('themeColor');
  var LANG_KEY = 'lang';

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

  function dayRange(n) {
    var out = [];
    for (var i = 1; i <= n; i++) out.push(i);
    return out;
  }

  var LANGS = [
    { code: 'en', label: 'English', dir: '', days: null, rangeLabel: '' },
    { code: 'de', label: 'Deutsch', dir: 'de', days: dayRange(105), rangeLabel: 'Tage 1\u2013105' },
    { code: 'it', label: 'Italiano', dir: 'it', days: dayRange(50), rangeLabel: 'Giorni 1\u201350' }
  ];
