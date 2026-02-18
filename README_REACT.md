# WakeUp DOX - React + TypeScript Admin Panel

Panel administracyjny został przepisany z JavaScript na **React + TypeScript**.

## 🚀 Instalacja

```bash
npm install
```

## 🔧 Tryb Development

### Szybki start - Uruchom backend i frontend jednocześnie:
```bash
npm run dev
```

To uruchomi:
- **Backend** na `http://localhost:5000`
- **Frontend** (Vite dev server) na `http://localhost:3000`

**Uwaga:** Vite automatycznie przekieruje API requesty do backendu na porcie 5000.

### Alternatywnie - Uruchom osobno:

Backend (port 5000):
```bash
npm run dev:server
```

Frontend (port 3000):
```bash
npm run dev:client
```

## 📦 Tryb Production

### 1. Zbuduj aplikację React:
```bash
npm run build
```

### 2. Uruchom serwer:
```bash
npm start
```

### 3. Otwórz admin panel:
```
http://localhost:5000/adminp
```

## 📁 Struktura projektu

```
├── src/
│   ├── components/       # Komponenty React
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DoxesList.tsx
│   │   ├── CreatorsList.tsx
│   │   ├── DoxModal.tsx
│   │   └── CreatorModal.tsx
│   ├── hooks/           # Custom hooks
│   │   └── useSecurityProtection.ts
│   ├── types.ts         # TypeScript typy
│   ├── utils.ts         # Funkcje pomocnicze
│   ├── App.tsx          # Główny komponent
│   ├── App.css          # Style
│   └── main.tsx         # Entry point
├── public/              # Stara wersja (index.html, app.js)
├── baza/               # Baza danych JSON
├── server.js           # Express server
├── vite.config.ts      # Konfiguracja Vite
├── tsconfig.json       # Konfiguracja TypeScript
└── package.json

```

## ✨ Features

Wszystkie funkcje zostały zachowane:

- ✅ Login z zabezpieczeniami
- ✅ Zarządzanie Doxes (dodawanie, edycja, usuwanie)
- ✅ Zarządzanie Creators (dodawanie, edycja, usuwanie)
- ✅ Tabele danych w Doxes
- ✅ Upload obrazów (drag & drop, max 20)
- ✅ Zabezpieczenia (disable DevTools, right-click, etc.)
- ✅ Responsive design
- ✅ Te same animacje CSS

## 🔐 Login

- **Username:** `orzechszefu`
- **Password:** `Siemasiema123!`

## 🛠️ Technologie

- **React 18** - UI framework
- **TypeScript** - Typy
- **Vite** - Build tool
- **Express** - Backend API
- **CSS** - Style (identyczne jak poprzednio)

## 📝 Różnice vs stara wersja

### Stara wersja (public/)
- Vanilla JavaScript
- HTML template z DOM manipulation
- Event listeners

### Nowa wersja (src/)
- React Components + TypeScript
- State management z React Hooks
- Typed interfaces
- Modular architecture
- Lepsze developer experience

Funkcjonalność pozostaje **identyczna** - tylko przepisana do React/TypeScript.
