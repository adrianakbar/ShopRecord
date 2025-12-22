import prisma from '../lib/prisma';

async function checkData() {
  console.log('🔍 Checking database...\n');

  // Check all users in expenses table
  const allExpenses = await prisma.expense.findMany({
    select: {
      userId: true,
    },
    distinct: ['userId'],
  });

  console.log('User IDs with expenses:');
  allExpenses.forEach((exp, i) => {
    console.log(`  ${i + 1}. ${exp.userId}`);
  });

  // Count expenses per user
  for (const exp of allExpenses) {
    const count = await prisma.expense.count({
      where: { userId: exp.userId },
    });
    console.log(`  └─ User ${exp.userId}: ${count} expenses`);
  }

  // Check categories
  const categories = await prisma.category.findMany({
    select: {
      userId: true,
      name: true,
    },
  });

  console.log('\nCategories:');
  categories.forEach((cat) => {
    console.log(`  - ${cat.name} (User: ${cat.userId})`);
  });

  await prisma.$disconnect();
}

checkData().catch(console.error);
