# Tehtävä: offline-toimiva sanaristikkopeli webille, Androidille ja iOS:lle

Rakenna toimiva MVP sanaristikkopelistä. Sovellus toteutetaan yhdellä web-koodipohjalla, joka toimii:

- selaimessa
- asennettavana PWA-sovelluksena
- Androidilla Capacitor-sovelluksena
- iOS:llä Capacitor-sovelluksena
- kokonaan ilman verkkoyhteyttä ensimmäisen asennuksen jälkeen

Liitän mukaan kaksi referenssikuvaa. Käytä niitä vain käyttöliittymän rakenteen ja pelimekaniikan inspiraationa. Älä kopioi toisen pelin nimeä, grafiikkaa, brändiä, ikoneita tai muuta tunnistettavaa visuaalista ilmettä. Tee sovellukselle alkuperäinen ulkoasu.

## Teknologiat

Käytä seuraavaa kokonaisuutta:

- React
- TypeScript
- Vite
- Capacitor
- PWA ja Service Worker
- Workbox tai Viten yhteensopiva PWA-ratkaisu
- IndexedDB
- Dexie IndexedDB:n käsittelyyn
- SVG tai tavalliset HTML-elementit sanaristikon piirtämiseen
- Pointer Events kirjainrullan vetämiseen
- Vitest yksikkötesteihin
- Playwright tärkeimpiin käyttöliittymätesteihin

Jos repositoriossa on jo toimiva tekninen rakenne, tutki se ensin ja sovita toteutus olemassa oleviin käytäntöihin. Jos repositorio on tyhjä, alusta projekti.

## Pelin perusidea

Pelaajalle annetaan rajattu joukko kirjaimia. Pelaaja muodostaa sanoja joko:

1. vetämällä sormea kirjainrullan kirjainten välillä
2. käyttämällä vaihtoehtoista näppäimistöä, jossa näkyvät vain kentän kirjaimet

Muodostettu sana tarkistetaan, kun pelaaja vapauttaa sormen tai painaa hyväksymispainiketta.

Sanalla voi olla kolme tulosta:

- Sana kuuluu ristikkoon: täytä kaikki sanan ruudut.
- Sana on hyväksytty bonus-sana mutta ei kuulu ristikkoon: lisää bonuspisteitä.
- Sana ei ole hyväksytty: näytä lyhyt virhetilan animaatio ja kevyt värinä, jos laite tukee sitä.

Samaa ristikkosanaa tai bonus-sanaa ei saa palkita useita kertoja.

## Sanaristikko

Toteuta ruudukko, jossa:

- käyttämättömät solut eivät näy
- aktiiviset tyhjät solut näkyvät vaaleina ruutuina
- ratkaistut kirjaimet ilmestyvät animoidusti
- sanat voivat kulkea vaaka- tai pystysuunnassa
- risteävät sanat jakavat saman solun
- ruudukko skaalautuu eri näyttökoille
- koko ristikko pysyy näkyvissä ilman vaakasuuntaista vieritystä

Ristikon data ei saa olla kovakoodattuna käyttöliittymäkomponenttiin.

## Kirjainrulla

Toteuta pyöreä kirjainrulla, jossa:

- kirjaimet sijoitetaan tasaisesti ympyrän kehälle
- valinta alkaa painamalla kirjainta
- pelaaja vetää sormea seuraavien kirjainten yli
- valittujen kirjainten välille piirretään näkyvä viiva
- samaa kirjainpaikkaa ei voi käyttää kahdesti saman vedon aikana, ellei kenttädatan asetus erikseen salli sitä
- muodostuva sana näkyy rullan yläpuolella
- valitut kirjaimet korostetaan
- sormen vapauttaminen lähettää arvauksen
- ulos rullasta vetäminen ei kaada tai lukitse käyttöliittymää
- toiminta toimii sekä kosketuksella että hiirellä

Lisää rullan keskelle sekoituspainike, joka vaihtaa kirjainten paikkoja muuttamatta käytettävissä olevia kirjaimia.

## Vaihtoehtoinen näppäimistö

Lisää asetuksista valittava syöttötapa:

- kirjainrulla
- rajattu näppäimistö

Näppäimistötilassa:

- näytä vain kentässä käytettävät kirjaimet
- saman kirjaimen useat esiintymät käsitellään erillisinä kirjainpaikkoina
- näytä muodostuva sana
- lisää poista-painike
- lisää tyhjennä-painike
- lisää hyväksy-painike
- estä liian monen saman kirjaimen käyttäminen

