import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Allow large payloads for base64 ticket photos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Gemini client initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface PlayItem {
  number: string;
  amount: number;
  raw: string;
  confidence?: 'high' | 'medium' | 'low';
  handwritingStyle?: string;
}

interface ValidatedLottery {
  code: string;
  originalCode: string;
  isValid: boolean;
  suggestedMatch?: string;
  confidence?: number;
}

interface QuadrantAudit {
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
  verificationStatus: 'match' | 'override_sum' | 'override_circle' | 'empty';
  notes: string;
  overallHandwritingConfidence?: 'high' | 'medium' | 'low';
}

interface AuditResponse {
  pageNumber: string;
  quadrants: QuadrantAudit[];
  totalPageSale: number;
  pensamiento: string;
  formattedOutput: string;
  hasLotteryValidationWarnings?: boolean;
}

// Master list of valid lotteries on server
const MASTER_LOTTERY_CODES = [
  'NY AM', 'NY PM',
  'FL AM', 'FL PM',
  'GA AM', 'GA PM', 'GA EVE',
  'MD AM', 'MD PM',
  'NJ AM', 'NJ PM',
  'CT AM', 'CT PM',
  'PA AM', 'PA PM',
  'RD GANA', 'RD NAL', 'QP REAL', 'LEIDSA', 'LOTEDOM', 'PRIMERA', 'LA SUERTE'
];

const MASTER_LOTTERY_ALIASES: Record<string, string> = {
  'NY MID': 'NY AM', 'NY DAY': 'NY AM', 'NYA': 'NY AM', 'NY-AM': 'NY AM', 'NYAM': 'NY AM', 'NY1': 'NY AM',
  'NY EVE': 'NY PM', 'NY NIGHT': 'NY PM', 'NYP': 'NY PM', 'NY-PM': 'NY PM', 'NYPM': 'NY PM', 'NY2': 'NY PM',
  'FL MID': 'FL AM', 'FL DAY': 'FL AM', 'FLA': 'FL AM', 'FL-AM': 'FL AM', 'FLAM': 'FL AM', 'FL1': 'FL AM',
  'FL EVE': 'FL PM', 'FL NIGHT': 'FL PM', 'FLP': 'FL PM', 'FL-PM': 'FL PM', 'FLPM': 'FL PM', 'FL2': 'FL PM',
  'GA MID': 'GA AM', 'GA DAY': 'GA AM', 'GAA': 'GA AM', 'GA-AM': 'GA AM', 'GAAM': 'GA AM', 'GA1': 'GA AM',
  'GA NIGHT': 'GA EVE', 'GAE': 'GA EVE', 'GA-EVE': 'GA EVE', 'GAEVE': 'GA EVE', 'GAP': 'GA PM', 'GA-PM': 'GA PM',
  'MD MID': 'MD AM', 'MD DAY': 'MD AM', 'MDA': 'MD AM', 'MD-AM': 'MD AM', 'MDAM': 'MD AM',
  'MD EVE': 'MD PM', 'MD NIGHT': 'MD PM', 'MDP': 'MD PM', 'MD-PM': 'MD PM', 'MDPM': 'MD PM',
  'NJ MID': 'NJ AM', 'NJ DAY': 'NJ AM', 'NJA': 'NJ AM', 'NJ-AM': 'NJ AM', 'NJAM': 'NJ AM',
  'NJ EVE': 'NJ PM', 'NJ NIGHT': 'NJ PM', 'NJP': 'NJ PM', 'NJ-PM': 'NJ PM', 'NJPM': 'NJ PM',
  'GANA MAS': 'RD GANA', 'GANAMAS': 'RD GANA',
  'NACIONAL': 'RD NAL', 'LOTERIA NACIONAL': 'RD NAL',
  'REAL': 'QP REAL', 'QUINIELA REAL': 'QP REAL',
};

function normalizeServerLottery(raw: string): { code: string; isValid: boolean; suggestion?: string } {
  const clean = raw.trim().toUpperCase().replace(/[-_]/g, ' ');
  if (MASTER_LOTTERY_CODES.includes(clean)) {
    return { code: clean, isValid: true };
  }
  if (MASTER_LOTTERY_ALIASES[clean]) {
    return { code: MASTER_LOTTERY_ALIASES[clean], isValid: true, suggestion: MASTER_LOTTERY_ALIASES[clean] };
  }
  const compact = clean.replace(/\s+/g, '');
  if (MASTER_LOTTERY_ALIASES[compact]) {
    return { code: MASTER_LOTTERY_ALIASES[compact], isValid: true, suggestion: MASTER_LOTTERY_ALIASES[compact] };
  }

  // Find nearest code
  const found = MASTER_LOTTERY_CODES.find(
    (c) => c.startsWith(clean.slice(0, 2)) || clean.startsWith(c.slice(0, 2))
  );

  return { code: clean, isValid: false, suggestion: found || undefined };
}

