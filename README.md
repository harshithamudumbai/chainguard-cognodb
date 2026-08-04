# ChainGuard - Supply Chain Intelligence

ChainGuard is a comprehensive supply-chain risk and operational intelligence dashboard powered by Neo4j/CognoDB. It enables organizations to visualize dependencies, track single points of failure, and model the indirect cascading impact of global risk events on their product portfolio.

## Phase 6 Final Submission Deliverables

- **Live Demo Application (Frontend):** `[INSERT_FRONTEND_URL_HERE]`
- **Live Backend API Health:** `[INSERT_BACKEND_URL_HERE]/api/health`
- **GitHub Repository:** `[INSERT_GITHUB_REPO_URL_HERE]`
- **Screen Recording Walkthrough:** `[INSERT_VIDEO_URL_HERE]`

---

## 🏗 Architecture Overview

ChainGuard is built as a modern full-stack monorepo consisting of:

1. **Frontend (`apps/web`)**: A responsive React (Vite) application styled with Tailwind CSS v4. It features complex state management using React Query, real-time routing with React Router, and advanced graph visualizations using React Flow and Cytoscape.
2. **Backend (`apps/api`)**: A Node.js + Express REST API designed for high performance. It handles direct queries to the graph database using the official Neo4j driver, ensuring data is formatted optimally for the frontend.
3. **Database (`CognoDB Cloud`)**: A graph database holding the entire supply-chain topology, utilizing nodes for `Supplier`, `Facility`, `Component`, `Product`, and `Risk`, along with their complex inter-relationships (e.g., `SUPPLIES`, `AFFECTS`, `DEPENDS_ON`).

## 🚀 Setup Instructions

If you wish to run the application locally, follow these steps:

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- A Neo4j or CognoDB database instance

### 1. Installation
Clone the repository and install all workspace dependencies:
```bash
git clone [INSERT_GITHUB_REPO_URL_HERE] chainguard
cd chainguard
npm install
```

### 2. Database Configuration
Create an `.env` file in the `apps/api` directory:
```bash
COGNODB_URI=bolt+s://<your-db-url>
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=<your-db-password>
PORT=4000
WEB_ORIGIN=http://localhost:5173
```

### 3. Seeding the Database
To populate the database with the initial graph data, run the seed script:
```bash
npm run seed -w apps/api
```

### 4. Running the Application
Start both the backend API and the frontend development server concurrently:
```bash
# Start backend
npm run dev -w apps/api

# In a new terminal, start frontend
npm run dev -w apps/web
```
The application will be available at `http://localhost:5173`.

---

## 📸 Screenshots

### Operational Dashboard
Displays real-time aggregated metrics and top supply-chain risks.
![Dashboard](dashboard_home_1785841604641.png)

### Network Explorer
Interactive dependency graph mapping the entire global topology.
![Network Explorer](network_explorer_1785841640527.png)

### Risk Impact Analysis
Calculates the exact downstream impact of isolated disruption events.
![Risk Impact](risk_impact_1785841675725.png)

### Critical Dependencies
Highlights single points of failure (sole-sourced components).
![Critical Dependencies](critical_dependencies_1785841732209.png)
