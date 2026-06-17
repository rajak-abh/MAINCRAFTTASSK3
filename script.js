const STORAGE_KEY = 'maincraftsContactSubmissions';
const THEME_KEY = 'maincraftsTheme';

const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    siteNav.classList.toggle('open');
  });
}

function getSavedSubmissions() {
  const rawData = localStorage.getItem(STORAGE_KEY);
  if (!rawData) {
    return [];
  }

  try {
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Unable to parse saved submissions:', error);
    return [];
  }
}

function saveSubmissions(submissions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
}

function addSubmission(submission) {
  const submissions = getSavedSubmissions();
  const updated = [...submissions, submission];
  saveSubmissions(updated);
  return updated;
}

function renderSubmissions(container) {
  const submissions = getSavedSubmissions();
  container.innerHTML = '';

  if (!submissions.length) {
    container.innerHTML = '<p class="empty-state">No submissions yet. Send a message from the Contact page to see it appear here.</p>';
    return;
  }

  const list = document.createElement('div');
  list.className = 'submissions-grid';

  submissions.slice().reverse().forEach((submission) => {
    const card = document.createElement('article');
    card.className = 'submission-card';

    const header = document.createElement('div');
    header.className = 'submission-meta';

    const title = document.createElement('strong');
    title.textContent = submission.name;

    const time = document.createElement('time');
    time.dateTime = submission.submittedAt;
    time.textContent = new Date(submission.submittedAt).toLocaleString();

    header.append(title, time);

    const email = document.createElement('p');
    email.className = 'submission-email';
    email.textContent = submission.email;

    const message = document.createElement('p');
    message.className = 'submission-message';
    message.textContent = submission.message;

    card.append(header, email, message);
    list.appendChild(card);
  });

  container.appendChild(list);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function showFormSuccess(message) {
  const successBox = document.querySelector('#formSuccess');
  if (!successBox) {
    alert(message);
    return;
  }

  successBox.textContent = message;
  successBox.classList.add('visible');
}

function clearFormSuccess() {
  const successBox = document.querySelector('#formSuccess');
  if (successBox) {
    successBox.textContent = '';
    successBox.classList.remove('visible');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.querySelector('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      clearFormSuccess();

      const nameField = document.querySelector('#name');
      const emailField = document.querySelector('#email');
      const messageField = document.querySelector('#message');

      const name = nameField.value.trim();
      const email = emailField.value.trim();
      const message = messageField.value.trim();

      if (!name || !email || !message) {
        alert('Please fill in your Name, Email, and Message before sending.');
        return;
      }

      if (!isValidEmail(email)) {
        alert('Please enter a valid email address.');
        return;
      }

      addSubmission({
        name,
        email,
        message,
        submittedAt: new Date().toISOString(),
      });

      showFormSuccess('Thank you! Your message has been saved locally.');
      contactForm.reset();
    });
  }

  const submissionsContainer = document.querySelector('#submissionsContainer');
  if (submissionsContainer) {
    renderSubmissions(submissionsContainer);
  }
  
  // Theme toggle + persistence
  const themeToggle = document.querySelector('#themeToggle');
  const backToTop = document.querySelector('#backToTop');

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      if (themeToggle) themeToggle.textContent = '☀️';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
      if (themeToggle) themeToggle.textContent = '🌙';
    }
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      applyTheme('dark');
    } else {
      applyTheme('light');
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Back to top visibility and action
  function onScroll() {
    if (!backToTop) return;
    if (window.scrollY > 320) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  initTheme();
});
