// Налаштування сайту. Тут змінюються лише ці два рядки.
const TELEGRAM = 'ilyakosenko';   // акаунт для кнопок і заявок (без @)
const FORM_ENDPOINT = '';         // адреса, яка прийматиме заявки; поки порожньо, заявка йде через Telegram

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('[data-tg]').forEach(a => { a.href = `https://t.me/${TELEGRAM}`; });

// Ролики вмикаються, лише коли підходять до екрана: браузер не тягне всі дев'ять одразу.
// На першому екрані вони грають самі, без звуку. Хто вимкнув анімацію в системі, вмикає їх сам.
const players = new IntersectionObserver(entries => {
  entries.forEach(({ target: f, isIntersecting }) => {
    if (!isIntersecting) return f.removeAttribute('src');
    const play = 'autoplay' in f.dataset && !reduced ? '&autoplay=1&muted=1&loop=1&controls=0' : '';
    f.src = `https://www.tiktok.com/player/v1/${f.dataset.id}?rel=0&description=0&music_info=0${play}`;
  });
}, { rootMargin: '300px 0px' });
document.querySelectorAll('iframe[data-id]').forEach(f => players.observe(f));

// Форма заявки
const form = document.querySelector('#lead');
const result = document.querySelector('#lead-result');

form.addEventListener('submit', async e => {
  e.preventDefault();
  let first;
  form.querySelectorAll('input').forEach(i => {
    const bad = !i.value.trim();
    i.setAttribute('aria-invalid', bad);
    if (bad && !first) first = i;
  });
  if (first) return first.focus();

  const lead = Object.fromEntries(new FormData(form));
  result.hidden = false;

  if (FORM_ENDPOINT) {
    try {
      const r = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) });
      if (!r.ok) throw new Error(r.status);
      form.reset();
      result.textContent = 'Дякуємо! Заявку отримали.';
    } catch {
      result.textContent = 'Не вдалося надіслати заявку. Спробуйте ще раз або напишіть нам у Telegram.';
    }
    return;
  }

  const text = `Заявка на концепцію\nІм'я: ${lead.name}\nКонтакт: ${lead.contact}\nСоцмережі: ${lead.link}`;
  window.open(`https://t.me/${TELEGRAM}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  result.textContent = 'Відкрили Telegram із готовим повідомленням. Залишилось натиснути «Надіслати».';
});

form.addEventListener('input', e => {
  if (e.target.value.trim()) e.target.removeAttribute('aria-invalid');
});

// Чернетка: кнопка перескакує між місцями, де потрібна відповідь. Перед запуском видалити разом з кнопкою.
const pill = document.querySelector('.draft-pill');
if (pill) {
  const todos = [...document.querySelectorAll('.todo')];
  let i = -1;
  pill.textContent = `Чернетка: ${todos.length} уточнень. Показати наступне`;
  pill.addEventListener('click', () => {
    todos[i]?.classList.remove('is-current');
    i = (i + 1) % todos.length;
    const t = todos[i];
    const d = t.closest('details');
    if (d) d.open = true;
    t.classList.add('is-current');
    t.scrollIntoView({ block: 'center' });
  });
}
