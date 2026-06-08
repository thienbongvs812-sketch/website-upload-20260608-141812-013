(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var next = carousel.querySelector("[data-hero-next]");
        var prev = carousel.querySelector("[data-hero-prev]");
        if (!slides.length) {
            return;
        }
        var index = Math.max(0, slides.findIndex(function (slide) {
            return slide.classList.contains("is-active");
        }));
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

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(index);
        start();
    }

    function setupPlayer() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".js-player"));
        players.forEach(function (player) {
            var video = player.querySelector("video[data-source]");
            var button = player.querySelector(".js-player-toggle");
            if (!video) {
                return;
            }
            var source = video.getAttribute("data-source");
            var hlsInstance = null;
            var attached = false;

            function attachSource() {
                if (attached || !source) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            function play() {
                attachSource();
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            function toggle() {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            }

            if (button) {
                button.addEventListener("click", toggle);
            }
            video.addEventListener("click", toggle);
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                player.classList.remove("is-playing");
            });
            video.addEventListener("ended", function () {
                player.classList.remove("is-playing");
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    function setupSearchPage() {
        var container = document.getElementById("search-results");
        if (!container || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        var input = document.querySelector("[data-search-input]");
        var title = document.querySelector("[data-search-title]");
        if (input) {
            input.value = query;
        }
        if (!query) {
            return;
        }
        var normalized = query.toLowerCase();
        var results = window.MOVIE_SEARCH_DATA.filter(function (movie) {
            return movie.searchText.toLowerCase().indexOf(normalized) !== -1;
        }).slice(0, 240);
        if (title) {
            title.textContent = "搜索结果：" + query + "（" + results.length + "）";
        }
        if (!results.length) {
            container.innerHTML = '<div class="empty-state"><h2>没有找到相关影片</h2><p>可以更换关键词，或浏览全部片库与排行榜。</p><a class="primary-button" href="./library-1.html">进入片库</a></div>';
            return;
        }
        container.innerHTML = results.map(function (movie) {
            return '<article class="movie-card">' +
                '<a class="poster-link" href="./' + movie.file + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="poster-shade"></span>' +
                    '<span class="play-pill">立即观看</span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                    '<h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.year) + '</p>' +
                    '<p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="chip-row"><span class="chip">' + escapeHtml(movie.genre) + '</span></div>' +
                '</div>' +
            '</article>';
        }).join("");
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function setupBackTop() {
        var button = document.querySelector("[data-back-top]");
        if (!button) {
            return;
        }
        function update() {
            button.classList.toggle("is-visible", window.scrollY > 500);
        }
        button.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
        window.addEventListener("scroll", update, { passive: true });
        update();
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupPlayer();
        setupSearchPage();
        setupBackTop();
    });
})();
