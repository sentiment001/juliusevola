/**
 * Julius Evola Daily — shared day-page controls
 * Listen (SpeechSynthesis) · Share quote image · Report inaccuracy
 * Designed for both phone and desktop.
 */
(function () {
  'use strict';

  // Only run on day pages
  const h2 = document.querySelector('h2');
  if (!h2 || !h2.textContent.match(/^Day \d+/)) return;

  const dayMatch = h2.textContent.match(/^Day (\d+)\s*—\s*(.+)$/);
  const dayNum = dayMatch ? dayMatch[1] : '?';
  const dayTitle = dayMatch ? dayMatch[2].trim() : h2.textContent;

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
    const text = clone.textContent.trim().replace(/^["“]|["”]$/g, '').trim();
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
    <button type="button" class="action-btn" id="listenBtn" aria-label="Listen to this day">Listen</button>
    <button type="button" class="action-btn" id="shareBtn" aria-label="Share quote as image">Share quote</button>
    <button type="button" class="action-btn" id="reportBtn" aria-label="Report inaccuracy">Report inaccuracy</button>
  `;
  // Place immediately after the first day-nav so controls are visible without scrolling on phone
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

  // ---------- Listen (SpeechSynthesis) ----------
  let speaking = false;
  let utterance = null;

  function stopSpeaking() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    speaking = false;
    listenBtn.textContent = 'Listen';
    listenBtn.classList.remove('active');
  }

  listenBtn.addEventListener('click', () => {
    if (!window.speechSynthesis) {
      alert('Speech is not supported in this browser.');
      return;
    }
    if (speaking) {
      stopSpeaking();
      return;
    }

    const { text: quoteText, cite } = getQuoteParts();
    const body = getBodyText();
    const full = [quoteText, cite ? cite.replace(/^—\s*/, '') : '', body].filter(Boolean).join('. ');

    utterance = new SpeechSynthesisUtterance(full);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    // Prefer a clear English voice when available
    const voices = speechSynthesis.getVoices();
    const preferred = voices.find(v => /en-(US|GB)/.test(v.lang) && /Google|Samantha|Daniel|Alex|Microsoft/.test(v.name))
                   || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => stopSpeaking();
    utterance.onerror = () => stopSpeaking();

    speaking = true;
    listenBtn.textContent = 'Stop';
    listenBtn.classList.add('active');
    speechSynthesis.speak(utterance);
  });

  // Some browsers load voices asynchronously
  if (window.speechSynthesis) {
    speechSynthesis.onvoiceschanged = () => {};
  }

  // ---------- Share quote as image ----------
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
    const pad = 72;                 // equal top and bottom margin
    const maxTextW = W - pad * 2;
    const lineH = 58;

    // Literal quotation marks around the quote
    const quoteText = `“${text}”`;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Measure wrapped lines
    ctx.font = 'italic 42px Georgia, "Times New Roman", serif';
    const lines = wrapText(ctx, quoteText, maxTextW);

    // Layout constants
    const headerBaseline = 28;
    const gapAfterHeader = 40;   // from header baseline to first quote baseline
    const gapBeforeCite = 36;    // from last quote baseline to cite baseline
    const gapBeforeUrl = 44;     // from cite baseline to URL baseline

    // Simulate the final URL baseline so canvas height matches exactly
    // (avoids overlap / clipping and keeps top/bottom padding equal)
    let simY = pad + headerBaseline + gapAfterHeader;
    if (lines.length > 0) {
      simY += (lines.length - 1) * lineH;  // last quote baseline
    }
    simY += gapBeforeCite;                 // cite baseline
    simY += gapBeforeUrl;                  // URL baseline
    const H = simY + pad;                  // equal bottom padding

    canvas.width = W;
    canvas.height = H;

    // Background
    ctx.fillStyle = isDark ? '#0f0f0f' : '#F7F3ED';
    ctx.fillRect(0, 0, W, H);

    // Left accent bar
    ctx.fillStyle = isDark ? '#c45c5c' : '#8B1A1A';
    ctx.fillRect(0, 0, 12, H);

    // Day label
    ctx.fillStyle = isDark ? '#a0a0a0' : '#5c5c5c';
    ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(`Day ${dayNum} — Julius Evola Daily`, pad, pad + headerBaseline);

    // Quote lines (with curly quotes)
    ctx.fillStyle = isDark ? '#e8e6e3' : '#1a1a1a';
    ctx.font = 'italic 42px Georgia, "Times New Roman", serif';
    let y = pad + headerBaseline + gapAfterHeader;
    lines.forEach((ln, i) => {
      ctx.fillText(ln, pad, y);
      if (i < lines.length - 1) y += lineH;
    });

    // Cite
    y += gapBeforeCite;
    ctx.fillStyle = isDark ? '#a0a0a0' : '#5c5c5c';
    ctx.font = '26px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(cite || '— Julius Evola', pad, y);

    // Full page URL, bottom right
    const dayFile = Number(dayNum) < 10 ? `day-0${dayNum}.html` : `day-${dayNum}.html`;
    const pageUrl = `https://sentiment001.github.io/juliusevola/${dayFile}`;
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
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  shareBtn.addEventListener('click', async () => {
    shareBtn.disabled = true;
    shareBtn.textContent = 'Preparing…';

    try {
      const blob = await generateQuoteImage();
      const filename = `day-${dayNum}-quote.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      const pageUrl = window.location.href.split('?')[0];
      const quoteSnippet = getQuoteParts().text;
      const tweetText = `Day ${dayNum} — ${dayTitle}\n\n“${quoteSnippet.slice(0, 180)}${quoteSnippet.length > 180 ? '…' : ''}”\n\n${pageUrl}`;

      // Prefer native share with file when available (mobile primarily)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          text: tweetText,
          title: `Day ${dayNum} — ${dayTitle}`
        });
      } else {
        // Fallback: download image + open X intent with text
        downloadBlob(blob, filename);
        const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        window.open(intent, '_blank', 'noopener');
        // Brief note
        const status = document.createElement('div');
        status.className = 'share-status';
        status.textContent = 'Image downloaded. Attach it to the tweet that just opened.';
        bar.appendChild(status);
        setTimeout(() => status.remove(), 6000);
      }
    } catch (err) {
      console.error(err);
      alert('Could not prepare the image. Try again or use the page link.');
    } finally {
      shareBtn.disabled = false;
      shareBtn.textContent = 'Share quote';
    }
  });

  // ---------- Report inaccuracy ----------
  // Stored as GitHub Issues (visible in the repository)
  const overlay = document.createElement('div');
  overlay.className = 'report-overlay';
  overlay.innerHTML = `
    <div class="report-modal" role="dialog" aria-labelledby="reportTitle">
      <h3 id="reportTitle">Report inaccuracy</h3>
      <p class="note">Use this only for factual or interpretive errors in the text. The report becomes a public GitHub issue on the project repository.</p>
      <label for="reportContact">Name or email (optional)</label>
      <input type="text" id="reportContact" placeholder="Optional" autocomplete="off">
      <label for="reportText">What needs correction?</label>
      <textarea id="reportText" required placeholder="Quote the passage and state the problem clearly."></textarea>
      <div class="report-actions">
        <button type="button" class="cancel" id="reportCancel">Cancel</button>
        <button type="button" class="submit" id="reportSubmit">Open report</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  function closeReport() {
    overlay.classList.remove('open');
  }

  reportBtn.addEventListener('click', () => {
    overlay.classList.add('open');
    document.getElementById('reportText').focus();
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

    const title = `Inaccuracy: Day ${dayNum} — ${dayTitle}`;
    let body = `**Day ${dayNum} — ${dayTitle}**\n\n`;
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

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeReport();
  });

  // ---------- Graphic footer (random between two Evola-inspired images) ----------
  const footerEl = document.querySelector('.footer');
  if (footerEl) {
    // Deterministic per day so the same day is consistent, different days vary
    const useSolar = (parseInt(dayNum, 10) % 2) === 0;
    const imgSrc = useSolar ? 'footer-solar.jpg' : 'footer-peak.jpg';
    const originalText = footerEl.textContent.trim();

    footerEl.classList.add('graphic-footer');
    footerEl.innerHTML = `
      <div class="footer-image-wrap">
        <img src="${imgSrc}" alt="" loading="lazy" width="1168" height="784"
             onerror="this.style.display='none';this.parentElement.classList.add('no-image');">
      </div>
      <div class="footer-meta">${originalText}</div>
    `;
  }
})();
