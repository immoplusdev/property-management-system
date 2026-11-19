# Audit PMS — données simulées, données brutes et contrats API

## Portée et niveau de preuve

Cet audit porte sur le frontend présent dans ce dépôt (`components/pms`, `lib/api/pms`, `lib/hooks/pms`). Il vérifie les appels déclarés par le code, les composants encore alimentés par des constantes, et les actions qui montraient un faux succès.

- **Raccordé dans le frontend** signifie qu'une Server Action appelle la route et que le composant consomme son résultat. Cela ne prouve pas que l'API distante est déployée, accessible ou que son schéma réel correspond au type TypeScript.
- **Contrat à confirmer** signifie que le chemin/payload est supposé ou 

## Résumé des contrôles

| Écran / fonctionnalité | Constat dans le code | Route utilisée | État |
|---|---|---|---|
| Tableau de bord | KPIs, mouvements, activité et répartition des paiements chargés par hooks API | `GET /pms/dashboard/*` | Raccordé; valeurs de synthèse attendues de l'API |
| Réservations | Liste normalisée; validation stricte des champs métier et pagination | `GET /pms/reservations` | Raccordé; erreur affichée si contrat incomplet |
| Chambres / planning | Listes et changements de statut via hooks | `GET/PATCH /pms/rooms`, `GET /pms/planning` | Raccordé; libellés visuels gardés côté UI |
| Types de chambre | Plus de tarifs/statistiques issus de `mock-pms`; édition du prix via mutation | `GET/PATCH /pms/room-types` | Raccordé dans l'UI; existence distante à confirmer |
| Folio / extras | Lignes affichées depuis le folio; extra créé après saisie explicite | `GET /pms/reservations/{id}/folio`, `POST .../folio-items` | Raccordé; schéma backend à confirmer |
| Paiements | Paiement enregistré côté serveur; solde lu depuis le folio/réponse API | `POST /pms/reservations/{id}/payment` | Raccordé; aucune confirmation locale en remplacement |
| Check-in | Démarrage, justificatifs d'identité, validation et finalisation séparés | `POST/PATCH /pms/checkin/{id}/*` | Raccordé; test réel requis avec backend et stockage fichiers |
| Check-out | Facture lue; solde et contrôles présentés; finalisation via API | `GET/POST /pms/checkout/{id}` | Raccordé |
| Email facture | Envoi manuel sans champ destinataire arbitraire | `POST /pms/checkout/{id}/invoice/email` | Raccordé; succès seulement si la réponse indique `sent` |
| WhatsApp demandes | Action déclenchée sur le backend; toast basé sur la réponse | `POST /pms/requests/{id}/notify-whatsapp` | Raccordé; disponibilité backend à confirmer |
| Exports | Démarrage de job, polling du statut, téléchargement quand `ready` | `POST /pms/exports`, `GET /pms/exports/{id}` | Raccordé selon contrat; à confirmer avec backend |
| Paramètres | Identité et moyens de paiement lus/sauvegardés; commissions fixes retirées | `GET/PATCH /pms/settings/hotel` | Raccordé; certains contrôles volontairement masqués |
| SMS, OTA, fonctionnalités app | Aucun contrôle ne prétend réaliser une action non fournie par l'API | — | Retiré / indiqué indisponible |
| Mock métier | `mock-pms.ts` reste dans le dépôt, mais aucun import actif depuis `components`/`lib` (hors son propre fichier) | — | Conservé comme référence, pas comme fallback UI |

## Endpoints et payloads utilisés

### Réservations

```http
GET /pms/reservations?page=1&limit=100&status=pending&fromDate=2026-11-01&toDate=2026-11-30&search=Jean
```

Réponse attendue par le normaliseur :

```json
{
  "data": [{
    "id": "res-123",
    "reference": "RES-20261118-001",
    "guest": { "id": "guest-1", "firstName": "Jean", "lastName": "Kouassi" },
    "room": { "number": "12", "typeName": "Standard" },
    "checkInDate": "2026-11-18",
    "checkOutDate": "2026-11-20",
    "nights": 2,
    "status": "confirmed",
    "totalAmount": 50000,
    "paidAmount": 25000,
    "balance": 25000,
    "paymentMethod": "wave",
    "source": "app"
  }],
  "total": 1,
  "page": 1,
  "limit": 100
}
```

