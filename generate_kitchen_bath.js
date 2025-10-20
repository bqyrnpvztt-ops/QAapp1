#!/usr/bin/env node

// Generate comprehensive Kitchen & Bath test queries (100 total: 10 sub-categories × 10 queries each)
const fs = require('fs');

const kitchenBathQueries = [];

// Sub-categories: Appliances, Bathroom Accessories, Beverages, Grocery & Gourmet Food, 
// Storage & Organization, Utensils & Gadgets, Lawn & Garden, Cookware & Bakeware, 
// Dining & Glassware, Towels & Linens

const subCategories = [
  "Appliances", "Bathroom Accessories", "Beverages", "Grocery & Gourmet Food",
  "Storage & Organization", "Utensils & Gadgets", "Lawn & Garden", 
  "Cookware & Bakeware", "Dining & Glassware", "Towels & Linens"
];

let queryId = 1;

subCategories.forEach(subCategory => {
  for (let i = 0; i < 10; i++) {
    const queries = {
      "Appliances": [
        "Energy-efficient refrigerators under $2000 for small kitchens",
        "Smart dishwashers with WiFi connectivity for modern homes",
        "Gas ranges with convection ovens for serious cooking",
        "Microwave ovens with air fryer functions for healthy cooking",
        "Coffee makers with built-in grinders for coffee enthusiasts",
        "Stand mixers for baking and dough preparation",
        "Food processors with multiple attachments for meal prep",
        "Blenders for smoothies and protein shakes",
        "Toaster ovens with air fryer capabilities for small spaces",
        "Wine refrigerators for temperature-controlled storage"
      ],
      "Bathroom Accessories": [
        "Shower heads with water-saving features for eco-friendly homes",
        "Towel warmers for luxury bathroom experiences",
        "Medicine cabinets with LED lighting and mirrors",
        "Bathroom vanities with double sinks for master bathrooms",
        "Toilet paper holders with built-in storage compartments",
        "Shower caddies with rust-resistant materials",
        "Bathroom mirrors with fog-free technology",
        "Soap dispensers with automatic sensors for touchless operation",
        "Bathroom scales with body composition analysis",
        "Bathroom exhaust fans with humidity sensors"
      ],
      "Beverages": [
        "Cold brew coffee makers for smooth coffee extraction",
        "Espresso machines with built-in grinders for home baristas",
        "Tea kettles with temperature control for perfect brewing",
        "Soda makers for carbonated water and homemade sodas",
        "Juicers for fresh fruit and vegetable juices",
        "Cocktail shakers and bar tools for home mixology",
        "Wine openers with foil cutters for easy bottle opening",
        "Water filters for clean drinking water at home",
        "Hot chocolate makers for winter comfort drinks",
        "Smoothie makers for healthy breakfast options"
      ],
      "Grocery & Gourmet Food": [
        "Organic spices and seasonings for gourmet cooking",
        "Artisanal cheeses for charcuterie boards",
        "Premium olive oils for Mediterranean cuisine",
        "Specialty flours for baking enthusiasts",
        "Gourmet chocolates for dessert making",
        "Exotic fruits and vegetables for adventurous cooking",
        "Craft beers and wines for entertaining",
        "Organic grains and legumes for healthy meals",
        "Specialty sauces and condiments for flavor enhancement",
        "Premium coffee beans for home brewing"
      ],
      "Storage & Organization": [
        "Pantry organizers for kitchen efficiency",
        "Spice racks with labels for easy identification",
        "Food storage containers with airtight seals",
        "Drawer organizers for utensils and tools",
        "Cabinet organizers for pots and pans",
        "Refrigerator organizers for better food storage",
        "Freezer organizers for meal prep containers",
        "Countertop organizers for frequently used items",
        "Wall-mounted organizers for space-saving storage",
        "Under-sink organizers for cleaning supplies"
      ],
      "Utensils & Gadgets": [
        "Professional chef knives for precision cutting",
        "Cutting boards with juice grooves for messy prep",
        "Measuring cups and spoons for accurate baking",
        "Kitchen timers for perfect cooking timing",
        "Garlic presses for easy garlic preparation",
        "Can openers for convenient food access",
        "Peelers for fruits and vegetables",
        "Whisks for mixing and beating ingredients",
        "Spatulas for flipping and scraping",
        "Tongs for safe food handling"
      ],
      "Lawn & Garden": [
        "Garden hoses with adjustable spray patterns",
        "Planters with drainage holes for healthy plants",
        "Garden tools for soil preparation and planting",
        "Outdoor lighting for garden ambiance",
        "Compost bins for organic waste recycling",
        "Garden gloves for protection during work",
        "Watering cans for gentle plant hydration",
        "Garden stakes for plant support",
        "Mulch for soil moisture retention",
        "Garden seeds for growing fresh vegetables"
      ],
      "Cookware & Bakeware": [
        "Non-stick frying pans for easy cooking and cleaning",
        "Stainless steel pots for versatile cooking",
        "Cast iron skillets for even heat distribution",
        "Baking sheets for cookies and roasted vegetables",
        "Cake pans for birthday celebrations",
        "Muffin tins for breakfast treats",
        "Casserole dishes for family meals",
        "Dutch ovens for slow cooking and braising",
        "Woks for Asian stir-fry cooking",
        "Pizza stones for crispy homemade pizza"
      ],
      "Dining & Glassware": [
        "Dinner plates for elegant table settings",
        "Wine glasses for proper wine tasting",
        "Coffee mugs for morning caffeine rituals",
        "Water glasses for daily hydration",
        "Champagne flutes for special celebrations",
        "Serving bowls for family gatherings",
        "Salad plates for healthy meal portions",
        "Shot glasses for cocktail parties",
        "Beer mugs for casual entertaining",
        "Tea cups for afternoon relaxation"
      ],
      "Towels & Linens": [
        "Kitchen towels for daily cleaning tasks",
        "Bath towels for comfortable drying",
        "Hand towels for guest bathrooms",
        "Washcloths for gentle face cleaning",
        "Tablecloths for formal dining occasions",
        "Napkins for elegant table settings",
        "Placemats for protecting dining surfaces",
        "Oven mitts for safe hot food handling",
        "Aprons for cooking protection",
        "Bath mats for bathroom safety"
      ]
    };

    const queryText = queries[subCategory][i] || `${subCategory} item ${i + 1}`;
    
    kitchenBathQueries.push({
      id: `kitchen_bath_${String(queryId).padStart(3, '0')}`,
      category: "Kitchen & Bath",
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

fs.writeFileSync('kitchen_bath_test_queries.json', JSON.stringify(kitchenBathQueries, null, 2));
console.log(`Generated ${kitchenBathQueries.length} queries for Kitchen & Bath`);
