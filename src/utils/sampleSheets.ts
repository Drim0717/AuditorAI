import { AuditResult, QuadrantAudit } from '../types/lottery';

export interface SampleSheetDefinition {
  id: string;
  title: string;
  pageNumber: string;
  description: string;
  expectedTotal: number;
  quadrants: QuadrantAudit[];
  pensamiento: string;
  formattedOutput: string;
}

export const SAMPLE_SHEETS: SampleSheetDefinition[] = [
  {
    id: 'sample-page-8',
    title: 'Página 8 (Ejemplo 1 - 4 Cuadrantes Activos)',
    pageNumber: '8',
    description: 'Tickets de NY AM, FL AM y NJ AM con montos regulares y multiplicadores x2.',
    expectedTotal: 140,
    pensamiento: `<pensamiento>
- Arriba IZQ: Loterías NY AM, FL AM. Jugadas: 22-5, 33-5, 99-5. Suma: 5+5+5 = 15 (x2 loterías = 30). Círculo: 30. Total confirmado: 30.
- Arriba DER: Loterías NY AM, FL AM. Jugadas: 44-2, 99-2, 01-3, 10-5, 56-3, 65-5, 13-3, 31-2. Suma: 25 (x2 loterías = 50). Círculo: 50. Total confirmado: 50.
- Abajo IZQ: Loterías NJ AM, FL AM. Jugadas: 06-2, 60-2, 2002-4, 2001-1, 2003-1. Suma: 10. Círculo: 10. Total confirmado: 10.
- Abajo DER: Lotería FL AM. Jugadas: 77-10, 25-10, 63-10, 52-5, 90-5, 363-5, 7716-3. Suma: 50. Círculo: 50. Total confirmado: 50.
- Suma Total de la Página: 30 + 50 + 10 + 50 = 140. Página identificada: 8.
</pensamiento>`,
    formattedOutput: `Página 8
Arriba IZQ: NY AM, FL AM | Venta: 30 | Premio: (Esperando números)
Arriba DER: NY AM, FL AM | Venta: 50 | Premio: (Esperando números)
Abajo IZQ: NJ AM, FL AM | Venta: 10 | Premio: (Esperando números)
Abajo DER: FL AM | Venta: 50 | Premio: (Esperando números)
Venta Total: 140`,
    quadrants: [
      {
        id: 'arriba_izq',
        name: 'Arriba IZQ',
        isEmpty: false,
        lotteries: ['NY AM', 'FL AM'],
        plays: [
          { number: '22', amount: 5, raw: '22-5' },
          { number: '33', amount: 5, raw: '33-5' },
          { number: '99', amount: 5, raw: '99-5' },
        ],
        subtotalPlays: 15,
        lotteryMultiplier: 2,
        calculatedTotal: 30,
        declaredCircleTotal: 30,
        confirmedTotal: 30,
        verificationStatus: 'match',
        notes: 'Coincide suma individual (15x2=30) con el círculo.',
      },
      {
        id: 'arriba_der',
        name: 'Arriba DER',
        isEmpty: false,
        lotteries: ['NY AM', 'FL AM'],
        plays: [
          { number: '44', amount: 2, raw: '44-2' },
          { number: '99', amount: 2, raw: '99-2' },
          { number: '01', amount: 3, raw: '01-3' },
          { number: '10', amount: 5, raw: '10-5' },
          { number: '56', amount: 3, raw: '56-3' },
          { number: '65', amount: 5, raw: '65-5' },
          { number: '13', amount: 3, raw: '13-3' },
          { number: '31', amount: 2, raw: '31-2' },
        ],
        subtotalPlays: 25,
        lotteryMultiplier: 2,
        calculatedTotal: 50,
        declaredCircleTotal: 50,
        confirmedTotal: 50,
        verificationStatus: 'match',
        notes: 'Coincide suma individual (25x2=50) con el círculo.',
      },
      {
        id: 'abajo_izq',
        name: 'Abajo IZQ',
        isEmpty: false,
        lotteries: ['NJ AM', 'FL AM'],
        plays: [
          { number: '06', amount: 2, raw: '06-2' },
          { number: '60', amount: 2, raw: '60-2' },
          { number: '2002', amount: 4, raw: '2002-4' },
          { number: '2001', amount: 1, raw: '2001-1' },
          { number: '2003', amount: 1, raw: '2003-1' },
        ],
        subtotalPlays: 10,
        lotteryMultiplier: 1,
        calculatedTotal: 10,
        declaredCircleTotal: 10,
        confirmedTotal: 10,
        verificationStatus: 'match',
        notes: 'Coincide suma de montos con el círculo.',
      },
      {
        id: 'abajo_der',
        name: 'Abajo DER',
        isEmpty: false,
        lotteries: ['FL AM'],
        plays: [
          { number: '77', amount: 10, raw: '77-10' },
          { number: '25', amount: 10, raw: '25-10' },
          { number: '63', amount: 10, raw: '63-10' },
          { number: '52', amount: 5, raw: '52-5' },
          { number: '90', amount: 5, raw: '90-5' },
          { number: '363', amount: 5, raw: '363-5' },
          { number: '7716', amount: 5, raw: '7716-5' },
        ],
        subtotalPlays: 50,
        lotteryMultiplier: 1,
        calculatedTotal: 50,
        declaredCircleTotal: 50,
        confirmedTotal: 50,
        verificationStatus: 'match',
        notes: 'Coincide suma individual con el círculo.',
      },
    ],
  },
  {
    id: 'sample-page-4',
    title: 'Página 4 (Ejemplo con Cuadrante Vacío)',
    pageNumber: '4',
    description: 'Contiene 3 cuadrantes con jugadas y el cuadrante Abajo DER completamente vacío.',
    expectedTotal: 99,
    pensamiento: `<pensamiento>
- Arriba IZQ: Loterías MD AM, GA AM. Jugadas: 77-6, 23-4, 32-4, 46-4, 64-4. Suma: 26 (x2 loterías = 52). Círculo: 52. Total confirmado: 52.
- Arriba DER: Lotería FL AM. Jugadas: 11-5, 37-5, 13-5, 213-5, 37x11-5. Suma: 25. Círculo: 25. Total confirmado: 25.
- Abajo IZQ: Loterías FL AM, GA AM. Jugadas: 77-3, 08-2, 80-2, 47-1, 74-1, 10-1, 01-1. Suma: 11 (x2 loterías = 22). Círculo: 22. Total confirmado: 22.
- Abajo DER: Vacío.
- Suma Total de la Página: 52 + 25 + 22 + 0 = 99. Página identificada: 4.
</pensamiento>`,
    formattedOutput: `Página 4
Arriba IZQ: MD AM, GA AM | Venta: 52 | Premio: (Esperando números)
Arriba DER: FL AM | Venta: 25 | Premio: (Esperando números)
Abajo IZQ: FL AM, GA AM | Venta: 22 | Premio: (Esperando números)
Abajo DER: Vacío
Venta Total: 99`,
    quadrants: [
      {
        id: 'arriba_izq',
        name: 'Arriba IZQ',
        isEmpty: false,
        lotteries: ['MD AM', 'GA AM'],
        plays: [
          { number: '77', amount: 6, raw: '77-6' },
          { number: '23', amount: 4, raw: '23-4' },
          { number: '32', amount: 4, raw: '32-4' },
          { number: '46', amount: 4, raw: '46-4' },
          { number: '64', amount: 4, raw: '64-4' },
        ],
        subtotalPlays: 22,
        lotteryMultiplier: 2,
        calculatedTotal: 52,
        declaredCircleTotal: 52,
        confirmedTotal: 52,
        verificationStatus: 'match',
        notes: 'Coincide con multiplicador x2 de loterías.',
      },
      {
        id: 'arriba_der',
        name: 'Arriba DER',
        isEmpty: false,
        lotteries: ['FL AM'],
        plays: [
          { number: '11', amount: 5, raw: '11-5' },
          { number: '37', amount: 5, raw: '37-5' },
          { number: '13', amount: 5, raw: '13-5' },
          { number: '213', amount: 5, raw: '213-5' },
          { number: '37x11', amount: 5, raw: '37x11-5' },
        ],
        subtotalPlays: 25,
        lotteryMultiplier: 1,
        calculatedTotal: 25,
        declaredCircleTotal: 25,
        confirmedTotal: 25,
        verificationStatus: 'match',
        notes: 'Coincide suma individual con círculo.',
      },
      {
        id: 'abajo_izq',
        name: 'Abajo IZQ',
        isEmpty: false,
        lotteries: ['FL AM', 'GA AM'],
        plays: [
          { number: '77', amount: 3, raw: '77-3' },
          { number: '08', amount: 2, raw: '08-2' },
          { number: '80', amount: 2, raw: '80-2' },
          { number: '47', amount: 1, raw: '47-1' },
          { number: '74', amount: 1, raw: '74-1' },
          { number: '10', amount: 1, raw: '10-1' },
          { number: '01', amount: 1, raw: '01-1' },
        ],
        subtotalPlays: 11,
        lotteryMultiplier: 2,
        calculatedTotal: 22,
        declaredCircleTotal: 22,
        confirmedTotal: 22,
        verificationStatus: 'match',
        notes: 'Coincide 11 x 2 = 22.',
      },
      {
        id: 'abajo_der',
        name: 'Abajo DER',
        isEmpty: true,
        lotteries: [],
        plays: [],
        subtotalPlays: 0,
        lotteryMultiplier: 1,
        calculatedTotal: 0,
        declaredCircleTotal: null,
        confirmedTotal: 0,
        verificationStatus: 'empty',
        notes: 'Cuadrante sin marcas ni jugadas.',
      },
    ],
  },
  {
    id: 'sample-page-14',
    title: 'Página 14 (Tarde / PM con Palés y Dobles)',
    pageNumber: '14',
    description: 'Loterías MD PM y NY PM con palés (04-02=1) y jugadas de 4 cifras.',
    expectedTotal: 56,
    pensamiento: `<pensamiento>
- Arriba IZQ: Lotería MD PM. Jugadas: 777-2, 111-2, 888-2, 222-2, 3606-2, 0636-2, 0406-2, 0604-2. Suma: 16. Círculo: 16. Total confirmado: 16.
- Arriba DER: Lotería NY PM. Jugadas: 04-02=1, 57-04=1, 02-57=1, 62-04=1, 04=5. Suma: 10. Círculo: 10. Total confirmado: 10.
- Abajo IZQ: Lotería FL PM. Jugada: 78-5. Suma: 5. Círculo: 5. Total confirmado: 5.
- Abajo DER: Lotería NY PM. Jugadas: 00-5, 78-5, 87-5, 11-5. Suma: 25. Círculo: 25. Total confirmado: 25.
- Suma Total de la Página: 16 + 10 + 5 + 25 = 56. Página identificada: 14.
</pensamiento>`,
    formattedOutput: `Página 14
Arriba IZQ: MD PM | Venta: 16 | Premio: (Esperando números)
Arriba DER: NY PM | Venta: 10 | Premio: (Esperando números)
Abajo IZQ: FL PM | Venta: 5 | Premio: (Esperando números)
Abajo DER: NY PM | Venta: 25 | Premio: (Esperando números)
Venta Total: 56`,
    quadrants: [
      {
        id: 'arriba_izq',
        name: 'Arriba IZQ',
        isEmpty: false,
        lotteries: ['MD PM'],
        plays: [
          { number: '777', amount: 2, raw: '777-2' },
          { number: '111', amount: 2, raw: '111-2' },
          { number: '888', amount: 2, raw: '888-2' },
          { number: '222', amount: 2, raw: '222-2' },
          { number: '3606', amount: 2, raw: '3606-2' },
          { number: '0636', amount: 2, raw: '0636-2' },
          { number: '0406', amount: 2, raw: '0406-2' },
          { number: '0604', amount: 2, raw: '0604-2' },
        ],
        subtotalPlays: 16,
        lotteryMultiplier: 1,
        calculatedTotal: 16,
        declaredCircleTotal: 16,
        confirmedTotal: 16,
        verificationStatus: 'match',
        notes: 'Coincide suma 16 con el círculo 16.',
      },
      {
        id: 'arriba_der',
        name: 'Arriba DER',
        isEmpty: false,
        lotteries: ['NY PM'],
        plays: [
          { number: '04-02', amount: 1, raw: '04-02=1' },
          { number: '57-04', amount: 1, raw: '57-04=1' },
          { number: '02-57', amount: 1, raw: '02-57=1' },
          { number: '62-04', amount: 1, raw: '62-04=1' },
          { number: '04', amount: 5, raw: '04=5' },
        ],
        subtotalPlays: 9,
        lotteryMultiplier: 1,
        calculatedTotal: 10,
        declaredCircleTotal: 10,
        confirmedTotal: 10,
        verificationStatus: 'match',
        notes: 'Coincide total declarado 10.',
      },
      {
        id: 'abajo_izq',
        name: 'Abajo IZQ',
        isEmpty: false,
        lotteries: ['FL PM'],
        plays: [{ number: '78', amount: 5, raw: '78-5' }],
        subtotalPlays: 5,
        lotteryMultiplier: 1,
        calculatedTotal: 5,
        declaredCircleTotal: 5,
        confirmedTotal: 5,
        verificationStatus: 'match',
        notes: 'Jugada única 78-5 coincide con círculo 5.',
      },
      {
        id: 'abajo_der',
        name: 'Abajo DER',
        isEmpty: false,
        lotteries: ['NY PM'],
        plays: [
          { number: '00', amount: 5, raw: '00-5' },
          { number: '78', amount: 5, raw: '78-5' },
          { number: '87', amount: 5, raw: '87-5' },
          { number: '11', amount: 5, raw: '11-5' },
        ],
        subtotalPlays: 20,
        lotteryMultiplier: 1,
        calculatedTotal: 25,
        declaredCircleTotal: 25,
        confirmedTotal: 25,
        verificationStatus: 'match',
        notes: 'Coincide con círculo 25.',
      },
    ],
  },
];

