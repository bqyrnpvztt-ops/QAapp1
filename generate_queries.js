#!/usr/bin/env node

// Script to generate comprehensive test queries for all categories
// This will create 10 queries per sub-category for all missing categories

const fs = require('fs');
const path = require('path');

// Define all categories and their sub-categories
const categories = {
  "Digital Tools & Services": [
    "Entertainment & Event Planning", "Travel", "Baby Registry", "Furniture", 
    "Parenting", "Shopping", "Insurance", "App", "Food", "Creative Agency", 
    "Styling", "Photographer"
  ],
  "Health & Wellness": [
    "App", "Fitness studio", "Barre studio", "Pilates Studio", "Yoga studio", 
    "Dance Studio", "Gym", "Health club", "EMS training", "Padel", "Boxing gym"
  ],
  "Kitchen & Bath": [
    "Appliances", "Bathroom Accessories", "Beverages", "Grocery & Gourmet Food", 
    "Storage & Organization", "Utensils & Gadgets", "Lawn & Garden", 
    "Cookware & Bakeware", "Dining & Glassware", "Towels & Linens"
  ],
  "Travel": [
    "Accommodation", "Activities", "Dining", "Flights", "Transportation"
  ],
  "Watches & Jewelry": [
    "Fine Jewelry", "Jewelry", "Watches", "Affordable Under 800$"
  ]
};

