document.addEventListener("DOMContentLoaded", function () {
  var form = document.querySelector(".search-form-wide");
  var input = document.querySelector("#searchInput");
  var resultBox = document.querySelector("#searchResults");
  var params = new URLSearchParams(window.location.search);
  var firstQuery = params.get("q") || "";

  function safeText(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function render(items) {
    if (!resultBox) {
      return;
    }

    if (!items.length) {
      resultBox.innerHTML = '<div class="info-panel"><h2>未找到匹配内容</h2><p>可以尝试输入影片名称、年份、地区或题材关键词。</p></div>';
      return;
    }

    resultBox.innerHTML = items.slice(0, 120).map(function (item) {
      return [
        '<article class="movie-card">',
        '  <a class="movie-poster" href="' + safeText(item.url) + '">',
        '    <img src="./' + safeText(item.poster) + '" alt="' + safeText(item.title) + '" loading="lazy">',
        '    <span class="play-chip">立即播放</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="card-meta"><span>' + safeText(item.year) + '</span><span>' + safeText(item.region) + '</span><span>' + safeText(item.category) + '</span></div>',
        '    <h3><a href="' + safeText(item.url) + '">' + safeText(item.title) + '</a></h3>',
        '    <p>' + safeText(item.oneLine) + '</p>',
        '    <div class="tag-line"><span>' + safeText(item.genre) + '</span></div>',
        '  </div>',
        '</article>'
      ].join("");
    }).join("");
  }

  function search(query) {
    var words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

    if (!words.length) {
      render(SITE_SEARCH_DATA.slice(0, 60));
      return;
    }

    var items = SITE_SEARCH_DATA.filter(function (item) {
      var haystack = [
        item.title,
        item.year,
        item.region,
        item.category,
        item.genre,
        item.oneLine
      ].join(" ").toLowerCase();

      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    });

    render(items);
  }

  if (input) {
    input.value = firstQuery;
    search(firstQuery);
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var value = input ? input.value : "";
      var nextUrl = value.trim() ? "search.html?q=" + encodeURIComponent(value.trim()) : "search.html";
      window.history.replaceState(null, "", nextUrl);
      search(value);
    });
  }
});
