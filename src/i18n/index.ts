/**
 * Lightweight i18n groundwork. English-only at launch, but structured so
 * Hindi/regional-language support can be added without reworking call sites.
 *
 * Usage:
 *   const t = useTranslations();
 *   t('nav.dashboard')
 *
 * To add a language: add a key to `translations`, set the locale in Theme/Auth
 * context, and translate the values. The `t()` function falls back to English.
 */

export type Locale = 'en' | 'hi';

const en: Record<string, string> = {
  'nav.dashboard': 'Dashboard',
  'nav.tracker': 'Tracker',
  'nav.assistant': 'Assistant',
  'nav.library': 'Library',
  'nav.insights': 'Insights',
  'nav.community': 'Community',
  'nav.care': 'Find Care',
  'nav.profile': 'Profile',
  'nav.pregnancy': 'Pregnancy',
  'nav.meds': 'Medications',
  'nav.sharing': 'Sharing',
  'nav.doctorSummary': 'Doctor Summary',

  'common.disclaimer': 'This is educational information, not medical advice. It does not replace a conversation with your healthcare provider.',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.export': 'Export',

  'hero.title': 'Your body, your questions, answered with care.',
  'hero.cta.start': 'Start tracking',
  'hero.cta.library': 'Explore the library',

  'mentalhealth.checkin.title': 'How are you feeling today?',
  'mentalhealth.checkin.body': 'Your mental health matters as much as your physical health. A gentle check-in, no judgment.',
  'mentalhealth.crisis.title': 'If things feel overwhelming',
  'mentalhealth.crisis.body': 'You deserve support. These free, confidential resources are available right now.',
};

const translations: Record<Locale, Record<string, string>> = { en, hi: en };

let currentLocale: Locale = 'en';

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: string): string {
  return translations[currentLocale]?.[key] ?? en[key] ?? key;
}

import { useState, useCallback } from 'react';

export function useTranslations() {
  // Re-render trigger if locale changes at runtime
  const [, setTick] = useState(0);
  const force = useCallback(() => setTick((n) => n + 1), []);
  return useCallback((key: string) => { void force; return t(key); }, [force]);
}
