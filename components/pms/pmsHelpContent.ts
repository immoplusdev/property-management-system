import type { NavId } from "./PMSSidebar";
import type { SettingsSection } from "@/lib/pms/settingsNav";

export interface HelpSlide {
  icon: string;
  title: string;
  description: string;
  color: string;
}

const primary = "var(--color-primary)";
const teal = "var(--color-teal)";
const amber = "var(--color-amber)";
const violet = "var(--color-violet)";
const success = "var(--color-success)";

export const PMS_HELP: Record<NavId, HelpSlide[]> = {
  dashboard: [
    { icon: "home", title: "Tableau de bord", description: "Retrouvez les chiffres clés de l'hôtel et les opérations à suivre aujourd'hui.", color: primary },
    { icon: "calendar", title: "Arrivées et départs", description: "Consultez les mouvements prévus et accédez rapidement au check-in ou au check-out.", color: teal },
    { icon: "download", title: "Rapport du jour", description: "Demandez un export XLSX de l'activité quotidienne de l'hôtel.", color: violet },
  ],
  rooms: [
    { icon: "bed", title: "Chambres", description: "Visualisez les chambres et leur état : libre, occupée, en ménage ou indisponible.", color: primary },
    { icon: "grid", title: "Grille et liste", description: "Passez d'une vue à l'autre et filtrez les chambres par statut.", color: teal },
    { icon: "eye", title: "Détail d'une chambre", description: "Ouvrez une chambre pour consulter ses informations et sa réservation en cours.", color: violet },
  ],
  reservations: [
    { icon: "calendar", title: "Réservations", description: "Consultez les réservations, leur statut, leurs dates et les informations de paiement.", color: primary },
    { icon: "search", title: "Recherche et filtres", description: "Retrouvez une réservation par nom ou référence et filtrez-la par statut ou paiement.", color: teal },
    { icon: "download", title: "Export CSV", description: "Téléchargez les données de réservation pour les exploiter hors du PMS.", color: violet },
  ],
  checkin: [
    { icon: "fileText", title: "Check-in", description: "Choisissez une réservation confirmée pour démarrer l'arrivée du client.", color: primary },
    { icon: "shield", title: "Identité et paiement", description: "Vérifiez les documents du client, puis contrôlez ou encaissez le solde avant de finaliser l'arrivée.", color: teal },
    { icon: "plus", title: "Walk-in", description: "Créez un séjour pour un client qui arrive sans réservation préalable.", color: amber },
  ],
  checkout: [
    { icon: "arrowRight", title: "Check-out", description: "Retrouvez les séjours en cours et confirmez le départ du client.", color: primary },
    { icon: "check", title: "Vérifications", description: "Contrôlez la chambre, les clés et les objets oubliés avant de terminer le départ.", color: teal },
    { icon: "fileText", title: "Facture", description: "Consultez ou envoyez la facture du séjour lorsque le serveur l'a préparée.", color: violet },
  ],
  requests: [
    { icon: "bell", title: "Demandes clients", description: "Suivez les demandes reçues et leur état de traitement.", color: primary },
    { icon: "plus", title: "Demande manuelle", description: "Enregistrez une demande liée à une réservation depuis la réception.", color: teal },
    { icon: "download", title: "Export CSV", description: "Exportez les demandes pour un suivi externe.", color: violet },
  ],
  planning: [
    { icon: "grid", title: "Planning", description: "Voyez l'occupation des chambres sur une semaine et repérez les réservations par date.", color: primary },
    { icon: "calendar", title: "Navigation par semaine", description: "Avancez ou reculez dans le calendrier pour préparer les arrivées et départs.", color: teal },
  ],
  finances: [
    { icon: "moneyBill", title: "Finances", description: "Consultez les revenus, remboursements et transactions enregistrés par l'hôtel.", color: primary },
    { icon: "creditCard", title: "Modes de paiement", description: "Comparez les montants encaissés selon les moyens de paiement.", color: teal },
    { icon: "download", title: "Export XLSX", description: "Téléchargez les données financières pour votre suivi comptable.", color: violet },
  ],
  clients: [
    { icon: "users", title: "Clients", description: "Consultez les fiches clients, leurs coordonnées et leurs préférences.", color: primary },
    { icon: "calendar", title: "Réservations du client", description: "Ouvrez une fiche pour distinguer les réservations associées des séjours effectués.", color: teal },
    { icon: "search", title: "Recherche et doublons", description: "Recherchez un client et examinez les fiches signalées comme doublons.", color: violet },
  ],
  reviews: [
    { icon: "star", title: "Avis clients", description: "Consultez les notes et commentaires reçus via l'application Immo Plus.", color: amber },
    { icon: "send", title: "Répondre aux avis", description: "Rédigez une réponse aux avis qui n'en ont pas encore reçu.", color: primary },
    { icon: "download", title: "Export CSV", description: "Exportez les avis pour analyser les retours des clients.", color: violet },
  ],
  staff: [
    { icon: "users", title: "Personnel", description: "Retrouvez les membres de l'équipe et leurs rôles dans l'hôtel.", color: primary },
    { icon: "plus", title: "Invitations", description: "Invitez un collaborateur avec le rôle adapté à ses tâches.", color: teal },
    { icon: "shield", title: "Accès", description: "Consultez les invitations en attente et révoquez un accès si nécessaire.", color: violet },
  ],
  settings: [
    { icon: "settings", title: "Paramètres", description: "Configurez l'identité de l'hôtel, ses chambres, tarifs et préférences.", color: primary },
    { icon: "creditCard", title: "Paiements et facturation", description: "Gérez les moyens de paiement et consultez les informations de facturation Immo Plus.", color: teal },
    { icon: "users", title: "Équipe et canaux", description: "Accédez aux réglages de l'équipe et aux canaux de diffusion.", color: violet },
  ],
};

