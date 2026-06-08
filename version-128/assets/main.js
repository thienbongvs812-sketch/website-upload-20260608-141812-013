document.addEventListener("DOMContentLoaded", function () {
    initMobileNavigation();
    initSearchForms();
    initHero();
    initBackTop();
    initFilter();
    initSearchPage();
});

function initMobileNavigation() {
    const toggle = document.querySelector("[data-mobile-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
        return;
    }

    toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
        toggle.textContent = panel.classList.contains("is-open") ? "×" : "☰";
    });
}

function initSearchForms() {
    document.querySelectorAll("[data-site-search]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const input = form.querySelector("input[name='q']");
            const value = input ? input.value.trim() : "";
            const url = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
            window.location.href = url;
        });
    });
}

function initHero() {
    const hero = document.querySelector("[data-hero]");

    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const previous = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

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
        }
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            show(Number(dot.getAttribute("data-hero-dot")));
            start();
        });
    });

    if (previous) {
        previous.addEventListener("click", function () {
            show(index - 1);
            start();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            show(index + 1);
            start();
        });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
}

function initBackTop() {
    const button = document.querySelector("[data-back-top]");

    if (!button) {
        return;
    }

    window.addEventListener("scroll", function () {
        button.classList.toggle("is-visible", window.scrollY > 420);
    });

    button.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

function initFilter() {
    const input = document.querySelector("[data-filter-input]");
    const grid = document.querySelector("[data-filter-grid]");

    if (!input || !grid) {
        return;
    }

    const cards = Array.from(grid.querySelectorAll(".movie-card"));

    input.addEventListener("input", function () {
        const value = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
            const text = [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-genre")
            ].join(" ").toLowerCase();
            card.hidden = Boolean(value) && !text.includes(value);
        });
    });
}

function initSearchPage() {
    const page = document.querySelector("[data-search-page]");

    if (!page || !window.SEARCH_MOVIES) {
        return;
    }

    const form = page.querySelector("[data-search-page-form]");
    const input = form ? form.querySelector("input[name='q']") : null;
    const resultsSection = page.querySelector("[data-search-results-section]");
    const defaultSection = page.querySelector("[data-search-default]");
    const resultsGrid = page.querySelector("[data-search-results]");
    const title = page.querySelector("[data-search-title]");
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";

    if (input) {
        input.value = initialQuery;
    }

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const query = input ? input.value.trim() : "";
            window.history.replaceState(null, "", query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html");
            renderSearch(query);
        });
    }

    if (initialQuery) {
        renderSearch(initialQuery);
    }

    function renderSearch(query) {
        const value = query.trim().toLowerCase();

        if (!value) {
            if (resultsSection) {
                resultsSection.hidden = true;
            }
            if (defaultSection) {
                defaultSection.hidden = false;
            }
            if (resultsGrid) {
                resultsGrid.innerHTML = "";
            }
            return;
        }

        const matched = window.SEARCH_MOVIES.filter(function (movie) {
            return [
                movie.title,
                movie.region,
                movie.year,
                movie.type,
                movie.genre,
                movie.tags,
                movie.oneLine
            ].join(" ").toLowerCase().includes(value);
        }).slice(0, 96);

        if (title) {
            title.textContent = "搜索结果：" + query;
        }
        if (resultsGrid) {
            resultsGrid.innerHTML = matched.map(renderCard).join("");
        }
        if (resultsSection) {
            resultsSection.hidden = false;
        }
        if (defaultSection) {
            defaultSection.hidden = true;
        }
    }

    function renderCard(movie) {
        const tags = movie.genre.split(/[，,、/]+/).filter(Boolean).slice(0, 2).map(function (tag) {
            return "<span>" + escapeHTML(tag) + "</span>";
        }).join("");

        return "<a class=\"movie-card\" href=\"./" + escapeHTML(movie.url) + "\">" +
            "<span class=\"card-poster\">" +
            "<img src=\"" + escapeHTML(movie.cover) + "\" alt=\"" + escapeHTML(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"card-overlay\"><span class=\"play-dot\">▶</span></span>" +
            "<span class=\"rating-badge\">★ " + escapeHTML(movie.rating) + "</span>" +
            "</span>" +
            "<span class=\"card-body\">" +
            "<strong>" + escapeHTML(movie.title) + "</strong>" +
            "<span class=\"card-meta\"><span>" + escapeHTML(String(movie.year)) + "年</span><span>" + escapeHTML(movie.region) + "</span></span>" +
            "<span class=\"card-tags\">" + tags + "</span>" +
            "</span>" +
            "</a>";
    }

    function escapeHTML(value) {
        return String(value).replace(/[&<>'"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                "\"": "&quot;"
            }[char];
        });
    }
}
