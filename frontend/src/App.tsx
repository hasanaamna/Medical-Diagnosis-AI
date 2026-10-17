
import { useState, useEffect, type FormEvent } from 'react'
import {
  Activity, HeartPulse, LayoutDashboard, ClipboardList, ShieldCheck,
  Stethoscope, UserRound, AlertCircle, LoaderCircle, RotateCcw,
  Info, ArrowUpRight, Database, BrainCircuit, CheckCircle2,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts'
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

type PredictionResult = {
  predicted_class: number
  estimated_probability: number
  model_name: string
  disclaimer: string
}

const initialForm: FormData = {
  HighBP: null, HighChol: null, CholCheck: null, BMI: null,
  Smoker: null, Stroke: null, HeartDiseaseorAttack: null,
  PhysActivity: null, Fruits: null, Veggies: null,
  HvyAlcoholConsump: null, AnyHealthcare: null, NoDocbcCost: null,
  GenHlth: null, MentHlth: null, PhysHlth: null, DiffWalk: null,
  Sex: null, Age: null, Education: null, Income: null,
}

const binaryFields: {
  key: keyof FormData
  label: string
  description: string
}[] = [
  { key: 'HighBP', label: 'Have you ever been told you have high blood pressure?', description: 'Based on a professional diagnosis.' },
  { key: 'HighChol', label: 'Have you ever been told you have high cholesterol?', description: 'Based on what a healthcare professional told you.' },
  { key: 'CholCheck', label: 'Have you had your cholesterol checked in the past 5 years?', description: 'A blood test or health screening counts.' },
  { key: 'Smoker', label: 'Have you smoked at least 100 cigarettes in your lifetime?', description: 'This is a lifetime total.' },
  { key: 'Stroke', label: 'Have you ever had a stroke?', description: 'Use your known medical history.' },
  { key: 'HeartDiseaseorAttack', label: 'Have you had coronary heart disease or a heart attack?', description: 'Select Yes if either applies.' },
  { key: 'PhysActivity', label: 'Have you done physical activity outside work in the past 30 days?', description: 'For example, walking, exercise, gardening, or sports.' },
  { key: 'Fruits', label: 'Do you consume fruit at least once a day?', description: 'Consider your usual eating habits.' },
  { key: 'Veggies', label: 'Do you consume vegetables at least once a day?', description: 'Consider your usual eating habits.' },
  { key: 'HvyAlcoholConsump', label: 'Does the source survey definition of heavy alcohol consumption apply?', description: 'This is a specific US survey category. Do not guess if unsure.' },
  { key: 'AnyHealthcare', label: 'Do you have any form of healthcare coverage?', description: 'For example, health insurance or another healthcare plan.' },
  { key: 'NoDocbcCost', label: 'Has cost stopped you from seeing a doctor in the past 12 months?', description: 'Consider consultation, tests, or treatment.' },
  { key: 'DiffWalk', label: 'Do you have serious difficulty walking or climbing stairs?', description: 'Choose the answer that best describes your situation.' },
]

const healthOptions = [
  { label: 'Excellent', value: 1 },
  { label: 'Very good', value: 2 },
  { label: 'Good', value: 3 },
  { label: 'Fair', value: 4 },
  { label: 'Poor', value: 5 },
]

const ageOptions = [
  '18–24 years', '25–29 years', '30–34 years', '35–39 years',
  '40–44 years', '45–49 years', '50–54 years', '55–59 years',
  '60–64 years', '65–69 years', '70–74 years', '75–79 years',
  '80 years or older',
].map((label, index) => ({ label, value: index + 1 }))

const educationOptions = [
  'Never attended school or only kindergarten',
  'Grades 1–8', 'Grades 9–11', 'Grade 12 or GED',
  'College: 1–3 years', 'College: 4 years or more',
].map((label, index) => ({ label, value: index + 1 }))

const incomeOptions = [
  'Less than $10,000', '$10,000 to less than $15,000',
  '$15,000 to less than $20,000', '$20,000 to less than $25,000',
  '$25,000 to less than $35,000', '$35,000 to less than $50,000',
  '$50,000 to less than $75,000', '$75,000 or more',
].map((label, index) => ({ label, value: index + 1 }))

const evaluationMetrics = [
  { metric: 'Accuracy', value: 73.17 },
  { metric: 'Precision', value: 31.07 },
  { metric: 'Recall', value: 75.97 },
  { metric: 'F1 score', value: 44.11 },
  { metric: 'ROC-AUC', value: 81.97 },
]

const classDistribution = [
  { category: 'Class 0', count: 218334 },
  { category: 'Class 1', count: 35346 },
]

function App() {
  const [form, setForm] = useState<FormData>({ ...initialForm })
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  const totalQuestions = Object.keys(initialForm).length

  const completedCount = Object.values(form).filter(
    value => value !== null,
  ).length

  const completionPercentage = Math.round(
    (completedCount / totalQuestions) * 100,
  )

  const updateField = (key: keyof FormData, value: number | null) => {
    setForm(previous => ({ ...previous, [key]: value }))
    setError('')
    setResult(null)
  }

  const fieldClass = (key: keyof FormData) => {
    if (attemptedSubmit && form[key] === null) {
      return 'field field-unanswered'
    }

    if (form[key] !== null) {
      return 'field field-complete'
    }

    return 'field'
  }

  const handlePredict = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAttemptedSubmit(true)
    setError('')
    setResult(null)

    const unanswered = Object.entries(form).filter(
      ([, value]) => value === null || !Number.isFinite(value),
    )

    if (unanswered.length > 0) {
      setError(
        `Please complete all questions. ${unanswered.length} field(s) remain unanswered.`,
      )
      return
    }

    if (
      form.BMI === null ||
      form.BMI < 1 ||
      form.BMI > 100 ||
      !Number.isInteger(form.BMI)
    ) {
      setError('BMI must be a whole number between 1 and 100.')
      return
    }

    for (const key of ['MentHlth', 'PhysHlth'] as const) {
      const value = form[key]

      if (
        value === null ||
        value < 0 ||
        value > 30 ||
        !Number.isInteger(value)
      ) {
        setError(
          'Mental and physical health days must be whole numbers between 0 and 30.',
        )
        return
      }
    }

    const payload = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [
        key,
        value as number,
      ]),
    )

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

      window.setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 50)
    } catch (err) {
      setError(
        err instanceof TypeError
          ? 'Cannot connect to the API. Make sure the backend is running at http://127.0.0.1:8000.'
          : err instanceof Error
            ? err.message
            : 'An unexpected error occurred.',
      )
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({ ...initialForm })
    setResult(null)
    setError('')
    setAttemptedSubmit(false)
  }

  const score =
    result && Number.isFinite(result.estimated_probability)
      ? Math.max(0, Math.min(100, result.estimated_probability * 100))
      : null

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#dashboard">
          <span className="brand-icon">
            <HeartPulse size={23} />
          </span>
          <span className="brand-copy">
            Med<span>AI</span>
            <small>HEALTH ANALYTICS</small>
          </span>
        </a>

        <div className="nav-label">WORKSPACE</div>

        <nav className="nav-list">
          <a className="nav-item active" href="#dashboard">
            <LayoutDashboard size={18} /> Overview
          </a>
          <a className="nav-item" href="#model-insights">
            <Activity size={18} /> Model insights
          </a>
          <a className="nav-item" href="#assessment">
            <ClipboardList size={18} /> Questionnaire
          </a>
          {result && (
            <a className="nav-item" href="#results">
              <HeartPulse size={18} /> Latest result
            </a>
          )}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-note">
          <ShieldCheck size={20} />
          <strong>Privacy first</strong>
          <p>
            Use sample information. Avoid entering names or identifying
            patient details.
          </p>
        </div>

        <div className="sidebar-footer">
          <span className="footer-dot" /> Educational prototype
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <div className="breadcrumb">
              Workspace <span>/</span> Overview
            </div>
            <p className="topbar-subtitle">Health indicator explorer</p>
          </div>

          <div className="status-pill">
            <span /> Model interface ready
          </div>
        </header>

        <section className="welcome">
          <div>
            <div className="eyebrow">
              <Stethoscope size={15} /> HEALTH ANALYTICS PLATFORM
            </div>

            <h1>
              Health insights,
              <br />
              <span>powered by data.</span>
            </h1>

            <p>
              Explore a machine-learning model trained on public health
              survey data. Review model performance or complete the
              questionnaire to see a sample classification.
            </p>

            <a className="welcome-action" href="#assessment">
              Start questionnaire <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="welcome-art">
            <div className="art-circle">
              <HeartPulse size={52} strokeWidth={1.4} />
            </div>
            <span className="art-dot dot-one" />
            <span className="art-dot dot-two" />
            <span className="art-line" />
          </div>
        </section>

        <div className="notice-banner">
          <Info size={19} />
          <p>
            <strong>Educational use only.</strong> This application is not
            a medical device and does not provide a clinically validated
            estimate of personal diabetes risk.
          </p>
        </div>

        <section
          className="metrics-grid"
          aria-label="Project dataset and model metrics"
        >
          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-icon blue">
                <Database size={19} />
              </span>
              <span className="metric-label">Dataset records</span>
            </div>
            <strong className="metric-value">253,680</strong>
            <div className="metric-foot">Public health survey rows</div>
          </article>

          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-icon teal">
                <BrainCircuit size={19} />
              </span>
              <span className="metric-label">Selected model</span>
            </div>
            <strong className="metric-value metric-name">
              Logistic Regression
            </strong>
            <div className="metric-foot">
              Selected by validation ROC-AUC
            </div>
          </article>

          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-icon violet">
                <Activity size={19} />
              </span>
              <span className="metric-label">Test ROC-AUC</span>
            </div>
            <strong className="metric-value">0.8197</strong>
            <div className="metric-foot">Held-out test set</div>
          </article>

          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-icon amber">
                <ClipboardList size={19} />
              </span>
              <span className="metric-label">Input features</span>
            </div>
            <strong className="metric-value">21</strong>
            <div className="metric-foot">Required model inputs</div>
          </article>
        </section>

        <section className="analytics-grid" id="model-insights">
          <article className="panel chart-panel">
            <div className="panel-heading">
              <div>
                <h2>Model evaluation</h2>
                <p>Held-out test metrics from the current training run</p>
              </div>
              <span className="chart-tag">TEST SET</span>
            </div>

            <div className="chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={evaluationMetrics}
                  margin={{ top: 12, right: 10, left: -18, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="metricFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#2479db" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2479db" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="#edf1f7"
                    strokeDasharray="4 4"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="metric"
                    tick={{ fontSize: 11, fill: '#718096' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: '#8a96a8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `${v}%`}
                  />
                  <Tooltip
                    formatter={value => [
                      `${Number(value).toFixed(2)}%`,
                      'Test score',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2676db"
                    strokeWidth={2.5}
                    fill="url(#metricFill)"
                    dot={{
                      r: 4,
                      fill: '#2676db',
                      stroke: '#fff',
                      strokeWidth: 2,
                    }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-caption">
              <Info size={14} />
              Precision is lower than recall; review all metrics rather
              than accuracy alone.
            </div>
          </article>

          <article className="panel chart-panel">
            <div className="panel-heading">
              <div>
                <h2>Dataset class balance</h2>
                <p>Target labels in the training dataset</p>
              </div>
              <span className="chart-tag">253.7K ROWS</span>
            </div>

            <div className="chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={classDistribution}
                  margin={{ top: 12, right: 12, left: -12, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="#edf1f7"
                    strokeDasharray="4 4"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 12, fill: '#718096' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#8a96a8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `${Math.round(Number(v) / 1000)}k`}
                  />
                  <Tooltip
                    formatter={value => [
                      Number(value).toLocaleString(),
                      'Records',
                    ]}
                  />
                  <Bar
                    dataKey="count"
                    fill="#18a999"
                    radius={[7, 7, 0, 0]}
                    maxBarSize={65}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="class-legend">
              <span>
                <i className="legend-dot teal-dot" /> Class 0{' '}
                <strong>218,334</strong>
              </span>
              <span>
                <i className="legend-dot blue-dot" /> Class 1{' '}
                <strong>35,346</strong>
              </span>
            </div>
          </article>
        </section>

        <section className="panel metric-breakdown">
          <div className="panel-heading">
            <div>
              <h2>Performance at a glance</h2>
              <p>Reported metrics from the current test evaluation</p>
            </div>
            <span className="chart-tag">LOGISTIC REGRESSION</span>
          </div>

          <div className="metric-bars">
            {evaluationMetrics.map(item => (
              <div className="metric-bar-row" key={item.metric}>
                <span>{item.metric}</span>
                <div className="metric-track">
                  <span style={{ width: `${item.value}%` }} />
                </div>
                <strong>{item.value.toFixed(2)}%</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="section-heading" id="assessment">
          <div>
            <div className="eyebrow">MODEL EXPLORER</div>
            <h2>Health questionnaire</h2>
            <p>
              All fields start blank. Complete every field to submit a
              sample assessment.
            </p>
          </div>

          <span className="question-count">
            <UserRound size={16} /> {completedCount} / {totalQuestions} answered
          </span>
        </section>

        <div className="question-progress">
          <div className="progress-copy">
            <span>Questionnaire completion</span>
            <strong>{completionPercentage}%</strong>
          </div>

          <div
            className="question-progress-track"
            role="progressbar"
            aria-label="Questionnaire completion"
            aria-valuemin={0}
            aria-valuemax={totalQuestions}
            aria-valuenow={completedCount}
          >
            <span style={{ width: `${completionPercentage}%` }} />
          </div>

          <p>
            {completedCount === totalQuestions
              ? 'All questions answered. You can submit your assessment.'
              : `${totalQuestions - completedCount} questions remaining. No answers are preselected.`}
          </p>
        </div>

        <form onSubmit={handlePredict} noValidate>
          <section className="panel form-panel">
            <div className="form-section-title">
              <span className="form-section-icon">
                <HeartPulse size={20} />
              </span>
              <div>
                <h3>Health history and lifestyle</h3>
                <p>Select an answer for each question.</p>
              </div>
            </div>

            <div className="form-grid">
              {binaryFields.map(({ key, label, description }) => (
                <label className={fieldClass(key)} key={key}>
                  <span className="field-label">{label}</span>
                  <small>{description}</small>
                  <select
                    value={form[key] ?? ''}
                    required
                    aria-invalid={attemptedSubmit && form[key] === null}
                    onChange={e =>
                      updateField(
                        key,
                        e.target.value === ''
                          ? null
                          : Number(e.target.value),
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

          <section className="panel form-panel">
            <div className="form-section-title">
              <span className="form-section-icon teal">
                <UserRound size={20} />
              </span>
              <div>
                <h3>Health details and background</h3>
                <p>Use the descriptions to select the appropriate category.</p>
              </div>
            </div>

            <div className="form-grid">
              <label className={fieldClass('BMI')}>
                <span className="field-label">Body Mass Index (BMI)</span>
                <small>Enter your BMI if known. Use a whole number between 1 and 100.</small>
                <input
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  placeholder="Enter BMI"
                  value={form.BMI ?? ''}
                  required
                  aria-invalid={attemptedSubmit && form.BMI === null}
                  onChange={e =>
                    updateField(
                      'BMI',
                      e.target.value === '' ? null : Number(e.target.value),
                    )
                  }
                />
              </label>

              <label className={fieldClass('MentHlth')}>
                <span className="field-label">Days of poor mental health</span>
                <small>Number of days in the past 30 days, from 0 to 30.</small>
                <input
                  type="number"
                  min={0}
                  max={30}
                  step={1}
                  placeholder="Select days (0–30)"
                  value={form.MentHlth ?? ''}
                  required
                  aria-invalid={attemptedSubmit && form.MentHlth === null}
                  onChange={e =>
                    updateField(
                      'MentHlth',
                      e.target.value === '' ? null : Number(e.target.value),
                    )
                  }
                />
              </label>

              <label className={fieldClass('PhysHlth')}>
                <span className="field-label">Days of poor physical health</span>
                <small>Number of days in the past 30 days, from 0 to 30.</small>
                <input
                  type="number"
                  min={0}
                  max={30}
                  step={1}
                  placeholder="Select days (0–30)"
                  value={form.PhysHlth ?? ''}
                  required
                  aria-invalid={attemptedSubmit && form.PhysHlth === null}
                  onChange={e =>
                    updateField(
                      'PhysHlth',
                      e.target.value === '' ? null : Number(e.target.value),
                    )
                  }
                />
              </label>

              <label className={fieldClass('GenHlth')}>
                <span className="field-label">General health</span>
                <small>Choose your overall view of your health.</small>
                <select
                  value={form.GenHlth ?? ''}
                  required
                  aria-invalid={attemptedSubmit && form.GenHlth === null}
                  onChange={e =>
                    updateField(
                      'GenHlth',
                      e.target.value === '' ? null : Number(e.target.value),
                    )
                  }
                >
                  <option value="">Select an option</option>
                  {healthOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>

              <label className={fieldClass('Sex')}>
                <span className="field-label">Sex category in the source survey</span>
                <small>The original dataset has two categories.</small>
                <select
                  value={form.Sex ?? ''}
                  required
                  aria-invalid={attemptedSubmit && form.Sex === null}
                  onChange={e =>
                    updateField(
                      'Sex',
                      e.target.value === '' ? null : Number(e.target.value),
                    )
                  }
                >
                  <option value="">Select an option</option>
                  <option value={0}>Female</option>
                  <option value={1}>Male</option>
                </select>
              </label>

              <label className={fieldClass('Age')}>
                <span className="field-label">Age group</span>
                <small>Select the range that includes your age.</small>
                <select
                  value={form.Age ?? ''}
                  required
                  aria-invalid={attemptedSubmit && form.Age === null}
                  onChange={e =>
                    updateField(
                      'Age',
                      e.target.value === '' ? null : Number(e.target.value),
                    )
                  }
                >
                  <option value="">Select an option</option>
                  {ageOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>

              <label className={fieldClass('Education')}>
                <span className="field-label">Highest education completed</span>
                <small>Choose the closest matching survey category.</small>
                <select
                  value={form.Education ?? ''}
                  required
                  aria-invalid={attemptedSubmit && form.Education === null}
                  onChange={e =>
                    updateField(
                      'Education',
                      e.target.value === '' ? null : Number(e.target.value),
                    )
                  }
                >
                  <option value="">Select an option</option>
                  {educationOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>

              <label className={fieldClass('Income')}>
                <span className="field-label">Annual household income</span>
                <small>Income bands are in US dollars from the source survey.</small>
                <select
                  value={form.Income ?? ''}
                  required
                  aria-invalid={attemptedSubmit && form.Income === null}
                  onChange={e =>
                    updateField(
                      'Income',
                      e.target.value === '' ? null : Number(e.target.value),
                    )
                  }
                >
                  <option value="">Select an option</option>
                  {incomeOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="helper-note">
              <Info size={18} />
              <p>
                This prototype uses categories from a US public health survey.
                If a question does not fit your circumstances or you do not
                know the answer, do not guess.
              </p>
            </div>
          </section>

          {error && (
            <div className="error-panel" role="alert">
              <AlertCircle size={20} />
              <div>
                <strong>Unable to get model output</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              className="reset-button"
              type="button"
              onClick={resetForm}
              disabled={loading}
            >
              <RotateCcw size={17} /> Reset answers
            </button>

            <button className="predict-button" type="submit" disabled={loading}>
              {loading
                ? <LoaderCircle className="spin" size={18} />
                : <Activity size={18} />}
              {loading ? 'Processing…' : 'Explore model output'}
            </button>
          </div>
        </form>

        {result && (
          <section className="panel result-panel" id="results" aria-live="polite">
            <div className="panel-heading">
              <div>
                <div className="eyebrow">EXPERIMENTAL OUTPUT</div>
                <h2>Classification result</h2>
                <p>Response returned by your FastAPI model</p>
              </div>
              <span className="result-chip">
                <CheckCircle2 size={14} /> Response received
              </span>
            </div>

            <div className="result-grid">
              <div className="result-class">
                <span className="result-symbol"><HeartPulse size={27} /></span>
                <div>
                  <small>Predicted survey category</small>
                  <strong>
                    {result.predicted_class === 1
                      ? 'Positive class (1)'
                      : 'Negative class (0)'}
                  </strong>
                  <p>This is a survey classification, not a diagnosis.</p>
                </div>
              </div>

              {score !== null && (
                <div className="score-card">
                  <div className="score-heading">
                    <span>Model output score</span>
                    <Info size={15} />
                  </div>
                  <strong>{score.toFixed(1)}%</strong>
                  <div className="score-track">
                    <span style={{ width: `${score}%` }} />
                  </div>
                  <small>Not a personal medical risk estimate</small>
                </div>
              )}
            </div>

            <div className="result-meta">
              <p><strong>Model:</strong> {result.model_name}</p>
              <p><strong>Disclaimer:</strong> {result.disclaimer}</p>
            </div>
          </section>
        )}

        <footer className="page-footer">
          <span>MedAI</span> · Educational machine-learning project · Not for
          clinical decision-making
        </footer>
      </main>
    </div>
  )
}

export default App
