import type {
  Room, RoomType, Booking, Client, Transaction,
  AppProfile, AppRequest, RequestType, Review, ReviewStats,
  PlanningBooking, StatusConfig, RoomStatus,
} from "@/lib/types/pms";

export const TODAY = "2026-05-18";

export const ROOM_TYPES_PMS: RoomType[] = [
  { code: "STD", name: "Chambre Standard",      price: 38000,  color: "#7B8DFF" },
  { code: "SUP", name: "Supérieure Vue Lagune", price: 55000,  color: "#FF8E73" },
  { code: "JR",  name: "Suite Junior",          price: 95000,  color: "#6FB5A8" },
  { code: "PRE", name: "Suite Présidentielle",  price: 220000, color: "#B57BE6" },
];

export const ROOMS_PMS: Room[] = [
  { num: "101", type: "STD", floor: 1, status: "occupee", guest: "Kouamé Yao",       checkout: "2026-05-21" },
  { num: "102", type: "STD", floor: 1, status: "libre" },
  { num: "103", type: "STD", floor: 1, status: "depart",  guest: "Awa Touré",        checkout: "2026-05-18" },
  { num: "104", type: "STD", floor: 1, status: "menage" },
  { num: "105", type: "STD", floor: 1, status: "occupee", guest: "Famille Bamba",    checkout: "2026-05-22" },
  { num: "106", type: "STD", floor: 1, status: "reservee",guest: "Marc Dupont",      checkin:  "2026-05-18" },
  { num: "107", type: "STD", floor: 1, status: "libre" },
  { num: "108", type: "STD", floor: 1, status: "occupee", guest: "Aminata Cissé",    checkout: "2026-05-19" },
  { num: "109", type: "STD", floor: 1, status: "hs" },
  { num: "110", type: "STD", floor: 1, status: "occupee", guest: "Jean Koffi",       checkout: "2026-05-20" },
  { num: "201", type: "STD", floor: 2, status: "occupee", guest: "Sarah Martin",     checkout: "2026-05-23" },
  { num: "202", type: "STD", floor: 2, status: "depart",  guest: "Ibrahim Diallo",   checkout: "2026-05-18" },
  { num: "203", type: "STD", floor: 2, status: "libre" },
  { num: "204", type: "STD", floor: 2, status: "reservee",guest: "Élise N'Guessan", checkin:  "2026-05-18" },
  { num: "205", type: "SUP", floor: 2, status: "occupee", guest: "Cheikh Diop",      checkout: "2026-05-21" },
  { num: "206", type: "SUP", floor: 2, status: "occupee", guest: "Anna Schmidt",     checkout: "2026-05-22" },
  { num: "207", type: "SUP", floor: 2, status: "menage" },
  { num: "208", type: "SUP", floor: 2, status: "libre" },
  { num: "209", type: "SUP", floor: 2, status: "occupee", guest: "Lila Konaté",      checkout: "2026-05-19" },
  { num: "210", type: "SUP", floor: 2, status: "reservee",guest: "Pierre Lambert",   checkin:  "2026-05-18" },
  { num: "301", type: "SUP", floor: 3, status: "occupee", guest: "Moussa Traoré",    checkout: "2026-05-25" },
  { num: "302", type: "SUP", floor: 3, status: "occupee", guest: "Fatou Sow",        checkout: "2026-05-20" },
  { num: "303", type: "SUP", floor: 3, status: "depart",  guest: "Joseph Brou",      checkout: "2026-05-18" },
  { num: "304", type: "SUP", floor: 3, status: "libre" },
  { num: "305", type: "SUP", floor: 3, status: "occupee", guest: "Khadija Lo",       checkout: "2026-05-23" },
  { num: "306", type: "JR",  floor: 3, status: "occupee", guest: "M. & Mme Adjé",   checkout: "2026-05-21" },
  { num: "307", type: "JR",  floor: 3, status: "menage" },
  { num: "308", type: "JR",  floor: 3, status: "reservee",guest: "Daniel Kouassi",   checkin:  "2026-05-18" },
  { num: "401", type: "JR",  floor: 4, status: "occupee", guest: "Léa Dembélé",      checkout: "2026-05-24" },
  { num: "402", type: "JR",  floor: 4, status: "occupee", guest: "Group BCEAO",      checkout: "2026-05-19" },
  { num: "403", type: "JR",  floor: 4, status: "libre" },
  { num: "404", type: "JR",  floor: 4, status: "occupee", guest: "Yvon Méité",       checkout: "2026-05-22" },
  { num: "405", type: "JR",  floor: 4, status: "occupee", guest: "Sandra Coulibaly", checkout: "2026-05-20" },
  { num: "501", type: "PRE", floor: 5, status: "occupee", guest: "Ambassadeur Niang",checkout: "2026-05-25" },
  { num: "502", type: "PRE", floor: 5, status: "reservee",guest: "M. Sangaré",       checkin:  "2026-05-19" },
];

