import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Brain,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Share2,
  History,
  Award,
  Sparkles,
  Smartphone,
  Monitor,
  RefreshCw,
  FileText,
  Database,
  AlertTriangle,
  Image,
} from 'lucide-react';
import { AuditResult, QuadrantAudit } from './types/lottery';
import { SAMPLE_SHEETS, generateTicketSheetCanvas, SampleSheetDefinition } from './utils/sampleSheets';
import { checkSheetPrizes } from './utils/prizeCalculator';
import { getMasterLotteries, validateAndNormalizeLottery } from './utils/lotteryMasterCatalog';
import { QuadrantCard } from './components/QuadrantCard';
import { SheetImageOverlay } from './components/SheetImageOverlay';
import { AndroidFrame } from './components/AndroidFrame';
import { PrizeCheckerModal } from './components/PrizeCheckerModal';
import { AuditHistoryModal } from './components/AuditHistoryModal';
import { LotteryCatalogModal } from './components/LotteryCatalogModal';
import { AndroidIntegrationModal } from './components/AndroidIntegrationModal';
import { UnresolvedTicketsModal } from './components/UnresolvedTicketsModal';
import { UnresolvedTicket } from './types/lottery';
import { usePWAInstall } from './utils/usePWAInstall';

export default function App() {
  const { isInstallable, install } = usePWAInstall();
  const [viewMode, setViewMode] = useState<'desktop' | 'android'>('desktop');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [currentAudit, setCurrentAudit] = useState<AuditResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedQuadrantId, setSelectedQuadrantId] = useState<string>('arriba_izq');
  const [isCopied, setIsCopied] = useState(false);

  // Modals state
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showAndroidModal, setShowAndroidModal] = useState(false);

  // Winning numbers for day
  const [winningNumbers, setWinningNumbers] = useState<Record<string, string>>({});

  // Session history
  const [history, setHistory] = useState<AuditResult[]>([]);
  const [unresolvedTickets, setUnresolvedTickets] = useState<UnresolvedTicket[]>([]);
  const [showUnresolvedModal, setShowUnresolvedModal] = useState(false);

  // Hidden inputs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Initialize with sample sheet on start
  useEffect(() => {
    loadSampleSheet(SAMPLE_SHEETS[0]);
  }, []);

  // Listen to paste event (e.g. screenshot pasted directly)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64 = event.target?.result as string;
              processLoadedImage(base64, 'Página Capturada');
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const loadSampleSheet = (sample: SampleSheetDefinition) => {
    setErrorMessage(null);
    const generatedDataUrl = generateTicketSheetCanvas(sample);
    setImageSrc(generatedDataUrl);

    // Validate lotteries against master catalog
    const catalog = getMasterLotteries();
    let hasWarnings = false;

    const validatedQuads = sample.quadrants.map((q) => {
      if (q.isEmpty) return q;

      const valList = q.lotteries.map((l) => validateAndNormalizeLottery(l, catalog));
      const invalidList = valList.filter((v) => !v.isValid).map((v) => v.originalCode);

      if (invalidList.length > 0) hasWarnings = true;

      return {
        ...q,
        validatedLotteries: valList,
        hasInvalidLottery: invalidList.length > 0,
        invalidLotteriesList: invalidList,
        overallHandwritingConfidence: 'high' as const,
      };
    });

    // Initial audit state from sample
    const newAudit: AuditResult = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pageNumber: sample.pageNumber,
      quadrants: validatedQuads,
      totalPageSale: sample.expectedTotal,
      totalPagePrize: 0,
      pensamiento: sample.pensamiento,
      formattedOutput: sample.formattedOutput,
      imageThumbnail: generatedDataUrl,
      hasLotteryValidationWarnings: hasWarnings,
    };

    // Apply any configured winning numbers
    const updated = checkSheetPrizes(newAudit, winningNumbers);
    setCurrentAudit(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      processLoadedImage(base64, file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const processLoadedImage = async (base64Url: string, nameHint?: string) => {
    setImageSrc(base64Url);
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const currentMaster = getMasterLotteries();

      // Call our backend API with Gemini Vision & OCR rules
      const response = await fetch('/api/audit-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Url,
          mimeType: 'image/jpeg',
          pageNumberHint: nameHint,
          masterLotteries: currentMaster.map((m) => m.code),
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Error al comunicarse con el servidor de auditoría');
      }

      const auditedData = json.data;

      // Double-check lottery validation on client
      let clientHasWarnings = false;
      const validatedQuadrants = auditedData.quadrants.map((q: QuadrantAudit) => {
        if (q.isEmpty) return q;

        const valList = q.lotteries.map((l) => validateAndNormalizeLottery(l, currentMaster));
        const invalidList = valList.filter((v) => !v.isValid).map((v) => v.originalCode);

        if (invalidList.length > 0) clientHasWarnings = true;

        return {
          ...q,
          validatedLotteries: valList,
          hasInvalidLottery: invalidList.length > 0,
          invalidLotteriesList: invalidList,
        };
      });

      const finalAudit: AuditResult = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pageNumber: auditedData.pageNumber || '1',
        quadrants: validatedQuadrants,
        totalPageSale: auditedData.totalPageSale,
        totalPagePrize: 0,
        pensamiento: auditedData.pensamiento,
        formattedOutput: auditedData.formattedOutput,
        imageThumbnail: base64Url,
        hasLotteryValidationWarnings: clientHasWarnings || auditedData.hasLotteryValidationWarnings,
      };

      // Check against current winning numbers
      const checkedAudit = checkSheetPrizes(finalAudit, winningNumbers);
      setCurrentAudit(checkedAudit);

      // Check if no numbers were found
      const totalPlays = checkedAudit.quadrants.reduce((sum, q) => sum + (q.plays?.length || 0), 0);
      if (totalPlays === 0) {
        setUnresolvedTickets((prev) => [
          {
            id: `unresolved-${Date.now()}`,
            date: new Date(),
            imageThumbnail: base64Url,
            reason: 'No se detectaron números',
          },
          ...prev
        ]);
        setErrorMessage('No se detectaron números. La foto fue movida a "No Reconocidos".');
        setCurrentAudit(null);
        return;
      }

      // Add to session history
      setHistory((prev) => [checkedAudit, ...prev]);
    } catch (err: any) {
      console.warn('Error al procesar:', err);
      
      setUnresolvedTickets((prev) => [
        {
          id: `unresolved-${Date.now()}`,
          date: new Date(),
          imageThumbnail: base64Url,
          reason: err.message || 'Error en el procesamiento',
        },
        ...prev
      ]);
      setErrorMessage(
        `Error al auditar el ticket. Se movió a "No Reconocidos".`
      );
      setCurrentAudit(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateQuadrant = (updated: QuadrantAudit) => {
    if (!currentAudit) return;

    const catalog = getMasterLotteries();
    const valList = updated.lotteries.map((l) => validateAndNormalizeLottery(l, catalog));
    const invalidList = valList.filter((v) => !v.isValid).map((v) => v.originalCode);

    const thoroughlyValidated: QuadrantAudit = {
      ...updated,
      validatedLotteries: valList,
      hasInvalidLottery: invalidList.length > 0,
      invalidLotteriesList: invalidList,
    };

    const newQuads = currentAudit.quadrants.map((q) =>
      q.id === updated.id ? thoroughlyValidated : q
    );
    const newTotalSale = newQuads.reduce((acc, q) => acc + (q.isEmpty ? 0 : q.confirmedTotal), 0);
    const anyWarnings = newQuads.some((q) => q.hasInvalidLottery);

    const recomputed: AuditResult = {
      ...currentAudit,
      quadrants: newQuads,
      totalPageSale: newTotalSale,
      hasLotteryValidationWarnings: anyWarnings,
    };

    const final = checkSheetPrizes(recomputed, winningNumbers);
    setCurrentAudit(final);
  };

  const handleSaveWinningNumbers = (numbers: Record<string, string>) => {
    setWinningNumbers(numbers);
    if (currentAudit) {
      const updated = checkSheetPrizes(currentAudit, numbers);
      setCurrentAudit(updated);
    }
  };

  const handleCopyFormatted = () => {
    if (!currentAudit) return;
    navigator.clipboard.writeText(currentAudit.formattedOutput);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Collect all detected lotteries across quadrants
  const detectedLotteries = currentAudit
    ? Array.from(new Set(currentAudit.quadrants.flatMap((q) => q.lotteries)))
    : [];

  const masterCatalogCount = getMasterLotteries().length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      {/* Hidden file inputs for Camera and Gallery */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileUpload}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-slate-900 text-base md:text-lg tracking-tight">
                  LotoAudit AI
                </h1>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Validación estricta con Lista Maestra y reconocimiento de escritura manual
              </p>
            </div>
          </div>

          {/* Action buttons & View mode switch */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
              <button
                onClick={() => setViewMode('desktop')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'desktop'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Modo Auditor de Escritorio"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Auditoría Completa</span>
              </button>
              <button
                onClick={() => setViewMode('android')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'android'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Modo App Móvil Android"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Vista Android</span>
              </button>
            </div>

            {/* Android Readiness / Install button */}
            <button
              onClick={() => {
                if (isInstallable) {
                  install();
                } else {
                  setShowAndroidModal(true);
                }
              }}
              className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Información e instalación de app en Android"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">¿Listo en Android?</span>
            </button>

            {/* Master Lottery Catalog button */}
            <button
              onClick={() => setShowCatalogModal(true)}
              className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-900 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Base de Datos Maestra de Códigos de Lotería Válidos"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Lista Maestra ({masterCatalogCount})</span>
            </button>

            {/* Prize checker modal button */}
            <button
              onClick={() => setShowPrizeModal(true)}
              className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Configurar números ganadores del día"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Premios</span>
            </button>

            {/* Unresolved Tickets button */}
            <button
              onClick={() => setShowUnresolvedModal(true)}
              className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-900 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Tickets No Reconocidos"
            >
              <Image className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">No Reconocidos ({unresolvedTickets.length})</span>
            </button>

            {/* History button */}
            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Libro ({history.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-5">
        {/* Error / Alert notice if any */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-amber-800 font-bold hover:underline"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Global Banner if invalid lotteries are found */}
        {currentAudit?.hasLotteryValidationWarnings && (
          <div className="mb-4 p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs text-amber-900 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong className="block font-bold">
                  Atención: Se detectaron códigos de lotería no reconocidos en el Paso 2
                </strong>
                <span className="text-amber-800">
                  Uno o más cuadrantes tienen casillas marcadas que no coinciden con la Lista Maestra. Puedes tocarlas en los cuadrantes para corregirlas con 1 clic.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowCatalogModal(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 whitespace-nowrap"
            >
              Ver Lista Maestra
            </button>
          </div>
        )}


        {/* View Mode Switching: Android Phone Simulation vs Desktop Auditor */}
        {viewMode === 'android' ? (
          /* ANDROID VIEW */
          <div className="py-2">
            <AndroidFrame
              audit={currentAudit}
              isProcessing={isProcessing}
              onTriggerCamera={() => cameraInputRef.current?.click()}
              onTriggerGallery={() => galleryInputRef.current?.click()}
              onCopyFormatted={handleCopyFormatted}
              isCopied={isCopied}
              onUpdateQuadrant={handleUpdateQuadrant}
            >
              {/* Photo View inside Android */}
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-xs">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt="Ticket"
                    className="w-full h-48 object-contain bg-slate-950"
                  />
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
                    Sin foto
                  </div>
                )}
              </div>
            </AndroidFrame>
          </div>
        ) : (
          /* DESKTOP FULL AUDITOR VIEW */
          <div className="space-y-5">
          {/* Core Work Area: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Image Sheet with 2x2 Overlay (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <SheetImageOverlay
                  imageSrc={imageSrc}
                  audit={currentAudit}
                  selectedQuadrantId={selectedQuadrantId}
                  onSelectQuadrant={setSelectedQuadrantId}
                />

                {/* Formatted Output Box (Requested Format) */}
                {currentAudit && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                          Formato de Salida Oficial
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handleCopyFormatted}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" /> Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Copiar Texto
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            const text = encodeURIComponent(currentAudit.formattedOutput);
                            window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                          title="Enviar reporte por WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" /> WhatsApp
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 bg-slate-900 rounded-lg p-3.5 font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner">
                      {currentAudit.formattedOutput}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: 2x2 Quadrants Detail Cards (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {currentAudit ? (
                  <>
                    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm">
                          Página {currentAudit.pageNumber}
                        </span>
                        <span className="text-xs text-slate-400">|</span>
                        <span className="text-xs text-slate-600">
                          {currentAudit.quadrants.filter((q) => !q.isEmpty).length} cuadrantes activos
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[11px] text-slate-500 font-medium block">
                            Venta Total de la Página
                          </span>
                          <span className="text-xl font-black font-mono text-blue-600 tracking-tight">
                            ${currentAudit.totalPageSale}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* The 4 Quadrants arranged in a 2x2 grid corresponding to the physical sheet */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {currentAudit.quadrants.map((quad) => (
                        <QuadrantCard
                          key={quad.id}
                          quadrant={quad}
                          isSelected={selectedQuadrantId === quad.id}
                          onSelect={() => setSelectedQuadrantId(quad.id)}
                          onUpdateQuadrant={handleUpdateQuadrant}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-400">
                    <Brain className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-700 text-sm">Esperando imagen de ticket</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Toma una foto con tu cámara o selecciona uno de los ejemplos pre-cargados arriba
                      para que el Cerebro de la IA ejecute los 5 pasos con OCR caligráfico y validación de loterías.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <LotteryCatalogModal
        isOpen={showCatalogModal}
        onClose={() => setShowCatalogModal(false)}
        onCatalogUpdated={() => {
          if (currentAudit) {
            // Re-validate current audit with updated catalog
            const cat = getMasterLotteries();
            const revalidatedQuads = currentAudit.quadrants.map((q) => {
              if (q.isEmpty) return q;
              const valList = q.lotteries.map((l) => validateAndNormalizeLottery(l, cat));
              const invalidList = valList.filter((v) => !v.isValid).map((v) => v.originalCode);
              return {
                ...q,
                validatedLotteries: valList,
                hasInvalidLottery: invalidList.length > 0,
                invalidLotteriesList: invalidList,
              };
            });
            setCurrentAudit({
              ...currentAudit,
              quadrants: revalidatedQuads,
              hasLotteryValidationWarnings: revalidatedQuads.some((q) => q.hasInvalidLottery),
            });
          }
        }}
      />

      <PrizeCheckerModal
        isOpen={showPrizeModal}
        onClose={() => setShowPrizeModal(false)}
        winningNumbers={winningNumbers}
        onSaveWinningNumbers={handleSaveWinningNumbers}
        availableLotteries={detectedLotteries}
      />

      <AuditHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        history={history}
        onSelectAudit={(audit) => {
          setCurrentAudit(audit);
          if (audit.imageThumbnail) {
            setImageSrc(audit.imageThumbnail);
          }
        }}
        onClearHistory={() => setHistory([])}
      />

      <UnresolvedTicketsModal
        isOpen={showUnresolvedModal}
        onClose={() => setShowUnresolvedModal(false)}
        unresolvedTickets={unresolvedTickets}
      />

      <AndroidIntegrationModal
        isOpen={showAndroidModal}
        onClose={() => setShowAndroidModal(false)}
        serverUrl={typeof window !== 'undefined' ? window.location.origin : ''}
      />
    </div>
  );
}
