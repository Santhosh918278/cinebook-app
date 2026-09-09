# CineBook - Complete Movie Reservation System

CineBook is an advanced, production-scale Movie Reservation System built using the **MERN-like stack (MySQL instead of MongoDB)**. Designed with architectural best practices in mind, this project demonstrates full-stack proficiency, deep understanding of relational database design, real-time concurrency control, responsive user interfaces, and robust state management.

## 🚀 Key Features & Functionality

### 1. Robust Concurrency Control (Preventing Double Booking)
A critical feature in any reservation system, CineBook prevents race conditions when two users try to book the exact same seat simultaneously. 
- **Database Transactions & Locks**: The checkout flow wraps seat verification and booking insertion inside a strict MySQL Database Transaction (`connection.beginTransaction()`). If *any* step fails, the transaction rolls back, guaranteeing data integrity.
- **Pending Reservation Locking**: When a user clicks "Book", the backend checks against currently `confirmed` bookings **AND** any `pending` bookings made within the last 5 minutes. This creates a temporary "lock" on the seat during the payment flow, preventing others from snagging the seat right out from under the user.

### 2. Intelligent Seat Rendering Engine
Rather than relying on static images, the seat map dynamically constructs itself from the `seats` and `screens` tables. The frontend groups individual seats (e.g., A1, A2, B1) contextually by their `row_label`, applying grid-based CSS. The seat status is merged with the live booking data to visually lock (disable) booked seats on the user's screen in real-time. 

### 3. User & Authentication
- Password hashing utilizing `bcrypt` for secure authentication storing in `password_hash`.
- Context-based global auth (`AuthContext` with local storage persistence), ensuring users must log in to access the booking and checkout pipelines.

---

## 💻 Technical Stack

| Area | Technologies Used |
|---|---|
| **Frontend** | React 18 (Vite), React Router v6, Tailwind CSS, ShadCN UI / Radix UI forms, TanStack React Query (`react-query`), Axios, Lucide React (Icons) |
| **Backend** | Node.js, Express.js, `mysql2` API (with connection pooling), CORS, bcrypt |
| **Database** | Relational SQL (MySQL / MariaDB) |

---

## 🗄️ Relational Database Schema Architecture

The database schema (`movie_reservation_system`) is highly normalized down to 3NF logic, built to handle scale, multi-screen multiplexes, and precise historical record-keeping.

### Core Tables:
1. **`movies`**: Standard metadata catalog. Includes `movie_id (PK)`, `title`, `description`, `duration`, `genre`, `language`, `release_date`, and `status` (active/removed).
2. **`screens` & `theaters`**: Accounts for multi-theater architecture. `theaters` (name, city, address) hold many `screens` (screen_name, total_seats).
3. **`shows`**: The intersection of mapping a movie to a screen at a specific time. Includes `show_id (PK)`, `movie_id (FK)`, `screen_id (FK)`, `show_date`, `start_time`, `end_time`, and highly-specific dynamic `price` fields.
4. **`seats`**: The absolute source-of-truth for screen topography. Includes row indexing `row_label (char)`, `seat_number (int)`, and configurable pricing tiers (`seat_type: regular, premium, recliner`).

### Transactional Fact Tables:
1. **`users`**: Secure account details (`user_id`, `name`, `email`, `password_hash`).
2. **`bookings`**: The main reservation order ticket. Tracks `user_id`, `show_id`, `total_amount`, status (`pending`, `confirmed`, `cancelled`), and timestamp.
3. **`booking_seats`**: Resolves the many-to-many relationship of a single booking containing multiple specific seats. Joins `booking_id` to `seat_id`.
4. **`payments`**: Handles the financial transaction state attached to a reservation (`booking_id`). Tracks gateway, `transaction_id`, amount, and status (`success`, `failed`, `pending`).

---

## 🛠️ Installation & Setup Guide

