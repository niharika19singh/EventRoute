# EventRoute — Navigate the Opportunity

> **Inter-college event discovery and journey planning for students.**  
> Discover hackathons, technical fests, cultural symposiums, workshops, and sports championships geographically, with verified road routing and travel estimates from your campus to event venues.

---

## 🎯 Problem Statement

College students frequently miss out on premier inter-college competitions, hackathons, and cultural fests because event listings are scattered across portals without geographic context. When students do find opportunities, assessing transit logistics, travel duration, and route feasibility from their campus is cumbersome.

**EventRoute** solves this by:
1. Discovering verified inter-college opportunities via the **TinyFish Search & Fetch Web Agent**.
2. Normalizing, validating, and deduplicating events with accurate geographic coordinates.
3. Rendering host campuses, event venues, and origin campus on an interactive **Leaflet map**.
4. Calculating verified road routes, travel duration, and turn-by-turn navigation via **OSRM (Open Source Routing Machine)**.
5. Providing filtering by category, radius, search keywords, date, and personal bookmarks.

---

## 🏗️ Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│                   React + Vite Frontend                │
│  • Tailwind CSS & Glass Dark UI                        │
│  • Leaflet Interactive Map (CartoDB Dark Matter tiles) │
│  • Category Badges, Filters & Saved Bookmarks          │
│  • Turn-by-Turn Route Navigation Drawer                │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Python + FastAPI Backend             │
│  • Event Normalizer, Validator & Deduplication Engine  │
│  • NumPy Vectorized Spatial & Distance Matrix Service  │
│  • OSRM Road Routing API Integration                   │
│  • TinyFish Search (GET) & Fetch (POST) Web Agent      │
└───────────────────────────┬────────────────────────────┘
                            │ External Web APIs
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│ TinyFish Web Agent    │       │ OSRM Public Routing   │
│ api.search.tinyfish.ai│       │ router.project-osrm   │
│ api.fetch.tinyfish.ai │       │ Real Road Distances   │
└───────────────────────┘       └───────────────────────┘
```

### Stack Components
- **Frontend:** React 18, Vite 5, Tailwind CSS, Leaflet (`react-leaflet`), Lucide React icons.
- **Backend:** Python 3.10+, FastAPI, Pydantic v2, Uvicorn, HTTPX.
- **Spatial Computations:** NumPy vectorized Haversine distance calculations and bounding box radius filters (with optional GeoPandas integration).
- **External Web Agent:** TinyFish Search API & Fetch API with in-memory TTL caching, request bounding, and masked key protection.
- **Routing Engine:** Open Source Routing Machine (OSRM) driving profile for verified road distances, turn-by-turn maneuvers, and GeoJSON route paths (never invented distances).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python:** 3.10 or higher
- **Node.js:** 18.0 or higher
- **npm:** 9.0 or higher

---

### 2. Backend Setup (FastAPI)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd EventRoute/backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate

   # On Windows
   python -m venv venv
   venv\Scripts\activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   *(Optional)* If you have a TinyFish API key, set it in `.env`:
   ```bash
   TINYFISH_API_KEY=tf_live_your_api_key_here
   ```
   > **Note:** If no API key is configured, EventRoute seamlessly runs in **Curated Catalog Mode** with 12+ pre-loaded verified Delhi-NCR and national college events.

5. Start the backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The API will be available at `http://localhost:8000`.  
   Interactive Swagger documentation: `http://localhost:8000/docs`.

---

### 3. Frontend Setup (React + Vite)

