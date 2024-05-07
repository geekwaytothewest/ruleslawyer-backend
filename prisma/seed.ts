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

  const mm = await prisma.user.upsert({
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
    update: {},
    create: {
      email: 'elzie.ann@gmail.com',
      name: 'Elzie Ann',
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
              userId: elzie.id,
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
            {
              userId: guide.id,
              admin: false,
              geekGuide: true,
              readOnly: false,
            },
            {
              userId: mm.id,
              admin: false,
              geekGuide: true,
              readOnly: false,
            },
            {
              userId: mark.id,
              admin: true,
              geekGuide: false,
              readOnly: false,
            },
            {
              userId: matt.id,
              admin: true,
              geekGuide: false,
              readOnly: false,
            },
            {
              userId: jay.id,
              admin: true,
              geekGuide: false,
              readOnly: false,
            },
            {
              userId: mari.id,
              admin: true,
              geekGuide: false,
              readOnly: false,
            },
            {
              userId: merlin.id,
              admin: true,
              geekGuide: false,
              readOnly: false,
            },
            {
              userId: admin.id,
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
              userId: elzie.id,
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
            {
              userId: guide.id,
              admin: false,
              geekGuide: true,
              attendee: true,
            },
            {
              userId: kiosk.id,
              admin: false,
              geekGuide: false,
              attendee: true,
            },
            {
              userId: mm.id,
              admin: false,
              geekGuide: false,
              attendee: true,
            },
            {
              userId: mark.id,
              admin: true,
              geekGuide: false,
              attendee: true,
            },
            {
              userId: matt.id,
              admin: true,
              geekGuide: false,
              attendee: true,
            },
            {
              userId: admin.id,
              admin: true,
              geekGuide: false,
              attendee: true,
            },
          ],
        },
      },
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
              userId: elzie.id,
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
            {
              userId: guide.id,
              admin: false,
              geekGuide: true,
              attendee: true,
            },
            {
              userId: kiosk.id,
              admin: false,
              geekGuide: false,
              attendee: true,
            },
            {
              userId: mm.id,
              admin: false,
              geekGuide: false,
              attendee: true,
            },
            {
              userId: mark.id,
              admin: true,
              geekGuide: false,
              attendee: true,
            },
            {
              userId: matt.id,
              admin: true,
              geekGuide: false,
              attendee: true,
            },
            {
              userId: admin.id,
              admin: true,
              geekGuide: false,
              attendee: true,
            },
          ],
        },
      },
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
        userId: elzie.id,
        organizationId: geekway.id,
      },
    },
    update: {},
    create: {
      userId: elzie.id,
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
        userId: libby.id,
        organizationId: geekway.id,
      },
    },
    update: {},
    create: {
      userId: libby.id,
      organizationId: geekway.id,
      admin: true,
      geekGuide: false,
      readOnly: false,
    },
  });

  await prisma.userOrganizationPermissions.upsert({
    where: {
      userId_organizationId: {
        userId: kellie.id,
        organizationId: geekway.id,
      },
    },
    update: {},
    create: {
      userId: kellie.id,
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

  await prisma.userOrganizationPermissions.upsert({
    where: {
      userId_organizationId: {
        userId: mm.id,
        organizationId: geekway.id,
      },
    },
    update: {},
    create: {
      userId: mm.id,
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
        userId: elzie.id,
        conventionId: geekwayMini2024.id,
      },
    },
    update: {},
    create: {
      userId: elzie.id,
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
        userId: libby.id,
        conventionId: geekwayMini2024.id,
      },
    },
    update: {},
    create: {
      userId: libby.id,
      conventionId: geekwayMini2024.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: kellie.id,
        conventionId: geekwayMini2024.id,
      },
    },
    update: {},
    create: {
      userId: kellie.id,
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
        userId: mm.id,
        conventionId: geekwayMini2024.id,
      },
    },
    update: {},
    create: {
      userId: mm.id,
      conventionId: geekwayMini2024.id,
      admin: false,
      geekGuide: true,
      attendee: false,
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
        userId: libby.id,
        conventionId: geekwayPrime2024.id,
      },
    },
    update: {},
    create: {
      userId: libby.id,
      conventionId: geekwayPrime2024.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: kellie.id,
        conventionId: geekwayPrime2024.id,
      },
    },
    update: {},
    create: {
      userId: kellie.id,
      conventionId: geekwayPrime2024.id,
      admin: true,
      geekGuide: false,
      attendee: true,
    },
  });

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: elzie.id,
        conventionId: geekwayPrime2024.id,
      },
    },
    update: {},
    create: {
      userId: elzie.id,
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

  await prisma.userConventionPermissions.upsert({
    where: {
      userId_conventionId: {
        userId: mm.id,
        conventionId: geekwayPrime2024.id,
      },
    },
    update: {},
    create: {
      userId: mm.id,
      conventionId: geekwayPrime2024.id,
      admin: false,
      geekGuide: true,
      attendee: false,
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
