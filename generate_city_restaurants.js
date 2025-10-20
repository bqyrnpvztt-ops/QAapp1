#!/usr/bin/env node

// Generate comprehensive City Guides Restaurants test queries (60 total: 6 cities × 10 queries each)
const fs = require('fs');

const cityGuidesRestaurantsQueries = [];

// Cities: New York, London, Paris, Miami, Tokyo, Madrid
const cities = ["New York", "London", "Paris", "Miami", "Tokyo", "Madrid"];

let queryId = 1;

cities.forEach(city => {
  for (let i = 0; i < 10; i++) {
    const queries = {
      "New York": [
        "Italian restaurants in Manhattan for authentic pasta",
        "Japanese sushi bars in Brooklyn for fresh fish",
        "Mexican taquerias in Queens for street food",
        "French bistros in Manhattan for romantic dinners",
        "Chinese dim sum in Brooklyn for weekend brunch",
        "Indian curry houses in Queens for spicy cuisine",
        "American steakhouses in Manhattan for business meals",
        "Korean BBQ in Brooklyn for group dining",
        "Thai restaurants in Queens for flavorful dishes",
        "Mediterranean cafes in Manhattan for healthy options"
      ],
      "London": [
        "Traditional British pubs in Central London for fish and chips",
        "Indian curry houses in East London for authentic spices",
        "Italian trattorias in West London for family dining",
        "Chinese restaurants in Chinatown for dim sum",
        "French bistros in South London for romantic meals",
        "Turkish restaurants in North London for kebabs",
        "Japanese sushi bars in Central London for fresh fish",
        "Mexican taquerias in East London for street food",
        "American diners in West London for comfort food",
        "Lebanese restaurants in South London for Middle Eastern cuisine"
      ],
      "Paris": [
        "Traditional French bistros in Montmartre for classic cuisine",
        "Italian trattorias in Marais for authentic pasta",
        "Japanese restaurants in Champs-Élysées for sushi",
        "Chinese restaurants in Belleville for dim sum",
        "Lebanese restaurants in Latin Quarter for Middle Eastern food",
        "Spanish tapas bars in Saint-Germain for small plates",
        "Vietnamese pho restaurants in 13th arrondissement",
        "Moroccan restaurants in Bastille for tagines",
        "American diners in République for comfort food",
        "Korean BBQ in Opera for group dining"
      ],
      "Miami": [
        "Cuban restaurants in Little Havana for authentic cuisine",
        "Seafood restaurants in South Beach for fresh fish",
        "Italian trattorias in Coral Gables for family dining",
        "Japanese sushi bars in Brickell for business lunches",
        "Mexican taquerias in Wynwood for street food",
        "Peruvian restaurants in Downtown for ceviche",
        "Brazilian steakhouses in Aventura for meat lovers",
        "Colombian restaurants in Doral for arepas",
        "Haitian restaurants in Little Haiti for Caribbean cuisine",
        "Argentine restaurants in Coconut Grove for empanadas"
      ],
      "Tokyo": [
        "Ramen shops in Shibuya for authentic noodles",
        "Sushi restaurants in Tsukiji for fresh fish",
        "Tempura restaurants in Ginza for crispy seafood",
        "Yakitori bars in Roppongi for grilled skewers",
        "Tonkatsu restaurants in Shinjuku for breaded pork",
        "Udon shops in Harajuku for thick noodles",
        "Kaiseki restaurants in Roppongi for fine dining",
        "Okonomiyaki restaurants in Shibuya for savory pancakes",
        "Soba shops in Ginza for buckwheat noodles",
        "Katsu curry restaurants in Shinjuku for comfort food"
      ],
      "Madrid": [
        "Traditional Spanish tapas bars in La Latina for small plates",
        "Paella restaurants in Retiro for authentic rice dishes",
        "Jamón bars in Salamanca for cured ham",
        "Seafood restaurants in Malasaña for fresh fish",
        "Italian trattorias in Chueca for pasta",
        "Japanese restaurants in Gran Vía for sushi",
        "Mexican taquerias in Lavapiés for street food",
        "Peruvian restaurants in Chamberí for ceviche",
        "Lebanese restaurants in Sol for Middle Eastern cuisine",
        "Argentine steakhouses in Moncloa for grilled meat"
      ]
    };

    const queryText = queries[city][i] || `${city} restaurant ${i + 1}`;
    
    cityGuidesRestaurantsQueries.push({
      id: `city_restaurants_${String(queryId).padStart(3, '0')}`,
      category: "City guides restaurants",
      sub_category: city,
      query: queryText,
      demographic_profile: {
        age_range: i % 2 === 0 ? "25-40" : "30-50",
        gender: i % 2 === 0 ? "female" : "male",
        cultural_context: "American"
      },
      query_intent: `Find restaurants in ${city}`,
      constraints: {
        location: city,
        type: "restaurants"
      },
      expected_result_type: "restaurant recommendations",
      evaluation_criteria: {
        relevance: "high",
        accuracy: "high",
        completeness: "medium"
      }
    });
    
    queryId++;
  }
});

fs.writeFileSync('city_guides_restaurants_test_queries.json', JSON.stringify(cityGuidesRestaurantsQueries, null, 2));
console.log(`Generated ${cityGuidesRestaurantsQueries.length} queries for City Guides Restaurants`);
