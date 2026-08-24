import type { Tournament } from '@fastcup/shared';
import { detectCurrentPage } from './routes';

/** Adapter boundary: it reads page-owned data and never calls FASTCUP private APIs. */
export function parseCurrentFastcupPage(): Pick<Tournament, 'status' | 'parserVersion'> {
  return { status: detectCurrentPage() === 'tournament' ? 'PARTIAL' : 'PARSE_FAILED', parserVersion: 1 };
}
