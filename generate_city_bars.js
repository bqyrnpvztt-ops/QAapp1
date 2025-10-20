#!/usr/bin/env node

// Generate comprehensive City Guides Bars test queries (60 total: 6 cities × 10 queries each)
const fs = require('fs');

const cityGuidesBarsQueries = [];

// Cities: New York, London, Paris, Miami, Tokyo, Madrid
const cities = ["New York", "London", "Paris", "Miami", "Tokyo", "Madrid"];

let queryId = 1;

cities.forEach(city => {
  for (let i = 0; i < 10; i++) {
    const queries = {
      "New York": [
        "Cocktail bars in Manhattan for craft drinks",
        "Rooftop bars in Brooklyn for city views",
        "Speakeasy bars in Queens for hidden gems",
        "Wine bars in Manhattan for sommelier selections",
        "Beer halls in Brooklyn for craft brews",
        "Jazz bars in Queens for live music",
        "Sports bars in Manhattan for game watching",
        "Dive bars in Brooklyn for casual drinks",
        "Lounge bars in Queens for upscale atmosphere",
        "Tiki bars in Manhattan for tropical vibes"
      ],
      "London": [
        "Traditional British pubs in Central London for ale",
        "Cocktail bars in East London for mixology",
        "Wine bars in West London for European selections",
        "Gin bars in South London for botanical drinks",
        "Beer gardens in North London for outdoor drinking",
        "Whiskey bars in Central London for single malts",
        "Rooftop bars in East London for city views",
        "Jazz bars in West London for live music",
        "Craft beer bars in South London for local brews",
        "Champagne bars in North London for celebrations"
      ],
      "Paris": [
        "Wine bars in Montmartre for French selections",
        "Cocktail bars in Marais for creative drinks",
        "Beer bars in Champs-Élysées for international brews",
        "Absinthe bars in Latin Quarter for traditional spirits",
        "Champagne bars in Saint-Germain for bubbles",
        "Rooftop bars in Bastille for city views",
        "Jazz bars in République for live music",
        "Craft beer bars in Opera for artisanal brews",
        "Wine cellars in Montmartre for tastings",
        "Cocktail lounges in Marais for sophisticated drinks"
      ],
      "Miami": [
        "Rooftop bars in South Beach for ocean views",
        "Cocktail bars in Brickell for craft drinks",
        "Beach bars in Wynwood for casual atmosphere",
        "Wine bars in Coral Gables for fine selections",
        "Rum bars in Little Havana for Caribbean spirits",
        "Pool bars in Aventura for resort vibes",
        "Jazz bars in Downtown for live music",
        "Sports bars in Doral for game watching",
        "Lounge bars in Coconut Grove for upscale drinks",
        "Tiki bars in South Beach for tropical cocktails"
      ],
      "Tokyo": [
        "Whiskey bars in Shibuya for Japanese single malts",
        "Cocktail bars in Ginza for precision mixology",
        "Beer bars in Roppongi for international brews",
        "Sake bars in Shinjuku for traditional rice wine",
        "Rooftop bars in Harajuku for city views",
        "Jazz bars in Shibuya for live music",
        "Craft beer bars in Ginza for artisanal brews",
        "Wine bars in Roppongi for international selections",
        "Speakeasy bars in Shinjuku for hidden gems",
        "Karaoke bars in Harajuku for entertainment"
      ],
      "Madrid": [
        "Tapas bars in La Latina for Spanish small plates",
        "Wine bars in Retiro for Spanish selections",
        "Cocktail bars in Salamanca for creative drinks",
        "Beer bars in Malasaña for craft brews",
        "Rooftop bars in Chueca for city views",
        "Flamenco bars in Gran Vía for live shows",
        "Sherry bars in Lavapiés for traditional fortified wine",
        "Gin bars in Chamberí for Spanish gin",
        "Cava bars in Sol for sparkling wine",
        "Craft beer bars in Moncloa for artisanal brews"
      ]
    };

    const queryText = queries[city][i] || `${city} bar ${i + 1}`;
    
    cityGuidesBarsQueries.push({
      id: `city_bars_${String(queryId).padStart(3, '0')}`,
      category: "City guides bars",
      sub_category: city,
      query: queryText,
      demographic_profile: {
        age_range: i % 2 === 0 ? "25-40" : "30-50",
        gender: i % 2 === 0 ? "female" : "male",
        cultural_context: "American"
      },
      query_intent: `Find bars in ${city}`,
      constraints: {
        location: city,
        type: "bars"
      },
      expected_result_type: "bar recommendations",
      evaluation_criteria: {
        relevance: "high",
        accuracy: "high",
        completeness: "medium"
      }
    });
    
    queryId++;
  }
});

fs.writeFileSync('city_guides_bars_test_queries.json', JSON.stringify(cityGuidesBarsQueries, null, 2));
console.log(`Generated ${cityGuidesBarsQueries.length} queries for City Guides Bars`);
