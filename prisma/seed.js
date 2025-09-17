const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

// Konfigurasi khusus untuk Supabase
const prisma = new PrismaClient({
  log: ["warn", "error"],
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

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

    // Weather value (1-6)
    const weatherIndex = Math.floor(Math.random() * weatherIds.length);
    const weatherId = weatherIds[weatherIndex];
    const weatherValue = weatherIndex + 1; // 1-6

    // Production cost (dalam ribuan: 180-300)
    const productionCostInThousands = 180 + Math.floor(Math.random() * 121); // 180-300
    const productionCost = productionCostInThousands * 1000;

    // FORMULA LINEAR SEDERHANA untuk harvest amount
    // Base formula: harvest = intercept + (cost_coeff * cost) + (weather_coeff * weather) + noise

    const intercept = 50; // base minimum
    const costCoefficient = 1.2; // setiap 1rb biaya = +1.2 kg hasil
    const weatherCoefficient = -25; // setiap +1 weather value = -25 kg hasil (cuaca buruk)

    // Hitung hasil berdasarkan formula linear
    let harvestAmount =
      intercept +
      costCoefficient * productionCostInThousands +
      weatherCoefficient * weatherValue;

    // Tambahkan noise kecil saja (±10%)
    const noisePercent = -0.1 + Math.random() * 0.2; // -10% to +10%
    harvestAmount = harvestAmount * (1 + noisePercent);

    // Pastikan dalam range yang masuk akal
    harvestAmount = Math.max(20, Math.min(600, Math.round(harvestAmount)));

    // Untuk beberapa kasus ekstrem (5% chance)
    if (Math.random() < 0.05) {
      if (productionCostInThousands > 280 && weatherValue <= 2) {
        // High cost + good weather = exceptional result
        harvestAmount = 800 + Math.floor(Math.random() * 700); // 800-1500
      }
    }

    // Untuk hasil rendah (10% chance) - faktor eksternal
    if (Math.random() < 0.1) {
      harvestAmount = 20 + Math.floor(Math.random() * 80); // 20-100
    }

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

  // Analisis data yang dibuat
  console.log("\n=== DATA ANALYSIS ===");

  const costs = harvests.map((h) => h.productionCost / 1000);
  const amounts = harvests.map((h) => h.harvestAmount);
  const weatherss = harvests.map((h) => {
    const idx = weatherIds.findIndex((id) => id === h.weatherId);
    return idx + 1;
  });

  console.log(`Sample data (first 10):`);
  for (let i = 0; i < Math.min(10, harvests.length); i++) {
    console.log(
      `  Cost: ${costs[i]}k, Weather: ${weathers[i]}, Harvest: ${amounts[i]}kg`
    );
  }

  // Formula yang digunakan
  console.log(`\nFormula used:`);
  console.log(
    `  harvest = 50 + (1.2 * cost_in_thousands) + (-25 * weather_value) + noise`
  );
  console.log(
    `  Expected pattern: Higher cost = more harvest, Higher weather number = less harvest`
  );

  // Statistik dasar
  const avgCost = costs.reduce((a, b) => a + b) / costs.length;
  const avgWeather = weatherss.reduce((a, b) => a + b) / weathers.length;
  const avgHarvest = amounts.reduce((a, b) => a + b) / amounts.length;

  console.log(`\nStatistics:`);
  console.log(`  Average cost: ${avgCost.toFixed(0)}k`);
  console.log(`  Average weather: ${avgWeather.toFixed(1)}`);
  console.log(`  Average harvest: ${avgHarvest.toFixed(0)}kg`);
  console.log(`  Min harvest: ${Math.min(...amounts)}kg`);
  console.log(`  Max harvest: ${Math.max(...amounts)}kg`);
}

async function main() {
  try {
    // await createAdmin();
    await createWeathers();
    await createHarvests();
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("Error seeding database", e);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
      console.log("Database connection closed.");
    } catch (error) {
      console.error("Error closing database connection:", error);
    }
  });