export const BOOKINGS: Booking[] = [
  { id:"RES-2026-0518-001",ref:"RES-2026-0518-001",guest:"Marc Dupont",guestId:"c-mdupont",room:"106",roomType:"STD",checkin:"2026-05-18",checkout:"2026-05-21",nights:3,status:"confirmed",amount:114000,paid:57000,payment:"wave",source:"Direct"},
  { id:"RES-2026-0518-002",ref:"RES-2026-0518-002",guest:"Élise N'Guessan",guestId:"c-eng",room:"204",roomType:"STD",checkin:"2026-05-18",checkout:"2026-05-19",nights:1,status:"confirmed",amount:38000,paid:38000,payment:"om",source:"App"},
  { id:"RES-2026-0518-003",ref:"RES-2026-0518-003",guest:"Pierre Lambert",guestId:"c-plambert",room:"210",roomType:"SUP",checkin:"2026-05-18",checkout:"2026-05-20",nights:2,status:"confirmed",amount:110000,paid:33000,payment:"card",source:"Direct"},
  { id:"RES-2026-0518-004",ref:"RES-2026-0518-004",guest:"Daniel Kouassi",guestId:"c-dkouassi",room:"308",roomType:"JR",checkin:"2026-05-18",checkout:"2026-05-22",nights:4,status:"checked-in",amount:380000,paid:380000,payment:"wave",source:"App"},
  { id:"RES-2026-0517-009",ref:"RES-2026-0517-009",guest:"Kouamé Yao",guestId:"c-kyao",room:"101",roomType:"STD",checkin:"2026-05-17",checkout:"2026-05-21",nights:4,status:"checked-in",amount:152000,paid:152000,payment:"om",source:"App"},
  { id:"RES-2026-0515-021",ref:"RES-2026-0515-021",guest:"Sandra Coulibaly",guestId:"c-scoulibaly",room:"405",roomType:"JR",checkin:"2026-05-15",checkout:"2026-05-20",nights:5,status:"checked-in",amount:475000,paid:475000,payment:"mtn",source:"Direct"},
  { id:"RES-2026-0519-011",ref:"RES-2026-0519-011",guest:"M. Sangaré",guestId:"c-sangare",room:"502",roomType:"PRE",checkin:"2026-05-19",checkout:"2026-05-23",nights:4,status:"pending",amount:880000,paid:0,payment:"—",source:"Direct"},
  { id:"RES-2026-0520-005",ref:"RES-2026-0520-005",guest:"Léa Dembélé",guestId:"c-ldembele",room:"401",roomType:"JR",checkin:"2026-05-14",checkout:"2026-05-24",nights:10,status:"checked-in",amount:950000,paid:950000,payment:"card",source:"Corp"},
  { id:"RES-2026-0518-007",ref:"RES-2026-0518-007",guest:"Awa Touré",guestId:"c-atoure",room:"103",roomType:"STD",checkin:"2026-05-15",checkout:"2026-05-18",nights:3,status:"checking-out",amount:114000,paid:114000,payment:"wave",source:"App"},
  { id:"RES-2026-0518-008",ref:"RES-2026-0518-008",guest:"Ibrahim Diallo",guestId:"c-idiallo",room:"202",roomType:"STD",checkin:"2026-05-16",checkout:"2026-05-18",nights:2,status:"checking-out",amount:76000,paid:76000,payment:"om",source:"App"},
  { id:"RES-2026-0518-009",ref:"RES-2026-0518-009",guest:"Joseph Brou",guestId:"c-jbrou",room:"303",roomType:"SUP",checkin:"2026-05-13",checkout:"2026-05-18",nights:5,status:"checking-out",amount:275000,paid:275000,payment:"card",source:"Direct"},
  { id:"RES-2026-0521-014",ref:"RES-2026-0521-014",guest:"Mariam Bakayoko",guestId:"c-mbakayoko",room:"—",roomType:"SUP",checkin:"2026-05-21",checkout:"2026-05-24",nights:3,status:"confirmed",amount:165000,paid:49500,payment:"wave",source:"App"},
  { id:"RES-2026-0522-003",ref:"RES-2026-0522-003",guest:"Akwaba Group",guestId:"c-akwaba",room:"—",roomType:"JR",checkin:"2026-05-22",checkout:"2026-05-25",nights:3,status:"confirmed",amount:285000,paid:285000,payment:"card",source:"Corp"},
  { id:"RES-2026-0516-002",ref:"RES-2026-0516-002",guest:"Anna Schmidt",guestId:"c-aschmidt",room:"206",roomType:"SUP",checkin:"2026-05-16",checkout:"2026-05-22",nights:6,status:"checked-in",amount:330000,paid:330000,payment:"card",source:"App"},
];

