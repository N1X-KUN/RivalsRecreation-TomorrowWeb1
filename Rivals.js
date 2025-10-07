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

  // Login Popup
  const loginPopup = document.getElementById('login-popup');
  const loginBtn = document.getElementById('login-btn');
  const mobileLoginBtn = document.getElementById('mobile-login-btn');
  const loginClose = document.querySelector('.login-close');
  const loginOverlay = document.querySelector('.login-overlay');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  function openLoginPopup() {
    loginPopup.toggleAttribute('hidden', false);
    loginPopup.toggleAttribute('open', true);
    document.body.style.overflow = 'hidden';
  }

  function closeLoginPopup() {
    loginPopup.toggleAttribute('hidden', true);
    loginPopup.toggleAttribute('open', false);
    document.body.style.overflow = '';
  }

  function switchTab(tabName) {
    tabBtns.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
  }

  if (loginBtn) loginBtn.addEventListener('click', (e) => { e.preventDefault(); openLoginPopup(); });
  if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', (e) => { e.preventDefault(); openLoginPopup(); });
  if (loginClose) loginClose.addEventListener('click', closeLoginPopup);
  if (loginOverlay) loginOverlay.addEventListener('click', closeLoginPopup);

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  // Close popup with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && loginPopup && loginPopup.hasAttribute('open')) {
      closeLoginPopup();
    }
  });

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

  // Parallax orbs (scroll + mouse) + Lightning Effect
  const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]'));
  const heroSection = document.querySelector('.hero');
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
  
  function updateLightningEffect(e) {
    if (heroSection) {
      const rect = heroSection.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      heroSection.style.setProperty('--mouse-x', x + '%');
      heroSection.style.setProperty('--mouse-y', y + '%');
    }
  }
  
  if (!prefersReduced) {
    window.addEventListener('mousemove', (e) => { 
      mouseX = e.clientX; 
      mouseY = e.clientY; 
      applyParallax();
      updateLightningEffect(e);
    }, { passive: true });
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

  // Maps Roulette (mouse direction control with persistence)
  const mapsRoulette = document.getElementById('maps-roulette');
  const rouletteTrack = document.getElementById('roulette-track');
  
  if (mapsRoulette && rouletteTrack) {
    let mouseX = 0;
    let isHovering = false;
    let lastDirection = 'right'; // Default direction
    let lastSpeed = 'normal'; // normal, slow, fast
    let isPaused = false;
    let currentSlideIndex = 0;
    
    function updateRouletteDirection(e) {
      if (!isHovering) return;
      
      const rect = mapsRoulette.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseXRelative = e.clientX - rect.left;
      const mouseYRelative = e.clientY - rect.top;
      
      // Calculate distance from center
      const distanceFromCenter = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      );
      
      // Center pause zone (60px radius)
      if (distanceFromCenter < 60) {
        isPaused = true;
        mapsRoulette.classList.add('paused');
        mapsRoulette.classList.remove('fast-right', 'fast-left', 'slow-right', 'slow-left', 'normal-right', 'normal-left');
        return;
      }
      
      // Remove paused state
      isPaused = false;
      mapsRoulette.classList.remove('paused');
      
      // Determine direction and speed based on mouse position
      const centerXRelative = rect.width / 2;
      const distanceFromCenterX = mouseXRelative - centerXRelative;
      const maxDistance = rect.width / 2;
      const intensity = Math.abs(distanceFromCenterX) / maxDistance;
      
      // Clear all direction classes
      mapsRoulette.classList.remove('fast-right', 'fast-left', 'slow-right', 'slow-left', 'normal-right', 'normal-left');
      
      if (distanceFromCenterX > 20) {
        // Mouse on right side - scroll right
        lastDirection = 'right';
        if (intensity > 0.6) {
          lastSpeed = 'fast';
          mapsRoulette.classList.add('fast-right');
        } else {
          lastSpeed = 'slow';
          mapsRoulette.classList.add('slow-right');
        }
      } else if (distanceFromCenterX < -20) {
        // Mouse on left side - scroll left
        lastDirection = 'left';
        if (intensity > 0.6) {
          lastSpeed = 'fast';
          mapsRoulette.classList.add('fast-left');
        } else {
          lastSpeed = 'slow';
          mapsRoulette.classList.add('slow-left');
        }
      }
    }
    
    function resumeLastDirection() {
      // Resume with the last known direction and speed
      mapsRoulette.classList.remove('paused', 'fast-right', 'fast-left', 'slow-right', 'slow-left', 'normal-right', 'normal-left');
      
      if (lastDirection === 'right') {
        if (lastSpeed === 'fast') {
          mapsRoulette.classList.add('fast-right');
        } else if (lastSpeed === 'slow') {
          mapsRoulette.classList.add('slow-right');
        } else {
          mapsRoulette.classList.add('normal-right');
        }
      } else {
        if (lastSpeed === 'fast') {
          mapsRoulette.classList.add('fast-left');
        } else if (lastSpeed === 'slow') {
          mapsRoulette.classList.add('slow-left');
        } else {
          mapsRoulette.classList.add('normal-left');
        }
      }
    }
    
    mapsRoulette.addEventListener('mouseenter', (e) => {
      isHovering = true;
      updateRouletteDirection(e);
    });
    
    mapsRoulette.addEventListener('mousemove', updateRouletteDirection);
    
    mapsRoulette.addEventListener('mouseleave', () => {
      isHovering = false;
      // Don't reset to default - resume last direction
      resumeLastDirection();
    });
    
    // Handle touch events for mobile
    mapsRoulette.addEventListener('touchstart', (e) => {
      isHovering = true;
      const touch = e.touches[0];
      updateRouletteDirection(touch);
    });
    
    mapsRoulette.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      updateRouletteDirection(touch);
    });
    
    mapsRoulette.addEventListener('touchend', () => {
      isHovering = false;
      resumeLastDirection();
    });
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

  // Inject global social sidebar
  (function injectSocialSidebar(){
    if (document.querySelector('.social-sidebar')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'social-sidebar';
    wrapper.innerHTML = `
      <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.9v-7h-2.3V12h2.3V9.8c0-2.27 1.35-3.53 3.43-3.53.99 0 2.03.18 2.03.18v2.22h-1.14c-1.12 0-1.47.69-1.47 1.4V12h2.5l-.4 2.9h-2.1v7A10 10 0 0 0 22 12z"/></svg>
      </a>
      <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.2A2.8 2.8 0 1 0 12 16.8 2.8 2.8 0 0 0 12 9.2zM17.5 6.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/></svg>
      </a>
      <a href="https://x.com" target="_blank" rel="noopener" aria-label="X">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M3 3h3.7l5.1 7 5.5-7H21l-7.3 9.3L21 21h-3.7l-5.5-7.6L6 21H3l7.8-9.9L3 3z"/></svg>
      </a>
      <a href="https://youtube.com" target="_blank" rel="noopener" aria-label="YouTube">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.5 12 4.5 12 4.5s-5.7 0-7.5.6A3 3 0 0 0 2.4 7.2C1.8 9 1.8 12 1.8 12s0 3 .6 4.8a3 3 0 0 0 2.1 2.1c1.8.6 7.5.6 7.5.6s5.7 0 7.5-.6a3 3 0 0 0 2.1-2.1c.6-1.8.6-4.8.6-4.8s0-3-.6-4.8zM10 15.3V8.7l6 3.3-6 3.3z"/></svg>
      </a>
      <a href="https://discord.com" target="_blank" rel="noopener" aria-label="Discord">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M20.317 4.37a19.8 19.8 0 0 0-4.885-1.515c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25A19.74 19.74 0 0 0 3.677 4.37C.533 9.046-.32 13.58.099 18.057a19.9 19.9 0 0 0 5.993 3.03c.462-.63.874-1.295 1.226-1.994a12.9 12.9 0 0 1-1.872-.892 10.2 10.2 0 0 0 .372-.292c3.928 1.793 8.18 1.793 12.062 0 .12.098.246.198.373.292-.56.324-1.2.635-1.873.892.36.698.772 1.362 1.225 1.993a19.84 19.84 0 0 0 6.002-3.03c.5-5.177-.838-9.674-3.549-13.66z"/></svg>
      </a>
    `;
    document.body.appendChild(wrapper);
  })();

  // Cookie banner: show once per session until a choice or close
  (function cookieBanner(){
    if (sessionStorage.getItem('cookieBannerSeen')) return;
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML = `
      <div class="cookie-head">
        <h4 class="cookie-title">We use cookies</h4>
        <button class="cookie-btn" data-action="close" aria-label="Close">×</button>
      </div>
      <p>Cookies help us improve your experience and keep things secure. You can accept or deny. This is a demo banner only.</p>
      <div class="cookie-actions">
        <button class="cookie-btn" data-action="deny">Deny</button>
        <button class="cookie-btn" data-action="adjust">Adjust</button>
        <button class="cookie-btn primary" data-action="accept">Accept all</button>
      </div>
    `;
    document.body.appendChild(banner);
    // slight delay for layout
    requestAnimationFrame(() => banner.setAttribute('open', ''));
    const done = () => { sessionStorage.setItem('cookieBannerSeen', '1'); banner.remove(); };
    banner.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      done();
    });
  })();

  // Hero video splash -> banner transition
  const heroVideo = document.getElementById('hero-video');
  const heroContent = document.querySelector('.hero .content');
  if (heroVideo && heroContent) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      heroVideo.classList.remove('video-intro');
      heroVideo.classList.add('video-banner');
      heroContent.classList.add('visible');
    } else {
      // Lock scroll during splash
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const SPLASH_MS = 8000; // 8 seconds fullscreen splash
      setTimeout(() => {
        // Smooth FLIP transition from fullscreen to hero banner position
        const heroSection = document.querySelector('.hero');
        const heroRect = heroSection ? heroSection.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };

        // First: measure fullscreen (A)
        const startRect = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        const endRect = heroRect; // where the banner will be

        // Compute scale and translate
        const scaleX = endRect.width / startRect.width;
        const scaleY = endRect.height / startRect.height;
        const translateX = endRect.left - startRect.left;
        const translateY = endRect.top - startRect.top;

        // Apply transform to animate into place
        heroVideo.style.transformOrigin = 'top left';
        heroVideo.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;

        // When the transform animation ends, switch to in-hero layout class
        const onTransitionEnd = () => {
          heroVideo.removeEventListener('transitionend', onTransitionEnd);
          heroVideo.style.transform = '';
          heroVideo.classList.remove('video-intro');
          heroVideo.classList.add('video-banner');
          heroContent.classList.add('visible');
          document.body.style.overflow = originalOverflow || '';
          try { heroVideo.loop = true; } catch (_) {}
        };
        heroVideo.addEventListener('transitionend', onTransitionEnd);
      }, SPLASH_MS);
    }
  }

})();


