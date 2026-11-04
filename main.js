(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav ---------- */
  const nav = $('.nav'), burger = $('.nav__burger');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('.nav__links a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open'); burger.setAttribute('aria-expanded', false);
  }));

  /* ---------- scroll progress ---------- */
  const bar = $('.progress');
  const onScroll = () => {
    const h = document.documentElement;
    bar.style.transform = `scaleX(${h.scrollTop / (h.scrollHeight - h.clientHeight || 1)})`;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- reveal + counters ---------- */
  const fmt = n => n.toLocaleString('en-US');
  const count = el => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = fmt(end) + suf; return; }
    const t0 = performance.now(), dur = 1600;
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(Math.round(end * e)) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      $$('[data-count]', en.target).forEach(count);
      io.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- Sếu Xê photo wall ---------- */
  const shots = [
    ['seuxe-09', 'post office mornings'], ['seuxe-12', 'golden hour', 1], ['seuxe-06', 'temple light'],
    ['seuxe-14', 'riverside'], ['seuxe-13', 'áo dài season'], ['seuxe-07', 'street cool'],
    ['seuxe-00', 'empty stadium', 1], ['seuxe-03', 'olive & pearls'], ['seuxe-08', 'into the woods'],
    ['seuxe-17', 'polka dots'], ['seuxe-05', 'besties'], ['seuxe-15', 'campus days', 1],
    ['seuxe-16', 'in red'], ['seuxe-04', 'turning 20'], ['seuxe-18', 'family portrait'],
    ['seuxe-01', 'track day']
  ];
  const wall = $('[data-wall]');
  if (wall) {
    shots.forEach(([f, cap, land], i) => {
      const fig = document.createElement('figure');
      fig.className = 'print' + (land ? ' land' : '');
      fig.innerHTML = `<img src="assets/img/${f}.jpg" alt="Sếu Xê Studio photoshoot — ${cap}" loading="lazy" draggable="false"><span>${cap}</span>`;
      const cols = 6, col = i % cols, row = Math.floor(i / cols);
      fig.style.left = `${2 + col * 15.5 + (Math.random() * 4 - 2)}%`;
      fig.style.top = `${4 + row * 27 + (Math.random() * 6 - 2)}%`;
      fig.style.rotate = `${(Math.random() * 16 - 8).toFixed(1)}deg`;
      fig.style.zIndex = i + 1;
      fig.dataset.full = `assets/img/${f}.jpg`;
      wall.appendChild(fig);
    });

    let z = 100;
    const desktop = () => matchMedia('(min-width: 721px)').matches;
    $$('.print', wall).forEach(p => {
      let sx, sy, ox, oy, moved = false, active = false;
      p.addEventListener('pointerdown', e => {
        if (!desktop()) return;
        active = true; moved = false;
        p.setPointerCapture(e.pointerId);
        sx = e.clientX; sy = e.clientY; ox = p.offsetLeft; oy = p.offsetTop;
        p.style.zIndex = ++z; p.classList.add('dragging');
      });
      p.addEventListener('pointermove', e => {
        if (!active) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
        const maxX = wall.clientWidth - p.offsetWidth, maxY = wall.clientHeight - p.offsetHeight;
        p.style.left = Math.max(-40, Math.min(maxX + 40, ox + dx)) + 'px';
        p.style.top = Math.max(-20, Math.min(maxY + 20, oy + dy)) + 'px';
      });
      const end = () => {
        if (!active) return;
        active = false; p.classList.remove('dragging');
        if (!moved) openLB(p.dataset.full, p.querySelector('img').alt);
      };
      p.addEventListener('pointerup', end);
      p.addEventListener('pointercancel', () => { active = false; p.classList.remove('dragging'); });
      p.addEventListener('click', () => { if (!desktop()) openLB(p.dataset.full, p.querySelector('img').alt); });
    });
  }

  /* ---------- lightbox ---------- */
  const lb = $('.lightbox'), lbImg = $('img', lb);
  function openLB(src, alt) {
    lbImg.src = src; lbImg.alt = alt || '';
    lb.hidden = false; document.body.style.overflow = 'hidden';
    $('.lightbox__close').focus();
  }
  const closeLB = () => { lb.hidden = true; document.body.style.overflow = ''; lbImg.src = ''; };
  lb.addEventListener('click', closeLB);
  addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) closeLB(); });
  $$('[data-zoom]').forEach(img => img.addEventListener('click', () => openLB(img.currentSrc || img.src, img.alt)));

  /* ---------- copy email ---------- */
  $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    const label = $('.copy-label', btn);
    try { await navigator.clipboard.writeText(btn.dataset.copy); label.textContent = 'copied ✓'; }
    catch { location.href = 'mailto:' + btn.dataset.copy; }
    setTimeout(() => (label.textContent = 'copy'), 1800);
  }));

  /* ---------- custom cursor ---------- */
  const cur = $('.cursor');
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
    const lab = $('span', cur);
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; }, { passive: true });
    (function loop() {
      cx += (x - cx) * 0.22; cy += (y - cy) * 0.22;
      cur.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('pointerover', e => {
      const t = e.target;
      if (t.closest('.print')) { cur.classList.add('is-big'); lab.textContent = 'DRAG'; }
      else if (t.closest('[data-zoom]')) { cur.classList.add('is-big'); lab.textContent = 'VIEW'; }
      else if (t.closest('a, button')) { cur.classList.add('is-big'); lab.textContent = '→'; }
      else cur.classList.remove('is-big');
    });
  } else cur.remove();

  /* ---------- gentle tilt on cover photo ---------- */
  const tilt = $('.tilt');
  if (tilt && !reduce && matchMedia('(hover: hover)').matches) {
    tilt.addEventListener('pointermove', e => {
      const r = tilt.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = `perspective(900px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) rotate(2deg)`;
    });
    tilt.addEventListener('pointerleave', () => (tilt.style.transform = ''));
  }
})();
