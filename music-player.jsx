// Music Player Component using React
const { useState, useEffect, useRef } = React;

function MusicPlayer() {
  const [playlist, setPlaylist] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(60);
  const [isOpen, setIsOpen] = useState(false);
  const [iconPosition, setIconPosition] = useState({ x: window.innerWidth - 80, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [panelSide, setPanelSide] = useState('right');
  
  const audioRef = useRef(null);
  const iconRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Use global audio element to persist across page navigations
  useEffect(() => {
    if (!window.__globalMusicAudio) {
      window.__globalMusicAudio = new Audio();
      window.__globalMusicAudio.volume = 0.6;
      window.__globalMusicAudio.loop = false;
    }
    audioRef.current = window.__globalMusicAudio;
    
    // Restore playback state from sessionStorage
    const savedState = sessionStorage.getItem('musicPlayerState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.currentTime && audioRef.current) {
          audioRef.current.currentTime = state.currentTime;
        }
        if (state.isPlaying !== undefined) {
          setIsPlaying(state.isPlaying);
        }
        if (state.currentSongIndex !== undefined) {
          setCurrentSongIndex(state.currentSongIndex);
        }
        if (state.volume !== undefined) {
          setVolume(state.volume);
        }
        if (state.isMuted !== undefined) {
          setIsMuted(state.isMuted);
        }
      } catch (e) {
        console.warn('Failed to restore music state:', e);
      }
    }
    
    return () => {
      // Save state before unmount
      if (audioRef.current) {
        sessionStorage.setItem('musicPlayerState', JSON.stringify({
          currentTime: audioRef.current.currentTime,
          isPlaying: !audioRef.current.paused,
          currentSongIndex,
          volume,
          isMuted
        }));
      }
    };
  }, []);

  // Load playlist from API
  useEffect(() => {
    fetch('/api/playlist')
      .then(res => res.json())
      .then(data => {
        setPlaylist(data);
        const savedIndex = data.currentSongIndex || 0;
        setCurrentSongIndex(savedIndex);
        if (audioRef.current && data.songs[savedIndex]) {
          const currentSrc = audioRef.current.src;
          const newSrc = data.songs[savedIndex].audioUrl;
          // Only change source if it's different (avoid restarting on page navigation)
          if (!currentSrc || !currentSrc.includes(newSrc.split('/').pop())) {
            audioRef.current.src = newSrc;
          }
          audioRef.current.volume = isMuted ? 0 : volume / 100;
          
          // Restore playback state
          const savedState = sessionStorage.getItem('musicPlayerState');
          if (savedState) {
            try {
              const state = JSON.parse(savedState);
              if (state.currentTime && audioRef.current) {
                audioRef.current.currentTime = state.currentTime;
              }
              if (state.isPlaying && !audioRef.current.paused) {
                // If it was playing, continue playing
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                  playPromise
                    .then(() => {
                      setIsPlaying(true);
                    })
                    .catch(error => {
                      console.log('Auto-play prevented:', error);
                    });
                }
              } else {
                setIsPlaying(state.isPlaying || false);
              }
            } catch (e) {
              console.warn('Failed to restore music state:', e);
            }
          } else {
            // First boot: auto-play unmuted
            setIsMuted(false);
            setIsPlaying(true);
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setIsPlaying(true);
                })
                .catch(error => {
                  console.log('Auto-play prevented:', error);
                });
            }
          }
        }
      })
      .catch(err => console.error('Error loading playlist:', err));
  }, []);

  // Auto-play on first load (unmuted by default)
  useEffect(() => {
    if (playlist && playlist.songs.length > 0 && audioRef.current) {
      const firstBoot = !sessionStorage.getItem('musicPlayerState');
      if (firstBoot) {
        // First boot: ensure unmuted and playing
        setIsMuted(false);
        setIsPlaying(true);
        audioRef.current.volume = volume / 100;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch(error => {
              console.log('Auto-play prevented:', error);
            });
        }
      }
    }
  }, [playlist]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
      // Save state
      if (audioRef.current) {
        sessionStorage.setItem('musicPlayerState', JSON.stringify({
          currentTime: audioRef.current.currentTime,
          isPlaying: !audioRef.current.paused,
          currentSongIndex,
          volume,
          isMuted
        }));
      }
    }
  }, [volume, isMuted, currentSongIndex]);

  // Handle song end
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      const nextIndex = (currentSongIndex + 1) % playlist.songs.length;
      setCurrentSongIndex(nextIndex);
      audio.src = playlist.songs[nextIndex].audioUrl;
      audio.play();
      updateCurrentSongIndex(nextIndex);
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [currentSongIndex, playlist]);

  // Update current song index in backend
  const updateCurrentSongIndex = (index) => {
    fetch('/api/playlist/current-song', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songIndex: index })
    }).catch(err => console.error('Error updating song index:', err));
  };

  // Save state periodically and on navigation
  useEffect(() => {
    const saveState = () => {
      if (audioRef.current) {
        sessionStorage.setItem('musicPlayerState', JSON.stringify({
          currentTime: audioRef.current.currentTime,
          isPlaying: !audioRef.current.paused,
          currentSongIndex,
          volume,
          isMuted
        }));
      }
    };

    // Save state every 2 seconds
    const interval = setInterval(saveState, 2000);
    
    // Save state before page unload
    window.addEventListener('beforeunload', saveState);
    
    // Save state on page visibility change
    document.addEventListener('visibilitychange', saveState);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', saveState);
      document.removeEventListener('visibilitychange', saveState);
    };
  }, [currentSongIndex, volume, isMuted, isPlaying]);

  // Play/Pause toggle
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Mute toggle
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Change song
  const changeSong = (index) => {
    if (!playlist || !playlist.songs[index]) return;
    
    setCurrentSongIndex(index);
    if (audioRef.current) {
      audioRef.current.src = playlist.songs[index].audioUrl;
      audioRef.current.currentTime = 0; // Reset to start of new song
      audioRef.current.play();
      setIsPlaying(true);
    }
    updateCurrentSongIndex(index);
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - iconPosition.x,
      y: e.clientY - iconPosition.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;
    
    // Constrain to screen bounds
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;
    const constrainedX = Math.max(0, Math.min(maxX, newX));
    const constrainedY = Math.max(0, Math.min(maxY, newY));
    
    setIconPosition({ x: constrainedX, y: constrainedY });
    
    // Determine which side of screen
    const screenCenter = window.innerWidth / 2;
    setPanelSide(constrainedX < screenCenter ? 'left' : 'right');
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const currentSong = playlist?.songs[currentSongIndex];

  return (
    <>
      <audio
        ref={audioRef}
        preload="auto"
        volume={volume / 100}
      />
      
      {/* Draggable Music Icon */}
      <div
        ref={iconRef}
        className={`music-player-icon ${isPlaying ? 'playing' : ''}`}
        style={{
          left: `${iconPosition.x}px`,
          top: `${iconPosition.y}px`
        }}
        onMouseDown={handleMouseDown}
        onClick={() => setIsOpen(!isOpen)}
        title="Starlord's Playlist"
      >
        <svg viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      </div>

      {/* Playlist Panel */}
      <div className={`playlist-panel ${panelSide} ${isOpen ? 'open' : ''}`}>
        <div className="playlist-header">
          <h2>Starlord's Playlist</h2>
          <p className="playlist-source">Playing from: Spotlighted Uploads</p>
        </div>

        {/* Now Playing */}
        {currentSong && (
          <div className="now-playing">
            <div className="now-playing-label">Playing from: Spotlighted Uploads</div>
            <div className="now-playing-item">
              <div className="now-playing-art">
                {currentSong.albumArt ? (
                  <img src={currentSong.albumArt} alt={currentSong.title} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'rgba(255,215,0,0.2)' }} />
                )}
                {isPlaying && (
                  <svg className="play-icon" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </div>
              <div className="now-playing-info">
                <h3 className="now-playing-title">
                  {currentSong.title}
                  <span className="upload-indicator"></span>
                </h3>
                <p className="now-playing-artist">{currentSong.artist}</p>
              </div>
            </div>
          </div>
        )}

        {/* Next Up */}
        <div className="next-up">
          <div className="next-up-label">Next up from: Spotlighted Uploads</div>
          <ul className="queue-list">
            {playlist?.songs.map((song, index) => {
              if (index === currentSongIndex) return null;
              const isNext = index === (currentSongIndex + 1) % playlist.songs.length;
              
              return (
                <li
                  key={song._id || index}
                  className={`queue-item ${isNext ? 'next' : ''}`}
                  onClick={() => changeSong(index)}
                >
                  <div className="queue-art">
                    {song.albumArt ? (
                      <img src={song.albumArt} alt={song.title} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.1)' }} />
                    )}
                  </div>
                  <div className="queue-info">
                    <h4 className="queue-title">{song.title}</h4>
                    <p className="queue-artist">{song.artist}</p>
                  </div>
                  <div className="queue-actions">
                    {song.explicit && <span className="explicit-tag">E</span>}
                    <span className="upload-indicator"></span>
                    <button
                      className="queue-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Remove song logic here
                      }}
                      title="Remove from queue"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Player Controls */}
        <div className="player-controls">
          <button
            className="control-btn"
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <svg viewBox="0 0 24 24">
              {isMuted ? (
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              ) : (
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              )}
            </svg>
          </button>
          
          <button
            className="control-btn play-pause"
            onClick={togglePlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            <svg viewBox="0 0 24 24">
              {isPlaying ? (
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              ) : (
                <path d="M8 5v14l11-7z"/>
              )}
            </svg>
          </button>

          <div className="volume-control">
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="volume-slider"
              title="Volume"
            />
          </div>
        </div>
      </div>
    </>
  );
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMusicPlayer);
} else {
  initMusicPlayer();
}

function initMusicPlayer() {
  const root = document.createElement('div');
  root.id = 'music-player-root';
  document.body.appendChild(root);
  
  // Render with React
  const rootElement = ReactDOM.createRoot(root);
  rootElement.render(React.createElement(MusicPlayer));
}

