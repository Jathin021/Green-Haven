# 🚀 Deployment Guide - Green Haven Nursery

This guide covers deploying the Green Haven Nursery application to various platforms.

## 📋 Prerequisites

Before deploying, ensure you have:
- A MongoDB database (local or cloud)
- PayPal Developer account with API credentials
- Domain name (for production)
- SSL certificate (for production)

## 🐳 Docker Deployment

### Local Docker Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/Green-Haven.git
cd Green-Haven

# Run the setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Production Docker Deployment
```bash
# Build and run with production settings
docker-compose -f docker-compose.prod.yml up -d
```

## ☁️ Cloud Deployment Options

### 1. Render.com (Recommended)

The project includes a `render.yaml` file for easy deployment.

#### Backend Deployment
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set the following environment variables:
   ```
   SECRET_KEY=your-production-secret-key
   MONGO_URL=your-mongodb-connection-string
   PAYPAL_CLIENT_ID=your-paypal-client-id
   PAYPAL_SECRET=your-paypal-secret
   PAYPAL_MODE=live
   ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
   ```

#### Frontend Deployment
1. Create a new Static Site service
2. Set build command: `yarn build`
3. Set publish directory: `build`
4. Set environment variables:
   ```
   REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com
   REACT_APP_PAYPAL_CLIENT_ID=your-paypal-client-id
   ```

### 2. Heroku

#### Backend Deployment
```bash
# Create Heroku app
heroku create green-haven-backend

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set SECRET_KEY=your-production-secret-key
heroku config:set PAYPAL_CLIENT_ID=your-paypal-client-id
heroku config:set PAYPAL_SECRET=your-paypal-secret
heroku config:set PAYPAL_MODE=live
heroku config:set ALLOWED_ORIGINS=https://your-frontend-url.herokuapp.com

# Deploy
git push heroku main
```

#### Frontend Deployment
```bash
# Create Heroku app
heroku create green-haven-frontend

# Set buildpacks
heroku buildpacks:set mars/create-react-app

# Set environment variables
heroku config:set REACT_APP_BACKEND_URL=https://your-backend-url.herokuapp.com
heroku config:set REACT_APP_PAYPAL_CLIENT_ID=your-paypal-client-id

# Deploy
git push heroku main
```

### 3. DigitalOcean App Platform

#### Backend Deployment
1. Create a new App in DigitalOcean
2. Connect your GitHub repository
3. Set the source directory to `backend`
4. Configure environment variables
5. Set the run command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

#### Frontend Deployment
1. Create a new App in DigitalOcean
2. Connect your GitHub repository
3. Set the source directory to `frontend`
4. Configure environment variables
5. Set the build command: `yarn build`
6. Set the run command: `serve -s build -l $PORT`

### 4. AWS Deployment

#### Using AWS Elastic Beanstalk

##### Backend
1. Create a new Elastic Beanstalk application
2. Upload the backend code
3. Configure environment variables
4. Set up MongoDB using AWS DocumentDB or external MongoDB

##### Frontend
1. Build the React app: `yarn build`
2. Upload the `build` folder to S3
3. Configure CloudFront for CDN
4. Set up custom domain with Route 53

#### Using AWS ECS with Fargate

1. Create ECS cluster
2. Create task definitions for backend and frontend
3. Set up Application Load Balancer
4. Configure environment variables
5. Deploy using ECS service

### 5. Google Cloud Platform

#### Using Google App Engine

##### Backend
1. Create `app.yaml` in the backend directory:
```yaml
runtime: python311
entrypoint: uvicorn server:app --host 0.0.0.0 --port $PORT

env_variables:
  SECRET_KEY: "your-secret-key"
  MONGO_URL: "your-mongodb-url"
  PAYPAL_CLIENT_ID: "your-paypal-client-id"
  PAYPAL_SECRET: "your-paypal-secret"
  PAYPAL_MODE: "live"
```

2. Deploy: `gcloud app deploy`

##### Frontend
1. Build the app: `yarn build`
2. Create `app.yaml` in the build directory:
```yaml
runtime: nodejs16
handlers:
  - url: /static
    static_dir: static
  - url: /.*
    static_files: index.html
    upload: index.html
```

2. Deploy: `gcloud app deploy`

## 🔧 Environment Configuration

### Production Environment Variables

#### Backend
```env
# Security
SECRET_KEY=your-super-secure-production-secret-key

# Database
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/nursery_ecommerce

# PayPal (Production)
PAYPAL_CLIENT_ID=your-production-paypal-client-id
PAYPAL_SECRET=your-production-paypal-secret
PAYPAL_MODE=live

# CORS
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# Admin
ADMIN_RESET_TOKEN=your-secure-admin-token

# Logging
LOG_LEVEL=WARNING
```

#### Frontend
```env
REACT_APP_BACKEND_URL=https://your-backend-domain.com
REACT_APP_PAYPAL_CLIENT_ID=your-production-paypal-client-id
```

## 🔒 Security Considerations

### Production Security Checklist
- [ ] Use strong, unique SECRET_KEY
- [ ] Enable HTTPS everywhere
- [ ] Set up proper CORS origins
- [ ] Use production PayPal credentials
- [ ] Secure MongoDB connection
- [ ] Set up proper logging
- [ ] Remove debug endpoints
- [ ] Set up monitoring and alerts
- [ ] Regular security updates
- [ ] Database backups

### SSL/TLS Setup
- Obtain SSL certificate (Let's Encrypt is free)
- Configure your web server (nginx, Apache)
- Redirect HTTP to HTTPS
- Set up HSTS headers

## 📊 Monitoring and Logging

### Application Monitoring
- Set up health checks
- Monitor response times
- Track error rates
- Set up alerts for downtime

### Database Monitoring
- Monitor MongoDB performance
- Set up database backups
- Track connection usage
- Monitor disk space

### Payment Monitoring
- Monitor PayPal transaction success rates
- Set up payment failure alerts
- Track refund rates
- Monitor for suspicious activity

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          # Add your deployment commands here

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          # Add your deployment commands here
```

## 🚨 Troubleshooting

### Common Issues

#### Backend Issues
- **Database Connection**: Check MONGO_URL and network access
- **PayPal Integration**: Verify credentials and mode settings
- **CORS Errors**: Check ALLOWED_ORIGINS configuration
- **Memory Issues**: Increase container memory limits

#### Frontend Issues
- **Build Failures**: Check Node.js version and dependencies
- **API Connection**: Verify REACT_APP_BACKEND_URL
- **PayPal Buttons**: Check REACT_APP_PAYPAL_CLIENT_ID

#### General Issues
- **Environment Variables**: Ensure all required variables are set
- **Port Conflicts**: Check if ports are available
- **SSL Issues**: Verify certificate configuration

### Debug Commands
```bash
# Check backend logs
docker-compose logs backend

# Check frontend logs
docker-compose logs frontend

# Check database connection
docker-compose exec backend python -c "import motor; print('DB OK')"

# Test API endpoints
curl http://localhost:8001/api/plants
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review the logs
3. Verify environment configuration
4. Test locally first
5. Contact support with specific error messages

---

**Happy Deploying! 🚀** 