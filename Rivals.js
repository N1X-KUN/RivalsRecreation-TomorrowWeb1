(function() {
  const root = document.documentElement;

  // Page Loader - Show on navigation (except when going back to home or returning from external sites)
  (function initPageLoader() {
    const pageLoader = document.getElementById('page-loader');
    if (!pageLoader) return;

    // Check if returning from external site (like YouTube)
    const referrer = document.referrer;
    const isReturningFromExternal = referrer && !referrer.includes(window.location.hostname) && !referrer.includes('localhost') && !referrer.includes('127.0.0.1');
    
    // Check if we're navigating away from home page
    const currentPage = window.location.pathname.split('/').pop() || '';
    const isHomePage = currentPage === 'Rivals.html' || currentPage === '' || currentPage === 'index.html';
    const previousPage = sessionStorage.getItem('previousPage') || '';
    const isReturningToHome = isHomePage && previousPage && previousPage !== 'Rivals.html' && previousPage !== '' && previousPage !== 'index.html';

    // Store current page for next navigation
    sessionStorage.setItem('previousPage', currentPage);

    // Don't show loader if returning from external site or returning to home
    if (isReturningFromExternal || isReturningToHome || isHomePage) {
      pageLoader.classList.remove('active');
      return;
    }

    // Show loader only for internal page navigation
    if (!isHomePage) {
      pageLoader.classList.add('active');
      
      // Hide loader after page loads
      window.addEventListener('load', () => {
        setTimeout(() => {
          pageLoader.classList.remove('active');
        }, 3000); // 3 seconds
      });
    } else {
      pageLoader.classList.remove('active');
    }

    // Intercept link clicks to show loader (only for internal links)
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      
      // Don't show loader for external links
      if (href.startsWith('http://') || href.startsWith('https://')) {
        // Check if it's an external link
        try {
          const url = new URL(href, window.location.origin);
          if (url.hostname !== window.location.hostname && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
            return; // External link, don't show loader
          }
        } catch (e) {
          // Invalid URL, skip
          return;
        }
      }
      
      const targetPage = href.split('/').pop() || '';
      const isHomeLink = targetPage === 'Rivals.html' || targetPage === '' || targetPage === 'index.html';
      const currentPageName = window.location.pathname.split('/').pop() || '';
      const isCurrentlyHome = currentPageName === 'Rivals.html' || currentPageName === '' || currentPageName === 'index.html';
      
      // Show loader if:
      // 1. Going from home to another page, OR
      // 2. Going from one page to another page
      // BUT NOT if going back to home
      if ((isCurrentlyHome && !isHomeLink) || (!isCurrentlyHome && !isHomeLink)) {
        pageLoader.classList.add('active');
      }
    });
  })();

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
  
  // Ensure popup starts closed
  if (loginPopup) {
    loginPopup.setAttribute('hidden', 'true');
    loginPopup.removeAttribute('open');
    sessionStorage.setItem('loginPopupOpen', 'false');
  }

  window.openLoginPopup = function openLoginPopup() {
    if (loginPopup) {
      loginPopup.removeAttribute('hidden');
      loginPopup.setAttribute('open', 'true');
      loginPopup.style.display = '';
      document.body.style.overflow = 'hidden';
      sessionStorage.setItem('loginPopupOpen', 'true');
      // Check guest status when popup opens
      setTimeout(checkGuestStatus, 100);
    }
  }

  function closeLoginPopup() {
    if (loginPopup) {
      loginPopup.setAttribute('hidden', 'true');
      loginPopup.removeAttribute('open');
      document.body.style.overflow = '';
      sessionStorage.setItem('loginPopupOpen', 'false');
    }
  }

  if (loginBtn) loginBtn.addEventListener('click', (e) => { e.preventDefault(); openLoginPopup(); });
  if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', (e) => { e.preventDefault(); openLoginPopup(); });
  if (loginClose) loginClose.addEventListener('click', closeLoginPopup);
  if (loginOverlay) loginOverlay.addEventListener('click', closeLoginPopup);

  // YouTube Trailer Modal
  const trailerModal = document.getElementById('trailer-modal');
  const watchTrailerBtn = document.getElementById('watch-trailer-btn');
  const trailerModalClose = document.getElementById('trailer-modal-close');
  const trailerModalBackdrop = document.getElementById('trailer-modal-backdrop');
  let trailerPlayer = null;
  const TRAILER_VIDEO_ID = '67FVMNGMFXU'; 
  // Store original music mute state before video plays
  let musicMutedBeforeVideo = null;
  let activeVideos = new Set(); // Track all playing videos
  
  function muteBackgroundMusic() {
    // Store current mute state only once
    if (musicMutedBeforeVideo === null) {
      musicMutedBeforeVideo = localStorage.getItem('musicMuted') === 'true';
    }
    // Mute music
    localStorage.setItem('musicMuted', 'true');
    // Trigger music player update if available
    if (window.globalIsMuted !== undefined) {
      window.globalIsMuted = true;
    }
    // Dispatch custom event for music player to listen
    window.dispatchEvent(new CustomEvent('musicMuteRequest', { detail: { mute: true } }));
  }
  
  function unmuteBackgroundMusic() {
    // Only unmute if no videos are playing
    if (activeVideos.size > 0) {
      return; // Still have videos playing
    }
    
    // Restore original mute state
    if (musicMutedBeforeVideo !== null) {
      localStorage.setItem('musicMuted', musicMutedBeforeVideo.toString());
      musicMutedBeforeVideo = null;
    } else {
      // If no stored state, check if user had it unmuted
      const userManuallyUnmuted = localStorage.getItem('userManuallyUnmuted') === 'true';
      if (userManuallyUnmuted) {
        localStorage.setItem('musicMuted', 'false');
      }
    }
    // Trigger music player update if available
    if (window.globalIsMuted !== undefined) {
      window.globalIsMuted = localStorage.getItem('musicMuted') === 'true';
    }
    // Dispatch custom event for music player to listen
    window.dispatchEvent(new CustomEvent('musicMuteRequest', { detail: { mute: localStorage.getItem('musicMuted') === 'true' } }));
  }
  
  // Monitor all HTML5 video elements on the page
  function setupVideoMonitoring() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      // Skip muted/autoplay videos (like hero background video)
      if (video.muted && video.hasAttribute('autoplay')) {
        return; // Don't monitor background videos
      }
      
      const videoId = video.id || `video-${Math.random()}`;
      
      video.addEventListener('play', () => {
        activeVideos.add(videoId);
        muteBackgroundMusic();
      });
      
      video.addEventListener('pause', () => {
        activeVideos.delete(videoId);
        unmuteBackgroundMusic();
      });
      
      video.addEventListener('ended', () => {
        activeVideos.delete(videoId);
        unmuteBackgroundMusic();
      });
    });
  }
  
  // Setup video monitoring when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupVideoMonitoring);
  } else {
    setupVideoMonitoring();
  }
  
  // Also monitor dynamically added videos
  const videoObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          if (node.tagName === 'VIDEO') {
            setupVideoMonitoring();
          } else if (node.querySelectorAll) {
            const videos = node.querySelectorAll('video');
            if (videos.length > 0) {
              setupVideoMonitoring();
            }
          }
        }
      });
    });
  });
  
  videoObserver.observe(document.body, { childList: true, subtree: true });

  function initializeTrailerPlayer() {
    if (!trailerPlayer && window.YT && window.YT.Player) {
      const playerContainer = document.getElementById('trailer-player');
      if (playerContainer) {
        trailerPlayer = new window.YT.Player('trailer-player', {
          videoId: TRAILER_VIDEO_ID,
          playerVars: {
            autoplay: 1,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1
          },
          events: {
            onReady: function(event) {
              event.target.playVideo();
            },
            onStateChange: function(event) {
              // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
              const videoId = 'youtube-trailer';
              if (event.data === window.YT.PlayerState.PLAYING) {
                // Video started playing - mute background music
                activeVideos.add(videoId);
                muteBackgroundMusic();
              } else if (event.data === window.YT.PlayerState.PAUSED || 
                         event.data === window.YT.PlayerState.ENDED) {
                // Video paused or ended - unmute background music
                activeVideos.delete(videoId);
                unmuteBackgroundMusic();
              }
            }
          }
        });
      }
    }
  }

  function openTrailerModal() {
    if (trailerModal) {
      trailerModal.toggleAttribute('hidden', false);
      document.body.style.overflow = 'hidden';
      
      // Wait for YouTube API to be ready, then initialize player
      if (window.YT && window.YT.Player) {
        initializeTrailerPlayer();
      } else if (window.onYouTubeIframeAPIReady) {
        // API is loading, wait for it
        const originalReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = function() {
          if (originalReady) originalReady();
          setTimeout(initializeTrailerPlayer, 100);
        };
      } else {
        window.onYouTubeIframeAPIReady = function() {
          setTimeout(initializeTrailerPlayer, 100);
        };
      }
    }
  }

  function closeTrailerModal() {
    if (trailerModal) {
      trailerModal.toggleAttribute('hidden', true);
      document.body.style.overflow = '';
      
      // Remove YouTube video from active videos
      activeVideos.delete('youtube-trailer');
      
      // Unmute music when closing modal
      unmuteBackgroundMusic();
      
      // Stop and destroy YouTube player
      if (trailerPlayer) {
        try {
          if (trailerPlayer.stopVideo) {
            trailerPlayer.stopVideo();
          }
          if (trailerPlayer.destroy) {
            trailerPlayer.destroy();
          }
        } catch (e) {
          console.error('Error stopping trailer player:', e);
        }
        trailerPlayer = null;
        
        // Clear the player container
        const playerContainer = document.getElementById('trailer-player');
        if (playerContainer) {
          playerContainer.innerHTML = '';
        }
      }
    }
  }

  if (watchTrailerBtn) {
    watchTrailerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openTrailerModal();
    });
  }

  if (trailerModalClose) {
    trailerModalClose.addEventListener('click', closeTrailerModal);
  }

  if (trailerModalBackdrop) {
    trailerModalBackdrop.addEventListener('click', closeTrailerModal);
  }

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && trailerModal && !trailerModal.hasAttribute('hidden')) {
      closeTrailerModal();
    }
  });

  // Close popup with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && loginPopup && loginPopup.hasAttribute('open')) {
      closeLoginPopup();
    }
  });

  // Switch between registration and login in split-screen design
  const popupSwitchToLogin = document.getElementById('popup-switchToLogin');
  const popupExpandLink = document.getElementById('popup-expandLink');
  const popupExpandContent = document.getElementById('popup-expandContent');
  
  if (popupSwitchToLogin) {
    popupSwitchToLogin.addEventListener('click', () => {
      if (popupExpandContent) {
        popupExpandContent.removeAttribute('hidden');
        if (popupExpandLink) {
          popupExpandLink.setAttribute('aria-expanded', 'true');
        }
      }
    });
  }
  
  if (popupExpandLink && popupExpandContent) {
    popupExpandLink.addEventListener('click', () => {
      const isCurrentlyExpanded = popupExpandLink.getAttribute('aria-expanded') === 'true';
      if (isCurrentlyExpanded) {
        popupExpandContent.setAttribute('hidden', '');
        popupExpandLink.setAttribute('aria-expanded', 'false');
      } else {
        popupExpandContent.removeAttribute('hidden');
        popupExpandLink.setAttribute('aria-expanded', 'true');
      }
    });
  }

  // Generate random captcha for popup
  let popupCaptcha = Math.floor(Math.random() * 9000) + 1000;
  const popupCaptchaText = document.getElementById('popup-captcha-text');
  if (popupCaptchaText) {
    popupCaptchaText.textContent = popupCaptcha.toString();
  }

  // Refresh captcha
  const popupRefreshCaptcha = document.getElementById('popup-refreshCaptcha');
  if (popupRefreshCaptcha) {
    popupRefreshCaptcha.addEventListener('click', () => {
      popupCaptcha = Math.floor(Math.random() * 9000) + 1000;
      if (popupCaptchaText) popupCaptchaText.textContent = popupCaptcha.toString();
      const captchaInput = document.getElementById('popup-reg-captcha');
      if (captchaInput) captchaInput.value = '';
    });
  }

  // Enable/disable registration button
  function checkPopupRegistrationForm() {
    const submitBtn = document.getElementById('popup-reg-submit-btn');
    if (!submitBtn) return;
    
    const email = document.getElementById('popup-reg-email')?.value;
    const nickname = document.getElementById('popup-reg-nickname')?.value;
    const password = document.getElementById('popup-reg-password')?.value;
    const passwordRepeat = document.getElementById('popup-reg-password-repeat')?.value;
    const captcha = document.getElementById('popup-reg-captcha')?.value;
    const terms = document.getElementById('popup-reg-terms')?.checked;

    const isValid = 
        email && 
        nickname && 
        password && 
        password === passwordRepeat && 
        captcha === popupCaptcha.toString() && 
        terms;

    submitBtn.disabled = !isValid;
  }

  // Add event listeners for registration form validation
  ['popup-reg-email', 'popup-reg-nickname', 'popup-reg-password', 'popup-reg-password-repeat', 'popup-reg-captcha', 'popup-reg-terms'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', checkPopupRegistrationForm);
      el.addEventListener('change', checkPopupRegistrationForm);
    }
  });

  // Password match validation
  const popupPasswordRepeat = document.getElementById('popup-reg-password-repeat');
  if (popupPasswordRepeat) {
    popupPasswordRepeat.addEventListener('input', function() {
      const password = document.getElementById('popup-reg-password')?.value;
      const passwordRepeat = this.value;
      
      if (passwordRepeat && password !== passwordRepeat) {
        this.setCustomValidity('Passwords do not match');
      } else {
        this.setCustomValidity('');
      }
      checkPopupRegistrationForm();
    });
  }

  // Registration Form Submission
  const popupRegistrationForm = document.getElementById('popup-registrationForm');
  if (popupRegistrationForm) {
    popupRegistrationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('popup-reg-email').value;
      const nickname = document.getElementById('popup-reg-nickname').value;
      const password = document.getElementById('popup-reg-password').value;
      const passwordRepeat = document.getElementById('popup-reg-password-repeat').value;
      const captcha = document.getElementById('popup-reg-captcha').value;
      
      // Validate captcha
      if (captcha !== popupCaptcha.toString()) {
        alert('Invalid captcha code. Please try again.');
        popupCaptcha = Math.floor(Math.random() * 9000) + 1000;
        if (popupCaptchaText) popupCaptchaText.textContent = popupCaptcha.toString();
        document.getElementById('popup-reg-captcha').value = '';
        return;
      }
      
      // Validate password match
      if (password !== passwordRepeat) {
        alert('Passwords do not match.');
        return;
      }
      
      try {
        const response = await fetch('/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            name: nickname, 
            email: email, 
            password: password 
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          alert('Account created successfully! Please log in.');
          // Expand login section
          const expandContent = document.getElementById('popup-expandContent');
          const expandBtn = document.getElementById('popup-expandLink');
          if (expandContent && expandBtn) {
            expandContent.hidden = false;
            expandBtn.setAttribute('aria-expanded', 'true');
          }
          // Pre-fill email
          const loginEmail = document.getElementById('popup-login-email');
          if (loginEmail) loginEmail.value = email;
        } else {
          alert(data.error || 'Registration failed. Please try again.');
        }
      } catch (error) {
        alert('Network error. Please make sure the server is running.');
        console.error('Registration error:', error);
      }
    });
  }

  // Login Form Submission
  const popupLoginForm = document.getElementById('popup-loginForm');
  if (popupLoginForm) {
    popupLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('popup-login-email').value;
      const password = document.getElementById('popup-login-password').value;
      
      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          alert('Login successful!');
          closeLoginPopup();
          window.location.reload();
        } else {
          alert(data.error || 'Invalid email or password.');
        }
      } catch (error) {
        alert('Network error. Please make sure the server is running.');
        console.error('Login error:', error);
      }
    });
  }

  // Check if user is logged in as guest on page load
  function checkGuestStatus() {
    const isGuest = localStorage.getItem('isGuest') === 'true' || sessionStorage.getItem('isGuest') === 'true';
    const guestStatus = document.getElementById('guest-status');
    const loginDescription = document.getElementById('login-description');
    const popupGuestLogin = document.getElementById('popup-guestLogin');
    
    if (isGuest && guestStatus) {
      guestStatus.style.display = 'block';
      if (loginDescription) loginDescription.style.display = 'none';
      if (popupGuestLogin) popupGuestLogin.style.display = 'none';
    } else {
      if (guestStatus) guestStatus.style.display = 'none';
      if (loginDescription) loginDescription.style.display = 'block';
      if (popupGuestLogin) popupGuestLogin.style.display = 'flex';
    }
  }

  // Guest Login Button (Continue As Guest)
  const popupGuestLogin = document.getElementById('popup-guestLogin');
  if (popupGuestLogin) {
    popupGuestLogin.addEventListener('click', async () => {
      // Create guest user locally (no MongoDB required)
      const guestUser = {
        name: 'Guest User',
        email: `guest_${Date.now()}@anonymous.local`,
        id: `guest_${Date.now()}`,
        isGuest: true
      };
      
      // Store guest session in browser storage (no server needed)
      sessionStorage.setItem('guestUser', JSON.stringify(guestUser));
      sessionStorage.setItem('isGuest', 'true');
      localStorage.setItem('isGuest', 'true');
      localStorage.setItem('guestUser', JSON.stringify(guestUser));
      
      // Update UI to show guest status
      checkGuestStatus();
      
      // Show success message
      alert('Logged in as Guest! Welcome to Rival!');
      
      // Optionally try to save to server in background (non-blocking)
      try {
        const response = await fetch('/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: guestUser.name,
            email: guestUser.email,
            password: null
          })
        });
        // Don't wait for response - guest login works regardless
      } catch (error) {
        // Ignore server errors - guest login works offline
        console.log('Guest user saved locally (server unavailable)');
      }
    });
  }

  // Guest Logout Button
  const guestLogoutBtn = document.getElementById('guest-logout-btn');
  if (guestLogoutBtn) {
    guestLogoutBtn.addEventListener('click', () => {
      // Clear guest session
      sessionStorage.removeItem('guestUser');
      sessionStorage.removeItem('isGuest');
      localStorage.removeItem('isGuest');
      localStorage.removeItem('guestUser');
      
      // Update UI
      checkGuestStatus();
      
      alert('Logged out as Guest');
    });
  }

  // Check on page load
  checkGuestStatus();

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
  // Maps Carousel - Redesigned with manual controls
  const mapsCarousel = document.getElementById('maps-carousel');
  const carouselTrack = document.getElementById('carousel-track');
  const carouselContainer = mapsCarousel?.querySelector('.carousel-container');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dots = document.querySelectorAll('.carousel-dot');
  const slides = document.querySelectorAll('.carousel-slide');
  
  if (mapsCarousel && carouselTrack && slides.length > 0) {
    let currentSlide = 0;
    let autoPlayInterval = null;
    const autoPlayDelay = 5000; // 5 seconds
    
    // Function to update carousel
    function updateCarousel(index) {
      // Remove active class from all slides and dots
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
      
      // Update track position
      carouselTrack.style.transform = `translateX(-${index * 100}%)`;
      currentSlide = index;
    }
    
    // Next slide
    function nextSlide() {
      const next = (currentSlide + 1) % slides.length;
      updateCarousel(next);
    }
    
    // Previous slide
    function prevSlide() {
      const prev = (currentSlide - 1 + slides.length) % slides.length;
      updateCarousel(prev);
    }
    
    // Auto-play
    function startAutoPlay() {
      stopAutoPlay();
      autoPlayInterval = setInterval(nextSlide, autoPlayDelay);
      if (carouselContainer) {
        carouselContainer.classList.remove('paused');
      }
    }
    
    function stopAutoPlay() {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
      if (carouselContainer) {
        carouselContainer.classList.add('paused');
      }
    }
    
    // Event listeners
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoPlay(); // Restart auto-play after manual navigation
      });
    }
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoPlay(); // Restart auto-play after manual navigation
      });
    }
    
    // Dot navigation
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        updateCarousel(index);
        startAutoPlay(); // Restart auto-play after manual navigation
      });
    });
    
    // Pause on hover
    if (carouselContainer) {
      carouselContainer.addEventListener('mouseenter', stopAutoPlay);
      carouselContainer.addEventListener('mouseleave', startAutoPlay);
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (mapsCarousel && !mapsCarousel.hasAttribute('hidden')) {
        if (e.key === 'ArrowLeft') {
          prevSlide();
          startAutoPlay();
        } else if (e.key === 'ArrowRight') {
          nextSlide();
          startAutoPlay();
        }
      }
    });
    
    // Start auto-play
    startAutoPlay();
    
    // Initialize first slide
    updateCarousel(0);
  }
  
  // Old roulette code (disabled - keeping for reference)
  const mapsRoulette = document.getElementById('maps-roulette');
  const rouletteTrack = document.getElementById('roulette-track');
  
  if (mapsRoulette && rouletteTrack && false) { // Disabled old carousel
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
      <a href="https://www.facebook.com/marvelrivals" target="_blank" rel="noopener" aria-label="Facebook">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.9v-7h-2.3V12h2.3V9.8c0-2.27 1.35-3.53 3.43-3.53.99 0 2.03.18 2.03.18v2.22h-1.14c-1.12 0-1.47.69-1.47 1.4V12h2.5l-.4 2.9h-2.1v7A10 10 0 0 0 22 12z"/></svg>
      </a>
      <a href="https://www.instagram.com/marvelrivals/?hl=en" target="_blank" rel="noopener" aria-label="Instagram">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.2A2.8 2.8 0 1 0 12 16.8 2.8 2.8 0 0 0 12 9.2zM17.5 6.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/></svg>
      </a>
      <a href="https://x.com/MarvelRivals" target="_blank" rel="noopener" aria-label="X">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M3 3h3.7l5.1 7 5.5-7H21l-7.3 9.3L21 21h-3.7l-5.5-7.6L6 21H3l7.8-9.9L3 3z"/></svg>
      </a>
      <a href="https://www.youtube.com/@MarvelRivals" target="_blank" rel="noopener" aria-label="YouTube">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.5 12 4.5 12 4.5s-5.7 0-7.5.6A3 3 0 0 0 2.4 7.2C1.8 9 1.8 12 1.8 12s0 3 .6 4.8a3 3 0 0 0 2.1 2.1c1.8.6 7.5.6 7.5.6s5.7 0 7.5-.6a3 3 0 0 0 2.1-2.1c.6-1.8.6-4.8.6-4.8s0-3-.6-4.8zM10 15.3V8.7l6 3.3-6 3.3z"/></svg>
      </a>
      <a href="https://discord.gg/marvelrivals" target="_blank" rel="noopener" aria-label="Discord">
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
          { label: 'Team', value: 'Odinsons, Guardians of the Galaxy' },
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
          { label: 'Team', value: 'Avengers' },
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
          { label: 'Team', value: 'Vigilante' },
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
          { label: 'Team', value: 'Odinsons, Avengers, Guardians of the Galaxy' },
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
          { label: 'Team', value: 'Fantastic Four' },
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
          { label: 'Team', value: 'SpiderVerse' },
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
          { label: 'Team', value: 'X-Men' },
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
        health: '200 (Human Form) \n 650 (Hero Hulk Form) \n 1400 (Monster Hulk Form)',
        stats: [
          { label: 'Difficulty', value: '★★★★' },
          { label: 'Team', value: 'Avengers' },
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
          { label: 'Team', value: 'Guardians of the Galaxy' },
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
          { label: 'Team', value: 'X-Men' },
          { label: 'Mobility', value: 'Walking' },
          { label: 'Passive', value: 'Diamond Form' }
        ],
        abilities: [
          { name: 'Minds Aegis', description: 'Create a levitating barrier at the designated location.' },
          { name: 'Crystal Kick', description: 'In Diamond Form, unleash a flying kick forward and knock back enemies; extra damage is dealt if theyre propelled into a wall.' },
          { name: 'Carbon Crush', description: 'In Diamond Form, lunge forward to grab an enemy, then execute a back slam to inflict damage.' },
          { name: 'Psionic Seduction', description: 'Project a forward psychic assault that stuns foes and prevents them from unleashing their Ultimate Abilities; if the effect lingers, it gradually commandeers their mind, forcing them to move toward Emma Frost.' },
        ]
      },
      {
        id: 'doctor-strange',
        category: 'vanguard',
        name: 'Doctor Strange',
        tagline: 'Im Opening a Portal to your heart,Type Shift',
        summary: 'BY THE POWER OF GREYSKUL- wait wrong spell, ABRACADABRA!',
        lore: 'As the Sorcerer Supreme, Dr. Stephen Strange gracefully wields ancient spells to turn the tide of even the most impossible battle. However, magic always comes at a cost, and each use of his arcane abilities gradually awakens the darkness within him.',
        portrait: 'Images/StrangeStory.png',
        background: 'Images/StrangeSilhouette.png',
        card: 'Images/Doctor.png',
        accent: '#ff4800',
        realName: 'Doctor Strange',
        attackType: 'Projectile Heroes',
        health: '575',
        stats: [
          { label: 'Difficulty', value: '★★' },
          { label: 'Team', value: 'Avengers' },
          { label: 'Mobility', value: 'Walking' },
          { label: 'Passive', value: 'Price Of Magic' }
        ],
        abilities: [
          { name: 'Shield Of The Seraphim', description: 'Create a protective barrier against damage.' },
          { name: 'Maelstrom Of Madness', description: 'Release Dark Magic to deal damage to nearby enemies.' },
          { name: 'Pentagram Of Farallah', description: 'Open portals between two locations, enabling all units to travel through them.' },
          { name: 'Cloak Of Levitation', description: 'Ascend and then enter a brief state of sustained flight.' },
          { name: 'Eye Of Agamotto', description: 'Separate nearby enemies\' Souls from their bodies. Damage dealt to these Souls is transferred to their physical bodies.' }
        ]
      },
    ];

    const duelistHeroes = [
      {
        id: 'black-panther',
        category: 'duelist',
        name: 'Black Panther',
        tagline: '2Fast4You',
        summary: 'Now you saw me, now your back to spawn screen. Mreoww~',
        lore: 'TChalla, King of Wakanda, wields the perfect blend of the cutting-edge Vibranium technology and ancestral power drawn from the Panther God, Bast. The Black Panther bides his time until elegantly infiltrating enemy lines and commencing his hunt.',
        portrait: 'Images/BPStory.png',
        background: 'Images/BPSilhouette.png',
        card: 'Images/BP.png',
        accent: '#560c63',
        realName: "T'Challa",
        health: '275',
        attackType: 'Melee Heroes',
        stats: [
          { label: 'Difficulty', value: '★★★★★' },
          { label: 'Team', value: 'Avengers, Illuminati' },
          { label: 'Mobility', value: 'Dashes' },
          { label: 'Passive', value: 'Panthers Cunning' } ],
        abilities: [
          { name: 'Spear Toss', description: 'Toss a Vibranium energy spear forward and attach a Vibranium Mark to enemies in its radius.' },
          { name: 'Spirit Rend', description: 'Lunge forward and deal damage to enemies. Vibranium Mark produces Bonus Health and refreshes the ability.' },
          { name: 'Spinning Kick', description: 'Spiral forward and attach a Vibranium Mark to hit enemies.' },
          { name: 'Basts Descent', description: 'Summon Bast, pouncing forward, dealing damage and attaching a Vibranium Mark to hit enemies, while refreshing Spirit Rend.' }
        ]
      },
      {
        id: 'blade',
        category: 'duelist',
        name: 'Blade',
        tagline: 'Virgil Reincarnated But In The Hood...',
        summary: 'I am the Night, I am the Blood, I am the Blade.',
        lore: 'Half-human and half-vampire, Eric Brooks walks between worlds, craving the very life force of his enemies. As night falls, Blade\'s hunt begins as he wields the Sword of Dracula to become the nightmare of any foe who dares to bare their fangs.',
        portrait: 'Images/BladeStory.png',
        background: 'Images/BladeSilhouette.png',
        card: 'Images/Blade.png',
        accent: '#910000',
        realName: 'Eric Brooks',
        health: '350',
        attackType: 'Melee Heroes',
        stats: [
          { label: 'Difficulty', value: '★★★★★' },
          { label: 'Team', value: 'Midnight Suns, Vigilante' },
          { label: 'Mobility', value: 'Dash then Beyblade' },
          { label: 'Passive', value: 'Bloodline Awakening' }
        ],
        abilities: [
          { name: 'Daywalker Dash', description: 'Dash forward. If wielding your gun, shoot at enemies upon impact, applying a Healing Reduction effect. If wielding your sword, deliver a cleaving strike that inflicts Slow.' },
          { name: 'Scarlet Shroud', description: 'Parry with Ancestral Sword to become Unstoppable for a brief period, reducing damage taken from the front and decreasing the cooldown of Daywalker Dash.' },
          { name: 'Thousand-fold Slash', description: 'Charge power and swiftly draw the Sword of Dracula, executing a powerful Iaido strike as you dash forward, leaving behind a slashing zone where the sword automatically strikes enemies. Enemies hit suffer Reduced Healing.' },
        ]
      },
      {
        id: 'black-widow',
        category: 'duelist',
        name: 'Black Widow',
        tagline: 'Sniper Spoiler Alert',
        summary: 'Admire me from afar, but dont get too close or youll get a Widow\'s Kiss.',
        lore: 'Natasha Romanova is the world\'s most elite spy in any era. Her mastery of the sniper rifle eliminates targets from afar, while her shock batons neutralize close-range threats. Black Widow is locked, loaded, and ready to deliver a fatal bite!',
        portrait: 'Images/WidowStory.png',
        background: 'Images/WidowSilhouette.png',
        card: 'Images/Widow.png',
        accent: '#a83838',
        realName: 'Natasha Romanoff',
        attackType: 'Hitscan Heroes',
        health: '250',
        stats: [
          { label: 'Difficulty', value: '★★★★' },
          { label: 'Team', value: 'Avengers' },
          { label: 'Mobility', value: 'Run and Gun' },
          { label: 'Passive', value: 'Infra-detector' }
        ],
        abilities: [
          { name: 'Fleet Foot', description: 'Dash forward and enable a powerful jump.' },
          { name: 'Straight Shooter', description: 'Switch the Red Room Rifle to Sniper mode to fire high-energy rounds.' },
          { name: 'Edge Dancer', description: 'Unleash a spinning kick to Launch Up enemies. Landing the hit will allow her to zip to the target with a grappling hook for a second kick.' },
          { name: 'Electro-plasma Explosion', description: 'Switch the Red Room Rifle to Destruction mode and unleash an electro-plasma blast, damaging enemies within range and inflicting them with Vulnerability.' }
        ]
      },
      {
        id: 'moon-knight',
        category: 'duelist',
        name: 'Moon Knight',
        tagline: 'Not schizophrenic at all, you just dont see it...',
        summary: 'If you see an enemy that others cannot see... TAKE IT DOWN! What Konshu wants, Konshu gets.',
        lore: 'As the avatar of the Egyptian God of Vengeance, Marc Spectors body has been enhanced by Khonshu himself. Bathed in a luminous aura that pierces the darkness, Moon Knight glides through the night, ready to sear his enemies with his masters sacred Ankhs.',
        portrait: 'Images/MoonStory.png',
        background: 'Images/MoonSilhouette.png',
        card: 'Images/Moon.png',
        accent: '#ffffff',
        realName: 'Marc Spector, Jake Lockley, Steven Grant',
        health: '999',
        attackType: 'Projectile Heroes',
        stats: [
          { label: 'Difficulty', value: '★★★★★' },
          { label: 'Team', value: 'Midnight Suns, Vigilante' },
          { label: 'Mobility', value: 'Limited' },
          { label: 'Passive', value: 'Bouncing Projectiles' } ],
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
        tagline: 'I have two sides...',
        summary: 'Easiest Demon Goth Girl to Play, Dunno why users like "Nana" has low KDA.',
        lore: 'Trained in dark arts and wielding her mighty Soulsword, Magik leaps through portals to navigate the arena with ease. Once Illyana transforms into the demonic Darkchild, all those who dare stand against her will fall before her merciless blade.',
        portrait: 'Images/MagikStory.webp',
        background: 'Images/MagikSilhouette.png',
        card: 'Images/Magik.png',
        accent: '#efb509',
        realName: 'Illyana Rasputina',
        health: '250',
        attackType: 'Melee Heroes',
        stats: [
          { label: 'Difficulty', value: '★' },
          { label: 'Team', value: 'Midnight Suns' },
          { label: 'Mobility', value: 'Limited' },
          { label: 'Passive', value: 'Limbos Might' } ],
        abilities: [
          { name: 'Magik Slash', description: 'Strike forward an air slash. Each enemy hit reduces the cooldown of Stepping Discs.' },
          { name: 'Stepping Discs', description: 'Jump through a Stepping Disc, teleporting a short distance in the direction of movement. Become Invincible while teleporting.' },
          { name: 'Eldritch Whirl', description: 'Spin while swinging the Soulsword after exiting a Stepping Disc.' },
          { name: 'Demons Rage', description: 'Summon a Limbo demon that attacks enemies after exiting a Stepping Disc.' },
          { name: 'Darkchild', description: 'Transform into the demonic Darkchild, gaining increased damage, health, and invincibility frames.' }
        ]
      },
      {
        id: 'hawkeye',
        category: 'duelist',
        name: 'Hawkeye',
        tagline: 'One Shot, One Kill. One Miss, One Rank Down.',
        summary: 'Yes stop giving this guy a bow and arrow, this gives temu hanzo vibes.',
        lore: 'Despite his lack of superpowers, Hawkeyes unparalleled skills as a marksman have earned him a spot alongside earth\'s mightiest heroes. With a cool head and steady hand, Clint Barton never misses a target… so enemies best stay out of his sights!',
        portrait: 'Images/HawkeyeStory.png',
        background: 'Images/HawkeyeSilhouette.png',
        card: 'Images/Hawkeye.png',
        accent: '#51108f',
        realName: 'Clint Barton',
        attackType: 'Hitscan Heroes', 
        health: '270',
        stats: [
          { label: 'Difficulty', value: '★★★★' },
          { label: 'Team', value: 'Avengers' },
          { label: 'Mobility', value: 'Double Jump' },
          { label: 'Passive', value: 'Archers Focus' }
        ],
        abilities: [
          { name: 'Hypersonic Arrow', description: 'Fire an arrow dealing two instances of damage to enemies in its path and inflicting them with Slow. This ability can Knock Down flying heroes.' },
          { name: 'Blast Arrow', description: 'Shoot three explosive arrows.' },
          { name: 'Crescent Slash', description: 'Unsheathe a katana and slash forward, Launching Up hit enemies.' },
          { name: 'Hunters Sight', description: 'Capture Afterimages of enemies in his view. Damage dealt to an Afterimage is transferred to the corresponding enemy.' }
        ]
      },
      {
        id: 'starlord',
        category: 'duelist',
        name: 'Star-Lord',
        tagline: 'Useless without the Ult',
        summary: 'LLLEEEEGGGEEEENNNNDDDAAAARRRRYYY!',
        lore: 'Peter Quill lives to dazzle his foes on the battlefield with his signature swagger. As his element guns paint arcs of devastation, his acrobatic moves sail through the sky with unrivaled style. With performances this spectacular, its no wonder that Star-Lord is so legendary!',
        portrait: 'Images/StarLordStory.png',
        background: 'Images/StarLordSilhouette.png',
        card: 'Images/StarLord.png',
        accent: '#00a8ff',
        realName: 'Peter Quill',
        attackType: 'Hitscan Heroes',
        health: '250',
        stats: [
          { label: 'Difficulty', value: '★★' },
          { label: 'Team', value: 'Guardians of the Galaxy' },
          { label: 'Mobility', value: 'Flexible' },
          { label: 'Passive', value: 'Rocket Boots' }
        ],
        abilities: [
          { name: 'Rocket Propulsion', description: 'Consume energy to gain a Movement Boost and soar forward.' },
          { name: 'Stellar Shift', description: 'Dodge in the direction of movement and swiftly reload. Become Unstoppable and Invincible while dodging.' },
          { name: 'Blaster Barrage', description: 'Fire a frenzy of shots, causing damage to enemies within range.' },
          { name: 'Galactic Legend', description: 'AIMBOT.' }
        ]
      },
      {
        id: 'hela',
        category: 'duelist',
        name: 'Hela',
        tagline: 'The Queen of the Underworld',
        summary: 'Headshot, Headshot, Headshot. Not a fan of this character.',
        lore: 'As the Goddess of Death, Hela wields supreme control over the fallen souls residing in Hel. With a haunting whisper and a murder of crows, the queen of the underworld gracefully reaps the souls of her enemies without an ounce of mercy.',
        portrait: 'Images/HelStory.png',
        background: 'Images/HelSilhouette.png',
        card: 'Images/Hel.png',
        accent: '#135426',
        realName: 'Hela',
        attackType: 'Hitscan Heroes',
        health: '250',
        stats: [
          { label: 'Difficulty', value: '★★★' },
          { label: 'Team', value: 'Odinsons' },
          { label: 'Mobility', value: 'Im a bird caw caw!' },
          { label: 'Passive', value: 'Nastrond Crowstorm' }
        ],
        abilities: [
          { name: 'Piercing Night', description: 'Fire multiple Nightsword Thorns that detonate after a delay.' },
          { name: 'Soul Drainer', description: 'Project an explosive Hel sphere to Stun nearby enemies and pull them into the blast zone.' },
          { name: 'Goddess Of Death', description: 'Soar into the sky and unleash Nastrond Crows from each hand at will.' }
        ]
      },
      {
        id: 'iron-fist',
        category: 'duelist',
        name: 'Iron Fist',
        tagline: 'OraOraOraORaOraORaORa!',
        summary: 'CHEAPER TOWN HALL!',
        lore: 'Lin Lie is a master of Chinese martial arts who once wielded the shattered Sword of Fu Xi. After fusing its pieces with the mighty Chi of Shou-Lao, he is poised to strike his foes with the grace and force of a soaring dragon as the latest immortal Iron Fist.',
        portrait: 'Images/FistStory.png',
        background: 'Images/FistSilhouette.png',
        card: 'Images/Fist.png',
        accent: '#ffd700',
        realName: 'Danny Rand',
        attackType: 'Melee Heroes',
        health: '300',
        stats: [
          { label: 'Difficulty', value: '★★★' },
          { label: 'Team', value: 'Vigilante' },
          { label: 'Mobility', value: 'Kungfu' },
          { label: 'Passive', value: 'Wall Runner Detection' }
        ],
        abilities: [
          { name: 'Dragons Defense', description: 'Assume a defensive stance with a boost of Chi to block incoming attacks and gain Damage Reduction. ' },
          { name: 'Yat Jee Chung Kuen', description: 'Dash forward to pursue the targeted enemy and unleash a flurry of attacks.' },
          { name: 'Harmony Recovery', description: 'Cross legs and channel Chi, recovering health. Excess healing converts to Bonus Health.' },
          { name: 'Kun-lun Kick', description: 'Dash forward, delivering a flying kick when hitting an enemy or reaching full range.' },
          { name: 'Living Chi', description: 'Become living Chi to boost his speed, damage, and attack range, delivering stronger punches while reducing the cooldown of Dragons Defense.' }
        ]
      },
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
        attackType: 'Hitscan Heroes',
        health: '250',
        stats: [
          { label: 'Difficulty', value: '★★☆☆☆' },
          { label: 'Team', value: 'Guardian of the Galaxy' },
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
        id: 'scarlet-witch',
        category: 'strategist',
        name: 'Scarlet Witch',
        tagline: '',
        summary: '',
        lore: 'Wanda Maximoff bends fate itself, ensuring outcomes align with her teams victory. Scarlet Witch warps probability zones, hexes objectives, and conjures protective wards for allies with chaos magic.',
        portrait: 'Images/PMajik.jpg',
        background: 'Images/New4.png',
        card: 'Images/ScarletWitch.png',
        accent: '#ff1493',
        realName: 'Wanda Maximoff',
        attackType: '',
        health: '240',
        stats: [
          { label: 'Difficulty', value: '★★★★☆' },
          { label: 'Attack Type', value: '' },
          { label: 'Mobility', value: '' },
          { label: 'Passive', value: 'Chaos Magic' }
        ],
        abilities: []
      },
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
      if (featureHealth) {
        // Replace \n with actual line breaks for display
        featureHealth.textContent = hero.health;
        // CSS white-space: pre-line will handle the \n characters
      }
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


