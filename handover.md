# C-Word – valmistuneen työn luovutus

Päivä: 4.8.2026

## Tulos

Luovutuksessa keskeneräiseksi merkitty muutoskokonaisuus on toteutettu ja varmennettu:

1. Pakolliset ristikkosanat valitaan tavallisten, helposti tunnistettavien suomen sanojen ehdokaslistoista.
2. Kaikki kentän kirjaimista muodostettavat Nykysuomen sanalistan hyväksytyt sanat lisätään bonus-sanoiksi, ristikkosanoja lukuun ottamatta.
3. Viisi ristikkoa generoidaan koneellisesti. Ne ovat 9×9–10×10-kokoisia ja sisältävät 12–15 sanaa.
4. Ylläpitäjätila on oletuksena päällä. Se sallii vapaan kenttänavigoinnin ja maksuttomat vihjeet.
5. Kirjainkehän keskipainike käyttää risteävien nuolten kuvaketta ja tekstiä `Sekoita`.
6. Kirjainkehän vetoa voi peruuttaa palaamalla edelliseen kirjainpaikkaan.
7. Keskeneräinen sana korostaa ristikosta vastaavat sanan alut tai kokonaisen sanan. Löydetyt bonus-sanat voi avata pelinäkymästä, ja jo löydetty bonus tunnistetaan jo rakennusvaiheessa.

## Lopulliset kentät

- `level-001`: 14 ristikkosanaa, 36 bonus-sanaa, 10×10
- `level-002`: 15 ristikkosanaa, 115 bonus-sanaa, 10×10
- `level-003`: 14 ristikkosanaa, 57 bonus-sanaa, 10×10
- `level-004`: 15 ristikkosanaa, 46 bonus-sanaa, 9×9
- `level-005`: 12 ristikkosanaa, 30 bonus-sanaa, 9×9

Generaattori estää nyt sanojen epäselvät sivukosketukset. Jokainen valmiissa ruudukossa vaakaan tai pystyyn näkyvä vähintään kaksikirjaiminen jakso vastaa täsmälleen yhtä määriteltyä ristikkosanaa. Generointi on deterministinen; kahden peräkkäisen ajon `src/data/levels.json`-tunniste oli:

```text
881e2d6b8751a3b76a2bf0aa30d03f008566384bd4ef4e53083462b2400ec7b6
```

## Varmennukset

Kaikki seuraavat tarkistukset läpäisivät 4.8.2026:

- `npm run generate:levels`
- `npm run typecheck`
- `npm test`: 4 testitiedostoa, 20 testiä
- `npm run build`
- `npm run test:e2e`: 3 Playwright-testiä
- `npm run test:pwa`: tuotantoversion offline-uudelleenlataus
- `npm run cap:sync`: web-resurssit synkronoitu Android- ja iOS-projekteihin

Lisäksi Chromiumilla tarkistettiin:

- kaikki viisi kenttää 412×915-puhelin- ja 1440×1000-työpöytäkoossa
- pieni 360×640-pystynäkymä ja 915×412-vaakanäkymä ilman ylivuotoa
- hiiri- ja kosketusveto
- sekoituspainikkeen toiminta
- ylläpitäjätilan poistaminen ja navigointipainikkeiden katoaminen
- ylläpitäjätilan maksuton vihje sekä normaalitilan 100 pisteen vihjekulutus

Pienen näytön tarkistuksessa löydetty ylläpitäjämerkin kutistuminen korjattiin. Samalla poistettiin `color-mix()`-riippuvuus kiinteän RGBA-värin hyväksi.

## Dokumentaatio ja aineisto

- Kenttien lähtödata: `src/data/levelSeeds.json`
- Generaattori: `scripts/generate-levels.mjs`
- Generoitu pelidata: `src/data/levels.json`
- Sanalista: `data/nykysuomensanalista2024.txt`
- Kotus-attribuutio ja CC BY 4.0 -lisenssi: `THIRD_PARTY_NOTICES.md`
- Generaattorin käyttö, kenttärakenne ja ylläpitäjätila: `README.md`

## Nimi, julkaisu ja palautettavuus

Sovelluksen näkyvä nimi on `C-Word`, npm- ja GitHub-nimi `c-word`, natiivipakettitunniste `fi.cword.app` ja IndexedDB-tietokanta `c-word-db`. Julkinen lähdekoodirepositorio on `https://github.com/kanilmari/c-word`. GitHub Pages ei ole käytössä, koska myös haarajulkaisu käynnistää GitHubin sisäisen Actions-työnkulun.

Ennen varmennus- ja julkaisutyötä tehtiin lähdekoodivarmuuskopio:

```text
/tmp/c-word-handover-20260804.tar.gz
SHA-256 6a4d5459589411e496883675ce142186c4adfc886c2f6eb3271e81e0401341eb
```

Varmuuskopio ei sisällä `node_modules`- tai rakennushakemistoja. Projekti alustettiin myöhemmin Git-repositorioksi `main`-haaralle GitHub-julkaisua varten.

## Jäljelle jäävät tuotepäätökset ja laitetestit

- Bonus-sanojen vähimmäispituus on kaksi kirjainta. Mahdollinen nosto kolmeen on tuotepäätös käyttäjätestin jälkeen.
- Kotuksen sanalista sisältää harvinaisia ja erikoisalojen sanoja. Ne voivat olla bonus-sanoja, mutta eivät pakollisia ristikkosanoja.
- Android- ja iOS-resurssit on synkronoitu, mutta fyysisten laitteiden testimatriisia tai kauppapaikkarakennuksia ei ajettu tässä ympäristössä.
