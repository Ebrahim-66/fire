(function () {
  'use strict';

  function createEnquiryMailto(fields, language) {
    const ar = language === 'ar';
    const labels = ar
      ? { name: 'الاسم', company: 'الشركة', email: 'البريد الإلكتروني', phone: 'الهاتف', location: 'موقع المشروع', need: 'الخدمة المطلوبة', system: 'النظام', message: 'تفاصيل المشروع' }
      : { name: 'Name', company: 'Company', email: 'Email', phone: 'Phone', location: 'Project location', need: 'Service required', system: 'System', message: 'Project details' };
    const body = Object.keys(labels)
      .filter(key => fields[key] && String(fields[key]).trim())
      .map(key => labels[key] + ': ' + String(fields[key]).trim())
      .join('\n\n');
    const subject = (ar ? 'استفسار عن مشروع: ' : 'Project enquiry: ') + (fields.need || 'FIRECO');
    return 'mailto:info@firecots.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { createEnquiryMailto };
  if (typeof document === 'undefined') return;

  const arabic = document.documentElement.lang === 'ar';
  const menu = document.querySelector('.menu');
  const nav = document.querySelector('#main-nav');
  function closeMenu() {
    if (!menu || !nav) return;
    menu.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
  }
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const expanded = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(expanded));
      nav.classList.toggle('open', expanded);
    });
    nav.querySelectorAll('a').forEach(anchor => anchor.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        menu.focus();
      }
    });
  }

  const contentRoot = arabic ? '../' : '';
  const sectorNames = arabic ? {
    Healthcare: 'الرعاية الصحية', Government: 'الجهات الحكومية', 'Real estate': 'العقارات',
    Facilities: 'إدارة المرافق', Education: 'التعليم', Maintenance: 'الصيانة', Transport: 'النقل',
    Hospitality: 'الضيافة', Construction: 'الإنشاءات', Retail: 'التجزئة'
  } : {};

  function escapeText(value) {
    const node = document.createElement('span');
    node.textContent = value || '';
    return node.innerHTML;
  }

  async function loadManagedContent() {
    const grid = document.querySelector('#client-projects');
    if (grid) {
      try {
        const response = await fetch(contentRoot + 'data/clients.json', { cache: 'no-store' });
        if (!response.ok) throw new Error('Client data unavailable');
        const data = await response.json();
        if (Array.isArray(data.clients) && data.clients.length) {
          grid.innerHTML = data.clients.map(client => {
            const name = arabic && client.name_ar ? client.name_ar : client.name_en;
            const location = arabic && client.location_ar ? client.location_ar : client.location_en;
            const sectorLabel = sectorNames[client.sector] || client.sector;
            const language = arabic && client.name_ar ? 'ar' : 'en';
            const direction = language === 'ar' ? 'rtl' : 'ltr';
            return '<article class="project client-name-card" data-sector="' + escapeText(client.sector) + '">' +
              '<div class="project-content"><span class="eyebrow">' + escapeText(sectorLabel) + '</span>' +
              '<h3 lang="' + language + '" dir="' + direction + '">' + escapeText(name) + '</h3>' +
              (location ? '<p>' + escapeText(location) + '</p>' : '') + '</div></article>';
          }).join('');
        }
      } catch (_) {
        // The generated cards remain as a reliable fallback, including local file previews.
      }
    }
    try {
      const response = await fetch(contentRoot + 'data/settings.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Settings unavailable');
      const settings = await response.json();
      if (settings.profile_pdf) {
        document.querySelectorAll('[data-profile-pdf]').forEach(link => {
          link.href = contentRoot + String(settings.profile_pdf).replace(/^\//, '');
        });
      }
    } catch (_) {}
  }

  function setupProjects() {
    const cards = Array.from(document.querySelectorAll('.project[data-sector]'));
    const filters = Array.from(document.querySelectorAll('[data-filter]'));
    const count = document.querySelector('#projectcount');
    const more = document.querySelector('#moreprojects');
    if (!cards.length || !filters.length || !count || !more) return;
    let sector = 'All';
    let limit = 6;
    function renderProjects() {
      const matching = cards.filter(card => sector === 'All' || card.dataset.sector === sector);
      const shown = matching.slice(0, limit);
      const visible = new Set(shown);
      cards.forEach(card => { card.hidden = !visible.has(card); });
      count.textContent = arabic
        ? 'عرض ' + shown.length + ' من أصل ' + matching.length + ' مرجعًا'
        : 'Showing ' + shown.length + ' of ' + matching.length + ' references';
      more.hidden = shown.length >= matching.length;
      more.textContent = arabic
        ? 'تحميل المزيد (' + Math.max(0, matching.length - shown.length) + ')'
        : 'Load more (' + Math.max(0, matching.length - shown.length) + ')';
      filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter.dataset.filter === sector)));
    }
    filters.forEach(filter => filter.addEventListener('click', () => {
      sector = filter.dataset.filter;
      limit = 6;
      renderProjects();
    }));
    more.addEventListener('click', () => {
      limit += 6;
      renderProjects();
    });
    renderProjects();
  }

  if (typeof fetch === 'function' && (!window.location || window.location.protocol !== 'file:')) {
    loadManagedContent().then(setupProjects);
  } else {
    setupProjects();
  }

  const form = document.querySelector('#enquiry');
  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(form).entries());
    window.location.href = createEnquiryMailto(fields, arabic ? 'ar' : 'en');
  });

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const counters = Array.from(document.querySelectorAll('[data-count]'));
  if (!reducedMotion && 'IntersectionObserver' in window && window.requestAnimationFrame && counters.length) {
    const formatter = new Intl.NumberFormat('en-US');
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const target = Number(element.dataset.count);
        const suffix = element.dataset.suffix || '';
        counterObserver.unobserve(element);
        if (!Number.isFinite(target) || target < 0) return;
        let started;
        function tick(now) {
          if (started === undefined) started = now;
          const progress = Math.min(1, (now - started) / 1400);
          const value = Math.round(target * (1 - Math.pow(1 - progress, 3)));
          element.textContent = formatter.format(value) + suffix;
          if (progress < 1) window.requestAnimationFrame(tick);
        }
        window.requestAnimationFrame(tick);
      });
    }, { threshold: 0.25 });
    counters.forEach(element => counterObserver.observe(element));
  }
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.section-heading, .service-card, .system-card, .about-grid, .about-pillars article, .quality-card, .project, .rating-grid, .contact-copy, .office-card, .service-actions article').forEach((element, index) => {
      element.classList.add('reveal');
      element.style.setProperty('--reveal-delay', (index % 3) * 60 + 'ms');
      observer.observe(element);
    });
  }
}());
