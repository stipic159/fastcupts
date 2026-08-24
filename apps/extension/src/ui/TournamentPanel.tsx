import { config } from '../config';

export function TournamentPanel() {
  return (
    <section aria-label="FASTCUP Tournament Scout" style={{ font: '14px system-ui', margin: 12 }}>
      <strong>FASTCUP Tournament Scout</strong>
      <p>Парсер FASTCUP v{config.parserVersion} готов к анализу страницы.</p>
    </section>
  );
}
