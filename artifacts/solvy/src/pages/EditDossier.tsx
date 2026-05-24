import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import Layout, { PageHeader } from "@/components/Layout";
import { useDossier, useUpdateDossier } from "@/hooks/useApi";
import { Check, ChevronRight, ChevronLeft, CheckCircle2, XCircle, AlertCircle, Loader2, Lock, ArrowLeft } from "lucide-react";

interface Props { role: string; userName: string; userInitials: string; userEmail?: string; onLogout: () => void; }

const txt = "hsl(220 25% 14%)";
const sub = "hsl(220 12% 48%)";

type DocStatut = "fourni" | "manquant" | "a_verifier";
interface DocItem { nom: string; statut: DocStatut; fichierNom?: string; dateTeleversement?: string; }

const docStatuts: DocStatut[] = ["manquant", "a_verifier", "fourni"];
const docLabels: Record<DocStatut, string> = { fourni: "Fourni", manquant: "Manquant", a_verifier: "À vérifier" };
const docColors: Record<DocStatut, string> = {
  fourni: "text-emerald-700 bg-emerald-50 border-emerald-200",
  manquant: "text-red-700 bg-red-50 border-red-200",
  a_verifier: "text-amber-700 bg-amber-50 border-amber-200",
};

const typesCredit = [
  "Crédit immobilier résidence principale", "Crédit immobilier investissement locatif",
  "Crédit consommation", "Crédit automobile", "Crédit travaux", "Crédit étudiant",
  "Regroupement de crédits", "Prêt personnel", "Crédit renouvelable", "Crédit professionnel individuel",
];

const inputCls = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-300 transition-all";
const labelCls = "text-[10px] uppercase tracking-widest font-semibold mb-1.5 block";
const selectCls = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-300";

const steps = [
  { id: 1, label: "Identité" },
  { id: 2, label: "Situation pro." },
  { id: 3, label: "Revenus & charges" },
  { id: 4, label: "Demande crédit" },
  { id: 5, label: "Documents" },
];

