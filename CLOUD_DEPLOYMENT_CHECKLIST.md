# Cloud Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Preparation
- [ ] All code is committed to Git
- [ ] No hardcoded secrets or API keys
- [ ] Environment variables are externalized
- [ ] `.env` file is in `.gitignore`
- [ ] Database migrations are ready (if using migrations)

### ✅ Docker Configuration
- [ ] Dockerfile is tested locally
- [ ] Docker image builds successfully
- [ ] Container runs locally without errors
- [ ] Health check endpoint works
- [ ] Port 8000 is exposed correctly

### ✅ Security
- [ ] SECRET_KEY is generated (use: `openssl rand -hex 32`)
- [ ] CORS origins are restricted for production
- [ ] Database credentials are secure
- [ ] No sensitive data in code or logs

### ✅ Testing
- [ ] All tests pass locally
- [ ] API endpoints are tested
- [ ] Frontend builds successfully
- [ ] Health check works

---

## Cloud Provider Setup

### Azure

#### Prerequisites
- [ ] Azure account created
- [ ] Azure CLI installed (`az --version`)
- [ ] Logged in (`az login`)

#### Resources to Create
- [ ] Resource Group
- [ ] Container Registry (ACR)
- [ ] Container Instance OR App Service
- [ ] (Optional) PostgreSQL Database

#### Deployment Steps
1. [ ] Create resource group
2. [ ] Create container registry
3. [ ] Build and push Docker image
4. [ ] Deploy container instance
5. [ ] Configure environment variables
6. [ ] Set up custom domain (optional)
7. [ ] Configure SSL/TLS
8. [ ] Test deployment

### Google Cloud Platform

#### Prerequisites
- [ ] GCP account created
- [ ] gcloud CLI installed
- [ ] Project created
- [ ] Billing enabled

#### Resources to Create
- [ ] Cloud Run service
- [ ] Container Registry
- [ ] (Optional) Cloud SQL (PostgreSQL)

#### Deployment Steps
1. [ ] Set GCP project
2. [ ] Build and push to GCR
3. [ ] Deploy to Cloud Run
4. [ ] Configure environment variables
5. [ ] Set up custom domain
6. [ ] Test deployment

### AWS

#### Prerequisites
- [ ] AWS account created
- [ ] AWS CLI installed
- [ ] IAM user with permissions

#### Resources to Create
- [ ] ECR repository
- [ ] ECS cluster
- [ ] ECS task definition
- [ ] ECS service
- [ ] (Optional) RDS (PostgreSQL)
- [ ] (Optional) Application Load Balancer

#### Deployment Steps
1. [ ] Create ECR repository
2. [ ] Build and push Docker image
3. [ ] Create ECS task definition
4. [ ] Create ECS service
5. [ ] Configure environment variables
6. [ ] Set up load balancer
7. [ ] Test deployment

---

## Environment Variables

### Required Variables
```env
SECRET_KEY=<generated-secret-key>
PYTHONUNBUFFERED=1
```

### Optional Variables
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
CORS_ORIGINS=https://yourdomain.com
ACCESS_TOKEN_EXPIRE_MINUTES=43200
PORT=8000
```

### How to Set in Cloud Platforms

**Azure Container Instances:**
```bash
az container create \
  --environment-variables \
    SECRET_KEY=xxx \
    PYTHONUNBUFFERED=1
```

**Azure App Service:**
```bash
az webapp config appsettings set \
  --settings SECRET_KEY=xxx PYTHONUNBUFFERED=1
```

**Google Cloud Run:**
```bash
gcloud run deploy athenaa \
  --set-env-vars SECRET_KEY=xxx,PYTHONUNBUFFERED=1
```

**AWS ECS:**
```json
{
  "environment": [
    {"name": "SECRET_KEY", "value": "xxx"},
    {"name": "PYTHONUNBUFFERED", "value": "1"}
  ]
}
```

---

## Post-Deployment Verification

### ✅ Application Health
- [ ] Health endpoint responds: `GET /api/health`
- [ ] API documentation accessible: `/docs`
- [ ] Market data endpoint works: `GET /market/price/AAPL`
- [ ] Frontend loads correctly
- [ ] No errors in logs

### ✅ Security
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] No sensitive data exposed
- [ ] Authentication works

### ✅ Performance
- [ ] Response times are acceptable (< 1s)
- [ ] No memory leaks
- [ ] Database queries are optimized
- [ ] Container resources are adequate

### ✅ Monitoring
- [ ] Logs are accessible
- [ ] Metrics are being collected
- [ ] Alerts are configured
- [ ] Error tracking is set up

---

## Maintenance Tasks

### Daily
- [ ] Check application logs for errors
- [ ] Monitor resource usage
- [ ] Verify health checks

### Weekly
- [ ] Review security logs
- [ ] Check for dependency updates
- [ ] Review performance metrics

### Monthly
- [ ] Update dependencies
- [ ] Review and rotate secrets
- [ ] Database backup verification
- [ ] Security audit

---

## Rollback Plan

### If Deployment Fails

1. **Keep Previous Version**
   - Tag previous working image
   - Keep it in registry

2. **Quick Rollback**
   ```bash
   # Azure
   az container create --image <previous-image-tag>
   
   # GCP
   gcloud run deploy athenaa --image <previous-image-tag>
   
   # AWS
   # Update ECS service to previous task definition
   ```

3. **Database Rollback**
   - Restore from backup if schema changed
   - Revert migrations if needed

---

## Cost Optimization

### Azure
- [ ] Use Basic SKU for ACR (if not needed)
- [ ] Right-size container instances
- [ ] Use App Service for better scaling

### GCP
- [ ] Use Cloud Run (pay per request)
- [ ] Set min instances to 0 for dev
- [ ] Use preemptible instances if applicable

### AWS
- [ ] Use Fargate Spot for non-critical workloads
- [ ] Right-size ECS tasks
- [ ] Use reserved capacity for production

---

## Documentation

- [ ] Deployment guide is updated
- [ ] Environment variables are documented
- [ ] API endpoints are documented
- [ ] Troubleshooting guide is available
- [ ] Team has access to documentation

---

## Support Contacts

- **DevOps Team**: [contact]
- **Cloud Provider Support**: [contact]
- **Application Team**: [contact]

---

**Last Updated**: February 2026
