(function () {
    window.setupMoviePlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var trigger = document.getElementById(options.triggerId);
        var source = options.source;
        var hls = null;

        if (!video || !trigger || !source) {
            return;
        }

        function attach() {
            if (video.getAttribute('data-ready') === '1') {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            }

            video.setAttribute('data-ready', '1');
        }

        function start() {
            attach();
            trigger.classList.add('is-hidden');
            var played = video.play();
            if (played && typeof played.catch === 'function') {
                played.catch(function () {});
            }
        }

        trigger.addEventListener('click', start);

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener('play', function () {
            trigger.classList.add('is-hidden');
        });

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
})();