export default function EditDossier({ role, userName, userInitials, userEmail = "", onLogout }: Props) {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const { data: dossier, isLoading } = useDossier(params.id);
  const updateDossier = useUpdateDossier();

  const [currentStep, setCurrentStep] = useState(1);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [emailClient, setEmailClient] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ville, setVille] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [situationFamiliale, setSituationFamiliale] = useState("Célibataire");
  const [personnesCharge, setPersonnesCharge] = useState("");
  const [statut, setStatut] = useState("CDI");
  const [employeur, setEmployeur] = useState("");
  const [secteur, setSecteur] = useState("Informatique");
  const [ancienneteAns, setAncienneteAns] = useState("");
  const [ancienneteMois, setAncienneteMois] = useState("");
  const [poste, setPoste] = useState("");
  const [revenusNets, setRevenusNets] = useState("");
  const [autresRevenus, setAutresRevenus] = useState("");
  const [chargesFixes, setChargesFixes] = useState("");
  const [creditsEnCours, setCreditsEnCours] = useState("");
  const [montant, setMontant] = useState("");
  const [duree, setDuree] = useState("");
  const [objet, setObjet] = useState(typesCredit[0]);
  const [apport, setApport] = useState("");
  const [garant, setGarant] = useState("Non");
  const [valeurActif, setValeurActif] = useState("");
  const [docs, setDocs] = useState<DocItem[]>([]);

  useEffect(() => {
    if (!dossier) return;
    const c = dossier.client || {};
    const sp = dossier.situationPro || {};
    const f = dossier.finances || {};
    const d = dossier.demande || {};

    setNom((c as any).nom || "");
    setPrenom((c as any).prenom || "");
    setDateNaissance((c as any).dateNaissance || "");
    setEmailClient((c as any).email || "");
    setTelephone((c as any).telephone || "");
    setAdresse((c as any).adresse || "");
    setVille((c as any).ville || "");
    setCodePostal((c as any).codePostal || "");
    setSituationFamiliale((c as any).situationFamiliale || "Célibataire");
    setPersonnesCharge(String((c as any).personnesCharge ?? "0"));

    setStatut((sp as any).statut || "CDI");
    setEmployeur((sp as any).employeur || "");
    setSecteur((sp as any).secteur || "Informatique");
    setPoste((sp as any).poste || "");

    const totalMois = (sp as any).ancienneteMois !== undefined
      ? Number((sp as any).ancienneteMois)
      : Math.round(Number((sp as any).anciennete || 0) * 12);
    setAncienneteAns(String(Math.floor(totalMois / 12)));
    setAncienneteMois(String(totalMois % 12));

    setRevenusNets(String((f as any).revenusNets || ""));
    setAutresRevenus(String((f as any).autresRevenus || ""));
    setChargesFixes(String((f as any).chargesFixes || ""));
    setCreditsEnCours(String((f as any).creditsEnCours || ""));

    setMontant(String((d as any).montant || ""));
    setDuree(String((d as any).duree || ""));
    setObjet((d as any).objet || typesCredit[0]);
    setApport(String((d as any).apport || ""));
    setGarant((d as any).garant ? "Oui" : "Non");
    setValeurActif(String((d as any).valeurActif || ""));

    setDocs(Array.isArray(dossier.documents) ? dossier.documents : []);
  }, [dossier]);

  const cycleDocStatus = useCallback((idx: number) => {
    setDocs(d => d.map((doc, i) => {
      if (i !== idx) return doc;
      const nextIdx = (docStatuts.indexOf(doc.statut) + 1) % docStatuts.length;
      return { ...doc, statut: docStatuts[nextIdx] };
    }));
  }, []);

  const handlePDFUpload = (idx: number, file: File) => {
    setDocs(d => d.map((doc, i) => i === idx ? {
      ...doc,
      statut: "fourni",
      fichierNom: file.name,
      dateTeleversement: new Date().toLocaleDateString("fr-FR"),
    } : doc));
  };

  const handleSubmit = async () => {
    setError("");
    try {
      await updateDossier.mutateAsync({
        id: params.id,
        nom, prenom, dateNaissance, emailClient, telephone,
        adresse, ville, codePostal, situationFamiliale, personnesCharge,
        statut, employeur, secteur, ancienneteAns, ancienneteMois, poste,
        revenusNets, autresRevenus, chargesFixes, creditsEnCours,
        montant, duree, objet, apport, garant, valeurActif,
        documents: docs,
        modifiedBy: userName,
      });
      setSaved(true);
      setTimeout(() => setLocation(`/dossier/${params.id}`), 1500);
    } catch (e: any) {
      setError(e.message || "Erreur lors de la modification");
    }
  };

  const taux = revenusNets && chargesFixes
    ? ((Number(chargesFixes) + Number(creditsEnCours || 0)) / Number(revenusNets)) * 100
    : null;

  if (isLoading) {
    return (
      <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      </Layout>
    );
  }

  if (dossier?.decision) {
    return (
      <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: txt }}>Dossier verrouillé</h2>
            <p className="text-sm mb-4" style={{ color: sub }}>
              Ce dossier a déjà reçu une décision finale et ne peut plus être modifié.
            </p>
            <button onClick={() => setLocation(`/dossier/${params.id}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 mx-auto">
              <ArrowLeft className="w-4 h-4" /> Retour au dossier
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (saved) {
    return (
      <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: txt }}>Dossier mis à jour</h2>
            <p className="text-sm" style={{ color: sub }}>Redirection vers le dossier...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader
        title={`Modifier le dossier ${dossier?.reference || ""}`}
        subtitle={`${dossier?.client ? `${(dossier.client as any).prenom} ${(dossier.client as any).nom}` : ""} · Conseiller: ${userName}`}
      >
        <button onClick={() => setLocation(`/dossier/${params.id}`)}
          className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-colors" style={{ color: sub }}>
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Stepper */}
        <div className="flex items-center mb-8">
          {steps.map((step, i) => {
            const done = currentStep > step.id;
            const active = currentStep === step.id;
            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${done ? "border-amber-500 bg-amber-500" : active ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-white"}`}>
                    {done ? <Check className="w-4 h-4 text-white" />
                      : <span className={`text-sm font-bold ${active ? "text-amber-600" : "text-gray-400"}`}>{step.id}</span>}
                  </div>
                  <span className={`text-[10px] font-medium whitespace-nowrap ${active ? "text-amber-700" : done ? "text-gray-700" : "text-gray-400"}`}>{step.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 mb-4 transition-all ${done ? "bg-amber-400" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">

            {/* Step 1 — Identity */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold mb-4" style={{ color: txt }}>Identité du client</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Nom</label>
                    <input className={inputCls} style={{ color: txt }} value={nom} onChange={e => setNom(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Prénom</label>
                    <input className={inputCls} style={{ color: txt }} value={prenom} onChange={e => setPrenom(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Date de naissance</label>
                    <input type="date" className={inputCls} style={{ color: txt }} value={dateNaissance} onChange={e => setDateNaissance(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Situation familiale</label>
                    <select className={selectCls} style={{ color: txt }} value={situationFamiliale} onChange={e => setSituationFamiliale(e.target.value)}>
                      {["Célibataire", "Marié(e)", "Pacsé(e)", "Divorcé(e)", "Veuf/Veuve"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Email client</label>
                    <input type="email" className={inputCls} style={{ color: txt }} value={emailClient} onChange={e => setEmailClient(e.target.value)} placeholder="client@email.fr" />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Téléphone</label>
                    <input className={inputCls} style={{ color: txt }} value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="06 00 00 00 00" />
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={{ color: sub }}>Adresse</label>
                  <input className={inputCls} style={{ color: txt }} value={adresse} onChange={e => setAdresse(e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Code postal</label>
                    <input className={inputCls} style={{ color: txt }} value={codePostal} onChange={e => setCodePostal(e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls} style={{ color: sub }}>Ville</label>
                    <input className={inputCls} style={{ color: txt }} value={ville} onChange={e => setVille(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={{ color: sub }}>Personnes à charge</label>
                  <input type="number" min="0" className={inputCls} style={{ color: txt }} value={personnesCharge} onChange={e => setPersonnesCharge(e.target.value)} />
                </div>
              </div>
            )}

            {/* Step 2 — Professional */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold mb-4" style={{ color: txt }}>Situation professionnelle</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Statut professionnel</label>
                    <select className={selectCls} style={{ color: txt }} value={statut} onChange={e => setStatut(e.target.value)}>
                      {["CDI", "CDD", "Intérim", "Indépendant", "Fonctionnaire", "Retraité", "Sans emploi"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Ancienneté professionnelle</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <input type="number" min="0" className={inputCls} style={{ color: txt }} value={ancienneteAns} onChange={e => setAncienneteAns(e.target.value)} placeholder="0" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: sub }}>ans</span>
                      </div>
                      <div className="relative">
                        <input type="number" min="0" max="11" className={inputCls} style={{ color: txt }} value={ancienneteMois} onChange={e => setAncienneteMois(e.target.value)} placeholder="0" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: sub }}>mois</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={{ color: sub }}>Employeur / Entreprise</label>
                  <input className={inputCls} style={{ color: txt }} value={employeur} onChange={e => setEmployeur(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} style={{ color: sub }}>Poste occupé</label>
                  <input className={inputCls} style={{ color: txt }} value={poste} onChange={e => setPoste(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} style={{ color: sub }}>Secteur d'activité</label>
                  <select className={selectCls} style={{ color: txt }} value={secteur} onChange={e => setSecteur(e.target.value)}>
                    {["Informatique", "Finance / Banque", "Santé", "Éducation", "BTP", "Transport", "Commerce", "Industrie", "Secteur public", "Autre"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Step 3 — Finances */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold mb-4" style={{ color: txt }}>Revenus et charges</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Revenus nets mensuels (€)</label>
                    <input type="number" min="0" className={inputCls} style={{ color: txt }} value={revenusNets} onChange={e => setRevenusNets(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Autres revenus (€/mois)</label>
                    <input type="number" min="0" className={inputCls} style={{ color: txt }} value={autresRevenus} onChange={e => setAutresRevenus(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Charges fixes (€/mois)</label>
                    <input type="number" min="0" className={inputCls} style={{ color: txt }} value={chargesFixes} onChange={e => setChargesFixes(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Crédits en cours (€/mois)</label>
                    <input type="number" min="0" className={inputCls} style={{ color: txt }} value={creditsEnCours} onChange={e => setCreditsEnCours(e.target.value)} />
                  </div>
                </div>
                {taux !== null && (
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: sub }}>Taux d'endettement estimé</span>
                      <span className={`font-bold ${taux > 35 ? "text-red-600" : "text-emerald-600"}`}>
                        {taux.toFixed(1)}% {taux > 35 ? "⚠ au-dessus du seuil" : "✓ conforme"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4 — Credit */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold mb-4" style={{ color: txt }}>Demande de crédit</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Montant demandé (€)</label>
                    <input type="number" min="0" className={inputCls} style={{ color: txt }} value={montant} onChange={e => setMontant(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Durée (mois)</label>
                    <input type="number" min="0" className={inputCls} style={{ color: txt }} value={duree} onChange={e => setDuree(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={{ color: sub }}>Type / Objet du crédit</label>
                  <select className={selectCls} style={{ color: txt }} value={objet} onChange={e => setObjet(e.target.value)}>
                    {typesCredit.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Apport personnel (€)</label>
                    <input type="number" min="0" className={inputCls} style={{ color: txt }} value={apport} onChange={e => setApport(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Valeur de l'actif financé (€)</label>
                    <input type="number" min="0" className={inputCls} style={{ color: txt }} value={valeurActif} onChange={e => setValeurActif(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={{ color: sub }}>Présence d'un garant</label>
                  <select className={selectCls} style={{ color: txt }} value={garant} onChange={e => setGarant(e.target.value)}>
                    <option>Non</option>
                    <option>Oui</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 5 — Documents */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold" style={{ color: txt }}>Documents justificatifs</h3>
                <p className="text-xs" style={{ color: sub }}>Cliquer sur le badge pour changer le statut · Bouton PDF pour téléverser</p>
                <div className="space-y-2">
                  {docs.map((doc, i) => {
                    const Icon = doc.statut === "fourni" ? CheckCircle2 : doc.statut === "manquant" ? XCircle : AlertCircle;
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${doc.statut === "fourni" ? "text-emerald-600" : doc.statut === "manquant" ? "text-red-500" : "text-amber-500"}`} />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm" style={{ color: txt }}>{doc.nom}</span>
                          {doc.fichierNom && (
                            <div className="text-[10px] mt-0.5 text-emerald-600">📎 {doc.fichierNom} · {doc.dateTeleversement}</div>
                          )}
                        </div>
                        <button onClick={() => cycleDocStatus(i)}
                          className={`text-xs font-semibold px-3 py-1 rounded-full border cursor-pointer transition-all flex-shrink-0 ${docColors[doc.statut]}`}>
                          {docLabels[doc.statut]}
                        </button>
                        <label className="flex-shrink-0 cursor-pointer">
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                            onChange={e => { if (e.target.files?.[0]) handlePDFUpload(i, e.target.files[0]); }} />
                          <span className="text-xs px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                            📄 PDF
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 text-xs pt-2 border-t border-gray-100">
                  <span className="text-emerald-600 font-medium">{docs.filter(d => d.statut === "fourni").length} fournis</span>
                  <span className="text-red-500 font-medium">{docs.filter(d => d.statut === "manquant").length} manquants</span>
                  <span className="text-amber-500 font-medium">{docs.filter(d => d.statut === "a_verifier").length} à vérifier</span>
                </div>
                {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button onClick={() => currentStep > 1 ? setCurrentStep(s => s - 1) : setLocation(`/dossier/${params.id}`)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all">
              <ChevronLeft className="w-4 h-4" />
              {currentStep > 1 ? "Précédent" : "Annuler"}
            </button>
            {currentStep < 5 ? (
              <button onClick={() => setCurrentStep(s => s + 1)}
                className="flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
                style={{ background: "hsl(43 60% 46%)" }}>
                Suivant <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={updateDossier.isPending}
                className="flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "hsl(43 60% 46%)" }}>
                {updateDossier.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Sauvegarder les modifications
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
