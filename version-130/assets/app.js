(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('.menu-toggle');
    var panel = qs('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
      button.textContent = panel.classList.contains('open') ? '×' : '☰';
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    var prev = qs('.hero-arrow.prev', hero);
    var next = qs('.hero-arrow.next', hero);
    var index = 0;
    var timer;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-index') || 0));
        restart();
      });
    });
    show(0);
    restart();
  }

  function initRails() {
    qsa('.rail-buttons').forEach(function (group) {
      var section = group.closest('.content-section');
      var rail = section ? qs('.rail-list', section) : null;
      if (!rail) {
        return;
      }
      qsa('.rail-control', group).forEach(function (button) {
        button.addEventListener('click', function () {
          var direction = button.getAttribute('data-direction') === 'left' ? -1 : 1;
          rail.scrollBy({ left: direction * 420, behavior: 'smooth' });
        });
      });
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    qsa('[data-filter-form]').forEach(function (form) {
      var scope = form.closest('[data-search-scope]') || document;
      var cards = qsa('.movie-card', scope);
      var input = qs('.filter-input', form);
      var typeSelect = qs('.type-filter', form);
      var yearSelect = qs('.year-filter', form);
      var empty = qs('.empty-result', scope) || qs('.empty-result');

      function apply() {
        var keyword = normalize(input ? input.value : '');
        var type = normalize(typeSelect ? typeSelect.value : '');
        var year = normalize(yearSelect ? yearSelect.value : '');
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-keywords'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-region')
          ].join(' '));
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesType = !type || normalize(card.getAttribute('data-type')) === type;
          var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
          var ok = matchesKeyword && matchesType && matchesYear;
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (typeSelect) {
        typeSelect.addEventListener('change', apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', apply);
      }
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && input) {
        input.value = q;
        apply();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initRails();
    initFilters();
  });
})();