Molempien syöttötapojen tulee käyttää samaa pelilogiikkaa.

## Bonuspisteet ja vihjeet

Toteuta bonusjärjestelmä:

- jokainen uusi hyväksytty bonus-sana antaa yhden bonuspisteen
- 100 bonuspistettä voidaan vaihtaa yhteen paljastettuun kirjaimeen
- paljastettava kirjain valitaan satunnaisesti ratkaisemattomista soluista
- jo näkyvää kirjainta ei saa paljastaa uudelleen
- jos ratkaisemattomia soluja ei ole, vihjettä ei voi ostaa
- bonuspisteiden kulutus tallennetaan pysyvästi

Näytä bonuspisteiden edistyminen esimerkiksi muodossa `46 / 100`.

Lisää myös kehitystä varten asetettava kenttäkohtainen vihjehinta, jonka oletusarvo on 100.

## Kenttädata

Luo kentille selkeä JSON-rakenne.

Esimerkkimuoto:

```json
{
  "id": "level-001",
  "title": "Ensimmäinen kenttä",
  "letters": ["R", "A", "T", "O", "R", "T"],
  "words": [
    {
      "answer": "RAT",
      "row": 0,
      "column": 0,
      "direction": "vertical"
    }
  ],
  "bonusWords": ["TAR", "ROT"],
  "hintCost": 100,
  "allowRepeatedLetterNode": false
}
```

Toteuta kentän validointi ennen pelin käynnistämistä.

Validoinnin tulee tarkistaa ainakin:

* sanoissa käytetään vain kentän kirjaimia
* samaa kirjainta ei käytetä useammin kuin kirjainjoukko sallii
* sanat eivät mene ruudukon ulkopuolelle
* risteävissä soluissa on sama kirjain
* sanat eivät törmää ristiriitaisesti
* vastaukset ovat isoilla kirjaimilla tai normalisoidaan yhdenmukaisesti
* sama sana ei ole sekä ristikkosana että bonus-sana

Luo vähintään kolme esimerkkikenttää.

## Suomen kielen käsittely

Normalisoi arvaukset seuraavasti:

* muuta sana isoiksi kirjaimiksi
* poista sanan alusta ja lopusta välilyönnit
* säilytä Ä, Ö ja Å
* älä muuta Ä-kirjainta A:ksi tai Ö-kirjainta O:ksi
* hyväksy vain kentän määrittelemät sanat

MVP:ssä sanaston ei tarvitse perustua verkkopalveluun. Kentän ristikkosanat ja bonus-sanat ovat paikallista dataa.

Tee sanaston tarkistusrajapinta niin, että myöhemmin voidaan ottaa käyttöön suurempi paikallinen sanakirja.

## Tallennus

Tallenna IndexedDB:hen:

* ratkaistut sanat
* löydetyt bonus-sanat
* bonuspisteet
* paljastetut kirjaimet
* nykyinen kenttä
* läpäistyt kentät
* valittu syöttötapa
* ääni- ja värinäasetukset
* keskeneräisen kentän tila

Sovelluksen sulkeminen tai sivun päivittäminen ei saa kadottaa edistymistä.

Versioi tallennusrakenne niin, että tietokantamigraatiot voidaan tehdä myöhemmin.

## Offline ja PWA

Tee sovelluksesta aidosti offline-toimiva:

* sovelluksen käyttöliittymä tallennetaan Service Workerin välimuistiin
* kaikki mukana toimitettavat kentät toimivat offline-tilassa
* fontit, ikonit ja muut olennaiset resurssit eivät saa riippua ulkoisista CDN-palveluista
* sovellus käynnistyy offline-tilassa myös sivun uudelleenlatauksen jälkeen
* lisää web app manifest
* lisää asennettavat sovellusikonit tai selkeät placeholder-kuvat
* lisää offline-päivityksen hallinta niin, ettei uusi versio riko käynnissä olevaa peliä

Älä lisää MVP:hen pakollista palvelinta, kirjautumista tai pilvisynkronointia.

Luo kuitenkin tallennuskerroksen ympärille rajapinta, jonka avulla pilvisynkronointi voidaan myöhemmin lisätä.

## Käyttöliittymä

Rakenna mobiili ensin -periaatteella yhden näkymän peliruutu:

* ylärivillä bonuspisteet, mahdollinen pelivaluutta ja asetuspainike
* keskellä sanaristikko
* ristikon alla muodostuva sana ja palaute
* alhaalla kirjainrulla tai näppäimistö
* erillinen vihjepainike
* kentän valmistuessa valmisnäkymä ja seuraava kenttä -painike

