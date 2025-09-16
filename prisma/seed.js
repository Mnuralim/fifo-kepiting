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

    let harvestAmount = Math.floor(Math.random() * 900) + 100;

    const weatherIndex = Math.floor(Math.random() * weatherIds.length);
    const weatherId = weatherIds[weatherIndex];
    const weatherEffect = (weatherIndex + 1) * 10;

    const productionCost = harvestAmount * (15 + (Math.random() * 5 - 2.5));

    harvestAmount = Math.max(
      50,
      harvestAmount + (Math.random() * weatherEffect - weatherEffect / 2)
    );

    harvests.push({
      date: date.toISOString(),
      weatherId: weatherId,
      harvestAmount: Math.round(harvestAmount),
      productionCost: Math.round(productionCost) * 10,
    });
  }

  await prisma.harvestRecord.createMany({
    data: harvests,
  });

  console.log("90 harvest records seeded successfully!");
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