export const CLIENTS: Client[] = [
  { id:"c-kyao",name:"Kouamé Yao",phone:"+225 07 11 23 45 67",email:"kouame.yao@orange.ci",country:"CI",idType:"CNI",idNumber:"CI001234567",stays:8,totalSpent:920000,vip:true,corporate:null,lastStay:"2026-05-17",avatar:1,notes:"Préfère étage élevé, ne pas déranger après 22h." },
  { id:"c-mdupont",name:"Marc Dupont",phone:"+33 6 12 34 56 78",email:"m.dupont@safran.fr",country:"FR",idType:"Passeport",idNumber:"20FB39281",stays:3,totalSpent:342000,vip:false,corporate:"Safran CI",lastStay:"2026-05-18",avatar:3 },
  { id:"c-eng",name:"Élise N'Guessan",phone:"+225 05 88 33 21 09",email:"elise@nguessan-avocats.ci",country:"CI",idType:"CNI",idNumber:"CI009876543",stays:2,totalSpent:76000,vip:false,corporate:null,lastStay:"2026-05-18",avatar:4 },
  { id:"c-plambert",name:"Pierre Lambert",phone:"+33 7 89 23 45 12",email:"p.lambert@accenture.com",country:"FR",idType:"Passeport",idNumber:"21AC78423",stays:5,totalSpent:412000,vip:false,corporate:"Accenture",lastStay:"2026-05-18",avatar:8 },
  { id:"c-dkouassi",name:"Daniel Kouassi",phone:"+225 07 45 89 12 34",email:"dkouassi@gmail.com",country:"CI",idType:"CNI",idNumber:"CI003456789",stays:12,totalSpent:1450000,vip:true,corporate:null,lastStay:"2026-05-18",avatar:6 },
  { id:"c-scoulibaly",name:"Sandra Coulibaly",phone:"+225 05 23 67 89 01",email:"scoulibaly@bceao.int",country:"CI",idType:"CNI",idNumber:"CI004567890",stays:6,totalSpent:1280000,vip:true,corporate:"BCEAO",lastStay:"2026-05-15",avatar:2 },
  { id:"c-sangare",name:"M. Sangaré",phone:"+225 07 99 11 22 33",email:"sangare@ministere-ci.gouv.ci",country:"CI",idType:"CNI",idNumber:"CI005678901",stays:1,totalSpent:0,vip:true,corporate:"Cabinet ministériel",avatar:5 },
  { id:"c-ldembele",name:"Léa Dembélé",phone:"+225 05 67 89 12 34",email:"lea.dembele@hotmail.com",country:"CI",idType:"CNI",idNumber:"CI006789012",stays:4,totalSpent:1820000,vip:true,corporate:null,lastStay:"2026-05-14",avatar:7 },
  { id:"c-atoure",name:"Awa Touré",phone:"+221 78 123 45 67",email:"atoure@gmail.com",country:"SN",idType:"Passeport",idNumber:"SN89234123",stays:2,totalSpent:188000,vip:false,corporate:null,lastStay:"2026-05-15",avatar:4 },
  { id:"c-idiallo",name:"Ibrahim Diallo",phone:"+224 622 34 56 78",email:"idiallo@orange.gn",country:"GN",idType:"Passeport",idNumber:"GN78234567",stays:1,totalSpent:76000,vip:false,corporate:null,lastStay:"2026-05-16",avatar:6 },
  { id:"c-jbrou",name:"Joseph Brou",phone:"+225 07 23 45 67 89",email:"jbrou@cocoa-trade.ci",country:"CI",idType:"CNI",idNumber:"CI008901234",stays:9,totalSpent:1340000,vip:true,corporate:"Cocoa Trade SA",lastStay:"2026-05-13",avatar:3 },
  { id:"c-aschmidt",name:"Anna Schmidt",phone:"+49 151 234 567 89",email:"a.schmidt@bmz.de",country:"DE",idType:"Passeport",idNumber:"DE65432198",stays:2,totalSpent:660000,vip:false,corporate:"BMZ",lastStay:"2026-05-16",avatar:1 },
];