const SYSTEM_AUDIT_PROMPT = `Eres el "Cerebro" de auditoría de tickets de lotería y motor experto de OCR de escritura manual para bancas y colectores.
Tu misión es auditar hojas físicas de tickets de lotería divididas en una cuadrícula de 2x2 con máxima precisión caligráfica.

LISTA MAESTRA DE CÓDIGOS DE LOTERÍA VÁLIDOS:
${MASTER_LOTTERY_CODES.join(', ')}

REGLAS DE RECONOCIMIENTO DE ESCRITURA MANUAL (OCR AVANZADO):
1. Variaciones Numéricas Comunes:
   - "1" con gancho/serif superior tipo europeo (¡no confundir con 7 si no tiene barra horizontal!).
   - "7" con barra horizontal cruzada central típica en boletos latinos (distinguir claramente del 1).
   - "4" abierto (forma de L invertida o U con palo) vs "4" cerrado triangular.
   - "0" con barra oblicua central vs óvalos estrechos (no confundir con 6 ni con 8).
   - "5" con barra superior horizontal plana y vientre curvo inferior (no confundir con 6).
   - "2" con lazo curvo en la base o trazo en Z.
   - "8" trazado como dos bucles continuos o muñeco de nieve.
2. Variaciones de Trazo e Inclinación:
   - Maneja escritura cursiva inclinada hacia la derecha o izquierda.
   - Maneja trazos gruesos (tinta corrida, bolígrafo de gel 1.0mm) y trazos suaves/tenues (bolígrafo gastado 0.5mm).
3. Separadores de Jugadas Manuscritas:
   - Guion '-', doble guion '--': ej. 22-5, 33-5.
   - Signo igual '=': ej. 00=4, 22=3.
   - Barra oblicua '/': ej. 10/5, 01/5.
   - Fraccionarias / compuestas: 10-10/10, 944-1-1.
   - Notación de palé con cruz o 'x': 50x22=1, 37x11-5, 010x181/4.

LOS 5 PASOS MENTALES OBLIGATORIOS:

1. Segmentación Espacial:
Divide mentalmente en cuadrícula 2x2:
- Cuadrante 1: Arriba IZQ
- Cuadrante 2: Arriba DER
- Cuadrante 3: Abajo IZQ
- Cuadrante 4: Abajo DER
Si un cuadrante no tiene jugadas ni marcas impresas, márcalo como isEmpty = true, venta = 0.

2. Extracción y Validación de Loterías:
- Escanea las casillas impresas superiores con marcas de bolígrafo (X, cotejo ✓, o rayón).
- Valida los nombres extraídos contra la Lista Maestra de Loterías Válidas.
- Si una lotería extraída coincide o es un alias conocido (ej. NY DAY -> NY AM), normalízala al código canónico.
- Si no coincide con ninguna lotería válida, márcala en el cuadrante como inválida y añade una sugerencia para que el usuario pueda corregirla.

3. Desglose de Jugadas:
- Extrae cada jugada [Número] [Separador] [Monto].
- Extrae el monto apostado por jugada y suma los montos individuales.
- Multiplicador de Loterías: Si hay N loterías válidas marcadas en el cuadrante para ese bloque, el total de jugadas se multiplica por N:
  Total Calculado = (Suma de montos) x (Número de loterías marcadas).

4. Detección del Círculo (Total Declarado):
- Localiza el círculo o semicírculo manuscrito en la parte inferior o lateral y extrae el número manuscrito dentro de él. Si no hay círculo visible, indica null.

5. Doble Verificación Interna (Regla de Oro):
- Si Total Calculado == Círculo: "match".
- Si NO coinciden, pero las jugadas son 100% legibles: la IA confía en la suma individual ("override_sum").
- Si NO coinciden y hay borrones o números ambiguos: la IA confía en el círculo ("override_circle").
- Venta Total de la Página = suma de las ventas confirmadas de los 4 cuadrantes.

Debes incluir tu razonamiento en <pensamiento> y devolver el JSON con todos los detalles de validación.`;

