export interface PlayItem {
  number: string;
  amount: number;
  raw: string;
  isWinner?: boolean;
  prizeAmount?: number;
  confidence?: 'high' | 'medium' | 'low';
  handwritingStyle?: string;
}

export type VerificationStatus = 'match' | 'override_sum' | 'override_circle' | 'empty';

export interface ValidatedLottery {
  code: string;
  originalCode: string;
  isValid: boolean;
  suggestedMatch?: string;
  confidence?: number;
}

export interface QuadrantAudit {
  id: 'arriba_izq' | 'arriba_der' | 'abajo_izq' | 'abajo_der';
  name: 'Arriba IZQ' | 'Arriba DER' | 'Abajo IZQ' | 'Abajo DER';
  isEmpty: boolean;
  lotteries: string[];
  validatedLotteries?: ValidatedLottery[];
  hasInvalidLottery?: boolean;
  invalidLotteriesList?: string[];
  plays: PlayItem[];
  subtotalPlays: number;
  lotteryMultiplier: number;
  calculatedTotal: number;
  declaredCircleTotal: number | null;
  confirmedTotal: number;
  verificationStatus: VerificationStatus;
  notes?: string;
  prizeNote?: string;
  totalPrize?: number;
  overallHandwritingConfidence?: 'high' | 'medium' | 'low';
}

export interface AuditResult {
  id: string;
  timestamp: string;
  pageNumber: string;
  quadrants: QuadrantAudit[];
  totalPageSale: number;
  totalPagePrize: number;
  pensamiento: string;
  formattedOutput: string;
  imageThumbnail?: string;
  hasLotteryValidationWarnings?: boolean;
}

export interface UnresolvedTicket {
  id: string;
  date: Date; // Keep full Date object to determine shift
  imageThumbnail: string;
  reason: string;
}

export interface WinningNumberEntry {
  lottery: string;
  first: string;
  second?: string;
  third?: string;
}

export interface MasterLottery {
  code: string;
  fullName: string;
  region: 'USA' | 'Rep. Dominicana' | 'Internacional';
  schedule: 'AM / Mañana' | 'PM / Tarde' | 'Noche';
  aliases: string[];
  isCustom?: boolean;
}
