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

  const matt = await prisma.user.upsert({
    where: {
      email: 'matt.dimmic@gmail.com',
    },
    update: {},
    create: {
      email: 'matt.dimmic@gmail.com',
      name: 'Matt Dimmic',
      username: 'matt.dimmic',
      superAdmin: true,
      pronouns: {
        connectOrCreate: {
          create: {
            pronouns: 'He/Him',
          },
          where: {
            pronouns: 'He/Him',
          },
        },
      },
    },
  });

  const libby = await prisma.user.upsert({
    where: {
      email: 'libby.swanger@gmail.com',
    },
    update: {
      superAdmin: false,
    },
    create: {
      email: 'libby.swanger@gmail.com',
      name: 'Libby Swanger',
      username: null,
      superAdmin: false,
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
    update: {
      superAdmin: false,
    },
    create: {
      email: 'kelliedlynch@gmail.com',
      name: 'Kellie Lynch',
      username: 'kelliedlynch',
      superAdmin: false,
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

  const guide = await prisma.user.upsert({
    where: {
      email: 'guide@geekway.com',
    },
    update: {},
    create: {
      email: 'guide@geekway.com',
      name: 'Geek Guide',
      username: 'guide',
      superAdmin: false,
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

  const kiosk = await prisma.user.upsert({
    where: {
      email: 'kiosk@geekway.com',
    },
    update: {},
    create: {
      email: 'kiosk@geekway.com',
      name: 'P&N Kiosk',
      username: 'kiosk',
      superAdmin: false,
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

  const mmStu = await prisma.user.upsert({
    where: {
      email: 'stu@miniaturemarket.com',
    },
    update: {},
    create: {
      email: 'stu@miniaturemarket.com',
      name: 'Minature Market',
      username: 'miniaturemarket',
      superAdmin: false,
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

  const mark = await prisma.user.upsert({
    where: {
      email: 'maffoe@gmail.com',
    },
    update: {},
    create: {
      email: 'maffoe@gmail.com',
      name: 'Mark Finefield',
      username: 'mark.finefield',
      superAdmin: false,
      pronouns: {
        connectOrCreate: {
          create: {
            pronouns: 'He/Him',
          },
          where: {
            pronouns: 'He/Him',
          },
        },
      },
    },
  });

  const jay = await prisma.user.upsert({
    where: {
      email: 'jay.mukid@gmail.com',
    },
    update: {},
    create: {
      email: 'jay.mukid@gmail.com',
      name: 'Jay Moore',
      username: null,
      superAdmin: false,
      pronouns: {
        connectOrCreate: {
          create: {
            pronouns: 'He/Him',
          },
          where: {
            pronouns: 'He/Him',
          },
        },
      },
    },
  });

  const merlin = await prisma.user.upsert({
    where: {
      email: 'merliquin@gmail.com',
    },
    update: {},
    create: {
      email: 'merliquin@gmail.com',
      name: 'Merlin Whitman',
      username: null,
      superAdmin: false,
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

  const mari = await prisma.user.upsert({
    where: {
      email: 'marib573@gmail.com',
    },
    update: {},
    create: {
      email: 'marib573@gmail.com',
      name: 'Mari Berger',
      username: null,
      superAdmin: false,
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

  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@geekway.com',
    },
    update: {},
    create: {
      email: 'admin@geekway.com',
      name: 'Admin',
      username: null,
      superAdmin: false,
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

  const elzie = await prisma.user.upsert({
    where: {
      email: 'elzie.ann@gmail.com',
    },
    update: {
      superAdmin: false,
    },
    create: {
      email: 'elzie.ann@gmail.com',
      name: 'Elzie Ann',
      username: null,
      superAdmin: false,
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

  const mmStaff = await prisma.user.upsert({
    where: {
      email: 'mm@geekway.com',
    },
    update: {},
    create: {
      email: 'mm@geekway.com',
      name: 'Miniature Market Staff',
      username: null,
      superAdmin: false,
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
    },
  });

  const geekwayPrime2024 = await prisma.convention.upsert({
    where: {
      name_organizationId: {
        name: 'Geekway to the West 2024',
        organizationId: geekway.id,
      },
    },
    update: {},
    create: {
      name: 'Geekway to the West 2024',
      organizationId: geekway.id,
      theme: 'Geekway to the Seven Seas: Dead Meeples Tell No Tales',
      tteConventionId: 'E786E922-7809-11EE-9C07-FDBFB222AECF',
      startDate: '2024-05-16T08:00:00.000Z',
      endDate: '2024-05-19T18:00:00.000Z',
      typeId: conventionTypePrime.id,
    },
  });

  const geekwayMini2025 = await prisma.convention.upsert({
    where: {
      name_organizationId: {
        name: 'Geekway Mini 2025',
        organizationId: geekway.id,
      },
    },
    update: {},
    create: {
      name: 'Geekway Mini 2025',
      organizationId: geekway.id,
      theme: 'Geekway to the Dragon Hoard',
      tteConventionId: '7B897EE6-30BF-11EF-B3C9-95421E8F6007',
      startDate: '2025-01-17T10:00:00.000Z',
      endDate: '2025-01-19T18:00:00.000Z',
      typeId: conventionTypeMini.id,
    },
  });

  const geekwayPrime2025 = await prisma.convention.upsert({
    where: {
      name_organizationId: {
        name: 'Geekway to the West 2025',
        organizationId: geekway.id,
      },
    },
    update: {
      typeId: conventionTypeMini.id,
    },
    create: {
      name: 'Geekway to the West 2025',
      organizationId: geekway.id,
      theme: 'One Con to Bring Them All',
      tteConventionId: '46F73CEE-4083-11EF-9E30-CB11F56173A2',
      startDate: '2025-05-15T08:00:00.000Z',
      endDate: '2025-05-18T18:00:00.000Z',
      typeId: conventionTypeMini.id,
    },
  });

  const geekwayMini2026 = await prisma.convention.upsert({
    where: {
      name_organizationId: {
        name: 'Geekway Mini 2026',
        organizationId: geekway.id,
      },
    },
    update: {},
    create: {
      name: 'Geekway Mini 2026',
      organizationId: geekway.id,
      theme: 'Geekway Below: Vault 26',
      tteConventionId: '92DB1D20-846F-11F0-BC85-5136BAD07C23',
      startDate: '2026-01-09T10:00:00.000Z',
      endDate: '2026-01-11T17:00:00.000Z',
      typeId: conventionTypePrime.id,
    },
  });

  await prisma.userOrganizationPermissions.upsert({
    where: {
      userId_organizationId: {
        userId: mattie.id,
        organizationId: geekway.id,
      },
    },
    update: {},
    create: {
      userId: mattie.id,
      organizationId: geekway.id,
      admin: true,
      geekGuide: false,
      readOnly: false,
    },
  });

  await prisma.userOrganizationPermissions.upsert({
    where: {
      userId_organizationId: {
        userId: matt.id,
        organizationId: geekway.id,
      },
    },
    update: {},
    create: {
      userId: matt.id,
      organizationId: geekway.id,
      admin: true,
      geekGuide: false,
      readOnly: false,
    },
  });

  await prisma.userOrganizationPermissions.upsert({
    where: {
      userId_organizationId: {
        userId: admin.id,
        organizationId: geekway.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      organizationId: geekway.id,
      admin: true,
      geekGuide: false,
      readOnly: false,
    },
  });

  await prisma.userOrganizationPermissions.upsert({
    where: {
      userId_organizationId: {
        userId: mark.id,
        organizationId: geekway.id,
      },
    },
    update: {},
    create: {
      userId: mark.id,
      organizationId: geekway.id,
      admin: true,
      geekGuide: false,
      readOnly: false,
    },
  });

  await prisma.userOrganizationPermissions.upsert({
    where: {
      userId_organizationId: {
        userId: guide.id,
        organizationId: geekway.id,
      },
    },
    update: {},
    create: {
      userId: guide.id,
      organizationId: geekway.id,
      admin: false,
      geekGuide: true,
      readOnly: false,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: mattie.id,
        conventionId: geekwayMini2024.id,
      },
    },
    update: {},
    create: {
      userId: mattie.id,
      conventionId: geekwayMini2024.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: admin.id,
        conventionId: geekwayMini2024.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      conventionId: geekwayMini2024.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: matt.id,
        conventionId: geekwayMini2024.id,
      },
    },
    update: {},
    create: {
      userId: matt.id,
      conventionId: geekwayMini2024.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: mark.id,
        conventionId: geekwayMini2024.id,
      },
    },
    update: {},
    create: {
      userId: mark.id,
      conventionId: geekwayMini2024.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: guide.id,
        conventionId: geekwayMini2024.id,
      },
    },
    update: {},
    create: {
      userId: guide.id,
      conventionId: geekwayMini2024.id,
      admin: false,
      geekGuide: true,
      attendee: false,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: kiosk.id,
        conventionId: geekwayMini2024.id,
      },
    },
    update: {},
    create: {
      userId: kiosk.id,
      conventionId: geekwayMini2024.id,
      admin: false,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: mattie.id,
        conventionId: geekwayPrime2024.id,
      },
    },
    update: {},
    create: {
      userId: mattie.id,
      conventionId: geekwayPrime2024.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: admin.id,
        conventionId: geekwayPrime2024.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      conventionId: geekwayPrime2024.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: matt.id,
        conventionId: geekwayPrime2024.id,
      },
    },
    update: {},
    create: {
      userId: matt.id,
      conventionId: geekwayPrime2024.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: mark.id,
        conventionId: geekwayPrime2024.id,
      },
    },
    update: {},
    create: {
      userId: mark.id,
      conventionId: geekwayPrime2024.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: guide.id,
        conventionId: geekwayPrime2024.id,
      },
    },
    update: {},
    create: {
      userId: guide.id,
      conventionId: geekwayPrime2024.id,
      admin: false,
      geekGuide: true,
      attendee: false,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: kiosk.id,
        conventionId: geekwayPrime2024.id,
      },
    },
    update: {},
    create: {
      userId: kiosk.id,
      conventionId: geekwayPrime2024.id,
      admin: false,
      geekGuide: false,
      attendee: true,
    },
  });

  const mmStoreLibrary = await prisma.convention.upsert({
    where: {
      name_organizationId: {
        name: 'Miniature Market Store Library',
        organizationId: geekway.id,
      },
    },
    update: {},
    create: {
      name: 'Miniature Market Store Library',
      organizationId: geekway.id,
      theme: 'Miniature Market',
      tteConventionId: '',
      startDate: '2024-11-23T10:00:00.000Z',
      endDate: '2030-11-23T18:00:00.000Z',
      typeId: conventionTypeSE.id,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: mmStaff.id,
        conventionId: mmStoreLibrary.id,
      },
    },
    update: {},
    create: {
      userId: mmStaff.id,
      conventionId: mmStoreLibrary.id,
      admin: false,
      geekGuide: true,
      attendee: false,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: mattie.id,
        conventionId: geekwayMini2025.id,
      },
    },
    update: {},
    create: {
      userId: mattie.id,
      conventionId: geekwayMini2025.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: admin.id,
        conventionId: geekwayMini2025.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      conventionId: geekwayMini2025.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: matt.id,
        conventionId: geekwayMini2025.id,
      },
    },
    update: {},
    create: {
      userId: matt.id,
      conventionId: geekwayMini2025.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: mark.id,
        conventionId: geekwayMini2025.id,
      },
    },
    update: {},
    create: {
      userId: mark.id,
      conventionId: geekwayMini2025.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: guide.id,
        conventionId: geekwayMini2025.id,
      },
    },
    update: {},
    create: {
      userId: guide.id,
      conventionId: geekwayMini2025.id,
      admin: false,
      geekGuide: true,
      attendee: false,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: kiosk.id,
        conventionId: geekwayMini2025.id,
      },
    },
    update: {},
    create: {
      userId: kiosk.id,
      conventionId: geekwayMini2025.id,
      admin: false,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userOrganizationPermissions.deleteMany({
    where: {
      userId: mmStu.id,
    },
  });

  await prisma.userOrganizationPermissions.deleteMany({
    where: {
      userId: kellie.id,
    },
  });

  await prisma.userOrganizationPermissions.deleteMany({
    where: {
      userId: libby.id,
    },
  });

  await prisma.userOrganizationPermissions.deleteMany({
    where: {
      userId: elzie.id,
    },
  });

  await prisma.userConventionPermissions.deleteMany({
    where: {
      userId: mmStu.id,
    },
  });

  await prisma.userConventionPermissions.deleteMany({
    where: {
      userId: kellie.id,
    },
  });

  await prisma.userConventionPermissions.deleteMany({
    where: {
      userId: libby.id,
    },
  });

  await prisma.userConventionPermissions.deleteMany({
    where: {
      userId: elzie.id,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: mattie.id,
        conventionId: geekwayPrime2025.id,
      },
    },
    update: {},
    create: {
      userId: mattie.id,
      conventionId: geekwayPrime2025.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: admin.id,
        conventionId: geekwayPrime2025.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      conventionId: geekwayPrime2025.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: matt.id,
        conventionId: geekwayPrime2025.id,
      },
    },
    update: {},
    create: {
      userId: matt.id,
      conventionId: geekwayPrime2025.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: mark.id,
        conventionId: geekwayPrime2025.id,
      },
    },
    update: {},
    create: {
      userId: mark.id,
      conventionId: geekwayPrime2025.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: guide.id,
        conventionId: geekwayPrime2025.id,
      },
    },
    update: {},
    create: {
      userId: guide.id,
      conventionId: geekwayPrime2025.id,
      admin: false,
      geekGuide: true,
      attendee: false,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: kiosk.id,
        conventionId: geekwayPrime2025.id,
      },
    },
    update: {},
    create: {
      userId: kiosk.id,
      conventionId: geekwayPrime2025.id,
      admin: false,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: mattie.id,
        conventionId: geekwayMini2026.id,
      },
    },
    update: {},
    create: {
      userId: mattie.id,
      conventionId: geekwayMini2026.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: admin.id,
        conventionId: geekwayMini2026.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      conventionId: geekwayMini2026.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: matt.id,
        conventionId: geekwayMini2026.id,
      },
    },
    update: {},
    create: {
      userId: matt.id,
      conventionId: geekwayMini2026.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: mark.id,
        conventionId: geekwayMini2026.id,
      },
    },
    update: {},
    create: {
      userId: mark.id,
      conventionId: geekwayMini2026.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: guide.id,
        conventionId: geekwayMini2026.id,
      },
    },
    update: {},
    create: {
      userId: guide.id,
      conventionId: geekwayMini2026.id,
      admin: false,
      geekGuide: true,
      attendee: false,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: kiosk.id,
        conventionId: geekwayMini2026.id,
      },
    },
    update: {},
    create: {
      userId: kiosk.id,
      conventionId: geekwayMini2026.id,
      admin: false,
      geekGuide: false,
      attendee: true,
    },
  });

  try {
    await prisma.conventionCollections.upsert({
      where: {
        conventionId_collectionId: {
          collectionId: 4,
          conventionId: mmStoreLibrary.id,
        },
      },
      update: {},
      create: {
        collectionId: 4,
        conventionId: mmStoreLibrary.id,
      },
    });
  } catch (e) {}

  try {
    await prisma.conventionCollections.upsert({
      where: {
        conventionId_collectionId: {
          collectionId: 4,
          conventionId: mmStoreLibrary.id,
        },
      },
      update: {},
      create: {
        collectionId: 4,
        conventionId: mmStoreLibrary.id,
      },
    });
  } catch (e) {}

  try {
    await prisma.conventionCollections.upsert({
      where: {
        conventionId_collectionId: {
          collectionId: 5,
          conventionId: mmStoreLibrary.id,
        },
      },
      update: {},
      create: {
        collectionId: 5,
        conventionId: mmStoreLibrary.id,
      },
    });
  } catch (e) {}

  try {
    await prisma.conventionCollections.upsert({
      where: {
        conventionId_collectionId: {
          collectionId: 1,
          conventionId: geekwayPrime2025.id,
        },
      },
      update: {},
      create: {
        collectionId: 1,
        conventionId: geekwayPrime2025.id,
      },
    });
  } catch (e) {}

  try {
    await prisma.conventionCollections.upsert({
      where: {
        conventionId_collectionId: {
          collectionId: 2,
          conventionId: geekwayPrime2025.id,
        },
      },
      update: {},
      create: {
        collectionId: 2,
        conventionId: geekwayPrime2025.id,
      },
    });
  } catch (e) {}

  try {
    await prisma.conventionCollections.upsert({
      where: {
        conventionId_collectionId: {
          collectionId: 4,
          conventionId: geekwayPrime2025.id,
        },
      },
      update: {},
      create: {
        collectionId: 4,
        conventionId: geekwayPrime2025.id,
      },
    });
  } catch (e) {}

  try {
    await prisma.conventionCollections.upsert({
      where: {
        conventionId_collectionId: {
          collectionId: 5,
          conventionId: geekwayPrime2025.id,
        },
      },
      update: {},
      create: {
        collectionId: 5,
        conventionId: geekwayPrime2025.id,
      },
    });
  } catch (e) {}

  try {
    await prisma.conventionCollections.upsert({
      where: {
        conventionId_collectionId: {
          collectionId: 4,
          conventionId: geekwayMini2026.id,
        },
      },
      update: {},
      create: {
        collectionId: 4,
        conventionId: geekwayMini2026.id,
      },
    });
  } catch (e) {}

  try {
    await prisma.conventionCollections.upsert({
      where: {
        conventionId_collectionId: {
          collectionId: 15,
          conventionId: geekwayMini2026.id,
        },
      },
      update: {},
      create: {
        collectionId: 15,
        conventionId: geekwayMini2026.id,
      },
    });
  } catch (e) {}
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
