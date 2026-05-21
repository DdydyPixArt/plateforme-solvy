import { useLocation, useParams } from "wouter";
import Layout, { PageHeader } from "@/components/Layout";
import { mockDossiers, scoreDetails } from "@/data/mockData";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

interface ScoreProps { role: string; userName: string; userInitials: string; onLogout: () => void; }

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

  const startAngle = 180;
  const endAngle = 0;
  const totalAngle = 180;

  const arcPath = (from: number, to: number, rad: number) => {
    const p1 = polarToXY(from, rad);
    const p2 = polarToXY(to, rad);
    const large = Math.abs(to - from) > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${rad} ${rad} 0 ${large} 1 ${p2.x} ${p2.y}`;
  };

  const zones = [
    { from: 180, to: 108, color: "#e74c3c", opacity: 0.9 },
    { from: 108, to: 54, color: "#e67e22", opacity: 0.9 },
    { from: 54, to: 0, color: "#2ecc71", opacity: 0.9 },
  ];

  const scoreAngle = startAngle - (score / 1000) * totalAngle;
  const needleTip = polarToXY(scoreAngle, r - 8);
  const needleBase1 = polarToXY(scoreAngle + 90, 10);
  const needleBase2 = polarToXY(scoreAngle - 90, 10);

  const tickAngles = Array.from({ length: 11 }, (_, i) => startAngle - (i / 10) * totalAngle);

  const scoreColor = score >= 700 ? "#2ecc71" : score >= 400 ? "#e67e22" : "#e74c3c";
  const scoreLabel = score >= 700 ? "Risque faible" : score >= 400 ? "Risque modéré" : "Risque élevé";
  const scoreSublabel = score >= 700 ? "Accord possible" : score >= 400 ? "Analyse humaine requise" : "Refus recommandé";

  return (
    <svg width={size} height={size / 2 + 60} viewBox={`0 0 ${size} ${size / 2 + 60}`} className="overflow-visible">
      {/* Background track */}
      <path d={arcPath(180, 0, r)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeW} strokeLinecap="round" />

      {/* Colored zones */}
      {zones.map((z, i) => (
        <path key={i} d={arcPath(z.from, z.to, r)} fill="none" stroke={z.color} strokeWidth={strokeW} strokeLinecap={i === 0 ? "round" : i === zones.length - 1 ? "round" : "butt"} opacity={z.opacity} />
      ))}

      {/* Tick marks */}
      {tickAngles.map((angle, i) => {
        const inner = polarToXY(angle, r - strokeW / 2 - 6);
        const outer = polarToXY(angle, r + strokeW / 2 + 2);
        const label = String(i * 100);
        const lp = polarToXY(angle, r + strokeW / 2 + 16);
        return (
          <g key={i}>
            <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.3)" strokeWidth={i % 5 === 0 ? 2 : 1} />
            {i % 5 === 0 && (
              <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.4)" fontSize={9}>{label}</text>
            )}
          </g>
        );
      })}

      {/* Zone labels */}
      <text x={polarToXY(162, r - 34).x} y={polarToXY(162, r - 34).y} textAnchor="middle" fill="#e74c3c" fontSize={9} fontWeight="600">ÉLEVÉ</text>
      <text x={polarToXY(90, r - 34).x} y={polarToXY(90, r - 34).y} textAnchor="middle" fill="#e67e22" fontSize={9} fontWeight="600">MODÉRÉ</text>
      <text x={polarToXY(18, r - 34).x} y={polarToXY(18, r - 34).y} textAnchor="middle" fill="#2ecc71" fontSize={9} fontWeight="600">FAIBLE</text>

      {/* Needle */}
      <line x1={cx} y1={cy} x2={needleTip.x} y2={needleTip.y} stroke={scoreColor} strokeWidth={2.5} strokeLinecap="round" opacity={0.9} />
      <polygon points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`} fill={scoreColor} opacity={0.3} />
      <circle cx={cx} cy={cy} r={8} fill="#12151b" stroke={scoreColor} strokeWidth={2} />

      {/* Score text */}
      <text x={cx} y={cy - 30} textAnchor="middle" fill={scoreColor} fontSize={42} fontWeight="800">{score}</text>
      <text x={cx} y={cy - 14} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={14}>/1000</text>
      <text x={cx} y={cy + 26} textAnchor="middle" fill={scoreColor} fontSize={13} fontWeight="600">{scoreLabel}</text>
      <text x={cx} y={cy + 42} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={10}>{scoreSublabel}</text>
    </svg>
  );
}

