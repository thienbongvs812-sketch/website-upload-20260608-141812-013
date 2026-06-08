function initMoviePlayer(streamUrl) {
    var video = document.getElementById('movie-player');
    var mask = document.querySelector('.player-mask');
    var hlsInstance = null;
    var isReady = false;

    if (!video || !streamUrl) {
        return;
    }

    function attachStream() {
        if (isReady) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }

        isReady = true;
    }

    function playVideo() {
        attachStream();

        if (mask) {
            mask.classList.add('is-hidden');
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    if (mask) {
        mask.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', function () {
        if (mask) {
            mask.classList.add('is-hidden');
        }
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
