# GraphPulse ⚡

> **Production-grade REST API & Visual Explorer for Hierarchical Node Processing**

GraphPulse is a complete, full-stack solution designed to parse directed-edge relationships, construct mathematical graphs, detect pure cycles using **O(V+E) Depth-First Search**, and calculate deep hierarchical insights. It features a robust modular backend and a highly interactive, animated frontend built with Next.js and ReactFlow.

**Live Demo:**
* **Frontend:** [https://graph-pulse-olive.vercel.app](https://graph-pulse-olive.vercel.app)
* **Backend API:** [https://graphpulse.onrender.com/bfhl](https://graphpulse.onrender.com/bfhl)

---

## 🚀 Features

### Backend Engine (Node.js / Express)
* **Strict Validation Engine:** Rejects multi-character nodes, bad formats, self-loops, and mixed casing.
* **Smart Deduplication:** Silently isolates duplicate edges without crashing.
* **O(V+E) Cycle Detection:** Implements a rigorous DFS recursion stack to find back-edges and isolate cyclic subgraphs.
* **Deterministic Forest Building:** Calculates roots efficiently, breaks ties lexicographically, and manages isolated multi-parent overrides safely.
* **Performance:** Sub-millisecond processing times even with complex 50+ node graphs.

> **Note on CORS:** CORS is currently open (`*`) to ensure compatibility with evaluation environments. In production, it will be restricted to trusted domains.

### Visual Explorer (Next.js / React)
* **Premium Dark Mode UI:** A highly polished "aurora glass" interface built with Tailwind CSS v4, featuring glowing gradients, frosted glass panels, and deep 3D drop-shadows.
* **Framer Motion Animations:** Buttery-smooth page loads, staggered list animations, and interactive HUD-like elements that respond in real-time.
* **Pipeline Simulation:** Animates the algorithm step-by-step (Validation → Deduplication → Cycle Detection → Tree Building) with dynamic glow sweeps.
* **Advanced Graph Visualization:** Custom ReactFlow integration with glowing animated edges, dark-themed nodes, and depth-based color coding. Cyclic graphs pulse in a warning red.
* **Tree Viewer & Dashboard:** Expandable code-like hierarchy views and premium metric cards to deep-dive into complex nested JSON responses.

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express, CORS
* **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS v4
* **Visualization:** `@xyflow/react` (React Flow), `lucide-react`
* **Deployment:** Render (Backend), Vercel (Frontend)

---

## 📥 Local Installation

### Prerequisites
* Node.js (v18 or higher recommended)
* npm

### 1. Backend Setup

```bash
cd backend
npm install

# Start the development server (runs on port 3000)
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Start the development server (runs on port 3001)
npm run dev -p 3001
```

Open `http://localhost:3001` in your browser.

---

## 📡 API Reference

### `POST /bfhl`

**Request Body**
```json
{
  "user_id": "john_doe_21BCE0001",
  "email_id": "john.doe@college.edu",
  "college_roll_number": "21BCE0001",
  "data": ["A->B", "B->C", "C->D"]
}
```

**Valid Edge Pattern:** `/^[A-Z]->[A-Z]$/` (e.g., `"X->Y"`)

**Response Format**
```json
{
  "user_id": "john_doe_21BCE0001",
  "email_id": "john.doe@college.edu",
  "college_roll_number": "21BCE0001",
  "hierarchies": [
    {
      "root": "A",
      "tree": {
        "A": {
          "B": {
            "C": {
              "D": {}
            }
          }
        }
      },
      "depth": 4,
      "has_cycle": false
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  },
  "_meta": {
    "processing_time_ms": 2
  }
}
```

---

## 🏗️ Project Structure

```text
GraphPulse/
├── backend/
│   ├── src/
│   │   ├── controllers/      # HTTP routing
│   │   ├── services/         # Orchestration pipeline
│   │   ├── graph-engine/     # Mathematical algorithms (cycles, trees)
│   │   └── utils/            # Regex validation
│   └── package.json
└── frontend/
    ├── app/                  # Next.js App Router (page.tsx, globals.css)
    ├── components/           # UI Components (InputPanel, GraphView, etc.)
    ├── lib/                  # Shared types and API hooks
    └── package.json
```

---