export default function Score({ role, userName, userInitials, onLogout }: ScoreProps) {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const dossier = mockDossiers.find(d => d.id === params.id) || mockDossiers[0];
  const score = dossier.score || 742;

  const recoBg = score >= 700 ? "bg-green-400/10 border-green-400/30" : score >= 400 ? "bg-yellow-400/10 border-yellow-400/30" : "bg-red-400/10 border-red-400/30";
  const recoText = score >= 700 ? "text-green-400" : score >= 400 ? "text-yellow-400" : "text-red-400";
  const recoLabel = score >= 700 ? "ACCORD POSSIBLE" : score >= 400 ? "ACCORD SOUS CONDITIONS" : "REFUS RECOMMANDÉ";
  const recoIcon = score >= 700 ? CheckCircle : score >= 400 ? AlertTriangle : XCircle;
  const RecoIcon = recoIcon;

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title={`Score de solvabilité — ${dossier.reference}`} subtitle={`${dossier.client.prenom} ${dossier.client.nom}`}>
        <button onClick={() => setLocation(`/dossier/${dossier.id}`)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour au dossier
        </button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="grid grid-cols-2 gap-8">
          {/* Gauge */}
          <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">Score global de solvabilité</h2>
            <SemiCircleGauge score={score} />

            {/* Recommendation */}
            <div className={`mt-6 w-full flex items-center gap-3 px-5 py-4 rounded-xl border ${recoBg}`}>
              <RecoIcon className={`w-6 h-6 flex-shrink-0 ${recoText}`} />
              <div>
                <div className={`text-sm font-bold ${recoText}`}>{recoLabel}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Recommandation automatique — validation humaine obligatoire</div>
              </div>
            </div>

            {/* Probabilité défaut */}
            <div className="mt-4 w-full grid grid-cols-2 gap-3">
              <div className="bg-background border border-border rounded-lg px-4 py-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Probabilité de défaut</div>
                <div className="text-xl font-bold text-yellow-400">12.4%</div>
              </div>
              <div className="bg-background border border-border rounded-lg px-4 py-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Modèle scoring</div>
                <div className="text-sm font-semibold text-foreground">v2.3.1</div>
                <div className="text-[10px] text-muted-foreground">Calibré jan. 2024</div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground bg-muted/20 rounded-lg px-4 py-3 border border-border">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-primary/60" />
              Ce score est un outil d'aide à la décision. Conformément aux exigences réglementaires (RGPD Art. 22), toute décision finale requiert une validation humaine obligatoire par un analyste risque habilité.
            </div>
          </div>

          {/* Details */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Détail du calcul</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Contribution de chaque critère au score final</p>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
              {scoreDetails.map((item, i) => {
                const pct = (item.score / item.max) * 100;
                const barColor = pct >= 80 ? "bg-green-400" : pct >= 55 ? "bg-yellow-400" : "bg-red-400";
                return (
                  <div key={i} className="bg-background border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 mr-3">
                        <div className="text-sm font-medium text-foreground">{item.critere}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-foreground">{item.score}<span className="text-muted-foreground text-xs font-normal">/{item.max}</span></div>
                        <div className="text-[10px] text-muted-foreground">{item.valeur}</div>
                      </div>
                    </div>
                    <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-muted-foreground">0</span>
                      <span className={`text-[10px] font-medium ${barColor.replace("bg-", "text-")}`}>{pct.toFixed(0)}%</span>
                      <span className="text-[9px] text-muted-foreground">{item.max}</span>
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-xl">
                <span className="text-sm font-semibold text-foreground">Score total</span>
                <span className="text-lg font-bold text-primary">{score}<span className="text-muted-foreground text-sm font-normal">/1000</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
