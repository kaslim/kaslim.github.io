/**
 * MAIA Demo - Audio Player
 * Custom audio player with WaveSurfer.js integration
 */

// Audio player state
const AudioPlayers = {
    original: null,
    adversarial: null,
    initialized: false,
    syncing: false
};

/**
 * Initialize audio players
 */
document.addEventListener('DOMContentLoaded', () => {
    // Wait for data to load
    const checkDataInterval = setInterval(() => {
        if (window.isDataLoaded && window.isDataLoaded()) {
            clearInterval(checkDataInterval);
            initAudioPlayers();
        }
    }, 100);
});

/**
 * Initialize WaveSurfer players
 */
function initAudioPlayers() {
    console.log('🎧 Initializing audio players...');
    
    try {
        // Create original audio player
        AudioPlayers.original = WaveSurfer.create({
            container: '#waveform-original',
            waveColor: '#0173B2',
            progressColor: '#029E73',
            cursorColor: '#0173B2',
            barWidth: 2,
            barRadius: 3,
            cursorWidth: 2,
            height: 120,
            barGap: 1,
            normalize: true,
            responsive: true
        });
        
        // Create adversarial audio player
        AudioPlayers.adversarial = WaveSurfer.create({
            container: '#waveform-adversarial',
            waveColor: '#029E73',
            progressColor: '#DE8F05',
            cursorColor: '#029E73',
            barWidth: 2,
            barRadius: 3,
            cursorWidth: 2,
            height: 120,
            barGap: 1,
            normalize: true,
            responsive: true
        });
        
        // Setup player controls
        setupPlayerControls('original', AudioPlayers.original);
        setupPlayerControls('adversarial', AudioPlayers.adversarial);
        
        // Setup synchronized playback
        setupSyncPlayback();
        
        // Load first sample
        loadSample(0);
        
        AudioPlayers.initialized = true;
        console.log('✅ Audio players initialized');
    } catch (error) {
        console.error('❌ Error initializing audio players:', error);
        window.showNotification('Failed to initialize audio players', 'error');
    }
}

/**
 * Setup player controls (play/pause, volume, time display)
 */
function setupPlayerControls(playerType, wavesurfer) {
    const playButton = document.getElementById(`play-${playerType}`);
    const volumeSlider = document.getElementById(`volume-${playerType}`);
    const timeDisplay = document.getElementById(`time-${playerType}`);
    
    if (!playButton || !volumeSlider || !timeDisplay) return;
    
    // Play/Pause button
    playButton.addEventListener('click', () => {
        if (wavesurfer.isPlaying()) {
            wavesurfer.pause();
            playButton.textContent = '▶ Play';
            playButton.classList.remove('playing');
        } else {
            wavesurfer.play();
            playButton.textContent = '⏸ Pause';
            playButton.classList.add('playing');
        }
    });
    
    // Volume control
    volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        wavesurfer.setVolume(volume);
    });
    
    // Set initial volume
    wavesurfer.setVolume(0.8);
    
    // Time display update
    wavesurfer.on('audioprocess', () => {
        const currentTime = wavesurfer.getCurrentTime();
        const duration = wavesurfer.getDuration();
        timeDisplay.textContent = `${window.formatTime(currentTime)} / ${window.formatTime(duration)}`;
    });
    
    // Update play button when playback finishes
    wavesurfer.on('finish', () => {
        playButton.textContent = '▶ Play';
        playButton.classList.remove('playing');
    });
    
    // Update play button on pause
    wavesurfer.on('pause', () => {
        playButton.textContent = '▶ Play';
        playButton.classList.remove('playing');
    });
    
    // Update play button on play
    wavesurfer.on('play', () => {
        playButton.textContent = '⏸ Pause';
        playButton.classList.add('playing');
    });
    
    // Loading state
    wavesurfer.on('loading', (percent) => {
        const waveformEl = document.getElementById(`waveform-${playerType}`);
        if (percent < 100) {
            waveformEl.classList.add('loading');
        } else {
            waveformEl.classList.remove('loading');
        }
    });
    
    // Ready state
    wavesurfer.on('ready', () => {
        const duration = wavesurfer.getDuration();
        timeDisplay.textContent = `0:00 / ${window.formatTime(duration)}`;
    });
    
    // Error handling
    wavesurfer.on('error', (error) => {
        console.error(`Error in ${playerType} player:`, error);
        const waveformEl = document.getElementById(`waveform-${playerType}`);
        waveformEl.classList.add('error');
        window.showNotification(`Failed to load ${playerType} audio`, 'error');
    });
}

/**
 * Setup synchronized playback
 */
