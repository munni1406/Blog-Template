// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Reading time on post pages
  var article = document.querySelector('article#post');
  if (article) {
    var words = article.innerText.trim().split(/\s+/).length;
    var minutes = Math.max(1, Math.round(words / 200));
    var rtHolder = document.querySelector('.js-reading-time');
    if (rtHolder) { rtHolder.textContent = String(minutes); }
  }
});

