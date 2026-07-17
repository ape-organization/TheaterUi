import { Injectable, signal, effect } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type SupportedLang = 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  readonly currentLang = signal<SupportedLang>(this.getSavedLang());
  readonly isRtl = signal(this.getSavedLang() === 'ar');

  constructor(private translate: TranslateService) {
    // Initialize with saved language
    const lang = this.currentLang();
    this.translate.use(lang);
    this.applyDirection(lang);
  }

  switchLanguage(lang: SupportedLang): void {
    this.currentLang.set(lang);
    this.isRtl.set(lang === 'ar');
    this.translate.use(lang);
    localStorage.setItem('preferred_lang', lang);
    this.applyDirection(lang);
  }

  private getSavedLang(): SupportedLang {
    const saved = localStorage.getItem('preferred_lang') as SupportedLang;
    return saved || 'en';
  }

  private applyDirection(lang: SupportedLang): void {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }
}