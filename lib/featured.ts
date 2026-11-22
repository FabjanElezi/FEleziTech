import type { Lang } from '@/lib/i18n';

type Text = Record<Lang, string>;

export interface FeaturedCard {
  /** The case study's address, without the slash: "fetech-analytics" */
  caseStudy: string;
  role: Text;
  /** One line: problem → solution → outcome. */
  line: Text;
  /** ParaFluent is a real client's site, so its link says "Live site". */
  liveLabel?: 'demo' | 'site';
}

/**
 * Texts for the featured project cards on the home page, keyed by the project's
 * exact title in /admin. A featured project without an entry here keeps the
 * normal card, so renaming a project in /admin means renaming its key here too.
 */
export const FEATURED: Record<string, FeaturedCard> = {
  'FETech Analytics': {
    caseStudy: 'fetech-analytics',
    role: {
      en: 'Personal project · Solo build',
      de: 'Eigenes Projekt · allein umgesetzt',
      sq: 'Projekt personal · i realizuar vetëm',
    },
    line: {
      en: 'Sales data stuck in spreadsheets → a CSV upload becomes KPIs, charts, customer segments and a 12-month forecast → 8 pages, 25 automatic insight rules and a 0–100 health score, on demo data or your own file.',
      de: 'Verkaufsdaten stecken in Tabellen → ein CSV-Upload wird zu KPIs, Diagrammen, Kundensegmenten und einer 12-Monats-Prognose → 8 Seiten, 25 automatische Insight-Regeln und ein Health Score von 0–100, mit Demodaten oder eigener Datei.',
      sq: 'Të dhënat e shitjeve mbeten në tabela → një CSV i ngarkuar kthehet në KPI, grafikë, segmente klientësh dhe parashikim 12-mujor → 8 faqe, 25 rregulla automatike njohurish dhe një vlerësim 0–100 i shëndetit të biznesit, me të dhëna demo ose skedarin tuaj.',
    },
  },
  'ParaFluent – Website & Booking System': {
    caseStudy: 'parafluent',
    liveLabel: 'site',
    role: {
      en: 'Client project · Website & booking system',
      de: 'Kundenprojekt · Website & Buchungssystem',
      sq: 'Projekt për klient · Faqe & sistem rezervimesh',
    },
    line: {
      en: 'An online English teacher needed a site that takes trial-lesson bookings → bilingual Ukrainian/English site with step-by-step booking, an optional A1–B2 level test and live time slots → live at parafluent.me; she manages texts, slots, bookings and prices herself.',
      de: 'Eine Online-Englischlehrerin brauchte eine Website, die Buchungen für Probestunden annimmt → zweisprachige Website (Ukrainisch/Englisch) mit schrittweiser Buchung, optionalem A1–B2-Einstufungstest und Live-Terminen → live unter parafluent.me; Texte, Termine, Buchungen und Preise pflegt sie selbst.',
      sq: 'Një mësuese anglishteje online kishte nevojë për një faqe që pranon rezervime për orë provë → faqe dygjuhëshe ukrainisht/anglisht me rezervim hap pas hapi, test opsional niveli A1–B2 dhe orare live → live në parafluent.me; tekstet, oraret, rezervimet dhe çmimet i menaxhon vetë.',
    },
  },
  'Video Game Library Database': {
    caseStudy: 'videogame-library',
    role: {
      en: 'Course project · Database design',
      de: 'Studienprojekt · Datenbankentwurf',
      sq: 'Projekt studimi · Dizajn i bazës së të dhënave',
    },
    line: {
      en: 'A video game library has to keep track of games, users and loans → a normalized MySQL schema with junction tables for genres and platforms → 9 tables, 6 relationships and 8 foreign keys, documented in an ER diagram.',
      de: 'Eine Videospielbibliothek muss Spiele, Nutzer und Ausleihen verwalten → normalisiertes MySQL-Schema mit Verknüpfungstabellen für Genres und Plattformen → 9 Tabellen, 6 Beziehungen und 8 Fremdschlüssel, dokumentiert in einem ER-Diagramm.',
      sq: 'Një bibliotekë lojërash video duhet të ndjekë lojërat, përdoruesit dhe huazimet → skemë MySQL e normalizuar me tabela lidhëse për zhanret dhe platformat → 9 tabela, 6 marrëdhënie dhe 8 çelësa të huaj, të dokumentuara në një diagram ER.',
    },
  },
};

/**
 * The card's live link, unless it points at the case-study page itself: the
 * Video Game Library's "live demo" is that page, so it shows once, as the case study.
 */
export function liveHref(card: FeaturedCard, href?: string): string | undefined {
  if (!href) return undefined;
  return href.replace(/\/+$/, '').endsWith(`/${card.caseStudy}`) ? undefined : href;
}
