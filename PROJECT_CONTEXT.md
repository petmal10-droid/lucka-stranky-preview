# Lucka stránky - projektový kontext

Aktualizováno: 2026-04-26

## Účel dokumentu

Tento soubor slouží jako předávací paměť projektu. Lze ho nahrát nebo zkopírovat do ChatGPT a pokračovat v diskusi nad celým webem bez ztráty kontextu.

## Projekt

- Název pracovního projektu: Lucka stránky
- Typ: statický microsite web
- Téma: BEMER terapie, osobní konzultace, mikrocirkulace
- Lokální složka: `C:\Users\malp\Documents\Lucka stránky`
- Google Drive kontext: `H:\Můj disk\Codex\Lucka stránky\PROJECT_CONTEXT.md`
- Online preview: https://petmal10-droid.github.io/lucka-stranky-preview/
- GitHub repo: https://github.com/petmal10-droid/lucka-stranky-preview
- Hlavní soubory: `index.html`, `styles.css`

## Aktuální stav designu

- Hero sekce je vrácená na původní první dnešní variantu: světlé teplé pozadí, vlevo text, vpravo abstraktní kruhový/flow vizuál tvořený CSS.
- Pokusy s fotografií/AI obrázkem jako hero background byly vráceny zpět, protože byl viditelný předěl mezi hero a další sekcí.
- Horní navigace obsahuje odkazy: BEMER a mikrocirkulace, Průběh, FAQ, Kontakt.
- Navigace má nastavený scroll offset pro sticky header, aby kliknutí na položku neschovalo nadpis sekce ani nerozhodilo layout.
- Barevnost je teplá, krémová/oranžová, s důrazem na klidný a důvěryhodný zdravotní tón.
- Typografie: Google Fonts `Lora` pro nadpisy a `Manrope` pro texty.

## Struktura stránky

1. Hero
   - H1: `Podpora mikrocirkulace pomocí BEMER terapie`
   - CTA: `Domluvit konzultaci`
   - sekundární CTA: `Jak BEMER funguje`
   - body: individuální posouzení, lidský přístup, nezávazné seznámení

2. BEMER a jeho technologie
   - Foto přístroje BEMER Premium-Set Evo / B.Box Evo z oficiálního zdroje Cloudinary/BEMER.
   - Text vysvětluje pulzní elektromagnetické pole, patentovanou konfiguraci signálu a mikrocirkulaci.

3. Karty `S čím vám může terapie pomoci`
   - Nadpis je nyní `h3`, menší než hlavní H2.
   - Karty: Energie, Imunitní systém, Funkce orgánů, Neurologická onemocnění, Regenerace, Psychika.
   - Karta Neurologická onemocnění obsahuje informaci o doplňkové podpoře u dospělých a dětí s DMO a dalšími neurologickými či vývojovými poruchami.

4. Mikrocirkulace - klíč ke zdraví
   - Obsahuje oficiální video animaci z BEMER stránky přes Mux:
     `https://stream.mux.com/2FD6suVth11cBqvFhSnNOVOWt3vyoHg3BTRCFQynURY/high.mp4`
   - Video je autoplay, muted, loop, bez ovládacích prvků a bez zobrazeného času.
   - Karty jsou pod videem ve třech sloupcích.
   - Ikony v kartách jsou PNG:
     - `01_zasobeni_bunek.png`
     - `02_latkova_vymena.png`
     - `03_regenerace_vykon.png`
   - Ikony byly zmenšeny o 25 % na `87px × 62px`.

5. Další sekce
   - `Co vám spolupráce může přinést`
   - `Jak probíhá BEMER terapie`
   - Reference
   - FAQ
   - Profil
   - Kontakt

## Důležité designové rozhodnutí

- Nevracet bez dalšího pokusy s full-width hero fotkou. Byly zkoušeny dva obrázky:
  - `hero-microcirculation.png`
  - `hero-neural-bg.jpeg`
