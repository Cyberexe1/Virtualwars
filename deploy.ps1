gcloud run deploy civic-clarity `
  --source . `
  --region us-central1 `
  --platform managed `
  --allow-unauthenticated `
  --port 8080 `
  --memory 512Mi `
  --set-env-vars "NODE_ENV=production,FIREBASE_PROJECT_ID=virtualpromptwars-eb2fd,VERTEX_AI_PROJECT=virtualpromptwars-eb2fd,VERTEX_AI_LOCATION=us-central1,EMAIL_USER=vikastiwari1045@gmail.com,EMAIL_APP_PASSWORD=bcgo rpvb nzac auaw,EMAIL_FROM_NAME=ElectionBond,ALLOWED_ORIGINS=https://civic-clarity-uc.a.run.app" `
  --project virtualpromptwars-eb2fd
