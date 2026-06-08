(function () {
    function loadLocalHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        return import('./hls-vendor-dru42stk.js')
            .then(function (module) {
                window.Hls = module.H;
                return module.H;
            })
            .catch(function () {
                return window.Hls || null;
            });
    }

    function initPlayer(card) {
        var video = card.querySelector('video');
        var button = card.querySelector('[data-play-button]');
        var url = card.getAttribute('data-video-url');
        var instance = null;
        var initialized = false;

        if (!video || !url) {
            return;
        }

        function setPlaying() {
            card.classList.add('is-playing');
        }

        function attachAndPlay() {
            if (initialized) {
                video.play().then(setPlaying).catch(setPlaying);
                return;
            }

            initialized = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                video.play().then(setPlaying).catch(setPlaying);
                return;
            }

            loadLocalHls().then(function (Hls) {
                if (Hls && Hls.isSupported()) {
                    instance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    instance.loadSource(url);
                    instance.attachMedia(video);
                    instance.on(Hls.Events.MANIFEST_PARSED, function () {
                        video.play().then(setPlaying).catch(setPlaying);
                    });
                    instance.on(Hls.Events.ERROR, function (_, data) {
                        if (data && data.fatal) {
                            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                                instance.startLoad();
                            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                                instance.recoverMediaError();
                            } else {
                                instance.destroy();
                            }
                        }
                    });
                } else {
                    video.src = url;
                    video.play().then(setPlaying).catch(setPlaying);
                }
            });
        }

        if (button) {
            button.addEventListener('click', attachAndPlay);
        }

        video.addEventListener('play', function () {
            if (!initialized) {
                attachAndPlay();
            }
            setPlaying();
        });

        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                card.classList.remove('is-playing');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (instance) {
                instance.destroy();
            }
        });
    }

    document.querySelectorAll('[data-player-card]').forEach(initPlayer);
})();