- Obě varianty byly vráceny, protože mezi hero a následující sekcí vznikal nežádoucí viditelný předěl.
- Aktuálně preferovaná varianta hero je původní čistý layout bez foto backgroundu.
- Hero eyebrow text `Klidná a důvěryhodná microsite` působil interně jako popis projektu, ne jako sdělení pro návštěvníka. Byl odstraněn z hero sekce.
- Pokud by se měl eyebrow vrátit, vhodnější by byly návštěvnicky srozumitelné varianty:
  - `OSOBNÍ KONZULTACE BEMER TERAPIE`
  - `BEMER TERAPIE A MIKROCIRKULACE`
  - `DOPLŇKOVÁ PODPORA REGENERACE`
  - `MIKROCIRKULACE, REGENERACE, VITALITA`

## Změny během práce

- Vytvořeno GitHub Pages preview zdarma.
- Založen lokální git repozitář.
- Vytvořen veřejný GitHub repozitář `petmal10-droid/lucka-stranky-preview`.
- Zapnuto GitHub Pages z větve `main`.
- Přidán a následně upravován obsah karet.
- Upravena karta `Imunitní systém`:
  `Správně fungující mikrocirkulace optimalizuje přirozené obranné procesy organismu.`
- Nahrazena čtvrtá karta za `Neurologická onemocnění`.
- Změněno znění karty neurologických onemocnění na dospělé i děti.
- Nahrazena fotografie přístroje za novější BEMER Premium-Set Evo / B.Box Evo.
- Vložena oficiální BEMER animace mikrocirkulace přes video.
- Přestavěn layout animace: video nahoře, tři karty pod ním.
- Vyměněny ikony spodních tří karet za dodané PNG soubory.
- Zmenšeny ikony spodních tří karet o 25 %.
- Nadpis `S čím vám může terapie pomoci` změněn na H3 a zmenšen.
- Hero background pokusy vráceny na první variantu.

## Aktuální git historie - důležité body

- `3957d7f` Initial preview site
- `470acf6` Reduce microcirculation card icons
- `7225765` Make therapy help subtitle smaller
- `996fa8f` Use microcirculation image as hero background
- `ae5bb4e` Revert "Use microcirculation image as hero background"
- `ada19ed` Try neural image hero background
- `32ef504` Soften hero image transition
- `95877ac` Overlap hero and BEMER transition
- `773162b` Remove visible hero transition line
- `7109f87` Revert "Try neural image hero background"

Poznámka: commity s hero backgroundem byly vrácené, takže aktuální web je zpět na původní hero variantě.

## Jak aktualizovat online preview

Po lokálních změnách:

```powershell
git status --short
git add index.html styles.css <pripadne-nove-soubory>
git commit -m "Popis zmeny"
git push
```

Preview se aktualizuje na:
https://petmal10-droid.github.io/lucka-stranky-preview/

GitHub Pages může mít několik desítek sekund zpoždění.

## Prompt pro pokračování v ChatGPT

Použij tento projektový kontext jako paměť práce na webu `Lucka stránky`. Jedná se o statický microsite web pro BEMER terapii v `C:\Users\malp\Documents\Lucka stránky`, s online preview na GitHub Pages. Zachovej aktuální směr: klidný, důvěryhodný, teplý design, bez full-width hero fotografie, protože předchozí pokusy s fotografickým hero backgroundem byly vrácené kvůli viditelnému předělu. Pracuj hlavně se soubory `index.html` a `styles.css`, respektuj aktuální layout a ukládej změny do git historie.

## Pravidlo pro další práci

Po významné změně aktualizovat tento dokument stručným záznamem:

- datum
- co se změnilo
- proč
- které soubory
- zda bylo pushnuto na GitHub Pages

## Průběžné poznámky

### 2026-04-26