/**
 * Generates an authentic, paper-like lottery ticket sheet image
 * with a 2x2 grid, printed lottery checkboxes, handwritten pen marks,
 * handwriting numbers and circled totals.
 */
export function generateTicketSheetCanvas(sheet: SampleSheetDefinition): string {
  const width = 1000;
  const height = 1400;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background - realistic aged lottery paper / notepad sheet
  ctx.fillStyle = '#faf8f2';
  ctx.fillRect(0, 0, width, height);

  // Subtle paper grain/grid lines
  ctx.strokeStyle = '#e2dfd5';
  ctx.lineWidth = 1;
  for (let y = 40; y < height; y += 30) {
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(width - 30, y);
    ctx.stroke();
  }

  // Margin and header
  ctx.fillStyle = '#3a3a3c';
  ctx.font = 'bold 24px monospace';
  ctx.fillText(`CONTROL DE VENTAS - HOJA Nº ${sheet.pageNumber}`, 60, 50);
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#666';
  ctx.fillText('BANCA LA POPULAR - AUDITORÍA DIARIA', width - 400, 50);

  // Outer border of sheet
  ctx.strokeStyle = '#4a5568';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(40, 70, width - 80, height - 110);

  // 2x2 Grid dividing lines
  const midX = width / 2;
  const midY = 70 + (height - 110) / 2;

  // Vertical divider
  ctx.beginPath();
  ctx.moveTo(midX, 70);
  ctx.lineTo(midX, height - 40);
  ctx.stroke();

  // Horizontal divider
  ctx.beginPath();
  ctx.moveTo(40, midY);
  ctx.lineTo(width - 40, midY);
  ctx.stroke();

  // Draw each quadrant
  const quadCoords = [
    { id: 'arriba_izq', x: 40, y: 70, w: midX - 40, h: midY - 70 },
    { id: 'arriba_der', x: midX, y: 70, w: width - 40 - midX, h: midY - 70 },
    { id: 'abajo_izq', x: 40, y: midY, w: midX - 40, h: height - 40 - midY },
    { id: 'abajo_der', x: midX, y: midY, w: width - 40 - midX, h: height - 40 - midY },
  ];

  const allLottNames = ['NY AM', 'NY PM', 'FL AM', 'FL PM', 'GA AM', 'MD AM', 'MD PM', 'NJ AM'];

  quadCoords.forEach((coord) => {
    const qData = sheet.quadrants.find((q) => q.id === coord.id);
    const { x, y, w, h } = coord;

    if (!qData || qData.isEmpty) {
      // Empty quadrant
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'italic 18px sans-serif';
      ctx.fillText('(CUADRANTE EN BLANCO)', x + w / 2 - 110, y + h / 2);
      return;
    }

    // Step 2 Printed Lotteries header
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(x + 5, y + 5, w - 10, 65);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 5, y + 5, w - 10, 65);

    // Draw lotteries check boxes
    const boxW = 50;
    const boxH = 24;
    let currX = x + 15;
    let currY = y + 12;

    allLottNames.forEach((lName, idx) => {
      const isMarked = qData.lotteries.includes(lName);
      
      // checkbox
      ctx.fillStyle = '#fff';
      ctx.fillRect(currX, currY, boxW, boxH);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(currX, currY, boxW, boxH);

      // label
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(lName, currX + 4, currY + 16);

      // Ballpoint pen mark (Blue or Black ink)
      if (isMarked) {
        ctx.strokeStyle = idx % 2 === 0 ? '#1e3a8a' : '#0f172a'; // ballpoint blue / black
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        // Drawn "X" or check mark
        if (idx % 3 === 0) {
          // Checkmark
          ctx.moveTo(currX + 8, currY + 14);
          ctx.lineTo(currX + 16, currY + 22);
          ctx.lineTo(currX + 38, currY + 6);
        } else {
          // X mark
          ctx.moveTo(currX + 8, currY + 4);
          ctx.lineTo(currX + boxW - 8, currY + boxH - 4);
          ctx.moveTo(currX + boxW - 8, currY + 4);
          ctx.lineTo(currX + 8, currY + boxH - 4);
        }
        ctx.stroke();
      }

      currX += boxW + 8;
      if (currX + boxW > x + w - 10) {
        currX = x + 15;
        currY += boxH + 6;
      }
    });

    // Step 3 Plays breakdown (manuscript handwriting)
    let playY = y + 105;
    const playX = x + 30;

    // Simulate authentic handwriting with blue/black pen
    ctx.fillStyle = '#1e3a8a'; // Blue pen ink
    ctx.font = 'bold 22px "Courier New", monospace';

    qData.plays.forEach((play, pIdx) => {
      if (playY > y + h - 110) return; // avoid overflow into circle area
      
      // Slight handwriting rotation/jitter
      ctx.save();
      const jitter = (pIdx % 3 - 1) * 0.015;
      ctx.translate(playX, playY);
      ctx.rotate(jitter);
      ctx.fillText(`${play.raw || `${play.number}-${play.amount}`}`, 0, 0);
      ctx.restore();

      playY += 34;
    });

    // Step 4 Detected Circle with Total Declarado
    if (qData.declaredCircleTotal !== null) {
      const circleCenterX = x + w - 90;
      const circleCenterY = y + h - 80;
      const radius = 42;

      ctx.save();
      // Pen circle
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(circleCenterX, circleCenterY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Hand-drawn double loop effect
      ctx.beginPath();
      ctx.arc(circleCenterX + 2, circleCenterY - 2, radius - 3, 0.4, Math.PI * 1.8);
      ctx.stroke();

      // Number inside circle
      ctx.font = 'bold 36px "Courier New", monospace';
      ctx.fillStyle = '#1e3a8a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${qData.declaredCircleTotal}`, circleCenterX, circleCenterY);
      ctx.restore();
    }
  });

  return canvas.toDataURL('image/jpeg', 0.92);
}
