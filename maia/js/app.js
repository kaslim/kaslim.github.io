(function () {
    const focusSections = Array.from(document.querySelectorAll('[data-focus-step]'));
    const focusToggle = document.getElementById('focus-toggle');
    const focusControls = document.getElementById('focus-controls');
    const focusProgress = document.getElementById('focus-progress');
    const focusPrevious = document.getElementById('focus-prev');
    const focusNext = document.getElementById('focus-next');
    const query = new URLSearchParams(window.location.search);
    let focusEnabled = query.get('focus') === '1';
    let focusStep = Math.min(focusSections.length, Math.max(1, Number(query.get('step')) || 1));
    let touchStartX = null;

    function t(key, values) { return window.MAIAI18n ? window.MAIAI18n.t(key, values) : key; }
    function replaceQuery(updates) {
        const url = new URL(window.location.href);
        Object.entries(updates).forEach(([key, value]) => value === null ? url.searchParams.delete(key) : url.searchParams.set(key, value));
        history.replaceState({}, '', url);
    }
    function updateFocusUi() {
        document.body.classList.toggle('focus-mode', focusEnabled);
        focusControls.hidden = !focusEnabled;
        focusSections.forEach((section) => section.classList.toggle('is-focus-step', focusEnabled && Number(section.dataset.focusStep) === focusStep));
        focusPrevious.disabled = focusStep <= 1;
        focusNext.disabled = focusStep >= focusSections.length;
        focusProgress.textContent = `${focusStep} / ${focusSections.length}`;
        focusProgress.setAttribute('aria-label', t('focus.progress', { current: focusStep, total: focusSections.length }));
        focusToggle.textContent = t(focusEnabled ? 'focus.exit' : 'focus.enter');
        focusToggle.setAttribute('aria-label', t(focusEnabled ? 'focus.exitAria' : 'focus.enterAria'));
    }
    function setFocus(enabled, step = focusStep) {
        focusEnabled = enabled;
        focusStep = Math.min(focusSections.length, Math.max(1, step));
        if (window.MAIADemo && typeof window.MAIADemo.pauseAll === 'function') window.MAIADemo.pauseAll();
        replaceQuery(enabled ? { focus: '1', step: String(focusStep) } : { focus: null, step: null });
        updateFocusUi();
        if (enabled) focusSections[focusStep - 1].scrollTop = 0;
    }
    function moveFocus(delta) {
        if (!focusEnabled) return;
        const next = Math.min(focusSections.length, Math.max(1, focusStep + delta));
        if (next !== focusStep) setFocus(true, next);
    }

    focusToggle.addEventListener('click', () => setFocus(!focusEnabled, focusEnabled ? focusStep : 1));
    focusPrevious.addEventListener('click', () => moveFocus(-1));
    focusNext.addEventListener('click', () => moveFocus(1));
    document.addEventListener('pointerdown', (event) => { if (focusEnabled && event.pointerType === 'touch') touchStartX = event.clientX; });
    document.addEventListener('pointerup', (event) => {
        if (!focusEnabled || touchStartX === null || event.pointerType !== 'touch') return;
        const distance = event.clientX - touchStartX;
        touchStartX = null;
        if (Math.abs(distance) > 60) moveFocus(distance > 0 ? -1 : 1);
    });

    const editable = (target) => target instanceof HTMLElement && (target.matches('input, select, textarea, button') || target.isContentEditable);
    document.addEventListener('keydown', (event) => {
        if (!focusEnabled || editable(event.target)) return;
        if (event.key === 'Escape') { event.preventDefault(); setFocus(false); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); moveFocus(-1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); moveFocus(1); }
    });

    function stabilizeDeepLink() {
        if (focusEnabled || !window.location.hash) return;
        const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
        if (!target) return;
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => target.scrollIntoView({ block: 'start' })));
    }
    window.addEventListener('load', stabilizeDeepLink);
    window.addEventListener('hashchange', stabilizeDeepLink);

    class VerifiedDemo {
        constructor() {
            this.sample = null;
            this.candidate = null;
            this.activeTrack = 'original';
            this.loopEnabled = false;
            this.duration = 30;
            this.audio = {
                original: document.getElementById('audio-original'),
                masked: document.getElementById('audio-masked'),
                regenerated: document.getElementById('audio-regenerated')
            };
            this.candidateSelect = document.getElementById('candidate-select');
            this.regionSelect = document.getElementById('region-select');
            this.seek = document.getElementById('seek-slider');
            this.volume = document.getElementById('volume-slider');
            this.playButton = document.getElementById('play-toggle');
            this.loopButton = document.getElementById('loop-toggle');
            this.status = document.getElementById('player-status');
            this.currentTime = document.getElementById('current-time');
            this.totalTime = document.getElementById('total-time');
        }

        async initialize() {
            try {
                const response = await fetch('data/manifests/real-demo.json', { cache: 'no-store' });
                if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`);
                const manifest = await response.json();
                if (!manifest.samples || manifest.samples.length === 0) throw new Error('Manifest has no samples');
                this.sample = manifest.samples[0];
                this.duration = Number(this.sample.duration_seconds || 30);
                this.populateCandidates();
                this.populateRegions();
                this.bindEvents();
                this.selectCandidate(this.sample.selected_seed);
                this.setTrack('original', false);
                document.getElementById('demo-app').setAttribute('aria-busy', 'false');
                this.refreshLanguage();
            } catch (error) {
                console.error(error);
                document.getElementById('demo-app').hidden = true;
                const errorBox = document.getElementById('demo-error');
                errorBox.hidden = false;
                errorBox.textContent = t('demo.error');
            }
        }

        populateCandidates() {
            const selected = this.candidateSelect.value || String(this.sample.selected_seed);
            this.candidateSelect.replaceChildren(...this.sample.candidates.map((candidate) => {
                const option = document.createElement('option');
                option.value = String(candidate.random_seed);
                option.textContent = t('demo.candidateOption', { seed: candidate.random_seed });
                return option;
            }));
            this.candidateSelect.value = selected;
        }

        populateRegions() {
            const selected = this.regionSelect.value || '0';
            this.regionSelect.replaceChildren(...this.sample.effective_regions.map((region, index) => {
                const option = document.createElement('option');
                option.value = String(index);
                option.textContent = t('demo.regionOption', { index: index + 1, start: region.effective[0].toFixed(2), end: region.effective[1].toFixed(2) });
                return option;
            }));
            this.regionSelect.value = selected;
        }

        bindEvents() {
            this.candidateSelect.addEventListener('change', () => this.selectCandidate(Number(this.candidateSelect.value)));
            document.querySelectorAll('.track-button').forEach((button) => button.addEventListener('click', () => this.setTrack(button.dataset.track, true)));
            this.playButton.addEventListener('click', () => this.togglePlay());
            document.getElementById('ab-toggle').addEventListener('click', () => this.setTrack(this.activeTrack === 'original' ? 'regenerated' : 'original', true));
            this.seek.addEventListener('input', () => this.seekAll(Number(this.seek.value)));
            this.volume.addEventListener('input', () => Object.values(this.audio).forEach((audio) => { audio.volume = Number(this.volume.value); }));
            this.loopButton.addEventListener('click', () => this.toggleLoop());
            this.regionSelect.addEventListener('change', () => { if (this.loopEnabled) this.seekAll(this.selectedRegion()[0]); });
            Object.entries(this.audio).forEach(([track, audio]) => {
                audio.volume = Number(this.volume.value);
                audio.addEventListener('timeupdate', () => { if (track === this.activeTrack) this.onTimeUpdate(audio); });
                audio.addEventListener('ended', () => this.pauseAll());
                audio.addEventListener('error', () => { document.getElementById('demo-error').hidden = false; document.getElementById('demo-error').textContent = t('demo.error'); });
            });
            document.addEventListener('keydown', (event) => this.handleAudioKeyboard(event));
        }

        selectCandidate(seed) {
            const candidate = this.sample.candidates.find((item) => item.random_seed === seed) || this.sample.candidates[0];
            const position = this.activeAudio().currentTime || 0;
            const wasPlaying = !this.activeAudio().paused;
            this.pauseAll();
            this.candidate = candidate;
            this.candidateSelect.value = String(candidate.random_seed);
            document.getElementById('sample-name').textContent = this.sample.display_name;
            document.getElementById('locate-spectrogram').src = this.sample.original_spectrogram;
            document.getElementById('spec-original').src = this.sample.original_spectrogram;
            document.getElementById('spec-masked').src = this.sample.masked_spectrogram;
            document.getElementById('spec-regenerated').src = candidate.regenerated_spectrogram;
            document.getElementById('spec-difference').src = candidate.difference_spectrogram;
            this.audio.original.src = this.sample.original_audio;
            this.audio.masked.src = this.sample.masked_audio;
            this.audio.regenerated.src = candidate.regenerated_audio;
            Object.values(this.audio).forEach((audio) => {
                audio.load();
                audio.addEventListener('loadedmetadata', () => { try { audio.currentTime = Math.min(position, audio.duration || position); } catch (_) { /* Metadata race. */ } }, { once: true });
            });
            this.duration = Number(this.sample.duration_seconds || 30);
            this.seek.max = String(this.duration);
            this.totalTime.textContent = this.formatTime(this.duration);
            document.getElementById('duration-value').textContent = `${this.duration.toFixed(1)} s`;
            this.renderRegions();
            this.renderProvenance();
            if (wasPlaying) this.activeAudio().play().catch(() => {});
        }

        renderRegions() {
            const build = () => this.sample.effective_regions.map((region) => {
                const marker = document.createElement('span');
                marker.className = 'region-overlay';
                marker.style.left = `${region.effective[0] / this.duration * 100}%`;
                marker.style.width = `${(region.effective[1] - region.effective[0]) / this.duration * 100}%`;
                return marker;
            });
            document.getElementById('locate-overlays').replaceChildren(...build());
            document.querySelectorAll('.shared-overlays').forEach((container) => container.replaceChildren(...build()));
            const timeline = document.getElementById('timeline-markers');
            timeline.replaceChildren(...this.sample.effective_regions.map((region) => {
                const marker = document.createElement('span');
                marker.className = 'timeline-marker';
                marker.style.left = `${region.effective[0] / this.duration * 100}%`;
                marker.style.width = `${(region.effective[1] - region.effective[0]) / this.duration * 100}%`;
                return marker;
            }));
        }

        renderProvenance() {
            const set = (id, value) => { document.getElementById(id).textContent = value; };
            set('prov-model', this.sample.model_name);
            set('prov-checkpoint', `${this.sample.checkpoint_name} · ${this.sample.checkpoint_hash.slice(0, 12)}…`);
            set('prov-seed', `${this.candidate.random_seed} (${this.candidate.region_seeds.join(', ')})`);
            set('prov-regions', this.sample.effective_regions.map((region) => `${region.effective[0].toFixed(3)}–${region.effective[1].toFixed(3)} s`).join(' · '));
            set('prov-target', t(this.sample.target_model_evaluated ? 'demo.yes' : 'demo.no'));
            set('prov-date', this.sample.generation_date);
            set('prov-input-hash', `${this.sample.input_hash.slice(0, 16)}…`);
            set('prov-output-hash', `${this.candidate.output_hash.slice(0, 16)}…`);
            set('prov-commit', `${this.sample.code_commit.slice(0, 12)}…`);
            set('prov-crossfade', `${Math.round(this.sample.crossfade_seconds * 1000)} ms`);
            document.getElementById('model-repository').href = this.sample.model_repository;
            document.getElementById('audio-source').href = this.sample.source_audio;
        }

        activeAudio() { return this.audio[this.activeTrack]; }
        setTrack(track, announce) {
            if (!this.audio[track]) return;
            const previous = this.activeAudio();
            const position = Number.isFinite(previous.currentTime) ? previous.currentTime : Number(this.seek.value);
            const wasPlaying = !previous.paused;
            previous.pause();
            this.activeTrack = track;
            const next = this.activeAudio();
            try { next.currentTime = position; } catch (_) { /* Metadata not ready. */ }
            document.querySelectorAll('.track-button').forEach((button) => {
                const active = button.dataset.track === track;
                button.classList.toggle('is-active', active);
                button.setAttribute('aria-pressed', String(active));
            });
            if (wasPlaying) next.play().catch(() => this.updatePlayButton(false));
            this.updatePlayButton(wasPlaying);
            if (announce) this.status.textContent = t('demo.statusSelected', { track: t(`demo.${track}`), time: this.formatTime(position) });
        }

        togglePlay() {
            const audio = this.activeAudio();
            if (audio.paused) {
                if (this.loopEnabled) {
                    const [start, end] = this.selectedRegion();
                    if (audio.currentTime < start || audio.currentTime >= end) this.seekAll(start);
                }
                audio.play().then(() => {
                    this.updatePlayButton(true);
                    this.status.textContent = t('demo.statusPlaying', { track: t(`demo.${this.activeTrack}`), time: this.formatTime(audio.currentTime) });
                }).catch(() => {});
            } else {
                audio.pause();
                this.updatePlayButton(false);
                this.status.textContent = t('demo.statusPaused', { track: t(`demo.${this.activeTrack}`), time: this.formatTime(audio.currentTime) });
            }
        }

        updatePlayButton(playing) {
            this.playButton.textContent = t(playing ? 'demo.pause' : 'demo.play');
            this.playButton.setAttribute('aria-label', t(playing ? 'demo.pauseAria' : 'demo.playAria'));
        }
        seekAll(time) {
            const bounded = Math.max(0, Math.min(this.duration, time));
            Object.values(this.audio).forEach((audio) => { try { audio.currentTime = bounded; } catch (_) { /* Metadata not ready. */ } });
            this.seek.value = String(bounded);
            this.currentTime.textContent = this.formatTime(bounded);
        }
        onTimeUpdate(audio) {
            if (this.loopEnabled) {
                const [start, end] = this.selectedRegion();
                if (audio.currentTime >= end) { this.seekAll(start); if (!audio.paused) audio.play().catch(() => {}); return; }
            }
            this.seek.value = String(audio.currentTime);
            this.currentTime.textContent = this.formatTime(audio.currentTime);
        }
        selectedRegion() { return this.sample.effective_regions[Number(this.regionSelect.value) || 0].effective; }
        toggleLoop() {
            this.loopEnabled = !this.loopEnabled;
            this.loopButton.setAttribute('aria-pressed', String(this.loopEnabled));
            this.loopButton.textContent = t(this.loopEnabled ? 'demo.loopOff' : 'demo.loopOn');
            const [start, end] = this.selectedRegion();
            if (this.loopEnabled) this.seekAll(start);
            this.status.textContent = t(this.loopEnabled ? 'demo.statusLoopOn' : 'demo.statusLoopOff', { start: start.toFixed(2), end: end.toFixed(2) });
        }
        pauseAll() {
            Object.values(this.audio).forEach((audio) => audio.pause());
            this.updatePlayButton(false);
        }
        formatTime(seconds) {
            const safe = Number.isFinite(seconds) ? seconds : 0;
            const minutes = Math.floor(safe / 60);
            const remainder = (safe % 60).toFixed(1).padStart(4, '0');
            return `${minutes}:${remainder}`;
        }
        handleAudioKeyboard(event) {
            if (editable(event.target) || !document.getElementById('demo').contains(document.activeElement) && !document.body.classList.contains('focus-mode')) return;
            if (document.body.classList.contains('focus-mode') && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) return;
            if (event.code === 'Space') { event.preventDefault(); this.togglePlay(); }
            if (event.key.toLowerCase() === 'a') { event.preventDefault(); this.setTrack(this.activeTrack === 'original' ? 'regenerated' : 'original', true); }
            if (event.key.toLowerCase() === 'l') { event.preventDefault(); this.toggleLoop(); }
            if (['1', '2', '3'].includes(event.key)) this.setTrack(['original', 'masked', 'regenerated'][Number(event.key) - 1], true);
            if (!document.body.classList.contains('focus-mode') && event.key === 'ArrowLeft') { event.preventDefault(); this.seekAll(this.activeAudio().currentTime - 2); }
            if (!document.body.classList.contains('focus-mode') && event.key === 'ArrowRight') { event.preventDefault(); this.seekAll(this.activeAudio().currentTime + 2); }
        }
        refreshLanguage() {
            if (!this.sample) return;
            this.populateCandidates();
            this.populateRegions();
            this.renderProvenance();
            this.updatePlayButton(!this.activeAudio().paused);
            this.loopButton.textContent = t(this.loopEnabled ? 'demo.loopOff' : 'demo.loopOn');
        }
    }

    const demo = new VerifiedDemo();
    window.MAIADemo = demo;
    window.addEventListener('maia:languagechange', () => { updateFocusUi(); demo.refreshLanguage(); });
    window.MAIAI18n.ready.then(() => {
        updateFocusUi();
        demo.initialize();
    }).catch((error) => console.error(error));

    document.getElementById('copy-citation').addEventListener('click', async () => {
        const text = document.getElementById('citation-text').textContent;
        try {
            await navigator.clipboard.writeText(text);
            const button = document.getElementById('copy-citation');
            button.textContent = t('resources.copied');
            window.setTimeout(() => { button.textContent = t('resources.copy'); }, 1800);
        } catch (error) { console.error(error); }
    });
})();
