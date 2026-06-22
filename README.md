# ⚡ StockFlow — Inventory & Order Management System

A production-ready full-stack web application for managing products, customers, orders, and inventory tracking. Built with React, FastAPI, and PostgreSQL — fully containerized with Docker.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, Recharts, React Hot Toast |
| Backend | Python 3.11, FastAPI, SQLAlchemy 2.0 |
| Database | PostgreSQL 15 |
| Container | Docker, Docker Compose |
| Deployment | Vercel (frontend), Render (backend) |

---

## 📁 Project Structure

```
stockflow/
├── backend/
│   ├── app/
│   │   ├── core/         # Database connection
│   │   ├── models/       # SQLAlchemy models
│   │   ├── routers/      # API route handlers
│   │   ├── schemas/      # Pydantic validation schemas
│   │   └── main.py       # FastAPI app entry point
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── components/   # Layout, Sidebar
│   │   ├── pages/        # Dashboard, Products, Customers, Orders
│   │   └── utils/        # API service layer
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── render.yaml
├── .env.example
└── .gitignore
```

---

## 🌐 Deployment Guide 

> All steps below can be done entirely from your phone browser.

---

### STEP 1 — Push to GitHub

1. Go to **github.com** → Sign in (or create account)
2. Click **+** → **New repository**
3. Name it `stockflow` → **Create repository**
4. You'll see instructions to upload files. Use **"uploading an existing file"** link
5. Upload ALL files from this project (maintain folder structure)
6. Commit changes → Your repo is live!

**Your GitHub URL:** `https://github.com/Lakshayyadav8407/stockflow`

---

### STEP 2 — Deploy Backend on Render

1. Go to **render.com** → Sign up (free)
2. Click **New** → **Web Service**
3. Connect your GitHub account → Select `stockflow` repo
4. Configure:
   - **Name:** `stockflow-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Click **New** → **PostgreSQL** (free tier)
   - **Name:** `stockflow-db`
6. Go back to your web service → **Environment** tab
7. Add environment variable:
   - Key: `DATABASE_URL`
   - Value: Copy the **Internal Database URL** from your PostgreSQL service
8. Click **Deploy**

**Your Backend URL:** `https://stockflow-backend.onrender.com`

> 💡 First deploy takes ~5 minutes. Free tier spins down after inactivity — first request takes ~30 seconds to wake up.

---

### STEP 3 — Deploy Frontend on Vercel

1. Go to **vercel.com** → Sign up with GitHub
2. Click **Add New Project**
3. Import `stockflow` repo
4. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
5. Add Environment Variable:
   - Key: `REACT_APP_API_URL`
   - Value: `https://stockflow-backend.onrender.com` (your Render URL)
6. Click **Deploy**

**Your Frontend URL:** `https://stockflow.vercel.app`

---

### STEP 4 — Push Docker Image to Docker Hub

1. Go to **hub.docker.com** → Sign up (free)
2. Create repository named `stockflow-backend`

> Since you're on iPhone and can't run Docker locally, use **Render's auto-deploy** which builds from your Dockerfile automatically. For Docker Hub, use **GitHub Actions** (free):

Create file `.github/workflows/docker.yml` in your repo:

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: YOUR_DOCKERHUB_USERNAME/stockflow-backend:latest
```

Then in GitHub → Settings → Secrets → Add:
- `DOCKERHUB_USERNAME` = your Docker Hub username
- `DOCKERHUB_TOKEN` = Docker Hub → Account Settings → Security → New Access Token

Push to main branch → GitHub Actions automatically builds and pushes your image!

**Your Docker Hub URL:** `https://hub.docker.com/r/YOUR_USERNAME/stockflow-backend`

---

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API health info |
| GET | `/docs` | Interactive API documentation |
| GET | `/dashboard` | Summary statistics |
| POST | `/products` | Create product |
| GET | `/products` | List all products |
| GET | `/products/{id}` | Get product by ID |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |
| POST | `/customers` | Create customer |
| GET | `/customers` | List all customers |
| GET | `/customers/{id}` | Get customer by ID |
| DELETE | `/customers/{id}` | Delete customer |
| POST | `/orders` | Create order |
| GET | `/orders` | List all orders |
| GET | `/orders/{id}` | Get order details |
| DELETE | `/orders/{id}` | Cancel order |

---

## ✅ Business Logic

- Product SKU codes are unique across the system
- Customer email addresses are unique
- Product quantity cannot go below zero
- Orders are rejected if inventory is insufficient
- Placing an order automatically deducts stock
- Cancelling an order restores stock to inventory
- Total order amount is calculated automatically by the backend
- All inputs are validated before processing

---

## 🔑 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `REACT_APP_API_URL` | Backend API URL for frontend | `https://your-backend.onrender.com` |
| `POSTGRES_DB` | Database name | `stockflow_db` |
| `POSTGRES_USER` | Database user | `stockflow` |
| `POSTGRES_PASSWORD` | Database password | `your_secure_password` |

---

## 📦 Submission Checklist

- [ ] GitHub repository (all source code)
- [ ] Docker Hub image (`YOUR_USERNAME/stockflow-backend:latest`)
- [ ] Live frontend URL (Vercel)
- [ ] Live backend API URL (Render)

---

*StockFlow — Built for scalable inventory management*
