import type { AuditLog, Clearance, Claim, CorrectiveAction, Account, AppState, Distribution, MenuItem } from './types';

export const APP_ACCOUNTS: Account[] = [
  { role: 'student', email: 'siswa@mymbg.id', password: 'mymbg2026', name: 'Aisyah Putri', organization: 'SMPN 5 Tangerang Selatan', subtitle: 'Kelas IX-A' },
  { role: 'teacher', email: 'guru@mymbg.id', password: 'mymbg2026', name: 'Siti Aminah', organization: 'SMPN 5 Tangerang Selatan', subtitle: 'Guru / Pengawas MBG' },
  { role: 'vendor', email: 'vendor@mymbg.id', password: 'mymbg2026', name: 'Budi Santoso', organization: 'SPPG Melati', subtitle: 'Operator SPPG' },
  { role: 'government', email: 'pemerintah@mymbg.id', password: 'mymbg2026', name: 'Rina Prasetyo', organization: 'Pusat Monitoring MBG', subtitle: 'Pemerintah / Pengawas' },
  { role: 'admin', email: 'admin@mymbg.id', password: 'mymbg2026', name: 'Admin My MBG', organization: 'My MBG System', subtitle: 'Administrator' }
];

export const menus: MenuItem[] = [
  { id: 'menu-1', date: '2026-09-21', day: 'Senin', name: 'Ayam Teriyaki Seimbang', description: 'Nasi, ayam teriyaki, tumis sayur, jeruk, dan susu.', calories: 678, protein: 31, carbs: 88, fat: 19, components: ['Nasi putih', 'Ayam teriyaki', 'Tumis wortel-buncis', 'Jeruk', 'Susu UHT'], image: '/meal-teriyaki.png', votes: 168 },
  { id: 'menu-2', date: '2026-09-22', day: 'Selasa', name: 'Ikan Bakar Nusantara', description: 'Nasi, ikan bakar, sayur bening, pisang, dan susu.', calories: 642, protein: 34, carbs: 82, fat: 17, components: ['Nasi putih', 'Ikan bakar', 'Sayur bening', 'Pisang', 'Susu UHT'], image: '/meal-fish.png', votes: 143 },
  { id: 'menu-3', date: '2026-09-23', day: 'Rabu', name: 'Beef Yakiniku & Capcay', description: 'Nasi, beef yakiniku, capcay, apel, dan air mineral.', calories: 704, protein: 33, carbs: 91, fat: 21, components: ['Nasi putih', 'Beef yakiniku', 'Capcay', 'Apel', 'Air mineral'], image: '/meal-beef.png', votes: 192 },
  { id: 'menu-4', date: '2026-09-24', day: 'Kamis', name: 'Ayam Kecap, Tempe & Kangkung', description: 'Nasi, ayam kecap, tempe, tumis kangkung, dan pepaya.', calories: 665, protein: 30, carbs: 86, fat: 18, components: ['Nasi putih', 'Ayam kecap', 'Tempe', 'Tumis kangkung', 'Pepaya'], image: '/meal-teriyaki.png', votes: 119 },
  { id: 'menu-5', date: '2026-09-25', day: 'Jumat', name: 'Ikan Fillet Saus Tomat', description: 'Nasi, ikan fillet, sup sayur, melon, dan susu.', calories: 651, protein: 32, carbs: 84, fat: 17, components: ['Nasi putih', 'Ikan fillet', 'Sup sayur', 'Melon', 'Susu UHT'], image: '/meal-fish.png', votes: 156 },
  { id: 'menu-6', date: '2026-09-28', day: 'Senin', name: 'Chicken Katsu Panggang', description: 'Nasi, chicken katsu panggang, salad sayur, jeruk, dan susu.', calories: 690, protein: 35, carbs: 87, fat: 20, components: ['Nasi putih', 'Chicken katsu panggang', 'Salad sayur', 'Jeruk', 'Susu UHT'], image: '/meal-teriyaki.png', votes: 212 },
  { id: 'menu-7', date: '2026-09-29', day: 'Selasa', name: 'Ikan Bumbu Kuning', description: 'Nasi, ikan bumbu kuning, sayur bening bayam, pisang, dan susu.', calories: 638, protein: 33, carbs: 81, fat: 16, components: ['Nasi putih', 'Ikan bumbu kuning', 'Sayur bayam', 'Pisang', 'Susu UHT'], image: '/meal-fish.png', votes: 176 },
  { id: 'menu-8', date: '2026-09-30', day: 'Rabu', name: 'Beef Teriyaki & Brokoli', description: 'Nasi, beef teriyaki, brokoli-wortel, apel, dan air mineral.', calories: 698, protein: 34, carbs: 88, fat: 20, components: ['Nasi putih', 'Beef teriyaki', 'Brokoli-wortel', 'Apel', 'Air mineral'], image: '/meal-beef.png', votes: 201 },
  { id: 'menu-9', date: '2026-10-01', day: 'Kamis', name: 'Ayam Semur & Tahu', description: 'Nasi, ayam semur, tahu, tumis buncis, pepaya, dan susu.', calories: 672, protein: 31, carbs: 85, fat: 19, components: ['Nasi putih', 'Ayam semur', 'Tahu', 'Tumis buncis', 'Pepaya', 'Susu UHT'], image: '/meal-teriyaki.png', votes: 164 },
  { id: 'menu-10', date: '2026-10-02', day: 'Jumat', name: 'Ikan Panggang & Sup Sayur', description: 'Nasi, ikan panggang, sup wortel-kol, melon, dan susu.', calories: 646, protein: 32, carbs: 82, fat: 17, components: ['Nasi putih', 'Ikan panggang', 'Sup wortel-kol', 'Melon', 'Susu UHT'], image: '/meal-fish.png', votes: 183 }
];

