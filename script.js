// ===== DATA SOURCE =====
const playlistData = [
    {
        id: 1,
        title: 'Big Buck Bunny',
        duration: '9:56',
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        poster: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png?x61709',
        subtitles: null,
        qualities: { auto: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
    },
    {
        id: 2,
        title: 'Elephant Dream',
        duration: '10:53',
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Elephants_Dream_cover.jpg/320px-Elephants_Dream_cover.jpg',
        subtitles: null,
        qualities: { auto: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
    },
    {
        id: 3,
        title: 'Sintel',
        duration: '14:48',
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        poster: 'https://durian.blender.org/wp-content/uploads/2010/06/05.8b_comp_000272.jpg?x61709',
        subtitles: null,
        qualities: { auto: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' }
    }
];

// ===== DOM ELEMENTS =====
const video = document.getElementById('videoPlayer');
const playerWrapper = document.getElementById('playerWrapper');
const controls = document.getElementById('controls');
const centerAction = document.getElementById('centerAction');
const spinner = document.getElementById('spinner');
const endScreen = document.getElementById('endScreen');
const playlistContainer = document.getElementById('playlistContainer');
const statsOverlay = document.getElementById('statsOverlay');
const subtitleTrack = document.getElementById('subtitleTrack');
const subtitleToggle = document.getElementById('subtitleToggle');
const qualityBtn = document.getElementById('qualityBtn');
const qualityMenu = document.getElementById('qualityMenu');

// Controls
const playBtn = document.getElementById('playBtn');
const playLargeBtn = document.getElementById('playLargeBtn');
const iconPlay = document.getElementById('iconPlay');
const iconPause = document.getElementById('iconPause');
const volumeBtn = document.getElementById('volumeBtn');
const volumeSlider = document.getElementById('volumeSlider');
const iconVol = document.getElementById('iconVol');
const iconMute = document.getElementById('iconMute');
const progressWrapper = document.getElementById('progressWrapper');
const progressFill = document.getElementById('progressFill');
const progressHandle = document.getElementById('progressHandle');
const progressBuffer = document.getElementById('progressBuffer');
const timeTooltip = document.getElementById('timeTooltip');
const timeDisplay = document.getElementById('timeDisplay');
const fullBtn = document.getElementById('fullBtn');
const pipBtn = document.getElementById('pipBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsMenu = document.getElementById('settingsMenu');
const statsBtn = document.getElementById('statsBtn');

// ===== STATE =====
let currentPlaylistIndex = 0;
let hideControlsTimeout;
let isDragging = false;
let subtitlesEnabled = false;
let currentQuality = 'auto';

// ===== UTILITIES =====
const formatTime = (seconds) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// ===== INITIALIZATION =====
function init() {
    renderPlaylist();
    setupEvents();
    loadVideo(0);
}

// ===== PLAYLIST RENDERING =====
function renderPlaylist() {
    playlistContainer.innerHTML = playlistData.map((item, index) => `
        <div class="playlist-item ${index === 0 ? 'active' : ''}" data-index="${index}">
            <div class="playlist-thumb">
                <img src="${item.poster}" alt="${item.title}" loading="lazy">
            </div>
            <div class="playlist-meta">
                <h4>${item.title}</h4>
                <span>${item.duration}</span>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            loadVideo(index);
        });
    });
}

// ===== VIDEO LOADING =====
function loadVideo(index) {
    currentPlaylistIndex = index;
    const videoData = playlistData[index];

    // Reset UI
    endScreen.classList.remove('visible');
    spinner.classList.add('visible');
    progressFill.style.width = '0%';
    progressHandle.style.left = '0%';
    progressBuffer.style.width = '0%';
    timeDisplay.textContent = '0:00 / 0:00';

    // Update playlist active state
    document.querySelectorAll('.playlist-item').forEach((el, i) => {
        el.classList.toggle('active', i === index);
    });

    // Load video source
    video.src = videoData.qualities[currentQuality] || videoData.src;
    video.load();

    // Load subtitles if available
    if (videoData.subtitles) {
        subtitleTrack.src = videoData.subtitles;
        subtitleTrack.track.mode = subtitlesEnabled ? 'showing' : 'hidden';
    } else {
        subtitleTrack.src = '';
        subtitleTrack.track.mode = 'hidden';
    }

    // Update quality button
    updateQualityButton();
}

// ===== EVENTS SETUP =====
function setupEvents() {
    // --- Media Events ---
    video.addEventListener('loadedmetadata', () => {
        spinner.classList.remove('visible');
        timeDisplay.textContent = `0:00 / ${formatTime(video.duration)}`;
        updateQualityButton();
    });

    video.addEventListener('play', () => {
        iconPlay.style.display = 'none';
        iconPause.style.display = 'block';
        centerAction.classList.remove('visible');
        endScreen.classList.remove('visible');
    });

    video.addEventListener('pause', () => {
        iconPlay.style.display = 'block';
        iconPause.style.display = 'none';
        centerAction.classList.add('visible');
    });

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('waiting', () => spinner.classList.add('visible'));
    video.addEventListener('canplay', () => spinner.classList.remove('visible'));
    video.addEventListener('ended', handleVideoEnd);
    video.addEventListener('progress', updateBuffer);
    video.addEventListener('error', handleVideoError);

    // --- Control Interactions ---
    playBtn.addEventListener('click', togglePlay);
    playLargeBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);
    video.addEventListener('dblclick', toggleFullscreen);

    document.getElementById('skipBack').addEventListener('click', () => skipTime(-10));
    document.getElementById('skipFwd').addEventListener('click', () => skipTime(10));

    volumeSlider.addEventListener('input', (e) => {
        video.volume = e.target.value;
        video.muted = false;
        updateVolumeIcon();
    });

    volumeBtn.addEventListener('click', toggleMute);

    fullBtn.addEventListener('click', toggleFullscreen);
    pipBtn.addEventListener('click', togglePiP);

    document.getElementById('replayBtn').addEventListener('click', replayVideo);
    document.getElementById('nextBtn').addEventListener('click', playNextVideo);

    // --- Settings Menu ---
    settingsBtn.addEventListener('click', toggleSettingsMenu);
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => changePlaybackSpeed(item.dataset.speed));
    });
    document.addEventListener('click', closeSettingsMenu);

    // --- Stats ---
    statsBtn.addEventListener('click', toggleStats);

    // --- Progress Interaction ---
    progressWrapper.addEventListener('click', seekVideo);
    progressWrapper.addEventListener('mousedown', () => isDragging = true);
    document.addEventListener('mouseup', () => isDragging = false);
    document.addEventListener('mousemove', handleProgressHover);

    // --- Subtitles ---
    subtitleToggle.addEventListener('click', toggleSubtitles);

    // --- Quality ---
    qualityBtn.addEventListener('click', toggleQualityMenu);
    document.querySelectorAll('.quality-option').forEach(option => {
        option.addEventListener('click', () => changeQuality(option.dataset.quality));
    });
    document.addEventListener('click', closeQualityMenu);

    // --- Auto-hide controls ---
    playerWrapper.addEventListener('mousemove', showControls);
    playerWrapper.addEventListener('mouseleave', hideControlsOnMouseLeave);

    // --- Keyboard Shortcuts ---
    document.addEventListener('keydown', handleKeyboard);

    // --- Fullscreen change ---
    document.addEventListener('fullscreenchange', handleFullscreenChange);
}

// ===== VIDEO CONTROLS =====
function togglePlay() {
    if (video.paused) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error("Playback failed:", error);
            });
        }
    } else {
        video.pause();
    }
}

function skipTime(seconds) {
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
}

function toggleMute() {
    video.muted = !video.muted;
    updateVolumeIcon();
}

function updateVolumeIcon() {
    const isMuted = video.muted || video.volume === 0;
    iconVol.style.display = isMuted ? 'none' : 'block';
    iconMute.style.display = isMuted ? 'block' : 'none';
    volumeSlider.value = video.muted ? 0 : video.volume;
}

function replayVideo() {
    video.currentTime = 0;
    video.play();
}

function playNextVideo() {
    const nextIndex = (currentPlaylistIndex + 1) % playlistData.length;
    loadVideo(nextIndex);
    video.play().catch(console.error);
}

function handleVideoEnd() {
    endScreen.classList.add('visible');
    centerAction.classList.remove('visible');
}

function handleVideoError() {
    console.error('Video loading error');
    spinner.classList.remove('visible');
    // Could show error message to user
}

// ===== PROGRESS AND SEEKING =====
function updateProgress() {
    if (!video.duration) return;
    const percent = (video.currentTime / video.duration) * 100;
    progressFill.style.width = `${percent}%`;
    progressHandle.style.left = `${percent}%`;
    timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;

    if (statsOverlay.classList.contains('visible')) {
        updateStats();
    }
}

function updateBuffer() {
    if (video.buffered.length > 0 && video.duration) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferPercent = (bufferedEnd / video.duration) * 100;
        progressBuffer.style.width = `${bufferPercent}%`;
    }
}

function seekVideo(e) {
    const rect = progressWrapper.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pos * video.duration;
}

function handleProgressHover(e) {
    if (isDragging) {
        seekVideo(e);
    }
    updateTimeTooltip(e);
}

function updateTimeTooltip(e) {
    const rect = progressWrapper.getBoundingClientRect();
    if (e.clientX >= rect.left && e.clientX <= rect.right) {
        const pos = (e.clientX - rect.left) / rect.width;
        const time = pos * video.duration;
        timeTooltip.textContent = formatTime(time);
        timeTooltip.style.left = `${pos * 100}%`;
    }
}

// ===== SETTINGS AND MENUS =====
function toggleSettingsMenu(e) {
    e?.stopPropagation();
    settingsMenu.classList.toggle('visible');
}

function closeSettingsMenu(e) {
    if (!settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
        settingsMenu.classList.remove('visible');
    }
}

function changePlaybackSpeed(speed) {
    video.playbackRate = parseFloat(speed);
    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
    document.querySelector(`[data-speed="${speed}"]`).classList.add('active');
    settingsMenu.classList.remove('visible');
}

// ===== SUBTITLES =====
function toggleSubtitles() {
    subtitlesEnabled = !subtitlesEnabled;
    subtitleTrack.track.mode = subtitlesEnabled ? 'showing' : 'hidden';
    subtitleToggle.style.opacity = subtitlesEnabled ? '1' : '0.6';
}

// ===== QUALITY =====
function toggleQualityMenu(e) {
    e?.stopPropagation();
    qualityMenu.classList.toggle('visible');
}

function closeQualityMenu(e) {
    if (!qualityBtn.contains(e.target) && !qualityMenu.contains(e.target)) {
        qualityMenu.classList.remove('visible');
    }
}

function changeQuality(quality) {
    if (currentQuality === quality) return;

    currentQuality = quality;
    const currentTime = video.currentTime;
    const wasPlaying = !video.paused;

    loadVideo(currentPlaylistIndex);

    video.addEventListener('loadedmetadata', () => {
        video.currentTime = currentTime;
        if (wasPlaying) video.play();
    }, { once: true });

    document.querySelectorAll('.quality-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.quality === quality);
    });
    qualityMenu.classList.remove('visible');
}

function updateQualityButton() {
    const videoData = playlistData[currentPlaylistIndex];
    const availableQualities = Object.keys(videoData.qualities || {});
    qualityBtn.textContent = currentQuality === 'auto' ? 'Auto' : currentQuality.toUpperCase();
    qualityBtn.style.display = availableQualities.length > 1 ? 'block' : 'none';
}

// ===== FULLSCREEN AND PIP =====
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        playerWrapper.requestFullscreen().catch(err => console.log(err));
    } else {
        document.exitFullscreen();
    }
}

function handleFullscreenChange() {
    const isFullscreen = !!document.fullscreenElement;
    // Could adjust UI for fullscreen mode
}

async function togglePiP() {
    try {
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else if (document.pictureInPictureEnabled) {
            await video.requestPictureInPicture();
        }
    } catch(err) {
        console.error("PiP Error:", err);
    }
}

// ===== STATS =====
function toggleStats() {
    statsOverlay.classList.toggle('visible');
    if (statsOverlay.classList.contains('visible')) {
        updateStats();
    }
}

function updateStats() {
    const quality = video.getVideoPlaybackQuality ? video.getVideoPlaybackQuality() : {};
    const buffer = video.buffered.length > 0 ? (video.buffered.end(video.buffered.length - 1) - video.currentTime).toFixed(0) : 0;

    statsOverlay.innerHTML = `
        <div>Resolution: ${video.videoWidth}x${video.videoHeight}</div>
        <div>Dropped Frames: ${quality.droppedVideoFrames || 0}</div>
        <div>Buffer: ${buffer}s</div>
        <div>Speed: ${video.playbackRate}x</div>
        <div>Quality: ${currentQuality}</div>
        <div>Network: ${navigator.onLine ? 'Online' : 'Offline'}</div>
    `;
}

// ===== CONTROLS VISIBILITY =====
const showControls = debounce(() => {
    controls.classList.add('visible');
    clearTimeout(hideControlsTimeout);
    if (!video.paused) {
        hideControlsTimeout = setTimeout(() => {
            controls.classList.remove('visible');
        }, 3000);
    }
}, 100);

function hideControlsOnMouseLeave() {
    if (!video.paused) {
        controls.classList.remove('visible');
    }
}

// ===== KEYBOARD SHORTCUTS =====
function handleKeyboard(e) {
    if (e.target.tagName === 'INPUT') return;

    const key = e.key.toLowerCase();
    switch(key) {
        case ' ': case 'k':
            togglePlay();
            e.preventDefault();
            break;
        case 'arrowright': case 'l':
            skipTime(5);
            e.preventDefault();
            break;
        case 'arrowleft': case 'j':
            skipTime(-5);
            e.preventDefault();
            break;
        case 'arrowup':
            video.volume = Math.min(1, video.volume + 0.1);
            updateVolumeIcon();
            e.preventDefault();
            break;
        case 'arrowdown':
            video.volume = Math.max(0, video.volume - 0.1);
            updateVolumeIcon();
            e.preventDefault();
            break;
        case 'f':
            toggleFullscreen();
            break;
        case 'm':
            toggleMute();
            break;
        case 'c':
            toggleSubtitles();
            break;
        case 'q':
            toggleQualityMenu();
            break;
        case 's':
            toggleStats();
            break;
        case 'n':
            playNextVideo();
            break;
        case 'r':
            replayVideo();
            break;
    }
}

// ===== START =====
init();