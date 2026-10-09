import React, { useState } from 'react';
import {
  Smartphone,
  X,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Code2,
  Globe,
  Camera,
  Server,
  Zap,
  ExternalLink,
} from 'lucide-react';

interface AndroidIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverUrl: string;
}

export const AndroidIntegrationModal: React.FC<AndroidIntegrationModalProps> = ({
  isOpen,
  onClose,
  serverUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'kotlin' | 'api'>('pwa');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const kotlinRetrofitCode = `// 1. Dependencias en build.gradle.kts (app)
dependencies {
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    implementation("androidx.camera:camera-camera2:1.3.4")
    implementation("androidx.camera:camera-lifecycle:1.3.4")
    implementation("androidx.camera:camera-view:1.3.4")
}

// 2. Modelo de datos y Retrofit Client
data class AuditRequest(
    val imageBase64: String,
    val mimeType: String = "image/jpeg"
)

data class AuditResponse(
    val success: Boolean,
    val data: AuditData
)

data class AuditData(
    val pageNumber: String,
    val totalPageSale: Int,
    val formattedOutput: String,
    val quadrants: List<QuadrantData>
)

data class QuadrantData(
    val id: String,
    val name: String,
    val isEmpty: Boolean,
    val lotteries: List<String>,
    val confirmedTotal: Int
)

interface LotoAuditApi {
    @POST("/api/audit-ticket")
    suspend fun auditTicket(@Body request: AuditRequest): AuditResponse
}

// 3. Llamada al Servidor
val retrofit = Retrofit.Builder()
    .baseUrl("${serverUrl}")
    .addConverterFactory(GsonConverterFactory.create())
    .build()

val api = retrofit.create(LotoAuditApi::class.java)

// En tu Coroutine al tomar la foto:
val base64Image = encodeBitmapToBase64(capturedBitmap)
val response = api.auditTicket(AuditRequest(base64Image))
println("Venta Total: \${response.data.totalPageSale}")
println(response.data.formattedOutput)`;

  const curlExample = `curl -X POST "${serverUrl}/api/audit-ticket" \\
  -H "Content-Type: application/json" \\
  -d '{
    "imageBase64": "data:image/jpeg;base64,...",
    "mimeType": "image/jpeg"
  }'`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                ¿Está lista para correr en Android?
              </h3>
              <p className="text-xs text-slate-500">
                ¡Sí! Puedes usarla de 2 formas: instalándola directamente (PWA) o como app nativa APK.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="mt-3 flex items-center bg-slate-100 p-1 rounded-xl gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'pwa'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>1. Instalar en Android (PWA)</span>
          </button>

          <button
            onClick={() => setActiveTab('kotlin')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'kotlin'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>2. Código Nativo APK (Kotlin)</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'api'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>3. API Endpoint REST</span>
          </button>
        </div>

        {/* Tab 1: PWA Installation Guide */}
        {activeTab === 'pwa' && (
          <div className="mt-4 flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
            <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-200 text-emerald-950 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold text-emerald-900">
                  ¡Lista al 100% para instalar en cualquier Android hoy mismo!
                </strong>
                <p className="mt-1 leading-relaxed text-emerald-800">
                  La app ya incluye <strong>PWA Manifest</strong>, íconos de Android y acceso directo a la cámara trasera. No necesitas pasar por Google Play Store ni compilar con Android Studio si no lo deseas.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">
                Pasos para instalarla en tu teléfono Android en 30 segundos:
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-800 block">Abre el enlace en Chrome:</strong>
                    <span className="text-slate-500">
                      Entra desde tu celular Android a esta URL pública:
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="bg-white px-2 py-1 rounded border border-slate-300 font-mono text-[11px] select-all">
                        {serverUrl}
                      </code>
                      <button
                        onClick={() => handleCopy(serverUrl, 'url')}
                        className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
                        title="Copiar enlace"
                      >
                        {copiedCode === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-800 block">Toca en el menú de Chrome:</strong>
                    <span className="text-slate-500">
                      Presiona los 3 puntos (⋮) en la esquina superior derecha del navegador.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-800 block">Selecciona "Instalar aplicación" / "Agregar a pantalla principal":</strong>
                    <span className="text-slate-500">
                      Chrome creará un ícono llamado <strong>LotoAudit</strong> en tu pantalla de inicio.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-mono font-bold flex items-center justify-center shrink-0">
                    ✓
                  </span>
                  <div>
                    <strong className="text-slate-800 block">¡Listo para usar!</strong>
                    <span className="text-slate-500">
                      Se abre a pantalla completa como una app nativa, con acceso directo a la cámara para tomar las fotos y enviar la auditoría.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Kotlin / Native APK Code */}
        {activeTab === 'kotlin' && (
          <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">
                Código para tu proyecto en Android Studio (Kotlin):
              </span>
              <button
                onClick={() => handleCopy(kotlinRetrofitCode, 'kotlin')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg flex items-center gap-1 shadow-xs"
              >
                {copiedCode === 'kotlin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === 'kotlin' ? '¡Copiado!' : 'Copiar Código Kotlin'}</span>
              </button>
            </div>

            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
              {kotlinRetrofitCode}
            </pre>
          </div>
        )}

        {/* Tab 3: API REST Endpoint */}
        {activeTab === 'api' && (
          <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            <div>
              <span className="font-bold text-slate-800 block mb-1">
                Endpoint POST de Auditoría:
              </span>
              <code className="bg-slate-100 p-2 rounded-lg font-mono text-xs block text-blue-700 font-bold border border-slate-200">
                POST {serverUrl}/api/audit-ticket
              </code>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="font-semibold text-slate-700">Ejemplo cURL para probar:</span>
              <button
                onClick={() => handleCopy(curlExample, 'curl')}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold flex items-center gap-1"
              >
                {copiedCode === 'curl' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                Copiar cURL
              </button>
            </div>

            <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
              {curlExample}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Compatible con Android 8.0 hasta Android 15.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
