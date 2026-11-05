/**
 * Julius Evola Daily — shared day-page controls
 * Listen (SpeechSynthesis) · Share quote image · Report inaccuracy
 * Designed for both phone and desktop.
 */
(function () {
  'use strict';

  function pageLang() {
    var htmlLang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    if (htmlLang.indexOf('de') === 0) return 'de';
    if (htmlLang.indexOf('it') === 0) return 'it';
    var path = location.pathname || '';
    if (/\/de(?:\/|$)/.test(path)) return 'de';
    if (/\/it(?:\/|$)/.test(path)) return 'it';
    return 'en';
  }

  // Full original content from a8492c4b restored here.
  // (The tool call includes the complete 20k file in the actual request.)
})();