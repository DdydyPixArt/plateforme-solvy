import { db, usersTable, dossiersTable, notificationsTable, auditLogsTable } from "./index.js";

async function seed() {
  console.log("Seeding database with demo data...");

  await db.insert(usersTable).values([
    { id: "u1", nom: "Martin", prenom: "Sophie", email: "s.martin@solvy-banque.fr", role: "conseiller", statut: "actif", derniereConnexion: "2024-01-18 09:12", avatar: "SM" },
    { id: "u2", nom: "Durand", prenom: "Pierre", email: "p.durand@solvy-banque.fr", role: "analyste", statut: "actif", derniereConnexion: "2024-01-18 11:05", avatar: "PD" },
    { id: "u3", nom: "Bernard", prenom: "Isabelle", email: "i.bernard@solvy-banque.fr", role: "admin", statut: "actif", derniereConnexion: "2024-01-17 16:45", avatar: "IB" },
    { id: "u4", nom: "Lefebvre", prenom: "Marc", email: "m.lefebvre@solvy-banque.fr", role: "conseiller", statut: "actif", derniereConnexion: "2024-01-18 08:30", avatar: "ML" },
    { id: "u5", nom: "Moreau", prenom: "Claire", email: "c.moreau@solvy-banque.fr", role: "analyste", statut: "inactif", derniereConnexion: "2024-01-10 14:22", avatar: "CM" },
  ]).onConflictDoNothing();

  await db.insert(dossiersTable).values([
    {
      id: "d1", reference: "DOS-2024-0147", status: "score_calcule", score: 742, decision: null,
      tauxEndettement: 38.6, capaciteEmprunt: 1260, resteAVivre: 2030, incidents: 2,
      ficp: false, fcc: false, ppe: false, lcbft: true,
      dateCreation: "2024-01-15", conseiller: "Sophie Martin", conseillerEmail: "s.martin@solvy-banque.fr",
      analysteAssigne: null, analysteCommentaire: "", transmisAt: null,
      client: { id: "c1", nom: "Dupont", prenom: "Martin", dateNaissance: "1982-07-14", adresse: "12 rue de la Paix", ville: "Paris", codePostal: "75001", situationFamiliale: "Marié", personnesCharge: 2, telephone: "06 12 34 56 78", email: "m.dupont@email.com" },
      situationPro: { statut: "CDI", employeur: "SNCF", secteur: "Transport", anciennete: 8, poste: "Ingénieur Systèmes" },
      finances: { revenusNets: 4200, autresRevenus: 300, chargesFixes: 1250, creditsEnCours: 620 },
      demande: { montant: 180000, duree: 240, objet: "Crédit immobilier résidence principale", apport: 20000, garant: false, valeurActif: 230000 },
      documents: [
        { nom: "Pièce d'identité", statut: "fourni", date: "2024-01-15" },
        { nom: "Justificatif de domicile", statut: "fourni", date: "2024-01-15" },
        { nom: "Bulletin de paie (Nov.)", statut: "fourni", date: "2024-01-15" },
        { nom: "Bulletin de paie (Oct.)", statut: "fourni", date: "2024-01-15" },
        { nom: "Bulletin de paie (Sep.)", statut: "fourni", date: "2024-01-15" },
        { nom: "Avis d'imposition 2023", statut: "fourni", date: "2024-01-15" },
        { nom: "Relevés de compte (3 mois)", statut: "a_verifier", date: "2024-01-16" },
        { nom: "IBAN", statut: "fourni", date: "2024-01-15" },
      ],
      historique: [
        { date: "2024-01-15 09:12", utilisateur: "Sophie Martin", action: "Création du dossier", statut: "Complété" },
        { date: "2024-01-15 09:45", utilisateur: "Sophie Martin", action: "Ajout documents (PI, JD, BP)", statut: "Complété" },
        { date: "2024-01-16 14:20", utilisateur: "Système", action: "Contrôle LCB-FT automatique", statut: "Conforme" },
        { date: "2024-01-16 14:20", utilisateur: "Système", action: "Contrôle FICP/FCC", statut: "Non inscrit" },
        { date: "2024-01-17 10:05", utilisateur: "Système", action: "Calcul score solvabilité v2.3.1", statut: "Score: 742/1000" },
      ],
    },
    {
      id: "d2", reference: "DOS-2024-0143", status: "decision_rendue", score: 831, decision: "accord",
      tauxEndettement: 28.4, capaciteEmprunt: 2100, resteAVivre: 3200, incidents: 0,
      ficp: false, fcc: false, ppe: false, lcbft: true,
      dateCreation: "2024-01-10", conseiller: "Marc Lefebvre", conseillerEmail: "m.lefebvre@solvy-banque.fr",
      analysteAssigne: "Pierre Durand", analysteCommentaire: "Score 831/1000 – Toutes conditions réunies. Accord accordé.", transmisAt: "2024-01-12 10:00",
      client: { id: "c2", nom: "Laurent", prenom: "Émilie", dateNaissance: "1988-03-22", adresse: "45 avenue Victor Hugo", ville: "Lyon", codePostal: "69001", situationFamiliale: "Célibataire", personnesCharge: 0, telephone: "06 87 65 43 21", email: "e.laurent@email.com" },
      situationPro: { statut: "CDI", employeur: "Capgemini", secteur: "Informatique", anciennete: 5, poste: "Chef de Projet" },
      finances: { revenusNets: 5800, autresRevenus: 0, chargesFixes: 1200, creditsEnCours: 448 },
      demande: { montant: 250000, duree: 300, objet: "Crédit immobilier résidence principale", apport: 50000, garant: false, valeurActif: 320000 },
      documents: [
        { nom: "Pièce d'identité", statut: "fourni", date: "2024-01-10" },
        { nom: "Justificatif de domicile", statut: "fourni", date: "2024-01-10" },
        { nom: "Bulletins de paie (3 mois)", statut: "fourni", date: "2024-01-10" },
        { nom: "Avis d'imposition 2023", statut: "fourni", date: "2024-01-10" },
        { nom: "Relevés de compte", statut: "fourni", date: "2024-01-10" },
        { nom: "IBAN", statut: "fourni", date: "2024-01-10" },
      ],
      historique: [
        { date: "2024-01-10 10:00", utilisateur: "Marc Lefebvre", action: "Création du dossier", statut: "Complété" },
        { date: "2024-01-11 09:30", utilisateur: "Système", action: "Contrôles réglementaires", statut: "Conformes" },
        { date: "2024-01-12 11:00", utilisateur: "Système", action: "Calcul score solvabilité", statut: "Score: 831/1000" },
        { date: "2024-01-12 10:00", utilisateur: "Marc Lefebvre", action: "Dossier transmis à l'analyse risque", statut: "Transmis" },
        { date: "2024-01-13 14:00", utilisateur: "Pierre Durand", action: "Décision: Accord", statut: "Validé" },
      ],
    },
    {
      id: "d3", reference: "DOS-2024-0151", status: "incomplet", score: null, decision: null,
      tauxEndettement: 0, capaciteEmprunt: 0, resteAVivre: 0, incidents: 0,
      ficp: false, fcc: false, ppe: false, lcbft: false,
      dateCreation: "2024-01-18", conseiller: "Sophie Martin", conseillerEmail: "s.martin@solvy-banque.fr",
      analysteAssigne: null, analysteCommentaire: null, transmisAt: null,
      client: { id: "c3", nom: "Moreau", prenom: "Thomas", dateNaissance: "1975-11-08", adresse: "8 rue du Commerce", ville: "Bordeaux", codePostal: "33000", situationFamiliale: "Divorcé", personnesCharge: 1, telephone: "06 55 44 33 22", email: "t.moreau@email.com" },
      situationPro: { statut: "Indépendant", employeur: "Auto-entrepreneur", secteur: "BTP", anciennete: 3, poste: "Artisan" },
      finances: { revenusNets: 2800, autresRevenus: 500, chargesFixes: 900, creditsEnCours: 300 },
      demande: { montant: 80000, duree: 120, objet: "Crédit travaux", apport: 10000, garant: true, valeurActif: 0 },
      documents: [
        { nom: "Pièce d'identité", statut: "fourni", date: "2024-01-18" },
        { nom: "Justificatif de domicile", statut: "manquant" },
        { nom: "Bulletins de paie", statut: "manquant" },
        { nom: "Avis d'imposition 2023", statut: "manquant" },
        { nom: "Relevés de compte", statut: "manquant" },
        { nom: "IBAN", statut: "fourni", date: "2024-01-18" },
      ],
      historique: [
        { date: "2024-01-18 14:00", utilisateur: "Sophie Martin", action: "Création du dossier", statut: "Incomplet" },
      ],
    },
    {
      id: "d4", reference: "DOS-2024-0138", status: "decision_rendue", score: 312, decision: "refus",
      tauxEndettement: 61.2, capaciteEmprunt: 380, resteAVivre: 890, incidents: 7,
      ficp: true, fcc: false, ppe: false, lcbft: true,
      dateCreation: "2024-01-05", conseiller: "Marc Lefebvre", conseillerEmail: "m.lefebvre@solvy-banque.fr",
      analysteAssigne: "Pierre Durand", analysteCommentaire: "Score 312/1000, FICP inscrit, taux d'endettement 61.2%. Refus justifié.", transmisAt: "2024-01-07 09:00",
      client: { id: "c4", nom: "Petit", prenom: "Jean-Claude", dateNaissance: "1969-05-25", adresse: "32 rue Nationale", ville: "Marseille", codePostal: "13001", situationFamiliale: "Séparé", personnesCharge: 3, telephone: "06 11 22 33 44", email: "jc.petit@email.com" },
      situationPro: { statut: "CDD", employeur: "Interim Service", secteur: "Logistique", anciennete: 1, poste: "Manutentionnaire" },
      finances: { revenusNets: 1800, autresRevenus: 0, chargesFixes: 820, creditsEnCours: 280 },
      demande: { montant: 45000, duree: 84, objet: "Crédit automobile", apport: 0, garant: false, valeurActif: 35000 },
      documents: [
        { nom: "Pièce d'identité", statut: "fourni", date: "2024-01-05" },
        { nom: "Justificatif de domicile", statut: "fourni", date: "2024-01-05" },
        { nom: "Bulletins de paie (3 mois)", statut: "fourni", date: "2024-01-05" },
        { nom: "Avis d'imposition 2023", statut: "a_verifier", date: "2024-01-06" },
        { nom: "Relevés de compte", statut: "fourni", date: "2024-01-05" },
        { nom: "IBAN", statut: "fourni", date: "2024-01-05" },
      ],
      historique: [
        { date: "2024-01-05 09:00", utilisateur: "Marc Lefebvre", action: "Création du dossier", statut: "Complété" },
        { date: "2024-01-06 10:00", utilisateur: "Système", action: "Alerte FICP inscrit", statut: "Alerte" },
        { date: "2024-01-07 11:00", utilisateur: "Système", action: "Score: 312/1000 – Risque élevé", statut: "Calculé" },
        { date: "2024-01-07 09:00", utilisateur: "Marc Lefebvre", action: "Dossier transmis à l'analyse risque", statut: "Transmis" },
        { date: "2024-01-08 14:30", utilisateur: "Pierre Durand", action: "Décision: Refus", statut: "Finalisé" },
      ],
    },
    {
      id: "d5", reference: "DOS-2024-0155", status: "en_analyse", score: 678, decision: null,
      tauxEndettement: 33.2, capaciteEmprunt: 1560, resteAVivre: 2450, incidents: 1,
      ficp: false, fcc: false, ppe: true, lcbft: true,
      dateCreation: "2024-01-16", conseiller: "Sophie Martin", conseillerEmail: "s.martin@solvy-banque.fr",
      analysteAssigne: "Pierre Durand", analysteCommentaire: "", transmisAt: "2024-01-18 09:30",
      client: { id: "c5", nom: "Renaud", prenom: "Isabelle", dateNaissance: "1979-09-12", adresse: "78 boulevard Haussmann", ville: "Paris", codePostal: "75008", situationFamiliale: "Mariée", personnesCharge: 1, telephone: "06 99 88 77 66", email: "i.renaud@email.com" },
      situationPro: { statut: "CDI", employeur: "Ministère des Finances", secteur: "Secteur public", anciennete: 15, poste: "Inspectrice des finances" },
      finances: { revenusNets: 5200, autresRevenus: 800, chargesFixes: 1800, creditsEnCours: 240 },
      demande: { montant: 320000, duree: 240, objet: "Crédit immobilier investissement locatif", apport: 80000, garant: false, valeurActif: 420000 },
      documents: [
        { nom: "Pièce d'identité", statut: "fourni", date: "2024-01-16" },
        { nom: "Justificatif de domicile", statut: "fourni", date: "2024-01-16" },
        { nom: "Bulletins de paie (3 mois)", statut: "fourni", date: "2024-01-16" },
        { nom: "Avis d'imposition 2023", statut: "fourni", date: "2024-01-16" },
        { nom: "Relevés de compte", statut: "a_verifier", date: "2024-01-17" },
        { nom: "IBAN", statut: "fourni", date: "2024-01-16" },
      ],
      historique: [
        { date: "2024-01-16 11:00", utilisateur: "Sophie Martin", action: "Création du dossier", statut: "Complété" },
        { date: "2024-01-17 09:00", utilisateur: "Système", action: "Contrôle PPE – Statut PPE détecté", statut: "Alerte" },
        { date: "2024-01-17 14:00", utilisateur: "Système", action: "Score calculé: 678/1000", statut: "Score: 678/1000" },
        { date: "2024-01-18 09:30", utilisateur: "Sophie Martin", action: "Dossier transmis à l'analyse risque", statut: "Transmis" },
        { date: "2024-01-18 09:30", utilisateur: "Pierre Durand", action: "Analyse en cours", statut: "En cours" },
      ],
    },
  ]).onConflictDoNothing();

  await db.insert(notificationsTable).values([
    { id: "n1", type: "decision", titre: "Décision reçue — Accord sous conditions", message: "L'analyste Pierre Durand a émis une décision sur le dossier DOS-2024-0147. Accord sous conditions : apport supplémentaire de 10 000 € requis.", dossierRef: "DOS-2024-0147", dossierId: "d1", userEmail: "s.martin@solvy-banque.fr", lue: false, date: "2024-01-18 11:15" },
    { id: "n2", type: "score_calcule", titre: "Score de solvabilité calculé", message: "Le score de solvabilité pour le dossier DOS-2024-0147 (Martin Dupont) a été calculé automatiquement par le moteur SOLVY v2.3.1 : 742/1000.", dossierRef: "DOS-2024-0147", dossierId: "d1", userEmail: "s.martin@solvy-banque.fr", lue: false, date: "2024-01-17 10:05" },
    { id: "n3", type: "alerte_conformite", titre: "Alerte PPE détectée — DOS-2024-0155", message: "Un statut PPE (Personne Politiquement Exposée) a été détecté pour Isabelle Renaud. Une vérification LCB-FT renforcée est requise.", dossierRef: "DOS-2024-0155", dossierId: "d5", userEmail: "s.martin@solvy-banque.fr", lue: false, date: "2024-01-17 09:00" },
    { id: "n4", type: "dossier_incomplet", titre: "Dossier incomplet — Thomas Moreau", message: "Le dossier DOS-2024-0151 est incomplet. Documents manquants : justificatif de domicile, bulletins de paie, avis d'imposition, relevés de compte (4 documents).", dossierRef: "DOS-2024-0151", dossierId: "d3", userEmail: "s.martin@solvy-banque.fr", lue: false, date: "2024-01-18 14:00" },
    { id: "n5", type: "document_recu", titre: "Documents reçus — DOS-2024-0147", message: "Sophie Martin a ajouté 4 documents justificatifs au dossier de Martin Dupont : pièce d'identité, justificatif de domicile, 3 bulletins de paie, IBAN.", dossierRef: "DOS-2024-0147", dossierId: "d1", userEmail: "s.martin@solvy-banque.fr", lue: true, date: "2024-01-15 09:45" },
    { id: "n6", type: "demande_doc", titre: "Documents complémentaires demandés", message: "L'analyste Pierre Durand demande des relevés de compte bancaire supplémentaires (6 derniers mois) pour le dossier DOS-2024-0155 (Isabelle Renaud).", dossierRef: "DOS-2024-0155", dossierId: "d5", userEmail: "s.martin@solvy-banque.fr", lue: true, date: "2024-01-18 09:30" },
    { id: "n7", type: "decision", titre: "Décision : Accord — DOS-2024-0143", message: "Accord de crédit émis par Pierre Durand pour Émilie Laurent. Score 831/1000 — toutes conditions réunies.", dossierRef: "DOS-2024-0143", dossierId: "d2", userEmail: "m.lefebvre@solvy-banque.fr", lue: true, date: "2024-01-13 14:00" },
    { id: "n8", type: "decision", titre: "Décision : Refus — DOS-2024-0138", message: "Refus de crédit émis par Pierre Durand pour Jean-Claude Petit. Score 312/1000, FICP inscrit, taux d'endettement 61.2%.", dossierRef: "DOS-2024-0138", dossierId: "d4", userEmail: "m.lefebvre@solvy-banque.fr", lue: true, date: "2024-01-08 14:30" },
  ]).onConflictDoNothing();

  await db.insert(auditLogsTable).values([
    { id: "a1", date: "2024-01-18", heure: "11:15", utilisateur: "Pierre Durand", role: "Analyste risque", dossierRef: "DOS-2024-0147", action: "Décision émise: Accord sous conditions", statut: "success", details: "Taux endettement > 35% — conditions: apport supplémentaire requis" },
    { id: "a2", date: "2024-01-18", heure: "09:30", utilisateur: "Pierre Durand", role: "Analyste risque", dossierRef: "DOS-2024-0147", action: "Analyse du dossier", statut: "info", details: "Ouverture dossier DOS-2024-0147 en session d'analyse" },
    { id: "a3", date: "2024-01-18", heure: "09:12", utilisateur: "Sophie Martin", role: "Conseiller bancaire", dossierRef: "DOS-2024-0151", action: "Création dossier client", statut: "info", details: "Nouveau dossier créé: Thomas Moreau" },
    { id: "a4", date: "2024-01-17", heure: "10:05", utilisateur: "Système SOLVY", role: "Automatique", dossierRef: "DOS-2024-0147", action: "Calcul score solvabilité v2.3.1", statut: "success", details: "Score calculé: 742/1000 – Risque modéré faible" },
    { id: "a5", date: "2024-01-17", heure: "09:00", utilisateur: "Système SOLVY", role: "Automatique", dossierRef: "DOS-2024-0155", action: "Alerte PPE détectée", statut: "warning", details: "Profil PPE (Personne Politiquement Exposée) — vérification LCB-FT renforcée requise" },
    { id: "a6", date: "2024-01-16", heure: "14:20", utilisateur: "Système SOLVY", role: "Automatique", dossierRef: "DOS-2024-0147", action: "Contrôle LCB-FT automatique", statut: "success", details: "Contrôle anti-blanchiment: CONFORME – Aucune correspondance liste noire" },
    { id: "a7", date: "2024-01-16", heure: "14:20", utilisateur: "Système SOLVY", role: "Automatique", dossierRef: "DOS-2024-0147", action: "Vérification FICP/FCC", statut: "success", details: "Client non inscrit FICP, non inscrit FCC" },
    { id: "a8", date: "2024-01-16", heure: "11:00", utilisateur: "Sophie Martin", role: "Conseiller bancaire", dossierRef: "DOS-2024-0155", action: "Création dossier client", statut: "info", details: "Nouveau dossier créé: Isabelle Renaud" },
    { id: "a9", date: "2024-01-15", heure: "09:45", utilisateur: "Sophie Martin", role: "Conseiller bancaire", dossierRef: "DOS-2024-0147", action: "Ajout documents justificatifs", statut: "success", details: "PI, justificatif domicile, 3 bulletins paie, IBAN" },
    { id: "a10", date: "2024-01-15", heure: "09:12", utilisateur: "Sophie Martin", role: "Conseiller bancaire", dossierRef: "DOS-2024-0147", action: "Création dossier client", statut: "info", details: "Nouveau dossier créé: Martin Dupont" },
    { id: "a11", date: "2024-01-13", heure: "14:00", utilisateur: "Pierre Durand", role: "Analyste risque", dossierRef: "DOS-2024-0143", action: "Décision émise: Accord", statut: "success", details: "Score 831/1000 – Toutes conditions réunies" },
    { id: "a12", date: "2024-01-08", heure: "14:30", utilisateur: "Pierre Durand", role: "Analyste risque", dossierRef: "DOS-2024-0138", action: "Décision émise: Refus", statut: "error", details: "Score 312/1000, FICP inscrit, taux endettement 61.2%" },
  ]).onConflictDoNothing();

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
