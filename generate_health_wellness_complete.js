#!/usr/bin/env node

// Generate comprehensive Health & Wellness test queries (110 total: 11 sub-categories × 10 queries each)
const fs = require('fs');

const healthWellnessQueries = [];

// All 11 sub-categories: App, Fitness studio, Barre studio, Pilates Studio, Yoga studio, 
// Dance Studio, Gym, Health club, EMS training, Padel, Boxing gym
const subCategories = [
  "App", "Fitness studio", "Barre studio", "Pilates Studio", "Yoga studio", 
  "Dance Studio", "Gym", "Health club", "EMS training", "Padel", "Boxing gym"
];

let queryId = 1;

subCategories.forEach(subCategory => {
  for (let i = 0; i < 10; i++) {
    const queries = {
      "App": [
        "Fitness tracking apps for weight loss goals",
        "Meditation and mindfulness apps for stress relief",
        "Sleep tracking apps for better sleep quality",
        "Nutrition tracking apps for meal planning",
        "Mental health support apps for anxiety management",
        "Workout planning apps for home fitness routines",
        "Hydration reminder apps for daily water intake",
        "Period tracking apps for menstrual cycle monitoring",
        "Breathing exercise apps for relaxation techniques",
        "Health monitoring apps for chronic condition management"
      ],
      "Fitness studio": [
        "HIIT fitness studios in Manhattan for intense workouts",
        "CrossFit gyms in Brooklyn with beginner classes",
        "Pilates studios in Queens with equipment classes",
        "Bootcamp fitness classes in Manhattan for weight loss",
        "Strength training gyms in Brooklyn with personal trainers",
        "Cardio dance studios in Queens for fun workouts",
        "Functional fitness gyms in Manhattan for athletic performance",
        "Barre fitness studios in Brooklyn with flexible schedules",
        "Spin cycling studios in Queens with music-focused classes",
        "MMA training gyms in Manhattan for self-defense"
      ],
      "Barre studio": [
        "Barre classes in Manhattan for core strengthening",
        "Beginner barre studios in Brooklyn for newcomers",
        "Advanced barre classes in Queens for experienced students",
        "Prenatal barre classes in Miami for expecting mothers",
        "Barre fusion classes in Tokyo combining multiple disciplines",
        "Barre classes with live music in London for motivation",
        "Barre classes for seniors in Paris for gentle fitness",
        "Barre classes with props in San Francisco for variety",
        "Barre classes for dancers in Chicago for technique",
        "Barre classes for athletes in Boston for cross-training"
      ],
      "Pilates Studio": [
        "Reformer Pilates classes in Manhattan for full-body workouts",
        "Mat Pilates classes in Brooklyn for core strength",
        "Prenatal Pilates classes in Queens for expecting mothers",
        "Pilates classes for seniors in Miami for gentle movement",
        "Pilates classes for athletes in Tokyo for injury prevention",
        "Pilates classes for dancers in London for flexibility",
        "Pilates classes for beginners in Paris for proper form",
        "Pilates classes for rehabilitation in San Francisco for recovery",
        "Pilates classes for weight loss in Chicago for fitness goals",
        "Pilates classes for stress relief in Boston for mental wellness"
      ],
      "Yoga studio": [
        "Hot yoga classes in Manhattan for detoxification",
        "Vinyasa flow yoga in Brooklyn for dynamic movement",
        "Yin yoga classes in Queens for deep stretching",
        "Prenatal yoga classes in Miami for expecting mothers",
        "Meditation yoga classes in Tokyo for mindfulness",
        "Power yoga classes in London for strength building",
        "Restorative yoga classes in Paris for relaxation",
        "Yoga classes for beginners in San Francisco for proper alignment",
        "Yoga classes for athletes in Chicago for flexibility",
        "Yoga classes for stress relief in Boston for mental health"
      ],
      "Dance Studio": [
        "Hip hop dance classes in Manhattan for urban style",
        "Ballet classes in Brooklyn for classical technique",
        "Salsa dance classes in Queens for Latin rhythm",
        "Contemporary dance classes in Miami for artistic expression",
        "Jazz dance classes in Tokyo for energetic movement",
        "Ballroom dance classes in London for social dancing",
        "Tap dance classes in Paris for rhythmic footwork",
        "Belly dance classes in San Francisco for cultural dance",
        "Modern dance classes in Chicago for creative movement",
        "Zumba classes in Boston for fitness dancing"
      ],
      "Gym": [
        "24-hour gyms in Manhattan for flexible workout schedules",
        "Women-only gyms in Brooklyn for comfortable environment",
        "Family-friendly gyms in Queens for all ages",
        "Luxury gyms in Miami with spa amenities",
        "Traditional gyms in Tokyo with comprehensive equipment",
        "Boutique gyms in London with specialized classes",
        "Community gyms in Paris with affordable memberships",
        "Tech-focused gyms in San Francisco with smart equipment",
        "Powerlifting gyms in Chicago for strength training",
        "Cardio-focused gyms in Boston for heart health"
      ],
      "Health club": [
        "Full-service health clubs in Manhattan with pools and spas",
        "Executive health clubs in Brooklyn with business amenities",
        "Family health clubs in Queens with childcare services",
        "Resort-style health clubs in Miami with luxury facilities",
        "Traditional health clubs in Tokyo with comprehensive services",
        "Historic health clubs in London with classic architecture",
        "Wellness-focused health clubs in Paris with holistic approach",
        "Innovation health clubs in San Francisco with cutting-edge tech",
        "Sports-focused health clubs in Chicago with athletic facilities",
        "Academic health clubs in Boston with educational programs"
      ],
      "EMS training": [
        "EMS training studios in Manhattan for efficient workouts",
        "Personal EMS training in Brooklyn for individualized sessions",
        "Group EMS training in Queens for social fitness",
        "EMS training for athletes in Miami for performance enhancement",
        "EMS training for rehabilitation in Tokyo for injury recovery",
        "EMS training for weight loss in London for fitness goals",
        "EMS training for seniors in Paris for gentle strengthening",
        "EMS training for busy professionals in San Francisco for time efficiency",
        "EMS training for muscle building in Chicago for strength goals",
        "EMS training for toning in Boston for body sculpting"
      ],
      "Padel": [
        "Padel courts in Manhattan for racquet sport enthusiasts",
        "Padel lessons in Brooklyn for beginners learning the game",
        "Padel tournaments in Queens for competitive players",
        "Padel courts with coaching in Miami for skill development",
        "Padel facilities in Tokyo for international sport",
        "Padel clubs in London for social play",
        "Padel courts with equipment rental in Paris for convenience",
        "Padel training programs in San Francisco for serious players",
        "Padel leagues in Chicago for organized competition",
        "Padel courts for families in Boston for recreational play"
      ],
      "Boxing gym": [
        "Boxing gyms in Manhattan for fitness and self-defense",
        "Boxing classes for beginners in Brooklyn for proper technique",
        "Boxing training for women in Queens for empowerment",
        "Boxing gyms with professional trainers in Miami for serious training",
        "Boxing classes for stress relief in Tokyo for mental wellness",
        "Boxing gyms with sparring in London for competitive training",
        "Boxing classes for weight loss in Paris for fitness goals",
        "Boxing gyms with equipment in San Francisco for comprehensive training",
        "Boxing classes for seniors in Chicago for gentle fitness",
        "Boxing training for kids in Boston for youth development"
      ]
    };

    const queryText = queries[subCategory][i] || `${subCategory} service ${i + 1}`;
    
    healthWellnessQueries.push({
      id: `health_wellness_${String(queryId).padStart(3, '0')}`,
      category: "Health & Wellness",
      sub_category: subCategory,
      query: queryText,
      demographic_profile: {
        age_range: i % 2 === 0 ? "25-40" : "30-50",
        gender: i % 2 === 0 ? "female" : "male",
        cultural_context: "American"
      },
      query_intent: `Find ${subCategory.toLowerCase()} services`,
      constraints: {
        type: subCategory.toLowerCase(),
        location: i % 3 === 0 ? "Manhattan" : i % 3 === 1 ? "Brooklyn" : "Queens"
      },
      expected_result_type: "service recommendations",
      evaluation_criteria: {
        relevance: "high",
        accuracy: "high",
        completeness: "medium"
      }
    });
    
    queryId++;
  }
});

fs.writeFileSync('health_wellness_test_queries.json', JSON.stringify(healthWellnessQueries, null, 2));
console.log(`Generated ${healthWellnessQueries.length} queries for Health & Wellness`);