export const sppgs = [
  { id: 'sppg-01', code: 'SPPG-TS-014', name: 'SPPG Melati', region: 'Tangerang Selatan', province: 'Banten', lat: -6.2886, lon: 106.7179, schools: 24, compliance: 94, anomalies: 3, risk: 'Watch' },
  { id: 'sppg-02', code: 'SPPG-JKT-209', name: 'SPPG Cendana', region: 'Jakarta Selatan', province: 'DKI Jakarta', lat: -6.2615, lon: 106.8106, schools: 18, compliance: 97, anomalies: 1, risk: 'Normal' },
  { id: 'sppg-03', code: 'SPPG-BKS-041', name: 'SPPG Patriot', region: 'Bekasi', province: 'Jawa Barat', lat: -6.2383, lon: 106.9756, schools: 21, compliance: 88, anomalies: 5, risk: 'Warning' },
  { id: 'sppg-04', code: 'SPPG-BDG-088', name: 'SPPG Parahyangan', region: 'Bandung', province: 'Jawa Barat', lat: -6.9175, lon: 107.6191, schools: 16, compliance: 98, anomalies: 0, risk: 'Normal' },
  { id: 'sppg-05', code: 'SPPG-TGR-027', name: 'SPPG Anggrek', region: 'Tangerang', province: 'Banten', lat: -6.1783, lon: 106.6319, schools: 19, compliance: 91, anomalies: 2, risk: 'Watch' },
  { id: 'sppg-06', code: 'SPPG-JKP-119', name: 'SPPG Monas', region: 'Jakarta Pusat', province: 'DKI Jakarta', lat: -6.1865, lon: 106.8341, schools: 14, compliance: 84, anomalies: 6, risk: 'Critical' },
  { id: 'sppg-07', code: 'SPPG-DPK-021', name: 'SPPG Margonda', region: 'Depok', province: 'Jawa Barat', lat: -6.4025, lon: 106.7942, schools: 17, compliance: 95, anomalies: 1, risk: 'Normal' },
  { id: 'sppg-08', code: 'SPPG-BTN-033', name: 'SPPG Serang Jaya', region: 'Serang', province: 'Banten', lat: -6.1201, lon: 106.1503, schools: 15, compliance: 90, anomalies: 3, risk: 'Watch' }
];

