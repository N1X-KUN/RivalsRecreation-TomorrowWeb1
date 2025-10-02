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