export const TRANSACTIONS: Transaction[] = [
  { id:"T-1842",time:"2026-05-18 14:32",type:"Encaissement",desc:"RES-2026-0518-002 · Solde Élise N'Guessan",amount:38000,method:"om",status:"ok" },
  { id:"T-1841",time:"2026-05-18 13:18",type:"Encaissement",desc:"RES-2026-0518-004 · Acompte Daniel Kouassi",amount:380000,method:"wave",status:"ok" },
  { id:"T-1840",time:"2026-05-18 11:45",type:"Encaissement",desc:"RES-2026-0518-001 · Acompte M. Dupont (50%)",amount:57000,method:"wave",status:"ok" },
  { id:"T-1839",time:"2026-05-18 10:22",type:"Encaissement",desc:"Mini-bar 308 · D. Kouassi",amount:12500,method:"cash",status:"ok" },
  { id:"T-1838",time:"2026-05-18 09:14",type:"Encaissement",desc:"Restaurant Le Baobab · Table 4 (J. Brou)",amount:22500,method:"card",status:"ok" },
  { id:"T-1837",time:"2026-05-17 22:08",type:"Remboursement",desc:"RES-2026-0510-018 · Annulation Y. Diomandé",amount:-65000,method:"wave",status:"refunded" },
  { id:"T-1836",time:"2026-05-17 19:33",type:"Encaissement",desc:"Spa 60min · Mme Sow (302)",amount:25000,method:"om",status:"ok" },
  { id:"T-1835",time:"2026-05-17 17:50",type:"Encaissement",desc:"Transfert aéroport · A. Schmidt",amount:15000,method:"cash",status:"ok" },
  { id:"T-1834",time:"2026-05-17 16:22",type:"Encaissement",desc:"RES-2026-0517-009 · K. Yao (intégral)",amount:152000,method:"om",status:"ok" },
  { id:"T-1833",time:"2026-05-17 12:11",type:"Encaissement",desc:"RES-2026-0516-002 · A. Schmidt",amount:330000,method:"card",status:"ok" },
];

export const APP_PROFILES: Record<string, AppProfile> = {
  "RES-2026-0518-002": { complete:100,cniScanned:true,cniVerified:true,photoUploaded:true,preferencesSet:true,checkInTimePref:"14:30",arrivalMode:"Taxi",purpose:"Affaires" },
  "RES-2026-0518-004": { complete:100,cniScanned:true,cniVerified:true,photoUploaded:true,preferencesSet:true,checkInTimePref:"15:00",arrivalMode:"Voiture personnelle",purpose:"Loisir" },
  "RES-2026-0517-009": { complete:100,cniScanned:true,cniVerified:true,photoUploaded:true,preferencesSet:true,checkInTimePref:"14:00",arrivalMode:"Aéroport (navette demandée)",purpose:"Affaires" },
  "RES-2026-0518-007": { complete:100,cniScanned:true,cniVerified:true,photoUploaded:true,preferencesSet:true,arrivalMode:"Taxi",purpose:"Tourisme" },
  "RES-2026-0518-008": { complete:85,cniScanned:true,cniVerified:false,photoUploaded:true,preferencesSet:false,arrivalMode:"Aéroport",purpose:"Transit" },
  "RES-2026-0516-002": { complete:100,cniScanned:true,cniVerified:true,photoUploaded:true,preferencesSet:true,arrivalMode:"Voiture de fonction",purpose:"Mission BMZ" },
  "RES-2026-0521-014": { complete:70,cniScanned:false,cniVerified:false,photoUploaded:true,preferencesSet:true,arrivalMode:"Taxi",purpose:"Affaires" },
};