export const schools = [
  { id: 'sch-01', code: 'SMPN5TS', name: 'SMPN 5 Tangerang Selatan', region: 'Tangerang Selatan', sppg: 'SPPG Melati', students: 842, status: 'Active' },
  { id: 'sch-02', code: 'SMPN8TS', name: 'SMPN 8 Tangerang Selatan', region: 'Tangerang Selatan', sppg: 'SPPG Melati', students: 779, status: 'Active' },
  { id: 'sch-03', code: 'SMAN2TS', name: 'SMAN 2 Tangerang Selatan', region: 'Tangerang Selatan', sppg: 'SPPG Melati', students: 1034, status: 'Active' },
  { id: 'sch-04', code: 'SMPN19JKS', name: 'SMPN 19 Jakarta Selatan', region: 'Jakarta Selatan', sppg: 'SPPG Cendana', students: 910, status: 'Active' },
  { id: 'sch-05', code: 'SDN04BKS', name: 'SDN 04 Bekasi', region: 'Bekasi', sppg: 'SPPG Patriot', students: 612, status: 'Active' },
  { id: 'sch-06', code: 'SMPN3BDG', name: 'SMPN 3 Bandung', region: 'Bandung', sppg: 'SPPG Parahyangan', students: 788, status: 'Active' },
  { id: 'sch-07', code: 'SMAN7TGR', name: 'SMAN 7 Tangerang', region: 'Tangerang', sppg: 'SPPG Anggrek', students: 988, status: 'Active' },
  { id: 'sch-08', code: 'SMPN2JKP', name: 'SMPN 2 Jakarta Pusat', region: 'Jakarta Pusat', sppg: 'SPPG Monas', students: 724, status: 'Active' }
];

