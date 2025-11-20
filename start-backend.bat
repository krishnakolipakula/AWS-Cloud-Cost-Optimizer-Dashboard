@echo off
echo ========================================
echo Starting AWS Backend on Port 4000
echo ========================================
cd /d "C:\Users\Krishna\OneDrive\Desktop\UF\cloudmern\aws-backend"
set AWS_ACCESS_KEY_ID=test
set AWS_SECRET_ACCESS_KEY=test
set AWS_REGION=us-east-1
npm run start:local
pause
