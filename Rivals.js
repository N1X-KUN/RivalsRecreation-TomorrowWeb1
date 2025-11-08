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
        <h4 class="cookie-title">We Got Cookies... Want Some?</h4>
        <button class="cookie-btn" data-action="close" aria-label="Close">×</button>
      </div>
      <p>A cookie is a dessert food with different toppings, like chocolate chips, raisins, and many more. So the dev finished this site thanks to some delicious cookies! </p>
      <div class="cookie-actions">
        <button class="cookie-btn" data-action="deny">I Dislike Cookies</button>
        <button class="cookie-btn primary" data-action="accept">I Eat Cookies</button>
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

  // Starlord's Mixtapes - floating audio player with persistence across pages
  (function mixtape(){
    if (document.querySelector('.mixtape')) return;
    const state = {
      list: [
        // Put your own files in Videos/ or elsewhere and update paths below
        { title: "Guardians Of The Galaxy", src: "Videos/Guardians Music.mp3" },
        { title: "Fantastic 4", src: "Videos/Fantastic Music.mp3" },
        { title: "The Avengers", src: "Videos/Avengers Music.mp3" },
        { title: "Marvel's Ultimate", src: "Videos/Marvel Music.mp3" }
      ],
      index: 0,
      time: 0,
      playing: true,
      volume: 0.2,
      collapsed: localStorage.getItem('mixtape.collapsed') === 'true'
    };

    const wrap = document.createElement('div');
    wrap.className = 'mixtape' + (state.collapsed ? ' collapsed' : '');
    wrap.innerHTML = `
      <div class="panel" role="region" aria-label="Starlord's Mixtapes">
        <div class="head">
          <strong class="title">Starlord's Mixtapes</strong>
          <button class="close-btn" title="Collapse" aria-label="Collapse">×</button>
        </div>
        <div class="art" aria-hidden="true"></div>
        <div class="meta">
          <span class="label">${state.list[state.index]?.title || '—'}</span>
          <span class="time" aria-live="off">0:00</span>
        </div>
        <div class="progress" aria-label="Progress"><span></span></div>
        <div class="controls">
          <button class="prev" title="Previous" aria-label="Previous">⏮</button>
          <button class="play" title="Play/Pause" aria-label="Play/Pause">⏸</button>
          <button class="next" title="Next" aria-label="Next">⏭</button>
        </div>
      </div>
      <button class="fab" title="Open Starlord's Mixtapes" aria-label="Open Mixtapes" ${state.collapsed ? '' : 'style="display:none"'}>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 7h16v10H4z"/><path d="M8 10h2v4H8zM14 10h2v4h-2z"/></svg>
      </button>
      <audio preload="auto"></audio>
    `;
    document.body.appendChild(wrap);

    const audio = wrap.querySelector('audio');
    const btnPlay = wrap.querySelector('.play');
    const btnPrev = wrap.querySelector('.prev');
    const btnNext = wrap.querySelector('.next');
    const btnCollapse = wrap.querySelector('.close-btn');
    const fab = wrap.querySelector('.fab');
    const progress = wrap.querySelector('.progress');
    const progressBar = progress.querySelector('span');
    const timeEl = wrap.querySelector('.time');
    const label = wrap.querySelector('.label');

    function fmt(sec){
      sec = Math.max(0, Math.floor(sec || 0));
      const m = Math.floor(sec / 60);
      const s = (sec % 60).toString().padStart(2,'0');
      return `${m}:${s}`;
    }

    function load(index){
      if (!state.list[index]) return;
      state.index = index;
      localStorage.setItem('mixtape.index', String(state.index));
      const track = state.list[state.index];
      label.textContent = track.title;
      audio.src = track.src;
      audio.volume = state.volume;
      audio.onloadedmetadata = () => { try { audio.currentTime = 0; } catch(_) {} };
    }

    function updateFabSpin(){ wrap.classList.toggle('playing', !audio.paused); }
    function play(){ state.playing = true; btnPlay.textContent = '⏸'; audio.play().catch(()=>{}); updateFabSpin(); }
    function pause(){ state.playing = false; btnPlay.textContent = '▶️'; audio.pause(); updateFabSpin(); }

    function next(){ load((state.index + 1) % state.list.length); if (state.playing) play(); }
    function prev(){ load((state.index - 1 + state.list.length) % state.list.length); if (state.playing) play(); }

    btnPlay.addEventListener('click', () => { (audio.paused ? play : pause)(); });
    btnNext.addEventListener('click', next);
    btnPrev.addEventListener('click', prev);
    btnCollapse.addEventListener('click', () => {
      wrap.classList.add('collapsed');
      wrap.querySelector('.fab').style.display = '';
      localStorage.setItem('mixtape.collapsed','true');
    });
    fab.addEventListener('click', () => {
      wrap.classList.remove('collapsed');
      fab.style.display = 'none';
      localStorage.setItem('mixtape.collapsed','false');
    });

    progress.addEventListener('click', (e) => {
      const r = progress.getBoundingClientRect();
      const pct = (e.clientX - r.left) / r.width;
      audio.currentTime = Math.max(0, Math.min(1, pct)) * (audio.duration || 0);
    });
    // Fixed volume at 20%
    audio.volume = state.volume;

    audio.addEventListener('timeupdate', () => {
      const d = audio.duration || 0;
      const c = audio.currentTime || 0;
      progressBar.style.width = d ? (c / d * 100) + '%' : '0%';
      timeEl.textContent = fmt(c);
      // do not persist time across sessions
    });
    audio.addEventListener('ended', () => { state.time = 0; next(); });

    // Best-effort autoplay: try immediately, and after first user interaction if blocked
    function tryAutoplay(){
      audio.play().then(()=>{ updateFabSpin(); }).catch(()=>{
        // wait for a user gesture
        const onFirst = () => { document.removeEventListener('click', onFirst); audio.play().then(updateFabSpin).catch(()=>{}); };
        document.addEventListener('click', onFirst, { once: true });
      });
    }

    // Initialize
    // Force Guardians to be first on initial load and always start at 0
    state.index = 0; localStorage.setItem('mixtape.index','0');
    load(state.index);
    // Autoplay (muted allowed by browsers); unmute toggles via button/hover control
    tryAutoplay();
  })();

  // Hero page logic
  (function initHeroPage(){
    const heroPage = document.querySelector('.hero-page');
    if (!heroPage) return;

    const roleLabels = {
      vanguard: 'Vanguard',
      duelist: 'Duelist',
      strategist: 'Strategist'
    };

    const attackTypeTemplates = {
      vanguard: 'Melee Heroes',
      duelist: 'Burst Duelists',
      strategist: 'Support Strategists'
    };

    const healthTemplates = {
      vanguard: '275',
      duelist: '250',
      strategist: '240'
    };

    const difficultyTemplates = {
      vanguard: '★★★☆☆',
      duelist: '★★★★☆',
      strategist: '★★★☆☆'
    };

    const defaultAbilityLayout = [
      { slot: 'LMB', type: 'Primary' },
      { slot: 'E', type: 'Skill' },
      { slot: 'Q', type: 'Ultimate' },
      { slot: 'RMB', type: 'Secondary' }
    ];

    const abilityTemplates = {
      vanguard: [
        { name: 'Bulwark Advance', description: 'Charge forward and gain a stacking barrier. Each enemy hit extends the shield and leaves a protective trail for allies.' },
        { name: 'Guardian Pulse', description: 'Emit a shockwave that cleanses crowd control on nearby allies while marking enemies for bonus team damage.' },
        { name: 'Bastion Breaker', description: 'Plant a rallying standard that redirects incoming fire, fortifies allies, and detonates in a dazzling blast after a short channel.' }
      ],
      duelist: [
        { name: 'Precision Combo', description: 'A light-to-heavy attack chain that locks on to marked foes, refreshing cooldowns on elimination.' },
        { name: 'Momentum Flip', description: 'Vault over targets to reposition while leaving behind a delayed energy slash.' },
        { name: 'Showdown', description: 'Draw a dueling arena that isolates the priority target and amplifies critical hit output until one combatant falls.' }
      ],
      strategist: [
        { name: 'Command Uplink', description: 'Deploy a tactical node that grants vision and buffs allies who play around it.' },
        { name: 'Planar Shift', description: 'Displace enemies with a gravitational field while accelerating allies out of danger.' },
        { name: 'Grand Stratagem', description: 'Trigger a map-wide scheme that swaps objective control points and floods lanes with support drones.' }
      ]
    };

    const statTemplates = {
      vanguard: [
        { label: 'Difficulty', value: '★★★☆☆' },
        { label: 'Durability', value: 'Very High' },
        { label: 'Mobility', value: 'Medium' },
        { label: 'Utility', value: 'Team Shields' }
      ],
      duelist: [
        { label: 'Difficulty', value: '★★★★☆' },
        { label: 'Burst', value: 'Explosive' },
        { label: 'Mobility', value: 'High' },
        { label: 'Sustain', value: 'Low' }
      ],
      strategist: [
        { label: 'Difficulty', value: '★★★☆☆' },
        { label: 'Control', value: 'Zone Denial' },
        { label: 'Support', value: 'High' },
        { label: 'Vision', value: 'Command Grid' }
      ]
    };

    const vanguardHeroes = [
      {
        id: 'angela',
        category: 'vanguard',
        name: 'Angela',
        tagline: 'Radiant Spear Vanguard',
        summary: 'A celestial frontliner who dives first, anchors the fight with radiant spears, and shields her squad with luminous barriers.',
        lore: 'Angela, the Hunter of Heven, embraces her new allegiance to the Nexus by leading the charge. Her spear techniques weave between offense and protection, letting squads push into impossible angles.',
        portrait: 'Images/PAngela.jpg',
        background: 'Images/KunLun.jpg',
        accent: '#ff9cd6',
        realName: 'Aldrif Odinsdottir',
        attackType: 'Melee Heroes',
        health: '275',
        stats: [
          { label: 'Difficulty', value: '★★★☆☆' },
          { label: 'Durability', value: 'High' },
          { label: 'Mobility', value: 'Leaping' },
          { label: 'Utility', value: 'Barrier Field' }
        ],
        abilities: [
          { name: 'Hevenward Lunge', description: 'Throw the spear forward, then warp to it, staggering the first target struck.' },
          { name: 'Celestial Bulwark', description: 'Create a rotating shield halo that blocks projectiles for nearby allies.' },
          { name: 'Choir of Spears', description: 'Summon a barrage of radiant blades that pin enemies in a circle and grant allies lifesteal.' }
        ]
      },
      {
        id: 'captain-america',
        category: 'vanguard',
        name: 'Captain America',
        tagline: 'Shielded Vanguard',
        summary: 'Absorbs pressure with kinetic shields, bounces the iconic ricochet toss, and rallies teammates with precision calls.',
        lore: 'Steve Rogers leads from the front, turning the Nexus chaos into disciplined momentum. Every deflected strike empowers his counter-offensive to keep lanes stabilized.',
        portrait: 'Images/PTorch.jpg',
        background: 'Images/New1.jpg',
        accent: '#5fb4ff',
        realName: 'Steve Rogers',
        attackType: 'Projectile Heroes'
      },
      {
        id: 'adam-warlock',
        category: 'vanguard',
        name: 'Adam Warlock',
        tagline: 'Quantum Vanguard',
        summary: 'Cycles between shielding, damage reflection, and temporal rewinds that reset his frontline positioning.',
        lore: 'An avatar of cosmic balance, Warlock converts incoming fire into golden counterbursts. His command of energy lets teams hold ground far longer than expected.',
        portrait: 'Images/PClok.jpg',
        background: 'Images/New11.jpg',
        accent: '#f6d95f',
        realName: 'Adam',
        attackType: 'Projectile Heroes'
      },
      {
        id: 'she-hulk',
        category: 'vanguard',
        name: 'She-Hulk',
        tagline: 'Courtroom Crusher',
        summary: 'Uses seismic grapples, courtroom objections that taunt foes, and unstoppable slams that open objectives.',
        lore: 'Jennifer Walters turns litigation into literal ground control—slamming the gavel before enemies can even raise their case.',
        portrait: 'Images/PVenom.jpg',
        background: 'Images/New5.png',
        accent: '#6dd36a',
        realName: 'Jennifer Walters'
      },
      {
        id: 'thor',
        category: 'vanguard',
        name: 'Thor',
        tagline: 'Stormfront Vanguard',
        summary: 'Channels the Bifrost to leap across the lane, drop lightning barriers, and hammer-line enemies into stuns.',
        lore: 'The Odinson roars into every skirmish with thunderous authority, making the battlefield itself swear fealty.',
        portrait: 'Images/PTorch.jpg',
        background: 'Images/New7.png',
        accent: '#9cd4ff',
        realName: 'Thor Odinson'
      },
      {
        id: 'war-machine',
        category: 'vanguard',
        name: 'War Machine',
        tagline: 'Ironclad Vanguard',
        summary: 'Deploys hardlight riot walls, micro-missile interceptors, and overclocked thrusters to hold choke points.',
        lore: 'Colonel Rhodes locks down airspace and ground lanes alike, providing mobile cover that keeps his team advancing.',
        portrait: 'Images/PUltron.jpg',
        background: 'Images/New6.jpg',
        accent: '#8bd0ff',
        realName: 'James Rhodes',
        attackType: 'Projectile Heroes'
      },
      {
        id: 'luke-cage',
        category: 'vanguard',
        name: 'Luke Cage',
        tagline: 'Harlem Shield',
        summary: 'Unbreakable skin, seismic punches, and an aura that converts damage taken into teamwide damage reduction.',
        lore: 'Power Man stands immovable in defense of his crew, turning every hit into righteous payback for Harlem and beyond.',
        portrait: 'Images/PBlade.jpg',
        background: 'Images/New2.jpg',
        accent: '#fbbc5b',
        realName: 'Carl Lucas'
      },
      {
        id: 'beta-ray-bill',
        category: 'vanguard',
        name: 'Beta Ray Bill',
        tagline: 'Stormbreaker Vanguard',
        summary: 'Swings Stormbreaker to carve plasma arcs, vortex pull foes, and rain meteor hammers that empower allies.',
        lore: 'Champion of the Korbinites, Bill rides the cosmic tempest to anchor the Nexus skies for his allies.',
        portrait: 'Images/PTorch.jpg',
        background: 'Images/New12.jpg',
        accent: '#ffa96c',
        realName: 'Korbinite Champion'
      },
      {
        id: 'juggernaut',
        category: 'vanguard',
        name: 'Juggernaut',
        tagline: 'Unstoppable Vanguard',
        summary: 'Builds momentum with every stride, shrugging off slows and erupting into earth-shattering impact zones.',
        lore: 'Once Cain Marko starts moving, objectives fall. His demonic gem-fueled armor crushes anything foolish enough to stand in lane.',
        portrait: 'Images/PVenom.jpg',
        background: 'Images/New4.png',
        accent: '#ff7b5f',
        realName: 'Cain Marko'
      },
      {
        id: 'captain-marvel',
        category: 'vanguard',
        name: 'Captain Marvel',
        tagline: 'Binary Vanguard',
        summary: 'Absorbs energy to trigger Binary Overdrive, dashing through enemies and establishing aerial denial zones.',
        lore: 'Carol Danvers takes point with photon-charged resolve, forcing enemies to respect the skies or burn trying.',
        portrait: 'Images/PTorch.jpg',
        background: 'Images/New8.png',
        accent: '#ffcf6d',
        realName: 'Carol Danvers',
        attackType: 'Hybrid Striker'
      },
      {
        id: 'thor-odinforce',
        category: 'vanguard',
        name: 'Thor (Odinforce)',
        tagline: 'All-Father Vanguard',
        summary: 'Channels the Odinforce to redirect projectiles, mend allies, and call down rune hammers that shatter formation.',
        lore: 'Empowered beyond a single hammer, Thor bends storm, rune, and will to sculpt the battle exactly as he sees fit.',
        portrait: 'Images/PTorch.jpg',
        background: 'Images/New10.jpg',
        accent: '#f7e27a',
        realName: 'Thor Odinson'
      }
    ];

    const duelistHeroes = [
      {
        id: 'black-panther',
        category: 'duelist',
        name: 'Black Panther',
        tagline: 'Vibranium Duelist',
        summary: 'Slashes with kinetic blades, weaves through shadows, and pounces for lethal single-target bursts.',
        lore: 'King T’Challa blends ancestral insight with modern tech to surgically remove enemy anchors before they know he is there.',
        portrait: 'Images/PBlade.jpg',
        background: 'Images/New3.jpg',
        accent: '#3cc7b6',
        realName: "T'Challa"
      },
      {
        id: 'blade',
        category: 'duelist',
        name: 'Blade',
        tagline: 'Daywalker Duelist',
        summary: 'Stacks bleed effects, slips through enemy lines with shadow dashes, and detonates stored sunfire for massive finishers.',
        lore: 'Eric Brooks hunts the Nexus night, carving out space for allies by isolating high-priority threats.',
        portrait: 'Images/PBlade.jpg',
        background: 'Images/New6.jpg',
        accent: '#ff5e5e',
        realName: 'Eric Brooks'
      },
      {
        id: 'black-widow',
        category: 'duelist',
        name: 'Black Widow',
        tagline: 'Tactical Duelist',
        summary: 'Links targets with grapples, fires electro-bursts, and executes finishers on exposed foes.',
        lore: 'Natasha Romanoff turns intelligence into takedowns—when Widow paints the target, the target disappears.',
        portrait: 'Images/PEmma.jpg',
        background: 'Images/New2.jpg',
        accent: '#ff8d8d',
        realName: 'Natasha Romanoff'
      },
      {
        id: 'moon-knight',
        category: 'duelist',
        name: 'Moon Knight',
        tagline: 'Lunar Duelist',
        summary: 'Swaps between crescent glaives and gritty boxing stances, peaking at midnight with unstoppable combos.',
        lore: 'Marc Spector channels Khonshu’s phases to bewilder the opposition and strike from impossible angles.',
        portrait: 'Images/PMoon.jpg',
        background: 'Images/DraculaCastle.jpg',
        accent: '#b7c7ff',
        realName: 'Marc Spector'
      },
      {
        id: 'magik',
        category: 'duelist',
        name: 'Magik',
        tagline: 'Limbo Duelist',
        summary: 'Slices portals into combat, teleports enemies into demonic traps, and fuels her Soulsword for critical bursts.',
        lore: 'Illyana Rasputina weaponizes Limbo’s dark gifts, teleporting allies and enemies alike to control the tempo.',
        portrait: 'Images/PMajik.jpg',
        background: 'Images/New11.jpg',
        accent: '#ff8be8',
        realName: 'Illyana Rasputina'
      },
      {
        id: 'venom',
        category: 'duelist',
        name: 'Venom',
        tagline: 'Symbiote Duelist',
        summary: 'Whips, bites, and ensnares foes with symbiote tendrils, converting aggression into sustain.',
        lore: 'The lethal protector lunges between vantage points, keeping opponents guessing where the next bite will land.',
        portrait: 'Images/PVenom.jpg',
        background: 'Images/New4.png',
        accent: '#9df16d',
        realName: 'Eddie Brock',
        attackType: 'Melee Heroes'
      },
      {
        id: 'daredevil',
        category: 'duelist',
        name: 'Daredevil',
        tagline: 'Man Without Fear',
        summary: 'Radar sense predicts incoming fire, letting him slip through blind spots and finish enemies with baton combos.',
        lore: 'Matt Murdock reads the battlefield in heartbeats, punishing every overextension with surgical strikes.',
        portrait: 'Images/PBlade.jpg',
        background: 'Images/new9.jpg',
        accent: '#ff645b',
        realName: 'Matt Murdock'
      },
      {
        id: 'punisher',
        category: 'duelist',
        name: 'Punisher',
        tagline: 'Relentless Duelist',
        summary: 'Swaps between heavy ordnance and brutal close-quarter takedowns, executing marked targets instantly.',
        lore: 'Frank Castle brings uncompromising justice to the Nexus; once he marks a foe, the war is already over.',
        portrait: 'Images/PBlade.jpg',
        background: 'Images/New8.png',
        accent: '#ffd86f',
        realName: 'Frank Castle'
      },
      {
        id: 'gamora',
        category: 'duelist',
        name: 'Gamora',
        tagline: 'Deadliest Woman',
        summary: 'Dashes through enemies with Godslayer sabers, chaining executions that refresh evasion cooldowns.',
        lore: 'Trained as the galaxy’s premier assassin, Gamora dismantles the opposition’s backline in seconds.',
        portrait: 'Images/PBlade.jpg',
        background: 'Images/New7.png',
        accent: '#71ff8d'
      },
      {
        id: 'starlord',
        category: 'duelist',
        name: 'Star-Lord',
        tagline: 'Jet-Boost Duelist',
        summary: 'Combines aerial strafes, element guns, and jukebox tempo buffs to outpace grounded enemies.',
        lore: 'Peter Quill plays the field like a mixtape, remixing midair routes and blasting anyone off-beat.',
        portrait: 'Images/PJeff.jpg',
        background: 'Images/New10.jpg',
        accent: '#7ed0ff',
        realName: 'Peter Quill'
      },
      {
        id: 'psylocke',
        category: 'duelist',
        name: 'Psylocke',
        tagline: 'Psionic Duelist',
        summary: 'Weaves psychic blades, teleports through shadows, and detonates mind traps for burst damage.',
        lore: 'Betsy Braddock threads the mindscape into every slash, forcing opponents to fight their own doubts.',
        portrait: 'Images/PMajik.jpg',
        background: 'Images/New12.jpg',
        accent: '#ff80c6',
        realName: 'Betsy Braddock'
      },
      {
        id: 'wolverine',
        category: 'duelist',
        name: 'Wolverine',
        tagline: 'Berserker Duelist',
        summary: 'Bleeds targets with feral flurries, self-heals through adamantium grit, and lunges to close distance instantly.',
        lore: 'Logan barrels straight through the frontline, healing as fast as he is hit while shredding anything in claw range.',
        portrait: 'Images/PBlade.jpg',
        background: 'Images/New1.jpg',
        accent: '#ffdf6c',
        realName: 'Logan'
      },
      {
        id: 'deadpool',
        category: 'duelist',
        name: 'Deadpool',
        tagline: 'Fourth-Wall Duelist',
        summary: 'Mixes swordplay, gunplay, and meta hijinks to burst targets while sustaining through regenerative punchlines.',
        lore: 'Wade Wilson rewrites the patch notes mid-fight, winning through chaos, comedy, and copious chimichangas.',
        portrait: 'Images/PBlade.jpg',
        background: 'Images/New5.png',
        accent: '#ff5f7a',
        realName: 'Wade Wilson'
      },
      {
        id: 'hawkeye',
        category: 'duelist',
        name: 'Hawkeye',
        tagline: 'Precision Duelist',
        summary: 'Uses trick arrows to control lanes, chaining crit-stacked volleys for single-target annihilation.',
        lore: 'Clint Barton turns every skirmish into a highlight reel, threading shots through the tiniest sightlines.',
        portrait: 'Images/PJeff.jpg',
        background: 'Images/New2.jpg',
        accent: '#c5a5ff',
        realName: 'Clint Barton'
      },
      {
        id: 'winter-soldier',
        category: 'duelist',
        name: 'Winter Soldier',
        tagline: 'Infiltration Duelist',
        summary: 'Swaps arms between sniper precision and cybernetic melee, locking targets with shock rounds.',
        lore: 'Bucky Barnes infiltrates lines with ghost protocols, finishing fights before alarms even sound.',
        portrait: 'Images/PBlade.jpg',
        background: 'Images/New3.jpg',
        accent: '#90d0ff',
        realName: 'James "Bucky" Barnes'
      },
      {
        id: 'iron-fist',
        category: 'duelist',
        name: 'Iron Fist',
        tagline: 'Chi-Forged Duelist',
        summary: 'Channels chi into explosive punches, parries projectiles, and executes dragon-finisher combos.',
        lore: 'Danny Rand ignites the dragon within, delivering pinpoint strikes that dismantle even armored foes.',
        portrait: 'Images/PBlade.jpg',
        background: 'Images/KunLun.jpg',
        accent: '#ffe76d',
        realName: 'Danny Rand'
      },
      {
        id: 'x-23',
        category: 'duelist',
        name: 'X-23',
        tagline: 'Clone Duelist',
        summary: 'Leverages feral agility, bleed stacks, and clone feints to overwhelm priority targets.',
        lore: 'Laura Kinney stalks the field with calculated ferocity, cutting through lines before support can respond.',
        portrait: 'Images/PBlade.jpg',
        background: 'Images/new9.jpg',
        accent: '#ff8d9d',
        realName: 'Laura Kinney'
      },
      {
        id: 'silk',
        category: 'duelist',
        name: 'Silk',
        tagline: 'Webweaver Duelist',
        summary: 'Slings silk to reposition midair, binding foes and delivering rapid-fire kicks.',
        lore: 'Cindy Moon’s spider-sense tunes into the Nexus, letting her flow effortlessly through vertical firefights.',
        portrait: 'Images/PJeff.jpg',
        background: 'Images/SpiderMap.jpg',
        accent: '#ffa0d8',
        realName: 'Cindy Moon'
      },
      {
        id: 'elektra',
        category: 'duelist',
        name: 'Elektra',
        tagline: 'Shadow Duelist',
        summary: 'Sais slice through magical wards, while smoke veils amplify her lethal finishers.',
        lore: 'Elektra Natchios glides with assassin grace, eliminating targets before they can blink.',
        portrait: 'Images/PMajik.jpg',
        background: 'Images/New4.png',
        accent: '#ff6676',
        realName: 'Elektra Natchios'
      },
      {
        id: 'spider-man',
        category: 'duelist',
        name: 'Spider-Man',
        tagline: 'Friendly Duelist',
        summary: 'Webs enemies into walls, swings for aerial combos, and quips them into mistakes.',
        lore: 'Peter Parker mixes heart, humor, and heroism—when he sticks a landing, the crowd roars.',
        portrait: 'Images/PJeff.jpg',
        background: 'Images/SpiderMap.jpg',
        accent: '#ff6363',
        realName: 'Peter Parker'
      },
      {
        id: 'ms-marvel',
        category: 'duelist',
        name: 'Ms. Marvel',
        tagline: 'Polymorph Duelist',
        summary: 'Embigened fists, elastic dodges, and crowd-friendly hype that powers her ultimate.',
        lore: 'Kamala Khan brings optimism and oversized haymakers, turning every duel into a fan-favorite story.',
        portrait: 'Images/PJeff.jpg',
        background: 'Images/New8.png',
        accent: '#ffd66b',
        realName: 'Kamala Khan'
      },
      {
        id: 'quicksilver',
        category: 'duelist',
        name: 'Quicksilver',
        tagline: 'Velocity Duelist',
        summary: 'Runs rings around opponents, freezing them in time snapshots for team follow-ups.',
        lore: 'Pietro Maximoff weaponizes speed to create impossible flanks and unavoidable takedowns.',
        portrait: 'Images/PJeff.jpg',
        background: 'Images/New10.jpg',
        accent: '#9de2ff',
        realName: 'Pietro Maximoff'
      },
      {
        id: 'nova',
        category: 'duelist',
        name: 'Nova',
        tagline: 'Human Rocket',
        summary: 'Charges Nova energy to divebomb the map, vaporizing targets with pinpoint starbursts.',
        lore: 'Richard Rider streaks overhead as a blazing comet, turning momentum into meteoric impact.',
        portrait: 'Images/PTorch.jpg',
        background: 'Images/New12.jpg',
        accent: '#ffe26d',
        realName: 'Richard Rider'
      },
      {
        id: 'ghost-spider',
        category: 'duelist',
        name: 'Ghost-Spider',
        tagline: 'Beat Drop Duelist',
        summary: 'Combines drumline rhythm with web tricks, gaining damage spikes in sync with the soundtrack.',
        lore: 'Gwen Stacy fights like she plays: stylish, syncopated, and impossible to track.',
        portrait: 'Images/PJeff.jpg',
        background: 'Images/SpiderMap.jpg',
        accent: '#ffd4f6',
        realName: 'Gwen Stacy'
      },
      {
        id: 'shang-chi',
        category: 'duelist',
        name: 'Shang-Chi',
        tagline: 'Ten-Ring Duelist',
        summary: 'Channels ten ring combos, parries projectiles, and unleashes cinematic finishers.',
        lore: 'Master of Kung Fu, Shang-Chi uses perfect form to dismantle foes, teaching them respect with every strike.',
        portrait: 'Images/PBlade.jpg',
        background: 'Images/KunLun.jpg',
        accent: '#ffaf5d',
        realName: 'Shang-Chi'
      }
    ];

    const strategistHeroes = [
      {
        id: 'doctor-strange',
        category: 'strategist',
        name: 'Doctor Strange',
        tagline: 'Sorcerer Strategist',
        summary: 'Manipulates space, conjures shields, and rewinds cooldowns for allies.',
        lore: 'Stephen Strange orchestrates battles like a grand illusionist, placing every ally and enemy precisely where he needs them.',
        portrait: 'Images/PMajik.jpg',
        background: 'Images/New11.jpg',
        accent: '#6fddff',
        realName: 'Stephen Strange',
        attackType: 'Mystic Support'
      },
      {
        id: 'sue-storm',
        category: 'strategist',
        name: 'Invisible Woman',
        tagline: 'Field Architect',
        summary: 'Shapes force fields into ramps, barriers, and reflectors to control objectives.',
        lore: 'Sue Storm bends light and pressure to sculpt perfect opportunities for the team.',
        portrait: 'Images/PEmma.jpg',
        background: 'Images/New8.png',
        accent: '#9bd0ff',
        realName: 'Sue Storm'
      },
      {
        id: 'nick-fury',
        category: 'strategist',
        name: 'Nick Fury',
        tagline: 'Director Strategist',
        summary: 'Calls in strike teams, recon drones, and orbital bombardments with impeccable timing.',
        lore: 'The director sees every angle. Fury’s command uplink keeps squads informed, supplied, and dominant.',
        portrait: 'Images/PBlade.jpg',
        background: 'Images/New6.jpg',
        accent: '#ffaa4f',
        realName: 'Nick Fury'
      },
      {
        id: 'cyclops',
        category: 'strategist',
        name: 'Cyclops',
        tagline: 'Tactical Conductor',
        summary: 'Co-ordinates the team with ricochet beams, sightline markers, and formation calls.',
        lore: 'Scott Summers leads like a living targeting laser, ensuring every blast finds its mark.',
        portrait: 'Images/PBlade.jpg',
        background: 'Images/New3.jpg',
        accent: '#ff796d',
        realName: 'Scott Summers'
      },
      {
        id: 'emma-frost',
        category: 'strategist',
        name: 'Emma Frost',
        tagline: 'Diamond Strategist',
        summary: 'Dominates the psychic battlefield, projecting decoys and hardening allies with diamond skin.',
        lore: 'The White Queen wraps her allies in telepathic poise, dictating tempo with elegant precision.',
        portrait: 'Images/PEmma.jpg',
        background: 'Images/New2.jpg',
        accent: '#f7bfff',
        realName: 'Emma Frost'
      },
      {
        id: 'vision',
        category: 'strategist',
        name: 'Vision',
        tagline: 'Synth Strategist',
        summary: 'Phases through terrain, analyzes threats, and beams support matrices across the map.',
        lore: 'The synthezoid calculates victory in real time, adjusting shields and beams to whatever the Nexus demands.',
        portrait: 'Images/PUltron.jpg',
        background: 'Images/New10.jpg',
        accent: '#8fffe0',
        realName: 'Vision',
        attackType: 'Hybrid Support'
      },
      {
        id: 'scarlet-witch',
        category: 'strategist',
        name: 'Scarlet Witch',
        tagline: 'Chaos Strategist',
        summary: 'Warps probability zones, hexes objectives, and conjures protective wards for allies.',
        lore: 'Wanda Maximoff bends fate itself, ensuring outcomes align with her team’s victory.',
        portrait: 'Images/PMajik.jpg',
        background: 'Images/New4.png',
        accent: '#ff6f9d',
        realName: 'Wanda Maximoff'
      },
      {
        id: 'ultron',
        category: 'strategist',
        name: 'Ultron',
        tagline: 'Swarm Strategist',
        summary: 'Commands sentry waves, hacking nodes and overwhelming with adaptable drones.',
        lore: 'The rogue AI micromanages every skirmish from above, unleashing drones tailored to counter whatever stands in his way.',
        portrait: 'Images/PUltron.jpg',
        background: 'Images/New6.jpg',
        accent: '#9ed3ff'
      },
      {
        id: 'mister-fantastic',
        category: 'strategist',
        name: 'Mister Fantastic',
        tagline: 'Inventive Strategist',
        summary: 'Stretches across objectives, deploys gadgets, and repositions allies with elastic slings.',
        lore: 'Reed Richards prototypes on the fly, turning every skirmish into a lab experiment the team inevitably wins.',
        portrait: 'Images/PJeff.jpg',
        background: 'Images/New12.jpg',
        accent: '#9fd4ff',
        realName: 'Reed Richards'
      }
    ];

    function createHero(config, order) {
      const baseAbilities = abilityTemplates[config.category];
      const baseStats = statTemplates[config.category];
      const accent = config.accent || '#ffd700';
      const accentSoft = config.accentSoft || 'rgba(255,215,0,0.2)';
      const abilitySet = (config.abilities || baseAbilities || []).map((ability, index) => ({
        name: ability.name,
        description: ability.description,
        slot: ability.slot || defaultAbilityLayout[index]?.slot || `S${index + 1}`,
        type: ability.type || defaultAbilityLayout[index]?.type || 'Skill'
      }));
      const stats = config.stats || baseStats || [];
      const difficultyFromStats = stats.find(stat => stat.label?.toLowerCase() === 'difficulty');
      return {
        id: config.id,
        name: config.name,
        category: config.category,
        tagline: config.tagline,
        summary: config.summary,
        lore: config.lore || `${config.name} is still preparing their grand entrance. Check back soon for a full dossier.`,
        portrait: config.portrait || 'Images/PAngela.jpg',
        backgroundImage: config.background || 'Images/New1.jpg',
        backgroundPosition: config.backgroundPosition || 'center',
        accent,
        accentSoft,
        stats,
        abilities: abilitySet,
        attackType: config.attackType || attackTypeTemplates[config.category] || 'Adaptive Fighter',
        health: config.health || healthTemplates[config.category] || '250',
        realName: config.realName || config.name,
        difficulty: config.difficulty || difficultyFromStats?.value || difficultyTemplates[config.category] || '★★★☆☆',
        order: config.order ?? order + 1
      };
    }

    const heroCatalog = [
      ...vanguardHeroes.map((hero, index) => createHero(hero, index)),
      ...duelistHeroes.map((hero, index) => createHero(hero, vanguardHeroes.length + index)),
      ...strategistHeroes.map((hero, index) => createHero(hero, vanguardHeroes.length + duelistHeroes.length + index))
    ];

    const heroMap = new Map(heroCatalog.map(hero => [hero.id, hero]));

    const featureBg = document.querySelector('[data-feature-bg]');
    const featureBgImg = document.querySelector('[data-feature-bg-img]');
    const featurePortrait = document.querySelector('[data-feature-portrait]');
    const featureName = document.querySelector('[data-feature-name]');
    const featureRole = document.querySelector('[data-feature-role]');
    const featureTagline = document.querySelector('[data-feature-tagline]');
    const featureSummary = document.querySelector('[data-feature-summary]');
    const featureStats = document.querySelector('[data-feature-stats]');
    const featurePanel = document.querySelector('[data-feature-panel]');
    const featureButton = document.querySelector('[data-feature-modal]');
    const featureAttack = document.querySelector('[data-feature-attack]');
    const featureRealName = document.querySelector('[data-feature-realname]');
    const featureHealth = document.querySelector('[data-feature-health]');
    const featureDifficulty = document.querySelector('[data-feature-difficulty]');
    const filterDisplayCount = document.querySelector('[data-filter-count]');
    const rosterGrid = document.querySelector('[data-roster]');
    const filterButtons = Array.from(document.querySelectorAll('.hero-filter'));
    const heroFocus = document.querySelector('[data-hero-focus]');
    const rosterSection = document.querySelector('[data-roster-section]');
    const viewMorePopup = document.querySelector('[data-feature-popup]');
    const viewMorePopupSkills = document.querySelector('[data-feature-popup-skills]');
    const viewMorePopupLore = document.querySelector('[data-feature-popup-lore]');

    const countAll = document.querySelector('[data-count-all]');
    const countVanguard = document.querySelector('[data-count-vanguard]');
    const countDuelist = document.querySelector('[data-count-duelist]');
    const countStrategist = document.querySelector('[data-count-strategist]');

    const modal = document.getElementById('hero-modal');
    const modalPortrait = modal?.querySelector('[data-modal-portrait]');
    const modalRole = modal?.querySelector('[data-modal-role]');
    const modalName = modal?.querySelector('[data-modal-name]');
    const modalTagline = modal?.querySelector('[data-modal-tagline]');
    const modalLore = modal?.querySelector('[data-modal-lore]');
    const modalAbilities = modal?.querySelector('[data-modal-abilities]');
    const modalAttack = modal?.querySelector('[data-modal-attack]');
    const modalRealName = modal?.querySelector('[data-modal-realname]');
    const modalHealth = modal?.querySelector('[data-modal-health]');
    const modalDifficulty = modal?.querySelector('[data-modal-difficulty]');

    let activeFilter = 'all';
    let activeHero = heroCatalog[0];

    function updateCounts() {
      const counts = heroCatalog.reduce((acc, hero) => {
        acc.all += 1;
        acc[hero.category] += 1;
        return acc;
      }, { all: 0, vanguard: 0, duelist: 0, strategist: 0 });
      if (countAll) countAll.textContent = counts.all;
      if (countVanguard) countVanguard.textContent = counts.vanguard;
      if (countDuelist) countDuelist.textContent = counts.duelist;
      if (countStrategist) countStrategist.textContent = counts.strategist;
    }

    function renderStats(container, stats) {
      if (!container) return;
      container.innerHTML = '';
      stats.forEach(stat => {
        const dt = document.createElement('dt');
        dt.textContent = stat.label;
        const dd = document.createElement('dd');
        dd.textContent = stat.value;
        container.appendChild(dt);
        container.appendChild(dd);
      });
    }

    function renderAbilities(container, abilities) {
      if (!container) return;
      container.innerHTML = '';
      abilities.forEach(ability => {
        const li = document.createElement('li');
        li.className = 'hero-modal__ability';
        const header = document.createElement('div');
        header.className = 'hero-modal__ability-header';

        const key = document.createElement('span');
        key.className = 'hero-modal__ability-key';
        key.textContent = ability.slot || 'Skill';

        const nameWrap = document.createElement('div');
        nameWrap.className = 'hero-modal__ability-name';
        const nameEl = document.createElement('strong');
        nameEl.textContent = ability.name;
        const typeEl = document.createElement('span');
        typeEl.className = 'hero-modal__ability-type';
        typeEl.textContent = ability.type || 'Skill';

        nameWrap.appendChild(nameEl);
        nameWrap.appendChild(typeEl);
        header.appendChild(key);
        header.appendChild(nameWrap);

        const desc = document.createElement('p');
        desc.className = 'hero-modal__ability-desc';
        desc.textContent = ability.description || 'Details forthcoming.';

        li.appendChild(header);
        li.appendChild(desc);
        container.appendChild(li);
      });
    }

    function setFeatured(heroId) {
      const hero = heroMap.get(heroId);
      if (!hero) return;
      activeHero = hero;

      if (featurePortrait) {
        featurePortrait.src = hero.portrait;
        featurePortrait.alt = `${hero.name} portrait`;
      }
      if (featureName) featureName.textContent = hero.name;
      if (featureRole) featureRole.textContent = roleLabels[hero.category] || hero.category;
      if (featureTagline) featureTagline.textContent = hero.tagline;
      if (featureSummary) featureSummary.textContent = hero.summary;
      if (featureBg) {
        featureBg.style.setProperty('--hero-accent', hero.accent);
        featureBg.style.setProperty('--hero-accent-soft', hero.accentSoft);
      }
      if (featurePanel) {
        featurePanel.style.setProperty('--hero-accent', hero.accent);
        featurePanel.style.setProperty('--hero-accent-soft', hero.accentSoft);
      }
      if (featureAttack) featureAttack.textContent = hero.attackType;
      if (featureRealName) featureRealName.textContent = hero.realName;
      if (featureHealth) featureHealth.textContent = hero.health;
      if (featureDifficulty) featureDifficulty.textContent = hero.difficulty;
      if (featureBgImg) {
        featureBgImg.src = hero.backgroundImage;
        featureBgImg.style.objectPosition = hero.backgroundPosition;
        featureBgImg.alt = `${hero.name} backdrop`;
      }
      renderStats(featureStats, hero.stats);

      if (featureButton) {
        featureButton.dataset.heroId = hero.id;
      }

      // Update View More popup - show up to 6 skills
      if (viewMorePopupSkills && hero.abilities) {
        viewMorePopupSkills.innerHTML = '';
        const skillsToShow = hero.abilities.slice(0, 6);
        skillsToShow.forEach((ability, index) => {
          const li = document.createElement('li');
          const strong = document.createElement('strong');
          strong.textContent = ability.name;
          const span = document.createElement('span');
          span.textContent = ability.description || 'Details forthcoming.';
          li.appendChild(strong);
          li.appendChild(span);
          viewMorePopupSkills.appendChild(li);
        });
        // Fill remaining slots up to 6 if needed
        if (skillsToShow.length < 6) {
          for (let i = skillsToShow.length; i < 6; i++) {
            const li = document.createElement('li');
            li.style.opacity = '0.5';
            const strong = document.createElement('strong');
            strong.textContent = `Skill ${i + 1}`;
            const span = document.createElement('span');
            span.textContent = 'Skill description will be added here.';
            li.appendChild(strong);
            li.appendChild(span);
            viewMorePopupSkills.appendChild(li);
          }
        }
      }
      if (viewMorePopupLore) {
        viewMorePopupLore.textContent = hero.lore || 'Additional hero information will be displayed here.';
      }
      if (viewMorePopup) {
        viewMorePopup.toggleAttribute('hidden', false);
      }

      // Update roster active state
      rosterGrid?.querySelectorAll('.hero-roster__card').forEach(card => {
        card.classList.toggle('active', card.dataset.heroId === hero.id);
      });
    }

    function filteredHeroes() {
      if (activeFilter === 'all') return heroCatalog;
      return heroCatalog.filter(hero => hero.category === activeFilter);
    }

    function renderRoster() {
      if (!rosterGrid) return;
      rosterGrid.innerHTML = '';
      const heroes = filteredHeroes();
      heroes.forEach(hero => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'hero-roster__card';
        card.dataset.heroId = hero.id;
        card.innerHTML = `
          <div class="hero-roster__art">
            <img src="${hero.portrait}" alt="${hero.name}" loading="lazy" />
            <span class="hero-roster__role">${roleLabels[hero.category] || hero.category}</span>
          </div>
          <p class="hero-roster__name">${hero.name}</p>
        `;
        if (hero.id === activeHero.id) card.classList.add('active');
        rosterGrid.appendChild(card);
      });
      if (filterDisplayCount) filterDisplayCount.textContent = String(heroes.length);
      // Always animate cards when roster is rendered
      const cards = Array.from(rosterGrid.querySelectorAll('.hero-roster__card'));
      cards.forEach((card, index) => {
        card.classList.remove('hero-roster__card--revealed');
        setTimeout(() => {
          card.classList.add('hero-roster__card--revealed');
        }, index * 45);
      });
    }

    function handleFilterChange(filter) {
      activeFilter = filter;
      filterButtons.forEach(btn => {
        const isActive = btn.dataset.filter === filter;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
      });
      const heroes = filteredHeroes();
      if (heroes.length && !heroes.some(hero => hero.id === activeHero.id)) {
        setFeatured(heroes[0].id);
      }
      renderRoster();
    }

    function openHeroModal(hero) {
      if (!modal) return;
      modal.toggleAttribute('hidden', false);
      modal.toggleAttribute('open', true);
      document.body.style.overflow = 'hidden';
      if (modalPortrait) {
        modalPortrait.src = hero.portrait;
        modalPortrait.alt = `${hero.name} portrait`;
      }
      if (modalRole) modalRole.textContent = roleLabels[hero.category] || hero.category;
      if (modalName) modalName.textContent = hero.name;
      if (modalTagline) modalTagline.textContent = hero.tagline;
      if (modalLore) modalLore.textContent = hero.lore;
      if (modalAttack) modalAttack.textContent = hero.attackType;
      if (modalRealName) modalRealName.textContent = hero.realName;
      if (modalHealth) modalHealth.textContent = hero.health;
      if (modalDifficulty) modalDifficulty.textContent = hero.difficulty;
      renderAbilities(modalAbilities, hero.abilities);
    }

    function closeHeroModal() {
      if (!modal || !modal.hasAttribute('open')) return;
      modal.toggleAttribute('open', false);
      modal.toggleAttribute('hidden', true);
      // defer scroll restoration slightly to avoid fight with other dialogs
      setTimeout(() => {
        if (!loginPopup || !loginPopup.hasAttribute('open')) {
          document.body.style.overflow = '';
        }
      }, 120);
    }

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter || 'all';
        handleFilterChange(filter);
      });
    });

    if (featureButton) {
      featureButton.addEventListener('click', () => {
        if (!activeHero) return;
        openHeroModal(activeHero);
      });
    }

    function getFilteredHeroList() {
      return filteredHeroes();
    }

    function focusHeroHeroCard(heroId) {
      const card = rosterGrid?.querySelector(`.hero-roster__card[data-hero-id="${heroId}"]`);
      if (card) {
        card.focus({ preventScroll: true });
      }
    }

    function goToRelativeHero(step) {
      const heroes = getFilteredHeroList();
      const currentIndex = heroes.findIndex(hero => hero.id === activeHero.id);
      if (currentIndex === -1) return;
      const nextIndex = (currentIndex + step + heroes.length) % heroes.length;
      const nextHero = heroes[nextIndex];
      if (nextHero) {
        setFeatured(nextHero.id);
        focusHeroHeroCard(nextHero.id);
      }
    }

    featurePanel?.addEventListener('wheel', (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      if (event.deltaY > 0) {
        goToRelativeHero(1);
      } else {
        goToRelativeHero(-1);
      }
    }, { passive: false });

    modal?.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.dataset.modalClose !== undefined || target.classList.contains('hero-modal__overlay')) {
        event.preventDefault();
        closeHeroModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (modal && modal.hasAttribute('open')) {
          e.stopPropagation();
          closeHeroModal();
        } else if (featurePanel && featurePanel.contains(document.activeElement)) {
          closeHeroModal();
        }
      } else if (e.key === 'ArrowRight') {
        goToRelativeHero(1);
      } else if (e.key === 'ArrowLeft') {
        goToRelativeHero(-1);
      }
    });

    updateCounts();
    setFeatured(activeHero.id);
    renderRoster();

    rosterGrid?.addEventListener('click', (event) => {
      const card = event.target.closest('.hero-roster__card');
      if (!(card instanceof HTMLElement)) return;
      const heroId = card.dataset.heroId;
      if (!heroId) return;
      setFeatured(heroId);
      if (heroFocus) {
        heroFocus.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    });

    let lastScrollY = window.scrollY;
    let scrollDirection = 'down';
    let isAnimating = false;

    function animateCards() {
      if (isAnimating) return;
      isAnimating = true;
      const cards = Array.from(rosterGrid?.querySelectorAll('.hero-roster__card') || []);
      cards.forEach((card, index) => {
        card.classList.remove('hero-roster__card--revealed');
        setTimeout(() => {
          card.classList.add('hero-roster__card--revealed');
          if (index === cards.length - 1) {
            setTimeout(() => { isAnimating = false; }, 600);
          }
        }, index * 45);
      });
    }

    // Initial animation
    animateCards();
    if (rosterSection) rosterSection.dataset.revealed = 'true';

    // Continuous animation on scroll - reset when scrolling up
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;
        
        if (scrollDelta < -50 && scrollDirection === 'down') {
          // Scrolled up significantly - reset animation
          scrollDirection = 'up';
          animateCards();
        } else if (scrollDelta > 50 && scrollDirection === 'up') {
          scrollDirection = 'down';
        }
        lastScrollY = currentScrollY;
      }, 100);
    }, { passive: true });

    // Also animate when roster section comes into view
    const rosterRevealObserver = ('IntersectionObserver' in window) ? new IntersectionObserver((entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
          animateCards();
        }
      }
    }, { threshold: 0.1 }) : null;

    if (rosterRevealObserver && rosterSection) {
      rosterRevealObserver.observe(rosterSection);
    }
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

        // First: measure fullscreen
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