export const initialDistributions: Distribution[] = [
  { id: 'DST-20260915-101', date: '2026-09-15', school: 'SMPN 5 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-1', targetPortions: 500, deliveredPortions: 500, plannedTime: '11:30', deliveredAt: '11:27', status: 'VALIDATED', qcScore: 91 },
  { id: 'DST-20260915-102', date: '2026-09-15', school: 'SMPN 8 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-1', targetPortions: 460, deliveredPortions: 458, plannedTime: '11:35', deliveredAt: '11:38', status: 'VALIDATED', qcScore: 93 },
  { id: 'DST-20260915-103', date: '2026-09-15', school: 'SMAN 2 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-1', targetPortions: 640, deliveredPortions: 637, plannedTime: '11:45', deliveredAt: '11:46', status: 'VALIDATED', qcScore: 90 },
  { id: 'DST-20260916-104', date: '2026-09-16', school: 'SMPN 5 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-1', targetPortions: 500, deliveredPortions: 500, plannedTime: '11:30', deliveredAt: '11:29', status: 'VALIDATED', qcScore: 92 },
  { id: 'DST-20260916-105', date: '2026-09-16', school: 'SMPN 8 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-1', targetPortions: 460, deliveredPortions: 460, plannedTime: '11:35', deliveredAt: '11:33', status: 'VALIDATED', qcScore: 94 },
  { id: 'DST-20260916-106', date: '2026-09-16', school: 'SMAN 2 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-1', targetPortions: 640, deliveredPortions: 638, plannedTime: '11:45', deliveredAt: '11:47', status: 'VALIDATED', qcScore: 93 },
  { id: 'DST-20260917-107', date: '2026-09-17', school: 'SMPN 5 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-1', targetPortions: 500, deliveredPortions: 500, plannedTime: '11:30', deliveredAt: '11:26', status: 'VALIDATED', qcScore: 94 },
  { id: 'DST-20260917-108', date: '2026-09-17', school: 'SMPN 8 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-1', targetPortions: 460, deliveredPortions: 460, plannedTime: '11:35', deliveredAt: '11:32', status: 'VALIDATED', qcScore: 95 },
  { id: 'DST-20260917-109', date: '2026-09-17', school: 'SMAN 2 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-1', targetPortions: 640, deliveredPortions: 640, plannedTime: '11:45', deliveredAt: '11:44', status: 'VALIDATED', qcScore: 92 },
  { id: 'DST-20260918-110', date: '2026-09-18', school: 'SMPN 5 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-1', targetPortions: 500, deliveredPortions: 498, plannedTime: '11:30', deliveredAt: '11:31', status: 'VALIDATED', qcScore: 93 },
  { id: 'DST-20260918-111', date: '2026-09-18', school: 'SMPN 8 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-1', targetPortions: 460, deliveredPortions: 460, plannedTime: '11:35', deliveredAt: '11:34', status: 'VALIDATED', qcScore: 96 },
  { id: 'DST-20260918-112', date: '2026-09-18', school: 'SMAN 2 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-1', targetPortions: 640, deliveredPortions: 640, plannedTime: '11:45', deliveredAt: '11:43', status: 'VALIDATED', qcScore: 95 },
  { id: 'DST-20260921-113', date: '2026-09-21', school: 'SMPN 5 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-1', targetPortions: 500, deliveredPortions: 500, plannedTime: '11:30', deliveredAt: '11:28', status: 'VALIDATED', qcScore: 95 },
  { id: 'DST-20260921-114', date: '2026-09-21', school: 'SMPN 8 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-1', targetPortions: 460, deliveredPortions: 460, plannedTime: '11:35', deliveredAt: '11:32', status: 'VALIDATED', qcScore: 97 },
  { id: 'DST-20260921-115', date: '2026-09-21', school: 'SMAN 2 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-1', targetPortions: 640, deliveredPortions: 640, plannedTime: '11:45', deliveredAt: '11:46', status: 'VALIDATED', qcScore: 94 },
  { id: 'DST-20260922-001', date: '2026-09-22', school: 'SMPN 5 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-2', targetPortions: 500, deliveredPortions: 500, plannedTime: '11:30', deliveredAt: '11:27', status: 'VALIDATION_PENDING' },
  { id: 'DST-20260922-002', date: '2026-09-22', school: 'SMPN 8 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-2', targetPortions: 460, deliveredPortions: 460, plannedTime: '11:35', deliveredAt: '11:31', status: 'VALIDATED', qcScore: 96 },
  { id: 'DST-20260922-003', date: '2026-09-22', school: 'SMAN 2 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-2', targetPortions: 640, deliveredPortions: 640, plannedTime: '11:45', deliveredAt: '11:43', status: 'VALIDATED', qcScore: 91 },
  { id: 'DST-20260922-004', date: '2026-09-22', school: 'SMPN 19 Jakarta Selatan', sppg: 'SPPG Cendana', menuId: 'menu-2', targetPortions: 510, deliveredPortions: 510, plannedTime: '11:30', deliveredAt: '11:32', status: 'VALIDATED', qcScore: 98 },
  { id: 'DST-20260922-005', date: '2026-09-22', school: 'SDN 04 Bekasi', sppg: 'SPPG Patriot', menuId: 'menu-2', targetPortions: 380, deliveredPortions: 366, plannedTime: '11:15', deliveredAt: '11:29', status: 'VALIDATED', qcScore: 74 },
  { id: 'DST-20260922-006', date: '2026-09-22', school: 'SMPN 2 Jakarta Pusat', sppg: 'SPPG Monas', menuId: 'menu-2', targetPortions: 420, deliveredPortions: 401, plannedTime: '11:20', deliveredAt: '11:46', status: 'VALIDATED', qcScore: 68 },
  { id: 'DST-20260923-007', date: '2026-09-23', school: 'SMPN 5 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-3', targetPortions: 500, deliveredPortions: 500, plannedTime: '11:30', deliveredAt: '11:28', status: 'VALIDATION_PENDING' },
  { id: 'DST-20260923-008', date: '2026-09-23', school: 'SMPN 8 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-3', targetPortions: 460, deliveredPortions: 460, plannedTime: '11:35', deliveredAt: '11:34', status: 'VALIDATED', qcScore: 94 },
  { id: 'DST-20260923-009', date: '2026-09-23', school: 'SMAN 2 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-3', targetPortions: 640, deliveredPortions: 0, plannedTime: '11:45', status: 'IN_TRANSIT' },
  { id: 'DST-20260923-010', date: '2026-09-23', school: 'SMPN 19 Jakarta Selatan', sppg: 'SPPG Cendana', menuId: 'menu-3', targetPortions: 510, deliveredPortions: 510, plannedTime: '11:30', deliveredAt: '11:29', status: 'VALIDATED', qcScore: 97 },
  { id: 'DST-20260923-011', date: '2026-09-23', school: 'SDN 04 Bekasi', sppg: 'SPPG Patriot', menuId: 'menu-3', targetPortions: 380, deliveredPortions: 372, plannedTime: '11:15', deliveredAt: '11:23', status: 'VALIDATED', qcScore: 81 },
  { id: 'DST-20260924-012', date: '2026-09-24', school: 'SMPN 5 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-4', targetPortions: 500, deliveredPortions: 0, plannedTime: '11:30', status: 'SCHEDULED' },
  { id: 'DST-20260925-013', date: '2026-09-25', school: 'SMPN 5 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-5', targetPortions: 500, deliveredPortions: 0, plannedTime: '11:30', status: 'SCHEDULED' },
  { id: 'DST-20260928-014', date: '2026-09-28', school: 'SMPN 5 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-6', targetPortions: 500, deliveredPortions: 0, plannedTime: '11:30', status: 'SCHEDULED' },
  { id: 'DST-20260929-015', date: '2026-09-29', school: 'SMPN 5 Tangerang Selatan', sppg: 'SPPG Melati', menuId: 'menu-7', targetPortions: 500, deliveredPortions: 0, plannedTime: '11:30', status: 'SCHEDULED' }
];

