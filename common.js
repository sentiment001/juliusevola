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
      reportNote: 'Use this only for factual or interpretive errors in the text. The report becomes a public GitHub issue on the project repository.',
      reportContact: 'Name or email (optional)',
      reportContactPh: 'Optional',
      reportText: 'What needs correction?',
      reportTextPh: 'Quote the passage and state the problem clearly.',
      cancel: 'Cancel',
      openReport: 'Open report',
      issuePrefix: 'Inaccuracy'
    },
    de: {
      dayWord: 'Tag',
      listen: 'Hören',
      stop: 'Stopp',
      listenAria: 'Diesen Tag vorlesen',
      share: 'Zitat teilen',
      shareAria: 'Zitat als Bild teilen',
      report: 'Fehler melden',
      reportAria: 'Ungenauigkeit melden',
      noSpeech: 'Sprachausgabe wird in diesem Browser nicht unterstützt.',
      preparing: 'Wird vorbereitet…',
      shareNote: 'Bild heruntergeladen. Dem soeben geöffneten Beitrag anhängen.',
      shareFail: 'Das Bild konnte nicht erzeugt werden. Erneut versuchen oder den Seitenlink verwenden.',
      reportTitle: 'Ungenauigkeit melden',
      reportNote: 'Nur für sachliche oder interpretative Fehler im Text. Die Meldung wird zu einem öffentlichen GitHub-Issue im Projektarchiv.',
      reportContact: 'Name oder E-Mail (optional)',
      reportContactPh: 'Optional',
      reportText: 'Was ist zu korrigieren?',
      reportTextPh: 'Die Stelle zitieren und den Fehler klar benennen.',
      cancel: 'Abbrechen',
      openReport: 'Meldung öffnen',
      issuePrefix: 'Ungenauigkeit'
    },
    it: {
      dayWord: 'Giorno',
      listen: 'Ascolta',
      stop: 'Stop',
      listenAria: 'Ascolta questo giorno',
      share: 'Condividi citazione',
      shareAria: 'Condividi la citazione come immagine',
      report: 'Segnala inesattezza',
      reportAria: 'Segnala un\'inesattezza',
      noSpeech: 'La sintesi vocale non è supportata in questo browser.',
      preparing: 'Preparazione…',
      shareNote: 'Immagine scaricata. Allega il file al post appena aperto.',
      shareFail: 'Impossibile preparare l\'immagine. Riprova o usa il link della pagina.',
      reportTitle: 'Segnala inesattezza',
      reportNote: 'Usare solo per errori di fatto o di interpretazione nel testo. La segnalazione diventa un issue pubblico su GitHub nel deposito del progetto.',
      reportContact: 'Nome o email (facoltativo)',
      reportContactPh: 'Facoltativo',
      reportText: 'Che cosa va corretto?',
      reportTextPh: 'Cita il passo e indica il problema con chiarezza.',
      cancel: 'Annulla',
      openReport: 'Apri segnalazione',
      issuePrefix: 'Inesattezza'
    }
  };

  const lang = pageLang();
  const t = STR[lang] || STR.en;

  // Only run on day pages (EN Day / DE Tag / IT Giorno)
  const h2 = document.querySelector('h2');
  const pathDay = (location.pathname || '').match(/day-(\d+)\.html/i);
  if (!h2 && !pathDay) return;
  if (h2 && !h2.textContent.match(/^(Day|Tag|Giorno)\s+\d+/) && !pathDay) return;

  const dayMatch = h2 ? h2.textContent.match(/^(Day|Tag|Giorno)\s+(\d+)\s+[\u2014\u2013-]\s+(.+)$/) : null;
  const dayNum = dayMatch ? dayMatch[2] : (pathDay ? String(parseInt(pathDay[1], 10)) : '?');
  const dayTitle = dayMatch ? dayMatch[3].trim() : (h2 ? h2.textContent : '');
  const dayLabel = t.dayWord + ' ' + dayNum;

  // ---------- Extract content ----------
  function getQuoteParts() {
    const quoteEl = document.querySelector('.quote');
    if (!quoteEl) return { text: '', cite: '' };
    const clone = quoteEl.cloneNode(true);
    const cite = clone.querySelector('cite');
    let citeText = '';
    if (cite) {
      citeText = cite.textContent.trim();
      cite.remove();
    }
    const text = clone.textContent.trim().replace(/^["\u201c]|["\u201d]$/g, '').trim();
    return { text, cite: citeText };
  }

  function getBodyText() {
    const paras = [];
    let el = document.querySelector('.quote');
    if (!el) return '';
    el = el.nextElementSibling;
    while (el) {
      if (el.tagName === 'P') paras.push(el.textContent.trim());
      if (el.classList && (el.classList.contains('day-nav') || el.classList.contains('footer') || el.classList.contains('action-bar'))) break;
      el = el.nextElementSibling;
    }
    return paras.join('\n\n');
  }

  // ---------- Action bar (top placement for visibility on phone) ----------
  const bar = document.createElement('div');
  bar.className = 'action-bar';
  bar.innerHTML = `
    <button type="button" class="action-btn" id="listenBtn" aria-label="${t.listenAria}">${t.listen}</button>
    <button type="button" class="action-btn" id="shareBtn" aria-label="${t.shareAria}">${t.share}</button>
    <button type="button" class="action-btn" id="reportBtn" aria-label="${t.reportAria}">${t.report}</button>
  `;
  const topNav = document.querySelector('.day-nav');
  if (topNav && topNav.parentNode) {
    topNav.parentNode.insertBefore(bar, topNav.nextSibling);
  } else {
    const footer = document.querySelector('.footer');
    if (footer) footer.parentNode.insertBefore(bar, footer);
    else document.querySelector('.container').appendChild(bar);
  }

  const listenBtn = document.getElementById('listenBtn');
  const shareBtn = document.getElementById('shareBtn');
  const reportBtn = document.getElementById('reportBtn');

  let speaking = false;
  let utterance = null;

  function stopSpeaking() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    speaking = false;
    listenBtn.textContent = t.listen;
    listenBtn.classList.remove('active');
  }

  listenBtn.addEventListener('click', () => {
    if (!window.speechSynthesis) {
      alert(t.noSpeech);
      return;
    }
    if (speaking) {
      stopSpeaking();
      return;
    }

    const { text: quoteText, cite } = getQuoteParts();
    const body = getBodyText();
    const full = [quoteText, cite ? cite.replace(/^[\u2014]\s*/, '') : '', body].filter(Boolean).join('. ');

    utterance = new SpeechSynthesisUtterance(full);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    const voices = speechSynthesis.getVoices();
    const langPrefix = lang === 'de' ? 'de' : lang === 'it' ? 'it' : 'en';
    const preferred = voices.find(v => v.lang && v.lang.toLowerCase().indexOf(langPrefix) === 0 && /Google|Samantha|Daniel|Alex|Microsoft|Anna|Helena|Markus|Elsa|Alice|Luca/.test(v.name))
                   || voices.find(v => v.lang && v.lang.toLowerCase().indexOf(langPrefix) === 0)
                   || voices.find(v => v.lang && v.lang.toLowerCase().indexOf('en') === 0);
    if (preferred) utterance.voice = preferred;
    utterance.lang = langPrefix === 'de' ? 'de-DE' : langPrefix === 'it' ? 'it-IT' : 'en-US';

    utterance.onend = () => stopSpeaking();
    utterance.onerror = () => stopSpeaking();

    speaking = true;
    listenBtn.textContent = t.stop;
    listenBtn.classList.add('active');
    speechSynthesis.speak(utterance);
  });

  if (window.speechSynthesis) {
    speechSynthesis.onvoiceschanged = () => {};
  }
  window.addEventListener('pagehide', () => {
    if (window.speechSynthesis) speechSynthesis.cancel();
  });

  function wrapText(ctx, text, maxWidth) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function generateQuoteImage() {
    const { text, cite } = getQuoteParts();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    const W = 1200;
    const pad = 72;
    const maxTextW = W - pad * 2;
    const lineH = 58;
    const quoteText = `“${text}”`;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    ctx.font = 'italic 42px Georgia, "Times New Roman", serif';
    const lines = wrapText(ctx, quoteText, maxTextW);

    const headerBaseline = 28;
    const gapAfterHeader = 40;
    const gapBeforeCite = 36;
    const gapBeforeUrl = 44;

    let simY = pad + headerBaseline + gapAfterHeader;
    if (lines.length > 0) {
      simY += (lines.length - 1) * lineH;
    }
    simY += gapBeforeCite;
    simY += gapBeforeUrl;
    const H = simY + pad;

    canvas.width = W;
    canvas.height = H;

    ctx.fillStyle = isDark ? '#0f0f0f' : '#F7F3ED';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = isDark ? '#c45c5c' : '#8B1A1A';
    ctx.fillRect(0, 0, 12, H);

    ctx.fillStyle = isDark ? '#a0a0a0' : '#5c5c5c';
    ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(`${dayLabel} — Julius Evola Daily`, pad, pad + headerBaseline);

    ctx.fillStyle = isDark ? '#e8e6e3' : '#1a1a1a';
    ctx.font = 'italic 42px Georgia, "Times New Roman", serif';
    let y = pad + headerBaseline + gapAfterHeader;
    lines.forEach((ln, i) => {
      ctx.fillText(ln, pad, y);
      if (i < lines.length - 1) y += lineH;
    });

    y += gapBeforeCite;
    ctx.fillStyle = isDark ? '#a0a0a0' : '#5c5c5c';
    ctx.font = '26px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(cite || '— Julius Evola', pad, y);

    const dayFile = 'day-' + String(dayNum).padStart(2, '0') + '.html';
    const langDir = lang === 'en' ? '' : lang + '/';
    const pageUrl = `https://sentiment001.github.io/juliusevola/${langDir}${dayFile}`;
    y += gapBeforeUrl;
    ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = isDark ? '#666' : '#999';
    const urlWidth = ctx.measureText(pageUrl).width;
    ctx.fillText(pageUrl, W - pad - urlWidth, y);

    return new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob), 'image/png', 0.92);
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  shareBtn.addEventListener('click', async () => {
    shareBtn.disabled = true;
    shareBtn.textContent = t.preparing;

    try {
      const blob = await generateQuoteImage();
      const filename = `day-${dayNum}-quote.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      const pageUrl = window.location.href.split('?')[0];
      const quoteSnippet = getQuoteParts().text;
      const tweetText = `${dayLabel} — ${dayTitle}\n\n“${quoteSnippet.slice(0, 180)}${quoteSnippet.length > 180 ? '…' : ''}”\n\n${pageUrl}`;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          text: tweetText,
          title: `${dayLabel} — ${dayTitle}`
        });
      } else {
        downloadBlob(blob, filename);
        const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        window.open(intent, '_blank', 'noopener');
        const status = document.createElement('div');
        status.className = 'share-status';
        status.textContent = t.shareNote;
        bar.insertAdjacentElement('afterend', status);
        setTimeout(() => status.remove(), 6000);
      }
    } catch (err) {
      console.error(err);
      alert(t.shareFail);
    } finally {
      shareBtn.disabled = false;
      shareBtn.textContent = t.share;
    }
  });

  const overlay = document.createElement('div');
  overlay.className = 'report-overlay';
  overlay.innerHTML = `
    <div class="report-modal" role="dialog" aria-labelledby="reportTitle">
      <h3 id="reportTitle">${t.reportTitle}</h3>
      <p class="note">${t.reportNote}</p>
      <label for="reportContact">${t.reportContact}</label>
      <input type="text" id="reportContact" placeholder="${t.reportContactPh}" autocomplete="off">
      <label for="reportText">${t.reportText}</label>
      <textarea id="reportText" required placeholder="${t.reportTextPh}"></textarea>
      <div class="report-actions">
        <button type="button" class="cancel" id="reportCancel">${t.cancel}</button>
        <button type="button" class="submit" id="reportSubmit">${t.openReport}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  function closeReport() {
    overlay.classList.remove('open');
  }

  reportBtn.addEventListener('click', () => {
    overlay.classList.add('open');
    if (!window.matchMedia('(pointer: coarse)').matches) {
      document.getElementById('reportText').focus();
    }
  });

  document.getElementById('reportCancel').addEventListener('click', closeReport);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeReport();
  });

  document.getElementById('reportSubmit').addEventListener('click', () => {
    const contact = document.getElementById('reportContact').value.trim();
    const text = document.getElementById('reportText').value.trim();
    if (!text) {
      document.getElementById('reportText').focus();
      return;
    }

    const title = `${t.issuePrefix}: ${dayLabel} — ${dayTitle}`;
    let body = `**${dayLabel} — ${dayTitle}**\n\n`;
    body += `**Reported text / issue:**\n${text}\n\n`;
    if (contact) body += `**Contact:** ${contact}\n\n`;
    body += `**Page:** ${window.location.href.split('?')[0]}\n`;
    body += `**Submitted:** ${new Date().toISOString()}\n`;

    const url = `https://github.com/sentiment001/juliusevola/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank', 'noopener');
    closeReport();
    document.getElementById('reportText').value = '';
    document.getElementById('reportContact').value = '';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeReport();
  });

  const footerEl = document.querySelector('.footer');
  if (footerEl) {
    const useSolar = (parseInt(dayNum, 10) % 2) === 0;
    const originalText = footerEl.textContent.trim();

    footerEl.classList.add('graphic-footer');
    footerEl.classList.add(useSolar ? 'footer-solar' : 'footer-peak');

    const solarSVG = `
      <svg class="footer-emblem" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="60" cy="28" r="14" fill="none" stroke="currentColor" stroke-width="1.5"/>
        <line x1="60" y1="42" x2="60" y2="118" stroke="currentColor" stroke-width="1.5"/>
        <line x1="52" y1="70" x2="68" y2="70" stroke="currentColor" stroke-width="1"/>
        <line x1="54" y1="90" x2="66" y2="90" stroke="currentColor" stroke-width="1"/>
        <polygon points="60,118 54,128 66,128" fill="currentColor"/>
      </svg>`;

    const peakSVG = `
      <svg class="footer-emblem" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M20 120 L60 30 L100 120 Z" fill="none" stroke="currentColor" stroke-width="1.5"/>
        <line x1="60" y1="30" x2="60" y2="10" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="60" cy="8" r="4" fill="currentColor"/>
      </svg>`;

    footerEl.innerHTML = `
      <div class="footer-emblem-wrap">
        ${useSolar ? solarSVG : peakSVG}
      </div>
      <div class="footer-meta">${originalText}</div>
    `;
  }
})();
