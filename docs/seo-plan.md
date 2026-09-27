# SEO pro BEMER Lucie – jednostránkový web

Aktualizováno 27. 9. 2026. Oficiální https://www.bemer-lucie.cz/ zůstává čistě jednostránkovou prezentací. Uživatel výslovně nechce podstránky mikrocirkulace ani pronájmu. Oba návrhy, jejich CMS pole a odkazy jsou z veřejné verze odstraněné.

## Zaměření

Cílem jsou relevantní poptávky na konzultaci a pronájem. První pozici nelze garantovat. Bez Search Console neznáme současné pozice, imprese ani hledanost.

| Stávající část stránky | Témata dotazů |
| --- | --- |
| Úvod a kontakt | BEMER Brno, BEMER Blansko, BEMER terapie, Lucie Klozová |
| Mikrocirkulace a BEMER | mikrocirkulace, co je mikrocirkulace, jak funguje BEMER |
| Spolupráce | pronájem BEMER, zapůjčení BEMER, BEMER cena, BEMER domů |

Kotvy sekcí nejsou samostatné stránky. Canonical i jediný záznam sitemap směřují na kořen domény. Žádné městské kopie, skrytý text ani opakování klíčových slov.

## Úpravy

- Titulek a popis propojují BEMER, mikrocirkulaci, skutečné lokality a nabídku.
- Aktuální CMS obsah se zapisuje přímo do HTML. Opraveny zástupný telefon a Praha v původním HTML; údaje souhlasí s CMS.
- Doplněny canonical, Open Graph, Twitter náhled a strukturované údaje WebSite, WebPage, Person a Service. Sídlo není vydáváno za ordinaci; nejsou přidaná neověřená hodnocení ani hodiny.
- SEO pole v CMS, robots.txt a sitemap pouze s hlavní adresou. Administrace a staré návrhové varianty jsou noindex.
- Zachovány struktura, vzhled, biografie, reference a obsah stávajících sekcí. FAQ je čitelné i bez JavaScriptu.
- Veřejný balíček dist neobsahuje pracovní výstupy, dokumentaci, testy ani návrhy nových podstránek.

## Další priority

1. Search Console: ověřit doménu, odeslat https://www.bemer-lucie.cz/sitemap.xml, zkontrolovat hlavní URL a požádat o indexaci po nasazení. Přístup zatím není propojený.
2. Firemní profil Google a Firmy.cz / Mapy.com: sjednotit jméno, telefon, web a skutečně obsluhovanou oblast. Adresu pro návštěvy a hodiny uvést jen po potvrzení.
3. Skutečné recenze: dobrovolné, bez odměn a bez zveřejňování zdravotních údajů. Osobní zkušenost není klinický důkaz.
4. Praktické informace případně doplnit do současné sekce spolupráce nebo FAQ: příslušenství, předání, vrácení, dostupnost a podmínky pronájmu. Bez nových podstránek.
5. Zdravotní tvrzení a jejich podklady projít s Lucií. Nové odborné odpovědi případně doplnit do existujícího FAQ.
6. Vyhodnocovat indexaci, dotazy, imprese, prokliky, CTR a skutečné poptávky. První širší vyhodnocení například po 4–12 týdnech; nejde o slib výsledku v tomto termínu. Nová analytika ani cookies nejsou přidané.
7. Rychlost posoudit podle skutečných Core Web Vitals, až bude dost dat. Schválená animace se nemění.

## Správa

`npm ci --ignore-scripts`, `npm run seo:sync` a `npm run test:publish` připraví veřejný výstup dist. `npm test` navíc kontroluje historicky schválený vzhled a copy. Publikační kontroly porovnávají aktuální CMS data, nikoli pevné redakční hodnoty.

Workflow `.github/workflows/pages.yml` potřebuje zdroj GitHub Pages nastavený na GitHub Actions, aby každá změna CMS přegenerovala HTML. Nasazení je dokončené až po úspěšném workflow a kontrole oficiální domény.

Původní lokální změna styles.css není součástí SEO úpravy. Konzultace s Claude byla druhým názorem na strategii, nikoli měřením hledanosti.

## Podklady

- [Google: užitečný obsah](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google: lokální vyhledávání](https://support.google.com/business/answer/7091?hl=cs)
- [Google: sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [GitHub: publikace Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
