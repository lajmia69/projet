import { CulturalProject, CulturalActivity } from '../types/projectsAndActivities';

// ─── Mock data ────────────────────────────────────────────────────────────────

const PROJECTS: CulturalProject[] = [
	{
		id: '1',
		title: 'Festival du Patrimoine',
		slug: 'festival-patrimoine',
		description:
			'Un festival annuel célébrant le riche patrimoine culturel et historique de notre région à travers des expositions, concerts et ateliers.',
		status: 'in_progress',
		category: 'festival',
		startDate: '2025-06-01',
		endDate: '2025-06-30',
		location: 'Centre-ville',
		budget: 50000,
		teamSize: 12,
		tags: ['patrimoine', 'festival', 'culture'],
		createdAt: '2025-01-10',
		updatedAt: '2025-03-15'
	},
	{
		id: '2',
		title: "Galerie d'Art Contemporain",
		slug: 'galerie-art-contemporain',
		description:
			"Espace d'exposition permanent dédié aux artistes locaux et internationaux avec un programme de résidences artistiques.",
		status: 'completed',
		category: 'art',
		startDate: '2024-09-01',
		endDate: '2024-12-31',
		location: 'Maison de la Culture',
		budget: 30000,
		teamSize: 6,
		tags: ['art', 'contemporain', 'exposition'],
		createdAt: '2024-07-01',
		updatedAt: '2025-01-05'
	},
	{
		id: '3',
		title: 'Bibliothèque Numérique',
		slug: 'bibliotheque-numerique',
		description:
			'Projet de numérisation et mise en ligne du fonds documentaire de la bibliothèque régionale pour un accès universel au savoir.',
		status: 'planning',
		category: 'numerique',
		startDate: '2025-09-01',
		location: 'En ligne',
		budget: 80000,
		teamSize: 8,
		tags: ['numérique', 'bibliothèque', 'archives'],
		createdAt: '2025-02-20',
		updatedAt: '2025-03-01'
	},
	{
		id: '4',
		title: 'Théâtre des Cultures',
		slug: 'theatre-cultures',
		description:
			'Programme de représentations théâtrales mettant en valeur la diversité culturelle avec des troupes nationales et internationales.',
		status: 'in_progress',
		category: 'theatre',
		startDate: '2025-03-01',
		endDate: '2025-08-31',
		location: 'Théâtre Municipal',
		budget: 45000,
		teamSize: 20,
		tags: ['théâtre', 'culture', 'monde'],
		createdAt: '2024-12-01',
		updatedAt: '2025-02-10'
	},
	{
		id: '5',
		title: 'Musique du Monde',
		slug: 'musique-monde',
		description:
			"Série de concerts et d'ateliers musicaux explorant les traditions musicales de cinq continents.",
		status: 'planning',
		category: 'musique',
		startDate: '2025-10-01',
		location: 'Auditorium',
		budget: 25000,
		teamSize: 10,
		tags: ['musique', 'concert', 'monde'],
		createdAt: '2025-03-01',
		updatedAt: '2025-03-20'
	},
	{
		id: '6',
		title: 'Cinéma Indépendant',
		slug: 'cinema-independant',
		description:
			'Plateforme de soutien et de diffusion du cinéma indépendant et documentaire avec un volet éducatif.',
		status: 'cancelled',
		category: 'cinema',
		startDate: '2024-11-01',
		endDate: '2025-02-28',
		location: 'Cinémathèque',
		budget: 20000,
		teamSize: 5,
		tags: ['cinéma', 'indépendant', 'documentaire'],
		createdAt: '2024-09-15',
		updatedAt: '2025-01-20'
	}
];

