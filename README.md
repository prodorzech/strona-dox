# Pandora Box

Profesjonalna strona do zarządzania doxami z pięknym panelem admina.

## Cechy

✨ **Dużo animacji** - fade-in, slide-in, scale, pulse i więcej
🎨 **Motyw czarno-szaro-biały** - elegancki design
🔐 **Bezpieczny panel admina** - logowanie wymagane do /adminp
📊 **Zarządzanie danymi** - dodawanie, edytowanie, usuwanie doxów
🖼️ **Galeria zdjęć** - do 20 zdjęć na doxa, kafelkowy layout, lightbox
📋 **Tabelki danych** - dynamiczne tabele z dowolnymi danymi
🗄️ **Baza JSON** - pliki przechowywane w `/baza` folderze

## Instalacja

1. Zainstaluj Node.js (https://nodejs.org)

2. Przejdź do folderu projektu i zainstaluj zależności:
```bash
cd "c:\Users\orzec\Documents\77 orzech\WakeUp DOX"
npm install
```

## Uruchomienie

```bash
npm start
```

Serwer będzie dostępny pod:
- **Strona główna**: http://localhost:3000
- **Panel admina**: http://localhost:3000/adminp

## Dane logowania do panelu admina

- **Login**: `orzechszefu`
- **Hasło**: `Siemasiema123!`

## Struktura projektu

```
WakeUp DOX/
├── baza/                 # Baza danych JSON
│   └── dox_*.json       # Pliki z danymi doxów
├── public/              # Frontend
│   ├── index.html       # Strona główna
│   ├── admin.html       # Panel admina
│   ├── styles.css       # Style strony głównej
│   ├── admin.css        # Style panelu admina
│   ├── app.js           # JavaScript strony głównej
│   └── admin.js         # JavaScript panelu admina
├── server.js            # Backend (Express)
└── package.json         # Zależności
```

## Użytkowanie panelu admina

1. Zaloguj się na `/adminp`
2. Kliknij "+ Add New Dox"
3. Wypełnij formularz:
   - **Nick** - nazwa osoby
   - **Short Description** - krótki opis (widoczny na głównej stronie)
   - **Full Description** - pełny opis (widoczny po kliknięciu)
   - **Data Tables** - dowolne tabele z danymi
   - **Images** - do 20 zdjęć

4. Kliknij "Save Dox"

## Funkcje strony głównej

- **Kafelkowa siatka** - przejrzysty layout doxów
- **Kliknięcie na doxa** - otworzy modal z pełnymi danymi
- **Galeria zdjęć** - kafelki zdjęć w modalu
- **Lightbox** - kliknij na zdjęcie aby powiększyć z nawigacją

## API

### GET /api/doxes
Pobiera listę wszystkich doxów

### GET /api/doxes/:id
Pobiera szczegóły konkretnego doxa

### POST /api/doxes
Tworzy nowego doxa

### PUT /api/doxes/:id
Aktualizuje istniejącego doxa

### DELETE /api/doxes/:id
Usuwa doxa

## Technologia

- **Frontend**: HTML5, CSS3 (bez frameworków)
- **Backend**: Node.js + Express
- **Baza**: JSON files
- **Animacje**: CSS keyframes

## Autor

Pandora Box © 2026
