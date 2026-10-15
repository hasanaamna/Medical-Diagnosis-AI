\# 🩺 Medical Diagnosis AI



An end-to-end machine learning application that predicts diabetes status using health indicators from the CDC's Behavioral Risk Factor Surveillance System (BRFSS) dataset. The project combines data preprocessing, machine learning, a FastAPI backend, and a React + TypeScript frontend.



> \*\*Disclaimer:\*\* This project is for educational and research purposes only. Its predictions are not a medical diagnosis, and the model has not been clinically validated. Do not use it to make medical decisions.



\## 🚀 Features



\- Diabetes-status prediction from health-indicator inputs

\- Estimated model probability displayed alongside the prediction

\- Interactive React and TypeScript frontend

\- FastAPI REST API for model inference

\- Model training and evaluation workflow

\- Scikit-learn model saved for reuse

\- API health-check endpoint

\- Interactive API documentation through Swagger UI



\## 🧰 Tech Stack



| Category | Technologies |

|---|---|

| Language | Python, TypeScript, JavaScript |

| Machine Learning | scikit-learn, pandas, NumPy |

| Backend | FastAPI, Uvicorn |

| Frontend | React, Vite |

| API Testing | Swagger UI, Postman |

| Version Control | Git, GitHub |



\## 📁 Project Structure



```text

Medical-Diagnosis-AI/

├── backend/

│   ├── app/

│   │   ├── \_\_init\_\_.py

│   │   ├── main.py

│   │   └── schemas.py

│   ├── ml/

│   │   ├── fetch\_dataset.py

│   │   └── train\_model.py

│   └── venv/

├── frontend/

│   ├── src/

│   │   ├── App.tsx

│   │   ├── App.css

│   │   ├── index.css

│   │   └── main.tsx

│   ├── package.json

│   └── index.html

├── models/

│   ├── diabetes\_model.joblib

│   └── feature\_columns.json

├── requirements.txt

└── README.md

```



\*Note: The virtual environment and raw datasets should remain local and should not be committed to GitHub.\*



\## 📊 Dataset



The project uses a diabetes health-indicators dataset derived from the CDC's Behavioral Risk Factor Surveillance System (BRFSS) 2015 survey.



\- \*\*Records:\*\* 253,680

\- \*\*Input features:\*\* 21

\- \*\*Target:\*\* `Diabetes\_binary`

\- \*\*Target classes:\*\* 0 and 1, representing the dataset's encoded diabetes-status categories



The dataset contains survey-based health and lifestyle indicators. The target represents recorded status in the source data; it should not be interpreted as a clinically confirmed diagnosis for a new user.



\## 🤖 Machine Learning



The training workflow compares Logistic Regression and Random Forest models. A stratified train-validation-test split is used, and model selection is based on validation ROC-AUC.



The currently selected model is Logistic Regression.



\### Test-set performance



| Metric | Result |

|---|---:|

| Accuracy | 73.17% |

| Precision | 31.07% |

| Recall | 75.97% |

| F1 Score | 44.11% |

| ROC-AUC | 81.97% |



These metrics describe performance on the project's held-out test set. Precision is relatively low, so false-positive predictions are an important limitation. These results do not establish clinical suitability.



\## ⚙️ Installation and Setup



\### Prerequisites



\- Python 3.11 recommended

\- Node.js and npm

\- Git



\### 1. Clone the repository



```bash

git clone https://github.com/hasanaamna/Medical-Diagnosis-AI.git

cd Medical-Diagnosis-AI

```



\### 2. Set up the Python backend



Create and activate a virtual environment from the project root.



\*\*Windows PowerShell:\*\*



```powershell

python -m venv backend/venv

.\\backend\\venv\\Scripts\\Activate.ps1

```



\*\*Windows Command Prompt:\*\*



```cmd

python -m venv backend\\venv

backend\\venv\\Scripts\\activate.bat

```



Install dependencies:



```bash

python -m pip install -r requirements.txt

```



\### 3. Start the backend



From the project root, run:



```bash

python -m uvicorn backend.app.main:app --reload

```



Backend URL: `http://127.0.0.1:8000`



Swagger API documentation: `http://127.0.0.1:8000/docs`



Health check: `http://127.0.0.1:8000/health`



\### 4. Start the frontend



Open a \*\*second terminal\*\* in the project root.



```bash

cd frontend

npm install

npm run dev

```



Open the local URL printed by Vite, normally `http://localhost:5173`.



Keep both development servers running while using the application.



\## 🔌 API Endpoints



\### Health check



```http

GET /health

```



Checks whether the API is running and whether the model is loaded.



\### Prediction



```http

POST /predict

Content-Type: application/json

```



Accepts the input fields defined by the backend's request schema and returns a prediction response. See `/docs` for the exact request format and response fields.



\*\*Important:\*\* Input field names and values must match the API schema. The returned probability is a model estimate, not an individual's medically validated probability of developing diabetes.



\## 🧪 Model Training



After obtaining the dataset required by the training script, run:



```bash

python backend/ml/train\_model.py

```



Check the script's dataset path and expected file name before running it. The saved model and feature-column metadata are used by the API for inference.



\## 🔒 Data and Privacy



\- Do not commit private, identifiable, or sensitive health information.

\- Keep virtual environments, secrets, and raw or processed datasets out of version control unless sharing is explicitly permitted.

\- Review `.gitignore` before pushing changes.

\- This prototype is not intended for clinical use.



\## 🛣️ Future Improvements



\- Add automated backend tests and frontend tests.

\- Improve input validation and user-friendly error handling.

\- Add model calibration and more detailed evaluation.

\- Document dataset provenance and licensing.

\- Deploy the frontend and API with appropriate security controls.

\- Conduct independent clinical and external validation before considering any real-world medical application.



\## 👩‍💻 Author



\*\*Aamna Hasan\*\*



GitHub: \[@hasanaamna](https://github.com/hasanaamna)



\## 📄 License



No license has been specified yet. Add an appropriate license before allowing others to reuse, modify, or distribute this project.



