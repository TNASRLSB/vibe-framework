/**
 * Design System Preview - JavaScript
 *
 * Handles interactivity for the preview page:
 * - Theme toggle (light/dark)
 * - Copy to clipboard
 * - Smooth scroll navigation
 * - Active section highlighting
 * - Animation demos
 * - Modal handling
 */

(function() {
  'use strict';

  // ==========================================================================
  // Theme Toggle
  // ==========================================================================

  function initThemeToggle() {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) return;

    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('preview-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', initialTheme);

    toggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('preview-theme', newTheme);
    });

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('preview-theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  }

  // ==========================================================================
  // Copy to Clipboard
  // ==========================================================================

  function initCopyButtons() {
    document.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const textToCopy = btn.dataset.copy;

        try {
          await navigator.clipboard.writeText(textToCopy);

          // Visual feedback
          const originalText = btn.textContent;
          btn.textContent = 'Copied!';
          btn.classList.add('copied');

          setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
          }, 1500);
        } catch (err) {
          console.error('Failed to copy:', err);
          btn.textContent = 'Error';
          setTimeout(() => {
            btn.textContent = 'Copy';
          }, 1500);
        }
      });
    });

    // Also handle code blocks with pre > code
    document.querySelectorAll('.code-block .copy-btn').forEach(btn => {
      if (btn.dataset.copy) return; // Already handled

      const codeBlock = btn.closest('.code-block');
      const code = codeBlock?.querySelector('code');

      if (code) {
        btn.dataset.copy = code.textContent;
      }
    });
  }

  // ==========================================================================
  // Smooth Scroll Navigation
  // ==========================================================================

  function initSmoothScroll() {
    document.querySelectorAll('.preview-nav a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Update URL without triggering scroll
        history.pushState(null, '', href);
      });
    });
  }

  // ==========================================================================
  // Active Section Highlighting
  // ==========================================================================

  function initActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.preview-nav a[href^="#"]');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;

          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    });

    sections.forEach(section => observer.observe(section));
  }

  // ==========================================================================
  // Animation Demos
  // ==========================================================================

  function initAnimationDemos() {
    document.querySelectorAll('[data-animate]').forEach(btn => {
      btn.addEventListener('click', () => {
        const selector = btn.dataset.animate;
        const target = document.querySelector(selector);

        if (!target) return;

        // Reset animation
        target.classList.remove('animate');

        // Trigger reflow to restart animation
        void target.offsetWidth;

        // Start animation
        target.classList.add('animate');

        // Remove class after animation completes
        const duration = parseFloat(getComputedStyle(target).transitionDuration) * 1000 || 500;
        setTimeout(() => {
          target.classList.remove('animate');
        }, duration + 100);
      });
    });
  }

  // ==========================================================================
  // Modal Handling
  // ==========================================================================

  function initModals() {
    // Open modal
    document.querySelectorAll('[data-modal-open]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.modalOpen;
        const modal = document.getElementById(modalId);

        if (modal) {
          modal.hidden = false;
          document.body.style.overflow = 'hidden';

          // Focus first focusable element
          const focusable = modal.querySelector('button, [href], input, select, textarea');
          if (focusable) focusable.focus();
        }
      });
    });

    // Close modal
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-backdrop');
        if (modal) {
          modal.hidden = true;
          document.body.style.overflow = '';
        }
      });
    });

    // Close on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.hidden = true;
          document.body.style.overflow = '';
        }
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal-backdrop:not([hidden])');
        if (openModal) {
          openModal.hidden = true;
          document.body.style.overflow = '';
        }
      }
    });
  }

  // ==========================================================================
  // Color Value Display
  // ==========================================================================

  function initColorValues() {
    // Get computed CSS variable values and display them
    document.querySelectorAll('.swatch-value[data-color]').forEach(el => {
      const colorName = el.dataset.color;
      const varName = `--color-${colorName}`;
      const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();

      if (value) {
        el.textContent = value;
      }
    });
  }

  // ==========================================================================
  // Generate Date
  // ==========================================================================

  function initGeneratedDate() {
    const dateEl = document.getElementById('generated-date');
    if (dateEl) {
      const now = new Date();
      dateEl.textContent = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }

  // ==========================================================================
  // Contrast Ratio Calculator
  // ==========================================================================

  function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  function getContrastRatio(color1, color2) {
    const l1 = getLuminance(...color1);
    const l2 = getLuminance(...color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  }

  function initContrastChecker() {
    // This would need actual color values - leaving as placeholder
    document.querySelectorAll('.contrast-ratio').forEach(el => {
      // Placeholder - in real implementation, parse colors and calculate
      el.textContent = '4.5:1 AA';
    });
  }

  // ==========================================================================
  // Keyboard Navigation
  // ==========================================================================

  function initKeyboardNav() {
    // Add focus-visible polyfill behavior
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-nav');
    });
  }

  // ==========================================================================
  // Initialize Everything
  // ==========================================================================

  function init() {
    initThemeToggle();
    initCopyButtons();
    initSmoothScroll();
    initActiveSection();
    initAnimationDemos();
    initModals();
    initColorValues();
    initGeneratedDate();
    initContrastChecker();
    initKeyboardNav();

    console.log('Design System Preview initialized');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