Création : `POST /pms/reservations` — payload utilisé par `CreateReservationPayload` :

```json
{
  "guestId": "guest-1",
  "roomId": "room-12",
  "checkInDate": "2026-11-18",
  "checkOutDate": "2026-11-20",
  "adults": 2,
  "children": 0,
  "source": "pro_app",
  "breakfastIncluded": false,
  "specialRequests": "Arrivée tardive"
}
```

Le payload de création de réservation dans l'API actuelle n'est pas une preuve que l'écran offre déjà la création complète. Le bouton « Nouvelle réservation » a été retiré là où il ouvrait en réalité un check-in.

### Types de chambres

```http
GET /pms/room-types
PATCH /pms/room-types/{roomTypeId}
```

```json
{
  "code": "STD",
  "name": "Standard",
  "basePrice": 25000,
  "amenities": ["wifi", "air_conditioning"],
  "active": true
}
```

`GET` doit retourner une liste d'objets avec `id`, `code`, `name`, `basePrice`, `roomCount` et `amenities`. `POST /pms/room-types` existe dans la couche frontend, mais aucun formulaire de création n'est exposé actuellement.

### Folio et paiements

```http
GET /pms/reservations/{reservationId}/folio
```

```json
{
  "reservationId": "res-123",
  "currency": "XOF",
  "items": [{
    "id": "folio-1",
    "type": "extra",
    "category": "minibar",
    "label": "Eaux minérales",
    "quantity": 2,
    "unitPriceHt": 1500,
    "taxAmount": 540,
    "amountTtc": 3540,
    "occurredAt": "2026-11-18T09:30:00.000Z"
  }],
  "folio": { "totalHt": 3000, "taxTotal": 540, "totalTtc": 3540 },
  "payments": { "confirmedTotal": 0, "refundedTotal": 0 },
  "balanceDue": 3540
}
```

Ajouter explicitement un extra : `POST /pms/reservations/{reservationId}/folio-items`.

```json
{
  "type": "extra",
  "category": "minibar",
  "label": "Eaux minérales",
  "quantity": 2,
  "unitPriceHt": 1500,
  "tvaRate": 18,
  "occurredAt": "2026-11-18T09:30:00.000Z"
}
```

Paiement : `POST /pms/reservations/{reservationId}/payment`.

```json
{
  "amount": 25000,
  "paymentMethod": "wave",
  "reference": "WV-20261118-001",
  "description": "Acompte"
}
```

Le montant, les taxes, le total et le solde restent calculés par le serveur. Le frontend ne conclut pas un check-in à partir du seul paiement.

### Check-in et check-out

Séquence check-in :

```http
POST /pms/checkin/{reservationId}/start
PATCH /pms/checkin/{reservationId}/identity
POST /pms/checkin/{reservationId}/complete
```

Les deux POST envoient `{}`. Pour `PATCH identity`, les fichiers doivent d'abord être téléversés et leurs identifiants référencés :

```json
{
  "idCardFrontId": "file-front-1",
  "idCardBackId": "file-back-1",
  "signatureFileId": "signature-1",
  "identityVerified": true
}
```

Check-out :

```http
GET /pms/checkout/{reservationId}/invoice
POST /pms/checkout/{reservationId}
```

```json
{
  "verifications": {
    "roomInspected": true,
    "keyReturned": true,
    "valuablesChecked": true
  },
  "notes": "Départ effectué"
}
```

Email facture : `POST /pms/checkout/{reservationId}/invoice/email` avec `{}`. Réponse attendue :

```json
{ "reservationId": "res-123", "status": "sent" }
```

PDF : `GET /pms/checkout/{reservationId}/invoice/pdf`, statut `pending | ready | failed` puis `downloadUrl` si prêt.

### Demandes, clients, avis, finances, chambres et planning

