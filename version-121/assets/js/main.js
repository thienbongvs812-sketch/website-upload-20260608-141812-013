(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    function normalize(text) {
        return (text || '').toString().trim().toLowerCase();
    }

    var input = document.querySelector('[data-search-input]');
    var list = document.querySelector('[data-card-list]');
    var select = document.querySelector('[data-sort-select]');

    function cards() {
        if (!list) {
            return [];
        }

        return Array.prototype.slice.call(list.querySelectorAll('[data-search-card]'));
    }

    function applySearch() {
        if (!input) {
            return;
        }

        var keyword = normalize(input.value);

        cards().forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search'));
            var title = normalize(card.getAttribute('data-title'));
            card.hidden = keyword.length > 0 && haystack.indexOf(keyword) === -1 && title.indexOf(keyword) === -1;
        });
    }

    function applySort() {
        if (!select || !list) {
            return;
        }

        var mode = select.value;
        var sorted = cards().slice();

        sorted.sort(function (a, b) {
            if (mode === 'year-desc') {
                return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
            }

            if (mode === 'views-desc') {
                return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
            }

            if (mode === 'title-asc') {
                return normalize(a.getAttribute('data-title')).localeCompare(normalize(b.getAttribute('data-title')), 'zh-Hans-CN');
            }

            return 0;
        });

        sorted.forEach(function (card) {
            list.appendChild(card);
        });
    }

    if (input) {
        input.addEventListener('input', applySearch);
    }

    if (select) {
        select.addEventListener('change', function () {
            applySort();
            applySearch();
        });
    }
})();
