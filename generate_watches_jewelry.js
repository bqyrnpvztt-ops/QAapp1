#!/usr/bin/env node

// Generate comprehensive Watches & Jewelry test queries (40 total: 4 sub-categories × 10 queries each)
const fs = require('fs');

const watchesJewelryQueries = [];

// Sub-categories: Fine Jewelry, Jewelry, Watches, Affordable Under 800$
const subCategories = ["Fine Jewelry", "Jewelry", "Watches", "Affordable Under 800$"];

let queryId = 1;

subCategories.forEach(subCategory => {
  for (let i = 0; i < 10; i++) {
    const queries = {
      "Fine Jewelry": [
        "Diamond engagement rings in Manhattan for proposals",
        "Pearl necklaces in Brooklyn for elegant occasions",
        "Gold bracelets in Queens for special gifts",
        "Emerald earrings in Miami for luxury fashion",
        "Sapphire pendants in Tokyo for sophisticated style",
        "Platinum wedding bands in London for ceremonies",
        "Ruby rings in Paris for romantic gestures",
        "Diamond earrings in San Francisco for formal events",
        "Gold chains in Chicago for everyday luxury",
        "Pearl earrings in Boston for classic elegance"
      ],
      "Jewelry": [
        "Silver rings in Manhattan for trendy fashion",
        "Costume jewelry in Brooklyn for budget-friendly style",
        "Beaded necklaces in Queens for bohemian looks",
        "Charm bracelets in Miami for personalized accessories",
        "Statement earrings in Tokyo for bold fashion",
        "Vintage brooches in London for unique style",
        "Anklets in Paris for summer fashion",
        "Chokers in San Francisco for edgy looks",
        "Hoop earrings in Chicago for classic style",
        "Layered necklaces in Boston for layered fashion"
      ],
      "Watches": [
        "Luxury watches in Manhattan for business professionals",
        "Smart watches in Brooklyn for tech enthusiasts",
        "Vintage watches in Queens for collectors",
        "Diving watches in Miami for water sports",
        "Digital watches in Tokyo for modern functionality",
        "Mechanical watches in London for traditional craftsmanship",
        "Fashion watches in Paris for style statements",
        "Sports watches in San Francisco for active lifestyles",
        "Chronograph watches in Chicago for precision timing",
        "Minimalist watches in Boston for clean aesthetics"
      ],
      "Affordable Under 800$": [
        "Budget-friendly rings under $800 in Manhattan",
        "Affordable necklaces under $800 in Brooklyn",
        "Cost-effective earrings under $800 in Queens",
        "Value watches under $800 in Miami",
        "Budget bracelets under $800 in Tokyo",
        "Affordable pendants under $800 in London",
        "Cost-effective brooches under $800 in Paris",
        "Budget-friendly chains under $800 in San Francisco",
        "Affordable cufflinks under $800 in Chicago",
        "Value rings under $800 in Boston"
      ]
    };

    const queryText = queries[subCategory][i] || `${subCategory} item ${i + 1}`;
    
    watchesJewelryQueries.push({
      id: `watches_jewelry_${String(queryId).padStart(3, '0')}`,
      category: "Watches & Jewelry",
      sub_category: subCategory,
      query: queryText,
      demographic_profile: {
        age_range: i % 2 === 0 ? "25-40" : "30-50",
        gender: i % 2 === 0 ? "female" : "male",
        cultural_context: "American"
      },
      query_intent: `Find ${subCategory.toLowerCase()} products`,
      constraints: {
        type: subCategory.toLowerCase(),
        location: i % 3 === 0 ? "Manhattan" : i % 3 === 1 ? "Brooklyn" : "Queens"
      },
      expected_result_type: "product recommendations",
      evaluation_criteria: {
        relevance: "high",
        accuracy: "high",
        completeness: "medium"
      }
    });
    
    queryId++;
  }
});

fs.writeFileSync('watches_jewelry_test_queries.json', JSON.stringify(watchesJewelryQueries, null, 2));
console.log(`Generated ${watchesJewelryQueries.length} queries for Watches & Jewelry`);
