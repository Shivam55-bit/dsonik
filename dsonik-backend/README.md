# dsonik-backend

Express backend for DSONIK ecommerce - starter scaffold.

Run:

```bash
npm install
npm run dev
```

What's included:

- Basic Express app with MongoDB connection
- Models: `User`, `Product`, `Category`, `Order`, `Inquiry`, `Banner`, `Coupon`, `Cart`
- Basic auth and product routes

Next steps:

1. Implement admin-protected CRUD controllers and routes.
2. Add file upload (Multer) and Cloudinary integration for images.
3. Add rate-limiting, input validation, and security hardening.
4. Build frontend admin and public UI and connect to APIs.

Image upload
- Endpoint: `POST /api/admin/uploads` (auth + admin) expects `file` form-data field.
- Uses Multer memory storage and streams to Cloudinary. Add Cloudinary keys to `.env`.

Security & validation
- Global rate limiting is enabled (15m window, 100 requests).
- Input validation is applied to auth, product and category endpoints using `express-validator`.
- Centralized error handler added.

