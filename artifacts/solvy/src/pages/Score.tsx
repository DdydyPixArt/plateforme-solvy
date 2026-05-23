import { useLocation, useParams } from "wouter";
import Layout, { PageHeader } from "@/components/Layout";
import { scoreDetails, mockDossiers } from "@/data/mockData";
import { useDossier } from "@/hooks/useApi";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Info, Printer, Loader2 } from "lucide-react";

interface ScoreProps { role: string; userName: string; userInitials: string; onLogout: () => void; }

const txt = "hsl(220 25% 14%)";
const sub = "hsl(220 12% 48%)";

function SemiCircleGauge({ score }: { score: number }) {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const r = 120;
  const strokeW = 22;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const polarToXY = (deg: number, radius: number) => ({
    x: cx + radius * Math.cos(toRad(deg)),
    y: cy + radius * Math.sin(toRad(deg)),
  });

  const arcPath = (from: number, to: number, rad: number) => {
    const p1 = polarToXY(from, rad);
    const p2 = polarToXY(to, rad);
    return `M ${p1.x} ${p1.y} A ${rad} ${rad} 0 0 1 ${p2.x} ${p2.y}`;
  };

  const zones = [
    { from: 180, to: 108, color: "#ef4444" },
    { from: 108, to: 54, color: "#f59e0b" },
    { from: 54, to: 0, color: "#10b981" },
  ];

  const tickAngles = Array.from({ length: 11 }, (_, i) => 180 - (i / 10) * 180);
  const scoreAngle = 180 - (score / 1000) * 180;
  const needleTip = polarToXY(scoreAngle, r - 8);
  const needleBase1 = polarToXY(scoreAngle + 90, 10);
  const needleBase2 = polarToXY(scoreAngle - 90, 10);

  const sc = score >= 700 ? "#10b981" : score >= 400 ? "#f59e0b" : "#ef4444";
  const sl = score >= 700 ? "Risque faible" : score >= 400 ? "Risque modéré" : "Risque élevé";
  const ss = score >= 700 ? "Accord possible" : score >= 400 ? "Analyse requise" : "Refus recommandé";

  return (
    <svg width={size} height={size / 2 + 70} viewBox={`0 0 ${size} ${size / 2 + 70}`} className="overflow-visible">
      {/* Track */}
      <path d={arcPath(180, 0, r)} fill="none" stroke="#e5e7eb" strokeWidth={strokeW} strokeLinecap="round" />
      {/* Zones */}
      {zones.map((z, i) => (
        <path key={i} d={arcPath(z.from, z.to, r)} fill="none" stroke={z.color} strokeWidth={strokeW}
          strokeLinecap={i === 0 ? "round" : i === 2 ? "round" : "butt"} />
      ))}
      {/* Ticks */}
      {tickAngles.map((angle, i) => {
        const inner = polarToXY(angle, r - strokeW / 2 - 6);
        const outer = polarToXY(angle, r + strokeW / 2 + 2);
        const lp = polarToXY(angle, r + strokeW / 2 + 18);
        return (
          <g key={i}>
            <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#d1d5db" strokeWidth={i % 5 === 0 ? 2 : 1} />
            {i % 5 === 0 && (
              <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fill="#9ca3af" fontSize={9}>{i * 100}</text>
            )}
          </g>
        );
      })}
      {/* Zone labels */}
      <text x={polarToXY(162, r - 36).x} y={polarToXY(162, r - 36).y} textAnchor="middle" fill="#dc2626" fontSize={9} fontWeight="600">ÉLEVÉ</text>
      <text x={polarToXY(90, r - 36).x} y={polarToXY(90, r - 36).y} textAnchor="middle" fill="#d97706" fontSize={9} fontWeight="600">MODÉRÉ</text>
      <text x={polarToXY(18, r - 36).x} y={polarToXY(18, r - 36).y} textAnchor="middle" fill="#059669" fontSize={9} fontWeight="600">FAIBLE</text>
      {/* Needle */}
      <line x1={cx} y1={cy} x2={needleTip.x} y2={needleTip.y} stroke={sc} strokeWidth={2.5} strokeLinecap="round" />
      <polygon points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`} fill={sc} opacity={0.25} />
      <circle cx={cx} cy={cy} r={8} fill="white" stroke={sc} strokeWidth={2} />
      {/* Score text */}
      <text x={cx} y={cy - 30} textAnchor="middle" fill={sc} fontSize={46} fontWeight="800">{score}</text>
      <text x={cx} y={cy - 13} textAnchor="middle" fill="#9ca3af" fontSize={14}>/1000</text>
      <text x={cx} y={cy + 28} textAnchor="middle" fill={sc} fontSize={14} fontWeight="700">{sl}</text>
      <text x={cx} y={cy + 46} textAnchor="middle" fill="#9ca3af" fontSize={11}>{ss}</text>
    </svg>
  );
}

export default function Score({ role, userName, userInitials, onLogout }: ScoreProps) {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const { data: dossierData, isLoading } = useDossier(params.id);
  const dossier = dossierData || mockDossiers.find(d => d.id === params.id) || mockDossiers[0];
  const score = dossier?.score || 742;

  const recoBg = score >= 700 ? "bg-emerald-50 border-emerald-200" : score >= 400 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";
  const recoText = score >= 700 ? "text-emerald-700" : score >= 400 ? "text-amber-700" : "text-red-700";
  const recoLabel = score >= 700 ? "ACCORD POSSIBLE" : score >= 400 ? "ACCORD SOUS CONDITIONS" : "REFUS RECOMMANDÉ";
  const RecoIcon = score >= 700 ? CheckCircle : score >= 400 ? AlertTriangle : XCircle;

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title={`Score de solvabilité — ${dossier.reference}`} subtitle={`${dossier.client.prenom} ${dossier.client.nom}`}>
        <button onClick={() => setLocation(`/dossier/${dossier.id}`)} className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-colors" style={{ color: sub }}>
          <ArrowLeft className="w-4 h-4" /> Retour au dossier
        </button>
        <button onClick={() => setLocation(`/export/${dossier.id}`)}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
          <Printer className="w-4 h-4" /> Exporter
        </button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="grid grid-cols-2 gap-8">
          {/* Gauge card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 flex flex-col items-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: sub }}>Score global de solvabilité</h2>
            <SemiCircleGauge score={score} />

            {/* Recommendation */}
            <div className={`mt-5 w-full flex items-center gap-3 px-5 py-4 rounded-xl border ${recoBg}`}>
              <RecoIcon className={`w-6 h-6 flex-shrink-0 ${recoText}`} />
              <div>
                <div className={`text-sm font-bold ${recoText}`}>{recoLabel}</div>
                <div className="text-xs mt-0.5 text-gray-500">Recommandation automatique — validation humaine obligatoire</div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="mt-4 w-full grid grid-cols-2 gap-3">
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-center">
                <div className="text-xs mb-1" style={{ color: sub }}>Probabilité de défaut</div>
                <div className="text-xl font-bold text-amber-600">12.4%</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-center">
                <div className="text-xs mb-1" style={{ color: sub }}>Modèle</div>
                <div className="text-sm font-bold" style={{ color: txt }}>v2.3.1</div>
                <div className="text-[10px]" style={{ color: sub }}>Calibré jan. 2024</div>
              </div>
            </div>

            {/* RGPD notice */}
            <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-400" />
              Ce score est un outil d'aide à la décision. Conformément au RGPD Art. 22, toute décision finale requiert une validation humaine par un analyste risque habilité.
            </div>
          </div>

          {/* Details */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold" style={{ color: txt }}>Détail du calcul</h2>
              <p className="text-xs mt-0.5" style={{ color: sub }}>Contribution de chaque critère au score final</p>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
              {scoreDetails.map((item, i) => {
                const pct = (item.score / item.max) * 100;
                const bc = pct >= 80 ? "bg-emerald-500" : pct >= 55 ? "bg-amber-500" : "bg-red-500";
                const tc = pct >= 80 ? "text-emerald-600" : pct >= 55 ? "text-amber-600" : "text-red-600";
                return (
                  <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 mr-3">
                        <div className="text-sm font-semibold" style={{ color: txt }}>{item.critere}</div>
                        <div className="text-xs mt-0.5" style={{ color: sub }}>{item.description}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold" style={{ color: txt }}>{item.score}<span className="text-xs font-normal text-gray-400">/{item.max}</span></div>
                        <div className="text-[10px]" style={{ color: sub }}>{item.valeur}</div>
                      </div>
                    </div>
                    <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${bc} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-gray-400">0</span>
                      <span className={`text-[10px] font-semibold ${tc}`}>{pct.toFixed(0)}%</span>
                      <span className="text-[9px] text-gray-400">{item.max}</span>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-sm font-semibold" style={{ color: txt }}>Score total</span>
                <span className="text-lg font-bold" style={{ color: "hsl(43 57% 40%)" }}>{score}<span className="text-gray-400 text-sm font-normal">/1000</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
