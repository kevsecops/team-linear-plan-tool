import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create users
  const user1 = await prisma.user.upsert({
    where: { id: 'user1' },
    update: {},
    create: {
      id: 'user1',
      name: 'Alice Johnson',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { id: 'user2' },
    update: {},
    create: {
      id: 'user2',
      name: 'Bob Smith',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { id: 'user3' },
    update: {},
    create: {
      id: 'user3',
      name: 'Carol Williams',
    },
  });

  // Create event types
  const ptoType = await prisma.eventType.upsert({
    where: { name: 'PTO' },
    update: {},
    create: {
      name: 'PTO',
      colorHexCode: '#FF6B6B',
    },
  });

  const marketingType = await prisma.eventType.upsert({
    where: { name: 'Marketing Launch' },
    update: {},
    create: {
      name: 'Marketing Launch',
      colorHexCode: '#4ECDC4',
    },
  });

  const conferenceType = await prisma.eventType.upsert({
    where: { name: 'Conference' },
    update: {},
    create: {
      name: 'Conference',
      colorHexCode: '#95E1D3',
    },
  });

  const teamEventType = await prisma.eventType.upsert({
    where: { name: 'Team Event' },
    update: {},
    create: {
      name: 'Team Event',
      colorHexCode: '#F38181',
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

