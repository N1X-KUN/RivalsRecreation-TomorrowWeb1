// Music Player Component using React
(function() {
  'use strict';

  const { useState, useEffect, useRef } = React;

  // Global audio instance that persists across pages
  let globalAudio = null;
  let globalPlaylist = null;
  let globalCurrentIndex = 0;
  let globalIsPlaying = false;

  function MusicPlayer() {
    const [playlist, setPlaylist] = useState(null);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(() => {
      const saved = localStorage.getItem('musicMuted');
      return saved === 'true';
    });
    const [volume, setVolume] = useState(60);
    const [isOpen, setIsOpen] = useState(false);
    
    const audioRef = useRef(null);

    // Initialize or get global audio
    useEffect(() => {
      if (!globalAudio) {
        globalAudio = new Audio();
        globalAudio.volume = isMuted ? 0 : volume / 100;
        globalAudio.loop = false;
        
        globalAudio.addEventListener('ended', () => {
          if (globalPlaylist && globalPlaylist.songs.length > 0) {
            globalCurrentIndex = (globalCurrentIndex + 1) % globalPlaylist.songs.length;
            const audioPath = globalPlaylist.songs[globalCurrentIndex].audioUrl.startsWith('/') 
              ? globalPlaylist.songs[globalCurrentIndex].audioUrl 
              : '/' + globalPlaylist.songs[globalCurrentIndex].audioUrl;
            globalAudio.src = audioPath;
            globalAudio.play().catch(e => console.log('Play error:', e));
            globalIsPlaying = true;
            setCurrentSongIndex(globalCurrentIndex);
            setIsPlaying(true);
            updateCurrentSongIndex(globalCurrentIndex);
          }
        });

        globalAudio.addEventListener('play', () => {
          globalIsPlaying = true;
          setIsPlaying(true);
        });

        globalAudio.addEventListener('pause', () => {
          globalIsPlaying = false;
          setIsPlaying(false);
        });
      }
      
      audioRef.current = globalAudio;
      
      // Load mute state
      const savedMuted = localStorage.getItem('musicMuted') === 'true';
      if (savedMuted !== isMuted) {
        setIsMuted(savedMuted);
        if (globalAudio) {
          globalAudio.volume = savedMuted ? 0 : volume / 100;
        }
      }
    }, []);

    // Load playlist from API
    useEffect(() => {
      fetch('/api/playlist')
        .then(res => res.json())
        .then(data => {
          setPlaylist(data);
          globalPlaylist = data;
          const startIndex = data.currentSongIndex || 0;
          setCurrentSongIndex(startIndex);
          globalCurrentIndex = startIndex;
          
          if (globalAudio && data.songs[startIndex]) {
            // Ensure path starts with / for absolute path
            const audioPath = data.songs[startIndex].audioUrl.startsWith('/') 
              ? data.songs[startIndex].audioUrl 
              : '/' + data.songs[startIndex].audioUrl;
            globalAudio.src = audioPath;
            globalAudio.volume = isMuted ? 0 : volume / 100;
            
            // Auto-play
            const playPromise = globalAudio.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setIsPlaying(true);
                  globalIsPlaying = true;
                })
                .catch(error => {
                  console.log('Auto-play prevented:', error);
                });
            }
          }
        })
        .catch(err => {
          console.error('Error loading playlist:', err);
          // Fallback playlist if API fails
          const fallbackPlaylist = {
            name: "Starlord's Playlist",
            songs: [
              { title: "Guardians Theme", artist: "Tyler Bates", audioUrl: "/Videos/Guardians Music.mp3", _id: "1" },
              { title: "Avengers Theme", artist: "Alan Silvestri", audioUrl: "/Videos/Avengers Music.mp3", _id: "2" },
              { title: "Fantastic Four Theme", artist: "Marco Beltrami", audioUrl: "/Videos/Fantastic Music.mp3", _id: "3" },
              { title: "Marvel Theme", artist: "Various Artists", audioUrl: "/Videos/Marvel Music.mp3", _id: "4" }
            ],
            currentSongIndex: 0
          };
          setPlaylist(fallbackPlaylist);
          globalPlaylist = fallbackPlaylist;
          if (globalAudio && fallbackPlaylist.songs[0]) {
            globalAudio.src = fallbackPlaylist.songs[0].audioUrl;
            globalAudio.volume = isMuted ? 0 : volume / 100;
            globalAudio.play().catch(e => console.log('Play error:', e));
          }
        });
    }, []);

    // Update volume
    useEffect(() => {
      if (globalAudio) {
        globalAudio.volume = isMuted ? 0 : volume / 100;
      }
    }, [volume, isMuted]);

    // Update current song index in backend
    const updateCurrentSongIndex = (index) => {
      fetch('/api/playlist/current-song', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songIndex: index })
      }).catch(err => console.error('Error updating song index:', err));
    };

    // Double click to mute/unmute
    const handleDoubleClick = () => {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      localStorage.setItem('musicMuted', newMutedState.toString());
      
      if (globalAudio) {
        globalAudio.volume = newMutedState ? 0 : volume / 100;
      }
    };

    // Single click to open/close
    const handleClick = () => {
      setIsOpen(!isOpen);
    };

    // Change song
    const changeSong = (index) => {
      if (!playlist || !playlist.songs[index] || !globalAudio) return;
      
      setCurrentSongIndex(index);
      globalCurrentIndex = index;
      // Ensure path starts with / for absolute path
      const audioPath = playlist.songs[index].audioUrl.startsWith('/') 
        ? playlist.songs[index].audioUrl 
        : '/' + playlist.songs[index].audioUrl;
      globalAudio.src = audioPath;
      globalAudio.play().catch(e => console.log('Play error:', e));
      setIsPlaying(true);
      globalIsPlaying = true;
      updateCurrentSongIndex(index);
    };

    const currentSong = playlist?.songs[currentSongIndex];

    // Create SVG icon
    const createSVGIcon = (pathData) => {
      return React.createElement('svg', { viewBox: '0 0 24 24', fill: 'currentColor' },
        React.createElement('path', { d: pathData })
      );
    };

    return React.createElement(React.Fragment, null,
      // Draggable Music Icon - Fixed at bottom left
      React.createElement('div', {
        className: `music-player-icon ${isPlaying ? 'playing' : ''} ${isMuted ? 'muted' : ''}`,
        style: {
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 1001
        },
        onClick: handleClick,
        onDoubleClick: handleDoubleClick,
        title: "Starlord's Playlist - Click to open, Double-click to mute"
      },
        createSVGIcon('M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z'),
        isMuted && React.createElement('div', {
          className: 'mute-indicator',
          style: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '40px',
            height: '2px',
            background: '#ff4444',
            borderRadius: '2px'
          }
        })
      ),
      
      // Playlist Panel - Always from left
      React.createElement('div', {
        className: `playlist-panel left ${isOpen ? 'open' : ''}`
      },
        // Header with close button
        React.createElement('div', { className: 'playlist-header' },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            React.createElement('h2', null, "Play queue"),
            React.createElement('div', { style: { display: 'flex', gap: '8px' } },
              React.createElement('button', {
                className: 'panel-control-btn',
                onClick: () => setIsOpen(false),
                title: 'Minimize'
              }, createSVGIcon('M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z')),
              React.createElement('button', {
                className: 'panel-control-btn',
                onClick: () => setIsOpen(false),
                title: 'Close'
              }, createSVGIcon('M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'))
            )
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
                fill: 'rgba(255, 215, 0, 1)'
              }, React.createElement('path', { d: 'M8 5v14l11-7z' }))
            ),
            React.createElement('div', { className: 'now-playing-info' },
              React.createElement('h3', { className: 'now-playing-title' },
                currentSong.title,
                React.createElement('span', { className: 'upload-indicator' })
              ),
              React.createElement('p', { className: 'now-playing-artist' }, currentSong.artist)
            )
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
                className: `queue-item ${isNext ? 'next' : ''}`,
                onClick: () => changeSong(index)
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
                  song.explicit && React.createElement('span', { className: 'explicit-tag' }, 'E'),
                  React.createElement('span', { className: 'upload-indicator' }),
                  React.createElement('button', {
                    className: 'queue-remove-btn',
                    onClick: (e) => {
                      e.stopPropagation();
                      // Remove song logic here
                    },
                    title: 'Remove from queue'
                  }, createSVGIcon('M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'))
                )
              );
            })
          )
        ),
        
        // Footer with clear queue
        React.createElement('div', { className: 'playlist-footer' },
          React.createElement('button', {
            className: 'clear-queue-btn',
            title: 'Clear queue'
          }, createSVGIcon('M6 19h4V5H6v14zm8-14v14h4V5h-4z')))
      )
    );
  }

  // Initialize when DOM is ready
  function initMusicPlayer() {
    if (!window.React || !window.ReactDOM) {
      console.error('React or ReactDOM not loaded');
      return;
    }

    const root = document.createElement('div');
    root.id = 'music-player-root';
    document.body.appendChild(root);
    
    const rootElement = ReactDOM.createRoot(root);
    rootElement.render(React.createElement(MusicPlayer));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMusicPlayer);
  } else {
    initMusicPlayer();
  }
})();
