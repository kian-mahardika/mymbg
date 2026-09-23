import type { AppState, Clearance, Claim, Distribution } from './types';

export type EvidenceItem = {
  key: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ClearanceEvidence = {
  distributions: Distribution[];
  evidenceItems: EvidenceItem[];
  score: number;
  allRequiredComplete: boolean;
  blockingAnomalies: AppState['anomalies'];
  blockingValidations: AppState['validations'];
};

export function clearanceDistributions(state: AppState, clearance: Clearance) {
  if (clearance.distributionIds?.length) {
    const set = new Set(clearance.distributionIds);
    return state.distributions.filter((d) => set.has(d.id));
  }
  if (clearance.periodDate) {
    return state.distributions.filter((d) => d.sppg === clearance.sppg && d.date === clearance.periodDate);
  }
  return [];
}

export function clearanceEvidence(state: AppState, clearance: Clearance): ClearanceEvidence {
  const distributions = clearanceDistributions(state, clearance);
  const ids = new Set(distributions.map((d) => d.id));
  const validations = state.validations.filter((v) => ids.has(v.distributionId));
  const relatedAnomalies = state.anomalies.filter((a) => ids.has(a.distributionId));
  const blockingAnomalies = relatedAnomalies.filter((a) => !['RESOLVED', 'CLOSED'].includes(a.status));
  const blockingValidations = validations.filter((v) => {
    if (v.finalStatus === 'VERIFIED') return false;
    const linked = relatedAnomalies.filter((a) => a.validationId === v.id);
    return !linked.length || linked.some((a) => !['RESOLVED', 'CLOSED'].includes(a.status));
  });

  const oneValidationEach = distributions.length > 0 && distributions.every((d) => validations.some((v) => v.distributionId === d.id));
  const distributionComplete = distributions.length > 0 && distributions.every((d) => ['VALIDATED', 'COMPLETED'].includes(d.status));
  const photoComplete = oneValidationEach && validations.every((v) => Boolean(v.image));
  const gpsComplete = oneValidationEach && validations.every((v) => v.locationStatus === 'Verified');
  const timestampComplete = oneValidationEach && validations.every((v) => Boolean(v.capturedAt));
  const aiComplete = oneValidationEach && validations.every((v) => Number.isFinite(v.aiScore) && v.aiScore > 0);
  const humanComplete = oneValidationEach && blockingValidations.length === 0;
  const noActiveAnomaly = blockingAnomalies.length === 0;

  const evidenceItems: EvidenceItem[] = [
    { key: 'distribution', label: 'Distribusi selesai', ok: distributionComplete, detail: distributionComplete ? 'Distribusi telah selesai dan tervalidasi.' : 'Distribusi belum selesai atau masih membutuhkan review.' },
    { key: 'photo', label: 'Bukti foto makanan', ok: photoComplete, detail: photoComplete ? 'Foto sampel tersedia.' : 'Bukti foto belum lengkap.' },
    { key: 'gps', label: 'GPS terverifikasi', ok: gpsComplete, detail: gpsComplete ? 'Lokasi pengambilan bukti terverifikasi.' : 'Ada lokasi yang belum terverifikasi.' },
    { key: 'timestamp', label: 'Timestamp tercatat', ok: timestampComplete, detail: timestampComplete ? 'Waktu pengambilan bukti tercatat.' : 'Timestamp belum lengkap.' },
    { key: 'ai', label: 'AI QC selesai', ok: aiComplete, detail: aiComplete ? 'Analisis AI sudah tersimpan.' : 'Analisis AI belum lengkap.' },
    { key: 'human', label: 'Human verification lolos', ok: humanComplete, detail: humanComplete ? 'Pengawas menyatakan sampel sesuai.' : 'Hasil manusia masih review atau tidak sesuai.' },
    { key: 'anomaly', label: 'Tidak ada anomali aktif', ok: noActiveAnomaly, detail: noActiveAnomaly ? 'Tidak ada temuan aktif pada distribusi ini.' : `${blockingAnomalies.length} anomali masih aktif.` }
  ];

  const score = Math.round((evidenceItems.filter((x) => x.ok).length / evidenceItems.length) * 100);
  return {
    distributions,
    evidenceItems,
    score,
    allRequiredComplete: evidenceItems.every((x) => x.ok),
    blockingAnomalies,
    blockingValidations
  };
}

export function calculatedClearanceStatus(state: AppState, clearance: Clearance): Clearance['status'] {
  const evidence = clearanceEvidence(state, clearance);

  if (!evidence.distributions.length) return 'NOT_READY';
  if (evidence.blockingAnomalies.length || evidence.blockingValidations.length) return 'ON_HOLD';
  if (clearance.decision === 'GOVERNMENT_HOLD' || clearance.decision === 'CLARIFICATION') return 'ON_HOLD';
  if (!evidence.allRequiredComplete) return 'PENDING';
  if (clearance.decision === 'GOVERNMENT_VERIFIED') return 'VERIFIED';
  return 'ELIGIBLE';
}

function automaticHoldReason(state: AppState, clearance: Clearance) {
  const evidence = clearanceEvidence(state, clearance);
  if (evidence.blockingAnomalies.length) {
    const top = evidence.blockingAnomalies[0];
    return `${top.severity} — ${top.title}`;
  }
  if (evidence.blockingValidations.length) return 'Hasil validasi manusia membutuhkan tindak lanjut.';
  if (!evidence.allRequiredComplete) {
    const missing = evidence.evidenceItems.filter((x) => !x.ok).map((x) => x.label);
    return missing.length ? `Menunggu: ${missing.join(', ')}.` : undefined;
  }
  return undefined;
}

export function recalculateClearances(state: AppState): AppState {
  const clearances = state.clearances.map((clearance) => {
    const evidence = clearanceEvidence(state, clearance);
    const calculated = calculatedClearanceStatus(state, clearance);
    const autoReason = automaticHoldReason(state, clearance);
    const invalidatesGovernmentApproval = clearance.decision === 'GOVERNMENT_VERIFIED' && calculated !== 'VERIFIED';
    return {
      ...clearance,
      status: calculated,
      evidenceScore: evidence.score,
      decision: invalidatesGovernmentApproval ? 'AUTO' as const : clearance.decision,
      holdReason: calculated === 'ON_HOLD'
        ? (clearance.decision === 'GOVERNMENT_HOLD' || clearance.decision === 'CLARIFICATION' ? clearance.holdReason : autoReason)
        : calculated === 'PENDING' ? autoReason : undefined,
      lastCalculatedAt: new Date().toISOString()
    };
  });
  return { ...state, clearances };
}

function idDate(date: string) {
  return date.replaceAll('-', '');
}

function periodLabel(date: string) {
  const parsed = new Date(`${date}T00:00:00+07:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(parsed);
}

export function ensureClearanceForDistribution(state: AppState, distribution: Distribution): AppState {
  const found = state.clearances.find((c) => c.distributionIds?.includes(distribution.id));
  if (found) return recalculateClearances(state);

  const latestAmount = state.clearances.find((c) => c.sppg === distribution.sppg && c.amount > 0)?.amount ?? 0;
  const clearance: Clearance = {
    id: `CLR-${idDate(distribution.date)}-${String(state.clearances.length + 1).padStart(3, '0')}`,
    sppg: distribution.sppg,
    school: distribution.school,
    period: periodLabel(distribution.date),
    periodDate: distribution.date,
    distributionIds: [distribution.id],
    amount: latestAmount,
    evidenceScore: 0,
    status: 'PENDING',
    decision: 'AUTO'
  };
  return recalculateClearances({ ...state, clearances: [clearance, ...state.clearances] });
}

export function claimForClearance(state: AppState, clearanceId: string): Claim | undefined {
  return state.claims.find((claim) => claim.clearanceId === clearanceId);
}

export function reopenClaimsAfterResolution(state: AppState): AppState {
  const clearancesById = new Map(state.clearances.map((c) => [c.id, c]));
  const claims = state.claims.map((claim) => {
    const clearance = clearancesById.get(claim.clearanceId);
    if (!clearance) return claim;
    if (clearance.status === 'ELIGIBLE' && ['ON_HOLD', 'UNDER_REVIEW'].includes(claim.status)) {
      return { ...claim, status: 'UNDER_REVIEW' as const, note: 'Temuan telah diselesaikan. Menunggu review ulang pengawas.' };
    }
    if (clearance.status === 'ON_HOLD' && claim.status === 'SUBMITTED') {
      return { ...claim, status: 'ON_HOLD' as const, note: clearance.holdReason || 'Klaim ditahan karena terdapat temuan aktif.' };
    }
    return claim;
  });
  return { ...state, claims };
}

function workflowAudit(actor: string, role: 'vendor'|'government', action: string, entity: string, entityId: string, oldStatus?: string, newStatus?: string) {
  return {
    id: `LOG-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    timestamp: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
    actor,
    role,
    action,
    entity,
    entityId,
    oldStatus,
    newStatus
  } as AppState['auditLogs'][number];
}

export function submitClaimForClearance(state: AppState, clearanceId: string, amount: number, actor: string): AppState {
  const clearance = state.clearances.find((c) => c.id === clearanceId);
  if (!clearance || !['ELIGIBLE', 'VERIFIED'].includes(clearance.status)) return state;
  if (state.claims.some((claim) => claim.clearanceId === clearanceId)) return state;
  if (!Number.isFinite(amount) || amount <= 0) return state;

  const id = `CLM-${Date.now()}`;
  const claim: Claim = {
    id,
    clearanceId,
    sppg: clearance.sppg,
    period: clearance.period,
    amount,
    status: clearance.status === 'VERIFIED' ? 'READY_FOR_PAYMENT' : 'SUBMITTED',
    submittedAt: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
  };

  return {
    ...state,
    claims: [claim, ...state.claims],
    clearances: state.clearances.map((c) => c.id === clearanceId ? { ...c, amount } : c),
    auditLogs: [workflowAudit(actor, 'vendor', 'CLAIM_SUBMITTED', 'Claim', id, 'DRAFT', claim.status), ...state.auditLogs]
  };
}

export function decideClearanceWorkflow(
  state: AppState,
  clearanceId: string,
  kind: 'approve'|'hold'|'clarify',
  actor: string,
  note = ''
): AppState {
  const clearance = state.clearances.find((c) => c.id === clearanceId);
  if (!clearance) return state;
  const evidence = clearanceEvidence(state, clearance);
  const claim = claimForClearance(state, clearanceId);
  if (!claim) return state;
  if (kind === 'approve' && (!evidence.allRequiredComplete || evidence.blockingAnomalies.length > 0)) return state;

  const status: Clearance['status'] = kind === 'approve' ? 'VERIFIED' : 'ON_HOLD';
  const decision: NonNullable<Clearance['decision']> = kind === 'approve' ? 'GOVERNMENT_VERIFIED' : kind === 'hold' ? 'GOVERNMENT_HOLD' : 'CLARIFICATION';
  const reason = kind === 'approve' ? undefined : (note.trim() || (kind === 'hold' ? 'Klaim ditahan untuk pemeriksaan lanjutan.' : 'Vendor diminta memberikan klarifikasi tambahan.'));
  const claimStatus: Claim['status'] = kind === 'approve' ? 'READY_FOR_PAYMENT' : kind === 'hold' ? 'ON_HOLD' : 'UNDER_REVIEW';
  const reviewedAt = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  return {
    ...state,
    clearances: state.clearances.map((c) => c.id === clearanceId ? { ...c, status, decision, holdReason: reason, decisionNote: note.trim() || undefined } : c),
    claims: state.claims.map((c) => c.clearanceId === clearanceId ? { ...c, status: claimStatus, reviewedAt, note: reason || 'Clearance disetujui. Klaim siap diproses pembayaran.' } : c),
    auditLogs: [
      workflowAudit(actor, 'government', kind === 'approve' ? 'CLEARANCE_APPROVED' : kind === 'hold' ? 'CLEARANCE_HELD' : 'CLEARANCE_CLARIFICATION_REQUESTED', 'Clearance', clearanceId, clearance.status, status),
      workflowAudit(actor, 'government', kind === 'approve' ? 'CLAIM_READY_FOR_PAYMENT' : kind === 'hold' ? 'CLAIM_HELD' : 'CLAIM_CLARIFICATION_REQUESTED', 'Claim', claim.id, claim.status, claimStatus),
      ...state.auditLogs
    ]
  };
}

export function resolveAnomalyWorkflow(state: AppState, anomalyId: string, actor: string, resolutionNote: string): AppState {
  const anomaly = state.anomalies.find((a) => a.id === anomalyId);
  if (!anomaly) return state;
  const anomalies = state.anomalies.map((a) => a.id === anomalyId ? { ...a, status: 'RESOLVED' as const, resolutionNote } : a);
  const remaining = anomalies.some((a) => a.distributionId === anomaly.distributionId && !['RESOLVED', 'CLOSED'].includes(a.status));
  let next: AppState = {
    ...state,
    anomalies,
    distributions: state.distributions.map((d) => d.id === anomaly.distributionId && !remaining ? { ...d, status: 'VALIDATED' as const } : d),
    auditLogs: [workflowAudit(actor, 'government', 'ANOMALY_RESOLVED', 'Anomaly', anomalyId, anomaly.status, 'RESOLVED'), ...state.auditLogs]
  };
  next = recalculateClearances(next);
  next = reopenClaimsAfterResolution(next);
  return next;
}
