# Nova Player - Advanced Video Player

A modern, feature-rich HTML5 video player with playlist support, advanced controls, and professional UI.

## Features

### Core Features
- **Playlist Support**: Navigate through multiple videos seamlessly
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Glassmorphism design with smooth animations
- **Keyboard Shortcuts**: Full keyboard control support

### Advanced Features
- **Quality Selection**: Switch between different video qualities (Auto, 1080p, 720p, 480p)
- **Playback Speed Control**: Adjust speed from 0.25x to 2x
- **Subtitles Support**: Toggle subtitles on/off (when available)
- **Picture-in-Picture**: Modern PiP support
- **Fullscreen Mode**: Immersive fullscreen experience
- **Stats Overlay**: Real-time video statistics (resolution, buffer, dropped frames, etc.)
- **Advanced Progress Bar**: Seek with time tooltip and buffer visualization
- **Volume Control**: Precise volume adjustment with visual feedback

### Keyboard Shortcuts
- `Space` or `K`: Play/Pause
- `←` or `J`: Skip backward 5 seconds
- `→` or `L`: Skip forward 5 seconds
- `↑`: Volume up
- `↓`: Volume down
- `M`: Toggle mute
- `F`: Toggle fullscreen
- `C`: Toggle subtitles
- `Q`: Open quality menu
- `S`: Toggle stats overlay
- `N`: Next video
- `R`: Replay video

### File Structure
```
├── index.html      # Main HTML structure
├── styles.css      # All styling and animations
└── script.js       # JavaScript functionality
```

## Usage

1. Open `index.html` in a modern web browser
2. Or serve locally: `python -m http.server 8000`
3. Navigate to `http://localhost:8000`

## Browser Support

- Chrome 66+
- Firefox 60+
- Safari 12+
- Edge 79+

## Customization

### Adding Videos
Edit the `playlistData` array in `script.js`:

```javascript
const playlistData = [
    {
        id: 1,
        title: 'Your Video Title',
        duration: 'MM:SS',
        src: 'path/to/video.mp4',
        poster: 'path/to/poster.jpg',
        subtitles: 'path/to/subtitles.vtt', // Optional
        qualities: {
            auto: 'path/to/video.mp4',
            '1080p': 'path/to/video-1080p.mp4',
            '720p': 'path/to/video-720p.mp4'
        }
    }
];
```

### Styling
Modify `styles.css` to customize the appearance. CSS variables are defined at the top for easy theming.

### Advanced Configuration
The player includes many configurable options through JavaScript variables and can be extended with additional features.

## Technical Details

- **No Dependencies**: Pure HTML5, CSS3, and ES6+ JavaScript
- **Performance Optimized**: Debounced events, efficient DOM manipulation
- **Accessibility**: ARIA labels, keyboard navigation
- **Error Handling**: Graceful fallbacks for unsupported features
- **Mobile Friendly**: Touch controls and responsive design

## License

This project is open source and available under the MIT License.