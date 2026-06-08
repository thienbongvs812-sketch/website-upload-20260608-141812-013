(function () {
    var mobileButton = document.querySelector('[data-mobile-menu]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    document.querySelectorAll('.poster-img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('is-hidden');
        });
    });

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        start();
    }

    document.querySelectorAll('[data-filter-box]').forEach(function (box) {
        var section = box.closest('section') || document;
        var grid = section.querySelector('[data-search-grid]');
        var input = box.querySelector('[data-search-input]');
        var year = box.querySelector('[data-year-filter]');
        var type = box.querySelector('[data-type-filter]');
        var clear = box.querySelector('[data-clear-filter]');
        var status = box.querySelector('[data-filter-status]');
        var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.movie-card')) : [];

        function normalize(value) {
            return (value || '').toString().trim().toLowerCase();
        }

        function apply() {
            var keyword = normalize(input && input.value);
            var yearValue = normalize(year && year.value);
            var typeValue = normalize(type && type.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var okYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
                var okType = !typeValue || normalize(card.getAttribute('data-type')).indexOf(typeValue) !== -1;
                var ok = okKeyword && okYear && okType;
                card.classList.toggle('is-hidden', !ok);

                if (ok) {
                    visible += 1;
                }
            });

            if (status) {
                if (!keyword && !yearValue && !typeValue) {
                    status.textContent = '浏览影片卡片，点击封面进入详情页。';
                } else {
                    status.textContent = visible ? '已匹配到 ' + visible + ' 部影片。' : '没有匹配内容，请更换关键词或筛选条件。';
                }
            }
        }

        if (input) {
            input.addEventListener('input', apply);
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');

            if (query) {
                input.value = query;
            }
        }

        if (year) {
            year.addEventListener('change', apply);
        }

        if (type) {
            type.addEventListener('change', apply);
        }

        if (clear) {
            clear.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (year) {
                    year.value = '';
                }
                if (type) {
                    type.value = '';
                }
                apply();
            });
        }

        apply();
    });
})();
