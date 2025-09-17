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

    // Pilih weather dengan pola yang lebih realistis
    const weatherIndex = Math.floor(Math.random() * weatherIds.length);
    const weatherId = weatherIds[weatherIndex];
    const weatherValue = weatherIndex + 1; // 1-6

    // Generate production cost dengan pola yang konsisten
    // Biaya tinggi = hasil tinggi (korelasi positif yang kuat)
    const baseCostInThousands = 180 + Math.floor(Math.random() * 120); // 180-300
    const productionCost = baseCostInThousands * 1000;

    // Formula realistis: Hasil panen berkorelasi dengan biaya dan cuaca
    // Base harvest dari biaya (semakin tinggi biaya, semakin tinggi hasil)
    let baseHarvest = ((baseCostInThousands - 180) / 120) * 400 + 100; // 100-500 kg base

    // Weather effect yang konsisten
    // Weather 1-2 (tenang) = +50% hasil
    // Weather 3-4 (sedang) = hasil normal
    // Weather 5-6 (kencang) = -40% hasil
    let weatherMultiplier;
    if (weatherValue <= 2) {
      weatherMultiplier = 1.3 + Math.random() * 0.4; // 1.3-1.7x (cuaca bagus)
    } else if (weatherValue <= 4) {
      weatherMultiplier = 0.9 + Math.random() * 0.3; // 0.9-1.2x (cuaca normal)
    } else {
      weatherMultiplier = 0.4 + Math.random() * 0.3; // 0.4-0.7x (cuaca buruk)
    }

    let harvestAmount = baseHarvest * weatherMultiplier;

    // Tambahkan sedikit noise tapi tetap realistis (±15%)
    const noise = 0.85 + Math.random() * 0.3; // 0.85-1.15
    harvestAmount *= noise;

    // Aturan bisnis:
    // - Hasil tinggi jarang (5% chance untuk >800kg)
    // - Hasil sedang umum (70% chance 100-400kg)
    // - Hasil rendah kadang (25% chance 20-100kg)
    const resultCategory = Math.random();
    if (resultCategory < 0.05 && harvestAmount > 600) {
      // 5% chance hasil sangat tinggi
      harvestAmount = 800 + Math.random() * 700; // 800-1500kg
    } else if (resultCategory < 0.75) {
      // 70% hasil normal
      harvestAmount = Math.max(100, Math.min(400, harvestAmount));
    } else {
      // 25% hasil rendah karena faktor eksternal
      harvestAmount = 20 + Math.random() * 80; // 20-100kg
    }

    // Final bounds
    harvestAmount = Math.max(20, Math.min(1500, Math.round(harvestAmount)));

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

  // Analisis korelasi untuk memastikan data bagus
  const costs = harvests.map((h) => h.productionCost / 1000); // dalam ribuan
  const amounts = harvests.map((h) => h.harvestAmount);
  const weatherss = harvests.map((h) => {
    const weatherIdx = weatherIds.findIndex((id) => id === h.weatherId);
    return weatherIdx + 1;
  });

  // Hitung korelasi sederhana
  const costMean = costs.reduce((a, b) => a + b) / costs.length;
  const amountMean = amounts.reduce((a, b) => a + b) / amounts.length;
  const weatherMean = weatherss.reduce((a, b) => a + b) / weathers.length;

  let costAmountCorr = 0,
    weatherAmountCorr = 0;
  for (let i = 0; i < harvests.length; i++) {
    costAmountCorr += (costs[i] - costMean) * (amounts[i] - amountMean);
    weatherAmountCorr +=
      (weatherss[i] - weatherMean) * (amounts[i] - amountMean);
  }

  console.log(`Data Analysis:`);
  console.log(`- Average harvest: ${Math.round(amountMean)} kg`);
  console.log(
    `- Average cost: Rp ${Math.round(costMean * 1000).toLocaleString()}`
  );
  console.log(`- Average weather: ${weatherMean.toFixed(1)}`);
  console.log(
    `- Cost-Harvest correlation trend: ${
      costAmountCorr > 0 ? "Positive" : "Negative"
    }`
  );
  console.log(
    `- Weather-Harvest correlation trend: ${
      weatherAmountCorr > 0
        ? "Positive (worse weather = more harvest?)"
        : "Negative (worse weather = less harvest)"
    }`
  );
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
