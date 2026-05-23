import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import Layout, { PageHeader } from "@/components/Layout";
import { useCreateDossier } from "@/hooks/useApi";
import { Check, ChevronRight, ChevronLeft, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface NouveauDossierProps { role: string; userName: string; userInitials: string; onLogout: () => void; }

const txt = "hsl(220 25% 14%)";
const sub = "hsl(220 12% 48%)";

const steps = [
  { id: 1, label: "Identité" },
  { id: 2, label: "Situation pro." },
  { id: 3, label: "Revenus & charges" },
  { id: 4, label: "Demande crédit" },
  { id: 5, label: "Documents" },
];

type DocStatut = "fourni" | "manquant" | "a_verifier";
interface DocItem { nom: string; statut: DocStatut; }

const defaultDocs: DocItem[] = [
  { nom: "Pièce d'identité (CNI ou passeport)", statut: "manquant" },
  { nom: "Justificatif de domicile", statut: "manquant" },
  { nom: "Bulletin de paie – Mois M-1", statut: "manquant" },
  { nom: "Bulletin de paie – Mois M-2", statut: "manquant" },
  { nom: "Bulletin de paie – Mois M-3", statut: "manquant" },
  { nom: "Avis d'imposition N-1", statut: "manquant" },
  { nom: "Relevés de compte (3 mois)", statut: "manquant" },
  { nom: "IBAN / RIB", statut: "manquant" },
];

const docStatuts: DocStatut[] = ["manquant", "a_verifier", "fourni"];
const docLabels: Record<DocStatut, string> = { fourni: "Fourni", manquant: "Manquant", a_verifier: "À vérifier" };
const docColors: Record<DocStatut, string> = {
  fourni: "text-emerald-700 bg-emerald-50 border-emerald-200",
  manquant: "text-red-700 bg-red-50 border-red-200",
  a_verifier: "text-amber-700 bg-amber-50 border-amber-200",
};

const typesCredit = [
  "Crédit immobilier résidence principale",
  "Crédit immobilier investissement locatif",
  "Crédit consommation",
  "Crédit automobile",
  "Crédit travaux",
  "Crédit étudiant",
  "Regroupement de crédits",
  "Prêt personnel",
  "Crédit renouvelable",
  "Crédit professionnel individuel",
];

const inputCls = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-300 transition-all";
const labelCls = "text-[10px] uppercase tracking-widest font-semibold mb-1.5 block";
const selectCls = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-300";

export default function NouveauDossier({ role, userName, userInitials, onLogout }: NouveauDossierProps) {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [docs, setDocs] = useState<DocItem[]>(defaultDocs);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const createDossier = useCreateDossier();

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
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

  const cycleDocStatus = useCallback((idx: number) => {
    setDocs(d => d.map((doc, i) => {
      if (i !== idx) return doc;
      const nextIdx = (docStatuts.indexOf(doc.statut) + 1) % docStatuts.length;
      return { ...doc, statut: docStatuts[nextIdx] };
    }));
  }, []);

  const handleSubmit = async () => {
    setError("");
    try {
      const anciennete = (Number(ancienneteAns) || 0) + ((Number(ancienneteMois) || 0) / 12);
      await createDossier.mutateAsync({
        nom, prenom, dateNaissance, adresse, ville, codePostal,
        situationFamiliale, personnesCharge,
        statut, employeur, secteur, anciennete: anciennete.toFixed(2), poste,
        revenusNets, autresRevenus, chargesFixes, creditsEnCours,
        montant, duree, objet, apport, garant, valeurActif,
        conseiller: userName,
        conseillerEmail: "",
        documents: docs,
      });
      setSubmitted(true);
      setTimeout(() => setLocation("/mes-dossiers"), 2000);
    } catch (e: any) {
      setError(e.message || "Erreur lors de la création");
    }
  };

  if (submitted) {
    return (
      <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: txt }}>Dossier créé avec succès</h2>
            <p className="text-sm" style={{ color: sub }}>Redirection vers mes dossiers...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const taux = revenusNets && chargesFixes
    ? ((Number(chargesFixes) + Number(creditsEnCours || 0)) / Number(revenusNets)) * 100
    : null;
  const ral = revenusNets && chargesFixes
    ? Number(revenusNets) + Number(autresRevenus || 0) - Number(chargesFixes) - Number(creditsEnCours || 0)
    : null;

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Nouveau dossier de crédit" subtitle={`Saisie des informations client · Conseiller: ${userName}`} />

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
                    {done
                      ? <Check className="w-4 h-4 text-white" />
                      : <span className={`text-sm font-bold ${active ? "text-amber-600" : "text-gray-400"}`}>{step.id}</span>
                    }
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
                    <input className={inputCls} style={{ color: txt }} value={nom} onChange={e => setNom(e.target.value)} placeholder="DUPONT" />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Prénom</label>
                    <input className={inputCls} style={{ color: txt }} value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Martin" />
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={{ color: sub }}>Date de naissance</label>
                  <input type="date" className={inputCls} style={{ color: txt }} value={dateNaissance} onChange={e => setDateNaissance(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls} style={{ color: sub }}>Adresse</label>
                  <input className={inputCls} style={{ color: txt }} value={adresse} onChange={e => setAdresse(e.target.value)} placeholder="12 rue de la Paix" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Code postal</label>
                    <input className={inputCls} style={{ color: txt }} value={codePostal} onChange={e => setCodePostal(e.target.value)} placeholder="75001" />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Ville</label>
                    <input className={inputCls} style={{ color: txt }} value={ville} onChange={e => setVille(e.target.value)} placeholder="Paris" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Situation familiale</label>
                    <select className={selectCls} style={{ color: txt }} value={situationFamiliale} onChange={e => setSituationFamiliale(e.target.value)}>
                      {["Célibataire", "Marié(e)", "Pacsé(e)", "Divorcé(e)", "Veuf/Veuve"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Personnes à charge</label>
                    <input type="number" min="0" className={inputCls} style={{ color: txt }} value={personnesCharge} onChange={e => setPersonnesCharge(e.target.value)} placeholder="0" />
                  </div>
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
                  <input className={inputCls} style={{ color: txt }} value={employeur} onChange={e => setEmployeur(e.target.value)} placeholder="Ex: SNCF, Capgemini..." />
                </div>
                <div>
                  <label className={labelCls} style={{ color: sub }}>Poste occupé</label>
                  <input className={inputCls} style={{ color: txt }} value={poste} onChange={e => setPoste(e.target.value)} placeholder="Ex: Ingénieur, Chef de projet..." />
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
                    <input type="number" min="0" className={inputCls} style={{ color: txt }} value={revenusNets} onChange={e => setRevenusNets(e.target.value)} placeholder="3 500" />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Autres revenus (€/mois)</label>
                    <input type="number" min="0" className={inputCls} style={{ color: txt }} value={autresRevenus} onChange={e => setAutresRevenus(e.target.value)} placeholder="0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Charges fixes (€/mois)</label>
                    <input type="number" min="0" className={inputCls} style={{ color: txt }} value={chargesFixes} onChange={e => setChargesFixes(e.target.value)} placeholder="1 200" />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Crédits en cours (€/mois)</label>
                    <input type="number" min="0" className={inputCls} style={{ color: txt }} value={creditsEnCours} onChange={e => setCreditsEnCours(e.target.value)} placeholder="400" />
                  </div>
                </div>
                {taux !== null && (
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: sub }}>Calcul préliminaire</div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: sub }}>Taux d'endettement estimé</span>
                      <span className={`font-bold ${taux > 35 ? "text-red-600" : "text-emerald-600"}`}>
                        {taux.toFixed(1)}% {taux > 35 ? "⚠ au-dessus du seuil" : "✓ conforme"}
                      </span>
                    </div>
                    {ral !== null && (
                      <div className="flex justify-between text-sm">
                        <span style={{ color: sub }}>Reste à vivre estimé</span>
                        <span className="font-bold" style={{ color: txt }}>{ral.toLocaleString("fr-FR")} €/mois</span>
                      </div>
                    )}
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
                    <input type="number" min="0" className={inputCls} style={{ color: txt }} value={montant} onChange={e => setMontant(e.target.value)} placeholder="180 000" />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Durée (mois)</label>
                    <input type="number" min="0" className={inputCls} style={{ color: txt }} value={duree} onChange={e => setDuree(e.target.value)} placeholder="240" />
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
                    <input type="number" min="0" className={inputCls} style={{ color: txt }} value={apport} onChange={e => setApport(e.target.value)} placeholder="20 000" />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: sub }}>Valeur de l'actif financé (€)</label>
                    <input type="number" min="0" className={inputCls} style={{ color: txt }} value={valeurActif} onChange={e => setValeurActif(e.target.value)} placeholder="230 000" />
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
                <p className="text-xs" style={{ color: sub }}>Cliquer sur le badge de statut pour le faire évoluer</p>
                <div className="space-y-2">
                  {docs.map((doc, i) => {
                    const Icon = doc.statut === "fourni" ? CheckCircle2 : doc.statut === "manquant" ? XCircle : AlertCircle;
                    return (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 flex-shrink-0 ${doc.statut === "fourni" ? "text-emerald-600" : doc.statut === "manquant" ? "text-red-500" : "text-amber-500"}`} />
                          <span className="text-sm" style={{ color: txt }}>{doc.nom}</span>
                        </div>
                        <button onClick={() => cycleDocStatus(i)}
                          className={`text-xs font-semibold px-3 py-1 rounded-full border cursor-pointer transition-all ${docColors[doc.statut]}`}>
                          {docLabels[doc.statut]}
                        </button>
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
            <button onClick={() => currentStep > 1 ? setCurrentStep(s => s - 1) : setLocation("/dashboard")}
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
              <button onClick={handleSubmit} disabled={createDossier.isPending}
                className="flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "hsl(43 60% 46%)" }}>
                {createDossier.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Soumettre le dossier
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
