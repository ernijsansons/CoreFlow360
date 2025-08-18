# Placeholder Dockerfile for CI/CD compatibility
# This project deploys to Vercel and doesn't use Docker for production
# This file exists only to prevent CI/CD pipeline errors

FROM node:20-alpine
LABEL maintainer="CoreFlow360"
LABEL description="Placeholder for CI/CD - actual deployment uses Vercel"

# This Dockerfile is intentionally minimal as the app runs on Vercel
# See vercel.json for actual deployment configuration