const initialAudit: AuditLog[] = [
  { id: 'LOG-001', timestamp: '2026-09-22 11:46:03', actor: 'Siti Aminah', role: 'teacher', action: 'VALIDATION_SUBMITTED', entity: 'Validation', entityId: 'VAL-20260922-0010', oldStatus: 'AI_ANALYZED', newStatus: 'VERIFIED' },
  { id: 'LOG-002', timestamp: '2026-09-22 11:43:21', actor: 'Budi Santoso', role: 'vendor', action: 'DISTRIBUTION_ARRIVED', entity: 'Distribution', entityId: 'DST-20260922-003', oldStatus: 'IN_TRANSIT', newStatus: 'DELIVERED' },
  { id: 'LOG-003', timestamp: '2026-09-22 11:31:09', actor: 'Siti Aminah', role: 'teacher', action: 'PHOTO_EVIDENCE_CAPTURED', entity: 'Validation', entityId: 'VAL-20260922-0009' },
  { id: 'LOG-004', timestamp: '2026-09-22 10:58:40', actor: 'Rina Prasetyo', role: 'government', action: 'ANOMALY_REVIEWED', entity: 'Anomaly', entityId: 'ANM-20260922-004', oldStatus: 'OPEN', newStatus: 'IN_REVIEW' },
  { id: 'LOG-005', timestamp: '2026-09-22 09:14:15', actor: 'Admin My MBG', role: 'admin', action: 'MENU_ACTIVATED', entity: 'Menu', entityId: 'menu-2' }
];

const initialClearances: Clearance[] = [
  { id: 'CLR-20260921-001', sppg: 'SPPG Melati', school: 'SMPN 5 Tangerang Selatan', period: '21 Sep 2026', periodDate: '2026-09-21', distributionIds: ['DST-20260921-113'], amount: 18400000, evidenceScore: 100, status: 'VERIFIED', decision: 'GOVERNMENT_VERIFIED', decisionNote: 'Bukti lengkap dan klaim telah diverifikasi.' },
  { id: 'CLR-20260922-002', sppg: 'SPPG Cendana', school: 'SMPN 19 Jakarta Selatan', period: '22 Sep 2026', periodDate: '2026-09-22', distributionIds: ['DST-20260922-004'], amount: 12750000, evidenceScore: 100, status: 'ELIGIBLE', decision: 'AUTO' },
  { id: 'CLR-20260922-003', sppg: 'SPPG Patriot', school: 'SDN 04 Bekasi', period: '22 Sep 2026', periodDate: '2026-09-22', distributionIds: ['DST-20260922-005'], amount: 10400000, evidenceScore: 71, status: 'ON_HOLD', decision: 'AUTO', holdReason: 'High — Gramasi protein di bawah standar' },
  { id: 'CLR-20260922-004', sppg: 'SPPG Monas', school: 'SMPN 2 Jakarta Pusat', period: '22 Sep 2026', periodDate: '2026-09-22', distributionIds: ['DST-20260922-006'], amount: 11200000, evidenceScore: 14, status: 'ON_HOLD', decision: 'AUTO', holdReason: 'Critical — Distribusi terlambat 26 menit' },
  { id: 'CLR-20260922-005', sppg: 'SPPG Melati', school: 'SMPN 5 Tangerang Selatan', period: '22 Sep 2026', periodDate: '2026-09-22', distributionIds: ['DST-20260922-001'], amount: 18400000, evidenceScore: 14, status: 'PENDING', decision: 'AUTO' }
];

const initialClaims: Claim[] = [
  { id: 'CLM-20260921-001', clearanceId: 'CLR-20260921-001', sppg: 'SPPG Melati', period: '21 Sep 2026', amount: 18400000, status: 'READY_FOR_PAYMENT', submittedAt: '21 Sep 2026 12:10', reviewedAt: '21 Sep 2026 14:05', note: 'Klaim telah lolos verifikasi clearance.' },
  { id: 'CLM-20260922-002', clearanceId: 'CLR-20260922-003', sppg: 'SPPG Patriot', period: '22 Sep 2026', amount: 10400000, status: 'ON_HOLD', submittedAt: '22 Sep 2026 12:20', note: 'Ditahan karena terdapat anomali porsi yang masih aktif.' },
  { id: 'CLM-20260922-003', clearanceId: 'CLR-20260922-004', sppg: 'SPPG Monas', period: '22 Sep 2026', amount: 11200000, status: 'UNDER_REVIEW', submittedAt: '22 Sep 2026 12:35', note: 'Menunggu klarifikasi atas keterlambatan dan kualitas penyajian.' }
];

