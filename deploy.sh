#!/bin/bash
set -e

PROJECT_ID="audioviz-neuralframes"
REGION="europe-west1"
SERVICE_NAME="audioviz-backend"
IMAGE="eu.gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Building and deploying AudioViz backend to Cloud Run..."

# Build & push Docker image
echo "📦 Building Docker image..."
gcloud builds submit ./backend \
  --tag $IMAGE \
  --project $PROJECT_ID

# Deploy to Cloud Run
echo "☁️  Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --set-env-vars "FAL_KEY=$FAL_KEY" \
  --project $PROJECT_ID

echo "✅ Deployment complete!"
echo ""
echo "🔗 Your backend URL:"
gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --project $PROJECT_ID \
  --format "value(status.url)"
