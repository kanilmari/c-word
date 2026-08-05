# C-Word

C-Word on mobiili ensin suunniteltu suomalainen sanaristikkopelin MVP. Sama React- ja TypeScript-koodipohja toimii selaimessa, asennettavana PWA:na sekä Capacitorin kautta Androidilla ja iOS:llä. Kentät, käyttöliittymä ja tallennus toimivat kokonaan ilman verkkopalvelua.

## Mitä toteutus sisältää

- viisi koneellisesti generoitua ja käynnistyksessä validoitavaa 9×9–10×10-kenttää
- risteävät vaaka- ja pystysanat sekä eri kokoihin skaalautuva ruudukko
- keskeneräistä kirjainjonoa vastaavien sananalkujen ja kokonaisten ristikkosanojen korostus
- Pointer Events -pohjainen kirjainkehä hiirelle ja kosketukselle
- valintaviiva, kirjainpaikkojen yksilöinti ja kirjainten sekoitus
- vaihtoehtoinen rajattu näppäimistö poisto-, tyhjennys- ja hyväksymistoiminnoilla
- helposti tunnistettavat ristikkosanat sekä kaikki kentän kirjaimista muodostettavat Nykysuomen sanalistan sanat kerran palkittavina bonus-sanoina
- kenttäkohtainen löydettyjen bonussanojen luettelo ja välitön varoitus jo löydettyä bonussanaa rakennettaessa
- kenttäkohtainen vihjehinta ja satunnainen, aiemmin piilossa olleen solun paljastus
- oletuksena aktiivinen ylläpitäjätila, jossa kenttien välillä voi liikkua vapaasti ja vihjeitä käyttää ilman pisteitä
- vaalea, tumma ja laitteen teemaa seuraava ulkoasu
- ääni- ja värinäasetukset sekä Capacitor Haptics -tuki selainvarmistuksella
- versioitu Dexie/IndexedDB-tallennus
- asennettava PWA, Workbox-välimuisti ja käyttäjän hyväksyntää odottava sovelluspäivitys
- valmiit Android Studio- ja Xcode-projektit hakemistoissa `android/` ja `ios/`

Pelin ilme on alkuperäinen, rauhalliseen pohjoiseen saaristoon perustuva abstrakti maisema. Se ei käytä ulkoisia fontteja, CDN-resursseja tai referenssipelin grafiikkaa.

## Vaatimukset

- Node.js 22 tai uudempi
- npm 10 tai uudempi
- Android-kehitykseen Android Studio ja Android SDK
- iOS-kehitykseen macOS ja Xcode

## Käynnistäminen

Asenna riippuvuudet ja käynnistä kehityspalvelin:

```bash
npm install
npm run dev
```

Vite näyttää paikallisen osoitteen terminaalissa. Kehityspalvelin kuuntelee oletuksena kaikkia verkkoliitäntöjä, jotta peliä voi kokeilla samassa verkossa olevalla puhelimella.

## Pelin testaaminen

Peli käynnistyy paikallisesti komennolla `npm run dev`. Avaa Viten näyttämä osoite selaimessa; samassa lähiverkossa olevan puhelimen voi avata Viten näyttämästä verkko-osoitteesta.

Julkinen lähdekoodi on osoitteessa <https://github.com/kanilmari/c-word>. GitHub Pages ei ole käytössä, koska GitHub toteuttaa myös haarasta julkaisemisen sisäisellä Actions-työnkululla ja tässä projektissa ei käytetä GitHub Actionsia.

## Rakentaminen ja testit

```bash
# TypeScript-tarkistus ja tuotantokäännös
npm run build

# Kenttien generointi lähdedatasta
npm run generate:levels

# Pelilogiikan ja IndexedDB-tallennuksen yksikkötestit
npm test

# Playwright-selain asennetaan kerran
npx playwright install chromium

# Mobiili-Chromiumilla ajettava käyttöliittymätesti
npm run test:e2e

# Tuotantoversion Service Workerilla ajettava offline-testi
npm run test:pwa

```

Playwright-testit muodostavat sanan sekä Pointer Events -vedolla että rajatulla näppäimistöllä, löytävät bonus-sanan, tarkistavat ylläpitäjätilan navigoinnin ja maksuttoman vihjeen, päivittävät sivun sekä varmistavat IndexedDB:stä palautuvan edistymisen. Erillinen PWA-testi rakentaa tuotantoversion, odottaa Service Workerin aktivoitumista, katkaisee selainkontekstin verkkoyhteyden ja lataa pelin uudelleen.

## PWA:n ja offline-tilan testaaminen

```bash
npm run build
npm run preview
```

1. Avaa Viten näyttämä osoite Chromium-pohjaisessa selaimessa.
2. Lataa peli kerran ja tarkista selaimen sovellusvalikosta, että se voidaan asentaa.
3. Valitse kehittäjätyökalujen Network-välilehdellä `Offline`.
4. Päivitä sivu. Käyttöliittymän ja kaikkien viiden kentän pitää latautua edelleen.

