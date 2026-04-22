#!/usr/bin/env pwsh

# ============================================
# TMA-Debat Système de Tickets - Démarrage
# ============================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🚀 Démarrage Système de Tickets TMA-Debat     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-Not (Test-Path "app\main.py")) {
    Write-Host "❌ Erreur: app\main.py non trouvé" -ForegroundColor Red
    Write-Host "Veuillez lancer ce script depuis la racine du projet"
    Read-Host "Appuyez sur Entrée pour continuer"
    exit 1
}

# Vérifier la base de données
Write-Host "📦 Vérification des pré-requis..." -ForegroundColor Yellow
if (-Not (Test-Path ".venv")) {
    Write-Host "⚠️  Environnement virtuel non trouvé" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pour initialiser:" -ForegroundColor Yellow
    Write-Host "  1. Créer venv: python -m venv .venv"
    Write-Host "  2. Activer: .\.venv\Scripts\Activate.ps1"
    Write-Host "  3. Installer: pip install -r requirements.txt"
    Read-Host "Appuyez sur Entrée pour continuer"
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "✅ Configuration détectée" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

Write-Host "[1] Démarrer BACKEND (Port 8000)" -ForegroundColor Cyan
Write-Host "[2] Démarrer FRONTEND (Port 5173)" -ForegroundColor Cyan
Write-Host "[3] Démarrer BACKEND + FRONTEND (2 fenêtres)" -ForegroundColor Cyan
Write-Host "[4] Quitter" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "Choisissez une option (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🔵 Démarrage du backend..." -ForegroundColor Blue
        Write-Host "Backend: http://localhost:8000" -ForegroundColor Green
        Write-Host "Docs API: http://localhost:8000/docs" -ForegroundColor Green
        Write-Host ""
        & uv run uvicorn app.main:app --reload --port 8000
    }
    "2" {
        Write-Host ""
        Write-Host "🟢 Démarrage du frontend..." -ForegroundColor Green
        Write-Host "Frontend: http://localhost:5173/tickets" -ForegroundColor Green
        Write-Host ""
        Set-Location tma-frontend
        & npm run dev
        Set-Location ..
    }
    "3" {
        Write-Host ""
        Write-Host "🔵 Démarrage du backend (nouvelle fenêtre)..." -ForegroundColor Blue
        Write-Host "🟢 Démarrage du frontend (nouvelle fenêtre)..." -ForegroundColor Green
        Write-Host ""
        Write-Host "Backend: http://localhost:8000" -ForegroundColor Green
        Write-Host "Frontend: http://localhost:5173/tickets" -ForegroundColor Green
        Write-Host ""
        
        # Backend
        $backendScript = {
            Set-Location $args[0]
            & uv run uvicorn app.main:app --reload --port 8000
        }
        Start-Process pwsh -ArgumentList "-NoExit", "-Command", "& { $backendScript = $args[0]; & `$backendScript `$pwd }", $backendScript
        
        # Frontend
        Start-Sleep -Seconds 2
        $frontendScript = {
            Set-Location $args[0]
            Set-Location tma-frontend
            & npm run dev
        }
        Start-Process pwsh -ArgumentList "-NoExit", "-Command", "& { $frontendScript = $args[0]; & `$frontendScript $pwd }", $frontendScript
        
        Write-Host ""
        Write-Host "✅ Les deux serveurs ont démarré dans des fenêtres séparées" -ForegroundColor Green
        Write-Host ""
        Read-Host "Appuyez sur Entrée pour continuer"
    }
    "4" {
        Write-Host "Aurevoir!" -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "Choix invalide" -ForegroundColor Red
        Read-Host "Appuyez sur Entrée pour continuer"
    }
}