const ACTIVITIES: CulturalActivity[] = [
	{
		id: '1',
		title: 'Atelier de Calligraphie',
		slug: 'atelier-calligraphie',
		description:
			"Découvrez l'art de la calligraphie arabe et latine avec des maîtres calligraphes lors d'une session de 3 heures.",
		type: 'workshop',
		category: 'art',
		date: '2025-05-15',
		endDate: '2025-05-15',
		location: 'Centre Culturel',
		capacity: 20,
		price: 0,
		isFree: true,
		isOnline: false,
		tags: ['calligraphie', 'art', 'atelier'],
		createdAt: '2025-03-01',
		updatedAt: '2025-03-10'
	},
	{
		id: '2',
		title: 'Exposition "Mémoires Vivantes"',
		slug: 'expo-memoires-vivantes',
		description:
			'Une exposition photographique sur la mémoire collective et les traditions orales, avec des témoignages audio et vidéo.',
		type: 'exhibition',
		category: 'photo',
		date: '2025-04-10',
		endDate: '2025-05-10',
		location: 'Galerie Municipale',
		capacity: 200,
		price: 5,
		isFree: false,
		isOnline: false,
		projectId: '1',
		tags: ['photographie', 'mémoire', 'patrimoine'],
		createdAt: '2025-02-15',
		updatedAt: '2025-03-05'
	},
	{
		id: '3',
		title: 'Concert de Musique Traditionnelle',
		slug: 'concert-musique-traditionnelle',
		description:
			'Soirée musicale exceptionnelle avec des ensembles de musique traditionnelle du bassin méditerranéen.',
		type: 'concert',
		category: 'musique',
		date: '2025-06-20',
		location: 'Place de la République',
		capacity: 500,
		price: 0,
		isFree: true,
		isOnline: false,
		projectId: '5',
		tags: ['musique', 'tradition', 'méditerranée'],
		createdAt: '2025-03-10',
		updatedAt: '2025-03-15'
	},
	{
		id: '4',
		title: "Conférence : L'Art à l'Ère Numérique",
		slug: 'conference-art-numerique',
		description:
			"Table ronde entre artistes et technologues sur la transformation numérique des pratiques artistiques et culturelles.",
		type: 'conference',
		category: 'numerique',
		date: '2025-05-08',
		location: 'En ligne + Auditorium',
		capacity: 100,
		price: 0,
		isFree: true,
		isOnline: true,
		projectId: '3',
		tags: ['numérique', 'art', 'technologie'],
		createdAt: '2025-02-20',
		updatedAt: '2025-03-01'
	},
	{
		id: '5',
		title: 'Festival de Théâtre de Rue',
		slug: 'festival-theatre-rue',
		description:
			'Trois jours de performances théâtrales, acrobatiques et musicales dans les espaces publics de la ville.',
		type: 'festival',
		category: 'theatre',
		date: '2025-07-04',
		endDate: '2025-07-06',
		location: 'Espaces publics',
		capacity: 1000,
		price: 0,
		isFree: true,
		isOnline: false,
		projectId: '4',
		tags: ['théâtre', 'rue', 'festival'],
		createdAt: '2025-01-15',
		updatedAt: '2025-02-28'
	},
	{
		id: '6',
		title: "Atelier d'Écriture Créative",
		slug: 'atelier-ecriture-creative',
		description:
			"Séance d'initiation à l'écriture créative animée par un auteur reconnu, ouverte à tous niveaux.",
		type: 'workshop',
		category: 'litterature',
		date: '2025-04-25',
		location: 'Bibliothèque',
		capacity: 15,
		price: 10,
		isFree: false,
		isOnline: false,
		tags: ['écriture', 'créativité', 'littérature'],
		createdAt: '2025-03-05',
		updatedAt: '2025-03-12'
	},
	{
		id: '7',
		title: 'Projection : Cinéma du Monde',
		slug: 'projection-cinema-monde',
		description:
			'Sélection de courts-métrages et documentaires provenant de cinéastes indépendants de cinq continents.',
		type: 'other',
		category: 'cinema',
		date: '2025-05-30',
		location: 'Cinémathèque',
		capacity: 80,
		price: 8,
		isFree: false,
		isOnline: false,
		projectId: '6',
		tags: ['cinéma', 'court-métrage', 'monde'],
		createdAt: '2025-03-01',
		updatedAt: '2025-03-08'
	},
	{
		id: '8',
		title: 'Rencontre Intergénérationnelle',
		slug: 'rencontre-intergenerationnelle',
		description:
			"Échange vivant entre jeunes artistes et artisans expérimentés autour des savoir-faire traditionnels et de leur transmission.",
		type: 'workshop',
		category: 'artisanat',
		date: '2025-06-14',
		location: 'Maison des Artisans',
		capacity: 30,
		price: 0,
		isFree: true,
		isOnline: false,
		tags: ['artisanat', 'tradition', 'jeunesse'],
		createdAt: '2025-02-28',
		updatedAt: '2025-03-10'
	}
];

// ─── Simulated async API ──────────────────────────────────────────────────────

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export const cultureApi = {
	// Projects
	getProjects: async (): Promise<CulturalProject[]> => {
		await delay();
		return [...PROJECTS];
	},

	getProject: async (id: string): Promise<CulturalProject | undefined> => {
		await delay();
		return PROJECTS.find((p) => p.id === id);
	},

	createProject: async (data: Omit<CulturalProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<CulturalProject> => {
		await delay();
		const now = new Date().toISOString().split('T')[0];
		const project: CulturalProject = { ...data, id: String(Date.now()), createdAt: now, updatedAt: now };
		PROJECTS.push(project);
		return project;
	},

	updateProject: async (id: string, data: Partial<CulturalProject>): Promise<CulturalProject> => {
		await delay();
		const idx = PROJECTS.findIndex((p) => p.id === id);
		if (idx === -1) throw new Error('Project not found');
		PROJECTS[idx] = { ...PROJECTS[idx], ...data, updatedAt: new Date().toISOString().split('T')[0] };
		return PROJECTS[idx];
	},

	deleteProject: async (id: string): Promise<void> => {
		await delay();
		const idx = PROJECTS.findIndex((p) => p.id === id);
		if (idx !== -1) PROJECTS.splice(idx, 1);
	},

	// Activities
	getActivities: async (): Promise<CulturalActivity[]> => {
		await delay();
		return [...ACTIVITIES];
	},

	getActivity: async (id: string): Promise<CulturalActivity | undefined> => {
		await delay();
		return ACTIVITIES.find((a) => a.id === id);
	},

	createActivity: async (data: Omit<CulturalActivity, 'id' | 'createdAt' | 'updatedAt'>): Promise<CulturalActivity> => {
		await delay();
		const now = new Date().toISOString().split('T')[0];
		const activity: CulturalActivity = { ...data, id: String(Date.now()), createdAt: now, updatedAt: now };
		ACTIVITIES.push(activity);
		return activity;
	},

	updateActivity: async (id: string, data: Partial<CulturalActivity>): Promise<CulturalActivity> => {
		await delay();
		const idx = ACTIVITIES.findIndex((a) => a.id === id);
		if (idx === -1) throw new Error('Activity not found');
		ACTIVITIES[idx] = { ...ACTIVITIES[idx], ...data, updatedAt: new Date().toISOString().split('T')[0] };
		return ACTIVITIES[idx];
	},

	deleteActivity: async (id: string): Promise<void> => {
		await delay();
		const idx = ACTIVITIES.findIndex((a) => a.id === id);
		if (idx !== -1) ACTIVITIES.splice(idx, 1);
	}
};