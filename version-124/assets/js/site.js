(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function initNavigation() {
    var button = document.querySelector(".nav-toggle");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    if (!slides.length) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var next = document.querySelector("[data-hero-next]");
    var prev = document.querySelector("[data-hero-prev]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initFilters() {
    var input = document.querySelector("[data-filter-search]");
    var region = document.querySelector("[data-filter-region]");
    var type = document.querySelector("[data-filter-type]");
    var year = document.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty]");

    if (!cards.length || (!input && !region && !type && !year)) {
      return;
    }

    function update() {
      var query = normalize(input && input.value);
      var selectedRegion = normalize(region && region.value);
      var selectedType = normalize(type && type.value);
      var selectedYear = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.tags
        ].join(" "));
        var ok = true;

        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }
        if (selectedRegion && normalize(card.dataset.region) !== selectedRegion) {
          ok = false;
        }
        if (selectedType && normalize(card.dataset.type) !== selectedType) {
          ok = false;
        }
        if (selectedYear && normalize(card.dataset.year) !== selectedYear) {
          ok = false;
        }

        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", update);
        control.addEventListener("change", update);
      }
    });

    update();
  }

  window.initializeMoviePlayer = function (address) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("play-overlay");
    var hls = null;
    var attached = false;

    if (!video || !address) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = address;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(address);
        hls.attachMedia(video);
        return;
      }

      video.src = address;
    }

    function start() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
  });
}());
