export interface SafetyReference {
  industry: string;
  regional: string;
  coaching: string;
  threshold?: string;
}

const REFERENCES: Record<string, SafetyReference> = {
  'Harsh Braking': {
    industry: 'Unsafe driving indicators — harsh braking frequency is a primary predictor of rear-end collision risk; drivers above 8 events per 30 days require formal intervention.',
    regional: 'Highway code — minimum following distances in adverse weather; wet-road stopping distance increases significantly.',
    coaching: 'Schedule defensive driving refresher within 5 days. Emphasise extended following distance in wet conditions. Inspect brake system if maintenance is overdue.',
    threshold: '8 harsh braking events / 30 days',
  },
  'Harsh Acceleration': {
    industry: 'Unsafe driving indicators — harsh acceleration events correlate with loss-of-control and cargo shift incidents in heavy commercial vehicles.',
    regional: 'Commercial haulage standards — smooth acceleration is required; aggressive throttle use is documented unsafe driving behaviour.',
    coaching: 'Review smooth acceleration technique in next coaching session. Check if schedule pressure or dispatch deadlines are causing aggressive driving.',
    threshold: '6 harsh acceleration events / 30 days',
  },
  Overspeeding: {
    industry: 'Speed violations require documentation at first offence; repeat violations within 14 days elevate to formal carrier safety review.',
    regional: 'Speed monitoring guidelines — urban and highway corridor limits apply; tiered overspeed triggers graduated enforcement.',
    coaching: 'Document event and conduct pre-shift speed limit briefing. Second event within 14 days triggers formal review with fleet safety officer.',
    threshold: '3 speeding events / 14 days',
  },
  'Overspeed Tiered': {
    industry: 'Tiered overspeed events indicate sustained speed non-compliance beyond a momentary lapse.',
    regional: 'Graduated penalties apply for sustained overspeed in commercial fleet operations.',
    coaching: 'Immediate speed compliance coaching required. Review route scheduling to eliminate time-pressure incentives for speeding.',
    threshold: '2 tiered overspeed events / 14 days',
  },
  Panic: {
    industry: 'Panic activations require documented incident review and near-miss classification.',
    regional: 'Emergency response protocol — panic events mandate supervisor contact within 1 hour and incident filing within 24 hours.',
    coaching: 'Supervisor must contact driver within 1 hour. Conduct incident interview within 24 hours. File record before next assignment.',
    threshold: 'Any panic event',
  },
  'Excessive Idling': {
    industry: 'Engine-on idle periods exceeding 5 minutes should be logged under fuel efficiency and emissions tracking.',
    regional: 'Idle reduction policies — engine-off protocol recommended during stationary queues exceeding 10 minutes where safe.',
    coaching: 'Review operational context before coaching. If queue idling, escalate to operations for scheduling optimisation rather than driver sanction.',
    threshold: '20 minutes continuous idle',
  },
};

export function lookupSafetyReference(label?: string, type?: string): SafetyReference | null {
  if (label && REFERENCES[label]) return REFERENCES[label];
  if (type === 'panic') return REFERENCES.Panic;
  return null;
}

export function formatReferenceForPrompt(ref: SafetyReference): string {
  return `Industry standard: ${ref.industry}\nRegional standard: ${ref.regional}\nCoaching baseline: ${ref.coaching}${ref.threshold ? `\nIntervention threshold: ${ref.threshold}` : ''}`;
}

export function formatReferenceForDisplay(ref: SafetyReference): string {
  return `Industry: ${ref.industry} Regional: ${ref.regional}`;
}
