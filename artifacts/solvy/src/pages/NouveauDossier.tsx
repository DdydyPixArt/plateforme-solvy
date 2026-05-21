import { useState } from "react";
import { useLocation } from "wouter";
import Layout, { PageHeader } from "@/components/Layout";
import { Check, ChevronRight, ChevronLeft, User, Briefcase, DollarSign, Home, FileText, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface NouveauDossierProps { role: string; userName: string; userInitials: string; onLogout: () => void; }

const txt = "hsl(220 25% 14%)";
const sub = "hsl(220 12% 48%)";

const steps = [
  { id: 1, label: "Identité", icon: User },
  { id: 2, label: "Situation pro.", icon: Briefcase },
  { id: 3, label: "Revenus & charges", icon: DollarSign },
  { id: 4, label: "Demande crédit", icon: Home },
  { id: 5, label: "Documents", icon: FileText },
];

const docStatuts = ["fourni", "manquant", "a_verifier"] as const;
type DocStatut = typeof docStatuts[number];

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

export default function NouveauDossier({ role, userName, userInitials, onLogout }: NouveauDossierProps) {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [docs, setDocs] = useState<DocItem[]>(defaultDocs);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    nom: "", prenom: "", dateNaissance: "", adresse: "", ville: "", codePostal: "",
    situationFamiliale: "Célibataire", personnesCharge: "0",
    statut: "CDI", employeur: "", secteur: "", anciennete: "", poste: "",
    revenusNets: "", autresRevenus: "", chargesFixes: "", creditsEnCours: "",
    montant: "", duree: "", objet: "", apport: "", garant: "Non", valeurActif: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const cycleDocStatus = (idx: number) => {
    setDocs(d => d.map((doc, i) => i === idx ? { ...doc, statut: docStatuts[(docStatuts.indexOf(doc.statut) + 1) % docStatuts.length] } : doc));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setLocation("/dashboard"), 2000);
  };

  const Field = ({ label, type = "text", value, onChange, placeholder, options }: any) => (
    <div>
      <label className="text-[10px] uppercase tracking-widest font-semibold mb-1.5 block" style={{ color: sub }}>{label}</label>
      {options ? (
        <select value={value} onChange={onChange}
          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-300" style={{ color: txt }}>
          {options.map((o: string) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:border-amber-300 transition-all"
          style={{ color: txt }} />
      )}
    </div>
  );

  if (submitted) {
    return (
      <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: txt }}>Dossier soumis avec succès</h2>
            <p className="text-sm" style={{ color: sub }}>Redirection vers le tableau de bord...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role={role} userName={userName} userInitials={userInitials} onLogout={onLogout}>
      <PageHeader title="Nouveau dossier de crédit" subtitle={`Saisie des informations client · Conseiller: ${userName}`} />

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Stepper */}
        <div className="flex items-center mb-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const done = currentStep > step.id;
            const active = currentStep === step.id;
            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${done ? "border-amber-500 bg-amber-500" : active ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-white"}`}>
                    {done ? <Check className="w-4 h-4 text-white" /> : <Icon className={`w-4 h-4 ${active ? "text-amber-600" : "text-gray-400"}`} />}
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
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold mb-4" style={{ color: txt }}>Identité du client</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Nom" value={form.nom} onChange={set("nom")} placeholder="DUPONT" />
                  <Field label="Prénom" value={form.prenom} onChange={set("prenom")} placeholder="Martin" />
                </div>
                <Field label="Date de naissance" type="date" value={form.dateNaissance} onChange={set("dateNaissance")} />
                <Field label="Adresse" value={form.adresse} onChange={set("adresse")} placeholder="12 rue de la Paix" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Code postal" value={form.codePostal} onChange={set("codePostal")} placeholder="75001" />
                  <Field label="Ville" value={form.ville} onChange={set("ville")} placeholder="Paris" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Situation familiale" value={form.situationFamiliale} onChange={set("situationFamiliale")} options={["Célibataire", "Marié(e)", "Pacsé(e)", "Divorcé(e)", "Veuf/Veuve"]} />
                  <Field label="Personnes à charge" type="number" value={form.personnesCharge} onChange={set("personnesCharge")} placeholder="0" />
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold mb-4" style={{ color: txt }}>Situation professionnelle</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Statut professionnel" value={form.statut} onChange={set("statut")} options={["CDI", "CDD", "Intérim", "Indépendant", "Fonctionnaire", "Retraité", "Sans emploi"]} />
                  <Field label="Ancienneté (années)" type="number" value={form.anciennete} onChange={set("anciennete")} placeholder="5" />
                </div>
                <Field label="Employeur / Entreprise" value={form.employeur} onChange={set("employeur")} placeholder="Ex: SNCF, Capgemini..." />
                <Field label="Poste occupé" value={form.poste} onChange={set("poste")} placeholder="Ex: Ingénieur, Chef de projet..." />
                <Field label="Secteur d'activité" value={form.secteur} onChange={set("secteur")} options={["Informatique", "Finance / Banque", "Santé", "Éducation", "BTP", "Transport", "Commerce", "Industrie", "Secteur public", "Autre"]} />
              </div>
            )}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold mb-4" style={{ color: txt }}>Revenus et charges</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Revenus nets mensuels (€)" type="number" value={form.revenusNets} onChange={set("revenusNets")} placeholder="3 500" />
                  <Field label="Autres revenus (€/mois)" type="number" value={form.autresRevenus} onChange={set("autresRevenus")} placeholder="0" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Charges fixes (€/mois)" type="number" value={form.chargesFixes} onChange={set("chargesFixes")} placeholder="1 200" />
                  <Field label="Crédits en cours (€/mois)" type="number" value={form.creditsEnCours} onChange={set("creditsEnCours")} placeholder="400" />
                </div>
                {form.revenusNets && form.chargesFixes && (() => {
                  const taux = ((Number(form.chargesFixes) + Number(form.creditsEnCours)) / Number(form.revenusNets)) * 100;
                  const ral = Number(form.revenusNets) + Number(form.autresRevenus || 0) - Number(form.chargesFixes) - Number(form.creditsEnCours || 0);
                  return (
                    <div className="mt-2 p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: sub }}>Calcul préliminaire</div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: sub }}>Taux d'endettement estimé</span>
                        <span className={`font-bold ${taux > 35 ? "text-red-600" : "text-emerald-600"}`}>{taux.toFixed(1)}% {taux > 35 ? "⚠ au-dessus du seuil" : "✓ conforme"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: sub }}>Reste à vivre estimé</span>
                        <span className="font-bold" style={{ color: txt }}>{ral.toLocaleString("fr-FR")} €/mois</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold mb-4" style={{ color: txt }}>Demande de crédit</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Montant demandé (€)" type="number" value={form.montant} onChange={set("montant")} placeholder="180 000" />
                  <Field label="Durée (mois)" type="number" value={form.duree} onChange={set("duree")} placeholder="240" />
                </div>
                <Field label="Objet du crédit" value={form.objet} onChange={set("objet")} placeholder="Ex: Acquisition immobilière – résidence principale" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Apport personnel (€)" type="number" value={form.apport} onChange={set("apport")} placeholder="20 000" />
                  <Field label="Valeur de l'actif financé (€)" type="number" value={form.valeurActif} onChange={set("valeurActif")} placeholder="230 000" />
                </div>
                <Field label="Présence d'un garant" value={form.garant} onChange={set("garant")} options={["Non", "Oui"]} />
              </div>
            )}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold mb-1" style={{ color: txt }}>Documents justificatifs</h3>
                <p className="text-xs mb-4" style={{ color: sub }}>Cliquer sur le statut pour le faire évoluer</p>
                <div className="space-y-2">
                  {docs.map((doc, i) => {
                    const Icon = doc.statut === "fourni" ? CheckCircle2 : doc.statut === "manquant" ? XCircle : AlertCircle;
                    const colors = {
                      fourni: "text-emerald-700 bg-emerald-50 border-emerald-200",
                      manquant: "text-red-700 bg-red-50 border-red-200",
                      a_verifier: "text-amber-700 bg-amber-50 border-amber-200"
                    };
                    const labels = { fourni: "Fourni", manquant: "Manquant", a_verifier: "À vérifier" };
                    return (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 flex-shrink-0 ${doc.statut === "fourni" ? "text-emerald-600" : doc.statut === "manquant" ? "text-red-500" : "text-amber-500"}`} />
                          <span className="text-sm" style={{ color: txt }}>{doc.nom}</span>
                        </div>
                        <button onClick={() => cycleDocStatus(i)} className={`text-xs font-semibold px-3 py-1 rounded-full border cursor-pointer transition-all ${colors[doc.statut]}`}>
                          {labels[doc.statut]}
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
              <button onClick={handleSubmit}
                className="flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
                style={{ background: "hsl(43 60% 46%)" }}>
                <Check className="w-4 h-4" /> Soumettre le dossier
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
