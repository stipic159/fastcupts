export const config = {
  apiBaseUrl: import.meta.env.WXT_SCOUT_API_BASE_URL ?? '',
  parserVersion: 1,
  features: {
    eloViewer: true,
    tournamentExport: true,
    simulation: true,
    bracketAnalysis: true,
    recentForm: false,
    advancedStrength: false,
  },
} as const;
