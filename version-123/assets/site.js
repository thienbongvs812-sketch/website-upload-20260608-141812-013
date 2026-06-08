(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    ready(function () {
        var toggle = document.querySelector('.nav-toggle');
        if (toggle) {
            toggle.addEventListener('click', function () {
                var opened = document.body.classList.toggle('nav-open');
                toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
            });
        }

        document.querySelectorAll('[data-hero]').forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === index);
                });
            }

            function play() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5600);
            }

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot') || 0));
                    play();
                });
            });

            if (prev) {
                prev.addEventListener('click', function () {
                    show(index - 1);
                    play();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    play();
                });
            }

            show(0);
            play();
        });

        document.querySelectorAll('[data-filter-list]').forEach(function (list) {
            var root = list.closest('main') || document;
            var input = root.querySelector('[data-filter-input]');
            var region = root.querySelector('[data-filter-region]');
            var type = root.querySelector('[data-filter-type]');
            var year = root.querySelector('[data-filter-year]');
            var sort = root.querySelector('[data-sort-select]');
            var count = root.querySelector('[data-filter-count]');
            var empty = root.querySelector('[data-empty-state]');
            var cards = Array.prototype.slice.call(list.querySelectorAll('.filter-card'));

            function text(card) {
                return [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-keywords')
                ].join(' ').toLowerCase();
            }

            function applySort(visibleCards) {
                var value = sort ? sort.value : 'default';
                var sorted = visibleCards.slice();
                if (value === 'popular') {
                    sorted.sort(function (a, b) {
                        return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
                    });
                } else if (value === 'latest') {
                    sorted.sort(function (a, b) {
                        return Number((b.getAttribute('data-year') || '').match(/\d{4}/)) - Number((a.getAttribute('data-year') || '').match(/\d{4}/));
                    });
                } else {
                    sorted.sort(function (a, b) {
                        return Number(a.getAttribute('data-index') || 0) - Number(b.getAttribute('data-index') || 0);
                    });
                }
                sorted.forEach(function (card) {
                    list.appendChild(card);
                });
            }

            function update() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var selectedRegion = region ? region.value : '';
                var selectedType = type ? type.value : '';
                var selectedYear = year ? year.value : '';
                var visible = [];

                cards.forEach(function (card) {
                    var matched = true;
                    if (query && text(card).indexOf(query) === -1) {
                        matched = false;
                    }
                    if (selectedRegion && card.getAttribute('data-region') !== selectedRegion) {
                        matched = false;
                    }
                    if (selectedType && card.getAttribute('data-type') !== selectedType) {
                        matched = false;
                    }
                    if (selectedYear && card.getAttribute('data-year') !== selectedYear) {
                        matched = false;
                    }
                    card.classList.toggle('is-hidden', !matched);
                    if (matched) {
                        visible.push(card);
                    }
                });

                applySort(visible);

                if (count) {
                    count.textContent = '当前显示 ' + visible.length + ' 部影片';
                }
                if (empty) {
                    empty.classList.toggle('is-visible', visible.length === 0);
                }
            }

            [input, region, type, year, sort].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', update);
                    control.addEventListener('change', update);
                }
            });

            update();
        });
    });
})();