- Řešeno, zda ponechat hero eyebrow `Klidná a důvěryhodná microsite`.
- Doporučení: text odstranit nebo nahradit návštěvnicky srozumitelným popiskem. Nejlepší kandidát: `OSOBNÍ KONZULTACE BEMER TERAPIE`.
- Následně byl eyebrow text z hero sekce odstraněn v `index.html`.
- Horní menu bylo aktualizováno: přidán odkaz `BEMER`, reference v menu nahrazeny `FAQ`, FAQ sekce dostala `id="faq"` a v CSS byl doplněn `scroll-padding-top` / `scroll-margin-top` pro stabilní anchor skoky.
- Po testu bylo menu zjednodušeno na `BEMER a mikrocirkulace`, protože samostatný odkaz `#benefits` skákal doprostřed vnořeného BEMER panelu a opticky ořezával úvod s fotkou přístroje.
- Z horního menu bylo odstraněno právní/cookie tlačítko. Nastavení cookies a právní informace mají zůstat pouze dole ve footeru a v cookie liště.
- Doplněna základní cookies lišta a právní informační sekce pro ČR:
  - web komunikuje použití pouze nezbytných/technických cookies,
  - ukládá technickou cookie `lucka_cookie_notice` pro zapamatování zavření lišty,
  - doplněn odkaz `Cookies a osobní údaje` v patičce,
  - přidána poznámka ke kontaktnímu formuláři,
  - doplněna informace o externím obsahu načítaném pro zobrazení webu,
  - soubory: `index.html`, `styles.css`.
- Důležité: v sekci osobních údajů je ponechána výzva k doplnění skutečného správce, kontaktního e-mailu a identifikačních údajů provozovatele webu.
- Na žádost upraveno tak, aby právní texty působily jako zatímní návrh: u osobních údajů jsou viditelné položky k doplnění, konkrétní informace dodá uživatel později.
- Odkaz na cookies byl zviditelněn: přidán do horní navigace před `Kontakt`, zvýrazněn jemným podbarvením a patička byla přesunuta před právní sekci jako samostatný viditelný blok s odkazy `Cookies a osobní údaje` a `Nastavení cookies`.
- Následně byla velká právní sekce nahrazena elegantnějším vysouvacím panelem po kliknutí na `Cookies`, `Cookies a osobní údaje` nebo `Více informací`. Cookies lišta byla zmenšena na kompaktní spodní oznámení. Do odkazu na CSS byl přidán cache-busting query parametr, aby GitHub Pages nenačítal staré styly.
- Podle dalšího zadání byl boční drawer nahrazen rozbalovacím panelem přímo v patičce. Odkaz se jmenuje `Právní informace`; po kliknutí se právní texty vysunou pod ním jako součást designu webu. Cache-busting parametr CSS byl aktualizován na `legal-inline`.

### 2026-04-28

- Zapracovány aktivní textové připomínky z Pastel review od Lucie Klozové:
  - hero bod změněn na `individuální posouzení vhodnosti terapie`,
  - BEMER úvod doplněn o regeneraci, hojení a opatrnou poznámku k podpoře působení léčiv/doplňků,
  - šest karet `S čím vám může terapie pomoci` přepsáno podle review: energie/výkon/regenerace, imunita, orgány a sliznice, hojení tkání, bolestivé stavy, chronická onemocnění,
  - sekce spolupráce přejmenována na `Jak to funguje v praxi`,
  - praktické karty přepsány na `Individuální konzultace`, `Domácí terapie`, `Akutní potíže`, `Dlouhodobé užívání`,
  - medailonek přepsán na `O mě` s osobním textem o lékařském vzdělání, péči o dceru a zkušenosti s BEMER terapií.
- Soubory: `index.html`, `styles.css`.
- Text první karty `Energie, výkon, regenerace` byl následně zpřesněn na formulaci: `Lepší prokrvení tkání pomáhá buňkám efektivněji využívat kyslík a živiny, což se může projevit na celkové vitalitě a schopnosti regenerace. Vhodné i pro sportovce.`
- Nadpis `Jak to funguje v praxi` byl typograficky zalomen na dva řádky: `Jak to funguje` / `v praxi`.
