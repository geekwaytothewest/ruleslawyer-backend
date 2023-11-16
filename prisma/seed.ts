import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const mattie = await prisma.user.upsert({
    where: {
      email: 'mattie@mattie.lgbt',
    },
    update: {},
    create: {
      email: 'mattie@mattie.lgbt',
      name: 'Mattie Schraeder',
      username: 'AFrozenPeach',
      superAdmin: true,
      pronouns: {
        connectOrCreate: {
          create: {
            pronouns: 'She/Her',
          },
          where: {
            pronouns: 'She/Her',
          },
        },
      },
    },
  });

  const libby = await prisma.user.upsert({
    where: {
      email: 'libby.swanger@gmail.com',
    },
    update: {},
    create: {
      email: 'libby.swanger@gmail.com',
      name: 'Libby Swanger',
      username: null,
      superAdmin: true,
      pronouns: {
        connectOrCreate: {
          create: {
            pronouns: 'She/Her',
          },
          where: {
            pronouns: 'She/Her',
          },
        },
      },
    },
  });

  const kellie = await prisma.user.upsert({
    where: {
      email: 'kelliedlynch@gmail.com',
    },
    update: {},
    create: {
      email: 'kelliedlynch@gmail.com',
      name: 'Kellie Lynch',
      username: 'kelliedlynch',
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
      ownerId: mattie.id,
      users: {
        createMany: {
          data: [
            {
              userId: libby.id,
              admin: true,
              geekGuide: false,
              readOnly: false,
            },
            {
              userId: kellie.id,
              admin: true,
              geekGuide: false,
              readOnly: false,
            },
          ],
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

  const conventionTypeMicro = await prisma.conventionType.upsert({
    where: {
      name_organizationId: {
        name: 'Geekway Micro',
        organizationId: geekway.id,
      },
    },
    update: {},
    create: {
      name: 'Geekway Micro',
      organizationId: geekway.id,
    },
  });

  const conventionTypeNano = await prisma.conventionType.upsert({
    where: {
      name_organizationId: {
        name: 'Geekway Nano',
        organizationId: geekway.id,
      },
    },
    update: {},
    create: {
      name: 'Geekway Nano',
      organizationId: geekway.id,
    },
  });

  const conventionTypeSE = await prisma.conventionType.upsert({
    where: {
      name_organizationId: {
        name: 'Geekway Special Event',
        organizationId: geekway.id,
      },
    },
    update: {},
    create: {
      name: 'Geekway Special Event',
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
      tteConventionId: '85640642-5678-11EE-889C-E67A6477A211',
      startDate: '2024-01-12T10:00:00.000Z',
      endDate: '2024-01-14T18:00:00.000Z',
      typeId: conventionTypeMini.id,
      users: {
        createMany: {
          data: [
            {
              userId: mattie.id,
              admin: true,
              geekGuide: false,
              attendee: true,
            },
            {
              userId: libby.id,
              admin: true,
              geekGuide: false,
              attendee: true,
            },
            {
              userId: kellie.id,
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
