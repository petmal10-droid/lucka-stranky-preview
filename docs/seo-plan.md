# SEO pro BEMER Lucie – 27. 9. 2026

## Zaměření

Cílem je získávat relevantní dotazy na konzultaci a pronájem. Umístění na první pozici nelze nastavením ani platbou garantovat. Bez dat Google Search Console nejsou známé současné pozice, imprese ani hledanost; návrh klíčových slov je založen na nabídce a záměru hledajícího.

| Stránka | Hlavní dotazy | Úloha |
| --- | --- | --- |
| `/` | BEMER Brno, BEMER Blansko, BEMER terapie, Lucie Klozová | Osobní konzultace, představení poskytovatelky, kontakt |
| `/pronajem-bemer/` | pronájem BEMER, zapůjčení BEMER, BEMER pronájem cena, BEMER domů | Postup a ceny ze společného CMS, příprava na předání |
| `/mikrocirkulace/` | co je mikrocirkulace, BEMER mikrocirkulace, jak funguje BEMER | Vysvětlení, primární zdroje, návaznost na konzultaci |

Samostatné kopie pro každé město nedávají smysl, pokud nemají skutečnou odlišnou službu nebo pracoviště. Sídlo v Šebrově není bez potvrzení označeno jako ordinace. Nepřidáváme neověřená hodnocení, lékařské schválení článků ani léčebné sliby.

## Provedené úpravy

- Původní statické HTML mělo zástupný telefon a Prahu, zatímco CMS obsahovalo správně Brno, Blansko a skutečný telefon. Publikovaná verze se nyní sestavuje z CMS dat a správný obsah je čitelný i bez JavaScriptu.
- Nová metadata, canonical URL, Open Graph a Twitter náhled, strukturované údaje WebSite, WebPage, Person, Service a na podstránkách drobečková navigace.
- Dvě samostatné stránky s unikátním textem a vzájemnými odkazy, propojené z homepage.
- SEO a texty podstránek jsou v administraci. Cena pronájmu je společná s hlavní stránkou, propojená stabilním ID `rental`, nikoli pořadím karty.
- Mapa webu se třemi kanonickými adresami, robots.txt; staré návrhové varianty mají noindex. Administrace si ponechává noindex.
- Publikace kopíruje pouze veřejné soubory. Pracovní výstupy, testy, dokumentace, node_modules a náhledy nejsou součástí veřejného sestavení.
- Zůstávají původní biografie, reference a vzhled homepage. Texty o zdraví v nových článcích rozlišují obecnou fyziologii, určené použití výrobku a individuální zkušenosti.

## Co udělat dál – pořadí přínosu

1. **Google Search Console:** ověřit doménovou službu, odeslat `https://www.bemer-lucie.cz/sitemap.xml`, zkontrolovat všechny tři adresy v Kontrole URL. Požádat o indexaci až po nasazení. Bez přístupu do účtu a ověření vlastnictví není tento krok dokončen.
2. **Firemní profil Google a Firmy.cz / Mapy.com:** zkontrolovat nebo založit pravdivý profil. Sjednotit jméno, telefon, web a obsluhovanou oblast. Návštěvní adresu a otevírací dobu uvést pouze pokud jsou skutečné a potvrzené. Nepoužívat virtuální pracoviště ani cizí adresy.
3. **Reference:** požádat skutečné klienty o dobrovolnou recenzi a nic za ni neslibovat. Odpovídat věcně, nezveřejňovat jejich zdravotní údaje. Osobní příběh není klinický důkaz.
4. **Doplnit praktické podmínky pronájmu:** přesný model/příslušenství, předání a vrácení, dostupnost, kauce, případná doprava a postup při potížích. Tyto podmínky nyní nejsou v podkladech potvrzené; stránka vybízí k jejich domluvě.
5. **Další obsah podle skutečných otázek:** průběh první konzultace, používání BEMER doma, rozdíl mezi pronájmem a koupí. Článek o kontraindikacích až s konkrétním návodem a odbornou kontrolou. Podrobnější zdravotní tvrzení a stávající reference doporučuji věcně projít s Lucií.
6. **Měřit a upravovat:** první týdny kontrolovat indexaci a chyby. Po 4–12 týdnech vyhodnotit v Search Console dotazy po skupinách, prokliky, imprese a CTR, současně počet relevantních poptávek. Jde o interval pro vyhodnocení dat, ne slib výsledku. Dále řešit témata a titulky podle reálných dotazů. GA4 ani cookies nebyly přidány.
7. **Výkon:** změřit skutečná Core Web Vitals v Search Console, až bude dost dat. Hero a jeho schválenou animaci teď neměníme. Video a velikost obrázků lze později optimalizovat podle měření a vizuálního porovnání.

## Publikace a správa

`npm ci --ignore-scripts`, `npm run seo:sync` a `npm run test:publish` připraví veřejný obsah v `dist/`. `npm test` navíc spouští historické kontroly schváleného designu/obsahu; nejsou branou pro běžné redakční úpravy v CMS. `npm run build` pouze sestaví dist bez přepisu zdrojových HTML.

GitHub Pages musí používat zdroj **GitHub Actions**, workflow `.github/workflows/pages.yml`. Každá změna CMS na větvi main pak vygeneruje čerstvé HTML a mapu webu. Pouhé publikování kořene větve by při dalších CMS změnách nechalo staré podstránky. Po publikaci ověřit stav workflow a veřejné URL včetně správných kontaktů a cen.

Karta s interním ID `rental` musí zůstat právě jedna. Její pořadí lze měnit. Skrytím cenového bloku se na detailu objeví výzva k ověření ceny při konzultaci. Pro vyřazení pronájmu z nabídky je potřeba zároveň upravit nebo odebrat příslušnou podstránku.

Lokální `styles.css` obsahoval změny již před SEO prací a není součástí této úpravy ani aktuální homepage. Konzultace s Claude proběhla bez nástrojů: druhý názor na strategii, nikoli nezávislé měření webu nebo hledanosti.

## Podklady

- [Google: užitečný a důvěryhodný obsah](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google: lokální vyhledávání](https://support.google.com/business/answer/7091?hl=cs)
- [Google: sestavení mapy webu](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: kanonické URL](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [GitHub: publikace Pages přes Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- Fyziologické a výrobkové zdroje jsou přímo u článků. Google FAQ rozšířené výsledky ani hvězdičky nejsou slibovaným výstupem.