### 1. Database Setup
1. Launch your MySQL server instance.
2. Ensure you have created the `movie_reservation_system` database and imported the schema exactly as defined above.
3. Seed your `seats` table properly for the applicable `screens`. *(A utility seed file `seed_seats.js` is available in the backend to bulk-insert screen topologies).*
4. Verify credentials in `backend/db.js` (`user`, `password`, `host`).

### 2. Backend Server Application
Open your terminal and navigate to the `/backend` folder.
```bash
cd backend
npm install
node server.js
```
The Express server starts listening on `http://localhost:5000`. Watch your console for the `mysql connected successfully` log line.

### 3. Frontend Client App
Open a separate terminal and navigate to the frontend directory.
```bash
cd "cinibook"
npm install
npm run dev
```
The Vite development server will start the application, typically on `http://localhost:8081`.

---

## 🧠 System Workflows (For Interview Discussion)

### The Booking Transaction Flow
1. **Pre-flight**: User selects a `show_id` in the UI. Frontend requests live seat status.
2. **View**: Backend executes a `LEFT JOIN` on `bookings` and `booking_seats` where status is confirmed/payment pending. The Frontend renders this map.
3. **Action**: User selects specific seats and hits "Book".
4. **Validation**: Backend opens a MySQL `BEGIN TRANSACTION`. It re-verifies these exact seats haven't been picked up in the background (`SELECT ... FOR UPDATE` isolation style patterns or time-based threshold validation). 
5. **Soft Lock**: If clear, inserts a `pending` row into `bookings` and registers the seats in `booking_seats`.
6. **Payment Phase**: Navigates user to Payment confirmation screen. Upon success, an `UPDATE` flips the booking status to `confirmed` and issues an `INSERT` into `payments`.

*(This pipeline guarantees no two users walk away believing they have bought the exact same ticket).*

### Seat Availability Query Logic
The seat status is determined by a carefully crafted SQL query that joins 3 tables:
```sql
SELECT s.seat_id, s.row_label, s.seat_number, s.seat_type,
  CASE WHEN b.status = 'confirmed' THEN 'booked' ELSE 'available' END AS status
FROM seats s
LEFT JOIN booking_seats bs ON s.seat_id = bs.seat_id
LEFT JOIN bookings b ON bs.booking_id = b.booking_id
  AND b.show_id = ? AND b.status = 'confirmed'
WHERE s.screen_id = ?
```
This `LEFT JOIN` approach ensures **all seats** are returned, with their real-time status calculated dynamically from the `bookings` and `booking_seats` tables — not stored as a mutable column.

### Password Security
- User passwords are **never stored in plaintext**.
- On registration, bcrypt generates a salted hash (`bcrypt.hash(password, 10)`).
- On login, `bcrypt.compare()` validates the input against the stored `password_hash`.
- The salt rounds (10) provide strong protection against brute-force and rainbow table attacks.

### Frontend State Management
- **React Context API** (`AuthContext`) provides global authentication state across all components.
- **TanStack React Query** handles server state (movies, shows, bookings) with built-in caching, background refetching, and stale-while-revalidate patterns.
- **Local Storage Persistence**: Auth tokens and user data survive page reloads without re-authentication.

---

## 📊 Entity-Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   theaters   │       │   screens    │       │    seats     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ theater_id PK│──1:N──│ screen_id PK │──1:N──│ seat_id   PK │
│ name         │       │ theater_id FK│       │ screen_id FK │
│ city         │       │ screen_name  │       │ row_label    │
│ address      │       │ total_seats  │       │ seat_number  │
└──────────────┘       └──────┬───────┘       │ seat_type    │
                              │               └──────┬───────┘
                              │                      │
                       ┌──────┴───────┐       ┌──────┴───────┐
                       │    shows     │       │booking_seats │
                       ├──────────────┤       ├──────────────┤
                       │ show_id   PK │       │booking_seat  │
