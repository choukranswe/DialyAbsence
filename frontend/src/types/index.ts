export type Role = 'admin' | 'medecin' | 'infirmier';
export type Sexe = 'M' | 'F';
export type GroupeSanguin = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type SeanceStatut = 'planifiee' | 'effectuee' | 'annulee';
export type AbsenceMotif = 'medical' | 'personnel' | 'hospitalise' | 'autre';
export type MachineStatut = 'disponible' | 'en_utilisation' | 'maintenance' | 'hors_service';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

export interface User {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  email: string;
  role: Role;
  telephone?: string | null;
  actif: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Patient {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  cin: string;
  date_naissance: string;
  age: number;
  sexe: Sexe;
  telephone: string;
  adresse: string;
  ville: string;
  groupe_sanguin: GroupeSanguin;
  poids: string | number;
  taille: number;
  cause_insuffisance_renale: string;
  nephrologue_id?: number | null;
  nephrologue?: Pick<User, 'id' | 'nom_complet' | 'email'> | null;
  date_entree: string;
  actif: boolean;
  notes?: string | null;
  nombre_seances: number;
  nombre_absences: number;
  created_at?: string;
  updated_at?: string;
}

export interface Machine {
  id: number;
  numero: string;
  marque: string;
  modele: string;
  statut: MachineStatut;
  date_installation?: string | null;
  date_derniere_maintenance?: string | null;
  notes?: string | null;
  seances_count?: number | null;
}

export interface Seance {
  id: number;
  patient_id: number;
  patient: Pick<Patient, 'id' | 'nom' | 'prenom' | 'nom_complet' | 'cin'>;
  machine_id: number;
  machine: Pick<Machine, 'id' | 'numero' | 'statut'>;
  infirmier_id?: number | null;
  infirmier?: Pick<User, 'id' | 'nom_complet'> | null;
  date_seance: string;
  heure_debut: string;
  heure_fin: string;
  duree_minutes: number;
  statut: SeanceStatut;
  tension_avant?: string | null;
  tension_apres?: string | null;
  poids_avant?: string | number | null;
  poids_apres?: string | number | null;
  poids_sec?: string | number | null;
  observations?: string | null;
}

export interface Absence {
  id: number;
  patient_id: number;
  patient: Pick<Patient, 'id' | 'nom' | 'prenom' | 'nom_complet' | 'cin'>;
  seance_id?: number | null;
  seance?: Pick<Seance, 'id' | 'date_seance' | 'heure_debut'> | null;
  date_absence: string;
  motif: AbsenceMotif;
  justifiee: boolean;
  notes?: string | null;
  declared_by?: number | null;
  declarant?: Pick<User, 'id' | 'nom_complet'> | null;
}

export interface DashboardStats {
  patients_actifs: number;
  seances_aujourdhui: number;
  absences_ce_mois: number;
  machines_disponibles: number;
  taux_absence_mois: number;
  seances_du_jour: Seance[];
}

export interface WeeklyAttendance {
  date: string;
  jour: string;
  effectuees: number;
  planifiees: number;
  annulees: number;
}

export interface AlertPatient {
  patient_id: number;
  patient: string;
  cin: string;
  nombre_absences: number;
  derniere_absence: string;
}

export interface PatientStats {
  total_seances: number;
  seances_effectuees: number;
  absences_total: number;
  absences_ce_mois: number;
  derniere_seance?: string | null;
  taux_presence: number;
}

export type PatientPayload = Omit<Patient, 'id' | 'nom_complet' | 'age' | 'nephrologue' | 'nombre_seances' | 'nombre_absences' | 'created_at' | 'updated_at'>;
export type SeancePayload = Omit<Seance, 'id' | 'patient' | 'machine' | 'infirmier'>;
export type AbsencePayload = Omit<Absence, 'id' | 'patient' | 'seance' | 'declarant' | 'declared_by'>;
export type MachinePayload = Omit<Machine, 'id' | 'seances_count'>;
export type UserPayload = Omit<User, 'id' | 'nom_complet' | 'created_at' | 'updated_at'> & { password?: string };
