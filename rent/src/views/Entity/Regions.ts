 
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
        "Gonaïves", "Saint-Marc", "Dessalines", "Gros-Morne", "Anse-Rouge",
        "Ennery", "Marmelade", "Verrettes", "L'Estère", "Petite Rivière de l'Artibonite",
        "Saint Michel de l'Attalaye", "La Chapelle"
      ]
    },
    {
      id: 2,
      name: "Centre",
      capital: "Hinche",
      label: "Hinche",
      value: 2,
      cities: [
        "Hinche", "Mirebalais", "Boucan-Carré", "Lascahobas", "Cerca-la-Source",
        "Cerca-Cavajal", "Thomonde", "Maïssade", "Belladère", "Saut-d’Eau"
      ]
    },
    {
      id: 3,
      name: "Grand'Anse",
      capital: "Jeremie",
      label: "Jeremie",
      value: 3,
      cities: [
        "Jérémie", "Anse d’Hainault", "Chambellan", "Dame-Marie", "Pestel",
        "Abricots", "Bonbon", "Moron", "Roseaux", "Beaumont"
      ]
    },
    {
      id: 4,
      name: "Nord",
      capital: "Cap-Haïtien",
      label: "Cap-Haïtien",
      value: 4,
      cities: [
        "Cap-Haïtien", "Limonade", "Milot", "Plaine-du-Nord", "Quartier-Morin",
        "Bahon", "Dondon", "Grande-Rivière-du-Nord", "Pilate", "Plaisance",
        "Acul-du-Nord", "Borgne"
      ]
    },
    {
      id: 5,
      name: "Nord-Est",
      capital: "Ouanaminthe",
      label: "Ouanaminthe",
      value: 5,
      cities: [
        "Ouanaminthe", "Fort-Liberté", "Trou-du-Nord", "Caracol", "Ferrier",
        "Perches", "Mont-Organisé", "Terrier-Rouge", "Capotille"
      ]
    },
    {
      id: 6,
      name: "Nord-Ouest",
      capital: "Port-de-Paix",
      label: "Port-de-Paix",
      value: 6,
      cities: [
        "Port-de-Paix", "Saint-Louis-du-Nord", "Jean-Rabel", "Bombardopolis",
        "Môle Saint-Nicolas", "Chansolme", "Bassin-Bleu", "La Tortue", "Baie-de-Henne"
      ]
    },
    {
      id: 7,
      name: "Ouest",
      capital: "Port-au-Prince",
      label: "Port-au-Prince",
      value: 7,
      cities: [
        "Port-au-Prince", "Carrefour", "Delmas", "Pétion-Ville", "Tabarre", "Cité Soleil",
        "Croix-des-Bouquets", "Kenscoff", "Léogâne", "Gressier", "Arcahaie", "Cabaret",
        "Ganthier", "Thomazeau"
      ]
    },
    {
      id: 8,
      name: "Sud",
      capital: "Les Cayes",
      label: "Les Cayes",
      value: 8,
      cities: [
        "Les Cayes", "Port-Salut", "Camp-Perrin", "Torbeck", "Chantal", "Cavaillon",
        "Aquin", "Côteaux", "Roche-à-Bateau", "Saint-Jean-du-Sud", "Ile-à-Vache"
      ]
    },
    {
      id: 9,
      name: "Sud-Est",
      capital: "Jacmel",
      label: "Jacmel",
      value: 9,
      cities: [
        "Jacmel", "Marigot", "La Vallée-de-Jacmel", "Cayes-Jacmel", "Bainet",
        "Belle-Anse", "Anse-à-Pitres", "Grand-Gosier"
      ]
    }
  ];

  export const getRegionsByValues = (values: number[]): RegionType[] => {
    return Regions.filter((region: RegionType)  => values.includes(Number(region.value)));
  };
  