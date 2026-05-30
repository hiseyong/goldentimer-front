import type { ReactNode } from 'react'
import type { RegistrationFormData } from '../usePatientRegistration'

type RegistrationFormFieldsProps = {
  form: RegistrationFormData
  onChange: <K extends keyof RegistrationFormData>(
    key: K,
    value: RegistrationFormData[K],
  ) => void
}

const inputClass =
  'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

export function RegistrationFormFields({
  form,
  onChange,
}: RegistrationFormFieldsProps) {
  return (
    <div className="space-y-3">
      <Field label="Patient name">
        <input
          type="text"
          value={form.patientName}
          onChange={(e) => onChange('patientName', e.target.value)}
          className={inputClass}
          placeholder="Full name"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Age">
          <input
            type="number"
            min={0}
            value={form.age}
            onChange={(e) => onChange('age', e.target.value)}
            className={inputClass}
            placeholder="Age"
          />
        </Field>
        <Field label="Gender">
          <select
            value={form.gender}
            onChange={(e) => onChange('gender', e.target.value)}
            className={inputClass}
          >
            <option value="">Select</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="Other">Other</option>
          </select>
        </Field>
      </div>

      <Field label="Chief complaint (main symptoms)">
        <textarea
          value={form.chiefComplaint}
          onChange={(e) => onChange('chiefComplaint', e.target.value)}
          rows={2}
          className={inputClass}
        />
      </Field>

      <Field label="Onset time">
        <input
          type="text"
          value={form.onsetTime}
          onChange={(e) => onChange('onsetTime', e.target.value)}
          className={inputClass}
          placeholder="e.g. 30 minutes ago"
        />
      </Field>

      <Field label="Guardian contact">
        <input
          type="tel"
          value={form.guardianContact}
          onChange={(e) => onChange('guardianContact', e.target.value)}
          className={inputClass}
          placeholder="Phone number"
        />
      </Field>

      <Field label="Additional notes">
        <textarea
          value={form.additionalNotes}
          onChange={(e) => onChange('additionalNotes', e.target.value)}
          rows={2}
          className={inputClass}
          placeholder="Optional"
        />
      </Field>

      <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <input
          type="checkbox"
          checked={form.consentAccepted}
          onChange={(e) => onChange('consentAccepted', e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600"
        />
        <span className="text-xs leading-relaxed text-slate-600">
          I agree to the collection and use of personal information for emergency
          medical services. (Required)
        </span>
      </label>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  )
}