function setupSyncPlayback() {
    const syncButton = document.getElementById('btn-sync-play');
    if (!syncButton) return;
    
    syncButton.addEventListener('click', () => {
        const { original, adversarial } = AudioPlayers;
        
        if (!original || !adversarial) return;
        
        // Toggle sync playback
        if (original.isPlaying() || adversarial.isPlaying()) {
            // Pause both
            original.pause();
            adversarial.pause();
            AudioPlayers.syncing = false;
            syncButton.classList.remove('active');
        } else {
            // Play both synchronized
            AudioPlayers.syncing = true;
            syncButton.classList.add('active');
            
            // Seek to beginning if needed
            original.seekTo(0);
            adversarial.seekTo(0);
            
            // Play both
            original.play();
            adversarial.play();
            
            // Add visual indication
            document.getElementById('waveform-original').classList.add('sync-active');
            document.getElementById('waveform-adversarial').classList.add('sync-active');
            
            // Keep them synchronized during playback
            const syncInterval = setInterval(() => {
                if (!original.isPlaying() && !adversarial.isPlaying()) {
                    clearInterval(syncInterval);
                    AudioPlayers.syncing = false;
                    syncButton.classList.remove('active');
                    document.getElementById('waveform-original').classList.remove('sync-active');
                    document.getElementById('waveform-adversarial').classList.remove('sync-active');
                } else {
                    // Sync positions (small drift correction)
                    const originalTime = original.getCurrentTime();
                    const adversarialTime = adversarial.getCurrentTime();
                    const drift = Math.abs(originalTime - adversarialTime);
                    
                    if (drift > 0.1) { // If drift > 100ms
                        adversarial.seekTo(original.getCurrentTime() / original.getDuration());
                    }
                }
            }, 100);
        }
    });
    
    // Pause both when one finishes
    AudioPlayers.original.on('finish', () => {
        if (AudioPlayers.syncing) {
            AudioPlayers.adversarial.pause();
            AudioPlayers.syncing = false;
        }
    });
    
    AudioPlayers.adversarial.on('finish', () => {
        if (AudioPlayers.syncing) {
            AudioPlayers.original.pause();
            AudioPlayers.syncing = false;
        }
    });
}

/**
 * Load audio sample
 */
function loadSample(sampleIndex) {
    if (!AudioPlayers.initialized) {
        console.error('Audio players not initialized');
        return;
    }
    
    const sample = window.MAIAState.samples[sampleIndex];
    if (!sample) {
        console.error('Sample not found:', sampleIndex);
        return;
    }
    
    console.log('Loading sample:', sample.id);
    
    // Pause any playing audio
    if (AudioPlayers.original.isPlaying()) {
        AudioPlayers.original.pause();
    }
    if (AudioPlayers.adversarial.isPlaying()) {
        AudioPlayers.adversarial.pause();
    }
    
    // Load audio files
    try {
        AudioPlayers.original.load(sample.original_audio);
        AudioPlayers.adversarial.load(sample.adversarial_audio);
        
        // Reset play buttons
        document.getElementById('play-original').textContent = '▶ Play';
        document.getElementById('play-adversarial').textContent = '▶ Play';
        
        console.log('✅ Sample loaded:', sample.id);
    } catch (error) {
        console.error('❌ Error loading sample:', error);
        window.showNotification('Failed to load audio sample', 'error');
    }
}

/**
 * Jump to specific time in both players
 */
function jumpToTime(seconds) {
    if (!AudioPlayers.initialized) return;
    
    const { original, adversarial } = AudioPlayers;
    
    // Calculate seek position (0-1)
    const originalDuration = original.getDuration();
    const adversarialDuration = adversarial.getDuration();
    
    if (originalDuration > 0) {
        original.seekTo(seconds / originalDuration);
    }
    
    if (adversarialDuration > 0) {
        adversarial.seekTo(seconds / adversarialDuration);
    }
}

/**
 * Get current playback time
 */
function getCurrentTime(playerType) {
    const player = AudioPlayers[playerType];
    return player ? player.getCurrentTime() : 0;
}

/**
 * Get duration
 */
function getDuration(playerType) {
    const player = AudioPlayers[playerType];
    return player ? player.getDuration() : 0;
}

/**
 * Check if playing
 */
function isPlaying(playerType) {
    const player = AudioPlayers[playerType];
    return player ? player.isPlaying() : false;
}

// Export functions
window.AudioPlayers = AudioPlayers;
window.loadSample = loadSample;
window.jumpToTime = jumpToTime;
window.getCurrentTime = getCurrentTime;
window.getDuration = getDuration;
window.isPlaying = isPlaying;

