
import { useState, type FormEvent } from 'react'
import {
  Activity,
  HeartPulse,
  LayoutDashboard,
  ClipboardList,
  ShieldCheck,
  Stethoscope,
  UserRound,
  AlertCircle,
  LoaderCircle,
  RotateCcw,
  Info,
} from 'lucide-react'
import './App.css'

const API_URL = 'http://127.0.0.1:8000'

type FormData = {
  HighBP: number | null
  HighChol: number | null
  CholCheck: number | null
  BMI: number | null
  Smoker: number | null
  Stroke: number | null
  HeartDiseaseorAttack: number | null
  PhysActivity: number | null
  Fruits: number | null
  Veggies: number | null
  HvyAlcoholConsump: number | null
  AnyHealthcare: number | null
  NoDocbcCost: number | null
  GenHlth: number | null
  MentHlth: number | null
  PhysHlth: number | null
  DiffWalk: number | null
  Sex: number | null
  Age: number | null
  Education: number | null
  Income: number | null
}

type PredictionPayload = {
  [K in keyof FormData]: number
}

type PredictionResult = {
  predicted_class: number
  estimated_probability: number
  model_name: string
  disclaimer: string
}

const initialForm: FormData = {
  HighBP: null,
  HighChol: null,
  CholCheck: null,
  BMI: null,
  Smoker: null,
  Stroke: null,
  HeartDiseaseorAttack: null,
  PhysActivity: null,
  Fruits: null,
  Veggies: null,
  HvyAlcoholConsump: null,
  AnyHealthcare: null,
  NoDocbcCost: null,
  GenHlth: null,
  MentHlth: null,
  PhysHlth: null,
  DiffWalk: null,
  Sex: null,
  Age: null,
  Education: null,
  Income: null,
}

const binaryFields: {
  key: keyof FormData
  label: string
  description: string
}[] = [
  {
    key: 'HighBP',
    label: 'Have you ever been told you have high blood pressure?',
    description: 'Include a diagnosis from a healthcare professional.',
  },
  {
    key: 'HighChol',
    label: 'Have you ever been told you have high cholesterol?',
    description: 'Answer based on what you have been told by a professional.',
  },
  {
    key: 'CholCheck',
    label: 'Have you had your cholesterol checked in the past 5 years?',
    description: 'A blood test or health screening counts.',
  },
  {
    key: 'Smoker',
    label: 'Have you smoked at least 100 cigarettes in your lifetime?',
    description: 'This is a lifetime total, not just your current smoking.',
  },
  {
    key: 'Stroke',
    label: 'Have you ever had a stroke?',
    description: 'Use a diagnosis or medical history you know about.',
  },
  {
    key: 'HeartDiseaseorAttack',
    label: 'Have you ever had coronary heart disease or a heart attack?',
    description: 'Select Yes if either applies.',
  },
  {
    key: 'PhysActivity',
    label: 'Have you done physical activity outside your regular job in the past 30 days?',
    description: 'For example, walking, exercise, gardening, or sports.',
  },
  {
    key: 'Fruits',
    label: 'Do you consume fruit at least once a day?',
    description: 'Think about your usual eating habits.',
  },
  {
    key: 'Veggies',
    label: 'Do you consume vegetables at least once a day?',
    description: 'Think about your usual eating habits.',
  },
  {
    key: 'HvyAlcoholConsump',
    label: 'Does the survey definition of heavy alcohol consumption apply to you?',
    description:
      'This is a specific dataset category. If unsure, do not guess.',
  },
  {
    key: 'AnyHealthcare',
    label: 'Do you have any form of healthcare coverage?',
    description: 'For example, health insurance or another healthcare plan.',
  },
  {
    key: 'NoDocbcCost',
    label: 'Was there a time in the past 12 months when cost stopped you seeing a doctor?',
    description: 'Consider cost of consultation, tests, or treatment.',
  },
  {
    key: 'DiffWalk',
    label: 'Do you have serious difficulty walking or climbing stairs?',
    description: 'Choose the answer that best describes your situation.',
  },
]

const generalHealthOptions = [
  { label: 'Excellent', value: 1 },
  { label: 'Very good', value: 2 },
  { label: 'Good', value: 3 },
  { label: 'Fair', value: 4 },
  { label: 'Poor', value: 5 },
]

