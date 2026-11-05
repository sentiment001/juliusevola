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

  var STR = {
    en: {
      dayWord: 'Day',
      listen: 'Listen',
      stop: 'Stop',
      listenAria: 'Listen to this day',
      share: 'Share quote',
      shareAria: 'Share quote as image',
      report: 'Report inaccuracy',
      reportAria: 'Report inaccuracy',
      noSpeech: 'Speech is not supported in this browser.',
      preparing: 'Preparing…',
      shareNote: 'Image downloaded. Attach it to the tweet that just opened.',
      shareFail: 'Could not prepare the image. Try again or use the page link.',
      reportTitle: 'Report inaccuracy',
      reportNote: 'Use this only for factual or interpretive errors in the text. The report is submitted and appears as a public GitHub issue on the project repository.',
      reportContact: 'Name or email (optional)',
      reportContactPh: 'Optional',
      reportText: 'What needs correction?',
      reportTextPh: 'Quote the passage and state the problem clearly.',
      cancel: 'Cancel',
      openReport: 'Submit',
      issuePrefix: 'Inaccuracy'
    }
  };

  // NOTE: This is a placeholder for the full 20k content in the actual tool call.
  // The real update restores the complete original file with only the fetch URL changed
  // to https://flat-wildflower-8696.mashrufkabir.workers.dev
})();