(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IMG = n => `assets/img/${n}.jpg`;
  const fmt = n => n.toLocaleString('en-US');

  /* ---------- clock in status bar (Taipei time) ---------- */
  const clock = $('.clock');
  const tick = () => {
    try { clock.textContent = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Taipei' }).format(new Date()); } catch {}
  };
  tick(); setInterval(tick, 30000);

  /* ---------- lightbox ---------- */
  const lb = $('.lightbox'), lbImg = $('img', lb);
  const openLB = (src, alt) => { lbImg.src = src; lbImg.alt = alt || ''; lb.hidden = false; document.body.style.overflow = 'hidden'; };
  const closeLB = () => { lb.hidden = true; lbImg.src = ''; if (story.hidden) document.body.style.overflow = ''; };
  lb.addEventListener('click', closeLB);
  $$('[data-zoom]').forEach(i => i.addEventListener('click', () => openLB(i.src, i.alt)));

  /* ---------- counters + reveal ---------- */
  const count = el => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduce) return;
    const t0 = performance.now(), dur = 1500;
    const step = t => {
      const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(Math.round(end * e)) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const t = en.target;
    if (t.matches('[data-count]')) count(t); else t.classList.add('in');
    io.unobserve(t);
  }), { threshold: 0.15 });
  $$('.reveal, [data-count]').forEach(el => io.observe(el));

  /* ---------- hero reel ---------- */
  const reel = $$('[data-reel] img');
  if (reel.length && !reduce) {
    let r = 0;
    setInterval(() => { reel[r].classList.remove('on'); r = (r + 1) % reel.length; reel[r].classList.add('on'); }, 3200);
  }

  /* ---------- heart pop ---------- */
  const HEART = '<svg viewBox="0 0 24 24" class="heart-pop"><path d="M12 21s-8-4.6-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 6.4-8 11-8 11z"/></svg>';
  const like = (post, force) => {
    const btn = $('.like', post); if (!btn) return;
    const on = force ?? !btn.classList.contains('liked');
    btn.classList.toggle('liked', on);
    btn.setAttribute('aria-pressed', on);
  };
  $$('.like').forEach(b => b.addEventListener('click', () => like(b.closest('[data-post]'))));

  /* ---------- carousels ---------- */
  $$('.carousel').forEach(car => {
    const alt = car.dataset.alt || '';
    const pre = !car.dataset.images;
    const names = pre ? $$('.slide', car) : car.dataset.images.split(',');
    const post = car.closest('[data-post]');
    const dotsBox = post && $('.dots-ind', post);
    const slidesHTML = pre ? names.map(sl => sl.outerHTML).join('') : names.map((n, i) =>
      `<div class="slide" style="--bg-img:url(${IMG(n)})"><img src="${IMG(n)}" alt="${alt} — ${i + 1} of ${names.length}" loading="lazy" draggable="false"></div>`).join('');
    car.innerHTML = `<div class="track">${slidesHTML}</div>
      <span class="car-count">1/${names.length}</span>
      <button class="car-btn car-prev" aria-label="Previous image" disabled>‹</button>
      <button class="car-btn car-next" aria-label="Next image">›</button>`;
    const track = $('.track', car), cnt = $('.car-count', car), prev = $('.car-prev', car), next = $('.car-next', car);
    if (dotsBox) dotsBox.innerHTML = names.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('');
    $$('.slide img', car).forEach(img => {
      const fit = () => {
        const r = img.naturalHeight / img.naturalWidth;
        if (r > 1.18) img.parentElement.classList.add('cover');
        else if (r < 0.34) img.parentElement.classList.add('strip');
      };
      img.complete ? fit() : img.addEventListener('load', fit);
    });
    let idx = 0;
    const update = () => {
      idx = Math.round(track.scrollLeft / track.clientWidth);
      cnt.textContent = `${idx + 1}/${names.length}`;
      prev.disabled = idx === 0; next.disabled = idx === names.length - 1;
      if (dotsBox) $$('i', dotsBox).forEach((d, i) => d.classList.toggle('on', i === idx));
    };
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    update();
    if (names.length < 2) { cnt.hidden = true; prev.hidden = true; next.hidden = true; }
    prev.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth }));
    next.addEventListener('click', () => track.scrollBy({ left: track.clientWidth }));
    // single tap → lightbox, double tap → like
    let timer = null;
    track.addEventListener('click', e => {
      const slide = e.target.closest('.slide'); if (!slide) return;
      const zoomable = !!$('img', slide);
      if (timer) {
        clearTimeout(timer); timer = null;
        like(post, true);
        car.insertAdjacentHTML('beforeend', HEART);
        const h = car.lastElementChild; setTimeout(() => h.remove(), 950);
        return;
      }
      timer = setTimeout(() => { timer = null; if (zoomable) { const i = $('img', slide); openLB(i.src, i.alt); } }, 260);
    });
  });

  /* ---------- studio grid ---------- */
  const shots = [
    ['seuxe-09', 'post office mornings'], ['seuxe-13', 'áo dài season'], ['seuxe-06', 'temple light'],
    ['seuxe-14', 'riverside'], ['seuxe-16', 'in red'], ['seuxe-07', 'street cool'],
    ['seuxe-03', 'olive & pearls'], ['seuxe-08', 'into the woods'], ['seuxe-17', 'polka dots'],
    ['seuxe-05', 'besties'], ['seuxe-12', 'golden hour'], ['seuxe-04', 'turning 20'],
    ['seuxe-11', 'sisters'], ['seuxe-02', 'old town walk'], ['seuxe-18', 'family portrait'],
    ['seuxe-10', 'together'], ['seuxe-00', 'empty stadium'], ['seuxe-01', 'track day']
  ];
  const grid = $('[data-grid]');
  if (grid) {
    grid.innerHTML = shots.map(([f, c]) =>
      `<button class="tile reveal" data-cap="♥ ${c}"><img src="${IMG(f)}" alt="Sếu Xê Studio photoshoot — ${c}" loading="lazy"></button>`).join('');
    $$('.tile', grid).forEach((t, i) => {
      t.style.transitionDelay = `${(i % 3) * 80}ms`;
      io.observe(t);
      t.addEventListener('click', () => { const im = $('img', t); openLB(im.src, im.alt); });
    });
  }

  /* ---------- chat plays out ---------- */
  const chat = $('[data-chat]');
  if (chat) {
    const msgs = $$('.msg:not(.typing)', chat), typing = $('.typing', chat);
    if (reduce) { msgs.forEach(m => m.classList.add('show')); typing.remove(); }
    else {
      typing.classList.add('show');
      let played = false;
      new IntersectionObserver((es, ob) => {
        if (!es[0].isIntersecting || played) return;
        played = true; ob.disconnect();
        msgs.forEach((m, i) => setTimeout(() => {
          m.classList.add('show');
          if (i === msgs.length - 1) setTimeout(() => typing.remove(), 900);
        }, 250 + i * 420));
      }, { threshold: 0.2 }).observe(chat);
    }
  }

  /* ---------- stories ---------- */
  const STORIES = {
    about: { name: 'lya.nguyen', av: 'lya-avatar', slides: [
      { img: 'lya-neon', stk: 'Hi, I’m Lya 👋', t: 'A globally curious creative with a business mind.' },
      { img: 'lya-sun', stk: 'Class of ’26 🎓', g: 1, t: 'International Business & Trade — Ming Chuan University, Taipei. GPA 90/100 and the highest-scoring thesis in the department.' },
      { img: 'lya-saigon', h: 'VN → TW → the world 🌏', t: 'Studied in Ho Chi Minh City and Taipei, worked with teams in London and around the globe.' },
      { video: 'assets/lya-deloitte.mp4', img: 'lya-deloitte', h: 'Always out & about 📍', t: 'Curious about people, brands and what’s next.' },
      { img: 'seuxe-12', h: 'What I love', t: 'Turning people insights into ideas, strategies and stories — marketing, research, content & design.' } ] },
    cconcept: { name: 'c.concept.studio', emoji: '🧸', slides: [
      { card: '<span class="sc__emo">🧸</span><small>Marketing Intern · 2025</small><h3>A London art toy, heading to Vietnam</h3><p>Vietnam market analysis, communication planning and ideas for a new product line.</p>' },
      { card: '<small>The market</small><b class="sc__big">+665%</b><p>Labubu-related sales on Vietnamese e-commerce, Q2 vs Q1 2024. The toy market hit $1.004B.</p>', alt: 1 },
      { card: '<small>The new buyer</small><h3>19–25 · student · gift-giver</h3><p>Loves cute animal designs (55%), buys as gifts (47%), lives on TikTok (82%).</p>' },
      { img: 'newline-sketches', h: 'New product line ideas ✏️', t: 'I led ideas for a new line: personality-based figure sub-types and lucky-cat inspired designs, built from what Vietnamese buyers love.' } ] },
    seuxe: { name: 'seuxe.studio', av: 'seuxe-13', slides: [
      { img: 'seuxe-09', stk: '200+ shoots 📸', g: 1, t: 'Co-founded an online studio for outdoor & personal photoshoots.' },
      { img: 'seuxe-13', stk: '65% come back 💌', t: 'Client return rate — built on care from first DM to final gallery.' },
      { img: 'seuxe-16', h: 'End-to-end', t: 'Social strategy · client acquisition · styling · shoot coordination · post-production.' },
      { img: 'seuxe-14', h: 'See the grid ↓', t: 'Scroll to the Studio tab for more work.' } ] },
    ehub: { name: 'ehub.ftu2', av: 'ehub-mockup', slides: [
      { img: 'ehub-mockup', stk: 'Marketing Manager 🚀', t: 'EHub — the official startup community of Foreign Trade University. Nurturing student founders and connecting them with investors and partners.' },
      { img: 'yl-team', stk: '+1,252.9% engagement', g: 1, t: '30-day growth, plus 26,953 views (+209.7%), 20,463 followers (+31.8%) and 22K average views per post.' } ] },
    ic23: { name: 'reveal.the.elementals', av: 'ic-square', slides: [
      { img: 'ic-mockup', stk: 'Reveal the Elementals ⏳', t: 'Ideation Challenge 2023 — EHub’s business case competition for first-year students. Teams of 3, a real brief, 48 hours, one infographic.' },
      { card: '<small>The results</small><b class="sc__big">95%</b><p>of applicants went on to compete. +40% brand awareness, 80%+ retention, 100% application KPI and 20+ media partners.</p>', alt: 1 } ] },
    yl: { name: 'youpreneur.launchpad', av: 'yl24-kv', slides: [
      { img: 'yl24-kv', stk: 'Youpreneur Launchpad 2024 ⬡', t: 'EHub’s incubation program for students: idea to prototype in 3 stages, top 3 into the ESC incubator.' },
      { img: 'yl24-startxtech', h: 'It started with StartXTech', t: 'A warm-up workshop on startups and new technology, co-hosted with GFI Group and NEAR Vietnam Hub.' },
      { img: 'yl24-recruit', stk: 'Stage-by-stage plans 🗂️', g: 1, t: 'Masterplans, a daily posting calendar, seeding, email and media partners. 12,000+ followers and 10+ media partners.' } ] },
    awards: { name: 'lya.nguyen', av: 'lya-avatar', slides: [
      { img: 'lya-neon', stk: 'Best Graduation Thesis 🏆', g: 1, t: 'Ming Chuan University, 2026 — highest score in the department.' },
      { img: 'cert-nccu-champion', stk: 'First Prize 🥇', t: 'NCCU International Trade & Business Thematic Competition.' },
      { img: 'cert-gitm', h: 'GITM 2025 presenter', t: 'Blockchain vs. greenwashing perception in fashion brands.' },
      { img: 'cert-competition', h: 'NSTC Research Grant', t: 'Top 15 of 139 proposals university-wide.' } ] }
  };
  const ORDER = Object.keys(STORIES);
  const story = $('.story'), bars = $('.story__bars', story), media = $('.story__media', story),
        sImg = $('img', media), sBg = $('.story__bg', story), sText = $('.story__text', story);
  const sVid = document.createElement('video');
  Object.assign(sVid, { muted: true, loop: true, playsInline: true, hidden: true });
  media.appendChild(sVid);
  const sCard = document.createElement('div'); sCard.hidden = true; media.appendChild(sCard);
  let cur = null, si = 0, sTimer = null, lastFocus = null;
  const DUR = 5200;

  function show() {
    const s = STORIES[cur], sl = s.slides[si];
    $('.story__name', story).textContent = s.name;
    const hImg = $('.story__head img', story), hAv = $('.story__head .mini-av', story);
    hImg.hidden = !s.av; if (s.av) hImg.src = IMG(s.av);
    hAv.dataset.emoji = s.emoji || '';
    $('.story__time', story).textContent = `${si + 1}/${s.slides.length}`;
    bars.innerHTML = s.slides.map((_, i) => `<i class="${i < si ? 'done' : i === si ? 'run' : ''}"><b></b></i>`).join('');
    bars.style.setProperty('--dur', DUR + 'ms');
    media.classList.remove('cover');
    sImg.onload = () => { if (sImg.naturalHeight / sImg.naturalWidth > 1.2) media.classList.add('cover'); };
    if (sl.img) { sImg.src = IMG(sl.img); sImg.alt = sl.h || sl.stk || ''; }
    sVid.hidden = !sl.video; sImg.hidden = !!(sl.video || sl.card);
    sCard.hidden = !sl.card; sBg.hidden = !!sl.card;
    if (sl.card) { sCard.className = 'story__card' + (sl.alt ? ' alt' : ''); sCard.innerHTML = sl.card; }
    if (sl.video) { media.classList.add('cover'); sVid.src = sl.video; sVid.play().catch(() => {}); }
    else { sVid.pause(); sVid.removeAttribute('src'); }
    sBg.style.backgroundImage = sl.img ? `url(${IMG(sl.img)})` : 'none';
    sText.hidden = !!sl.card;
    sText.innerHTML = sl.card ? '' : (sl.stk ? `<span class="stk ${sl.g ? 'g' : ''}">${sl.stk}</span>` : '') + (sl.h ? `<h3>${sl.h}</h3>` : '') + `<p>${sl.t}</p>`;
    clearTimeout(sTimer);
    sTimer = setTimeout(go, DUR);
    $$(`.hl[data-story="${cur}"]`).forEach(h => h.classList.add('seen'));
  }
  function go(dir = 1) {
    const n = STORIES[cur].slides.length;
    si += dir;
    if (si >= n) { const k = ORDER.indexOf(cur) + 1; if (k >= ORDER.length) return closeStory(); cur = ORDER[k]; si = 0; }
    if (si < 0) { const k = ORDER.indexOf(cur) - 1; if (k < 0) { si = 0; } else { cur = ORDER[k]; si = STORIES[cur].slides.length - 1; } }
    show();
  }
  function openStory(key) {
    cur = key; si = 0; lastFocus = document.activeElement;
    story.hidden = false; document.body.style.overflow = 'hidden';
    show(); $('.story__close', story).focus();
  }
  function closeStory() {
    clearTimeout(sTimer); sVid.pause(); story.hidden = true; document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  $$('[data-story]').forEach(b => b.addEventListener('click', () => openStory(b.dataset.story)));
  $('.story__close', story).addEventListener('click', closeStory);
  $('.story__nav--next', story).addEventListener('click', () => go(1));
  $('.story__nav--prev', story).addEventListener('click', () => go(-1));
  story.addEventListener('click', e => { if (e.target === story) closeStory(); });
  addEventListener('keydown', e => {
    if (!lb.hidden && e.key === 'Escape') return closeLB();
    if (story.hidden) return;
    if (e.key === 'Escape') closeStory();
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  });

  /* ---------- active section in dock + tabs ---------- */
  const links = $$('.dock a[data-sec]'), tabs = $$('.tabs .tab');
  const secIO = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const id = en.target.id;
    links.forEach(a => a.classList.toggle('active', a.dataset.sec === id || (id === 'studio' && a.dataset.sec === 'work') || (id === 'awards' && a.dataset.sec === 'about')));
    tabs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['top', 'work', 'studio', 'about', 'awards', 'dm'].forEach(id => { const el = document.getElementById(id); if (el) secIO.observe(el); });

  /* ---------- copy email ---------- */
  $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    const label = $('.copy-label', btn);
    try { await navigator.clipboard.writeText(btn.dataset.copy); label.textContent = 'copied ✓'; }
    catch { location.href = 'mailto:' + btn.dataset.copy; }
    setTimeout(() => (label.textContent = 'copy'), 1800);
  }));

  /* ---------- DM composer → email ---------- */
  const form = $('[data-composer]');
  if (form) {
    const ta = $('textarea', form);
    $$('[data-q]', form).forEach(b => b.addEventListener('click', () => { ta.value = b.dataset.q; ta.focus(); }));
    form.addEventListener('submit', e => {
      e.preventDefault();
      const body = ta.value.trim() || 'Hi Lya!';
      location.href = `mailto:lyanguyen.space@gmail.com?subject=${encodeURIComponent('Hello from your portfolio 💌')}&body=${encodeURIComponent(body)}`;
    });
  }
})();
