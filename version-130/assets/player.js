(function () {
  function startPlayer(box) {
    var video = box.querySelector('video');
    var source = box.getAttribute('data-video');
    if (!video || !source) {
      return;
    }
    if (!video.getAttribute('src')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }
    video.controls = true;
    box.classList.add('is-playing');
    var playTask = video.play();
    if (playTask && playTask.catch) {
      playTask.catch(function () {});
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('.player-box'));
    boxes.forEach(function (box) {
      var cover = box.querySelector('.player-cover');
      var video = box.querySelector('video');
      if (cover) {
        cover.addEventListener('click', function () {
          startPlayer(box);
        });
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!video.getAttribute('src')) {
            startPlayer(box);
          }
        });
      }
    });
  });
})();
