# SmartInventory - B.Tech CSE Final Project
A complete, secure, and high-performance Inventory Management System built with the MERN stack (MongoDB, Express, React, Node.js). 

Designed specifically as an internal warehouse management tool with strict audit trails, role-based access control, and real-time MongoDB aggregations. No e-commerce bloat.

## 📁 Final Project Structure
```text
Inbentory Management System/
│
├── backend/                  # Node.js / Express Server
│   ├── config/               # Database connection (db.js)
│   ├── controllers/          # Business logic (auth, product, stock, etc.)
│   ├── middleware/           # Security, Auth, RBAC, Error Handling
│   ├── models/               # Mongoose Schemas (User, Product, StockMovement)
│   ├── routes/               # API endpoint definitions
│   ├── utils/                # Helpers (JWT generation, formatters)
│   ├── seed.js               # Admin database seeder
│   └── server.js             # Main application entry point
│
└── frontend/                 # React / Vite Client
    ├── public/               # Static assets
    ├── src/
    │   ├── components/       # Reusable UI (Cards, Modals, ProtectedRoutes)
    │   ├── context/          # React Context (AuthContext)
    │   ├── pages/            # Core views (Dashboard, Inventory, Stock IN/OUT)
    │   ├── services/         # API configurations (Axios interceptors)
    │   ├── App.jsx           # Main React Router configuration
    │   └── main.jsx          # React DOM entry
    ├── tailwind.config.js    # UI Design System configurations
    └── package.json
```

## ⚙️ Environment Variables Required
### `backend/.env`
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/smart_inventory?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:5173
```

## 🚀 How to Run the Application

### 1. Configure MongoDB Atlas
1. Create a free cluster on MongoDB Atlas.
2. Go to **Database Access** -> Create a user (save username/password).
3. Go to **Network Access** -> Add IP Address (`0.0.0.0/0` for development).
4. Go to **Databases** -> Connect -> Choose "Connect your application".
5. Copy the connection string and paste it as `MONGO_URI` in `backend/.env`.

### 2. Run the Backend
```bash
cd backend
npm install
node seed.js  # Run this ONCE to create the default admin account
npm run dev
```

### 3. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Default Admin Login Setup
Running `node seed.js` generates the following secure evaluation credentials:
- **Email:** `admin@example.com`
- **Password:** `password123`
- **Role:** `ADMIN`

---

## 🎤 Complete Demo Flow (For Viva Presentation)
1. **Login Page:** Boot the app, log in using the pre-filled admin credentials. Point out the secure JWT generation.
2. **Dashboard:** Show the Aggregation metrics. Highlight how Total Value and Low Stock alerts are calculated dynamically.
3. **Inventory Management:** 
   - Add a new product (demonstrate SKU validation).
   - Show the dynamic "View" Modal.
4. **Stock Operations (The Core Logic):** 
   - Go to **Stock IN**. Receive 50 units.
   - Go to **Stock OUT**. Try to issue more stock than is available. Highlight the **Negative Stock Prevention** validation.
   - Issue a valid amount. 
5. **Audit & Reporting:** 
   - Go to **Reports & Audit**. Show how the Stock OUT created an immutable movement record.
   - Demonstrate the CSV Export feature.
6. **Security & RBAC:** Mention that backend routes are protected by `express-mongo-sanitize` (NoSQL injection protection) and `authorize` middleware, preventing viewers from deleting stock.

---

## 🎓 Common Viva Questions & Answers

**Q1: Why did you use MongoDB Aggregation (`$facet`, `$match`, `$group`) instead of calculating metrics in React?**
*Answer:* Calculating totals (like inventory valuation) in the frontend requires fetching the entire database into browser memory, which crashes at scale. MongoDB Aggregations run directly on the database server utilizing C++ binaries, returning only the final numbers. It drastically reduces network latency and bandwidth.

**Q2: How did you prevent "Negative Inventory" during a Stock OUT operation?**
*Answer:* I used a two-layer validation approach. On the frontend, the input form dynamically restricts the `max` value and disables submission. On the backend, `stockController.js` fetches the real-time quantity using a MongoDB Session and rejects the transaction with a `400` error if the requested amount exceeds the current `quantity`.

**Q3: How did you secure your JWT tokens?**
*Answer:* The token is generated using the `JWT_SECRET` environment variable and signed with the `HS256` algorithm. For route protection, the backend extracts the token from the `Authorization: Bearer` header, verifies it, and mounts the decoded User object into `req.user`. Passwords are excluded from queries using Mongoose's `.select('-password')`.

**Q4: How did you prevent NoSQL Injections?**
*Answer:* I integrated the `express-mongo-sanitize` middleware in `server.js`. This intercepts all incoming `req.body`, `req.query`, and `req.params` and strips out any keys starting with `$` or `.`, preventing malicious operators (like `$gt` or `$ne`) from tricking the database into returning unauthorized records.

**Q5: What happens to the audit trail if a product is deleted?**
*Answer:* To maintain data integrity, I implemented a "Soft Delete" mechanism in `productController.js`. If you attempt to delete a product that has existing `StockMovement` records, the system refuses to hard-delete it and instead changes its status to `INACTIVE`. This preserves the historical audit trail perfectly.
