 
export type RegionType = {
    id: number;
    name: string;
    capital: string;
    label: string;
    value: number | string;
    cities: string[];
  };
  export type DocType = Partial<RegionType>;
  export const DocTypeValues: DocType[] = [
    {
      id: 1,
      name: "Carte NIN",
      label: "Carte NIN",
      value: "Carte NIN",
    },
    {
      id: 2,
      name: "Permis de conduire",
      label: "Permis de conduire",
      value: "Permis de conduire",
    }
  ] as const;
  export const Regions: RegionType[] = [
    {
      id: 1,
      name: "Artibonite",
      capital: "Gonaives",
      label: "Gonaives",
      value: 1,
      cities: [
        "Dessalines",
        "Desdunes",
        "Grande-Saline",
        "Petite Rivière de l'Artibonite",
        "Gonaïves",
        "Ennery",
        "L'Estère",
        "Gros-Morne",
        "Anse-Rouge",
        "Terre-Neuve",
        "Marmelade",
        "Saint-Michel-de-l'Atalaye",
        "Saint-Marc",
        "Les Arcadins",
        "La Chapelle",
        "Liancourt",
        "Verrettes",
        "Montrouis"
      ]
    },
    {
      id: 2,
      name: "Centre",
      capital: "Hinche",
      label: "Hinche",
      value: 2,
      cities:  [
        "Cerca-la-Source",
        "Thomassique",
        "Hinche",
        "Cerca-Carvajal",
        "Maïssade",
        "Thomonde",
        "Lascahobas",
        "Baptiste",
        "Belladère",
        "Savanette",
        "Mirebalais",
        "Boucan-Carré",
        "Saut-d'Eau"
      ]
    },
    {
      id: 3,
      name: "Grand'Anse",
      capital: "Jeremie",
      label: "Jeremie",
      value: 3,
      cities: [
        "Anse-d'Hainault",
        "Dame-Marie",
        "Les Irois",
        "Beaumont",
        "Corail",
        "Pestel",
        "Roseaux",
        "Jérémie",
        "Abricots",
        "Bonbon",
        "Chambellan",
        "Marfranc",
        "Moron"
      ]
    },
    {
      id: 4,
      name: "Nord",
      capital: "Cap-Haïtien",
      label: "Cap-Haïtien",
      value: 4,
      cities:[
        "Acul-du-Nord",
        "Milot",
        "Plaine-du-Nord",
        "Borgne",
        "Port-Margot",
        "Cap-Haïtien",
        "Limonade",
        "Quartier-Morin",
        "Grande-Rivière-du-Nord",
        "Bahon",
        "Limbé",
        "Bas-Limbé",
        "Plaisance",
        "Pilate",
        "Saint-Raphaël",
        "Dondon",
        "La Victoire",
        "Pignon",
        "Ranquitte"
      ]
    },
    {
      id: 5,
      name: "Nord-Est",
      capital: "Ouanaminthe",
      label: "Ouanaminthe",
      value: 5,
      cities: [
        "Fort-Liberté",
        "Perches",
        "Ferrier",
        "Ouanaminthe",
        "Capotille",
        "Mont-Organisé",
        "Trou-du-Nord",
        "Caracol",
        "Sainte-Suzanne",
        "Grand-Bassin",
        "Terrier-Rouge",
        "Vallières",
        "Carice",
        "Mombin-Crochu"
      ]
    },
    {
      id: 6,
      name: "Nord-Ouest",
      capital: "Port-de-Paix",
      label: "Port-de-Paix",
      value: 6,
      cities: [
        "Môle-Saint-Nicolas",
        "Baie-de-Henne",
        "Bombardopolis",
        "Jean-Rabel",
        "Port-de-Paix",
        "Bassin-Bleu",
        "Chansolme",
        "Lapointe",
        "La Tortue",
        "Saint-Louis-du-Nord",
        "Anse-à-Foleur"
      ]
    },
    {
      id: 7,
      name: "Ouest",
      capital: "Port-au-Prince",
      label: "Port-au-Prince",
      value: 7,
      cities: [
        "Arcahaie",
        "Cabaret",
        "Croix-des-Bouquets",
        "Cornillon",
        "Fonds-Verrettes",
        "Ganthier",
        "Thomazeau",
        "Anse-à-Galets",
        "Pointe-à-Raquette",
        "Léogâne",
        "Grand-Goâve",
        "Petit-Goâve",
        "Port-au-Prince",
        "Carrefour",
        "Cité Soleil",
        "Delmas",
        "Gressier",
        "Kenscoff",
        "Pétion-Ville",
        "Tabarre"
      ]
    },
    {
      id: 8,
      name: "Sud",
      capital: "Les Cayes",
      label: "Les Cayes",
      value: 8,
      cities: [
        "Aquin",
        "Cavaillon",
        "Saint-Louis-du-Sud",
        "Fond des Blancs",
        "Les Cayes",
        "Camp-Perrin",
        "Chantal",
        "Île-à-Vache",
        "Maniche",
        "Torbeck",
        "Chardonnières",
        "Les Anglais",
        "Tiburon",
        "Côteaux",
        "Port-à-Piment",
        "Roche-à-Bateaux",
        "Port-Salut",
        "Arniquet",
        "Saint-Jean-du-Sud"
      ]
    },
    {
      id: 9,
      name: "Sud-Est",
      capital: "Jacmel",
      label: "Jacmel",
      value: 9,
      cities: [
        "Bainet",
        "Côtes-de-Fer",
        "Belle-Anse",
        "Anse-à-Pitres",
        "Grand-Gosier",
        "Thiotte",
        "Jacmel",
        "Cayes-Jacmel",
        "La Vallée",
        "Marigot"
      ]
    }
  ];

  export const getRegionsByValues = (values: number[]): RegionType[] => {
    return Regions.filter((region: RegionType)  => values.includes(Number(region.value)));
  };
  export const getRegionIds = (): number[] => {
    return Regions.map(region => region.id);
  };


  
