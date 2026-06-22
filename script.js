/* =========================================================
   BARBEARIA ELITE - Scripts principais
   - Menu mobile
   - Header com efeito de scroll
   - Scroll suave
   - Animações ao rolar (IntersectionObserver)
   - Contadores animados
   - Validação do formulário de agendamento
   - Botão "voltar ao topo"
   - Ano automático no rodapé
   ========================================================= */

(function () {
  'use strict';

  /* ============== SELEÇÃO DE ELEMENTOS ============== */
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  const navLinks = nav ? nav.querySelectorAll('a') : [];
  const backToTopBtn = document.getElementById('backToTop');
  const yearSpan = document.getElementById('year');

  /* ============== OVERLAY DO MENU MOBILE ============== */
  // Cria dinamicamente o overlay escuro atrás do menu mobile
  const menuOverlay = document.createElement('div');
  menuOverlay.className = 'menu-overlay';
  document.body.appendChild(menuOverlay);

  /* ============== FUNÇÕES DO MENU MOBILE ============== */
  function openMenu() {
    nav.classList.add('open');
    menuToggle.classList.add('active');
    menuOverlay.classList.add('show');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    nav.classList.remove('open');
    menuToggle.classList.remove('active');
    menuOverlay.classList.remove('show');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    if (nav.classList.contains('open')) closeMenu();
    else openMenu();
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
  }

  // Fecha ao clicar em algum link do menu
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) closeMenu();
    });
  });

  // Fecha ao clicar no overlay
  menuOverlay.addEventListener('click', closeMenu);

  // Fecha com a tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) closeMenu();
  });

  /* ============== HEADER EFEITO DE SCROLL ============== */
  function handleHeaderScroll() {
    if (window.scrollY > 50) header.classList.add('scrolled');
    else header.classList.remove('scrolled');

    // Botão voltar ao topo
    if (backToTopBtn) {
      if (window.scrollY > 600) backToTopBtn.classList.add('show');
      else backToTopBtn.classList.remove('show');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });

  /* ============== SCROLL SUAVE PARA LINKS INTERNOS ============== */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const headerHeight = header ? header.offsetHeight : 0;
      const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;

      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    });
  });

  /* ============== BOTÃO VOLTAR AO TOPO ============== */
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============== ANIMAÇÕES AO ROLAR (REVEAL) ============== */
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback para navegadores antigos
    revealElements.forEach((el) => el.classList.add('active'));
  }

  /* ============== CONTADORES ANIMADOS ============== */
  const counters = document.querySelectorAll('.counter');

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const format = el.dataset.format || '';
    const duration = 1800; // ms
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Função de easing: easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);

      let displayValue;
      if (format === 'k' && value >= 1000) {
        displayValue = (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1) + 'k';
      } else {
        displayValue = value.toLocaleString('pt-BR');
      }

      el.textContent = displayValue + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Garante o valor final exato
        let finalValue;
        if (format === 'k' && target >= 1000) {
          finalValue = (target / 1000) + 'k';
        } else {
          finalValue = target.toLocaleString('pt-BR');
        }
        el.textContent = finalValue + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach((c) => counterObserver.observe(c));
  } else {
    counters.forEach((c) => animateCounter(c));
  }

  /* ============== FORMULÁRIO DE AGENDAMENTO ============== */
  const form = document.getElementById('agendamentoForm');
  const feedback = document.getElementById('formFeedback');

  if (form) {
    // Define a data mínima como hoje
    const dateInput = form.querySelector('#data');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }

    // Máscara simples para telefone: (99) 99999-9999
    const phoneInput = form.querySelector('#telefone');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 2) v = '(' + v.slice(0, 2) + ') ' + v.slice(2);
        if (v.length > 10) v = v.slice(0, 10) + '-' + v.slice(10);
        else if (v.length > 9) v = v.slice(0, 9) + '-' + v.slice(9);
        e.target.value = v;
      });
    }

    // Funções auxiliares de validação
    function setError(field, message) {
      const input = form.querySelector('#' + field);
      const errorSpan = form.querySelector('[data-error="' + field + '"]');
      if (input) input.classList.add('error');
      if (errorSpan) errorSpan.textContent = message;
    }

    function clearError(field) {
      const input = form.querySelector('#' + field);
      const errorSpan = form.querySelector('[data-error="' + field + '"]');
      if (input) input.classList.remove('error');
      if (errorSpan) errorSpan.textContent = '';
    }

    // Limpa erro ao digitar
    ['nome', 'telefone', 'servico', 'data'].forEach((field) => {
      const input = form.querySelector('#' + field);
      if (input) {
        input.addEventListener('input', () => clearError(field));
        input.addEventListener('change', () => clearError(field));
      }
    });

    // Validação no envio
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      const nome = form.nome.value.trim();
      const telefone = form.telefone.value.trim();
      const servico = form.servico.value;
      const data = form.data.value;

      // Nome: pelo menos 3 caracteres
      if (nome.length < 3) {
        setError('nome', 'Por favor, informe seu nome completo.');
        isValid = false;
      } else clearError('nome');

      // Telefone: 10 ou 11 dígitos
      const phoneDigits = telefone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        setError('telefone', 'Informe um telefone válido.');
        isValid = false;
      } else clearError('telefone');

      // Serviço
      if (!servico) {
        setError('servico', 'Selecione um serviço.');
        isValid = false;
      } else clearError('servico');

      // Data: não pode ser no passado
      if (!data) {
        setError('data', 'Selecione uma data.');
        isValid = false;
      } else {
        const selected = new Date(data + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selected < today) {
          setError('data', 'A data não pode ser no passado.');
          isValid = false;
        } else clearError('data');
      }

      if (!isValid) return;

      // Sucesso: mostra feedback e reseta o formulário
      if (feedback) {
        feedback.hidden = false;
        feedback.textContent = '✓ Agendamento enviado com sucesso! Em breve entraremos em contato pelo WhatsApp para confirmar.';
        feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
          feedback.hidden = true;
        }, 6000);
      }

      form.reset();
    });
  }

  /* ============== ANO AUTOMÁTICO NO RODAPÉ ============== */
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  /* ============== AJUSTE AO REDIMENSIONAR A JANELA ============== */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && nav.classList.contains('open')) {
      closeMenu();
    }
  });

})();