const initialActions: CorrectiveAction[] = [
  { id: 'CA-001', anomalyId: 'ANM-20260921-003', assignedTo: 'SPPG Patriot', description: 'Kalibrasi ulang alat porsi protein dan unggah bukti SOP serving.', deadline: '2026-09-23', status: 'SUBMITTED' },
  { id: 'CA-002', anomalyId: 'ANM-20260920-002', assignedTo: 'SPPG Monas', description: 'Evaluasi rantai dingin dan bukti pemeriksaan suhu.', deadline: '2026-09-22', status: 'OPEN' }
];


const initialMealFeedback = Object.fromEntries(Array.from({ length: 120 }, (_, i) => {
  const menuId = `menu-${(i % 5) + 1}`;
  const level = i % 10 < 7 ? 'finished' : i % 10 < 9 ? 'partial' : 'leftover';
  const rating = i % 6 === 0 ? 4 : 5;
  const day = String(15 + (i % 8)).padStart(2, '0');
  const school = schools[i % schools.length].name;
  return [`seed-feedback-${i + 1}`, { menuId, level, rating, submittedAt: `2026-09-${day}`, school }];
})) as AppState['mealFeedback'];

export const initialState: AppState = {
  votes: {},
  mealFeedback: initialMealFeedback,
  distributions: initialDistributions,
  validations: [
    { id: 'VAL-20260921-0007', distributionId: 'DST-20260921-113', date: '2026-09-21', teacher: 'Siti Aminah', school: 'SMPN 5 Tangerang Selatan', sppg: 'SPPG Melati', menu: 'Ayam Teriyaki Seimbang', aiScore: 95, visualCompleteness: 97, portionConformity: 94, humanStatus: 'Sesuai', finalStatus: 'VERIFIED', locationStatus: 'Verified', note: 'Sampel sesuai standar.', image: '/meal-teriyaki.png', capturedAt: '11:34:12' },
    { id: 'VAL-20260918-0006', distributionId: 'DST-20260918-110', date: '2026-09-18', teacher: 'Siti Aminah', school: 'SMPN 5 Tangerang Selatan', sppg: 'SPPG Melati', menu: 'Ayam Teriyaki Seimbang', aiScore: 93, visualCompleteness: 96, portionConformity: 92, humanStatus: 'Sesuai', finalStatus: 'VERIFIED', locationStatus: 'Verified', note: 'Komponen lengkap dan porsi sesuai.', image: '/meal-teriyaki.png', capturedAt: '11:37:05' },
    { id: 'VAL-20260917-0005', distributionId: 'DST-20260917-107', date: '2026-09-17', teacher: 'Siti Aminah', school: 'SMPN 5 Tangerang Selatan', sppg: 'SPPG Melati', menu: 'Ayam Teriyaki Seimbang', aiScore: 94, visualCompleteness: 96, portionConformity: 93, humanStatus: 'Sesuai', finalStatus: 'VERIFIED', locationStatus: 'Verified', note: 'Sampel diterima.', image: '/meal-teriyaki.png', capturedAt: '11:32:47' },
    { id: 'VAL-20260916-0004', distributionId: 'DST-20260916-104', date: '2026-09-16', teacher: 'Siti Aminah', school: 'SMPN 5 Tangerang Selatan', sppg: 'SPPG Melati', menu: 'Ayam Teriyaki Seimbang', aiScore: 92, visualCompleteness: 95, portionConformity: 91, humanStatus: 'Sesuai', finalStatus: 'VERIFIED', locationStatus: 'Verified', note: 'Tidak ada temuan material.', image: '/meal-teriyaki.png', capturedAt: '11:35:31' },
    { id: 'VAL-20260915-0003', distributionId: 'DST-20260915-101', date: '2026-09-15', teacher: 'Siti Aminah', school: 'SMPN 5 Tangerang Selatan', sppg: 'SPPG Melati', menu: 'Ayam Teriyaki Seimbang', aiScore: 91, visualCompleteness: 94, portionConformity: 90, humanStatus: 'Sesuai', finalStatus: 'VERIFIED', locationStatus: 'Verified', note: 'Sampel sesuai.', image: '/meal-teriyaki.png', capturedAt: '11:33:18' },
    { id: 'VAL-20260922-0010', distributionId: 'DST-20260922-002', date: '2026-09-22', teacher: 'Siti Aminah', school: 'SMPN 8 Tangerang Selatan', sppg: 'SPPG Melati', menu: 'Ikan Bakar Nusantara', aiScore: 96, visualCompleteness: 98, portionConformity: 95, humanStatus: 'Sesuai', finalStatus: 'VERIFIED', locationStatus: 'Verified', note: 'Sampel sesuai.', image: '/meal-fish.png', capturedAt: '11:42:51' },
    { id: 'VAL-20260922-0009', distributionId: 'DST-20260922-003', date: '2026-09-22', teacher: 'Siti Aminah', school: 'SMAN 2 Tangerang Selatan', sppg: 'SPPG Melati', menu: 'Ikan Bakar Nusantara', aiScore: 91, visualCompleteness: 95, portionConformity: 90, humanStatus: 'Sesuai', finalStatus: 'VERIFIED', locationStatus: 'Verified', note: '', image: '/meal-fish.png', capturedAt: '11:40:11' },
    { id: 'VAL-20260921-0008', distributionId: 'DST-20260922-005', date: '2026-09-21', teacher: 'Andi Permana', school: 'SDN 04 Bekasi', sppg: 'SPPG Patriot', menu: 'Ayam Teriyaki Seimbang', aiScore: 74, visualCompleteness: 88, portionConformity: 73, humanStatus: 'Perlu Review', finalStatus: 'REVIEW_REQUIRED', locationStatus: 'Verified', note: 'Protein tampak kurang dari standar.', image: '/meal-teriyaki.png', capturedAt: '11:36:08' },
    { id: 'VAL-20260922-0011', distributionId: 'DST-20260922-004', date: '2026-09-22', teacher: 'Rudi Hartono', school: 'SMPN 19 Jakarta Selatan', sppg: 'SPPG Cendana', menu: 'Ikan Bakar Nusantara', aiScore: 98, visualCompleteness: 99, portionConformity: 97, humanStatus: 'Sesuai', finalStatus: 'VERIFIED', locationStatus: 'Verified', note: 'Sampel sesuai dan bukti lengkap.', image: '/meal-fish.png', capturedAt: '11:38:14' }
  ],
  anomalies: [
    { id: 'ANM-20260921-003', date: '2026-09-21', distributionId: 'DST-20260922-005', validationId: 'VAL-20260921-0008', school: 'SDN 04 Bekasi', sppg: 'SPPG Patriot', category: 'Porsi', severity: 'High', title: 'Gramasi protein di bawah standar', description: 'Sampel menunjukkan deviasi porsi protein sekitar 18%.', status: 'CORRECTIVE_ACTION', reporter: 'Andi Permana', vendorResponse: 'Alat porsi telah diperiksa dan SOP serving dikalibrasi ulang.' },
    { id: 'ANM-20260922-004', date: '2026-09-22', distributionId: 'DST-20260922-006', school: 'SMPN 2 Jakarta Pusat', sppg: 'SPPG Monas', category: 'Keterlambatan', severity: 'Critical', title: 'Distribusi terlambat 26 menit', description: 'Distribusi tiba melewati SLA dan 19 porsi kurang dari target.', status: 'IN_REVIEW', reporter: 'Dewi Kurnia' },
    { id: 'ANM-20260920-002', date: '2026-09-20', distributionId: 'DST-20260922-006', school: 'SMPN 2 Jakarta Pusat', sppg: 'SPPG Monas', category: 'Kualitas', severity: 'High', title: 'Suhu penyajian tidak sesuai', description: 'Pengawas meminta verifikasi ulang rantai dingin.', status: 'AWAITING_VENDOR', reporter: 'Dewi Kurnia' },
    { id: 'ANM-20260919-001', date: '2026-09-19', distributionId: 'DST-20260922-004', school: 'SMPN 19 Jakarta Selatan', sppg: 'SPPG Cendana', category: 'Kemasan', severity: 'Low', title: 'Kemasan sebagian penyok', description: 'Tidak memengaruhi keamanan pangan, vendor diminta memperbaiki handling.', status: 'RESOLVED', reporter: 'Rudi Hartono', resolutionNote: 'Handling box diperbaiki.' }
  ],
  correctiveActions: initialActions,
  clearances: initialClearances,
  claims: initialClaims,
  auditLogs: initialAudit,
  vendorMenuReady: {},
  managedUsers: [],
  menuActive: Object.fromEntries(menus.map(m=>[m.id,true])),
  adminSettings: { emailNotif: true, criticalAlert: true }
};

