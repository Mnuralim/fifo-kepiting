const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");
const prisma = new PrismaClient();

async function createAdmin() {
  console.log("Seeding admin...");
  const defaultAdmin = {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME,
  };
  const existingAdmin = await prisma.admin.findFirst({
    where: { username: defaultAdmin.username },
  });
  if (!existingAdmin) {
    const hashedPassword = await hash(defaultAdmin.password, 10);
    await prisma.admin.create({
      data: {
        username: defaultAdmin.username,
        password: hashedPassword,
        name: defaultAdmin.name,
      },
    });
    console.log("Admin seeded successfully!");
  } else {
    console.log("Admin already exists. Skipping seeding.");
  }
}

async function createWeathers() {
  console.log("Seeding weathers...");
  const weathers = [
    {
      name: "Tenang",
      numericValue: 1,
    },
    {
      name: "Sedikit Tenang",
      numericValue: 2,
    },
    {
      name: "Sedikit Hembusan Angin",
      numericValue: 3,
    },
    {
      name: "Hembusan Angin Pelan",
      numericValue: 4,
    },
    {
      name: "Hembusan Angin Sedang",
      numericValue: 5,
    },
    {
      name: "Kencang",
      numericValue: 6,
    },
  ];

  const existingWeathers = await prisma.weather.findMany();
  if (existingWeathers.length === 0) {
    await prisma.weather.createMany({
      data: weathers,
    });
    console.log("Weathers seeded successfully!");
  } else {
    console.log("Weathers already exist. Skipping seeding.");
  }
}

async function createHarvests() {
  console.log("Seeding harvests with improved linear relationship...");

  const weathers = await prisma.weather.findMany();
  const weatherIds = weathers.map((w) => w.id);

  const existingHarvests = await prisma.harvestRecord.findMany();
  if (existingHarvests.length >= 90) {
    console.log("Harvests already exist (90+ records). Skipping seeding.");
    return;
  }

  const harvests = [];
  const startDate = new Date("2025-06-01");

  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const weatherIndex = Math.floor(Math.random() * weatherIds.length);
    const weatherId = weatherIds[weatherIndex];
    const weatherValue = weatherIndex + 1; // 1-6

    // Create STRONG LINEAR relationship for better MAPE
    // Base harvest strongly influenced by weather (linear relationship)
    let baseHarvest = 50 + weatherValue * 45; // 95kg (weather=1) to 320kg (weather=6)

    // Add seasonal/trend component (makes it more predictable)
    const seasonalEffect = Math.sin((i / 90) * 2 * Math.PI) * 30;
    baseHarvest += seasonalEffect;

    // Add controlled randomness (small variation to maintain linearity)
    const randomVariation = (Math.random() - 0.5) * 40; // ±20kg variation
    baseHarvest += randomVariation;

    // Occasional high yields (but predictable pattern)
    if (i % 15 === 0 && weatherValue >= 4) {
      // Every 15 days with good weather, bonus harvest
      baseHarvest += Math.random() * 200 + 100; // +100-300kg bonus
    }

    // Ensure within limits: 20-1500kg, but most will be 20-400kg
    let harvestAmount = Math.max(20, Math.min(1500, Math.round(baseHarvest)));

    // STRONG LINEAR relationship for production cost
    // Cost should be highly predictable based on harvest amount and weather
    let productionCost = 180000; // Base cost

    // Cost increases linearly with harvest amount
    const costPerKg = 300 + weatherValue * 20; // 320-420 per kg based on weather
    const harvestCost = harvestAmount * costPerKg;

    // Weather difficulty multiplier (linear)
    const weatherCostMultiplier = 1 + (weatherValue - 1) * 0.08; // 1.0 to 1.4

    productionCost = 180000 + harvestCost * 0.15 * weatherCostMultiplier;

    // Small controlled variation (±5%)
    const costVariation = productionCost * (Math.random() - 0.5) * 0.1;
    productionCost += costVariation;

    // Ensure within range 180k-300k
    productionCost = Math.max(
      180000,
      Math.min(300000, Math.round(productionCost))
    );

    harvests.push({
      date: date.toISOString(),
      weatherId: weatherId,
      harvestAmount: harvestAmount,
      productionCost: productionCost,
    });
  }

  await prisma.harvestRecord.createMany({
    data: harvests,
  });

  console.log("90 harvest records seeded successfully!");

  // Calculate and show correlation for verification
  const harvestAmounts = harvests.map((h) => h.harvestAmount);
  const productionCosts = harvests.map((h) => h.productionCost);
  const weatherValues = harvests.map((h, i) => {
    const weatherIndex = weatherIds.indexOf(h.weatherId);
    return weatherIndex + 1;
  });

  console.log("Data Statistics:");
  console.log(
    `Harvest range: ${Math.min(...harvestAmounts)} - ${Math.max(
      ...harvestAmounts
    )} kg`
  );
  console.log(
    `Cost range: Rp ${Math.min(
      ...productionCosts
    ).toLocaleString()} - Rp ${Math.max(...productionCosts).toLocaleString()}`
  );
  console.log(
    `Average harvest: ${Math.round(
      harvestAmounts.reduce((a, b) => a + b, 0) / harvestAmounts.length
    )} kg`
  );
  console.log(
    `Average cost: Rp ${Math.round(
      productionCosts.reduce((a, b) => a + b, 0) / productionCosts.length
    ).toLocaleString()}`
  );

  // Calculate simple correlation between weather and harvest
  const avgWeather =
    weatherValues.reduce((a, b) => a + b, 0) / weatherValues.length;
  const avgHarvest =
    harvestAmounts.reduce((a, b) => a + b, 0) / harvestAmounts.length;

  let numerator = 0;
  let denomWeather = 0;
  let denomHarvest = 0;

  for (let i = 0; i < weatherValues.length; i++) {
    const weatherDiff = weatherValues[i] - avgWeather;
    const harvestDiff = harvestAmounts[i] - avgHarvest;
    numerator += weatherDiff * harvestDiff;
    denomWeather += weatherDiff * weatherDiff;
    denomHarvest += harvestDiff * harvestDiff;
  }

  const correlation = numerator / Math.sqrt(denomWeather * denomHarvest);
  console.log(
    `Weather-Harvest correlation: ${correlation.toFixed(
      3
    )} (should be > 0.7 for good MAPE)`
  );
}

async function main() {
  // await createAdmin();
  await createWeathers();
  await createHarvests();
  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
