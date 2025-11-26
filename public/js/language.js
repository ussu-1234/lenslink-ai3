// Language Switcher Module for LensLink AI
// Handles language switching, translation, and persistence

(function() {
    'use strict';
    
    const STORAGE_KEY = 'lenslink_language';
    const DEFAULT_LANG = 'en';
    const SUPPORTED_LANGS = ['en', 'th', 'es'];
    
    let currentLang = DEFAULT_LANG;
    
    // Initialize language system
    function init() {
        // Load saved language preference
        const savedLang = localStorage.getItem(STORAGE_KEY);
        if (savedLang && SUPPORTED_LANGS.includes(savedLang)) {
            currentLang = savedLang;
        } else {
            // Try to detect browser language
            const browserLang = navigator.language || navigator.userLanguage;
            const langCode = browserLang.split('-')[0].toLowerCase();
            if (SUPPORTED_LANGS.includes(langCode)) {
                currentLang = langCode;
            }
        }
        
        // Apply language on page load
        applyLanguage(currentLang);
        
        // Set up language switcher UI if it exists
        setupLanguageSwitcher();
    }
    
    // Apply translations to the page
    function applyLanguage(lang) {
        if (!window.translations || !window.translations[lang]) {
            console.warn(`Translations for language '${lang}' not found`);
            return;
        }
        
        currentLang = lang;
        localStorage.setItem(STORAGE_KEY, lang);
        
        const t = window.translations[lang];
        
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (t[key]) {
                const isInput = element.tagName === 'INPUT';
                const isTextInput = isInput && (element.type === 'text' || element.type === 'email' || element.type === 'password' || element.type === 'search');
                const isSubmitInput = isInput && (element.type === 'submit' || element.type === 'button');
                const isButton = element.tagName === 'BUTTON';
                
                if (isTextInput) {
                    element.placeholder = t[key];
                } else if (isSubmitInput || isButton) {
                    element.textContent = t[key];
                } else {
                    element.textContent = t[key];
                }
            }
        });
        
        // Update page title if it has data-i18n-title
        const titleElement = document.querySelector('[data-i18n-title]');
        if (titleElement) {
            const titleKey = titleElement.getAttribute('data-i18n-title');
            if (t[titleKey]) {
                document.title = t[titleKey];
            }
        }
        
        // Update HTML lang attribute
        document.documentElement.lang = lang;
        
        // Trigger custom event for other scripts to react to language change
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }
    
    // Set up language switcher dropdown
    function setupLanguageSwitcher() {
        const switcher = document.getElementById('languageSwitcher');
        if (!switcher) return;
        
        // Create dropdown options
        const langNames = {
            en: 'English',
            th: 'ไทย',
            es: 'Español'
        };
        
        // Update current language display
        const currentLangDisplay = switcher.querySelector('.current-lang');
        if (currentLangDisplay) {
            currentLangDisplay.textContent = langNames[currentLang] || 'English';
        }
        
        // Set up dropdown items
        const dropdown = switcher.querySelector('.lang-dropdown');
        if (dropdown) {
            dropdown.innerHTML = '';
            SUPPORTED_LANGS.forEach(lang => {
                const item = document.createElement('div');
                item.className = 'lang-option';
                if (lang === currentLang) {
                    item.classList.add('active');
                }
                item.textContent = langNames[lang];
                item.setAttribute('data-lang', lang);
                item.addEventListener('click', () => {
                    switchLanguage(lang);
                    dropdown.classList.remove('show');
                });
                dropdown.appendChild(item);
            });
        }
        
        // Toggle dropdown
        switcher.addEventListener('click', (e) => {
            if (e.target.closest('.current-lang') || e.target.closest('.lang-icon')) {
                dropdown.classList.toggle('show');
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!switcher.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
    
    // Public API: Switch language
    function switchLanguage(lang) {
        if (!SUPPORTED_LANGS.includes(lang)) {
            console.warn(`Language '${lang}' is not supported`);
            return;
        }
        
        applyLanguage(lang);
        setupLanguageSwitcher(); // Update switcher UI
    }
    
    // Public API: Get current language
    function getCurrentLanguage() {
        return currentLang;
    }
    
    // Public API: Get translation
    function t(key, fallback = '') {
        if (!window.translations || !window.translations[currentLang]) {
            return fallback || key;
        }
        return window.translations[currentLang][key] || fallback || key;
    }
    
    // Expose public API
    window.LanguageSwitcher = {
        switch: switchLanguage,
        getCurrent: getCurrentLanguage,
        t: t,
        init: init
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

