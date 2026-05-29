export type LabResultLine = {
  name: string
  value: string
  unit: string
  range: string
  flag: 'normal' | 'high' | 'low'
}

const CATEGORY_TEMPLATES: Record<string, LabResultLine[]> = {
  Hematology: [
    { name: 'Hemoglobin', value: '13.4', unit: 'g/dL', range: '12.0–15.5', flag: 'normal' },
    { name: 'WBC Count', value: '7.2', unit: '×10³/µL', range: '4.0–11.0', flag: 'normal' },
    { name: 'Platelets', value: '245', unit: '×10³/µL', range: '150–400', flag: 'normal' },
    { name: 'Hematocrit', value: '40.1', unit: '%', range: '36–46', flag: 'normal' }
  ],
  Chemistry: [
    { name: 'Fasting Glucose', value: '92', unit: 'mg/dL', range: '70–99', flag: 'normal' },
    { name: 'Creatinine', value: '0.9', unit: 'mg/dL', range: '0.6–1.2', flag: 'normal' },
    { name: 'ALT', value: '22', unit: 'U/L', range: '7–56', flag: 'normal' },
    { name: 'Total Cholesterol', value: '185', unit: 'mg/dL', range: '<200', flag: 'normal' }
  ],
  Microbiology: [
    { name: 'Culture Result', value: 'No growth', unit: '', range: 'Negative', flag: 'normal' },
    { name: 'Sensitivity Panel', value: 'Not indicated', unit: '', range: '—', flag: 'normal' }
  ],
  Imaging: [
    { name: 'Study Type', value: 'Diagnostic imaging', unit: '', range: '—', flag: 'normal' },
    { name: 'Impression', value: 'No acute findings', unit: '', range: '—', flag: 'normal' }
  ]
}

const DEFAULT_TEMPLATE: LabResultLine[] = [
  { name: 'Primary Result', value: 'Within expected limits', unit: '', range: 'Reference on file', flag: 'normal' },
  { name: 'Secondary Marker', value: 'Not elevated', unit: '', range: '—', flag: 'normal' }
]

export function isPendingStatus(status: string) {
  const s = status.toLowerCase()
  return s === 'pending' || s.includes('pending')
}

export function buildDefaultResultDetails(category: string): LabResultLine[] {
  return CATEGORY_TEMPLATES[category] || DEFAULT_TEMPLATE
}

export function buildDefaultInterpretation(testName: string, category: string) {
  return `Results for ${testName} (${category}) are within expected clinical ranges. Discuss any concerns with your care team at your next visit.`
}

export function enrichLabRecord(lab: {
  testName: string
  category: string
  status: string
  findings?: string | null
  interpretation?: string | null
  resultDetails?: unknown
}) {
  const pending = isPendingStatus(lab.status)

  let lines: LabResultLine[] = []
  if (!pending) {
    if (Array.isArray(lab.resultDetails)) {
      lines = lab.resultDetails as LabResultLine[]
    } else {
      lines = buildDefaultResultDetails(lab.category)
    }
  }

  return {
    pending,
    lines,
    findings: lab.findings || null,
    interpretation:
      lab.interpretation
      || (!pending ? buildDefaultInterpretation(lab.testName, lab.category) : null)
  }
}
