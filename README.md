# Here are your Instructions

## Production Deployment Notes

### Backend (FastAPI)
- Set environment variables in your production environment:
  - `SECRET_KEY` (required, strong random string)
  - `MONGO_URL` (your MongoDB connection string)
  - `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET` (PayPal API credentials)
  - `PAYPAL_MODE` ("live" for production, "sandbox" for testing)
  - `ALLOWED_ORIGINS` (comma-separated list of allowed frontend origins, e.g. "https://yourdomain.com")
- Run with a production server (e.g., `uvicorn backend.server:app --host 0.0.0.0 --port 8001 --workers 4`)
- Use HTTPS in production.

### Frontend (React)
- Set environment variables in your deployment platform:
  - `REACT_APP_BACKEND_URL` (URL of your backend API)
  - `REACT_APP_PAYPAL_CLIENT_ID` (PayPal client ID)
- Build for production: `yarn build` or `npm run build`
- Serve the `build/` directory with a static file server or integrate with backend.

### General
- Remove or secure any test/dev endpoints before deploying.
- Set logging to WARNING or ERROR in production.
- Ensure all secrets are set via environment variables, not hardcoded.
