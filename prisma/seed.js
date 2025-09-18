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
  console.log("Seeding harvests...");

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

    // Generate base harvest amount with weighted distribution
    // Most values will be between 20-300, with occasional peaks up to 1500
    let harvestAmount;
    const randomValue = Math.random();

    if (randomValue < 0.05) {
      // 5% chance of very high harvest (800-1500 kg) - rare cases
      harvestAmount = Math.floor(Math.random() * 700) + 800;
    } else if (randomValue < 0.15) {
      // 10% chance of high harvest (400-799 kg)
      harvestAmount = Math.floor(Math.random() * 400) + 400;
    } else if (randomValue < 0.85) {
      // 70% chance of normal harvest (100-399 kg) - most common range
      harvestAmount = Math.floor(Math.random() * 300) + 100;
    } else {
      // 15% chance of low harvest (20-99 kg)
      harvestAmount = Math.floor(Math.random() * 80) + 20;
    }

    const weatherIndex = Math.floor(Math.random() * weatherIds.length);
    const weatherId = weatherIds[weatherIndex];

    // Weather effect on harvest (maintains the correlation pattern)
    const weatherEffect = (weatherIndex + 1) * 8; // Reduced multiplier to keep within limits
    const weatherAdjustment = Math.random() * weatherEffect - weatherEffect / 2;

    // Apply weather effect but ensure we stay within limits
    harvestAmount = Math.max(
      20,
      Math.min(1500, harvestAmount + weatherAdjustment)
    );

    // Production cost calculation (180rb - 300rb range)
    // Base cost calculation that correlates with harvest but stays within limits
    const baseCostPerKg = 500 + (Math.random() * 200 - 100); // 400-600 per kg base
    let productionCost = harvestAmount * baseCostPerKg;

    // Add some variability while maintaining the 180k-300k range
    const costVariation = Math.random() * 60000 - 30000; // ±30k variation
    productionCost += costVariation;

    // Ensure production cost stays within the specified range
    productionCost = Math.max(180000, Math.min(300000, productionCost));

    harvests.push({
      date: date.toISOString(),
      weatherId: weatherId,
      harvestAmount: Math.round(harvestAmount),
      productionCost: Math.round(productionCost),
    });
  }

  await prisma.harvestRecord.createMany({
    data: harvests,
  });

  console.log("90 harvest records seeded successfully!");

  // Log some statistics for verification
  const harvestAmounts = harvests.map((h) => h.harvestAmount);
  const productionCosts = harvests.map((h) => h.productionCost);

  console.log("Harvest Statistics:");
  console.log(`Min harvest: ${Math.min(...harvestAmounts)} kg`);
  console.log(`Max harvest: ${Math.max(...harvestAmounts)} kg`);
  console.log(
    `Avg harvest: ${Math.round(
      harvestAmounts.reduce((a, b) => a + b, 0) / harvestAmounts.length
    )} kg`
  );

  console.log("Cost Statistics:");
  console.log(`Min cost: Rp ${Math.min(...productionCosts).toLocaleString()}`);
  console.log(`Max cost: Rp ${Math.max(...productionCosts).toLocaleString()}`);
  console.log(
    `Avg cost: Rp ${Math.round(
      productionCosts.reduce((a, b) => a + b, 0) / productionCosts.length
    ).toLocaleString()}`
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