const ageOptions = [
  { label: '18–24 years', value: 1 },
  { label: '25–29 years', value: 2 },
  { label: '30–34 years', value: 3 },
  { label: '35–39 years', value: 4 },
  { label: '40–44 years', value: 5 },
  { label: '45–49 years', value: 6 },
  { label: '50–54 years', value: 7 },
  { label: '55–59 years', value: 8 },
  { label: '60–64 years', value: 9 },
  { label: '65–69 years', value: 10 },
  { label: '70–74 years', value: 11 },
  { label: '75–79 years', value: 12 },
  { label: '80 years or older', value: 13 },
]

const educationOptions = [
  { label: 'Never attended school or only kindergarten', value: 1 },
  { label: 'Grades 1–8', value: 2 },
  { label: 'Grades 9–11', value: 3 },
  { label: 'Grade 12 or GED', value: 4 },
  { label: 'College: 1–3 years', value: 5 },
  { label: 'College: 4 years or more', value: 6 },
]

const incomeOptions = [
  { label: 'Less than $10,000', value: 1 },
  { label: '$10,000 to less than $15,000', value: 2 },
  { label: '$15,000 to less than $20,000', value: 3 },
  { label: '$20,000 to less than $25,000', value: 4 },
  { label: '$25,000 to less than $35,000', value: 5 },
  { label: '$35,000 to less than $50,000', value: 6 },
  { label: '$50,000 to less than $75,000', value: 7 },
  { label: '$75,000 or more', value: 8 },
]

