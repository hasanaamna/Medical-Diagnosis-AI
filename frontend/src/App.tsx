
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
} from 'lucide-react'
import './App.css'

const API_URL = 'http://127.0.0.1:8000'

type FormData = {
  HighBP: number
  HighChol: number
  CholCheck: number
  BMI: number
  Smoker: number
  Stroke: number
  HeartDiseaseorAttack: number
  PhysActivity: number
  Fruits: number
  Veggies: number
  HvyAlcoholConsump: number
  AnyHealthcare: number
  NoDocbcCost: number
  GenHlth: number
  MentHlth: number
  PhysHlth: number
  DiffWalk: number
  Sex: number
  Age: number
  Education: number
  Income: number
}

type PredictionResult = {
  predicted_class: number
  estimated_probability: number
  model_name: string
  disclaimer: string
}

const initialForm: FormData = {
  HighBP: 0,
  HighChol: 0,
  CholCheck: 1,
  BMI: 25,
  Smoker: 0,
  Stroke: 0,
  HeartDiseaseorAttack: 0,
  PhysActivity: 1,
  Fruits: 1,
  Veggies: 1,
  HvyAlcoholConsump: 0,
  AnyHealthcare: 1,
  NoDocbcCost: 0,
  GenHlth: 2,
  MentHlth: 0,
  PhysHlth: 0,
  DiffWalk: 0,
  Sex: 0,
  Age: 8,
  Education: 5,
  Income: 6,
}

const binaryFields: {
  key: keyof FormData
  label: string
}[] = [
  { key: 'HighBP', label: 'High blood pressure' },
  { key: 'HighChol', label: 'High cholesterol' },
  { key: 'CholCheck', label: 'Cholesterol check in last 5 years' },
  { key: 'Smoker', label: 'Smoked at least 100 cigarettes' },
  { key: 'Stroke', label: 'History of stroke' },
  {
    key: 'HeartDiseaseorAttack',
    label: 'Heart disease or heart attack history',
  },
  { key: 'PhysActivity', label: 'Physical activity in past 30 days' },
  { key: 'Fruits', label: 'Consume fruit daily' },
  { key: 'Veggies', label: 'Consume vegetables daily' },
  { key: 'HvyAlcoholConsump', label: 'Heavy alcohol consumption' },
  { key: 'AnyHealthcare', label: 'Have healthcare coverage' },
  { key: 'NoDocbcCost', label: 'Could not see doctor due to cost' },
  { key: 'DiffWalk', label: 'Difficulty walking or climbing stairs' },
]

const selectFields: {
  key: keyof FormData
  label: string
  options: { label: string; value: number }[]
}[] = [
  {
    key: 'GenHlth',
    label: 'General health',
    options: [
      { label: 'Excellent', value: 1 },
      { label: 'Very good', value: 2 },
      { label: 'Good', value: 3 },
      { label: 'Fair', value: 4 },
      { label: 'Poor', value: 5 },
    ],
  },
  {
    key: 'Sex',
    label: 'Sex category used in source dataset',
    options: [
      { label: 'Female (0)', value: 0 },
      { label: 'Male (1)', value: 1 },
    ],
  },
  {
    key: 'Age',
    label: 'Age group (dataset code)',
    options: Array.from({ length: 13 }, (_, i) => ({
      label: `Category ${i + 1}`,
      value: i + 1,
    })),
  },
  {
    key: 'Education',
    label: 'Education level (dataset code)',
    options: Array.from({ length: 6 }, (_, i) => ({
      label: `Category ${i + 1}`,
      value: i + 1,
    })),
  },
  {
    key: 'Income',
    label: 'Income level (dataset code)',
    options: Array.from({ length: 8 }, (_, i) => ({
      label: `Category ${i + 1}`,
      value: i + 1,
    })),
  },
]

