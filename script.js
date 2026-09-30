document.addEventListener('DOMContentLoaded', () => {
  const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Navbar scroll */
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 30), { passive: true });

  /* Mobile toggle */
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    const s = toggle.querySelectorAll('span');
    s[0].style.transform = open ? 'rotate(45deg) translate(5px,5px)' : '';
    s[1].style.opacity   = open ? '0' : '1';
    s[2].style.transform = open ? 'rotate(-45deg) translate(5px,-5px)' : '';
  });
  document.addEventListener('click', e => {
    if (!nav.contains(e.target)) { menu.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); }
  });

  /* Dropdown toggle (tap on mobile, keyboard everywhere) */
  document.querySelectorAll('.navbar__link--caret').forEach(link => {
    link.addEventListener('click', e => {
      if (menu.classList.contains('open')) {
        e.preventDefault();
        const exp = link.getAttribute('aria-expanded') === 'true';
        link.setAttribute('aria-expanded', !exp);
      }
    });
    link.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const exp = link.getAttribute('aria-expanded') === 'true';
        link.setAttribute('aria-expanded', !exp);
      }
      if (e.key === 'Escape') { link.setAttribute('aria-expanded','false'); link.focus(); }
    });
  });

  /* GSAP or fallback */
  if (!pref && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    [
      ['.a-fade',  { opacity:0, y:24 },  { opacity:1, y:0 }],
      ['.a-left',  { opacity:0, y:24 }, { opacity:1, y:0 }],
      ['.a-right', { opacity:0, y:24 },  { opacity:1, y:0 }],
      ['.a-scale', { opacity:0, scale:.94 }, { opacity:1, scale:1 }],
    ].forEach(([sel, from, to]) => {
      gsap.utils.toArray(sel).forEach((el, i) => {
        gsap.fromTo(el, from, { ...to, duration:.75, ease:'power3.out', delay:(i%4)*.1, scrollTrigger:{ trigger:el, start:'top 90%', toggleActions:'play none none none' }});
      });
    });
  } else {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.transition = pref ? 'none' : 'opacity .65s ease, transform .65s ease';
          e.target.style.opacity = '1';
          e.target.style.transform = 'none';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: .1 });
    document.querySelectorAll('.a-fade,.a-left,.a-right,.a-scale').forEach(el => obs.observe(el));
  }

  /* Smooth scroll */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      if (a.classList.contains('navbar__link--caret') && menu.classList.contains('open')) return;
      const id = a.getAttribute('href');
      if (id === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: pref ? 'auto' : 'smooth' });
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        return;
      }
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        target.scrollIntoView({ behavior: pref ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });

  /* Formulário de contato -> abre e-mail com os dados preenchidos */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(form);
      const nome = data.get('nome') || '';
      const empresa = data.get('empresa') || '';
      const cargo = data.get('cargo') || '';
      const email = data.get('email') || '';
      const telefone = data.get('telefone') || '';
      const necessidade = data.get('necessidade') || '';
      const mensagem = data.get('mensagem') || '';

      const subject = `Solicitação de Diagnóstico — ${empresa || nome}`;
      const body =
        `Nome: ${nome}\n` +
        `Empresa: ${empresa}\n` +
        `Cargo: ${cargo}\n` +
        `E-mail: ${email}\n` +
        `Telefone/WhatsApp: ${telefone}\n` +
        `Necessidade: ${necessidade}\n\n` +
        `Mensagem:\n${mensagem}`;

      window.location.href = `mailto:contato@btconsultoria.com.br?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }
});
