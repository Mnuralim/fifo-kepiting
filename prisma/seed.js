const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

// Buat instance Prisma baru dengan konfigurasi yang lebih baik
const prisma = new PrismaClient({
  log: ["warn", "error"],
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

    // Generate harvest amount berdasarkan distribusi yang realistis
    // 5% chance untuk hasil tinggi (800-1500 kg)
    // 70% chance untuk hasil rata-rata (100-300 kg)
    // 25% chance untuk hasil rendah (20-99 kg)
    let harvestAmount;
    const random = Math.random();

    if (random < 0.05) {
      // 5% - Hasil tinggi (jarang terjadi)
      harvestAmount = Math.floor(Math.random() * 700) + 800; // 800-1500 kg
    } else if (random < 0.75) {
      // 70% - Hasil rata-rata
      harvestAmount = Math.floor(Math.random() * 200) + 100; // 100-300 kg
    } else {
      // 25% - Hasil rendah
      harvestAmount = Math.floor(Math.random() * 80) + 20; // 20-99 kg
    }

    // Pengaruh cuaca terhadap hasil panen
    const weatherIndex = Math.floor(Math.random() * weatherIds.length);
    const weatherId = weatherIds[weatherIndex];
    const weatherMultiplier =
      weatherIndex <= 2 ? 1.1 : weatherIndex >= 5 ? 0.8 : 1.0;
    harvestAmount = Math.round(harvestAmount * weatherMultiplier);

    // Batasi hasil maksimal ke 1500 kg dan minimal ke 20 kg
    harvestAmount = Math.max(20, Math.min(1500, harvestAmount));

    // Generate production cost (biaya produksi)
    // Biaya antara 180rb - 300rb dengan distribusi yang wajar
    const baseCost =
      Math.random() < 0.3
        ? Math.floor(Math.random() * 60) + 180 // 30% chance: 180-240
        : Math.floor(Math.random() * 120) + 180; // 70% chance: 180-300

    // Biaya bisa sedikit dipengaruhi oleh jumlah hasil panen
    const harvestCostFactor =
      harvestAmount > 500 ? 1.1 : harvestAmount < 100 ? 0.9 : 1.0;
    let productionCostInThousands = Math.round(baseCost * harvestCostFactor);

    // Batasi biaya sesuai range yang diminta (dalam ribuan)
    productionCostInThousands = Math.max(
      180,
      Math.min(300, productionCostInThousands)
    );

    // Convert ke rupiah penuh (ribuan)
    const productionCost = productionCostInThousands * 1000;

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

  // Log statistik untuk verifikasi
  const totalHarvest = harvests.reduce((sum, h) => sum + h.harvestAmount, 0);
  const avgHarvest = totalHarvest / harvests.length;
  const maxHarvest = Math.max(...harvests.map((h) => h.harvestAmount));
  const minHarvest = Math.min(...harvests.map((h) => h.harvestAmount));

  const totalCost = harvests.reduce((sum, h) => sum + h.productionCost, 0);
  const avgCost = totalCost / harvests.length;
  const maxCost = Math.max(...harvests.map((h) => h.productionCost));
  const minCost = Math.min(...harvests.map((h) => h.productionCost));

  console.log(`Harvest Statistics:`);
  console.log(`- Average: ${Math.round(avgHarvest)} kg`);
  console.log(`- Max: ${maxHarvest} kg`);
  console.log(`- Min: ${minHarvest} kg`);
  console.log(`Cost Statistics:`);
  console.log(`- Average: Rp ${Math.round(avgCost).toLocaleString()}`);
  console.log(`- Max: Rp ${maxCost.toLocaleString()}`);
  console.log(`- Min: Rp ${minCost.toLocaleString()}`);
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
