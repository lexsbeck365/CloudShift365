/* =========================================================
   CloudShift365 — main.js
   ========================================================= */

// ---- Nav scroll behavior ----
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ---- Mobile nav toggle ----
navToggle.addEventListener('click', () => {
  const isOpen = navToggle.classList.toggle('open');
  navLinks.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// ---- Scroll reveal (observer runs immediately — classes already in HTML) ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ---- Smooth scroll for anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ---- Contact form ----
const FORMSPREE_ID = 'xkoqaqbr'; // Replace with your Formspree form ID

const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const formBtnText = document.getElementById('formBtnText');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    formBtnText.textContent = 'Sending\u2026';
    submitBtn.disabled = true;
    formSuccess.classList.remove('visible', 'error');

    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(contactForm)
      });

      if (response.ok) {
        formSuccess.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg> Message sent! We\u2019ll be in touch within one business day.';
        formSuccess.classList.add('visible');
        contactForm.reset();
        setTimeout(() => formSuccess.classList.remove('visible'), 6000);
      } else {
        const data = await response.json();
        const msg = data.errors ? data.errors.map(e => e.message).join(', ') : 'Submission failed. Please try again.';
        formSuccess.textContent = msg;
        formSuccess.classList.add('visible', 'error');
      }
    } catch {
      formSuccess.textContent = 'Network error. Please check your connection and try again.';
      formSuccess.classList.add('visible', 'error');
    } finally {
      formBtnText.textContent = 'Send Message';
      submitBtn.disabled = false;
    }
  });
}

// ---- Subtle parallax on hero orbs ----
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const orb1 = document.querySelector('.hero-orb-1');
  const orb2 = document.querySelector('.hero-orb-2');
  if (orb1) orb1.style.transform = 'translateY(' + (y * 0.12) + 'px)';
  if (orb2) orb2.style.transform = 'translateY(' + (y * -0.08) + 'px)';
}, { passive: true });

// ---- Active nav link highlighting on scroll ----
const navLinkEls = document.querySelectorAll('.nav-links a[href^="#"]');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinkEls.forEach(link => {
        link.style.color = link.getAttribute('href') === '#' + id
          ? 'white' : 'rgba(255,255,255,.75)';
      });
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

// ---- Mobile service card tap → detail bubble ----
const serviceModal = document.getElementById('serviceModal');
const serviceModalBackdrop = serviceModal.querySelector('.service-modal-backdrop');
const serviceModalClose = serviceModal.querySelector('.service-modal-close');
const serviceModalIcon = serviceModal.querySelector('.service-modal-icon');
const serviceModalTitle = serviceModal.querySelector('.service-modal-title');
const serviceModalDesc = serviceModal.querySelector('.service-modal-desc');
const serviceModalFeatures = serviceModal.querySelector('.service-modal-features');
const serviceModalLink = serviceModal.querySelector('.service-modal-link');

function openServiceModal(card) {
  const iconEl = card.querySelector('.service-icon');
  serviceModalIcon.innerHTML = iconEl ? iconEl.innerHTML : '';

  serviceModalTitle.textContent = card.querySelector('h3').textContent;
  serviceModalDesc.textContent = card.querySelector('p').textContent;

  serviceModalFeatures.innerHTML = '';
  card.querySelectorAll('.service-features li').forEach(li => {
    const newLi = document.createElement('li');
    newLi.innerHTML = li.innerHTML;
    serviceModalFeatures.appendChild(newLi);
  });

  serviceModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeServiceModal() {
  serviceModal.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('click', () => openServiceModal(card));
});

serviceModalBackdrop.addEventListener('click', closeServiceModal);
serviceModalClose.addEventListener('click', closeServiceModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeServiceModal(); });

// Close modal if user taps the "Get a quote" link (smooth scroll handles the rest)
serviceModalLink.addEventListener('click', closeServiceModal);
