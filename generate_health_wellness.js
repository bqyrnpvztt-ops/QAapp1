#!/usr/bin/env node

// Generate comprehensive Health & Wellness test queries
const fs = require('fs');

const healthWellnessQueries = [
  // App sub-category (10 queries)
  {
    "id": "health_wellness_001",
    "category": "Health & Wellness",
    "sub_category": "App",
    "query": "Fitness tracking apps for weight loss goals",
    "demographic_profile": {
      "age_range": "25-40",
      "gender": "female",
      "cultural_context": "American"
    },
    "query_intent": "Find fitness tracking apps for weight loss",
    "constraints": {
      "type": "fitness tracking apps",
      "goal": "weight loss"
    },
    "expected_result_type": "app recommendations",
    "evaluation_criteria": {
      "relevance": "high",
      "accuracy": "high",
      "completeness": "high"
    }
  },
  {
    "id": "health_wellness_002",
    "category": "Health & Wellness",
    "sub_category": "App",
    "query": "Meditation and mindfulness apps for stress relief",
    "demographic_profile": {
      "age_range": "30-50",
      "gender": "female",
      "cultural_context": "American"
    },
    "query_intent": "Find meditation apps for stress relief",
    "constraints": {
      "type": "meditation apps",
      "purpose": "stress relief"
    },
    "expected_result_type": "app recommendations",
    "evaluation_criteria": {
      "relevance": "high",
      "accuracy": "high",
      "completeness": "high"
    }
  },
  {
    "id": "health_wellness_003",
    "category": "Health & Wellness",
    "sub_category": "App",
    "query": "Sleep tracking apps for better sleep quality",
    "demographic_profile": {
      "age_range": "25-45",
      "gender": "male",
      "cultural_context": "American"
    },
    "query_intent": "Find sleep tracking apps for better sleep",
    "constraints": {
      "type": "sleep tracking apps",
      "goal": "better sleep quality"
    },
    "expected_result_type": "app recommendations",
    "evaluation_criteria": {
      "relevance": "high",
      "accuracy": "high",
      "completeness": "high"
    }
  },
  {
    "id": "health_wellness_004",
    "category": "Health & Wellness",
    "sub_category": "App",
    "query": "Nutrition tracking apps for meal planning",
    "demographic_profile": {
      "age_range": "30-50",
      "gender": "female",
      "cultural_context": "American"
    },
    "query_intent": "Find nutrition tracking apps for meal planning",
    "constraints": {
      "type": "nutrition tracking apps",
      "purpose": "meal planning"
    },
    "expected_result_type": "app recommendations",
    "evaluation_criteria": {
      "relevance": "high",
      "accuracy": "high",
      "completeness": "high"
    }
  },
  {
    "id": "health_wellness_005",
    "category": "Health & Wellness",
    "sub_category": "App",
    "query": "Mental health support apps for anxiety management",
    "demographic_profile": {
      "age_range": "25-40",
      "gender": "female",
      "cultural_context": "American"
    },
    "query_intent": "Find mental health apps for anxiety management",
    "constraints": {
      "type": "mental health apps",
      "condition": "anxiety management"
    },
    "expected_result_type": "app recommendations",
    "evaluation_criteria": {
      "relevance": "high",
      "accuracy": "high",
      "completeness": "high"
    }
  },
  {
    "id": "health_wellness_006",
    "category": "Health & Wellness",
    "sub_category": "App",
    "query": "Workout planning apps for home fitness routines",
    "demographic_profile": {
      "age_range": "30-50",
      "gender": "male",
      "cultural_context": "American"
    },
    "query_intent": "Find workout planning apps for home fitness",
    "constraints": {
      "type": "workout planning apps",
      "location": "home fitness"
    },
    "expected_result_type": "app recommendations",
    "evaluation_criteria": {
      "relevance": "high",
      "accuracy": "high",
      "completeness": "high"
    }
  },
  {
    "id": "health_wellness_007",
    "category": "Health & Wellness",
    "sub_category": "App",
    "query": "Hydration reminder apps for daily water intake",
    "demographic_profile": {
      "age_range": "25-45",
      "gender": "female",
      "cultural_context": "American"
    },
    "query_intent": "Find hydration reminder apps for water intake",
    "constraints": {
      "type": "hydration reminder apps",
      "purpose": "daily water intake"
    },
    "expected_result_type": "app recommendations",
    "evaluation_criteria": {
      "relevance": "high",
      "accuracy": "high",
      "completeness": "medium"
    }
  },
  {
    "id": "health_wellness_008",
    "category": "Health & Wellness",
    "sub_category": "App",
    "query": "Period tracking apps for menstrual cycle monitoring",
    "demographic_profile": {
      "age_range": "20-40",
      "gender": "female",
      "cultural_context": "American"
    },
    "query_intent": "Find period tracking apps for cycle monitoring",
    "constraints": {
      "type": "period tracking apps",
      "purpose": "menstrual cycle monitoring"
    },
    "expected_result_type": "app recommendations",
    "evaluation_criteria": {
      "relevance": "high",
      "accuracy": "high",
      "completeness": "high"
    }
  },
  {
    "id": "health_wellness_009",
    "category": "Health & Wellness",
    "sub_category": "App",
    "query": "Breathing exercise apps for relaxation techniques",
    "demographic_profile": {
      "age_range": "30-55",
      "gender": "male",
      "cultural_context": "American"
    },
    "query_intent": "Find breathing exercise apps for relaxation",
    "constraints": {
      "type": "breathing exercise apps",
      "purpose": "relaxation techniques"
    },
    "expected_result_type": "app recommendations",
    "evaluation_criteria": {
      "relevance": "high",
      "accuracy": "high",
      "completeness": "high"
    }
  },
  {
    "id": "health_wellness_010",
    "category": "Health & Wellness",
    "sub_category": "App",
    "query": "Health monitoring apps for chronic condition management",
    "demographic_profile": {
      "age_range": "40-65",
      "gender": "female",
      "cultural_context": "American"
    },
    "query_intent": "Find health monitoring apps for chronic conditions",
    "constraints": {
      "type": "health monitoring apps",
      "purpose": "chronic condition management"
    },
    "expected_result_type": "app recommendations",
    "evaluation_criteria": {
      "relevance": "high",
      "accuracy": "high",
      "completeness": "high"
    }
  }
];

// Add remaining sub-categories (Fitness studio, Barre studio, Pilates Studio, Yoga studio, Dance Studio, Gym, Health club, EMS training, Padel, Boxing gym)
// Each with 10 queries for a total of 110 queries

fs.writeFileSync('health_wellness_test_queries.json', JSON.stringify(healthWellnessQueries, null, 2));
console.log(`Generated ${healthWellnessQueries.length} queries for Health & Wellness`);
