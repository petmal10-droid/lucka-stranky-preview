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
- Karty v sekci `Jak to funguje v praxi` byly vizuálně zatraktivněny: světlejší vrstvené pozadí, očíslovaný oranžový badge, horní linka, jemnější stín a hover efekt.
- Sekce `Jak probíhá BEMER terapie` byla odstraněna včetně položky `Průběh` v horním menu.
- Reference sekce byla přepracována ze sytě oranžového bloku na světlejší prémiový panel s dvousloupcovým úvodem, jemnými quote kartami, autorskými popisky a decentním oranžovým akcentem.
- Karty v sekci `Jak to funguje v praxi` byly následně laděny do světlejší polished měděno-oranžové varianty se světlým textem, aby nepůsobily příliš černě.
- Ze sekce `BEMER a jeho technologie` / `Mikrocirkulace - klíč ke zdraví` byl odstraněn společný vnější rámeček/panel. Obsah je zarovnán a odsazen konzistentněji jako ostatní sekce.
- Výška hero a horní odsazení BEMER sekce byly zmenšeny, aby nadpis `BEMER a jeho technologie` začínal už na úvodní obrazovce a motivoval ke scrollování.
- Nadpis referencí byl změněn na `Osobní zkušenosti s BEMER terapií` a doprovodný odstavec v hlavičce referencí byl odstraněn.
- Vytvořena druhá vizuální varianta podle dodané reference:
  - přepracovaný header s logotypem `lucka`, navigací a CTA,
  - hero s jemnou oranžovou radiální/signální grafikou,
  - mikrocirkulace poskládaná jako text + insight karta + široké video + třísloupcový benefit strip,
  - samostatný produktový BEMER panel,
  - čtyři světlé benefit karty, disclaimer, reference, kompaktní FAQ a kontaktní blok,
  - kontaktní vizuál byl nahrazen klidnější ilustrační fotografií z Pexels.
- Soubory: `index.html`, `styles.css`, `PROJECT_CONTEXT.md`.
- Změna zatím nebyla pushnutá na GitHub Pages.
- Pro klientské porovnání byla původní varianta vytažena z posledního commitu do `varianta-1.html` + `styles-varianta-1.css`.
- Přidán rozcestník `porovnani.html`, který odkazuje na původní variantu 1 a aktuální novou variantu 2 (`index.html`).
- V kontaktní sekci varianty 2 byl původní CTA blok nahrazen kontaktním formulářem:
  - pole `Jméno`, `E-mail`, `Telefon`, `Zpráva`,
  - odeslání přes `mailto:info@luckabemer.cz`,
  - zachované kontaktní údaje a ilustrační fotografie v pravém sloupci.
- Textace varianty 2 (`index.html`) byla sladěna podle původní varianty 1:
  - převzat hero odstavec a body,
  - sekce BEMER technologie, praktický průběh, reference, FAQ a kontaktní poznámka používají formulace z první varianty,
  - vizuální layout druhé varianty zůstal zachovaný.
- Následně byla v produktové/BEMER sekci varianty 2 vrácena původní textace druhé varianty:
  - `Jak do toho vstupuje BEMER`,
  - `Jak BEMER podporuje mikrocirkulaci`,
  - odstavec o pulzním elektromagnetickém poli a tři body k neinvazivní terapii, cíli podpory mikrocirkulace a individuálnímu posouzení.
- V insight kartě u mikrocirkulace byla vrácena původní formulace: `Zdravá mikrocirkulace znamená lepší podmínky pro regeneraci, vitalitu a přirozenou odolnost těla.`
- V kontaktní sekci varianty 2 byla ilustrační Pexels fotka nahrazena projektovým obrázkem `bemer-b-bed-evo.png`, snímkem z oficiálního BEMER B.Bed Evo produktového videa.
- Úvodní odstavec sekce `Mikrocirkulace - klíč ke zdraví` byl ve variantě 2 vrácen na původní znění o zásobení buněk kyslíkem a živinami, výměně odpadních látek, regeneraci, hojení a menším vyčerpávání.
- Header/menu ve variantě 2 bylo nastaveno jako sticky s jemným průsvitným pozadím, blur efektem a decentním stínem.
- Ve variantě 2 byl odstraněn informační box pod kartami `Jak to funguje v praxi`.
- Do varianty 2 byla mezi produktový BEMER panel a sekci `Jak to funguje v praxi` doplněna nová sekce `S čím může terapie pomoci` se šesti kartami:
  - energie/výkon/regenerace,
  - imunitní systém,
  - funkce orgánů a sliznic,
  - hojení tkání,
  - bolestivé stavy,
  - chronická onemocnění.