function App() {
  const [form, setForm] = useState<FormData>({ ...initialForm })
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const updateField = (key: keyof FormData, value: number | null) => {
    setForm((previous) => ({ ...previous, [key]: value }))
    setError('')
  }

  const handlePredict = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setResult(null)

    const unanswered = Object.entries(form).filter(
      ([, value]) => value === null || !Number.isFinite(value),
    )

    if (unanswered.length > 0) {
      setError('Please complete all 21 questions before continuing.')
      return
    }

    if (
      form.BMI === null ||
      form.BMI < 1 ||
      form.BMI > 100 ||
      !Number.isInteger(form.BMI)
    ) {
      setError('Please enter a valid BMI between 1 and 100.')
      return
    }

    if (
      form.MentHlth === null ||
      form.MentHlth < 0 ||
      form.MentHlth > 30 ||
      !Number.isInteger(form.MentHlth) ||
      form.PhysHlth === null ||
      form.PhysHlth < 0 ||
      form.PhysHlth > 30 ||
      !Number.isInteger(form.PhysHlth)
    ) {
      setError('Health-day values must be whole numbers between 0 and 30.')
      return
    }

    const payload = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, value as number]),
    ) as PredictionPayload

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        const detail = data?.detail
        const message =
          typeof detail === 'string'
            ? detail
            : Array.isArray(detail)
              ? detail
                  .map(
                    (item: { msg?: string }) =>
                      item.msg ?? 'Invalid input',
                  )
                  .join(', ')
              : 'The prediction request failed.'

        throw new Error(message)
      }

      if (
        typeof data?.predicted_class !== 'number' ||
        typeof data?.estimated_probability !== 'number'
      ) {
        throw new Error('The API returned an unexpected response format.')
      }

      setResult(data as PredictionResult)
    } catch (err) {
      if (err instanceof TypeError) {
        setError(
          'Cannot connect to the API. Make sure the backend is running at http://127.0.0.1:8000.',
        )
      } else {
        setError(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({ ...initialForm })
    setResult(null)
    setError('')
  }

  const probability =
    result && Number.isFinite(result.estimated_probability)
      ? Math.max(0, Math.min(100, result.estimated_probability * 100))
      : null

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#dashboard">
          <span className="brand-icon">
            <HeartPulse size={24} />
          </span>
          <span>
            Med<span className="brand-accent">AI</span>
            <small>HEALTH INDICATOR EXPLORER</small>
          </span>
        </a>

        <div className="nav-label">WORKSPACE</div>

        <nav className="nav-list">
          <a className="nav-item active" href="#dashboard">
            <LayoutDashboard size={18} /> Dashboard
          </a>
          <a className="nav-item" href="#assessment">
            <ClipboardList size={18} /> Health questionnaire
          </a>
        </nav>

        <div className="sidebar-note">
          <ShieldCheck size={20} />
          <strong>Protect your privacy</strong>
          <p>
            Use sample information only. Do not enter names or identifying
            patient details.
          </p>
        </div>

        <div className="sidebar-footer">
          <Activity size={16} /> Educational prototype
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> Dashboard
          </div>
          <div className="status-pill">
            <span /> API prediction interface
          </div>
        </header>

        <section className="welcome">
          <div>
            <div className="eyebrow">
              <Stethoscope size={15} /> HEALTH INDICATOR EXPLORER
            </div>
            <h1>
              Understand your
              <br />
              <span>health indicators</span>
            </h1>
            <p>
              Answer simple questions about health and lifestyle to explore
              how a machine-learning model classifies survey responses.
            </p>
          </div>
          <div className="welcome-icon">
            <HeartPulse size={54} strokeWidth={1.3} />
          </div>
        </section>

        <div className="info-banner">
          <AlertCircle size={19} />
          <p>
            <strong>Educational use only.</strong> This tool does not diagnose
            diabetes, estimate your personal medical risk reliably, or replace
            professional medical advice.
          </p>
        </div>

        <div className="section-heading" id="assessment">
          <div>
            <h2>Health questionnaire</h2>
            <p>
              Complete every field. You can reset the form at any time.
            </p>
          </div>
          <div className="field-count">
            <UserRound size={16} /> {Object.keys(form).length} questions
          </div>
        </div>

        <form onSubmit={handlePredict}>
          <section className="form-card">
            <div className="card-heading">
              <span className="card-icon">
                <HeartPulse size={20} />
              </span>
              <div>
                <h3>Health history and daily habits</h3>
                <p>
                  Select an answer for every question. No answers are
                  preselected.
                </p>
              </div>
            </div>

            <div className="binary-grid">
              {binaryFields.map(({ key, label, description }) => (
                <label className="binary-field" key={key}>
                  <span>{label}</span>
                  <small>{description}</small>
                  <select
                    value={form[key] ?? ''}
                    required
                    onChange={(event) =>
                      updateField(
                        key,
                        event.target.value === ''
                          ? null
                          : Number(event.target.value),
                      )
                    }
                  >
                    <option value="">Select an option</option>
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </label>
              ))}
            </div>
          </section>

          <section className="form-card">
            <div className="card-heading">
              <span className="card-icon">
                <Activity size={20} />
              </span>
              <div>
                <h3>About your health and background</h3>
                <p>
                  Choose your answers using the descriptions provided.
                </p>
              </div>
            </div>

            <div className="detail-grid">
              <label className="binary-field">
                <span>Body Mass Index (BMI)</span>
                <small>
                  Enter your BMI if known. BMI is weight in kg divided by
                  height in metres squared.
                </small>
                <input
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  value={form.BMI ?? ''}
                  placeholder="Enter BMI"
                  required
                  onChange={(event) =>
                    updateField(
                      'BMI',
                      event.target.value === ''
                        ? null
                        : Number(event.target.value),
                    )
                  }
                />
              </label>

              <label className="binary-field">
                <span>Days of poor mental health</span>
                <small>
                  During the past 30 days, how many days was your mental
                  health not good?
                </small>
                <input
                  type="number"
                  min={0}
                  max={30}
                  step={1}
                  value={form.MentHlth ?? ''}
                  placeholder="0–30 days"
                  required
                  onChange={(event) =>
                    updateField(
                      'MentHlth',
                      event.target.value === ''
                        ? null
                        : Number(event.target.value),
                    )
                  }
                />
              </label>

              <label className="binary-field">
                <span>Days of poor physical health</span>
                <small>
                  During the past 30 days, how many days was your physical
                  health not good?
                </small>
                <input
                  type="number"
                  min={0}
                  max={30}
                  step={1}
                  value={form.PhysHlth ?? ''}
                  placeholder="0–30 days"
                  required
                  onChange={(event) =>
                    updateField(
                      'PhysHlth',
                      event.target.value === ''
                        ? null
                        : Number(event.target.value),
                    )
                  }
                />
              </label>

              <label className="binary-field">
                <span>How would you rate your general health?</span>
                <small>Choose your overall view of your health.</small>
                <select
                  value={form.GenHlth ?? ''}
                  required
                  onChange={(event) =>
                    updateField(
                      'GenHlth',
                      event.target.value === ''
                        ? null
                        : Number(event.target.value),
                    )
                  }
                >
                  <option value="">Select an option</option>
                  {generalHealthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="binary-field">
                <span>Sex category in the source survey</span>
                <small>
                  This field reflects the original dataset's two categories.
                </small>
                <select
                  value={form.Sex ?? ''}
                  required
                  onChange={(event) =>
                    updateField(
                      'Sex',
                      event.target.value === ''
                        ? null
                        : Number(event.target.value),
                    )
                  }
                >
                  <option value="">Select an option</option>
                  <option value={0}>Female</option>
                  <option value={1}>Male</option>
                </select>
              </label>

              <label className="binary-field">
                <span>What is your age group?</span>
                <small>Select the range that includes your age.</small>
                <select
                  value={form.Age ?? ''}
                  required
                  onChange={(event) =>
                    updateField(
                      'Age',
                      event.target.value === ''
                        ? null
                        : Number(event.target.value),
                    )
                  }
                >
                  <option value="">Select an option</option>
                  {ageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="binary-field">
                <span>
                  What is the highest level of education you completed?
                </span>
                <small>Choose the closest matching education category.</small>
                <select
                  value={form.Education ?? ''}
                  required
                  onChange={(event) =>
                    updateField(
                      'Education',
                      event.target.value === ''
                        ? null
                        : Number(event.target.value),
                    )
                  }
                >
                  <option value="">Select an option</option>
                  {educationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="binary-field">
                <span>What is your annual household income?</span>
                <small>
                  These ranges are in US dollars because the source survey is
                  from the United States.
                </small>
                <select
                  value={form.Income ?? ''}
                  required
                  onChange={(event) =>
                    updateField(
                      'Income',
                      event.target.value === ''
                        ? null
                        : Number(event.target.value),
                    )
                  }
                >
                  <option value="">Select an option</option>
                  {incomeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="helper-note">
              <Info size={18} />
              <p>
                Some answers use categories from the original US survey. If a
                question does not fit your circumstances or you do not know
                the answer, this prototype may not be appropriate for your use.
              </p>
            </div>
          </section>

          <div className="form-actions">
            <button
              className="reset-button"
              type="button"
              onClick={resetForm}
              disabled={loading}
            >
              <RotateCcw size={17} /> Reset answers
            </button>
            <button
              className="predict-button"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <LoaderCircle className="spin" size={18} />
              ) : (
                <Activity size={18} />
              )}
              {loading ? 'Processing…' : 'Explore model output'}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-panel" role="alert">
            <AlertCircle size={20} />
            <div>
              <strong>Unable to get model output</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {result && (
          <section className="result-card" aria-live="polite">
            <div className="result-title">
              <div>
                <div className="eyebrow">EXPERIMENTAL MODEL OUTPUT</div>
                <h2>Classification result</h2>
              </div>
              <span className="result-chip">Educational only</span>
            </div>

            <div className="result-body">
              <div className="result-symbol">
                <HeartPulse size={30} />
              </div>
              <div className="result-main">
                <span>Predicted survey category</span>
                <strong>
                  {result.predicted_class === 1
                    ? 'Positive class (1)'
                    : 'Negative class (0)'}
                </strong>
                <p>
                  This is a classification of survey data, not a medical
                  diagnosis.
                </p>
              </div>

              {probability !== null && (
                <div className="probability">
                  <span>Model output score (not personal medical risk)</span>
                  <strong>{probability.toFixed(1)}%</strong>
                  <div
                    className="progress"
                    role="progressbar"
                    aria-label="Model output score"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(probability)}
                  >
                    <span style={{ width: `${probability}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div className="result-metadata">
              <p>
                <strong>Model:</strong> {result.model_name}
              </p>
              <p>
                <strong>Important:</strong> {result.disclaimer}
              </p>
            </div>
          </section>
        )}

        <footer className="page-footer">
          MedAI · Educational machine-learning prototype · Not for clinical
          decision-making
        </footer>
      </main>
    </div>
  )
}

export default App
