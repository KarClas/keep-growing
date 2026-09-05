/**
 * Minimalistische, gemütliche Vektor-Hintergründe für das Pflanzen-Profilbild:
 * 1. LittleHomeBackground: Ein gemütliches Zuhause (Drinnen) mit warmem Ton, Holzboden,
 *    Bogenfenster mit sanftem Tageslicht und kleiner Hängeleuchte.
 * 2. LittleGardenBackground: Ein gemütlicher Garten (draußen) mit sanftem Himmel,
 *    sanfter Morgensonne, sanften Hügeln, kleinem Holzzaun und Rasen.
 *
 * Farbpalette: Halbpall, warm, erdig, ohne kleinteilige Details.
 */

export function LittleHomeBackground() {
  return (
    <svg
      viewBox="0 0 176 176"
      className="h-full w-full object-cover"
      xmlns="http://www.w3.org/2000/svg"
      role="presentation"
    >
      {/* Gemütliche, warme Zimmerwand */}
      <rect width="176" height="176" fill="#f6ece0" />

      {/* Sanfter warmer Lichtkegel von oben links */}
      <polygon points="0,0 90,0 130,176 0,176" fill="#fbf3ea" opacity="0.45" />

      {/* Zartes Bogenfenster links */}
      <g opacity="0.9">
        {/* Fensterrahmen außen */}
        <path
          d="M18,36 A18,18 0 0,1 54,36 L54,92 L18,92 Z"
          fill="#e8dacb"
        />
        {/* Fensteröffnung mit sanftem Himmelblau */}
        <path
          d="M21,37 A15,15 0 0,1 51,37 L51,89 L21,89 Z"
          fill="#e2edf2"
        />
        {/* Zarte kleine Wolke im Fenster */}
        <ellipse cx="32" cy="50" rx="6" ry="3.5" fill="#ffffff" opacity="0.75" />
        <ellipse cx="37" cy="48" rx="4.5" ry="3" fill="#ffffff" opacity="0.85" />
        {/* Sprossen */}
        <line x1="21" y1="58" x2="51" y2="58" stroke="#e8dacb" strokeWidth="1.5" />
        <line x1="36" y1="36" x2="36" y2="89" stroke="#e8dacb" strokeWidth="1.5" />
        {/* Fensterbank */}
        <rect x="15" y="91" width="42" height="4" rx="2" fill="#d9c7b4" />
      </g>

      {/* Minimalistisches Bild an der rechten Wand */}
      <g opacity="0.85">
        <rect x="122" y="38" width="34" height="42" rx="3" fill="#efe4d6" stroke="#d5c2ae" strokeWidth="1.5" />
        <circle cx="139" cy="52" r="5.5" fill="#e7a57a" opacity="0.85" />
        <path d="M125,72 Q136,60 144,65 T153,74 Z" fill="#b9c7a7" />
      </g>

      {/* Schlichte kleine Hängeleuchte von oben */}
      <line x1="94" y1="0" x2="94" y2="24" stroke="#8a7c6e" strokeWidth="1.2" />
      <path d="M84,24 L104,24 L99,19 L89,19 Z" fill="#d97d54" />
      <ellipse cx="94" cy="24" rx="10" ry="2.5" fill="#f7e1b5" />

      {/* Warmer Holzboden / Fensterbank-Boden */}
      <rect x="0" y="132" width="176" height="44" fill="#deb897" />
      {/* Fußleiste */}
      <rect x="0" y="129" width="176" height="3" fill="#caa17e" />
      {/* Zarte Dielenfugen */}
      <line x1="56" y1="132" x2="56" y2="176" stroke="#c89d78" strokeWidth="1" opacity="0.5" />
      <line x1="120" y1="132" x2="120" y2="176" stroke="#c89d78" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

export function LittleGardenBackground() {
  return (
    <svg
      viewBox="0 0 176 176"
      className="h-full w-full object-cover"
      xmlns="http://www.w3.org/2000/svg"
      role="presentation"
    >
      {/* Zarter, beruhigender Garten-Himmel */}
      <rect width="176" height="176" fill="#e5f0f3" />

      {/* Sanfte, warme Morgensonne */}
      <circle cx="136" cy="38" r="16" fill="#fde6bf" opacity="0.9" />
      <circle cx="136" cy="38" r="23" fill="#fde6bf" opacity="0.3" />

      {/* Schwebende sanfte Wolke */}
      <g fill="#ffffff" opacity="0.6">
        <circle cx="48" cy="36" r="8" />
        <circle cx="60" cy="33" r="11" />
        <circle cx="73" cy="36" r="7" />
      </g>

      {/* Sanfte, ferne Hügelkette */}
      <path
        d="M-20,105 Q35,75 90,92 T200,88 L200,176 L-20,176 Z"
        fill="#cfdec9"
      />
      <path
        d="M-20,118 Q55,96 115,108 T200,105 L200,176 L-20,176 Z"
        fill="#b8ceaf"
      />

      {/* Kleiner, gemütlicher Holzzaun auf der linken Seite */}
      <g opacity="0.95">
        {/* Querriegel */}
        <rect x="8" y="112" width="46" height="3" rx="1.5" fill="#ded0bc" />
        <rect x="8" y="122" width="46" height="3" rx="1.5" fill="#ded0bc" />
        {/* Zaunlatten mit abgerundeter Spitze */}
        {[12, 22, 32, 42].map((x) => (
          <path
            key={x}
            d={`M${x},130 L${x},102 L${x + 3.5},98 L${x + 7},102 L${x + 7},130 Z`}
            fill="#ede1cd"
            stroke="#d8c5ad"
            strokeWidth="0.8"
          />
        ))}
      </g>

      {/* Kleiner Busch rechts im Hintergrund */}
      <g opacity="0.85">
        <circle cx="148" cy="116" r="10" fill="#93b089" />
        <circle cx="158" cy="118" r="8" fill="#81a177" />
        <circle cx="140" cy="120" r="7" fill="#81a177" />
        {/* Drei kleine warme Blütenpunkte */}
        <circle cx="146" cy="113" r="1.5" fill="#f0967d" />
        <circle cx="156" cy="115" r="1.5" fill="#f0967d" />
        <circle cx="141" cy="119" r="1.5" fill="#f0967d" />
      </g>

      {/* Saftiger, sanfter Rasenboden im Vordergrund */}
      <path
        d="M0,130 Q88,126 176,130 L176,176 L0,176 Z"
        fill="#96b58b"
      />
      {/* Rasenkante / Beeteinfassung */}
      <path
        d="M0,131 Q88,127 176,131"
        stroke="#84a579"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}