┌──────────────┐       │ movie_id  FK │       │  _id      PK │
│   movies     │       │ screen_id FK │       │booking_id FK │
├──────────────┤       │ show_date    │       │ seat_id   FK │
│ movie_id  PK │──1:N──│ start_time   │       └──────┬───────┘
│ title        │       │ end_time     │              │
│ description  │       │ price        │              │
│ duration     │       └──────┬───────┘       ┌──────┴───────┐
│ genre        │              │               │   bookings   │
│ language     │              │               ├──────────────┤
│ release_date │              └───────N:1─────│ booking_id PK│
│ poster_url   │                              │ user_id   FK │
│ status       │         ┌──────────────┐     │ show_id   FK │
└──────────────┘         │    users     │     │ total_amount │
                         ├──────────────┤     │ status       │
                         │ user_id   PK │─1:N─│ created_at   │
                         │ name         │     └──────┬───────┘
                         │ email (UQ)   │            │
                         │ password_hash│     ┌──────┴───────┐
                         │ created_at   │     │   payments   │
                         └──────────────┘     ├──────────────┤
                                              │ payment_id PK│
                                              │ booking_id FK│
                                              │payment_status│
                                              │payment_gatewä│
                                              │transaction_id│
                                              │ amount       │
                                              │ created_at   │
                                              └──────────────┘
```

**Key Relationships:**
- `theaters` → `screens` (1:N) — One theater has many screens
- `screens` → `seats` (1:N) — Each screen has its own seat layout
- `movies` → `shows` (1:N) — A movie can have multiple showtimes
- `screens` → `shows` (1:N) — A screen can host multiple shows
- `users` → `bookings` (1:N) — A user can make many bookings
- `shows` → `bookings` (1:N) — A show can have many bookings
- `bookings` ↔ `seats` (M:N via `booking_seats`) — Many-to-many resolved through junction table
- `bookings` → `payments` (1:1) — Each booking has one payment record

---

## 📋 Complete Database Table Definitions

### `movies`
| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `movie_id` | INT(11) PK | NO | AUTO_INCREMENT | Unique movie identifier |
| `title` | VARCHAR(255) | NO | — | Movie title |
| `description` | TEXT | YES | NULL | Movie synopsis |
| `duration` | INT(11) | NO | — | Runtime in minutes |
| `genre` | VARCHAR(100) | YES | NULL | Genre category |
| `language` | VARCHAR(50) | YES | NULL | Language of the movie |
| `release_date` | DATE | YES | NULL | Release date |
| `poster_url` | VARCHAR(500) | YES | NULL | URL to poster image |
| `status` | ENUM('active','removed') | YES | 'active' | Soft delete flag |

### `theaters`
| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `theater_id` | INT(11) PK | NO | AUTO_INCREMENT | Unique theater identifier |
| `name` | VARCHAR(150) | NO | — | Theater name |
| `city` | VARCHAR(100) | NO | — | City location |
| `address` | VARCHAR(255) | NO | — | Full address |

### `screens`
| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `screen_id` | INT(11) PK | NO | AUTO_INCREMENT | Unique screen identifier |
| `theater_id` | INT(11) FK | NO | — | References `theaters.theater_id` |
| `screen_name` | VARCHAR(100) | NO | — | Display name (e.g., "Screen 1") |
| `total_seats` | INT(11) | NO | — | Maximum seating capacity |

### `seats`
| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `seat_id` | INT(11) PK | NO | AUTO_INCREMENT | Unique seat identifier |
| `screen_id` | INT(11) FK | NO | — | References `screens.screen_id` |
| `row_label` | CHAR(1) | NO | — | Row identifier (A, B, C, ...) |
| `seat_number` | INT(11) | NO | — | Seat position within row |
| `seat_type` | ENUM('regular','premium','recliner') | YES | 'regular' | Pricing tier |

### `shows`
| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `show_id` | INT(11) PK | NO | AUTO_INCREMENT | Unique showtime identifier |
| `movie_id` | INT(11) FK | YES | NULL | References `movies.movie_id` |
| `screen_id` | INT(11) FK | YES | NULL | References `screens.screen_id` |
| `show_date` | DATE | NO | — | Date of the show |
| `start_time` | TIME | NO | — | Start time |
| `end_time` | TIME | NO | — | End time |
| `price` | DECIMAL(10,2) | NO | — | Ticket price per seat |

### `users`
| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `user_id` | INT(11) PK | NO | AUTO_INCREMENT | Unique user identifier |
| `name` | VARCHAR(100) | NO | — | Full name |
| `email` | VARCHAR(150) UQ | NO | — | Email address (unique index) |
| `password_hash` | VARCHAR(255) | NO | — | bcrypt-hashed password |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Registration timestamp |

### `bookings`
| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `booking_id` | INT(11) PK | NO | AUTO_INCREMENT | Unique booking identifier |
| `user_id` | INT(11) FK | NO | — | References `users.user_id` |
| `show_id` | INT(11) FK | NO | — | References `shows.show_id` |
| `total_amount` | DECIMAL(10,2) | NO | — | Total price for all seats |
| `status` | ENUM('pending','confirmed','cancelled') | YES | 'pending' | Booking lifecycle state |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Booking timestamp |

### `booking_seats` (Junction Table)
| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `booking_seat_id` | INT(11) PK | NO | AUTO_INCREMENT | Unique row identifier |
| `booking_id` | INT(11) FK | NO | — | References `bookings.booking_id` |
| `seat_id` | INT(11) FK | NO | — | References `seats.seat_id` |

### `payments`
| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `payment_id` | INT(11) PK | NO | AUTO_INCREMENT | Unique payment identifier |
| `booking_id` | INT(11) FK | NO | — | References `bookings.booking_id` |
| `payment_status` | ENUM('pending','success','failed') | YES | 'pending' | Payment state |
| `payment_gateway` | VARCHAR(50) | YES | NULL | Gateway name (Razorpay, etc.) |
| `transaction_id` | VARCHAR(255) | YES | NULL | External transaction ID |
| `amount` | DECIMAL(10,2) | NO | — | Amount charged |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Payment timestamp |

---

## 🌐 REST API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|-------------|
| POST | `/api/auth/register` | Register new user | `{ name, email, password }` |
| POST | `/api/auth/login` | Login user | `{ email, password }` |

### Movies (`/api/movies`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/movies` | Get all active movies |
| GET | `/api/movies/:id` | Get movie by ID |
| POST | `/api/movies` | Add a new movie (Admin) |

