

'use strict';

/* PARTICLE BIOLUMINESCENCE */
(function initParticleOcean() {
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let W, H, mouseX = -999, mouseY = -999;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function rand(a, b) { return a + Math.random() * (b - a); }

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = rand(0, W); this.y = init ? rand(0, H) : H + 20;
      this.vx = rand(-0.15, 0.15); this.vy = rand(-0.3, -0.08);
      this.r = rand(0.8, 2.8); this.alpha = rand(0.15, 0.7);
      this.fadeDir = Math.random() > 0.5 ? 1 : -1;
      this.fadeSpeed = rand(0.003, 0.012);
      this.hue = Math.random() > 0.2 ? 185 : 160;
    }
    update() {
      const dx = this.x - mouseX, dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) { const f = (120 - dist) / 120 * 0.4; this.vx += dx / dist * f * 0.05; this.vy += dy / dist * f * 0.05; }
      this.x += this.vx; this.y += this.vy;
      this.alpha += this.fadeDir * this.fadeSpeed;
      if (this.alpha > 0.75 || this.alpha < 0.05) this.fadeDir *= -1;
      if (this.y < -20) this.reset(false);
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 3);
      g.addColorStop(0, `hsla(${this.hue},100%,70%,1)`);
      g.addColorStop(1, `hsla(${this.hue},100%,70%,0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const COUNT = Math.min(120, Math.floor(W * H / 14000));
  const particles = Array.from({ length: COUNT }, () => new Particle());

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  })();

  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });
})();

/* CUSTOM CURSOR */
(function initCursor() {
  if (window.matchMedia('(hover: none)').matches || window.innerWidth < 768) return;
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);
  let mx = -200, my = -200, rx = -200, ry = -200;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  const lerp = (a, b, t) => a + (b - a) * t;
  (function anim() {
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    rx = lerp(rx, mx, 0.12); ry = lerp(ry, my, 0.12);
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(anim);
  })();
})();

/* NAVBAR */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (!navbar) return;
  window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 50), { passive: true });
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('active');
      toggle.setAttribute('aria-expanded', isOpen);
      const spans = toggle.querySelectorAll('span');
      if (isOpen) { spans[0].style.transform = 'translateY(6.5px) rotate(45deg)'; spans[1].style.opacity = '0'; spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)'; }
      else spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
    document.addEventListener('click', e => {
      if (!navbar.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        toggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });
  }
})();

/* SCROLL REVEAL */
(function initScrollReveal() {
  const sel = '.stat-card,.creature-card,.creature-profile,.zone-entry,.exp-item,.mission-card,.info-card,.intro-text,.intro-visual,.cta-box,.contact-form-wrapper,.gallery-card,.stats>div,.review-card';
  const targets = document.querySelectorAll(sel);
  targets.forEach((el, i) => { el.classList.add('reveal'); el.style.transitionDelay = (i % 5 * 0.08) + 's'; });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(el => obs.observe(el));
})();

/* COUNTERS */
(function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;
  const ease = t => 1 - Math.pow(1 - t, 4);
  function animate(el) {
    const target = parseInt(el.dataset.target, 10);
    const start = performance.now();
    (function update(now) {
      const p = Math.min((now - start) / 2400, 1);
      el.textContent = Math.round(ease(p) * target).toLocaleString();
      if (p < 1) requestAnimationFrame(update);
    })(start);
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
})();

/* CREATURE FILTER */
(function initCreatureFilter() {
  const btns = document.querySelectorAll('.filter-btn');
  const profiles = document.querySelectorAll('.creature-profile');
  if (!btns.length) return;
  btns.forEach(btn => btn.addEventListener('click', () => {
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    profiles.forEach((card, i) => {
      const show = filter === 'all' || (card.dataset.tags || '').includes(filter);
      if (show) { card.classList.remove('hidden'); card.style.animation = `fade-up 0.4s ${i * 0.04}s ease-out both`; }
      else { card.classList.add('hidden'); card.style.animation = ''; }
    });
  }));
})();

/* CONTACT FORM */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const nameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const nameErr = document.getElementById('nameError');
  const emailErr = document.getElementById('emailError');
  const messageErr = document.getElementById('messageError');
  const charCount = document.getElementById('charCount');
  const submitBtn = document.getElementById('submitBtn');
  const successBox = document.getElementById('formSuccess');
  const btnText = submitBtn?.querySelector('.btn-text');
  const btnLoading = submitBtn?.querySelector('.btn-loading');

  if (messageInput && charCount) {
    messageInput.addEventListener('input', () => {
      const len = messageInput.value.length;
      charCount.textContent = len + ' / 500';
      charCount.style.color = len > 480 ? '#ff6b6b' : len > 400 ? 'var(--gold)' : 'var(--text-ghost)';
      if (len > 500) messageInput.value = messageInput.value.slice(0, 500);
    });
  }

  const showErr = (input, el, msg) => { el.textContent = msg; input.style.borderColor = '#ff6b6b'; input.style.boxShadow = '0 0 0 3px rgba(255,107,107,.1)'; };
  const clearErr = (input, el) => { el.textContent = ''; input.style.borderColor = ''; input.style.boxShadow = ''; };
  const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  function validateName() { const v = nameInput.value.trim(); if (!v) { showErr(nameInput, nameErr, 'Name is required.'); return false; } if (v.length < 2) { showErr(nameInput, nameErr, 'At least 2 characters.'); return false; } clearErr(nameInput, nameErr); return true; }
  function validateEmail() { const v = emailInput.value.trim(); if (!v) { showErr(emailInput, emailErr, 'Email is required.'); return false; } if (!validEmail(v)) { showErr(emailInput, emailErr, 'Enter a valid email.'); return false; } clearErr(emailInput, emailErr); return true; }
  function validateMessage() { const v = messageInput.value.trim(); if (!v) { showErr(messageInput, messageErr, 'Message is required.'); return false; } if (v.length < 10) { showErr(messageInput, messageErr, 'At least 10 characters.'); return false; } clearErr(messageInput, messageErr); return true; }

  if (nameInput) nameInput.addEventListener('blur', validateName);
  if (emailInput) emailInput.addEventListener('blur', validateEmail);
  if (messageInput) messageInput.addEventListener('blur', validateMessage);

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!(validateName() & validateEmail() & validateMessage())) return;
    if (btnText) btnText.hidden = true;
    if (btnLoading) btnLoading.hidden = false;
    submitBtn.disabled = true; submitBtn.style.opacity = '0.6';
    setTimeout(() => {
      if (btnText) btnText.hidden = false;
      if (btnLoading) btnLoading.hidden = true;
      submitBtn.disabled = false; submitBtn.style.opacity = '';
      form.querySelectorAll('fieldset').forEach(f => f.style.display = 'none');
      submitBtn.style.display = 'none';
      if (successBox) { successBox.hidden = false; successBox.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }, 1800);
  });
})();

/* ZONE SLIDE-IN */
(function initZoneAnimations() {
  const entries = document.querySelectorAll('.zone-entry');
  if (!entries.length) return;
  const obs = new IntersectionObserver(items => {
    items.forEach(item => {
      if (item.isIntersecting) { item.target.style.opacity = '1'; item.target.style.transform = 'translateX(0)'; obs.unobserve(item.target); }
    });
  }, { threshold: 0.12 });
  entries.forEach((el, i) => { el.style.opacity = '0'; el.style.transform = 'translateX(-24px)'; el.style.transition = `opacity .65s ${i * .1}s ease, transform .65s ${i * .1}s ease`; obs.observe(el); });
})();

/* EXPEDITION FADE-IN */
(function initExpeditionAnimations() {
  const items = document.querySelectorAll('.exp-item');
  if (!items.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  items.forEach((el, i) => { el.style.opacity = '0'; el.style.transform = 'translateY(28px)'; el.style.transition = `opacity .65s ${i * .08}s ease, transform .65s ${i * .08}s ease`; obs.observe(el); });
})();

/* CLICK RIPPLE */
(function initClickRipple() {
  const s = document.createElement('style');
  s.textContent = '@keyframes ripple-out{0%{transform:scale(.1);opacity:.8}100%{transform:scale(5);opacity:0}}';
  document.head.appendChild(s);
  document.addEventListener('click', e => {
    if (e.target.closest('a,button,input,select,textarea')) return;
    const r = document.createElement('div');
    r.style.cssText = `position:fixed;left:${e.clientX - 30}px;top:${e.clientY - 30}px;width:60px;height:60px;border-radius:50%;border:1px solid rgba(0,212,255,.6);pointer-events:none;z-index:9998;animation:ripple-out .8s ease-out forwards;`;
    document.body.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  });
})();

/* PARALLAX */
(function initParallax() {
  const rays = document.querySelectorAll('.light-ray');
  if (!rays.length) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    rays.forEach((ray, i) => { ray.style.transform = `rotate(var(--rr)) translateY(${y * (0.04 + i * 0.015)}px)`; });
  }, { passive: true });
})();

/* PAGE TRANSITION */
(function initPageTransition() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  window.addEventListener('load', () => requestAnimationFrame(() => document.body.style.opacity = '1'));
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      document.body.style.opacity = '0';
      setTimeout(() => window.location.href = href, 380);
    });
  });
})();

/* HERO TAG TYPEWRITER */
(function initHeroTag() {
  const tag = document.querySelector('.hero-tag');
  if (!tag) return;
  const text = tag.textContent;
  tag.textContent = '';
  let i = 0;
  setTimeout(() => {
    const iv = setInterval(() => { tag.textContent += text[i++]; if (i >= text.length) clearInterval(iv); }, 38);
  }, 700);
})();

/* KONAMI STORM */
(function initKonamiCode() {
  const K = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let seq = [];
  document.addEventListener('keydown', e => {
    seq.push(e.key); if (seq.length > K.length) seq.shift();
    if (JSON.stringify(seq) === JSON.stringify(K)) {
      const s = document.createElement('style');
      s.textContent = '@keyframes sk{0%{transform:scale(0);opacity:1}60%{transform:scale(2);opacity:.8}100%{transform:scale(.5) translateY(-50px);opacity:0}}';
      document.head.appendChild(s);
      for (let i = 0; i < 50; i++) setTimeout(() => {
        const sp = document.createElement('div');
        const sz = 4 + Math.random() * 14;
        sp.style.cssText = `position:fixed;left:${Math.random()*100}vw;top:${Math.random()*100}vh;width:${sz}px;height:${sz}px;border-radius:50%;background:radial-gradient(circle,rgba(0,255,204,.9),transparent 70%);box-shadow:0 0 ${sz*2}px rgba(0,212,255,.9);pointer-events:none;z-index:9999;animation:sk 1.4s ease-out forwards;`;
        document.body.appendChild(sp);
        sp.addEventListener('animationend', () => sp.remove());
      }, i * 50);
      document.body.style.transition = 'filter .3s';
      document.body.style.filter = 'brightness(1.5) saturate(1.8)';
      setTimeout(() => document.body.style.filter = '', 500);
      seq = [];
    }
  });
})();
