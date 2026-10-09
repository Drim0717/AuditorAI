import { AuditResult, WinningNumberEntry } from '../types/lottery';

export interface PrizeResult {
  hasPrizes: boolean;
  totalPrizes: number;
  details: {
    quadrantId: string;
    lottery: string;
    play: string;
    amount: number;
    prize: number;
    type: string;
  }[];
}

/**
 * Checks a sheet's audited plays against winning numbers
 */
export function checkSheetPrizes(
  audit: AuditResult,
  winningNumbers: Record<string, string> // e.g. { "NY AM": "22", "FL AM": "77" }
): AuditResult {
  const updatedQuadrants = audit.quadrants.map((quad) => {
    if (quad.isEmpty) return quad;

    let quadPrize = 0;
    const winningHits: string[] = [];

    const updatedPlays = quad.plays.map((play) => {
      let isWinner = false;
      let playPrize = 0;

      // Check across each marked lottery in this quadrant
      quad.lotteries.forEach((lott) => {
        const winningNum = winningNumbers[lott]?.trim();
        if (!winningNum) return;

        // Clean play number
        const pNum = play.number.trim();

        // Direct Quiniela match (e.g. "22" == "22")
        if (pNum === winningNum) {
          isWinner = true;
          // Standard Quiniela payout: 60x bet amount
          const prize = play.amount * 60;
          playPrize += prize;
          winningHits.push(`${lott}: #${pNum} ($${prize})`);
        } else if (pNum.length >= 2 && winningNum.endsWith(pNum)) {
          // Last 2 digits match
          isWinner = true;
          const prize = play.amount * 60;
          playPrize += prize;
          winningHits.push(`${lott}: #${pNum} ($${prize})`);
        }
      });

      return {
        ...play,
        isWinner,
        prizeAmount: playPrize,
      };
    });

    quadPrize = updatedPlays.reduce((acc, p) => acc + (p.prizeAmount || 0), 0);

    const prizeNote = winningHits.length > 0
      ? `$${quadPrize} (${winningHits.join(', ')})`
      : Object.keys(winningNumbers).length > 0
      ? '$0 (Sin premio)'
      : '(Esperando números)';

    return {
      ...quad,
      plays: updatedPlays,
      totalPrize: quadPrize,
      prizeNote,
    };
  });

  const totalPagePrize = updatedQuadrants.reduce((acc, q) => acc + (q.totalPrize || 0), 0);

  // Update formattedOutput
  const lines = [`Página ${audit.pageNumber}`];
  updatedQuadrants.forEach((q) => {
    if (q.isEmpty) {
      lines.push(`${q.name}: Vacío`);
    } else {
      const lotts = q.lotteries.join(', ') || 'Sin lotería';
      lines.push(`${q.name}: ${lotts} | Venta: ${q.confirmedTotal} | Premio: ${q.prizeNote || '(Esperando números)'}`);
    }
  });
  lines.push(`Venta Total: ${audit.totalPageSale}`);
  if (totalPagePrize > 0) {
    lines.push(`Premio Total: ${totalPagePrize}`);
  }

  return {
    ...audit,
    quadrants: updatedQuadrants,
    totalPagePrize,
    formattedOutput: lines.join('\n'),
  };
}
