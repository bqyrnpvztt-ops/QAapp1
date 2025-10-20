#!/usr/bin/env node

// Generate comprehensive Travel test queries (50 total: 5 sub-categories × 10 queries each)
const fs = require('fs');

const travelQueries = [];

// Sub-categories: Accommodation, Activities, Dining, Flights, Transportation
const subCategories = ["Accommodation", "Activities", "Dining", "Flights", "Transportation"];

let queryId = 1;

subCategories.forEach(subCategory => {
  for (let i = 0; i < 10; i++) {
    const queries = {
      "Accommodation": [
        "Luxury hotels in Manhattan for business travelers",
        "Budget-friendly hostels in Brooklyn for backpackers",
        "Vacation rentals in Queens for family stays",
        "Boutique hotels in Miami for romantic getaways",
        "Resort accommodations in Tokyo for relaxation",
        "Airbnb apartments in London for extended stays",
        "Beachfront hotels in Miami for summer vacations",
        "Historic hotels in Paris for cultural experiences",
        "Ski resort lodges in Colorado for winter sports",
        "Pet-friendly hotels in San Francisco for travelers with pets"
      ],
      "Activities": [
        "Museum tours in Manhattan for art enthusiasts",
        "Walking tours in Brooklyn for local culture",
        "Food tours in Queens for culinary experiences",
        "Boat cruises in Miami for scenic views",
        "Temple visits in Tokyo for spiritual experiences",
        "Theater shows in London for entertainment",
        "Beach activities in Miami for relaxation",
        "Art gallery visits in Paris for cultural enrichment",
        "Hiking trails in Colorado for outdoor adventures",
        "Wine tasting tours in San Francisco for connoisseurs"
      ],
      "Dining": [
        "Fine dining restaurants in Manhattan for special occasions",
        "Local food markets in Brooklyn for authentic flavors",
        "Food trucks in Queens for casual dining",
        "Seafood restaurants in Miami for fresh catches",
        "Sushi bars in Tokyo for traditional Japanese cuisine",
        "Pub food in London for British classics",
        "Beachside cafes in Miami for ocean views",
        "Bistros in Paris for French cuisine",
        "Mountain restaurants in Colorado for hearty meals",
        "Farm-to-table restaurants in San Francisco for organic dining"
      ],
      "Flights": [
        "Direct flights from NYC to London for business trips",
        "Budget airlines from NYC to Miami for weekend getaways",
        "International flights from NYC to Tokyo for cultural exploration",
        "Domestic flights from NYC to San Francisco for tech conferences",
        "Charter flights to Colorado for ski vacations",
        "First-class flights to Paris for luxury travel",
        "Group flights for family reunions",
        "Last-minute flights for spontaneous trips",
        "Multi-city flights for extended vacations",
        "Private jet charters for VIP travel"
      ],
      "Transportation": [
        "Airport transfers in Manhattan for convenient arrivals",
        "Public transportation passes in Brooklyn for budget travel",
        "Car rentals in Queens for flexible exploration",
        "Boat charters in Miami for water activities",
        "Train passes in Tokyo for efficient city travel",
        "Taxi services in London for comfortable rides",
        "Bicycle rentals in Miami for eco-friendly touring",
        "Metro cards in Paris for urban exploration",
        "Shuttle services in Colorado for ski resort access",
        "Ride-sharing services in San Francisco for tech-savvy travel"
      ]
    };

    const queryText = queries[subCategory][i] || `${subCategory} service ${i + 1}`;
    
    travelQueries.push({
      id: `travel_${String(queryId).padStart(3, '0')}`,
      category: "Travel",
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

fs.writeFileSync('travel_test_queries.json', JSON.stringify(travelQueries, null, 2));
console.log(`Generated ${travelQueries.length} queries for Travel`);
