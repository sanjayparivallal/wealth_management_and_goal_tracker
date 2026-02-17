# 🚀 Step-by-Step Deployment Guide: Render.com

This guide explains exactly how to deploy your Wealth Management app on **Render**. Since you use **Postgres, Redis, FastAPI, and React**, you need to set up a few separate services.

---

## 🏗️ Phase 1: Prepare your Code
Before you start, make sure you have these files in your project (I've already created them or you can copy them):
1.  **`backend/Dockerfile`**: Tells Render how to run your Python API.
2.  **`frontend/Dockerfile`**: Tells Render how to build and serve your React app.
3.  **`backend/requirements.txt`**: List of all your Python libraries.

---

## � Phase 2: Deploy Database & Redis (The Infrastructure)

1.  **Create PostgreSQL Database**:
    *   Go to [Render Dashboard](https://dashboard.render.com/) -> **New** -> **PostgreSQL**.
    *   Name: `wealth-db`
    *   Click **Create Database**.
    *   **Keep this tab open!** You will need the **Internal Database URL** later.

2.  **Create Redis Instance**:
    *   Go to **New** -> **Redis**.
    *   Name: `wealth-redis`
    *   Click **Create Redis**.
    *   **Keep this tab open!** You will need the **Internal Redis URL**.

---

## 🐍 Phase 3: Deploy the Backend (FastAPI + Celery)

### 1. The API Service (FastAPI)
*   Go to **New** -> **Web Service**.
*   Connect your GitHub repository.
*   **Root Directory**: `backend`
*   **Language**: `Docker`
*   **Add Environment Variables**:
    *   `DATABASE_URL`: (Paste your **Internal Database URL** from Phase 2)
    *   `REDIS_URL`: (Paste your **Internal Redis URL** from Phase 2)
    *   `SECRET_KEY`: (Any random long string)
*   Click **Create Web Service**.

### 2. The Background Worker (Celery Worker)
*   Go to **New** -> **Background Worker**.
*   Connect the SAME GitHub repo.
*   **Root Directory**: `backend`
*   **Language**: `Docker`
*   **Docker Command Override**: `celery -A app.celery_app worker --loglevel=info -P solo`
*   **Add Environment Variables**: (Same as the API Service above)
    *   `DATABASE_URL`
    *   `REDIS_URL`

### 3. The Scheduler (Celery Beat)
*   Go to **New** -> **Background Worker**.
*   **Docker Command Override**: `celery -A app.celery_app beat --loglevel=info`
*   **Add Environment Variables**: (Same as above)

---

## 💻 Phase 4: Deploy the Frontend (React)

1.  **Get the Backend URL**:
    *   Go to your Backend API service on Render.
    *   Copy the URL (it looks like `https://your-app-backend.onrender.com`).

2.  **Create Static Site**:
    *   Go to **New** -> **Static Site**.
    *   Connect your GitHub repo.
    *   **Root Directory**: `frontend`
    *   **Build Command**: `npm run build`
    *   **Publish Directory**: `dist`
    *   **Add Environment Variable**:
        *   `VITE_API_BASE`: (Paste your **Backend URL** from step 1)

---

## 🔧 Phase 5: Fix CORS (Final Step)
For security, your backend will block your frontend unless you tell it to allow it.
1.  Open `backend/app/main.py`.
2.  In the `CORSMiddleware` section, add your Render Frontend URL:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://your-frontend-name.onrender.com" # ADD THIS!
    ],
    ...
)
```

---

## ✅ Summary of Services on Render:
1.  **PostgreSQL** (Managed DB)
2.  **Redis** (Managed Cache/Broker)
3.  **Web Service** (Backend API)
4.  **Worker** (Celery Task Processor)
5.  **Worker** (Celery Beat Scheduler)
6.  **Static Site** (Frontend UI)

**That's it! Once these are set up, every time you "Git Push" your code, Render will automatically redeploy everything.**
