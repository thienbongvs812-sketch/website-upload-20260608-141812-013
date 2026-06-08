(function () {
  function attachPlayer(shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector(".play-overlay");
    var source = shell.getAttribute("data-m3u8");
    var ready = false;

    if (!video || !source) {
      return;
    }

    function load() {
      if (ready) {
        return;
      }

      ready = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function play() {
      load();

      var attempt = video.play();

      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }

      if (button) {
        button.classList.add("hidden");
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("hidden");
      }
    });

    video.addEventListener("click", function () {
      load();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll(".video-shell")).forEach(attachPlayer);
  });
})();
