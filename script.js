const loader = document.querySelector('.loader');
const header = document.querySelector('.site-header');
const cursor = document.querySelector('.cursor');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isCoarse = window.matchMedia('(pointer: coarse)').matches;

const hideLoader = () => loader.classList.add('is-hidden');
document.addEventListener('DOMContentLoaded', () => window.setTimeout(hideLoader, 900), { once: true });
window.addEventListener('load', () => window.setTimeout(hideLoader, 350), { once: true });

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.13, rootMargin: '0px 0px -40px' });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

if (window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.style.opacity = '1';
  });

  document.querySelectorAll('a, button, [data-tilt]').forEach((el) => {
    el.addEventListener('pointerenter', () => cursor.classList.add('active'));
    el.addEventListener('pointerleave', () => cursor.classList.remove('active'));
  });
}

if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    const original = getComputedStyle(card).transform;
    card.addEventListener('pointermove', (event) => {
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - .5;
      const y = (event.clientY - box.top) / box.height - .5;
      card.style.transform = `${original === 'none' ? '' : original} perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  const pauseImage = document.querySelector('.pause-image');
  window.addEventListener('scroll', () => {
    const section = document.querySelector('.pause-section').getBoundingClientRect();
    if (section.top < innerHeight && section.bottom > 0) {
      const progress = (innerHeight - section.top) / (innerHeight + section.height);
      pauseImage.style.transform = `scale(1.08) translateY(${(progress - .5) * 45}px)`;
    }
  }, { passive: true });
}

const galleryItems = [...document.querySelectorAll('.gallery-card')];
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('img');
const lightboxCaption = lightbox.querySelector('figcaption');
let activeImage = 0;

function showImage(index) {
  activeImage = (index + galleryItems.length) % galleryItems.length;
  const item = galleryItems[activeImage];
  lightboxImage.src = item.dataset.image;
  lightboxImage.alt = item.querySelector('img').alt;
  lightboxCaption.textContent = item.dataset.caption;
}

galleryItems.forEach((item, index) => {
  item.addEventListener('click', () => {
    showImage(index);
    lightbox.showModal();
    document.body.style.overflow = 'hidden';
  });
});

lightbox.querySelector('.prev').addEventListener('click', () => showImage(activeImage - 1));
lightbox.querySelector('.next').addEventListener('click', () => showImage(activeImage + 1));
lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});
lightbox.addEventListener('close', () => { document.body.style.overflow = ''; });

let swipeStartX = 0;
lightbox.addEventListener('pointerdown', (event) => {
  swipeStartX = event.clientX;
});
lightbox.addEventListener('pointerup', (event) => {
  const distance = event.clientX - swipeStartX;
  if (Math.abs(distance) < 55) return;
  showImage(activeImage + (distance < 0 ? 1 : -1));
});

document.addEventListener('keydown', (event) => {
  if (!lightbox.open) return;
  if (event.key === 'ArrowLeft') showImage(activeImage - 1);
  if (event.key === 'ArrowRight') showImage(activeImage + 1);
});

const envelope = document.querySelector('.envelope');
envelope.addEventListener('click', () => {
  const isOpen = envelope.classList.toggle('is-open');
  envelope.setAttribute('aria-expanded', String(isOpen));
  document.querySelector('.envelope-hint').textContent = isOpen ? 'это послание всегда здесь' : 'нажми на конверт';
  if (isOpen) burstHearts(envelope.getBoundingClientRect().left + envelope.offsetWidth / 2, envelope.getBoundingClientRect().top + 130, 9);
});

function burstHearts(x, y, count = 12) {
  const symbols = ['♡', '♥', '✦', '·'];
  const total = isCoarse ? Math.min(count, 10) : count;
  for (let i = 0; i < total; i += 1) {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = symbols[i % symbols.length];
    heart.style.left = `${x + (Math.random() - .5) * 50}px`;
    heart.style.top = `${y + (Math.random() - .5) * 25}px`;
    heart.style.setProperty('--dx', `${(Math.random() - .5) * 150}px`);
    heart.style.setProperty('--rot', `${(Math.random() - .5) * 100}deg`);
    heart.style.animationDelay = `${Math.random() * .18}s`;
    document.body.appendChild(heart);
    heart.addEventListener('animationend', () => heart.remove());
  }
}

document.querySelector('#heartBurst').addEventListener('click', (event) => {
  const box = event.currentTarget.getBoundingClientRect();
  burstHearts(box.left + box.width / 2, box.top + box.height / 2, 20);
  document.querySelector('#finalWhisper').classList.add('show');
});

if (!reduceMotion && !isCoarse) {
  document.addEventListener('click', (event) => {
    if (!event.target.closest('button, a')) burstHearts(event.clientX, event.clientY, 3);
  });
}
