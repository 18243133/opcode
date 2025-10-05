import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'zh-CN', name: '中文' }
  ];

  return {
    t,
    language: i18n.language,
    currentLanguage: i18n.language,
    changeLanguage,
    supportedLanguages
  };
};