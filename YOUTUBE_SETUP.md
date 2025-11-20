# YouTube Music Player Setup Guide

Your music player now uses YouTube API to play songs from a public YouTube playlist! 🎵

## What You Need

1. **YouTube API Key** - Free, from Google Cloud Console
2. **YouTube Playlist ID** - From your public YouTube playlist URL

## Step 1: Get Your YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the **YouTube Data API v3**:
   - Go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key (it will look like: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

## Step 2: Get Your Playlist ID

1. Go to your YouTube playlist (make sure it's **public**)
2. Look at the URL - it will look like:
   ```
   https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. Copy the part after `list=` - that's your **Playlist ID**

## Step 3: Configure the Music Player

1. Open `music-player.js`
2. Find these lines at the top (around line 10-11):
   ```javascript
   const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY_HERE';
   const YOUTUBE_PLAYLIST_ID = 'YOUR_PLAYLIST_ID_HERE';
   ```
3. Replace them with your actual values:
   ```javascript
   const YOUTUBE_API_KEY = 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
   const YOUTUBE_PLAYLIST_ID = 'PLxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
   ```

## Step 4: Test It!

1. Refresh your website
2. The music player should automatically load your YouTube playlist
3. Songs will play in the same order as your YouTube playlist
4. Click the X icon to skip songs

## Features

✅ **Auto-play on homepage** - First song plays automatically (subject to browser autoplay policies)  
✅ **Auto-mute on other pages** - Music is muted when you navigate away from homepage  
✅ **Double-click to mute/unmute** - Double-click the music icon  
✅ **Skip songs** - Click X on any song to skip it  
✅ **Same UI** - All your existing UI design is preserved  
✅ **No volume controls** - Fixed at 60% volume as requested  

## Troubleshooting

**"Please configure YOUTUBE_API_KEY and YOUTUBE_PLAYLIST_ID"**
- Make sure you've replaced the placeholder values in `music-player.js`

**"YouTube API error: 403"**
- Your API key might not have the YouTube Data API v3 enabled
- Go back to Google Cloud Console and enable it

**"Playlist is empty or not found"**
- Make sure your playlist is **public** (not private or unlisted)
- Double-check your Playlist ID is correct

**Music doesn't auto-play**
- Browsers block autoplay with sound. The player will try to play on user interaction (click/touch)
- This is normal browser behavior for YouTube videos

## Notes

- The playlist order matches your YouTube playlist exactly
- You can add/remove songs from your YouTube playlist and they'll update on your site
- The player uses a hidden YouTube iframe (no visible video player)
- Volume is fixed at 60% with no user controls

## You Can Now Delete Local Music Files!

Since you're using YouTube, you can delete the music files from your `Videos/` folder:
- `Guardians Music.mp3`
- `Avengers Music.mp3`
- `Fantastic Music.mp3`
- `Marvel Music.mp3`

The music player will now stream from YouTube instead! 🎉