// API endpoint to audit lottery ticket image
app.post('/api/audit-ticket', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', pageNumberHint, masterLotteries = [] } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'La imagen en formato base64 es obligatoria' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY no está configurada en las variables de entorno',
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const userPrompt = `Audita esta página de tickets de lotería aplicando los 5 pasos mentales con reconocimiento avanzado de escritura manual y validación estricta de códigos de lotería:
1. Segmentación en cuadrícula 2x2.
2. Lectura y validación de casillas marcadas contra la lista maestra (NY AM, FL AM, etc.).
3. Desglose preciso de números manuscritos, separadores y montos apostados.
4. Extracción del total manuscrito dentro del círculo.
5. Doble verificación matemática interna y resolución de discrepancias.
${pageNumberHint ? `Pista de página: ${pageNumberHint}` : ''}

Devuelve tu respuesta estructurada en formato JSON con esta forma:
{
  "pensamiento": "<pensamiento>\\n- Arriba IZQ: ...\\n- Arriba DER: ...\\n- Abajo IZQ: ...\\n- Abajo DER: ...\\n- Suma Total de la Página: ... Página identificada: ...\\n</pensamiento>",
  "pageNumber": "8",
  "quadrants": [
    {
      "id": "arriba_izq",
      "name": "Arriba IZQ",
      "isEmpty": false,
      "lotteries": ["NY AM", "FL AM"],
      "hasInvalidLottery": false,
      "invalidLotteriesList": [],
      "overallHandwritingConfidence": "high",
      "plays": [
        { "number": "22", "amount": 5, "raw": "22-5", "confidence": "high", "handwritingStyle": "Trazo firme claro" },
        { "number": "33", "amount": 5, "raw": "33-5", "confidence": "high", "handwritingStyle": "Trazo firme claro" },
        { "number": "99", "amount": 5, "raw": "99-5", "confidence": "high", "handwritingStyle": "Trazo firme claro" }
      ],
      "subtotalPlays": 15,
      "lotteryMultiplier": 2,
      "calculatedTotal": 30,
      "declaredCircleTotal": 30,
      "confirmedTotal": 30,
      "verificationStatus": "match",
      "notes": "Coincide suma con círculo"
    },
    ...
  ],
  "totalPageSale": 140,
  "formattedOutput": "Página 8\\n..."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'image/jpeg',
            },
          },
          {
            text: userPrompt,
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_AUDIT_PROMPT,
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('La IA no devolvió respuesta');
    }

    let parsedResult: AuditResponse;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      parsedResult = JSON.parse(cleaned);
    }

    let hasGlobalLotteryWarnings = false;

    // Rigorous Server-Side Post-Processing & Master List Validation
    if (parsedResult.quadrants && Array.isArray(parsedResult.quadrants)) {
      let recalculatedTotal = 0;

      parsedResult.quadrants.forEach((q) => {
        if (!q.isEmpty) {
          // Validate extracted lotteries against the master list
          const validatedList: ValidatedLottery[] = [];
          const invalidList: string[] = [];

          const rawLots = q.lotteries || [];
          rawLots.forEach((l) => {
            const val = normalizeServerLottery(l);
            validatedList.push({
              code: val.isValid ? val.code : l,
              originalCode: l,
              isValid: val.isValid,
              suggestedMatch: val.suggestion,
              confidence: val.isValid ? 1.0 : 0.5,
            });
            if (!val.isValid) {
              invalidList.push(l);
              hasGlobalLotteryWarnings = true;
            }
          });

          q.validatedLotteries = validatedList;
          q.hasInvalidLottery = invalidList.length > 0;
          q.invalidLotteriesList = invalidList;

          // Normalized lottery array for mathematical calculations
          q.lotteries = validatedList.map((v) => v.code);

          const mult = Math.max(1, q.lotteries.length || 1);
          q.lotteryMultiplier = mult;

          if (!q.subtotalPlays && q.plays?.length) {
            q.subtotalPlays = q.plays.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
          }

          if (!q.calculatedTotal && q.subtotalPlays) {
            q.calculatedTotal = q.subtotalPlays * mult;
          }

          // Rule of thumb conflict resolution
          if (q.declaredCircleTotal !== null && q.declaredCircleTotal !== undefined) {
            if (q.calculatedTotal === q.declaredCircleTotal) {
              q.confirmedTotal = q.calculatedTotal;
              q.verificationStatus = 'match';
            } else if (q.plays && q.plays.length > 0) {
              q.confirmedTotal = q.calculatedTotal;
              q.verificationStatus = 'override_sum';
              q.notes = q.notes || `Discrepancia: Suma jugadas (${q.calculatedTotal}) difiere del círculo (${q.declaredCircleTotal}). Confiando en suma individual.`;
            } else {
              q.confirmedTotal = q.declaredCircleTotal;
              q.verificationStatus = 'override_circle';
              q.notes = q.notes || `Discrepancia: Confiando en el círculo (${q.declaredCircleTotal}).`;
            }
          } else {
            q.confirmedTotal = q.calculatedTotal || 0;
          }

          recalculatedTotal += q.confirmedTotal;
        } else {
          q.confirmedTotal = 0;
          q.calculatedTotal = 0;
          q.subtotalPlays = 0;
          q.declaredCircleTotal = null;
          q.verificationStatus = 'empty';
          q.hasInvalidLottery = false;
        }
      });

      parsedResult.totalPageSale = recalculatedTotal;
      parsedResult.hasLotteryValidationWarnings = hasGlobalLotteryWarnings;
    }

    // Reconstruct formatted output
    const pNum = parsedResult.pageNumber || '1';
    const lines = [`Página ${pNum}`];

    parsedResult.quadrants.forEach((q) => {
      if (q.isEmpty) {
        lines.push(`${q.name}: Vacío`);
      } else {
        const lotts = q.lotteries.join(', ') || 'Sin lotería';
        lines.push(`${q.name}: ${lotts} | Venta: ${q.confirmedTotal} | Premio: (Esperando números)`);
      }
    });
    lines.push(`Venta Total: ${parsedResult.totalPageSale}`);
    parsedResult.formattedOutput = lines.join('\n');

    res.json({
      success: true,
      data: parsedResult,
    });
  } catch (error: any) {
    console.error('Error auditing ticket:', error);
    res.status(500).json({
      error: error.message || 'Error al procesar la auditoría con la IA',
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`LotoAudit AI server running on http://localhost:${PORT}`);
  });
}

startServer();
