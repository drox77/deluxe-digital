// New work = one more line here. Screenshot goes to /works (720×864, top of the homepage);
// without `image` the card falls back to a plain gradient.
const projects = [
  { title: 'Цветочный магазин', url: 'https://flowersyasenevo.vercel.app', image: 'works/flowers.webp' },
  { title: 'ReCode Studio', url: 'https://recodestudio.ru', image: 'works/recode.webp' },
  { title: 'Студия маникюра', url: 'https://nails-nine-neon.vercel.app', image: 'works/nails.webp' },
];

const MAX_GRID = 3;
const desktop = window.matchMedia('(min-width: 960px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* menu */

const burger = document.querySelector('.burger');
const nav = document.getElementById('nav');

function setMenu(open) {
  nav.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
}

burger.addEventListener('click', () => {
  setMenu(burger.getAttribute('aria-expanded') !== 'true');
});

nav.addEventListener('click', (e) => {
  if (e.target.closest('a')) setMenu(false);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('is-open')) {
    setMenu(false);
    burger.focus();
  }
});

desktop.addEventListener('change', () => setMenu(false));

/* portfolio */

const section = document.getElementById('works');
const track = document.getElementById('works-track');
const dotsBox = document.getElementById('works-dots');

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function preview(project, domain, i) {
  if (project.image) {
    return `<img src="${escapeHtml(project.image)}" alt="Главная страница сайта ${escapeHtml(project.title)}" loading="lazy" decoding="async" width="720" height="864">`;
  }
  // spread hues so neighbouring placeholders don't look identical
  const hue = 262 + ((i * 37) % 80) - 20;
  const gx = 25 + ((i * 29) % 50);
  return `
    <div class="mock" style="--hue:${hue};--gx:${gx}%" aria-hidden="true">
      <div class="mock__bar"><i></i><i></i><i></i><span class="mock__url">${domain}</span></div>
    </div>`;
}

function renderWorks() {
  track.innerHTML = projects
    .map((p, i) => {
      const domain = escapeHtml(new URL(p.url).hostname);
      const title = escapeHtml(p.title);
      return `
        <li class="work">
          <article class="work__card">
            <div class="work__preview">${preview(p, domain, i)}</div>
            <div class="work__body">
              <h3 class="work__title">${title}</h3>
              <p class="work__domain">${domain}</p>
              <a class="btn btn--ghost work__link" href="${escapeHtml(p.url)}" target="_blank" rel="noopener"
                 aria-label="Открыть сайт ${title} в новой вкладке">
                Открыть сайт
                <svg class="icon" aria-hidden="true"><use href="#i-external-link"/></svg>
              </a>
            </div>
          </article>
        </li>`;
    })
    .join('');

  dotsBox.innerHTML = projects
    .map((p, i) => `<button class="works__dot" type="button" aria-label="Работа ${i + 1}: ${escapeHtml(p.title)}"></button>`)
    .join('');
}

renderWorks();

const cards = [...track.children];
const dots = [...dotsBox.children];
let active = -1;

function setActive(index) {
  if (index === active) return;
  active = index;
  cards.forEach((c, i) => c.classList.toggle('is-active', i === index));
  dots.forEach((d, i) => d.setAttribute('aria-current', String(i === index)));
}

function nearestToCenter() {
  const box = track.getBoundingClientRect();
  const center = box.left + box.width / 2;
  let best = 0;
  let bestDist = Infinity;
  cards.forEach((c, i) => {
    const r = c.getBoundingClientRect();
    const dist = Math.abs(r.left + r.width / 2 - center);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  });
  return best;
}

let ticking = false;
track.addEventListener(
  'scroll',
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      setActive(nearestToCenter());
      ticking = false;
    });
  },
  { passive: true }
);

function scrollToCard(i) {
  const card = cards[i];
  const left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
  track.scrollTo({ left, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
}

dots.forEach((dot, i) => dot.addEventListener('click', () => scrollToCard(i)));

// keyboard users tabbing through links should land on a centred card
track.addEventListener('focusin', (e) => {
  if (!section.classList.contains('works--carousel')) return;
  const i = cards.indexOf(e.target.closest('.work'));
  if (i > -1) scrollToCard(i);
});

function updateLayout() {
  const carousel = projects.length > MAX_GRID || !desktop.matches;
  section.classList.toggle('works--carousel', carousel);
  section.classList.toggle('works--grid', !carousel);
  dotsBox.hidden = !carousel;
  if (carousel) {
    active = -1;
    setActive(nearestToCenter());
  } else {
    cards.forEach((c) => c.classList.remove('is-active'));
  }
}

desktop.addEventListener('change', updateLayout);
updateLayout();

/* reveal on scroll */

const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
  );
  revealItems.forEach((el) => io.observe(el));
} else {
  revealItems.forEach((el) => el.classList.add('is-visible'));
}