Service Worker esivälimuistittaa tuotantokäännöksen HTML-, JavaScript-, CSS-, manifesti- ja SVG-tiedostot. Uusi versio ei vaihdu kesken pelin: sovellus näyttää päivityskehotteen ja aktivoi uuden Service Workerin vasta pelaajan valinnasta.

## Capacitor

Kun web-koodi muuttuu, rakenna ja synkronoi se molempiin natiiviprojekteihin:

```bash
npm run cap:sync
```

Android-projektin avaaminen:

```bash
npm run cap:open:android
```

iOS-projektin avaaminen (vaatii macOS:n ja Xcoden):

```bash
npm run cap:open:ios
```

Jos natiivihakemistot jätetään myöhemmin pois kloonista, ne voi luoda uudelleen komennoilla `npm run cap:add:android` ja `npm run cap:add:ios` ennen synkronointia.

## Projektin rakenne

```text
src/
  components/       käyttöliittymä, ristikko ja kaksi syöttötapaa
  data/             kenttien siemenet, generoitu JSON ja validoitu kenttälataus
  game/             puhdas pelilogiikka, ruudukko, vihjeet ja validointi
  hooks/            pelin tilan ja toimintojen orkestrointi
  platform/         natiivi värinä ja selainvarmistus
  storage/          versioitu Dexie/IndexedDB-repository
  types/            kenttä-, tallennus- ja pelitilan tyypit
e2e/                Playwrightin kokonainen pelipolku
scripts/            deterministiset kenttä- ja natiivikuvakegeneraattorit
data/               generaattorin käyttämä Nykysuomen sanalista 2024
public/icons/       paikalliset PWA-kuvakkeet
android/            Capacitorin Android Studio -projekti
ios/                Capacitorin Xcode-projekti
```

Kenttien käsin ylläpidettävä lähtödata on tiedostossa `src/data/levelSeeds.json`, ja `npm run generate:levels` muodostaa siitä tiedoston `src/data/levels.json`. Generaattori sijoittaa siemenissä luetellut tavalliset sanat risteämään ilman epäselviä sivukosketuksia ja lisää bonus-sanoiksi kaikki kentän kirjaimista muodostettavat, vähintään kaksikirjaimiset sanat lähdesanalistasta. Generointi on deterministinen. `validateLevel` normalisoi sanat isoiksi säilyttäen Ä:n, Ö:n ja Å:n ja tarkistaa muun muassa kirjainmäärät, ruudukon rajat, risteykset, päällekkäisyydet sekä ristikko- ja bonus-sanojen erillisyyden.

Sanaston lähteenä käytetään Kotimaisten kielten keskuksen **Nykysuomen sanalistaa 2024** (CC BY 4.0). Raakaa sanalistaa käytetään vain generoinnin aikana, eikä sitä toimiteta selainpaketissa. Lähde, lisenssi ja tehdyt tekniset muunnokset on kuvattu tiedostossa [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

Tallennus käyttää tietokantaa `c-word-db`. Skeemaversio 1 säilyttää ratkaistut sanat, bonus-sanat ja -pisteet, paljastetut solut, nykyisen ja valmistuneet kentät, pelivaluutan sekä syöttö-, teema-, ylläpitäjä-, ääni- ja värinäasetukset. Ylläpitäjätila on oletuksena päällä ja sen voi poistaa asetuksista. Käyttöliittymä tuntee vain `SaveRepository`-rajapinnan, joten pilvisynkronointi voidaan lisätä myöhemmin sen rinnalle.

## MVP:n ulkopuolelle jätetty

- sanojen yleisyyteen perustuva sanastoluokitus ja graafinen kenttäeditori
- kirjautuminen, palvelin ja pilvisynkronointi
- kaupallistaminen, mainokset ja oikeat sovelluksen sisäiset ostot
- tuotantotasoinen äänimaailma, kuvituspaketti ja natiivien kauppapaikkojen julkaisuautomaatio
- analytiikka, saavutettavuuden erillinen auditointi ja fyysisten laitteiden testimatriisi

## Jatkokehitysideoita

- kenttäeditori, vaikeustasot ja suurempi allekirjoitettu offline-kenttäpaketti
- päivittäinen haaste ja laitekohtaiset saavutukset ilman pakollista tiliä
- parempi ruudunlukijan ristikkonavigointi ja säädettävä tekstikoko
- oma äänipaketti, natiivisti tuotetut kuvake- ja käynnistyskuvavariantit
- `SaveRepository`-rajapinnan taakse valinnainen päästä päähän salattu pilvivarmistus
- CI-putki yksikkö-, Playwright-, Android- ja iOS-rakennuksille
