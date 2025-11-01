# GitHub Pages Setup Guide

## 🚀 Automatic Deployment Setup

Das Projekt ist bereits für GitHub Pages konfiguriert! Folge diesen Schritten:

### 1. Repository auf GitHub erstellen
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/DEIN_USERNAME/DEIN_REPO_NAME.git
git push -u origin main
```

### 2. GitHub Pages aktivieren
1. Gehe zu deinem Repository auf GitHub
2. Klicke auf **Settings** → **Pages**
3. Unter **Source** wähle: **GitHub Actions**

### 3. Automatisches Deployment
Der GitHub Actions Workflow wird automatisch ausgelöst bei:
- Jedem Push auf den `main` Branch
- Manuell über Actions Tab → "Deploy to GitHub Pages" → "Run workflow"

### 4. Deine Website ist live!
Nach 2-3 Minuten ist deine Seite verfügbar unter:
```
https://DEIN_USERNAME.github.io/DEIN_REPO_NAME/
```

## 📝 Was wurde konfiguriert?

### ✅ Vite Config (`vite.config.ts`)
```typescript
// Automatische Erkennung des Repository Names!
base: process.env.GITHUB_REPOSITORY 
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` 
  : '/'
```

### ✅ React Router (`App.tsx`)
```typescript
// Nutzt automatisch die base URL von Vite
const basename = import.meta.env.BASE_URL || '/'
<Router basename={basename}>
```

### ✅ GitHub Actions (`.github/workflows/deploy.yml`)
- Automatischer Build bei Push
- Node.js 20 Setup
- Build im Root Ordner
- Deploy zu GitHub Pages

### ✅ Package.json
```json
"deploy": "npm run build && npx gh-pages -d dist"  // Manuelles Deploy (optional)
```

## 🔧 Lokale Entwicklung

```bash
npm install
npm run dev
```

## 🎯 Repository Name? Kein Problem!

**Die Konfiguration ist automatisch!** 🎉

- Der Repository Name wird automatisch erkannt
- Keine manuellen Anpassungen nötig
- Funktioniert mit jedem Repository Namen
- Lokal läuft es auf `/`, auf GitHub Pages mit dem Repository Namen

## 💡 Tipps

- Der erste Deploy kann 5-10 Minuten dauern
- Weitere Deployments sind schneller (2-3 Minuten)
- Check den Actions Tab für Build Status
- Bei Problemen: Settings → Pages → Check ob GitHub Actions als Source gewählt ist

## 🆘 Support

Brauchst du Hilfe? Join uns auf Discord: [swisser.dev/discord](https://swisser.dev/discord)