export const SETTINGS_HELP: Record<SettingsSection, HelpSlide[]> = {
  hotel: [
    { icon: "bed", title: "Hôtel & identité", description: "Mettez à jour le nom et les coordonnées de votre établissement.", color: primary },
    { icon: "clock", title: "Horaires d'accueil", description: "Définissez les heures habituelles d'arrivée et de départ.", color: teal },
  ],
  rooms: [
    { icon: "list", title: "Types de chambre", description: "Créez et gérez les catégories de chambres proposées par l'hôtel.", color: primary },
  ],
  rates: [
    { icon: "moneyBill", title: "Tarifs", description: "Consultez et ajustez les prix associés aux types de chambre.", color: success },
  ],
  imports: [
    { icon: "download", title: "Import de données", description: "Importez les chambres, clients, réservations ou soldes d'ouverture selon les formats prévus.", color: violet },
  ],
  channels: [
    { icon: "share", title: "Canaux de diffusion", description: "Consultez les intégrations et leur état de connexion avec les canaux externes.", color: teal },
  ],
  payments: [
    { icon: "creditCard", title: "Paiements", description: "Choisissez les moyens de paiement acceptés par l'hôtel.", color: primary },
  ],
  team: [
    { icon: "users", title: "Équipe & accès", description: "Ouvrez la gestion du personnel pour inviter des membres et gérer leurs accès.", color: teal },
  ],
  app: [
    { icon: "sparkles", title: "App Immo Plus", description: "Cette rubrique présente les fonctions côté client. Leur configuration n'est pas encore disponible dans le PMS.", color: violet },
  ],
  notifs: [
    { icon: "bell", title: "Notifications", description: "Définissez le numéro WhatsApp Business et les préférences d'envoi par SMS ou email.", color: amber },
  ],
  billing: [
    { icon: "fileText", title: "Facturation Immo Plus", description: "Consultez l'utilisation du PMS, les commissions et les factures de votre hôtel.", color: primary },
  ],
};
