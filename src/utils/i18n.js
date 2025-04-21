import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import en from '../locales/en';
import ko from '../locales/ko';

const i18n = new I18n({
  en,
  ko
});

// Set the locale
i18n.locale = Localization.locale;

// When a value is missing from a language it'll fallback to another language with the key present.
i18n.enableFallback = true;

// Set the default locale to English if the locale isn't supported
i18n.defaultLocale = 'en';

export default i18n; 