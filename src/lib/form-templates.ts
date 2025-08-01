// Form templates moved to separate file for better performance
export interface FormField {
  id: string
  label: string
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file'
  required?: boolean
  placeholder?: string
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  conditional?: {
    dependsOn?: string
    value?: string
    action?: 'show' | 'hide'
  }
}

export interface FormTemplate {
  id: string
  name: string
  description: string
  category: string
  fields: FormField[]
  icon: string
}

// Reduced to essential templates for faster loading
export const formTemplates: FormTemplate[] = [
  {
    id: 'property-valuation',
    name: 'Property Valuation Form',
    description: 'Standard form for property valuation requests',
    category: 'valuation',
    icon: '🏠',
    fields: [
      { id: 'property-address', label: 'Property Address', type: 'textarea', required: true },
      { id: 'property-type', label: 'Property Type', type: 'select', required: true, options: ['Residential', 'Commercial', 'Industrial', 'Land'] },
      { id: 'property-size', label: 'Property Size (sq ft)', type: 'number', required: true },
      { id: 'purpose', label: 'Valuation Purpose', type: 'select', required: true, options: ['Sale', 'Purchase', 'Mortgage', 'Insurance', 'Legal'] },
    ]
  },
  {
    id: 'legal-consultation',
    name: 'Legal Consultation Form',
    description: 'Form for legal consultation requests',
    category: 'legal',
    icon: '⚖️',
    fields: [
      { id: 'client-name', label: 'Client Name', type: 'text', required: true },
      { id: 'case-type', label: 'Case Type', type: 'select', required: true, options: ['Property', 'Contract', 'Corporate', 'Family', 'Criminal'] },
      { id: 'case-description', label: 'Case Description', type: 'textarea', required: true },
      { id: 'urgency', label: 'Urgency Level', type: 'select', required: true, options: ['Standard', 'Urgent', 'Emergency'] },
    ]
  },
  {
    id: 'banking-application',
    name: 'Banking Application Form',
    description: 'Form for banking service applications',
    category: 'banking',
    icon: '🏦',
    fields: [
      { id: 'applicant-name', label: 'Applicant Name', type: 'text', required: true },
      { id: 'service-type', label: 'Service Type', type: 'select', required: true, options: ['Loan', 'Account Opening', 'Credit Card', 'Investment'] },
      { id: 'amount', label: 'Amount', type: 'number', required: true },
      { id: 'income', label: 'Monthly Income', type: 'number', required: true },
    ]
  }
]

export const fieldTypes = [
  { value: 'text', label: 'Text Input', icon: '📝' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'number', label: 'Number', icon: '🔢' },
  { value: 'textarea', label: 'Text Area', icon: '📄' },
  { value: 'select', label: 'Dropdown', icon: '📋' },
  { value: 'checkbox', label: 'Checkbox', icon: '☑️' },
  { value: 'radio', label: 'Radio Button', icon: '🔘' },
  { value: 'date', label: 'Date Picker', icon: '📅' },
  { value: 'file', label: 'File Upload', icon: '📎' },
]