export const APP_REQUESTS: AppRequest[] = [
  { id:"REQ-2841",time:"14:42",room:"308",guest:"Daniel Kouassi",type:"room-service",title:"Petit-déjeuner en chambre",details:"Continental × 2 · café noir · jus orange · à 08:00 demain",price:12000,status:"pending",priority:"normal" },
  { id:"REQ-2840",time:"14:18",room:"501",guest:"Ambassadeur Niang",type:"concierge",title:"Réservation restaurant externe",details:"Table 2 pers · La Villa · ce soir 20h",price:0,status:"pending",priority:"high" },
  { id:"REQ-2839",time:"13:55",room:"401",guest:"Léa Dembélé",type:"laundry",title:"Pressing 3 chemises",details:"Pickup 16h · retour 19h · service express +30%",price:6500,status:"in-progress",priority:"normal" },
  { id:"REQ-2838",time:"13:22",room:"206",guest:"Anna Schmidt",type:"spa",title:"Massage relaxant 60 min",details:"Demain 10:00 · masseuse Aïssata",price:25000,status:"confirmed",priority:"normal" },
  { id:"REQ-2837",time:"12:18",room:"302",guest:"Fatou Sow",type:"housekeeping",title:"Demande serviettes supplémentaires",details:"2 serviettes bain + 1 peignoir",price:0,status:"done",priority:"normal" },
  { id:"REQ-2836",time:"11:45",room:"301",guest:"Moussa Traoré",type:"transfer",title:"Navette aéroport jeudi",details:"Vol AF733 · départ 14h30 · 2 valises",price:15000,status:"confirmed",priority:"normal" },
  { id:"REQ-2835",time:"10:30",room:"405",guest:"Sandra Coulibaly",type:"room-service",title:"Snack après-midi",details:"Salade César + thé glacé",price:8500,status:"done",priority:"normal" },
  { id:"REQ-2834",time:"09:12",room:"201",guest:"Sarah Martin",type:"concierge",title:"Excursion Grand-Bassam dimanche",details:"Demi-journée · 4 personnes",price:45000,status:"pending",priority:"normal" },
];

export const REQUEST_TYPES: Record<string, RequestType> = {
  "room-service": { label:"Room service",   icon:"utensils",  color:"amber" },
  "concierge":    { label:"Conciergerie",   icon:"bell",      color:"violet" },
  "laundry":      { label:"Pressing",       icon:"droplet",   color:"teal" },
  "spa":          { label:"Spa & bien-être",icon:"sparkles",  color:"pink" },
  "housekeeping": { label:"Ménage",         icon:"refresh",   color:"primary" },
  "transfer":     { label:"Transfert",      icon:"car",       color:"primary" },
};

export const REVIEWS: Review[] = [
  { id:"AVI-218",date:"2026-05-17",guest:"Anna Schmidt",avatar:1,country:"DE",roomType:"Supérieure",stays:2,overall:5,scores:{cleanliness:5,staff:5,comfort:5,location:5,valueForMoney:4},title:"Une oasis face à la lagune",text:"Service impeccable, chambre lumineuse avec une vue à couper le souffle sur la lagune Ébrié. Le personnel de la réception, en particulier Aïcha, a été d'une attention rare. Petit-déjeuner copieux et varié. Je recommande vivement.",photos:3,reply:null,replyDate:null,helpful:12,verified:true },
  { id:"AVI-217",date:"2026-05-15",guest:"Awa Touré",avatar:4,country:"SN",roomType:"Standard",stays:2,overall:4,scores:{cleanliness:5,staff:5,comfort:4,location:4,valueForMoney:4},title:"Très bon séjour, bémol sur le bruit",text:"Tout était parfait excepté un peu de bruit du restaurant le soir. Personnel adorable et chambre propre. Je reviendrai.",photos:1,reply:"Bonjour Awa, merci pour votre retour ! Nous avons noté la remarque sur le bruit et étudions une meilleure isolation. À très bientôt 🌴",replyDate:"2026-05-15",helpful:5,verified:true },
  { id:"AVI-216",date:"2026-05-13",guest:"Joseph Brou",avatar:3,country:"CI",roomType:"Supérieure",stays:9,overall:5,scores:{cleanliness:5,staff:5,comfort:5,location:5,valueForMoney:5},title:"9e séjour, jamais déçu",text:"Mon QG quand je viens à Abidjan. La régularité du service est ce qui me fait revenir. Mention spéciale pour Le Baobab où le poulet braisé reste une référence.",photos:0,reply:"Joseph, c'est toujours un honneur de vous accueillir. Le chef Adama prépare déjà votre prochain repas 👨🏾‍🍳",replyDate:"2026-05-13",helpful:18,verified:true },
  { id:"AVI-215",date:"2026-05-11",guest:"Ibrahim Diallo",avatar:6,country:"GN",roomType:"Standard",stays:1,overall:3,scores:{cleanliness:4,staff:4,comfort:3,location:5,valueForMoney:2},title:"Bon rapport mais climatisation à revoir",text:"Bien situé, accueil correct. Climatisation faible dans la chambre 202, j'ai dû demander un ventilateur. Pour le prix demandé, j'attendais mieux côté confort.",photos:0,reply:null,replyDate:null,helpful:2,verified:true,needsReply:true },
  { id:"AVI-214",date:"2026-05-09",guest:"Mariam K.",avatar:5,country:"CI",roomType:"Suite Junior",stays:1,overall:5,scores:{cleanliness:5,staff:5,comfort:5,location:4,valueForMoney:5},title:"Un week-end de rêve",text:"Anniversaire de mariage célébré ici, l'équipe a tout préparé en surprise : pétales de roses, champagne, dîner sur le rooftop. Inoubliable !",photos:4,reply:"Merci Mariam, votre joie nous a tous touchés ! On vous attend pour les 10 ans 💍",replyDate:"2026-05-09",helpful:24,verified:true },
];

