export const SETTINGS_NAV = [
  { id:"hotel",    label:"Hôtel & identité",     icon:"bed"        },
  { id:"rooms",    label:"Types de chambre",      icon:"list"       },
  { id:"rates",    label:"Tarifs & saisons",      icon:"moneyBill"  },
  { id:"channels", label:"Canaux de diffusion",   icon:"barChart"   },
  { id:"payments", label:"Paiements",             icon:"creditCard" },
  { id:"team",     label:"Équipe & accès",        icon:"users"      },
  { id:"app",      label:"App Immo Plus",         icon:"sparkles"   },
  { id:"notifs",   label:"Notifications",         icon:"bell"       },
  { id:"billing",  label:"Facturation Immo Plus", icon:"fileText"   },
] as const;

export type SettingsSection = typeof SETTINGS_NAV[number]["id"];