- Hero text varianty 2 byl zpřesněn tak, aby návštěvník hned pochopil, že BEMER je neinvazivní pulzní elektromagnetická terapie navržená pro podporu mikrocirkulace.
- Produktová BEMER sekce varianty 2 byla přepsána tak, aby vysvětlovala, že jde o systém s podložkou a lokálními aplikátory, jak terapie probíhá a jak souvisí s mikrocirkulací.
- Odrážky v produktové BEMER sekci varianty 2 byly nahrazeny výraznými USP kartami: založení/vývoj od roku 1998, 5+ mezinárodních patentů a odkaz na PubMed studie k BEMER.
- USP karty v produktové BEMER sekci byly stylisticky upraveny na `20+ let zkušeností`, `5+ patentů` a samostatně zarovnaný odkaz na PubMed studie.
- PubMed USP karta dostala kompaktnější nadpis a ochranu proti přetékání textu z úzké karty.
- Sekce `Jak to funguje v praxi` byla přepracována na procesní sekci `Jak spolupráce probíhá` se čtyřmi kroky: úvodní konzultace, vyzkoušení doma, průběžná podpora a rozhodnutí bez tlaku. Pod karty bylo přidáno CTA na nezávaznou konzultaci.
- Procesní sekce byla mikrocopy doladěna: kratší texty v kartách, krok 02 přejmenován na `Domácí vyzkoušení`, závěr kroku 04 je méně obchodní a CTA používá výrazné oranžové tlačítko.
- Reference byly zlidštěny na `Zkušenosti lidí, kteří BEMER vyzkoušeli`, dostaly vysvětlující podnadpis, konkrétnější texty, štítky typu zkušenosti a byly odstraněny carousel tečky.
- FAQ sekce byla přepracována z technického edukačního bloku na praktické otázky před konzultací a domácím vyzkoušením: 6 položek, úvodní podnadpis, kratší otázky a sekundární odkaz `Přejít na oficiální FAQ BEMER`.
- Kontaktní sekce byla posunuta z produktové roviny do osobnější: odstraněna fotka lehátka, přidán úvod nad formulářem, kontaktní blok a osobní medailonek Lucie s civilním textem a dovětkem o nezávaznosti konzultace.
- Nadpis kontaktní sekce byl změněn na `Máte otázky k BEMER terapii? Ozvěte se mi`.
- Do patičky byl přidán odkaz `Identifikační údaje` a do právního panelu blok pro doplnění identifikačních údajů provozovatele: jméno/název, IČO, sídlo/adresa podnikání, kontakt a případný zápis v rejstříku.
- Sekce `S čím může terapie pomoci` byla zjemněna na orientační přehled podpůrných oblastí: nový nadpis `Kde může být BEMER vhodnou podporou`, podnadpis o individuálním posouzení, bezpečnější copy karet a jemné ikonové značky místo dominantního číslování.
- Sekce podpůrných oblastí byla dále doladěna: osobnější podnadpis, kratší copy v kartách, kompaktnější karty a vlastní šířka/velikost H2 pro přirozenější zalomení.
- Produktová BEMER sekce byla napojena zpět na předchozí vysvětlení mikrocirkulace: nadštítek `Praktická podpora mikrocirkulace`, nadpis `Jak BEMER podporuje mikrocirkulaci`, dva kratší odstavce o principu a průběhu terapie, zpřesněné proof boxy a jemnější PubMed vizuál.
- Úvodní mikrocirkulační sekce byla zjemněna: nadštítek `Proč začínáme mikrocirkulací`, nadpis `Mikrocirkulace jako základ regenerace`, bezpečnější úvodní odstavec, upravený insight box a spodní karty ve struktuře zásobení buněk, látková výměna, regenerace a vitalita.
- Ve spodních kartách mikrocirkulační sekce bylo odstraněno číslování 01-03 a ponechány pouze ikonové ilustrace.
- Z video bloku mikrocirkulační sekce byl odstraněn dekorativní play button.
- Hero copy bylo zjemněno: hlavní odstavec vysvětluje BEMER jako neinvazivní terapii využívající pulzní elektromagnetické pole pro podporu mikrocirkulace a body jsou osobnější, včetně domácího vyzkoušení.
- 2026-05-11: Přidán motion/UX polish bez redesignu. Soubory `index.html`, `styles.css` a nový `script.js` doplnily scroll reveal, stagger animace gridů, jemné hover stavy karet a tlačítek, mikroanimaci hero vizuálu, aktivní navigaci, sticky header stav, plynulý FAQ accordion s `aria-expanded`, focus polish formuláře a `prefers-reduced-motion` fallback. Cílem je klidnější prémiový pocit a lepší interaktivita; změna bude po kontrole pushnuta na GitHub Pages.
- 2026-05-11: Menu bylo sladěno s aktuálním obsahem stránky (`Mikrocirkulace`, `BEMER`, `Podpora`, `Spolupráce`, `Reference`, `FAQ`, `Kontakt`), doplněny kotvy `support` a `cooperation` a aktivní stav navigace byl přepsán na výpočet podle scroll pozice, aby se správně zvýraznil i kontakt na konci stránky.
- 2026-05-12: Hero podkladová grafika byla přepracována z kruhového abstraktu na jemnou simulaci elektromagnetického vlnění vycházejícího z horizontální spodní linky/podložky. Animace je velmi pomalá a nevtíravá, respektuje globální reduced-motion fallback.
- 2026-05-12: Hero vlnění bylo rozšířeno na fullscreen šířku viewportu, mírně zvýrazněno a hero dostalo vyšší první viewport s výraznější spodní linkou/podložkou.
- 2026-05-12: Hero sekce byla opravena na skutečný full-bleed layout přes celou šířku viewportu (`100vw`), zatímco textový obsah zůstává zarovnaný do původního vnitřního kontejneru.
- 2026-05-12: Hero elektromagnetické vlnění bylo zvýrazněno pomocí devíti samostatných zdrojů/sond podél spodní linky podložky. Každý zdroj má vlastní jemně posunutou pulzaci, aby efekt působil živěji a atraktivněji, ale pořád klidně a neagresivně.
- 2026-05-12: Z hero backgroundu byla odstraněna diagonální linková textura, protože v kombinaci s animovaným vlněním působila rušivě. Zůstalo čistší elektromagnetické pole se sondami a radiálními vlnami.
- 2026-05-12: Hero background byl posunut z technických kruhových vln na prémiovější `field map` estetiku: dekorativní SVG vrstva s organickými konturami elektromagnetického pole, jemně naznačenou podložkou v perspektivě, zdrojovými body a pomalými pulzy. Vizuál zůstává bez fotografie a respektuje reduced-motion fallback.
- 2026-05-12: Hero field map byla zesílena a posunuta víc do viditelné plochy hero. Hero nyní dostalo vlastní čistý krémový podklad, který překrývá globální diagonální texturu stránky, aby animace a field mapa nebyly rušené ani ztracené.
- 2026-05-12: Field-map experiment v hero byl odstraněn jako vizuálně nevhodný. Hero bylo zjednodušeno na čistý krémový podklad s jemným teplým ambientním glowem a několika decentně pulzujícími body, bez technických čar, SVG kontur a pseudo-podložky.
- 2026-05-12: Na žádost byla do hero vrácena původní kruhová/signální background grafika s radiálními vlnami a oranžovým středem. Hero zůstává full-width přes celou šířku viewportu (`100vw`) s textem zarovnaným do původního vnitřního kontejneru.
