@echo off
REM ============================================
REM TMA-Debat Système de Tickets - Démarrage
REM ============================================

echo.
echo ╔════════════════════════════════════════════════╗
echo ║  🚀 Démarrage Système de Tickets TMA-Debat     ║
echo ╚════════════════════════════════════════════════╝
echo.

REM Vérifier que nous sommes dans le bon répertoire
if not exist "app\main.py" (
    echo ❌ Erreur: app\main.py non trouvé
    echo Veuillez lancer ce script depuis la racine du projet
    pause
    exit /b 1
)

REM Vérifier la base de données
echo 📦 Vérification des pré-requis...
if not exist ".venv" (
    echo ⚠️  Environnement virtuel non trouvé
    echo.
    echo Pour initialiser:
    echo   1. Créer venv: python -m venv .venv
    echo   2. Activer: .venv\Scripts\Activate.ps1
    echo   3. Installer: pip install -r requirements.txt
    pause
    exit /b 1
)

echo.
echo ============================================
echo ✅ Configuration détectée
echo ============================================
echo.

echo [1] Démarrer BACKEND (Port 8000)
echo [2] Démarrer FRONTEND (Port 5173)
echo [3] Démarrer BACKEND + FRONTEND (2 fenêtres)
echo [4] Quitter
echo.

set /p choice=Choisissez une option (1-4): 

if "%choice%"=="1" (
    echo.
    echo 🔵 Démarrage du backend...
    echo Backend: http://localhost:8000
    echo Docs API: http://localhost:8000/docs
    echo.
    uv run uvicorn app.main:app --reload --port 8000
)

if "%choice%"=="2" (
    echo.
    echo 🟢 Démarrage du frontend...
    echo Frontend: http://localhost:5173/tickets
    echo.
    cd tma-frontend
    npm run dev
    cd ..
)

if "%choice%"=="3" (
    echo.
    echo 🔵 Démarrage du backend (nouvelle fenêtre)...
    echo 🟢 Démarrage du frontend (nouvelle fenêtre)...
    echo.
    echo Backend: http://localhost:8000
    echo Frontend: http://localhost:5173/tickets
    echo.
    start "TMA-Backend" cmd /k "uv run uvicorn app.main:app --reload --port 8000"
    timeout /t 2 /nobreak
    start "TMA-Frontend" cmd /k "cd tma-frontend && npm run dev && cd .."
    echo.
    echo ✅ Les deux serveurs ont démarré dans des fenêtres séparées
)

if "%choice%"=="4" (
    echo Aurevoir!
    exit /b 0
)

echo Choix invalide
pause