function App() {
  const [form, setForm] = useState<FormData>(initialForm)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const updateField = (key: keyof FormData, value: number) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }))
  }

  const handlePredict = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        const detail = data?.detail
        const message =
          typeof detail === 'string'
            ? detail
            : Array.isArray(detail)
              ? detail
                  .map((item: { msg?: string }) => item.msg ?? 'Invalid input')
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
          'Cannot connect to the API. Make sure FastAPI is running at http://127.0.0.1:8000 and CORS permits http://localhost:5173.',
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
    setForm(initialForm)
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
            <small>HEALTH INTELLIGENCE</small>
          </span>
        </a>

        <div className="nav-label">WORKSPACE</div>

        <nav className="nav-list">
          <a className="nav-item active" href="#dashboard">
            <LayoutDashboard size={18} />
            Dashboard
          </a>
          <a className="nav-item" href="#assessment">
            <ClipboardList size={18} />
            Risk assessment
          </a>
        </nav>

        <div className="sidebar-note">
          <ShieldCheck size={20} />
          <strong>Privacy first</strong>
          <p>
            Use sample information only. Do not submit identifiable or
            sensitive patient records.
          </p>
        </div>

        <div className="sidebar-footer">
          <Activity size={16} />
          Educational prototype
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> Dashboard
          </div>
          <div className="status-pill">
            <span />
            API prediction interface
          </div>
        </header>

        <section className="welcome">
          <div>
            <div className="eyebrow">
              <Stethoscope size={15} />
              HEALTH INDICATOR ANALYSIS
            </div>
            <h1>
              Diabetes Health
              <br />
              <span>Indicator Assessment</span>
            </h1>
            <p>
              Explore a machine-learning classification using health
              indicators from the BRFSS survey dataset.
            </p>
          </div>
          <div className="welcome-icon">
            <HeartPulse size={54} strokeWidth={1.3} />
          </div>
        </section>

        <div className="info-banner">
          <AlertCircle size={19} />
          <p>
            <strong>Important:</strong> This tool is for educational use only.
            It is not a diagnosis or a substitute for professional medical
            advice.
          </p>
        </div>

        <div className="section-heading" id="assessment">
          <div>
            <h2>Assessment inputs</h2>
            <p>Enter values using the source dataset's coding scheme.</p>
          </div>
          <div className="field-count">
            <UserRound size={16} />
            {Object.keys(form).length} indicators
          </div>
        </div>

        <form onSubmit={handlePredict}>
          <section className="form-card">
            <div className="card-heading">
              <span className="card-icon">
                <HeartPulse size={20} />
              </span>
              <div>
                <h3>Health history & lifestyle</h3>
                <p>Select Yes or No for each indicator.</p>
              </div>
            </div>

            <div className="binary-grid">
              {binaryFields.map(({ key, label }) => (
                <label className="binary-field" key={key}>
                  <span>{label}</span>
                  <select
                    value={form[key]}
                    onChange={(event) =>
                      updateField(key, Number(event.target.value))
                    }
                  >
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
                <h3>Health & demographic indicators</h3>
                <p>Use the numeric categories supported by the API.</p>
              </div>
            </div>

            <div className="detail-grid">
              <label className="binary-field">
                <span>Body Mass Index (BMI)</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  value={form.BMI}
                  required
                  onChange={(event) =>
                    updateField('BMI', Number(event.target.value))
                  }
                />
              </label>

              <label className="binary-field">
                <span>Mental health days (past 30)</span>
                <input
                  type="number"
                  min={0}
                  max={30}
                  step={1}
                  value={form.MentHlth}
                  required
                  onChange={(event) =>
                    updateField('MentHlth', Number(event.target.value))
                  }
                />
              </label>

              <label className="binary-field">
                <span>Physical health days (past 30)</span>
                <input
                  type="number"
                  min={0}
                  max={30}
                  step={1}
                  value={form.PhysHlth}
                  required
                  onChange={(event) =>
                    updateField('PhysHlth', Number(event.target.value))
                  }
                />
              </label>

              {selectFields.map(({ key, label, options }) => (
                <label className="binary-field" key={key}>
                  <span>{label}</span>
                  <select
                    value={form[key]}
                    onChange={(event) =>
                      updateField(key, Number(event.target.value))
                    }
                  >
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </section>

          <div className="form-actions">
            <button
              className="reset-button"
              type="button"
              onClick={resetForm}
              disabled={loading}
            >
              <RotateCcw size={17} />
              Reset inputs
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
              {loading ? 'Analyzing…' : 'Run prediction'}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-panel" role="alert">
            <AlertCircle size={20} />
            <div>
              <strong>Prediction unavailable</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {result && (
          <section className="result-card" aria-live="polite">
            <div className="result-title">
              <div>
                <div className="eyebrow">MODEL OUTPUT</div>
                <h2>Prediction result</h2>
              </div>
              <span className="result-chip">Experimental</span>
            </div>

            <div className="result-body">
              <div className="result-symbol">
                <HeartPulse size={30} />
              </div>

              <div className="result-main">
                <span>Predicted dataset category</span>
                <strong>
                  {result.predicted_class === 1
                    ? 'Positive class (1)'
                    : 'Negative class (0)'}
                </strong>
                <p>This classification is not a medical diagnosis.</p>
              </div>

              {probability !== null && (
                <div className="probability">
                  <span>Estimated probability</span>
                  <strong>{probability.toFixed(1)}%</strong>
                  <div
                    className="progress"
                    role="progressbar"
                    aria-label="Model estimated probability"
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
              {result.model_name && (
                <p>
                  <strong>Model:</strong> {result.model_name}
                </p>
              )}
              <p>
                <strong>Disclaimer:</strong>{' '}
                {result.disclaimer ||
                  'This model is for educational purposes only and is not clinically validated.'}
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
