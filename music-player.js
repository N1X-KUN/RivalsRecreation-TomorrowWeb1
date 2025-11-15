// Music Player Component using React
// Auto-plays on homepage only, muted on other pages
(function() {
  'use strict';

  const { useState, useEffect, useRef } = React;

  // Global audio instance that persists across pages
  let globalAudio = null;
  let globalPlaylist = null;
  let globalCurrentIndex = 0;
  let globalIsPlaying = false;
  let globalIsMuted = false;
  const DEFAULT_VOLUME = 60; // Fixed at 60%

  // Check if current page is homepage
  function isHomepage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || '';
    const href = window.location.href;
    // Check for homepage - Rivals.html, index.html, or root
    return filename === 'Rivals.html' || filename === '' || filename === 'index.html' || href.endsWith('/') || href.includes('Rivals.html');
  }
  
  // Helper to get correct audio path
  function getAudioPath(url) {
    if (!url) return '';
    // If already absolute path, use as is
    if (url.startsWith('/') || url.startsWith('http')) {
      return url;
    }
    // Otherwise make it relative to current directory
    return url.startsWith('Videos/') ? url : `Videos/${url}`;
  }

  function MusicPlayer() {
    const [playlist, setPlaylist] = useState(null);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(() => {
      // On homepage: start unmuted, on other pages: start muted
      if (isHomepage()) {
        return localStorage.getItem('musicMuted') === 'true';
      }
      return true; // Always muted on non-homepage pages
    });
    const [isOpen, setIsOpen] = useState(false);
    
    const audioRef = useRef(null);
    const clickTimeoutRef = useRef(null);

    // Initialize or get global audio
    useEffect(() => {
      if (!globalAudio) {
        globalAudio = new Audio();
        globalAudio.volume = DEFAULT_VOLUME / 100;
        globalAudio.loop = false;
        
        // Auto-play next song when current ends
        globalAudio.addEventListener('ended', () => {
          if (globalPlaylist && globalPlaylist.songs.length > 0) {
            const nextIndex = (globalCurrentIndex + 1) % globalPlaylist.songs.length;
            globalCurrentIndex = nextIndex;
            const audioPath = getAudioPath(globalPlaylist.songs[nextIndex].audioUrl);
            globalAudio.src = audioPath;
            globalAudio.volume = globalIsMuted ? 0 : DEFAULT_VOLUME / 100;
            globalAudio.play().catch(e => console.log('Play error on next song:', e));
            globalIsPlaying = true;
            setCurrentSongIndex(nextIndex);
            localStorage.setItem('currentSongIndex', nextIndex.toString());
            updateCurrentSongIndex(nextIndex);
          }
        });

        globalAudio.addEventListener('play', () => {
          globalIsPlaying = true;
        });

        globalAudio.addEventListener('pause', () => {
          globalIsPlaying = false;
        });
      }
      
      audioRef.current = globalAudio;
      
      // Set initial mute state based on page
      const shouldBeMuted = isHomepage() 
        ? (localStorage.getItem('musicMuted') === 'true')
        : true; // Always muted on non-homepage
      
      globalIsMuted = shouldBeMuted;
      setIsMuted(shouldBeMuted);
      
      if (globalAudio) {
        globalAudio.volume = shouldBeMuted ? 0 : DEFAULT_VOLUME / 100;
      }
    }, []);

    // Load playlist and start playing
    useEffect(() => {
      // Use fallback playlist directly (API might not be available)
      const fallbackPlaylist = {
        name: "Starlord's Playlist",
        songs: [
          { title: "Guardians Theme", artist: "Tyler Bates", audioUrl: "Videos/Guardians Music.mp3", albumArt: "Images/New1.jpg", _id: "1" },
          { title: "Avengers Theme", artist: "Alan Silvestri", audioUrl: "Videos/Avengers Music.mp3", albumArt: "Images/New2.jpg", _id: "2" },
          { title: "Fantastic Four Theme", artist: "Marco Beltrami", audioUrl: "Videos/Fantastic Music.mp3", albumArt: "Images/New3.jpg", _id: "3" },
          { title: "Marvel Theme", artist: "Various Artists", audioUrl: "Videos/Marvel Music.mp3", albumArt: "Images/New4.png", _id: "4" }
        ],
        currentSongIndex: 0
      };
      
      // Try to fetch from API first, but use fallback if it fails
      fetch('/api/playlist')
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('API not available');
        })
        .then(data => {
          if (data && data.songs && data.songs.length > 0) {
            setPlaylist(data);
            globalPlaylist = data;
            const savedIndex = localStorage.getItem('currentSongIndex');
            const startIndex = savedIndex ? parseInt(savedIndex) : (data.currentSongIndex || 0);
            const validIndex = Math.min(startIndex, data.songs.length - 1);
            startPlaying(validIndex, data);
          } else {
            throw new Error('No songs in API response');
          }
        })
        .catch(err => {
          console.log('Using fallback playlist:', err.message);
          setPlaylist(fallbackPlaylist);
          globalPlaylist = fallbackPlaylist;
          const savedIndex = localStorage.getItem('currentSongIndex');
          const startIndex = savedIndex ? parseInt(savedIndex) : 0;
          const validIndex = Math.min(startIndex, fallbackPlaylist.songs.length - 1);
          startPlaying(validIndex, fallbackPlaylist);
        });
      
      function startPlaying(index, playlistData) {
        if (!globalAudio) {
          console.error('Global audio not initialized');
          return;
        }
        
        setCurrentSongIndex(index);
        globalCurrentIndex = index;
        
        if (playlistData.songs[index]) {
          const audioPath = getAudioPath(playlistData.songs[index].audioUrl);
          console.log('Loading audio:', audioPath, 'Homepage:', isHomepage());
          
          // Set volume based on mute state and page
          const shouldBeMuted = isHomepage() 
            ? (localStorage.getItem('musicMuted') === 'true')
            : true;
          globalAudio.volume = shouldBeMuted ? 0 : DEFAULT_VOLUME / 100;
          globalIsMuted = shouldBeMuted;
          setIsMuted(shouldBeMuted);
          
          // Set source and load
          globalAudio.src = audioPath;
          globalAudio.load();
          
          // Try to play when audio is ready
          const tryPlay = () => {
            // Auto-play only on homepage
            if (isHomepage() && !shouldBeMuted) {
              const playPromise = globalAudio.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log('✅ Music started playing successfully');
                    globalIsPlaying = true;
                  })
                  .catch(error => {
                    console.log('⚠️ Auto-play prevented, will try on user interaction:', error.name);
                    // Try again on first user interaction
                    const tryPlayOnInteraction = () => {
                      globalAudio.play()
                        .then(() => {
                          console.log('✅ Music started after user interaction');
                          globalIsPlaying = true;
                        })
                        .catch(e => console.log('❌ Still blocked:', e));
                      document.removeEventListener('click', tryPlayOnInteraction);
                      document.removeEventListener('touchstart', tryPlayOnInteraction);
                    };
                    document.addEventListener('click', tryPlayOnInteraction, { once: true });
                    document.addEventListener('touchstart', tryPlayOnInteraction, { once: true });
                  });
              }
            } else {
              console.log('ℹ️ Not on homepage or muted - music loaded but not playing');
            }
          };
          
          // Try to play when audio can play
          globalAudio.addEventListener('canplay', tryPlay, { once: true });
          
          // Also try immediately (might work if already cached)
          setTimeout(tryPlay, 100);
          
          // Error handling
          globalAudio.addEventListener('error', (e) => {
            console.error('❌ Audio error:', e);
            console.error('Failed to load:', audioPath);
            console.error('Error details:', globalAudio.error);
          });
        }
      }
    }, []);

    // Update mute state
    useEffect(() => {
      if (globalAudio) {
        globalIsMuted = isMuted;
        globalAudio.volume = isMuted ? 0 : DEFAULT_VOLUME / 100;
        if (!isHomepage()) {
          // On non-homepage, save mute state
          localStorage.setItem('musicMuted', isMuted.toString());
        }
      }
    }, [isMuted]);

    // Update current song index in backend
    const updateCurrentSongIndex = (index) => {
      fetch('/api/playlist/current-song', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songIndex: index })
      }).catch(err => console.error('Error updating song index:', err));
    };

    // Handle click with double-click detection
    const handleIconClick = (e) => {
      if (clickTimeoutRef.current) {
        // Double click detected
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
        handleDoubleClick();
      } else {
        // Single click - wait to see if double click
        clickTimeoutRef.current = setTimeout(() => {
          clickTimeoutRef.current = null;
          setIsOpen(!isOpen);
        }, 300);
      }
    };

    // Double click to mute/unmute
    const handleDoubleClick = () => {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      globalIsMuted = newMutedState;
      
      if (globalAudio) {
        globalAudio.volume = newMutedState ? 0 : DEFAULT_VOLUME / 100;
      }
      
      localStorage.setItem('musicMuted', newMutedState.toString());
    };

    // Skip song (remove from queue)
    const skipSong = async (songId, index) => {
      if (!playlist || !globalAudio) return;
      
      // Create updated playlist first (remove the song)
      const newSongs = playlist.songs.filter((_, i) => i !== index);
      const updatedPlaylist = { ...playlist, songs: newSongs };
      
      // If skipping current song, play next one
      if (index === currentSongIndex) {
        if (newSongs.length > 0) {
          // Find next song (could be same index or 0 if we removed the last one)
          const nextIndex = index < newSongs.length ? index : 0;
          globalCurrentIndex = nextIndex;
          setCurrentSongIndex(nextIndex);
          localStorage.setItem('currentSongIndex', nextIndex.toString());
          
          const audioPath = getAudioPath(newSongs[nextIndex].audioUrl);
          globalAudio.src = audioPath;
          globalAudio.volume = globalIsMuted ? 0 : DEFAULT_VOLUME / 100;
          globalAudio.load();
          globalAudio.play().catch(e => console.log('Play error:', e));
          globalIsPlaying = true;
          updateCurrentSongIndex(nextIndex);
        } else {
          // No more songs
          globalAudio.pause();
          globalIsPlaying = false;
        }
      } else if (index < currentSongIndex) {
        // Adjust current index if we removed a song before the current one
        const newIndex = currentSongIndex - 1;
        setCurrentSongIndex(newIndex);
        globalCurrentIndex = newIndex;
        localStorage.setItem('currentSongIndex', newIndex.toString());
      }
      
      // Update playlist state immediately for UI
      setPlaylist(updatedPlaylist);
      globalPlaylist = updatedPlaylist;
      
      // Try to remove from backend (non-blocking)
      try {
        const response = await fetch(`/api/playlist/songs/${songId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          const backendPlaylist = await response.json();
          setPlaylist(backendPlaylist);
          globalPlaylist = backendPlaylist;
        }
      } catch (err) {
        console.error('Error removing song from backend:', err);
        // Already updated local state, so continue
      }
    };

    const currentSong = playlist?.songs[currentSongIndex];
    const isPlaying = globalIsPlaying && !globalIsMuted;

    // Create SVG icon
    const createSVGIcon = (pathData) => {
      return React.createElement('svg', { viewBox: '0 0 24 24', fill: 'currentColor' },
        React.createElement('path', { d: pathData })
      );
    };

    return React.createElement(React.Fragment, null,
      // Fixed Music Icon - Bottom Left (with fade-in after 10s)
      React.createElement('div', {
        className: `music-player-icon ${isPlaying ? 'playing' : ''} ${isMuted ? 'muted' : ''} music-player-icon--fade-in`,
        style: {
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 1001,
          cursor: 'pointer'
        },
        onClick: handleIconClick,
        title: "Starlord's Playlist - Click to open queue, Double-click to mute/unmute"
      },
        createSVGIcon('M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z'),
        isMuted && React.createElement('div', {
          className: 'mute-indicator',
          style: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(45deg)',
            width: '40px',
            height: '3px',
            background: '#ff4444',
            borderRadius: '2px',
            zIndex: 10,
            boxShadow: '0 0 4px rgba(255, 68, 68, 0.8)'
          }
        })
      ),
      
      // Playlist Panel
      React.createElement('div', {
        className: `playlist-panel left ${isOpen ? 'open' : ''}`
      },
        // Header with close button
        React.createElement('div', { className: 'playlist-header' },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            React.createElement('h2', null, "Play queue"),
            React.createElement('button', {
              className: 'panel-control-btn',
              onClick: () => setIsOpen(false),
              title: 'Close'
            }, createSVGIcon('M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'))
          )
        ),
        
        // Now Playing
        currentSong && React.createElement('div', { className: 'now-playing' },
          React.createElement('div', { className: 'now-playing-label' }, 'PLAYING FROM: SPOTLIGHTED UPLOADS'),
          React.createElement('div', { className: 'now-playing-item' },
            React.createElement('div', { className: 'now-playing-art' },
              currentSong.albumArt 
                ? React.createElement('img', { src: currentSong.albumArt, alt: currentSong.title })
                : React.createElement('div', { 
                    className: 'default-art',
                    style: { 
                      width: '100%', 
                      height: '100%', 
                      background: 'linear-gradient(135deg, rgba(255,215,0,0.3), rgba(255,215,0,0.1))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    } 
                  }, createSVGIcon('M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z')),
              isPlaying && React.createElement('svg', { 
                className: 'play-icon', 
                viewBox: '0 0 24 24',
                fill: 'rgba(255, 215, 0, 1)',
                style: { position: 'absolute', width: '24px', height: '24px' }
              }, React.createElement('path', { d: 'M8 5v14l11-7z' }))
            ),
            React.createElement('div', { className: 'now-playing-info' },
              React.createElement('h3', { className: 'now-playing-title' },
                currentSong.title,
                React.createElement('span', { className: 'upload-indicator' })
              ),
              React.createElement('p', { className: 'now-playing-artist' }, currentSong.artist)
            ),
            React.createElement('button', {
              className: 'queue-remove-btn',
              onClick: (e) => {
                e.stopPropagation();
                skipSong(currentSong._id || currentSongIndex, currentSongIndex);
              },
              title: 'Skip song'
            }, createSVGIcon('M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'))
          )
        ),
        
        // Next Up
        React.createElement('div', { className: 'next-up' },
          React.createElement('div', { className: 'next-up-label' }, 'NEXT UP FROM: SPOTLIGHTED UPLOADS'),
          React.createElement('ul', { className: 'queue-list' },
            playlist?.songs.map((song, index) => {
              if (index === currentSongIndex) return null;
              const isNext = index === (currentSongIndex + 1) % playlist.songs.length;
              
              return React.createElement('li', {
                key: song._id || index,
                className: `queue-item ${isNext ? 'next' : ''}`
              },
                React.createElement('div', { className: 'queue-art' },
                  song.albumArt
                    ? React.createElement('img', { src: song.albumArt, alt: song.title })
                    : React.createElement('div', { 
                        className: 'default-art',
                        style: { 
                          width: '100%', 
                          height: '100%', 
                          background: 'rgba(255,255,255,0.1)' 
                        } 
                      })
                ),
                React.createElement('div', { className: 'queue-info' },
                  React.createElement('h4', { className: 'queue-title' }, song.title),
                  React.createElement('p', { className: 'queue-artist' }, song.artist)
                ),
                React.createElement('div', { className: 'queue-actions' },
                  React.createElement('span', { className: 'upload-indicator' }),
                  React.createElement('button', {
                    className: 'queue-remove-btn',
                    onClick: (e) => {
                      e.stopPropagation();
                      skipSong(song._id || index, index);
                    },
                    title: 'Skip song'
                  }, createSVGIcon('M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'))
                )
              );
            })
          )
        )
      )
    );
  }

  // Initialize when DOM is ready
  function initMusicPlayer() {
    if (!window.React || !window.ReactDOM) {
      console.error('❌ React or ReactDOM not loaded - music player cannot initialize');
      // Retry after a short delay
      setTimeout(() => {
        if (window.React && window.ReactDOM) {
          console.log('✅ React loaded, initializing music player...');
          initMusicPlayer();
        }
      }, 500);
      return;
    }

    // Check if root already exists
    let root = document.getElementById('music-player-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'music-player-root';
      document.body.appendChild(root);
    }
    
    try {
      const rootElement = ReactDOM.createRoot(root);
      rootElement.render(React.createElement(MusicPlayer));
      console.log('✅ Music player initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing music player:', error);
    }
  }

  // Wait for React to load, then initialize
  function waitForReact() {
    if (window.React && window.ReactDOM) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMusicPlayer);
      } else {
        initMusicPlayer();
      }
    } else {
      // React not loaded yet, wait a bit and try again
      setTimeout(waitForReact, 100);
    }
  }

  waitForReact();
})();
