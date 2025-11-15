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
  // Fades in after 10 seconds (after splash video)
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
    
    // Fade in after 10 seconds
    setTimeout(() => {
      banner.classList.add('cookie-banner--visible');
    }, 10000);
    
    const done = () => {
      sessionStorage.setItem('cookieBannerSeen', '1');
      // Smooth fade out
      banner.classList.add('cookie-banner--fade-out');
      setTimeout(() => {
        banner.remove();
      }, 400); // Match transition duration
    };
    
    banner.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      done();
    });
  })();

  // Old mixtape player removed - React music player handles all audio now

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
        { name: 'Skill 1', description: 'That does this...!' },
        { name: 'Skill 2', description: 'This does that...?' },
        { name: 'Ultimate', description: 'This is your wasted ult.' }
      ],
      duelist: [
        { name: 'Skill 1', description: 'That does this...!' },
        { name: 'Skill 2', description: 'This does that...?' },
        { name: 'Ultimate', description: 'This is your wasted ult.' }
      ],
      strategist: [
        { name: 'Skill 1', description: 'That does this...!' },
        { name: 'Skill 2', description: 'This does that...?' },
        { name: 'Ultimate', description: 'This is your wasted ult.' }
      ]
    };

    const statTemplates = {
      vanguard: [
        { label: 'Difficulty', value: '★★★☆☆' },
        { label: 'Attack Type', value: 'Very High' },
        { label: 'Mobility', value: 'Medium' },
        { label: 'Passive', value: 'Team Shields' }
      ],
      duelist: [
        { label: 'Difficulty', value: '★★★★☆' },
        { label: 'Attack Type', value: 'Explosive' },
        { label: 'Mobility', value: 'High' },
        { label: 'Passive', value: 'Low' }
      ],
      strategist: [
        { label: 'Difficulty', value: '★★★☆☆' },
        { label: 'Attack Type', value: 'Zone Denial' },
        { label: 'Support', value: 'High' },
        { label: 'Passive', value: 'Command Grid' }
      ]
    };

    const vanguardHeroes = [
      {
        id: 'angela',
        category: 'vanguard',
        name: 'Angela',
        tagline: 'Muscle Mommy of the Multiverse',
        summary: 'The mosquito that buzz and pokes you or jabs you out of the map boundaries.',
        lore: 'As the Hand of Heven, the warrior called Angela embodies unwavering courage and determination. Able to manipulate Ichors into various weapons and unfurl her wings to soar across the battlefield, she is ready to deliver divine judgment upon her foes!',
        portrait: 'Images/AngelaStory.png',
        background: 'Images/AngelaSilhouette.png',
        card: 'Images/Angela.png',
        accent: '#ff9cd6',
        realName: 'Aldrif Odinsdottir',
        attackType: 'Melee Heroes',
        health: '450',
        stats: [
          { label: 'Difficulty', value: '★★★★' },
          { label: 'Attack Type', value: 'Jab,Block,Charge' },
          { label: 'Mobility', value: 'Flight/Ground' },
          { label: 'Passive', value: 'Wingblade Ascent' }
        ],
        abilities: [
          { name: 'Shielded Stance', description: 'Transform Ichors into a shield, gaining Attack Charge when absorbing damage.' },
          { name: 'Assassins Charge', description: 'Enter an accelerated dash state. Enemies struck head-on are carried through the air for a short distance.' },
          { name: 'Divine Judgement', description: 'Dive downward to create a Divine Judgement Zone upon impact.' },
          { name: 'Hevens Retribution', description: 'Upon impact, the ribbons bind nearby enemies. Angela can leap to the spears location, damaging surrounding enemies and creating a Divine Judgement Zone.' }
        ]
      },
      {
        id: 'captain-america',
        category: 'vanguard',
        name: 'Captain America',
        tagline: 'Mr. I Can Do This All Day',
        summary: 'He really can do this all day... He hates cloak users.',
        lore: 'Enhanced by the Super-Soldier Serum, Steven "Steve" Rogers uses his Vibranium shield and extensive combat training to confront any threat to justice. When Captain America rallies his troops, a wave of courage sweeps across the battlefield!',
        portrait: 'Images/AmericaStory.png',
        background: 'Images/AmericaSilhouette.png',
        card: 'Images/America.png',
        accent: '#4287f5',
        realName: 'Steve Rogers',
        attackType: 'Melee Heroes',
        health: '575',
        stats: [
          { label: 'Difficulty', value: '★★★' },
          { label: 'Attack Type', value: 'Melee Bonking' },
          { label: 'Mobility', value: 'Alot of Mobility' },
          { label: 'Passive', value: 'Captains Spirit' }
        ],
        abilities: [
          { name: 'Living Legend', description: 'Raise the shield to deflect incoming Projectiles, sending them ricocheting in random directions.' },
          { name: 'Vibranium Energy Saw', description: 'Hurl the energy-charged shield to strike enemies in a path.' },
          { name: 'Freedom Charge', description: 'Shield held high, carve a path forward, granting both himself and allies along the path continuous Bonus Health and Movement Boosts.' }
        ]
      },
      {
        id: 'venom',
        category: 'vanguard',
        name: 'Venom',
        tagline: 'The 19- Dark Symbiote',
        summary: 'Loves going for the snow bunny healers and is the living Mahoraga to tank all those damages.',
        lore: 'Using his symbiote-enhanced body as the perfect living weapon, Eddie Brock and his alien ally stand ever-ready to unleash vicious attacks upon anyone he deems an enemy. Those ensnared by Venoms tentacles have no choice but to surrender to this insatiable predator.',
        portrait: 'Images/VenomStory.png',
        background: 'Images/VenomSilhouette.png',
        card: 'Images/Venom.png',
        accent: '#38403f',
        realName: 'Eddie Brock',
        attackType: 'Melee Heroes',
        health: '650',
        stats: [
          { label: 'Difficulty', value: '★' },
          { label: 'Attack Type', value: 'Tentacle Touchy' },
          { label: 'Mobility', value: 'Swing' },
          { label: 'Passive', value: 'Alien Biology' }
        ],
        abilities: [
          { name: 'Symbiotic Resilience', description: 'The lower Venoms Health, the greater the Bonus Health generated.' },
          { name: 'Frenzied Arrival', description: 'Dash to the target location from a certain height and launch them Up towards the landing point.' },
          { name: 'Divine Judgement', description: 'Dive downward to create a Divine Judgement Zone upon impact.' },
          { name: 'Cellular Corrosion', description: 'Unleash tentacles to Slow enemies within reach. Enemies unable to break free in time will suffer damage.' },
          { name: 'Feast Of The Abyss', description: 'Burrow underground for free movement. Devour enemies above to deal damage based on the enemys current health and generate equivalent Bonus Health.' },
        ]
      },
      {
        id: 'thor',
        category: 'vanguard',
        name: 'Thor',
        tagline: 'Need a tank to do alot of damage?',
        summary: '"Where were you? We need tank!" Thor: "I was killing the enemies that were in the way."',
        lore: 'The son of Odin taps into his divine power to call forth thunder and lightning, raining down relentless fury upon his enemies. With his mighty hammer Mjölnir in hand, Thor effortlessly asserts his dominance on the field of combat.',
        portrait: 'Images/ThorStory.png',
        background: 'Images/ThorSilhouette.png',
        card: 'Images/Thor.png',
        accent: '#85ceff',
        realName: 'Thor Odinson',
        attackType: 'Melee Heroes',
        health: '600',
        stats: [
          { label: 'Difficulty', value: '★★★★' },
          { label: 'Attack Type', value: 'Shazam' },
          { label: 'Mobility', value: 'Charge Ram' },
          { label: 'Passive', value: 'Thorforce' }
        ],
        abilities: [
          { name: 'Hammer Throw', description: 'Throw Mjolnir forward which then returns. Restore Thorforce upon hit.' },
          { name: 'Awakening Rune', description: 'Enter the Awakened state, granting Bonus Health and enhancing Mjölnir Bash. Gain Thorforce upon exiting the state.' },
          { name: 'Lightning Realm', description: 'Summon lightning to restore Thorforce based on the number of hit enemies. Enemies leaving the Lightning Realm will suffer Slow and Grounded effects.' },
          { name: 'God Of Thunder', description: 'Soar upwards and smite the ground after charging for a duration, inflicting damage and stunning enemies within range.' }
        ]
      },
      {
        id: 'thing',
        category: 'vanguard',
        name: 'The Thing',
        tagline: 'Its a thing...',
        summary: 'See well heres the thing about it...',
        lore: 'Benjamin J. Grimm is unquestionably the rock star of any team hes on. Always at the forefront of the fight, the Thing shields his allies with his unbreakable form, selflessly fending off any harm that comes their way.',
        portrait: 'Images/ThingStory.png',
        background: 'Images/ThingSilhouette.png',
        card: 'Images/Thing.png',
        accent: '#ffae00',
        realName: 'Ben Grimm',
        attackType: 'Melee Heroes',
        health: '700',
        stats: [
          { label: 'Difficulty', value: '★★★' },
          { label: 'Attack Type', value: 'Left, Right, Goodnight' },
          { label: 'Mobility', value: 'Running' },
          { label: 'Passive', value: 'Unyielding Will' }
        ],
        abilities: [
          { name: 'Yancy Street Charge', description: 'Continuously charge forward, launching up enemies and leaving behind a zone at the final position that prevents the use of mobility abilities.' },
          { name: 'Stone Haymaker', description: 'Deliver a devastating Heavy Blow that inflicts additional damage with each strike! Upon hit, gain Bonus Health. ' },
          { name: 'Clobberin Time', description: 'Use immense power to launch all enemies in front of you into the air.' },
        ]
      },
      {
        id: 'peni',
        category: 'vanguard',
        name: 'Peni Parker',
        tagline: 'Potato Miner',
        summary: 'Its protected by the law and lots of ticking web mines',
        lore: 'Peni Parker may be young, but she bravely stands on the frontlines to protect the Web of Life and Destiny. Together, this teen prodigy and her state-of-the-art mech, the sensational SP//dr, make for the most thrilling duo on the battlefield!',
        portrait: 'Images/PeniStory.png',
        background: 'Images/PeniSilhouette.png',
        card: 'Images/Peni.png',
        accent: '#ff1e00',
        realName: 'Peni Parker',
        attackType: 'Projectile Heroes',
        health: '750',
        stats: [
          { label: 'Difficulty', value: '★★★' },
          { label: 'Attack Type', value: 'Web, Place Mine, Web again.' },
          { label: 'Mobility', value: 'Webs' },
          { label: 'Passive', value: 'Wall Crawl' }
        ],
        abilities: [
          { name: 'Bionic Spider-nest', description: 'Generate a Bionic Spider-Nest at a targeted area, periodically spawning Spider-Drones and creating Cyber-Webs.' },
          { name: 'Cyber-web Snare', description: 'Cast futuristic webbing that Immobilizes enemies or creates a Cyber-Web. ' },
          { name: 'Arachno-mine', description: 'Deploy Arachno-Mines that can be concealed within the confines of a Cyber-Web.' },
          { name: 'Spider-sweeper', description: 'Enhance the SP//dr suit, Launching Up enemies in its path and deploying Arachno-Mines, Spider-Drones, and Cyber-Webs repeatedly.' },
        ]
      },
      {
        id: 'magneto',
        category: 'vanguard',
        name: 'Magneto',
        tagline: 'Best Tanker in the game',
        summary: 'Its a magnet...',
        lore: 'The Master of Magnetism bends even the strongest metal to his whims, shielding his allies and striking at his foes. Whether he calls himself Max Eisenhardt, Erik Lehnsherr, or simply Magneto, the hardships this warrior has endured have made him as unbreakable as the steel he brandishes.',
        portrait: 'Images/MagnetoStory.png',
        background: 'Images/MagnetoSilhouette.png',
        card: 'Images/Magneto.png',
        accent: '#7b0aa1',
        realName: 'Max Eisenhardt',
        attackType: 'Projectile Heroes',
        health: '650',
        stats: [
          { label: 'Difficulty', value: '★★★' },
          { label: 'Attack Type', value: 'Throws Metal and Shields Metal' },
          { label: 'Mobility', value: 'Air Decend' },
          { label: 'Passive', value: 'Ace Greatswords Fired' }
        ],
        abilities: [
          { name: 'Metallic Curtain', description: 'Change the magnetic field around to form a metallic curtain, blocking all incoming Projectiles.' },
          { name: 'Metal Bulwark', description: 'Conjure a metal shield around a chosen ally. Damage taken will transform into rings on Magnetos back.' },
          { name: 'Meteor M', description: 'Draw in all materials around to forge an iron meteor that deals massive damage upon impact. Absorbing enemy Projectiles can enhance the meteors power, yet overloading will cause it to self-destruct.' },
        ]
      },
      {
        id: 'hulk',
        category: 'vanguard',
        name: 'Hulk',
        tagline: 'Green Goliath',
        summary: 'Green big boi with lots of health and damage to spare and is target lock to Jeff',
        lore: 'Brilliant scientist Dr. Bruce Banner has finally found a way to coexist with his monstrous alter ego, the Hulk. By accumulating gamma energy over transformations, he can become a wise and strong Hero Hulk or a fierce and destructive Monster Hulk',
        portrait: 'Images/HulkStory.png',
        background: 'Images/HulkSilhouette.png',
        card: 'Images/Hulk.png',
        accent: '#04ff00',
        realName: 'Bruce Banner',
        attackType: 'Melee Heroes',
        health: '200 (Human Form)',
        health: '650 (Hero Hulk Form)',
        health: '1400 (Monster Hulk Form)',
        stats: [
          { label: 'Difficulty', value: '★★★★' },
          { label: 'Attack Type', value: 'Smash, Punch, and Throw' },
          { label: 'Mobility', value: 'Jump...Smash' },
          { label: 'Passive', value: 'Puny Banner' }
        ],
        abilities: [
          { name: 'Gamma Grenade', description: 'Launch a Gamma Grenade to inflict damage and Launch Up enemies.' },
          { name: 'Radioactive Lockdown', description: 'Emit gamma energy to render enemies immobilized and immune to all ability effects.' },
          { name: 'Incredible Leap', description: 'THold to perform a charged leap that allows Hero Hulk to Knock Down flying enemies.' },
          { name: 'Indestructible Guard', description: 'Generate gamma shields for Hero Hulk and nearby allies, absorbing and converting damage into energy for HULK SMASH!' },
          { name: 'Hulk Smash', description: 'Unleash stored gamma energy, transforming from Hero Hulk into Monster Hulk for a limited time period.' },
          { name: 'World Breaker', description: 'Gets loki treatment.' },
        ]
      },
      {
        id: 'groot',
        category: 'vanguard',
        name: 'Groot',
        tagline: 'Average Fornite Players',
        summary: 'I. Am. Groot.',
        lore: 'A flora colossus from Planet X, the alien known as Groot exhibits enhanced vitality and the ability to manipulate all forms of vegetation. As sturdy as a towering tree, Groot forges his own way, serving as the teams silent but reliable pathfinder.',
        portrait: 'Images/GrootStory.png',
        background: 'Images/GrootSilhouette.png',
        card: 'Images/Groot.png',
        accent: '#009118',
        realName: 'Groot',
        attackType: 'Melee Heroes',
        health: '700',
        stats: [
          { label: 'Difficulty', value: '★★' },
          { label: 'Attack Type', value: 'Sticks' },
          { label: 'Mobility', value: 'Walking' },
          { label: 'Passive', value: 'Flora Colossus' }
        ],
        abilities: [
          { name: 'Thornlash Wall', description: 'Im Groot..' },
          { name: 'Ironwood Wall', description: 'I am Groot?' },
          { name: 'Spore Bomb', description: 'Im GRROOOT!' },
          { name: 'Strangling Prison', description: 'I. AM. GROOOT!' },
        ]
      },
      {
        id: 'emma-frost',
        category: 'vanguard',
        name: 'Emma Frost',
        tagline: 'Mommy Queen Of Gooners',
        summary: 'The White Queen is a powerful telepath and shapeshifter who is the leader of the X-Men.',
        lore: 'For Emma Frost, war is the purest form of art. With her formidable telepathic abilities, she intricately weaves a deadly mental web that ensnares her foes, while her indestructible diamond form lets her lead her teammates fearlessly into the fray.',
        portrait: 'Images/EmmaStory.png',
        background: 'Images/EmmaSilhouette.png',
        card: 'Images/Emma.png',
        accent: '#6efffa',
        realName: 'Emma Frost',
        attackType: 'Hitscan Heroes',
        health: '550',
        stats: [
          { label: 'Difficulty', value: '★★★' },
          { label: 'Attack Type', value: 'Mind Laser' },
          { label: 'Mobility', value: 'Walking' },
          { label: 'Passive', value: 'Diamond Form' }
        ],
        abilities: [
          { name: 'Minds Aegis', description: 'Create a levitating barrier at the designated location.' },
          { name: 'Crystal Kick', description: 'In Diamond Form, unleash a flying kick forward and knock back enemies; extra damage is dealt if theyre propelled into a wall.' },
          { name: 'Carbon Crush', description: 'In Diamond Form, lunge forward to grab an enemy, then execute a back slam to inflict damage.' },
          { name: 'Psionic Seduction', description: 'Project a forward psychic assault that stuns foes and prevents them from unleashing their Ultimate Abilities; if the effect lingers, it gradually commandeers their mind, forcing them to move toward Emma Frost.' },
        ]
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
        tagline: 'Vigilante Duelist',
        summary: 'If you see an enemy that others cannot see... TAKE IT DOWN! What Konshu wants, Konshu gets.',
        lore: 'As the avatar of the Egyptian God of Vengeance, Marc Spectors body has been enhanced by Khonshu himself. Bathed in a luminous aura that pierces the darkness, Moon Knight glides through the night, ready to sear his enemies with his masters sacred Ankhs.',
        portrait: 'Images/MoonStory.png',
        background: 'Images/MoonSilhouette.png',
        card: 'Images/Moon.png',
        accent: '#b7c7ff',
        realName: 'Marc Spector, Jake Lockley, Steven Grant',
        health: '250',
        attackType: 'Projectile Heroes',
        stats: [
          { label: 'Difficulty', value: '★★★★★' },
          { label: 'Durability', value: 'High' },
          { label: 'Mobility', value: 'Limited' },
          { label: 'Utility', value: 'Moonlight Hook' } ],
          abilities: [
            { name: 'Moon Blade', description: 'Bounce between enemies and Ankhs, dealing damage to enemies while granting Bonus Health.' },
            { name: 'Ancient Ankh', description: 'Fire an Ankh to Knock enemies within its radius airborne towards the center.' },
            { name: 'Night Glider', description: 'Great... He glides now.' },
            { name: 'Hand Of Khonshu', description: 'Open a portal that allows Khonshu to bombard enemies with his talons.' }
          ]
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
        id: 'adam-warlock',
        category: 'strategist',
        name: 'Adam Warlock',
        tagline: 'Dps Warlock',
        summary: 'Only goes for perfect KDA and cant be bothered to heal his team.',
        lore: 'The genetically-engineered Adam Warlock wields powerful Quantum Magic, enabling him to connect and heal souls with a gentle touch. When the time comes for his allies to unite, Warlock stands as the unwavering epicenter of cosmic justice!',
        portrait: 'Images/AdamStory.png',
        background: 'Images/AdamSilhouette.png',
        card: 'Images/Adam.png',
        accent: '#f6d95f',
        realName: 'Adam',
        attackType: 'Projectile Heroes',
        health: '250',
        stats: [
          { label: 'Difficulty', value: '★★☆☆☆' },
          { label: 'Attack Type', value: 'Hitscan' },
          { label: 'Mobility', value: 'Nerf Movement MORE' },
          { label: 'Passive', value: 'Regenerative Cocoon' }
        ],
        abilities: [  
          { name: 'Avatar Life Stream', description: 'Target an ally for a bouncing stream of healing energy, which also heals himself upon casting; self-targets if no ally is selected.' },
          { name: 'Soul Bond', description: 'Forge a soul bond with allies, granting Healing Over Time and distributing damage taken across the bond.' },
          { name: 'Karmic Revival', description: 'Awaken the karma of allies to revive them. Allies revived have lower health but enjoy a brief period of invincibility.' }
        ]
      },
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
        card: config.card || config.portrait || 'Images/PAngela.jpg', // Card image (use 'card:' property)
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
    const featureAttack = document.querySelector('[data-feature-attack]');
    const featureRealName = document.querySelector('[data-feature-realname]');
    const featureHealth = document.querySelector('[data-feature-health]');
    const featureDifficulty = document.querySelector('[data-feature-difficulty]');
    const filterDisplayCount = document.querySelector('[data-filter-count]');
    const rosterGrid = document.querySelector('[data-roster]');
    const filterButtons = Array.from(document.querySelectorAll('.hero-filter'));
    const heroFocus = document.querySelector('[data-hero-focus]');
    const rosterSection = document.querySelector('[data-roster-section]');
    const viewMoreButton = document.querySelector('.hero-feature__view-more');
    const viewMorePopup = document.querySelector('[data-feature-popup]');
    const viewMorePopupSkills = document.querySelector('[data-feature-popup-skills]');
    const viewMorePopupLore = document.querySelector('[data-feature-popup-lore]');
    
    let isPopupPinned = false; // Track if popup is pinned open

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
      // Also set accent colors on view more button and popup to ensure they inherit
      if (viewMoreButton) {
        viewMoreButton.style.setProperty('--hero-accent', hero.accent);
        viewMoreButton.style.setProperty('--hero-accent-soft', hero.accentSoft);
      }
      if (viewMorePopup) {
        viewMorePopup.style.setProperty('--hero-accent', hero.accent);
        viewMorePopup.style.setProperty('--hero-accent-soft', hero.accentSoft);
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

      // Update View More popup - show all skills (no placeholders)
      if (viewMorePopupSkills && hero.abilities) {
        viewMorePopupSkills.innerHTML = '';
        hero.abilities.forEach((ability) => {
          const li = document.createElement('li');
          const strong = document.createElement('strong');
          strong.textContent = ability.name;
          const span = document.createElement('span');
          span.textContent = ability.description || 'Details forthcoming.';
          li.appendChild(strong);
          li.appendChild(span);
          viewMorePopupSkills.appendChild(li);
        });
      }
      if (viewMorePopupLore) {
        viewMorePopupLore.textContent = hero.lore || 'Additional hero information will be displayed here.';
      }
      
      // Reset pinned state when hero changes
      isPopupPinned = false;
      if (viewMoreButton) {
        viewMoreButton.classList.remove('popup-pinned');
      }
      if (viewMorePopup) {
        viewMorePopup.classList.remove('pinned');
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
        card.className = `hero-roster__card hero-roster__card--${hero.id}`;
        card.dataset.heroId = hero.id;
        // Apply unique styling using hero's accent color
        card.style.setProperty('--hero-accent', hero.accent || '#ffd700');
        card.style.setProperty('--hero-accent-soft', hero.accentSoft || 'rgba(255,215,0,0.2)');
        // Use card property if available, otherwise fall back to portrait
        const cardImg = hero.card || hero.portrait;
        card.innerHTML = `
          <div class="hero-roster__art">
            <img src="${cardImg}" alt="${hero.name}" loading="lazy" />
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

    // View More button - toggle pin/unpin popup
    if (viewMoreButton) {
      viewMoreButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        isPopupPinned = !isPopupPinned;
        
        if (isPopupPinned) {
          // Pin popup open
          viewMoreButton.classList.add('popup-pinned');
          if (viewMorePopup) {
            viewMorePopup.classList.add('pinned');
          }
        } else {
          // Unpin - return to hover-only
          viewMoreButton.classList.remove('popup-pinned');
          if (viewMorePopup) {
            viewMorePopup.classList.remove('pinned');
          }
        }
      });
    }

    // Prevent popup scroll from scrolling the main page
    if (viewMorePopup) {
      // Stop wheel events from bubbling to prevent page scroll
      viewMorePopup.addEventListener('wheel', (e) => {
        const { scrollTop, scrollHeight, clientHeight } = viewMorePopup;
        const isScrollingUp = e.deltaY < 0;
        const isScrollingDown = e.deltaY > 0;
        const isAtTop = scrollTop <= 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
        
        // If we can scroll in the popup, prevent the event from reaching the page
        if (!((isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown))) {
          e.stopPropagation();
        } else {
          // At boundaries, prevent default to stop page scroll
          e.preventDefault();
          e.stopPropagation();
        }
      }, { passive: false });

      // Stop touch scroll events from bubbling
      viewMorePopup.addEventListener('touchmove', (e) => {
        const { scrollTop, scrollHeight, clientHeight } = viewMorePopup;
        const isAtTop = scrollTop <= 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
        
        // If not at boundaries, stop propagation so page doesn't scroll
        if (!isAtTop && !isAtBottom) {
          e.stopPropagation();
        }
      }, { passive: true });
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