1. In a second terminal, navigate to the frontend directory:
   ```bash
   cd EventRoute/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

---

## 🧪 Running Tests

### Backend Unit & Integration Tests (25 Tests)
Run pytest from the `EventRoute/backend` directory:
```bash
cd EventRoute/backend
python3 -m pytest tests/ -v
```

Test coverage includes:
- `test_event_processor.py`: String normalization, category classification, campus geocoding resolution, and collision-resistant deduplication.
- `test_routing_service.py`: Haversine formula verification, duration formatting, and OSRM route computation with GeoJSON polyline.
- `test_spatial_service.py`: NumPy vectorized distance matrix, radius filtering, and k-nearest campus lookups.
- `test_tinyfish_service.py`: Diagnostic status, safe API key masking (`tf_...4a2b`), and discovery workflow.
- `test_api_endpoints.py`: FastAPI endpoints (`/`, `/api/health`, `/api/events`, `/api/colleges`, `/api/route`, `/api/tinyfish/discover`).

### Frontend Production Build Test
Verify the frontend build bundle compiles cleanly:
```bash
cd EventRoute/frontend
npm run build
```

---

## 🌐 TinyFish Web Agent Integration

EventRoute integrates TinyFish per official specifications:

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| **Search API** | `GET` | `https://api.search.tinyfish.ai` | Discovers upcoming hackathons, tech fests, and cultural symposiums |
| **Fetch API** | `POST` | `https://api.fetch.tinyfish.ai` | Extracts clean Markdown content, dates, eligibility, and registration URLs |

### Security & Reliability Best Practices
- **Server-Side Only:** `TINYFISH_API_KEY` is loaded strictly in the FastAPI backend via environment variables. It is never bundled into client-side JS.
- **Masked Status Endpoint:** The `/api/tinyfish/status` endpoint exposes only a masked key (e.g., `tf_...4a2b`) for diagnostics.
- **Resilience:** Bounded HTTP requests with an 8.0-second timeout, 10-minute in-memory MD5 query cache, and graceful fallback to curated offline data if offline.

---

## 🗺️ Routing & Geographic Integrity

- **Never Invented Distances:** Road routing queries the OSRM public API to obtain exact road distance, duration, and turn-by-turn navigation maneuvers.
- **Fallback Transparency:** If OSRM is unreachable (e.g. in offline environments), the system calculates true spherical Haversine distances with an explicit urban road factor and transparent UI disclosure.
- **Origin Selection:** Students can pick from 12+ premier colleges (IIIT Delhi, IIT Delhi, DTU, NSUT, DU North, Jamia, JNU, IGDTUW, MAIT, JIIT, BITS Pilani, etc.) or click the geolocation icon to auto-detect their nearest campus.

---

## 📁 Repository Structure

```
EventRoute/
├── backend/
│   ├── .env.example
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py              # FastAPI application entrypoint & CORS
│   │   ├── config.py            # Environment configuration
│   │   ├── models/schemas.py    # Pydantic schemas for events, routes, colleges
│   │   ├── data/
│   │   │   ├── colleges_data.py # Premier colleges with verified coordinates
│   │   │   └── mock_events.py   # Curated inter-college event catalog
│   │   ├── services/
│   │   │   ├── event_processor.py   # Normalization, validation, deduplication
│   │   │   ├── routing_service.py   # OSRM road routing & duration estimation
│   │   │   ├── spatial_service.py   # NumPy vectorized distance matrix
│   │   │   └── tinyfish_service.py  # TinyFish Search & Fetch client with cache
│   │   └── routers/
│   │       ├── events.py        # /api/events with search, filters, radius
│   │       ├── colleges.py      # /api/colleges & /api/colleges/nearest
│   │       ├── routing.py       # /api/route for verified road journeys
│   │       └── tinyfish.py      # /api/tinyfish/status & discover
│   └── tests/                   # 25 comprehensive test suites
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx              # Main dashboard shell & view manager
│       ├── index.css            # Dark theme, Leaflet styles & animations
│       ├── services/api.js      # Backend API client
│       ├── hooks/
│       │   ├── useEvents.js     # Events, filters, search & bookmark hook
│       │   └── useRoute.js      # Journey planning & route state hook
│       └── components/
│           ├── layout/          # Header & OriginSelector
│           ├── dashboard/       # EventCard, EventFilters, Details & Modals
│           ├── map/             # EventMap (Leaflet) & RoutePlanPanel
│           └── shared/          # CategoryBadge, StatusPill, StateBanners
└── README.md
```

---

## 🛡️ Preservation of Existing Projects
EventRoute has been created as an independent project directory and standalone Git repository. Existing repositories, files, Git history, and deployment configurations remain 100% untouched and preserved.