export const REVIEW_STATS: ReviewStats = {
  overall: 4.6, count: 218, monthCount: 28, monthAvg: 4.7, trend: "up",
  distribution: { 5: 142, 4: 51, 3: 17, 2: 5, 1: 3 },
  byCategory: { cleanliness: 4.8, staff: 4.7, comfort: 4.4, location: 4.6, valueForMoney: 4.3 },
  responseRate: 92, avgResponseTime: "4h",
};

export const PLANNING_BOOKINGS: PlanningBooking[] = [
  { room:"101",guest:"Kouamé Yao",start:-1,end:3,status:"checkedin" },
  { room:"103",guest:"Awa Touré",start:-3,end:0,status:"departure" },
  { room:"105",guest:"Famille Bamba",start:0,end:4,status:"confirmed" },
  { room:"108",guest:"Aminata Cissé",start:-2,end:1,status:"checkedin" },
  { room:"201",guest:"Sarah Martin",start:-1,end:5,status:"checkedin" },
  { room:"202",guest:"Ibrahim Diallo",start:-2,end:0,status:"departure" },
  { room:"204",guest:"Élise N'Guessan",start:0,end:1,status:"confirmed" },
  { room:"205",guest:"Cheikh Diop",start:-1,end:3,status:"checkedin" },
  { room:"206",guest:"Anna Schmidt",start:-2,end:4,status:"checkedin" },
  { room:"210",guest:"Pierre Lambert",start:0,end:2,status:"confirmed" },
  { room:"301",guest:"Moussa Traoré",start:-3,end:7,status:"checkedin" },
  { room:"303",guest:"Joseph Brou",start:-5,end:0,status:"departure" },
  { room:"306",guest:"M. & Mme Adjé",start:-2,end:3,status:"checkedin" },
  { room:"308",guest:"Daniel Kouassi",start:0,end:4,status:"confirmed" },
  { room:"401",guest:"Léa Dembélé",start:-4,end:6,status:"checkedin" },
  { room:"405",guest:"Sandra Coulibaly",start:-3,end:2,status:"checkedin" },
  { room:"501",guest:"Ambassadeur Niang",start:-2,end:7,status:"checkedin" },
  { room:"502",guest:"M. Sangaré",start:1,end:5,status:"pending" },
];

export const STATUS_CONFIG: Record<RoomStatus, StatusConfig> = {
  libre:    { label: "Libre",        color: "var(--success)", bg: "var(--success-bg)" },
  occupee:  { label: "Occupée",      color: "var(--primary)", bg: "var(--info-bg)" },
  depart:   { label: "Départ",       color: "var(--warn)",    bg: "var(--warn-bg)" },
  menage:   { label: "Ménage",       color: "var(--violet)",  bg: "var(--violet-bg)" },
  reservee: { label: "Arrivée",      color: "var(--teal)",    bg: "var(--teal-bg)" },
  hs:       { label: "Hors-service", color: "var(--text-3)",  bg: "var(--bg-2)" },
};

export const ARRIVALS_TODAY = BOOKINGS.filter(b => b.checkin === TODAY);
export const DEPARTURES_TODAY = BOOKINGS.filter(b => b.checkout === TODAY);

export function formatFCFA(n: number): string {
  return Number(n).toLocaleString("fr-FR") + " FCFA";
}

export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}
