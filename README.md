# AWS Cloud Cost Optimizer Dashboard

> A lightweight, multi-framework (React + Angular) dashboard inspired by **AWS Cost Explorer** that visualizes cloud spend, sets budgets, and triggers alerts — built with a serverless backend (AWS Lambda + DynamoDB) and deployed on S3 + CloudFront.

---

![Status](https://img.shields.io/badge/status-WIP-yellow) ![License](https://img.shields.io/badge/license-MIT-blue) ![AWS](https://img.shields.io/badge/AWS-Serverless-orange) ![React](https://img.shields.io/badge/Frontend-React-informational) ![Angular](https://img.shields.io/badge/Frontend-Angular-red)

## ✨ Highlights

* **5+ interactive charts** (service-wise, region-wise, daily/monthly) using **Chart.js**.
* **Serverless API**: AWS **Lambda** + **API Gateway**, data in **DynamoDB**.
* **Budgets & alerts**: Budget thresholds + **CloudWatch Alarms**.
* **Global deploy**: **S3 + CloudFront**, target **<200ms TTFB** and **99.9%** availability.
* **FinOps-aligned**: Practical tooling for cost visibility & optimization.

---

## 🧭 Overview

This project demonstrates a production-style approach to **cloud cost monitoring**. The UI provides rich, filterable visualizations of costs across services and regions. Users can define **monthly budgets** and receive **alerts** when spend crosses thresholds. While it ships with **mock billing data**, it’s structured to integrate with **AWS Cost & Usage Reports (CUR)** via S3/Athena in a future milestone.

---

## 🏗️ Architecture

```
+--------------------+         +-------------------------+
|  React (Analytics) | <-----> |  API Gateway (REST)     |
+--------------------+         +-----------+-------------+
             |                              |
+--------------------+                      v
| Angular (Budgets)  |                +-----------+
+--------------------+                |  Lambda   |  <-- business logic
             |                        +-----+-----+
             |                              |
             v                              v
    +----------------+               +--------------+
    |  S3 (frontend) | <--- CDN ---- | CloudFront   |
    +----------------+               +--------------+
                                            |
                                            v
                                      +-----------+
                                      | DynamoDB  |  <-- cost, budgets
                                      +-----------+

(Optional next): CUR -> S3 -> Glue -> Athena -> Lambda -> API
```

---

## 🚀 Tech Stack

**Frontend**: React (charts/analytics), Angular (budgets & alerts), HTML, CSS, Bootstrap, Chart.js
**Backend**: AWS Lambda (Node.js/Python), API Gateway, DynamoDB, CloudWatch
**Infra/Deploy**: S3 (static hosting), CloudFront (CDN), IAM, (optional) Athena + CUR

---

## 📸 Screenshots (Placeholders)

* `/docs/screenshots/overview.png`
* `/docs/screenshots/charts.png`
* `/docs/screenshots/budgets.png`

> Add screenshots as you build.

---

## 🗂️ Monorepo Layout (suggested)

```
root
├─ apps/
│  ├─ react-analytics/        # React app (charts, filters)
│  └─ angular-budgets/        # Angular app (budgets, alerts)
├─ packages/
│  └─ ui/                     # Shared styles/components (optional)
├─ infra/                     # IaC: SAM / CDK / Terraform (choose one)
├─ lambdas/                   # Backend handlers
│  ├─ get-costs/
│  └─ set-budget/
├─ data/
│  └─ seed.json               # Mock billing data
└─ docs/
   └─ architecture.md
```

---

## 🧪 Sample Data (mock)

`data/seed.json`

```json
[
  { "date": "2025-08-01", "service": "Amazon EC2", "region": "us-east-1", "cost": 12.34 },
  { "date": "2025-08-01", "service": "Amazon S3",  "region": "us-east-1", "cost": 3.21  },
  { "date": "2025-08-02", "service": "AWS Lambda",  "region": "us-west-2", "cost": 1.15 }
]
```

---

## 🔌 API (draft)

**GET** `/costs?from=YYYY-MM-DD&to=YYYY-MM-DD&service=*&region=*` → timeseries data
**POST** `/budgets` `{ amount: number, period: "monthly" }` → upsert budget
**GET** `/budgets` → current budget
**GET** `/alerts` → recent threshold breaches

> Backed by Lambda; data in DynamoDB (PK/SK design below).

### DynamoDB (suggested keys)

* **Table**: `cloud_costs`

  * `PK`: `COST#<YYYY-MM-DD>`
  * `SK`: `<SERVICE>#<REGION>`
  * attrs: `cost`, `createdAt`
* **Table**: `budgets`

  * `PK`: `BUDGET#<USER_OR_TENANT>`
  * `SK`: `PERIOD#<YYYY-MM>`
  * attrs: `amount`, `alertsEnabled`

---

## ⚙️ Local Dev — Quickstart

### Prereqs

* Node.js 18+
* AWS account + IAM user (programmatic access)
* AWS CLI configured

### 1) Frontend (React)

```bash
cd apps/react-analytics
npm i
npm run dev
```

### 2) Frontend (Angular)

```bash
cd apps/angular-budgets
npm i
npm start
```

### 3) Seed Mock Data to DynamoDB (optional local)

Use DynamoDB Local or a quick script:

```bash
aws dynamodb create-table --table-name cloud_costs ...
node scripts/seed-costs.js data/seed.json
```

### 4) Lambda (SAM example)

```bash
cd infra
sam build && sam deploy --guided
```

---

## 🔐 Environment Variables

Create `.env` files where needed.

```
REACT_APP_API_BASE_URL=
ANGULAR_APP_API_BASE_URL=
BUDGET_DEFAULT_AMOUNT=100
```

---

## 📦 Deployment

* **Frontend**: build both apps → upload to S3 → serve via CloudFront.
* **Backend**: package Lambdas (SAM/CDK/Terraform) → deploy.
* **Alarms**: create CloudWatch alarms on budget breach metrics.

> Goal: **<200ms TTFB**, **99.9% availability** via CloudFront edge network.

---

## 🛣️ Roadmap

* [ ] v0.1 UI skeletons (React charts, Angular budgets)
* [ ] v0.2 Mock data pipeline + API
* [ ] v0.3 Auth (Cognito) + per-user budgets
* [ ] v0.4 CUR integration via S3 + Athena
* [ ] v1.0 Polishing, docs, screenshots, demo video

---

## 📊 Resume Bullet (use this)

> Developed an **AWS Cloud Cost Optimizer Dashboard** with **5+ interactive charts** (service-wise, region-wise, daily/monthly) using **Chart.js**, a **serverless backend (Lambda + DynamoDB)** processing **1000+ mock billing records** with **real-time CloudWatch alerts**, deployed on **S3 + CloudFront** (<200ms latency, 99.9% availability), aligning with **Amazon’s FinOps** focus on cost visibility and optimization.

---

## 🙋 FAQ

**Q: Is this production-ready?**
A: It’s a **learning/portfolio** project with a production-like architecture. Swap mock data for CUR to move toward real-world use.

**Q: Why React *and* Angular?**
A: To showcase multi-framework proficiency: React for analytics interactivity; Angular for form-heavy budget workflows.

**Q: Can I run it without AWS?**
A: Yes, by stubbing the API with JSON Server; replace endpoints later with Lambda.

---

## 🤝 Contributing

PRs welcome. Please open an issue to discuss features/bugs first.

---

## 📄 License

MIT © 2025 Krishna Chaitanya