### Shows (`/api/shows`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shows/movie/:movieId` | Get all shows for a movie |
| GET | `/api/shows/:id` | Get show details by ID |
| GET | `/api/shows/:showId/seats` | Get seat availability for a show |
| POST | `/api/shows` | Create a new showtime (Admin) |

### Bookings (`/api/bookings`)
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|-------------|
| POST | `/api/bookings` | Create a new booking | `{ user_id, show_id, seats: [seat_ids] }` |
| GET | `/api/bookings/user/:userId` | Get all bookings for a user |
| GET | `/api/bookings/:id` | Get single booking details |

### Payments (`/api/payments`)
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|-------------|
| POST | `/api/payments` | Process payment | `{ booking_id, amount, payment_gateway, transaction_id }` |

---

## 📁 Project Folder Structure

```
movie-reservation-system/
│
├── backend/                          # Express.js Backend
│   ├── server.js                     # Entry point (port 5000)
│   ├── db.js                         # MySQL connection pool config
│   ├── seed_seats.js                 # Utility to seed seats for screens
│   ├── error.log                     # Error logging file
│   ├── package.json
│   └── routes/
│       ├── auth.js                   # /api/auth (register, login)
│       ├── movieRoutes.js            # /api/movies (CRUD)
│       ├── shows.js                  # /api/shows (showtimes + seats)
│       ├── booking.js                # /api/bookings (transactional)
│       └── payments.js               # /api/payments (confirmation)
│
├── cinibook/                  # React Frontend (Vite)
│   ├── index.html                    # HTML entry point + SEO meta tags
│   ├── vite.config.ts                # Vite configuration
│   ├── tailwind.config.ts            # Tailwind CSS theme customization
│   ├── public/
│   │   ├── cinebook.svg              # Browser tab favicon
│   │   └── robots.txt
│   └── src/
│       ├── main.tsx                  # React DOM render entry
│       ├── App.tsx                   # Router + providers setup
│       ├── index.css                 # Global styles + CSS variables
│       ├── contexts/
│       │   └── AuthContext.jsx       # Global auth state management
│       ├── services/
│       │   └── api.js                # Axios API client (base: localhost:5000)
│       ├── components/
│       │   ├── Layout.jsx            # Page wrapper (Navbar + content)
│       │   ├── Navbar.jsx            # Navigation bar
│       │   ├── SeatMap.jsx           # Interactive seat grid component
│       │   └── ui/                   # Reusable shadcn/ui components
│       └── pages/
│           ├── MoviesPage.jsx        # Movie listing with search
│           ├── MovieDetailPage.jsx   # Single movie details
│           ├── ShowtimesPage.jsx     # Available showtimes
│           ├── SeatSelectionPage.jsx # Seat picker + booking action
│           ├── BookingConfirmationPage.jsx  # Post-booking receipt
│           ├── BookingHistoryPage.jsx      # User's booking history
│           ├── LoginPage.jsx         # User login form
│           ├── RegisterPage.jsx      # User registration form
│           ├── AdminDashboard.jsx    # Admin management panel
│           └── NotFound.jsx          # 404 page
│
└── README.md                         # This file
```

