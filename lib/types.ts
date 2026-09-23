export type Role = 'student' | 'teacher' | 'vendor' | 'government' | 'admin';

export type Account = {
  role: Role;
  email: string;
  password: string;
  name: string;
  organization: string;
  subtitle: string;
};

export type MenuItem = {
  id: string;
  date: string;
  day: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  components: string[];
  image: string;
  votes?: number;
};

export type Distribution = {
  id: string;
  date: string;
  school: string;
  sppg: string;
  menuId: string;
  targetPortions: number;
  deliveredPortions: number;
  plannedTime: string;
  deliveredAt?: string;
  status: 'SCHEDULED' | 'PREPARING' | 'IN_TRANSIT' | 'DELIVERED' | 'VALIDATION_PENDING' | 'REVIEW_REQUIRED' | 'VALIDATED' | 'COMPLETED' | 'CANCELLED';
  qcScore?: number;
};

export type Validation = {
  id: string;
  distributionId: string;
  date: string;
  teacher: string;
  school: string;
  sppg: string;
  menu: string;
  aiScore: number;
  visualCompleteness: number;
  portionConformity: number;
  humanStatus: 'Sesuai' | 'Perlu Review' | 'Tidak Sesuai';
  finalStatus: 'VERIFIED' | 'REVIEW_REQUIRED' | 'ANOMALY';
  locationStatus: 'Verified' | 'Unverified';
  note: string;
  image?: string;
  capturedAt: string;
};

export type Anomaly = {
  id: string;
  date: string;
  distributionId: string;
  validationId?: string;
  school: string;
  sppg: string;
  category: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  description: string;
  status: 'OPEN' | 'IN_REVIEW' | 'AWAITING_VENDOR' | 'CORRECTIVE_ACTION' | 'RESOLVED' | 'CLOSED';
  reporter: string;
  vendorResponse?: string;
  resolutionNote?: string;
};

export type CorrectiveAction = {
  id: string;
  anomalyId: string;
  assignedTo: string;
  description: string;
  deadline: string;
  status: 'OPEN' | 'SUBMITTED' | 'APPROVED';
  resolutionNote?: string;
};

export type Clearance = {
  id: string;
  sppg: string;
  school?: string;
  period: string;
  periodDate?: string;
  distributionIds?: string[];
  amount: number;
  evidenceScore: number;
  status: 'NOT_READY' | 'PENDING' | 'ELIGIBLE' | 'ON_HOLD' | 'VERIFIED';
  decision?: 'AUTO' | 'GOVERNMENT_VERIFIED' | 'GOVERNMENT_HOLD' | 'CLARIFICATION';
  holdReason?: string;
  decisionNote?: string;
  lastCalculatedAt?: string;
};

export type Claim = {
  id: string;
  clearanceId: string;
  sppg: string;
  period: string;
  amount: number;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ON_HOLD' | 'READY_FOR_PAYMENT' | 'REJECTED';
  submittedAt?: string;
  reviewedAt?: string;
  note?: string;
  vendorClarification?: string;
};

export type AuditLog = {
  id: string;
  timestamp: string;
  actor: string;
  role: Role;
  action: string;
  entity: string;
  entityId: string;
  oldStatus?: string;
  newStatus?: string;
};

export type MealFeedback = {
  menuId: string;
  level: 'finished' | 'partial' | 'leftover';
  rating: number;
  submittedAt: string;
  school?: string;
};

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  organization: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
};

export type AdminSettings = {
  emailNotif: boolean;
  criticalAlert: boolean;
};

export type AppState = {
  votes: Record<string, string>;
  mealFeedback: Record<string, MealFeedback>;
  distributions: Distribution[];
  validations: Validation[];
  anomalies: Anomaly[];
  correctiveActions: CorrectiveAction[];
  clearances: Clearance[];
  claims: Claim[];
  auditLogs: AuditLog[];
  vendorMenuReady: Record<string, boolean>;
  managedUsers: ManagedUser[];
  menuActive: Record<string, boolean>;
  adminSettings: AdminSettings;
};