| Domaine | Lecture | Mutation / payload |
|---|---|---|
| Clients | `GET /pms/guests?page=1&limit=100` et `GET /pms/guests/{id}` | `PATCH /pms/guests/{id}` avec les champs modifiés du client |
| Demandes | `GET /pms/requests?status=pending&page=1&limit=100` | `POST /pms/requests` avec `{ "reservationId":"res-123", "guestId":"guest-1", "type":"housekeeping", "title":"Serviettes", "description":"Deux serviettes" }`; `PATCH /pms/requests/{id}/status` avec `{ "status":"in_progress", "assignedTo":"staff-1", "notes":"Pris en charge" }` |
| WhatsApp demande | — | `POST /pms/requests/{id}/notify-whatsapp` avec `{}` |
| Avis | `GET /pms/reviews?page=1&limit=100&needsReply=true` | `POST /pms/reviews/{id}/response` avec `{ "body":"Merci pour votre retour." }`; suggestion IA : `POST /pms/reviews/{id}/response/suggest` avec `{}` |
| Finances | `GET /pms/finances/summary?period=month&date=2026-11-18`; `GET /pms/finances/transactions?page=1&limit=100` | Export financier historique exposé par `POST /pms/finances/export`; UI utilise le job commun décrit ci-dessous |
| Chambres | `GET /pms/rooms?status=available&floor=1&roomTypeId=rt-1`; `GET /pms/rooms/{id}` | `PATCH /pms/rooms/{id}/status` avec `{ "status":"available" }`; blocage `POST /pms/rooms/{id}/block` avec `{ "fromDate":"2026-11-20", "toDate":"2026-11-22", "reason":"maintenance", "notes":"Peinture" }` |
| Ménage | `GET /pms/rooms/housekeeping?status=todo&date=2026-11-18` | `PATCH /pms/rooms/housekeeping/{taskId}` avec `{ "status":"done", "notes":"Effectué" }` |
| Planning | `GET /pms/planning?from=2026-11-16&to=2026-11-22` | Aucun changement de réservation depuis le clic planning n'est exposé dans cette interface; l'ancien toast a été retiré |

Finances exige des transactions réelles complètes : identifiant, date, type, description, montant numérique, moyen de paiement, statut et pagination. Une ligne incomplète fait remonter une erreur de contrat; elle n'est pas transformée en montant `0`, statut `ok` ou identifiant généré.

### Paramètres et exports

```http
GET /pms/settings/hotel
PATCH /pms/settings/hotel
```

```json
{
  "paymentMethods": ["wave", "orange_money", "cash"],
  "depositPercent": 50
}
```

Les commissions par prestataire, les préférences app et les canaux OTA ne sont pas configurés par les contrôles PMS actuels. La page Notifications masque ses interrupteurs : le code expose un PATCH, mais pas de lecture vérifiée.

Export générique utilisé par les listes :

```http
POST /pms/exports
```

```json
{
  "dataset": "requests",
  "format": "csv",
  "dateRange": { "fromDate": "2026-11-01", "toDate": "2026-11-30" }
}
```

Jeux déclarés par le frontend : `reservations`, `guests`, `finances`, `requests`, `reviews`; formats : `csv`, `xlsx`. Poller `GET /pms/exports/{exportId}` jusqu'à `ready` ou `failed`. N'ouvrir que `downloadUrl` non vide.

Export du tableau de bord : `POST /pms/dashboard/export`, puis polling via `GET /pms/exports/{exportId}`. Le frontend demande un XLSX du jour; il ne présente plus de PDF fictif.

## Données/actions qui restent volontairement hors API

- `lib/data/mock-pms.ts` subsiste comme ancien jeu de démonstration/référence; il ne doit pas être réimporté dans les composants de production.
- Les labels, couleurs, traductions des statuts et icônes sont des métadonnées de présentation, pas des valeurs métier.
- Les alertes de navigation/action sans endpoint ont été supprimées ou remplacées par un état indisponible.
- Aucun SMS de rappel n'est envoyé par cette interface.
- Le téléversement de pièces d'identité dépend encore de `/bff/files`; l'API de stockage doit être accessible et retourner un `fileId`. Une erreur (dont 401) doit interrompre la séquence et être affichée.

## Vérification à effectuer côté backend

Confirmer les schémas et la disponibilité de `GET /pms/room-types`, folio, exports génériques, WhatsApp et email facture sur l'environnement utilisé. La présence d'une Server Action dans le frontend ne garantit pas le déploiement correspondant. Les exemples ci-dessus ne remplacent pas un OpenAPI ou des réponses réelles capturées.
