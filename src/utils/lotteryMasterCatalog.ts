import { MasterLottery, ValidatedLottery } from '../types/lottery';

export const DEFAULT_MASTER_LOTTERIES: MasterLottery[] = [
  // New York
  {
    code: 'NY AM',
    fullName: 'New York Numbers Midday (Mañana)',
    region: 'USA',
    schedule: 'AM / Mañana',
    aliases: ['NY MID', 'NY DAY', 'NYA', 'NY-AM', 'NY 1', 'NEW YORK AM', 'NYAM'],
  },
  {
    code: 'NY PM',
    fullName: 'New York Numbers Evening (Tarde/Noche)',
    region: 'USA',
    schedule: 'PM / Tarde',
    aliases: ['NY EVE', 'NY NIGHT', 'NYP', 'NY-PM', 'NY 2', 'NEW YORK PM', 'NYPM'],
  },
  // Florida
  {
    code: 'FL AM',
    fullName: 'Florida Pick Midday (Mañana)',
    region: 'USA',
    schedule: 'AM / Mañana',
    aliases: ['FL MID', 'FL DAY', 'FLA', 'FL-AM', 'FL 1', 'FLORIDA AM', 'FLAM'],
  },
  {
    code: 'FL PM',
    fullName: 'Florida Pick Evening (Tarde/Noche)',
    region: 'USA',
    schedule: 'PM / Tarde',
    aliases: ['FL EVE', 'FL NIGHT', 'FLP', 'FL-PM', 'FL 2', 'FLORIDA PM', 'FLPM'],
  },
  // Georgia
  {
    code: 'GA AM',
    fullName: 'Georgia Cash Midday (Mañana)',
    region: 'USA',
    schedule: 'AM / Mañana',
    aliases: ['GA MID', 'GA DAY', 'GAA', 'GA-AM', 'GA 1', 'GEORGIA AM', 'GAAM'],
  },
  {
    code: 'GA PM',
    fullName: 'Georgia Cash Evening',
    region: 'USA',
    schedule: 'PM / Tarde',
    aliases: ['GA EVE', 'GA NIGHT', 'GAP', 'GA-PM', 'GEORGIA PM', 'GAPM'],
  },
  {
    code: 'GA EVE',
    fullName: 'Georgia Cash Night / Evening',
    region: 'USA',
    schedule: 'Noche',
    aliases: ['GA NOCHE', 'GAE', 'GA-EVE', 'GAEVE'],
  },
  // Maryland
  {
    code: 'MD AM',
    fullName: 'Maryland Pick Midday (Mañana)',
    region: 'USA',
    schedule: 'AM / Mañana',
    aliases: ['MD MID', 'MD DAY', 'MDA', 'MD-AM', 'MARYLAND AM', 'MDAM'],
  },
  {
    code: 'MD PM',
    fullName: 'Maryland Pick Evening (Tarde)',
    region: 'USA',
    schedule: 'PM / Tarde',
    aliases: ['MD EVE', 'MD NIGHT', 'MDP', 'MD-PM', 'MARYLAND PM', 'MDPM'],
  },
  // New Jersey
  {
    code: 'NJ AM',
    fullName: 'New Jersey Pick Midday (Mañana)',
    region: 'USA',
    schedule: 'AM / Mañana',
    aliases: ['NJ MID', 'NJ DAY', 'NJA', 'NJ-AM', 'NEW JERSEY AM', 'NJAM'],
  },
  {
    code: 'NJ PM',
    fullName: 'New Jersey Pick Evening (Tarde)',
    region: 'USA',
    schedule: 'PM / Tarde',
    aliases: ['NJ EVE', 'NJ NIGHT', 'NJP', 'NJ-PM', 'NEW JERSEY PM', 'NJPM'],
  },
  // Connecticut
  {
    code: 'CT AM',
    fullName: 'Connecticut Play3 Midday',
    region: 'USA',
    schedule: 'AM / Mañana',
    aliases: ['CT MID', 'CTA', 'CT-AM', 'CTAM'],
  },
  {
    code: 'CT PM',
    fullName: 'Connecticut Play3 Evening',
    region: 'USA',
    schedule: 'PM / Tarde',
    aliases: ['CT EVE', 'CTP', 'CT-PM', 'CTPM'],
  },
  // Pennsylvania
  {
    code: 'PA AM',
    fullName: 'Pennsylvania Pick Midday',
    region: 'USA',
    schedule: 'AM / Mañana',
    aliases: ['PA MID', 'PAA', 'PA-AM', 'PAAM'],
  },
  {
    code: 'PA PM',
    fullName: 'Pennsylvania Pick Evening',
    region: 'USA',
    schedule: 'PM / Tarde',
    aliases: ['PA EVE', 'PAP', 'PA-PM', 'PAPM'],
  },
  // Dominican Bancas / Caribe
  {
    code: 'RD GANA',
    fullName: 'Gana Más (Nacional Tarde)',
    region: 'Rep. Dominicana',
    schedule: 'PM / Tarde',
    aliases: ['GANA MAS', 'GANAMAS', 'RD GANA MAS', 'GANA+'],
  },
  {
    code: 'RD NAL',
    fullName: 'Lotería Nacional Noche',
    region: 'Rep. Dominicana',
    schedule: 'Noche',
    aliases: ['NACIONAL', 'LOTERIA NACIONAL', 'RD NACIONAL', 'NAL'],
  },
  {
    code: 'QP REAL',
    fullName: 'Quiniela Real Mediodía',
    region: 'Rep. Dominicana',
    schedule: 'PM / Tarde',
    aliases: ['REAL', 'QUINIELA REAL', 'RD REAL'],
  },
  {
    code: 'LEIDSA',
    fullName: 'Leidsa Noche (Quiniela Palé)',
    region: 'Rep. Dominicana',
    schedule: 'Noche',
    aliases: ['LEIDSA NOCHE', 'QP LEIDSA'],
  },
  {
    code: 'LOTEDOM',
    fullName: 'Lotedom Dominicana',
    region: 'Rep. Dominicana',
    schedule: 'PM / Tarde',
    aliases: ['LOTEDOM TARDE', 'EL QUINIELON'],
  },
  {
    code: 'PRIMERA',
    fullName: 'La Primera de la Tarde',
    region: 'Rep. Dominicana',
    schedule: 'PM / Tarde',
    aliases: ['LA PRIMERA', 'PRIMERA 12', 'PRIMERA AM'],
  },
  {
    code: 'LA SUERTE',
    fullName: 'La Suerte Dominicana',
    region: 'Rep. Dominicana',
    schedule: 'AM / Mañana',
    aliases: ['SUERTE', 'LA SUERTE 12'],
  },
];

