import { H as Hls } from "./hls.js";

export function setupPlayer(video, trigger, cover, source) {
    let hls = null;
    let attached = false;

    function attach() {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        }
    }

    function start() {
        attach();

        if (cover) {
            cover.classList.add("is-hidden");
        }

        const playRequest = video.play();

        if (playRequest && typeof playRequest.catch === "function") {
            playRequest.catch(function () {});
        }
    }

    if (trigger) {
        trigger.addEventListener("click", start);
    }

    if (cover) {
        cover.addEventListener("click", start);
    }

    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