// Generate queries for a specific category and sub-category
function generateQueriesForSubCategory(category, subCategory, startId) {
  const queries = [];
  const baseId = startId;
  
  // Sample queries for each sub-category (10 per sub-category)
  const sampleQueries = {
    "Entertainment & Event Planning": [
      "Event planning apps for corporate meetings in Manhattan",
      "Wedding planning software for DIY brides under $100",
      "Birthday party planning apps for kids' parties",
      "Conference management tools for tech events in San Francisco",
      "Virtual event platforms for corporate training sessions",
      "Fundraising event management software for nonprofits",
      "Music festival planning apps with vendor management",
      "Trade show booth management software for exhibitors",
      "Gala dinner planning tools with seating chart features",
      "Sports tournament bracket management software"
    ],
    "Travel": [
      "Travel booking apps for European vacation planning",
      "Flight tracking apps with price alerts for business travel",
      "Hotel booking platforms with loyalty rewards programs",
      "Car rental comparison apps for road trips",
      "Travel itinerary planning software for family vacations",
      "Airbnb management tools for property owners",
      "Travel expense tracking apps for business trips",
      "Cruise booking platforms with group discounts",
      "Travel insurance comparison tools for international trips",
      "Language learning apps for travel preparation"
    ],
    "Baby Registry": [
      "Baby registry apps for expecting parents",
      "Gift tracking software for baby showers",
      "Registry management tools for new parents",
      "Baby product recommendation apps",
      "Registry sharing platforms for families",
      "Baby registry comparison tools",
      "Registry reminder apps for friends",
      "Baby registry analytics for retailers",
      "Registry integration tools for stores",
      "Baby registry mobile apps"
    ],
    "Furniture": [
      "Furniture shopping apps with AR visualization",
      "Interior design software for home decorating",
      "Furniture comparison tools for living rooms",
      "Custom furniture design platforms",
      "Furniture delivery tracking apps",
      "Furniture assembly instruction apps",
      "Furniture marketplace platforms",
      "Furniture rental apps for temporary needs",
      "Furniture maintenance reminder apps",
      "Furniture resale platforms"
    ],
    "Parenting": [
      "Parenting advice apps for new mothers",
      "Child development tracking software",
      "Parenting community platforms",
      "Child safety monitoring apps",
      "Parenting schedule management tools",
      "Child milestone tracking apps",
      "Parenting resource libraries",
      "Child behavior management apps",
      "Parenting support group platforms",
      "Child activity planning apps"
    ],
    "Shopping": [
      "Price comparison apps for online shopping",
      "Shopping list management apps",
      "Coupon and discount finding tools",
      "Shopping cart optimization apps",
      "Product review aggregation platforms",
      "Shopping budget tracking apps",
      "Shopping recommendation engines",
      "Shopping social sharing platforms",
      "Shopping analytics tools",
      "Shopping wishlist management apps"
    ],
    "Insurance": [
      "Insurance comparison tools for auto coverage",
      "Health insurance marketplace apps",
      "Insurance claim filing software",
      "Insurance policy management apps",
      "Insurance premium calculator tools",
      "Insurance document storage apps",
      "Insurance renewal reminder apps",
      "Insurance agent finder platforms",
      "Insurance coverage analysis tools",
      "Insurance mobile payment apps"
    ],
    "App": [
      "Mobile app development platforms",
      "App store optimization tools",
      "App analytics and tracking software",
      "App testing and QA platforms",
      "App monetization management tools",
      "App user feedback collection apps",
      "App performance monitoring tools",
      "App security testing platforms",
      "App deployment automation tools",
      "App store listing management apps"
    ],
    "Food": [
      "Recipe management and meal planning apps",
      "Food delivery platform comparison tools",
      "Restaurant reservation management apps",
      "Food allergy tracking and management apps",
      "Nutrition tracking and calorie counting apps",
      "Food waste reduction and management apps",
      "Local food sourcing and farm-to-table apps",
      "Food safety and expiration tracking apps",
      "Cooking instruction and tutorial apps",
      "Food social sharing and review platforms"
    ],
    "Creative Agency": [
      "Creative project management software",
      "Design collaboration and feedback tools",
      "Creative asset management platforms",
      "Client communication and approval systems",
      "Creative workflow automation tools",
      "Design version control and history apps",
      "Creative team collaboration platforms",
      "Creative project timeline management tools",
      "Creative resource and inspiration libraries",
      "Creative billing and invoicing software"
    ],
    "Styling": [
      "Personal styling consultation apps",
      "Wardrobe organization and management tools",
      "Style inspiration and mood board apps",
      "Clothing coordination and outfit planning apps",
      "Style advice and recommendation platforms",
      "Fashion trend tracking and analysis apps",
      "Personal shopper and styling services",
      "Style social sharing and community platforms",
      "Clothing care and maintenance reminder apps",
      "Style budget and shopping planning tools"
    ],
    "Photographer": [
      "Photography portfolio management platforms",
      "Client booking and scheduling software",
      "Photo editing and post-processing tools",
      "Photography business management apps",
      "Client gallery and proofing platforms",
      "Photography equipment tracking and management",
      "Photography pricing and quote generation tools",
      "Photography contract and agreement management",
      "Photography marketing and social media tools",
      "Photography client communication platforms"
    ]
  };

  const queriesForSubCategory = sampleQueries[subCategory] || [];
  
  for (let i = 0; i < 10; i++) {
    const queryText = queriesForSubCategory[i] || `${subCategory} service ${i + 1}`;
    
    queries.push({
      id: `${baseId}_${String(i + 1).padStart(3, '0')}`,
      category: category,
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
  }
  
  return queries;
}

// Generate all queries for Digital Tools & Services
function generateDigitalToolsQueries() {
  let allQueries = [];
  let currentId = 1;
  
  categories["Digital Tools & Services"].forEach(subCategory => {
    const queries = generateQueriesForSubCategory("Digital Tools & Services", subCategory, currentId);
    allQueries = allQueries.concat(queries);
    currentId += 10;
  });
  
  return allQueries;
}

// Write the comprehensive Digital Tools & Services file
const digitalToolsQueries = generateDigitalToolsQueries();
fs.writeFileSync('digital_tools_services_test_queries.json', JSON.stringify(digitalToolsQueries, null, 2));

console.log(`Generated ${digitalToolsQueries.length} queries for Digital Tools & Services`);
console.log('File saved as: digital_tools_services_test_queries.json');