export const nutritionArticles = [
  { id: 'n1', category: 'Gizi Seimbang', title: 'Kenapa protein penting untuk tumbuh?', excerpt: 'Protein membantu membangun dan memperbaiki jaringan tubuh.', content: 'Protein dibutuhkan tubuh untuk pertumbuhan, perbaikan jaringan, dan pembentukan berbagai komponen penting. Sumbernya antara lain ikan, ayam, telur, daging, tahu, dan tempe.' },
  { id: 'n2', category: 'Keamanan Pangan', title: 'Kenali tanda makanan yang perlu dilaporkan', excerpt: 'Perubahan bau, warna, tekstur, atau kemasan perlu diperhatikan.', content: 'Jika makanan memiliki bau tidak wajar, perubahan warna mencolok, tekstur berlendir, kemasan rusak, atau kondisi penyajian tidak sesuai, jangan dipaksakan untuk dikonsumsi. Sampaikan kepada guru atau pengawas.' },
  { id: 'n3', category: 'Food Waste', title: 'Ambil secukupnya, habiskan dengan bijak', excerpt: 'Sisa makanan kecil dari banyak orang bisa menjadi limbah besar.', content: 'Mulai dengan porsi yang mampu dihabiskan. Jika ada menu yang kurang disukai, berikan umpan balik melalui My MBG agar data preferensi dapat dipakai untuk perencanaan menu berikutnya.' },
  { id: 'n4', category: 'Kebiasaan Sehat', title: 'Isi piringmu dengan beragam warna', excerpt: 'Warna alami makanan sering menandakan variasi zat gizi.', content: 'Kombinasikan sumber karbohidrat, protein, sayur, dan buah. Variasi makanan membantu tubuh memperoleh zat gizi yang lebih beragam.' },
  { id: 'n5', category: 'Hidrasi', title: 'Jangan lupa minum setelah makan', excerpt: 'Air membantu menjaga fungsi tubuh selama belajar dan beraktivitas.', content: 'Biasakan minum air putih secara cukup sepanjang hari. Pilih air putih sebagai minuman utama dan sesuaikan kebutuhan dengan aktivitas.' },
  { id: 'n6', category: 'Kebersihan', title: 'Cuci tangan sebelum makan', excerpt: 'Kebiasaan sederhana ini membantu menjaga kebersihan saat makan.', content: 'Gunakan sabun dan air mengalir, lalu keringkan tangan sebelum memegang makanan atau alat makan.' },
  { id: 'n7', category: 'Porsi', title: 'Kenali porsi yang pas untukmu', excerpt: 'Porsi seimbang membantu kenyang tanpa menyisakan terlalu banyak makanan.', content: 'Makan perlahan dan perhatikan rasa kenyang. Jika sering menyisakan jenis makanan tertentu, gunakan fitur umpan balik agar sekolah mengetahui preferensi siswa.' },
  { id: 'n8', category: 'Buah & Sayur', title: 'Mengapa sayur dan buah selalu ada?', excerpt: 'Sayur dan buah menambah serat, vitamin, mineral, serta variasi menu.', content: 'Usahakan mencoba sayur dan buah yang tersedia. Setiap jenis memiliki komposisi zat gizi yang berbeda sehingga variasi penting dalam pola makan sehari-hari.' }
];

export const users = [
  ...APP_ACCOUNTS.map((a, i) => ({ id: `usr-${i + 1}`, name: a.name, email: a.email, role: a.role, organization: a.organization, status: 'Active', lastLogin: i < 4 ? '22 Sep 2026 10:1' + i : '21 Sep 2026 19:42' })),
  { id: 'usr-06', name: 'Andi Permana', email: 'andi@smpn04.id', role: 'teacher', organization: 'SDN 04 Bekasi', status: 'Active', lastLogin: '22 Sep 2026 08:54' },
  { id: 'usr-07', name: 'Dewi Kurnia', email: 'dewi@smpn2jkp.id', role: 'teacher', organization: 'SMPN 2 Jakarta Pusat', status: 'Active', lastLogin: '22 Sep 2026 09:02' }
];
