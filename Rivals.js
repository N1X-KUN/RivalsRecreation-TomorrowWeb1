(function() {
  const root = document.documentElement;

  // Mobile drawer
  const hamburger = document.querySelector('.hamburger');
  const drawer = document.getElementById('mobile-drawer');
  if (hamburger && drawer) {
    function setOpen(open) {
      drawer.toggleAttribute('hidden', !open);
      drawer.toggleAttribute('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    }
    hamburger.addEventListener('click', () => {
      const open = !drawer.hasAttribute('open');
      setOpen(open);
    });
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) setOpen(false);
    });
  }

  // Scroll reveal
  const revealables = Array.from(document.querySelectorAll('[data-reveal]'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.18 });
    revealables.forEach(el => io.observe(el));
  } else {
    revealables.forEach(el => el.classList.add('revealed'));
  }

  // Parallax orbs (scroll + mouse)
  const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]'));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mouseX = 0, mouseY = 0;
  function applyParallax() {
    if (!parallaxEls.length) return;
    const scrollY = window.scrollY || window.pageYOffset;
    parallaxEls.forEach(el => {
      const depth = Number(el.getAttribute('data-depth') || '0.05');
      const x = (mouseX - window.innerWidth / 2) * depth * 0.04;
      const y = (mouseY - window.innerHeight / 2) * depth * 0.04 + scrollY * depth * 0.4;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }
  if (!prefersReduced) {
    window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; applyParallax(); }, { passive: true });
    window.addEventListener('scroll', applyParallax, { passive: true });
    applyParallax();
  }

  // Magnetic buttons + shine
  function makeMagnetic(el) {
    const rect = () => el.getBoundingClientRect();
    function onMove(e) {
      const r = rect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * 0.08}px, ${dy * 0.08}px)`;
      el.style.boxShadow = `0 10px 24px rgba(233,61,84,0.35)`;
      const shine = el.querySelector('.shine');
      if (shine) {
        const mx = ((e.clientX - r.left) / r.width) * 100 + '%';
        const my = ((e.clientY - r.top) / r.height) * 100 + '%';
        shine.style.setProperty('--mx', mx);
        shine.style.setProperty('--my', my);
      }
    }
    function onLeave() {
      el.style.transform = 'translate(0, 0)';
      el.style.boxShadow = '';
    }
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
  }
  document.querySelectorAll('[data-magnetic]').forEach(makeMagnetic);

  // Tilt cards
  function makeTilt(el) {
    const strength = 10;
    const reset = () => {
      el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
    };
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const rx = (-py * strength).toFixed(2);
      const ry = (px * strength).toFixed(2);
      el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      el.style.setProperty('--mx', (px * 100 + 50) + '%');
      el.style.setProperty('--my', (py * 100 + 50) + '%');
    });
    el.addEventListener('mouseleave', reset);
    reset();
  }
  if (!prefersReduced) {
    document.querySelectorAll('[data-tilt]').forEach(makeTilt);
  }

  // Carousel (autoplay, buttons, drag)
  const track = document.getElementById('maps-track');
  const btnPrev = document.getElementById('prev');
  const btnNext = document.getElementById('next');
  if (track) {
    let auto = null; let isDown = false; let startX = 0; let scrollLeft = 0;
    const startAuto = () => {
      stopAuto();
      auto = setInterval(() => {
        track.scrollBy({ left: track.clientWidth * 0.9, behavior: 'smooth' });
        if (Math.ceil(track.scrollLeft + track.clientWidth) >= track.scrollWidth) {
          track.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }, 3500);
    };
    const stopAuto = () => { if (auto) { clearInterval(auto); auto = null; } };
    startAuto();
    track.addEventListener('pointerdown', (e) => { isDown = true; startX = e.clientX; scrollLeft = track.scrollLeft; track.setPointerCapture(e.pointerId); stopAuto(); });
    track.addEventListener('pointerup', (e) => { isDown = false; track.releasePointerCapture(e.pointerId); startAuto(); });
    track.addEventListener('pointerleave', () => { isDown = false; });
    track.addEventListener('pointermove', (e) => { if (!isDown) return; const dx = e.clientX - startX; track.scrollLeft = scrollLeft - dx; });
    if (btnPrev) btnPrev.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth * 0.9, behavior: 'smooth' }));
    if (btnNext) btnNext.addEventListener('click', () => track.scrollBy({ left: track.clientWidth * 0.9, behavior: 'smooth' }));
  }

  // Keyboard focus styles: show outline only when tabbing
  function handleFirstTab(e) {
    if (e.key === 'Tab') {
      root.classList.add('user-tabbing');
      window.removeEventListener('keydown', handleFirstTab);
      window.addEventListener('mousedown', handleMouseDownOnce);
    }
  }
  function handleMouseDownOnce() {
    root.classList.remove('user-tabbing');
    window.removeEventListener('mousedown', handleMouseDownOnce);
    window.addEventListener('keydown', handleFirstTab);
  }
  window.addEventListener('keydown', handleFirstTab);

  // Enhance outlines for tabbing
  const style = document.createElement('style');
  style.textContent = `.user-tabbing :focus { outline: 2px solid ${getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#e93d54'} !important; outline-offset: 2px; }`;
  document.head.appendChild(style);
})();


