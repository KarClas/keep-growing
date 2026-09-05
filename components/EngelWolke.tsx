export function EngelWolke({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 160 140" width="100%" height="100%" role="img" aria-label={`${name}, in liebevoller Erinnerung`}>
      <g fill="#eef3fb">
        <ellipse cx="80" cy="112" rx="55" ry="20" />
        <ellipse cx="45" cy="107" rx="22" ry="16" />
        <ellipse cx="115" cy="107" rx="22" ry="16" />
      </g>
      <path d="M58 70 q-20 -6 -14 20 q14 4 20 -10 Z" fill="#ffffff" stroke="#e7dcc4" strokeWidth={1.5} />
      <path d="M102 70 q20 -6 14 20 q-14 4 -20 -10 Z" fill="#ffffff" stroke="#e7dcc4" strokeWidth={1.5} />
      <path d="M80 60 q-22 10 -18 40 h36 q4 -30 -18 -40 Z" fill="#fff8ec" stroke="#e7dcc4" strokeWidth={1.5} />
      <ellipse cx="80" cy="38" rx="14" ry="5" fill="none" stroke="#f2c94c" strokeWidth={3} />
      <circle cx="80" cy="52" r="10" fill="#ffe3c2" />
      <path d="M75 52 q5 5 10 0" stroke="#7a5230" strokeWidth={2} strokeLinecap="round" fill="none" />
      <circle cx="76" cy="49" r="1.3" fill="#7a5230" />
      <circle cx="84" cy="49" r="1.3" fill="#7a5230" />
    </svg>
  );
}
