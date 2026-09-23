// About the Founders — homepage-sectie.
// Nog NIET in de nav of een productie-route gehangen; los te bekijken via de tijdelijke
// route /founders-preview. Visuele referentie: docs/mockups/about-the-founders.html.
// Kleuren, typografie en spacing volgen de bestaande design tokens (zie de .founders-*
// classes in globals.css), niet de hardcoded hex uit de mockup.

import FounderCard, { type Founder } from './FounderCard';

const FOUNDERS: Founder[] = [
  {
    name: 'Paul',
    img: '/founders/paul-pixel.png',
    alt: 'Pixel portrait of Paul, SolanaSweeper co-founder',
    blurb: 'Been here since the forum days. Still opens the terminal before his coffee.',
    chip: 'Class of 2016',
    // Huidtinten uit paul-pixel.png
    skin: ['#b8724c', '#b35b2e', '#472411'],
    // Mond net onder de snor (rij 33–34), tanden over de lichte lip op rij 35–37
    smile: { x: 20, y: 35, teeth: '#f2e8dc', dark: '#472411' },
    // Groene ogen, net onder de rand van zijn hoed
    eyes: { color: '#4f9e5a', light: '#7cc487', left: [20, 27], right: [27, 27] },
  },
  {
    name: 'Frank',
    img: '/founders/frank-pixel.png',
    alt: 'Pixel portrait of Frank, SolanaSweeper co-founder',
    blurb: 'Came in through the noise of 2017, survived the winter, never left.',
    chip: 'Class of 2017',
    // Huidtinten uit frank-pixel.png
    skin: ['#f39b78', '#e98c6f', '#6d483e'],
    // Zelfde gebit als Paul (bewust identiek: kleuren én vorm), alleen de positie verschilt
    smile: { x: 19, y: 34, teeth: '#f2e8dc', dark: '#472411' },
    // Ogen gaan kort open: gedempt oogwit, grijsblauwe iris, ooglidlijn erboven. Beide op
    // rij 26 en identiek; de oorspronkelijke rechteroogpixels op rij 27 worden zolang in
    // huidtint overschilderd zodat er geen dubbel oog ontstaat.
    eyes: {
      color: '#6d93b3', light: '#6d93b3', left: [20, 26], right: [25, 26],
      open: { sclera: '#e3d6cf', lid: '#5c3b32' }, brief: true,
      cover: { color: '#e07d60', cells: [[26, 27], [27, 27]] },
    },
  },
];

export default function FoundersSection() {
  return (
    <section className="founders-section" aria-labelledby="founders-heading">
      <div className="founders-inner">
        <p className="founders-eyebrow">About the founders</p>
        <h1 id="founders-heading" className="founders-title">
          Who builds SolanaSweeper?
        </h1>
        <p className="founders-lede">
          SolanaSweeper is built by two people who have been in this space since before it had
          one. <b>Paul since 2016, Frank since 2017.</b>
        </p>

        <div className="founders-cards">
          {FOUNDERS.map((f) => (
            <FounderCard key={f.name} founder={f} />
          ))}
        </div>

        <div className="founders-copy">
          <p>
            Paul arrived in 2016. Crypto wasn’t an asset class back then; it was just a raw,
            chaotic forum full of idealists. The DAO had just been drained, Ethereum split in two,
            and everyone left standing was either a true believer or too stubborn to quit.
          </p>
          <p>
            Price talk was something that happened in the margins of arguments about protocol
            architecture. Nobody had a media strategy. Nobody had a pitch deck. You showed up,
            broke things, learned, and stayed up until it made sense.
          </p>
          <p>
            Frank stepped in a year later, class of 2017, right into the peak noise. A whitepaper
            and a hype Telegram group could raise eight figures overnight. Half of it was brilliant,
            most of it was garbage, and learning to spot the difference in real time was our
            masterclass. Then the winter hit. The tourists packed up and left.
          </p>
          <p>
            That’s the chapter most founders skip. Bear markets are where you learn who people
            actually are. We watched brilliant teams dissolve when the money stopped, and quiet
            builders stay behind to keep committing code. It taught us the single rule we live by:{' '}
            <strong>
              the technology is why we started, but trust and community are the only reasons anyone
              survives.
            </strong>
          </p>
          <p>
            We learned that lesson again, the raw way, in the meme space. No roadmap, no treasury,
            no corporate safety net. Just a group chat and the answer to one simple question: does
            anyone still care on day 40 when the hype fades? If you can build genuine culture there,
            you can build it anywhere.
          </p>
          <p>
            But we didn’t come here to stay behind a screen. We came to build real infrastructure.
            Solana is the only chain where all of it collides at once: the engineers, the degens,
            the artists, and the people shipping code at 3 AM simply because it needs to exist.
          </p>
          <p>
            It’s fast and cheap, sure, but that’s not why we’re here. We’re here because it’s{' '}
            <em>alive</em>.
          </p>
          <p>
            Crypto started as punk with a compiler. Somewhere between the institutional ETF filings
            and polished compliance decks, the edges got sanded off. We aren’t interested in the
            sanitized version.{' '}
            <strong>
              We’ve been here through the crashes, the hacks, and the winters. We’re still
              here, shipping code every single day.
            </strong>
          </p>
        </div>

        <div className="founders-rule" />
        <p className="founders-signoff">
          Paul, class of 2016. Frank, class of 2017.
          <br />
          <span>Solana is for builders. Let’s build.</span>
        </p>
      </div>
    </section>
  );
}
