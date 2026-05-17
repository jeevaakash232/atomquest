# AtomQuest — Backend Setup Guide

## 1. Anthropic Claude

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Add to `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
Model used: **claude-3-5-sonnet-20241022** (best balance of speed + quality)

---

## 2. AWS Setup

### IAM User
Create an IAM user with these policies:
- `AmazonS3FullAccess` (or scoped to your bucket)
- `AmazonDynamoDBFullAccess` (or scoped to your tables)
- `AWSLambdaRole` (for invoking Lambda functions)

Add to `.env`:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

---

## 3. AWS S3

```bash
# Create bucket
aws s3api create-bucket \
  --bucket atomquest-files \
  --region us-east-1

# Enable CORS for browser uploads
aws s3api put-bucket-cors \
  --bucket atomquest-files \
  --cors-configuration '{
    "CORSRules": [{
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
      "ExposeHeaders": ["ETag"]
    }]
  }'
```

Add to `.env`:
```
AWS_S3_BUCKET_NAME=atomquest-files
AWS_S3_REGION=us-east-1
```

---

## 4. AWS DynamoDB Tables

```bash
# Goals table
aws dynamodb create-table \
  --table-name atomquest-goals \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

# Users table
aws dynamodb create-table \
  --table-name atomquest-users \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

# Activity table (with TTL)
aws dynamodb create-table \
  --table-name atomquest-activity \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

aws dynamodb update-time-to-live \
  --table-name atomquest-activity \
  --time-to-live-specification "Enabled=true,AttributeName=ttl"

# Notifications table (with TTL)
aws dynamodb create-table \
  --table-name atomquest-notifications \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

aws dynamodb update-time-to-live \
  --table-name atomquest-notifications \
  --time-to-live-specification "Enabled=true,AttributeName=ttl"
```

---

## 5. AWS Lambda (Optional — for analytics)

The Lambda functions are invoked for heavy analytics. If not configured, the app falls back gracefully.

```bash
# Package and deploy (example for analytics function)
zip function.zip index.js
aws lambda create-function \
  --function-name atomquest-analytics \
  --runtime nodejs20.x \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-role \
  --handler index.handler \
  --zip-file fileb://function.zip
```

Lambda function names in `.env`:
```
LAMBDA_FUNCTION_ANALYTICS=atomquest-analytics
LAMBDA_FUNCTION_AI_BATCH=atomquest-ai-batch
LAMBDA_FUNCTION_NOTIFICATIONS=atomquest-notifications-processor
```

---

## 6. Graceful Fallback

**The app works without any AWS credentials.** All data falls back to mock data in `src/mock/data.ts`. Only add credentials when you're ready to go live.

| Feature | Without credentials | With credentials |
|---|---|---|
| AI Chat | ❌ (needs Anthropic key) | ✅ Real Claude streaming |
| Goal Generation | ❌ (needs Anthropic key) | ✅ Real Claude SMART goals |
| Goals storage | ✅ Mock data | ✅ DynamoDB |
| File uploads | ❌ (needs S3) | ✅ Direct S3 upload |
| Activity feed | ✅ Mock data | ✅ DynamoDB live feed |
| Analytics | ✅ Mock charts | ✅ Lambda-computed |

---

## 7. Run locally

```bash
npm run dev
# → http://localhost:3000
```
