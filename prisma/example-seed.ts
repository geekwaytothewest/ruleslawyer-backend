import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@example.com',
    },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      username: 'adminuser',
      superAdmin: true,
      pronouns: {
        connectOrCreate: {
          create: {
            pronouns: 'They/Them',
          },
          where: {
            pronouns: 'They/Them',
          },
        },
      },
    },
  });

  const coAdmin = await prisma.user.upsert({
    where: {
      email: 'coadmin@example.com',
    },
    update: {},
    create: {
      email: 'coadmin@example.com',
      name: 'Co Admin',
      username: null,
      superAdmin: true,
      pronouns: {
        connectOrCreate: {
          create: {
            pronouns: 'They/Them',
          },
          where: {
            pronouns: 'They/Them',
          },
        },
      },
    },
  });

  const geekway = await prisma.organization.upsert({
    where: {
      name: 'Geekway to the West',
    },
    update: {},
    create: {
      name: 'Geekway to the West',
      ownerId: admin.id,
      users: {
        create: {
          userId: coAdmin.id,
          admin: true,
          geekGuide: false,
          readOnly: false,
        },
      },
    },
  });

  const conventionTypePrime = await prisma.conventionType.upsert({
    where: {
      name_organizationId: {
        name: 'Geekway to the West',
        organizationId: geekway.id,
      },
    },
    update: {},
    create: {
      name: 'Geekway to the West',
      organizationId: geekway.id,
    },
  });

  const conventionTypeMini = await prisma.conventionType.upsert({
    where: {
      name_organizationId: {
        name: 'Geekway Mini',
        organizationId: geekway.id,
      },
    },
    update: {},
    create: {
      name: 'Geekway Mini',
      organizationId: geekway.id,
    },
  });

  const geekwayMini2024 = await prisma.convention.upsert({
    where: {
      name_organizationId: {
        name: 'Geekway Mini 2024',
        organizationId: geekway.id,
      },
    },
    update: {},
    create: {
      name: 'Geekway Mini 2024',
      organizationId: geekway.id,
      theme: 'Geekway to the Future',
      tteConventionId: '00000000-0000-0000-0000-000000000000',
      startDate: '2024-01-12T10:00:00.000Z',
      endDate: '2024-01-14T18:00:00.000Z',
      typeId: conventionTypeMini.id,
      users: {
        createMany: {
          data: [
            {
              userId: admin.id,
              admin: true,
              geekGuide: false,
              attendee: true,
            },
            {
              userId: coAdmin.id,
              admin: true,
              geekGuide: false,
              attendee: true,
            },
          ],
        },
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });