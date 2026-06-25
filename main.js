/* ============================================================
   WILL WEB DESIGN — Main JavaScript
   willwebdesign.co.uk | v1.0
   ============================================================ */

'use strict';

/* =============================================
   1. CANVAS PARTICLE SYSTEM
   ============================================= */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const CFG = {
    count: window.innerWidth < 768 ? 45 : 90,
    color: '14,165,233',
    speed: 0.38,
    linkDist: 130,
    mouseRad: 110,
    maxR: 2.2,
    minR: 0.5,
  };

  let particles = [];
  let W, H;
  let mouse = { x: null, y: null };
  let raf;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class P {
    constructor() { this.spawn(); }
    spawn() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - .5) * CFG.speed;
      this.vy = (Math.random() - .5) * CFG.speed;
      this.r  = CFG.minR + Math.random() * (CFG.maxR - CFG.minR);
      this.a  = .1 + Math.random() * .45;
      this.phase = Math.random() * Math.PI * 2;
      this.phaseSpeed = .006 + Math.random() * .018;
    }
    update() {
      this.phase += this.phaseSpeed;
      if (mouse.x !== null) {
        const dx = this.x - mouse.x, dy = this.y - mouse.y;
        const d  = Math.hypot(dx, dy);
        if (d < CFG.mouseRad) {
          const f = (CFG.mouseRad - d) / CFG.mouseRad * .28;
          this.vx += (dx / d) * f;
          this.vy += (dy / d) * f;
        }
      }
      this.vx *= .985; this.vy *= .985;
      const sp = Math.hypot(this.vx, this.vy);
      if (sp > CFG.speed * 2.5) {
        this.vx = (this.vx / sp) * CFG.speed * 2.5;
        this.vy = (this.vy / sp) * CFG.speed * 2.5;
      }
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0) this.x = W;
      if (this.x > W) this.x = 0;
      if (this.y < 0) this.y = H;
      if (this.y > H) this.y = 0;
    }
    draw() {
      const alpha = this.a * (.65 + .35 * Math.sin(this.phase));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CFG.color},${alpha.toFixed(2)})`;
      ctx.fill();
    }
  }

  function links() {
    for (let i = 0; i < particles.length - 1; i++) {
      const pi = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const pj = particles[j];
        const d  = Math.hypot(pi.x - pj.x, pi.y - pj.y);
        if (d < CFG.linkDist) {
          ctx.beginPath();
          ctx.moveTo(pi.x, pi.y);
          ctx.lineTo(pj.x, pj.y);
          ctx.strokeStyle = `rgba(${CFG.color},${((1 - d / CFG.linkDist) * .22).toFixed(2)})`;
          ctx.lineWidth = .75;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    links();
    particles.forEach(p => { p.update(); p.draw(); });
    raf = requestAnimationFrame(loop);
  }

  resize();
  particles = Array.from({ length: CFG.count }, () => new P());
  loop();

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  canvas.addEventListener('mousemove', e => {
    const r  = canvas.getBoundingClientRect();
    mouse.x  = e.clientX - r.left;
    mouse.y  = e.clientY - r.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = mouse.y = null; });
}

/* =============================================
   2. COUNTER ANIMATIONS
   ============================================= */
function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || entry.target.dataset.counted) return;
      entry.target.dataset.counted = '1';
      runCount(entry.target);
    });
  }, { threshold: .5 });

  els.forEach(el => io.observe(el));

  function runCount(el) {
    const target   = +el.dataset.count;
    const suffix   = el.dataset.suffix || '';
    const prefix   = el.dataset.prefix || '';
    const duration = 2000;
    const t0       = performance.now();

    function tick(now) {
      const pct  = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - pct, 3);
      el.textContent = prefix + Math.floor(ease * target).toLocaleString() + suffix;
      if (pct < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target.toLocaleString() + suffix;
    }
    requestAnimationFrame(tick);
  }
}

/* =============================================
   3. SCROLL REVEAL
   ============================================= */
function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('revealed');
    });
  }, { threshold: .08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* =============================================
   4. BEFORE / AFTER SLIDER
   ============================================= */
function initSlider() {
  const wrap = document.getElementById('comparison-wrap');
  if (!wrap) return;

  const after  = wrap.querySelector('.comparison-after');
  const handle = wrap.querySelector('.comparison-handle');
  let dragging = false;
  let pct = 50;

  function set(p) {
    pct = Math.max(4, Math.min(96, p));
    after.style.clipPath  = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left     = pct + '%';
  }

  function getP(e) {
    const r = wrap.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    return (x / r.width) * 100;
  }

  wrap.addEventListener('mousedown',  e => { dragging = true; e.preventDefault(); });
  wrap.addEventListener('touchstart', () => { dragging = true; }, { passive: true });
  document.addEventListener('mousemove',  e => { if (dragging) set(getP(e)); });
  document.addEventListener('touchmove',  e => { if (dragging) set(getP(e)); }, { passive: true });
  document.addEventListener('mouseup',    () => { dragging = false; });
  document.addEventListener('touchend',   () => { dragging = false; });

  set(50);
}

/* =============================================
   5. NAVBAR SCROLL
   ============================================= */
function initNav() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;

  /* account for announcement bar height */
  let annH = document.querySelector('.announcement-bar')?.offsetHeight || 0;

  function update() {
    if (window.scrollY > annH + 10) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* =============================================
   6. MOBILE MENU
   ============================================= */
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const close  = document.getElementById('menu-close');
  const menu   = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  const open  = () => { menu.classList.add('active');    document.body.style.overflow = 'hidden'; };
  const shut  = () => { menu.classList.remove('active'); document.body.style.overflow = ''; };

  toggle.addEventListener('click', open);
  close?.addEventListener('click', shut);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', shut));
}

/* =============================================
   7. FAQ ACCORDION
   ============================================= */
function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* =============================================
   8. QUOTE MODAL
   ============================================= */
function initQuoteModal() {
  const modal = document.getElementById('quote-modal');
  if (!modal) return;

  const openM  = () => { modal.classList.add('active');    document.body.style.overflow = 'hidden'; };
  const closeM = () => { modal.classList.remove('active'); document.body.style.overflow = ''; };

  document.querySelectorAll('[data-quote]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); openM(); });
  });
  document.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', closeM));
  modal.addEventListener('click', e => { if (e.target === modal) closeM(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeM(); });

  const form = document.getElementById('quote-form');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    const subject = encodeURIComponent(`Quote Request — ${d.business || d.name}`);
    const body    = encodeURIComponent(
      `Name: ${d.name}\nBusiness: ${d.business}\nEmail: ${d.email}\nPhone: ${d.phone}\nService: ${d.service}\nMessage: ${d.message || ''}`
    );
    window.location.href = `mailto:hello@willwebdesign.co.uk?subject=${subject}&body=${body}`;
    closeM();
  });
}

/* =============================================
   9. EXIT INTENT POPUP
   ============================================= */
function initExitIntent() {
  const popup = document.getElementById('exit-popup');
  if (!popup) return;
  if (sessionStorage.getItem('wwd_exit')) return;

  let fired = false;
  document.addEventListener('mouseleave', e => {
    if (e.clientY <= 0 && !fired) {
      fired = true;
      sessionStorage.setItem('wwd_exit', '1');
      popup.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });

  const dismiss = () => { popup.classList.remove('active'); document.body.style.overflow = ''; };
  document.querySelectorAll('[data-close-exit]').forEach(el => el.addEventListener('click', dismiss));
  popup.addEventListener('click', e => { if (e.target === popup) dismiss(); });
}

/* =============================================
   10. CONTACT + AUDIT FORMS
   ============================================= */
function initForms() {
  /* Contact form */
  const cf = document.getElementById('contact-form');
  cf?.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(cf).entries());
    const subject = encodeURIComponent(`Website Enquiry — ${d.business || d.name}`);
    const body    = encodeURIComponent(
      `Name: ${d.name}\nBusiness: ${d.business}\nEmail: ${d.email}\nPhone: ${d.phone}\nMessage: ${d.message}`
    );
    const btn = cf.querySelector('[type="submit"]');
    btn.textContent = '✓ Message Sent! Redirecting…';
    btn.disabled = true;
    btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
    setTimeout(() => { window.location.href = `mailto:hello@willwebdesign.co.uk?subject=${subject}&body=${body}`; }, 800);
  });

  /* Audit form */
  const af = document.getElementById('audit-form');
  af?.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(af).entries());
    const subject = encodeURIComponent(`Free Website Audit — ${d.name}`);
    const body    = encodeURIComponent(`Name: ${d.name}\nWebsite URL: ${d.url}\nEmail: ${d.email}\nBusiness Type: ${d.type || 'Not specified'}`);
    const btn = af.querySelector('[type="submit"]');
    btn.textContent = '✓ Audit Requested!';
    btn.disabled = true;
    btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
    setTimeout(() => { window.location.href = `mailto:hello@willwebdesign.co.uk?subject=${subject}&body=${body}`; }, 800);
  });
}

/* =============================================
   11. TYPING EFFECT (hero sub-label)
   ============================================= */
function initTyping() {
  const el = document.getElementById('typing-target');
  if (!el) return;

  const phrases = [
    'Plumbers & Heating Engineers',
    'Electricians & Spark Contractors',
    'Roofers & Cladding Specialists',
    'Gardeners & Landscapers',
    'Window Cleaners & Pressure Washers',
    'All Local Tradespeople',
  ];

  let pi = 0, ci = 0, del = false;

  function tick() {
    const phrase = phrases[pi];
    if (!del) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { del = true; return setTimeout(tick, 2200); }
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; return setTimeout(tick, 300); }
    }
    setTimeout(tick, del ? 42 : 68);
  }
  tick();
}

/* =============================================
   12. SMOOTH SCROLL
   ============================================= */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
}

/* =============================================
   BOOT
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initCounters();
  initReveal();
  initSlider();
  initNav();
  initMobileMenu();
  initFAQ();
  initQuoteModal();
  initExitIntent();
  initForms();
  initTyping();
  initSmoothScroll();
});
