# Food Ordering & Restaurant Management System

A full-stack MERN app where customers can browse restaurants, order food, and track deliveries, while restaurant owners manage their menu and orders, delivery partners handle assigned deliveries, and admins oversee the whole platform.

Built as the solution to the "Online Food Ordering & Restaurant Management System" assignment.

## Tech stack

- **Backend:** Node.js, Express 5, MongoDB with Mongoose
- **Frontend:** React 19, Vite, React Router
- **Auth:** JWT, bcrypt for password hashing
- **Validation:** express-validator
- **Logging:** morgan (dev only)

## Roles

- **Customer** — browse/search restaurants, order food, track delivery, pay (mock online or COD), leave a review
- **Restaurant Owner** — create a restaurant, manage its menu, view and update orders, assign a delivery partner
- **Delivery Partner** — see assigned orders, update delivery status
- **Admin** — oversee users, restaurants, and orders platform-wide; deactivate accounts/restaurants, change user roles

## Project structure

```
backend/
  config/db.js            MongoDB connection
  models/                 Mongoose schemas (User, Restaurant, MenuItem, Order, Review)
  controllers/             route handlers, one file per resource
  routes/                  Express routers, one file per resource
  middleware/              JWT auth, role checks, validation, error handling
  utils/                   small shared helpers (asyncHandler, token creation)
  scripts/createAdmin.js   one-off script to create/promote an admin account
  server.js                app entry point

frontend/hs/
  src/api/axios.js         axios instance, attaches JWT to every request
  src/context/             Auth and Cart state (React Context)
  src/components/          Navbar, role-based route guard
  src/pages/                one component per screen, split by role (owner/, delivery/, admin/)
```

## Running it locally

You'll need Node.js and a MongoDB instance (local or Atlas).

**Backend:**
```bash
cd backend
npm install
```

Create `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/food_ordering_db
JWT_SECRET=some_long_random_string
```

```bash
npm run dev
```

Runs on `http://localhost:5000`.

**Frontend:**
```bash
cd frontend/hs
npm install
```

Create `frontend/hs/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Runs on `http://localhost:5173`.

**Creating an admin account** — the public registration form only allows signing up as customer, owner, or delivery partner on purpose. To create (or promote) an admin:
```bash
cd backend
npm run create-admin -- "Admin Name" admin@example.com somepassword
```
Running this again on an email that already has an account just promotes that account to admin instead of creating a duplicate.

## API

All endpoints are under `/api`. Full request/response details are in `API_DOCUMENTATION.md`. Short version:

| Base path | What it's for |
|---|---|
| `/api/auth` | register, login, current user, list delivery partners |
| `/api/restaurants` | browse/search restaurants, owner CRUD |
| `/api/menu` | browse/search menu items, owner CRUD |
| `/api/orders` | place order, track, owner/delivery status updates |
| `/api/reviews` | leave and read reviews |
| `/api/admin` | platform stats, user/restaurant/order oversight (admin only) |

A Postman collection (`postman_collection.json`) is included with every endpoint set up and ready to run against a local server.

## Database

See `ER_DIAGRAM.svg` for the entity relationships and `DATABASE_SCHEMA.md` for field-by-field detail on each collection.

## Docker

```bash
docker compose up --build
```
Starts MongoDB, the backend, and the frontend together. See `docker-compose.yml` for the exact ports and environment variables each service uses.

## Tests

```bash
cd backend
npm test
```