const STORAGE_KEY = 'lotoaudit_master_lotteries';

/**
 * Loads master lotteries combining default list with any user-added custom ones
 */
export function getMasterLotteries(): MasterLottery[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const customs: MasterLottery[] = JSON.parse(raw);
      // Merge unique by code
      const merged = [...DEFAULT_MASTER_LOTTERIES];
      customs.forEach((c) => {
        if (!merged.some((m) => m.code.toUpperCase() === c.code.toUpperCase())) {
          merged.push(c);
        }
      });
      return merged;
    }
  } catch (e) {
    console.error('Error loading master lotteries:', e);
  }
  return DEFAULT_MASTER_LOTTERIES;
}

export function saveCustomLottery(lottery: MasterLottery): void {
  try {
    const current = getMasterLotteries();
    const existingIndex = current.findIndex(
      (m) => m.code.toUpperCase() === lottery.code.toUpperCase()
    );
    if (existingIndex >= 0) {
      current[existingIndex] = { ...lottery, isCustom: true };
    } else {
      current.push({ ...lottery, isCustom: true });
    }
    const customs = current.filter((m) => m.isCustom);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customs));
  } catch (e) {
    console.error('Error saving custom lottery:', e);
  }
}

export function deleteCustomLottery(code: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const customs: MasterLottery[] = JSON.parse(raw);
      const filtered = customs.filter(
        (c) => c.code.toUpperCase() !== code.toUpperCase()
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (e) {
    console.error('Error deleting custom lottery:', e);
  }
}

/**
 * Validates and normalizes an extracted lottery string against the master catalog.
 * Supports exact matches, alias matching, and Levenshtein fuzzy distance matching.
 */
export function validateAndNormalizeLottery(
  rawCode: string,
  catalog: MasterLottery[] = getMasterLotteries()
): ValidatedLottery {
  const clean = rawCode.trim().toUpperCase().replace(/[-_]/g, ' ');

  // 1. Exact match with canonical code
  const exact = catalog.find((l) => l.code.toUpperCase() === clean);
  if (exact) {
    return {
      code: exact.code,
      originalCode: rawCode,
      isValid: true,
      confidence: 1.0,
    };
  }

  // 2. Exact match with alias
  const aliasMatch = catalog.find((l) =>
    l.aliases.some((a) => a.toUpperCase() === clean || clean.replace(/\s+/g, '') === a.replace(/\s+/g, ''))
  );
  if (aliasMatch) {
    return {
      code: aliasMatch.code,
      originalCode: rawCode,
      isValid: true,
      suggestedMatch: aliasMatch.code,
      confidence: 0.95,
    };
  }

  // 3. Normalized without spaces (e.g. "NYAM" -> "NY AM")
  const compact = clean.replace(/\s+/g, '');
  const compactMatch = catalog.find(
    (l) => l.code.replace(/\s+/g, '').toUpperCase() === compact
  );
  if (compactMatch) {
    return {
      code: compactMatch.code,
      originalCode: rawCode,
      isValid: true,
      confidence: 0.92,
    };
  }

  // 4. Fuzzy / Levenshtein distance match for typos (e.g. "NY AN" -> "NY AM", "FL AMM" -> "FL AM")
  let bestMatch: MasterLottery | undefined = undefined;
  let highestScore = 0;

  for (const item of catalog) {
    // Check against canonical code
    const simCode = stringSimilarity(clean, item.code.toUpperCase());
    if (simCode > highestScore) {
      highestScore = simCode;
      bestMatch = item;
    }
    // Check against aliases
    for (const a of item.aliases) {
      const simAlias = stringSimilarity(clean, a.toUpperCase());
      if (simAlias > highestScore) {
        highestScore = simAlias;
        bestMatch = item;
      }
    }
  }

  if (bestMatch && highestScore >= 0.72) {
    return {
      code: bestMatch.code,
      originalCode: rawCode,
      isValid: true,
      suggestedMatch: bestMatch.code,
      confidence: Math.round(highestScore * 100) / 100,
    };
  }

  // 5. Code is not valid or unrecognized
  return {
    code: clean,
    originalCode: rawCode,
    isValid: false,
    suggestedMatch: bestMatch ? bestMatch.code : undefined,
    confidence: bestMatch ? Math.round(highestScore * 100) / 100 : 0,
  };
}

/**
 * Calculates string similarity using Bigram dice coefficient
 */
function stringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (str1.length < 2 || str2.length < 2) return 0.0;

  const getBigrams = (s: string) => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const bg = s.substring(i, i + 2);
      bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
    }
    return bigrams;
  };

  const bg1 = getBigrams(str1);
  const bg2 = getBigrams(str2);

  let intersection = 0;
  bg1.forEach((count, bg) => {
    if (bg2.has(bg)) {
      intersection += Math.min(count, bg2.get(bg)!);
    }
  });

  const total = (str1.length - 1) + (str2.length - 1);
  return (2 * intersection) / total;
}
