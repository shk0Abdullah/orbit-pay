import { action, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Internal mutation to store prediction result in DB. Not callable from client.
export const recordPrediction = internalMutation({
  args: {
    prediction_id: v.string(),
    predicted_score: v.string(),
    confidence: v.float64(),
    probabilities: v.any(),
    input_data: v.any(),
    model_version: v.string(),
    timestamp: v.string(),
    clerkId: v.optional(v.string()),
    customer_id: v.optional(v.string()),
    createdAt: v.float64(),
  },
  async handler(ctx, args) {
    return await ctx.db.insert("credit_predictions", {
      prediction_id: args.prediction_id,
      predicted_score: args.predicted_score,
      confidence: args.confidence,
      probabilities: args.probabilities,
      input_data: args.input_data,
      model_version: args.model_version,
      timestamp: args.timestamp,
      clerkId: args.clerkId,
      customer_id: args.customer_id,
      createdAt: args.createdAt,
    });
  },
});

export const predictCreditScore = action({
  args: {
    input: v.any(),
    requesterClerkId: v.optional(v.string()),
  },
  async handler(ctx, { input, requesterClerkId }) {
    // Call the external FastAPI model (configurable via MODEL_URL env var)
    const MODEL_URL = process.env.MODEL_URL || "https://toqir12-orbitpay-backend.hf.space/api/v1/predict";

    const res = await fetch(MODEL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      throw new Error(`Model API error: ${res.status}`);
    }

    const json = await res.json();

    // Store the prediction in Convex DB using internal mutation
    await ctx.runMutation(internal.predictions.recordPrediction, {
      prediction_id: json.prediction_id,
      predicted_score: json.predicted_score,
      confidence: json.confidence,
      probabilities: json.probabilities,
      input_data: json.input_data,
      model_version: json.model_version,
      timestamp: json.timestamp,
      clerkId: requesterClerkId ?? undefined,
      customer_id: json.input_data?.customer_id ?? undefined,
      createdAt: Date.now(),
    });

    return json;
  },
});

export const getPredictionByPredictionId = query({
  args: { prediction_id: v.string() },
  async handler(ctx, { prediction_id }) {
    return await ctx.db
      .query("credit_predictions")
      .withIndex("by_prediction_id", (q) => q.eq("prediction_id", prediction_id))
      .first();
  },
});

export const getPredictionsForCustomer = query({
  args: { customer_id: v.string(), limit: v.optional(v.number()) },
  async handler(ctx, { customer_id, limit = 10 }) {
    return await ctx.db
      .query("credit_predictions")
      .withIndex("by_customer_id", (q) => q.eq("customer_id", customer_id))
      .take(limit);
  },
});

export const getPredictionsForClerk = query({
  args: { clerkId: v.string(), limit: v.optional(v.number()) },
  async handler(ctx, { clerkId, limit = 10 }) {
    return await ctx.db
      .query("credit_predictions")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .take(limit);
  },
});