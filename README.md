# Vishant Kumar Portfolio

Modern MERN Stack Developer portfolio with a public website, MongoDB-backed projects, contact inquiries, latest-resume downloads, and a protected admin dashboard.

## Folder Structure

```text
.
├── client                 # React + Vite frontend
│   ├── public             # Static assets
│   └── src
│       ├── components     # Reusable UI and layout
│       ├── context        # Auth and theme providers
│       ├── data           # Static portfolio content
│       ├── pages          # Public and admin pages
│       ├── services       # API client helpers
│       └── styles         # Global styles and CSS modules
└── server                 # Express + MongoDB backend
    ├── config             # Database connection
    ├── controllers        # Route handlers
    ├── middleware         # Auth and uploads
    ├── models             # Mongoose schemas
    ├── routes             # API routes
    └── uploads            # Runtime uploaded project/resume files
```

## Local Setup

1. Install dependencies:

```bash
npm install
npm run install:all
```

2. Create environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Fill `server/.env` with your MongoDB Atlas URI, JWT secret, admin seed credentials, and SMTP credentials.

4. Seed the admin user:

```bash
npm run seed:admin --prefix server
```

5. Start both apps:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`; backend runs on `http://localhost:5000`.

## Deployment

### Backend on Render

1. Create a new Render Web Service from this repository.
2. Set root directory to `server`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables from `server/.env.example`.
6. Set `CLIENT_URL` to your Vercel frontend URL.
7. Add a persistent disk or use a cloud file host if you want uploaded files to survive redeploys. Render ephemeral storage may clear runtime uploads.

### Frontend on Vercel

1. Import the repository in Vercel.
2. Set root directory to `client`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add `VITE_API_URL=https://your-render-service.onrender.com/api`.

## Production Notes

- Use a strong `JWT_SECRET`.
- Use Gmail app passwords or a production SMTP provider for Nodemailer.
- For durable production uploads, replace local Multer storage with Cloudinary, S3, or another object store.
- Create exactly one admin user unless you intentionally expand the role model.