Tee taustasta ja elementeistä alkuperäiset. Käytä esimerkiksi rauhallista maisemataustaa tai abstraktia väriliukua, mutta pidä ristikon luettavuus hyvänä.

Huomioi:

* tumma ja vaalea teema
* safe area iPhonessa
* pienet Android-näytöt
* tabletit
* näytön kääntäminen
* vähintään 44 × 44 pikselin kosketuskohteet
* riittävä kontrasti
* vähennettyjen animaatioiden järjestelmäasetus

## Animaatiot ja palaute

Lisää kevyet animaatiot:

* kirjainten valinta
* valintaviivan muodostuminen
* oikean sanan siirtyminen ristikkoon
* bonus-sanan hyväksyminen
* virheellisen sanan ravistus
* kirjaimen paljastuminen
* kentän valmistuminen

Älä tee animaatioista hitaita. Pelin pitää tuntua välittömältä.

Käytä Capacitorin värinärajapintaa mobiilissa ja turvallista fallbackia selaimessa.

## Arkkitehtuuri

Erota ainakin seuraavat vastuut toisistaan:

* kenttädatan lataaminen ja validointi
* pelin tilakone
* arvauksen tarkistus
* ristikon tilan laskenta
* bonuspisteet ja vihjeet
* tallennus
* syöttötavat
* käyttöliittymä
* alustakohtaiset ominaisuudet

Älä sijoita kaikkea yhteen komponenttiin.

Suosi puhtaita TypeScript-funktioita pelilogiikassa, jotta niitä voidaan testata ilman selainta.

## Testit

Kirjoita yksikkötestit ainakin seuraaville tapauksille:

* ristikkosanan hyväksyminen
* bonus-sanan hyväksyminen
* saman sanan uudelleen arvaaminen
* virheellinen sana
* kirjainten riittävyyden tarkistus
* risteävien sanojen validointi
* vihjeen ostaminen
* vihjeen estäminen liian vähillä pisteillä
* jo paljastetun solun välttäminen
* pelitilan tallennus ja palautus
* kentän valmistumisen tunnistus
* Ä- ja Ö-kirjainten käsittely

Kirjoita Playwright-testi ainakin yhdelle kokonaiselle pelipolulle:

1. avaa peli
2. muodosta sana
3. tarkista sanan ilmestyminen ristikkoon
4. löydä bonus-sana
5. päivitä sivu
6. varmista, että edistyminen säilyi

## Capacitor

Lisää Capacitor-konfiguraatio Androidia ja iOS:ää varten.

Dokumentoi README-tiedostossa komennot:

* kehityspalvelimen käynnistäminen
* tuotantoversion rakentaminen
* testien suorittaminen
* PWA-version testaaminen
* Capacitor-resurssien synkronointi
* Android-projektin avaaminen
* iOS-projektin avaaminen

Älä oleta, että iOS-versiota voidaan kääntää ilman macOS:ää, mutta valmistele projekti sitä varten.

## Toimitettava lopputulos

Toteuta toimiva projekti, älä pelkkää suunnitelmaa.

Toimita:

* lähdekoodi
* selkeä hakemistorakenne
* kolme pelattavaa esimerkkikenttää
* PWA-konfiguraatio
* Capacitor-konfiguraatio
* IndexedDB-tallennus
* kirjainrulla
* rajattu näppäimistö
* bonuspisteet
* vihjetoiminto
* testit
* README
* lista mahdollisista jatkokehityskohteista

## Työskentelytapa

Aloita tutkimalla repositorion nykyinen sisältö.

Sen jälkeen:

1. Tee lyhyt toteutussuunnitelma.
2. Alusta tai täydennä projekti.
3. Toteuta ensin pelilogiikka ja testit.
4. Toteuta ristikkonäkymä.
5. Toteuta kirjainrulla.
6. Toteuta näppäimistötila.
7. Lisää tallennus.
8. Lisää offline- ja PWA-tuki.
9. Lisää Capacitor.
10. Suorita testit ja tuotantokäännös.
11. Korjaa löytämäsi virheet.
12. Päivitä README vastaamaan todellista toteutusta.

Älä pysähdy pyytämään vahvistusta tavallisissa teknisissä valinnoissa. Tee järkevät oletukset ja dokumentoi ne.

Kun työ on valmis, kerro:

* mitä toteutit
* mitä tiedostoja muutit
* mitä komentoja suoritit
* läpäisivätkö testit
* onnistuiko tuotantokäännös
* mitkä asiat jäivät tarkoituksella MVP:n ulkopuolelle


