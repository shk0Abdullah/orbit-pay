# Credit Score Model Integration

This document describes how the OrbitPay app integrates with the external credit score prediction FastAPI model.

## Endpoint
- Default model URL (used in Convex server): `https://toqir12-orbitpay-backend.hf.space/api/v1/predict`
- You can override this by setting the `MODEL_URL` environment variable in your deployment.

## Flow
1. Frontend (protected route) sends a request to `api.predictions.predictCreditScore` (Convex mutation) with `input` (PredictionInput) and `requesterClerkId` (optional).
2. Convex mutation performs a POST to the external model URL, receives a `PredictionOutput`, and stores it in the `credit_predictions` collection.
3. Result is returned to the frontend and also persisted for historical queries.

## How to test locally
- Predict via curl (replace values as needed):

```powershell
Invoke-RestMethod -Uri 'https://toqir12-orbitpay-backend.hf.space/api/v1/predict' -Method POST -ContentType 'application/json' -Body '{"age":21,"monthly_inhand_salary":2,"num_credit_card":2,"outstanding_debt":121,"credit_utilization_ratio":100,"monthly_balance":213,"credit_mix":"Standard","customer_id":"2323"}'
```

- Use the app UI at `/(protected)/credit-score` after signing in.

## DB
- New `credit_predictions` table added to `convex/schema.ts`.
- Indexes: `by_clerkId`, `by_customer_id`, `by_prediction_id`.

## Notes & next steps
- The model endpoint currently public; if you add an API key, store it in Convex/secret env vars and add an Authorization header in the mutation.
- Consider adding more validation and rate limiting on the mutation to protect the model endpoint.