---

## 🛡️ Error Handling & Edge Cases

| Scenario | How It's Handled |
|----------|-----------------|
| **Double booking** | MySQL transaction + seat status re-check before INSERT |
| **Not logged in** | BookingHistoryPage shows a "Please Sign In" prompt with redirect button |
| **API failure** | Error messages displayed inline; no hardcoded fallback data masks real errors |
| **Stale seat map** | After any booking error, the seat map auto-refreshes via `fetchSeats()` and clears selection |
| **MySQL DECIMAL as string** | All monetary values wrapped in `Number()` before `.toFixed(2)` to prevent crashes |
| **Missing seats in DB** | Utility script `seed_seats.js` bulk-inserts seat layouts for any screen |
| **Port conflicts** | Vite auto-increments port (8080 → 8081) if occupied |

---

## 🎨 UI/UX Design Highlights

- **Cinema Dark Theme**: Deep black background (`hsl(240 10% 4%)`) with vibrant gold accents and pink/red action buttons
- **Premium Typography**: Uses Bebas Neue font for headings, creating a cinematic feel
- **Glassmorphism Effects**: Semi-transparent panels with subtle borders (`rgba(255,255,255,0.05)`)
- **Interactive Seat Map**: Color-coded seats (available = gray, selected = pink, booked = dark/disabled) with hover effects
- **Responsive Design**: Mobile-friendly layouts using flexbox and grid
- **Smooth Transitions**: CSS transitions on cards, buttons, and navigation elements

---

## 📌 How to Run (Quick Start)

```bash
# Terminal 1 — Start Backend
cd backend
npm install
node server.js
# → Server running on http://localhost:5000

# Terminal 2 — Start Frontend
cd cinibook
npm install
npm run dev
# → App running on http://localhost:8081
```

---

## 👨‍💻 Author

Built as a full-stack demonstration project showcasing:
- Relational database design (normalized to 3NF)
- Transaction-safe concurrent booking systems
- Modern React patterns (Context API, React Query, Hooks)
- RESTful API design with Express.js
- Responsive dark-themed UI with Tailwind CSS
