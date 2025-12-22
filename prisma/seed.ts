import prisma from '../lib/prisma';

// This is a mock user ID - replace with actual user ID from Supabase Auth
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data for the mock user (optional - for development)
  await prisma.expense.deleteMany({ where: { userId: MOCK_USER_ID } });
  await prisma.category.deleteMany({ where: { userId: MOCK_USER_ID } });
  
  console.log('🗑️  Cleaned existing data');

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        userId: MOCK_USER_ID,
        name: 'Food & Dining',
        icon: 'restaurant',
        color: '#FF6B6B',
      },
    }),
    prisma.category.create({
      data: {
        userId: MOCK_USER_ID,
        name: 'Groceries',
        icon: 'shopping_cart',
        color: '#4ECDC4',
      },
    }),
    prisma.category.create({
      data: {
        userId: MOCK_USER_ID,
        name: 'Transportation',
        icon: 'directions_car',
        color: '#95E1D3',
      },
    }),
    prisma.category.create({
      data: {
        userId: MOCK_USER_ID,
        name: 'Utilities',
        icon: 'receipt_long',
        color: '#F38181',
      },
    }),
    prisma.category.create({
      data: {
        userId: MOCK_USER_ID,
        name: 'Entertainment',
        icon: 'movie',
        color: '#AA96DA',
      },
    }),
    prisma.category.create({
      data: {
        userId: MOCK_USER_ID,
        name: 'Shopping',
        icon: 'shopping_bag',
        color: '#FCBAD3',
      },
    }),
    prisma.category.create({
      data: {
        userId: MOCK_USER_ID,
        name: 'Healthcare',
        icon: 'local_hospital',
        color: '#FFFFD2',
      },
    }),
    prisma.category.create({
      data: {
        userId: MOCK_USER_ID,
        name: 'Coffee & Cafe',
        icon: 'local_cafe',
        color: '#A8DADC',
      },
    }),
  ]);

  console.log('✅ Created categories');

  // Helper to get date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const fiveDaysAgo = new Date(today);
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  // Create Expenses
  const expenses = [
    // Today's expenses
    {
      userId: MOCK_USER_ID,
      categoryId: categories.find(c => c.name === 'Coffee & Cafe')?.id,
      item: 'Starbucks Coffee',
      amount: 5.50,
      expenseDate: today,
      notes: 'Grande Caramel Macchiato - Visa •••• 4242',
    },
    {
      userId: MOCK_USER_ID,
      categoryId: categories.find(c => c.name === 'Groceries')?.id,
      item: 'Whole Foods Market',
      amount: 39.50,
      expenseDate: today,
      notes: 'Weekly groceries - Apple Pay',
    },
    {
      userId: MOCK_USER_ID,
      categoryId: categories.find(c => c.name === 'Food & Dining')?.id,
      item: 'Lunch at Chipotle',
      amount: 12.75,
      expenseDate: today,
      notes: 'Burrito bowl - MasterCard •••• 8812',
    },

    // Yesterday's expenses
    {
      userId: MOCK_USER_ID,
      categoryId: categories.find(c => c.name === 'Transportation')?.id,
      item: 'Uber Trip',
      amount: 25.00,
      expenseDate: yesterday,
      notes: 'Home to office - MasterCard •••• 8812',
    },
    {
      userId: MOCK_USER_ID,
      categoryId: categories.find(c => c.name === 'Utilities')?.id,
      item: 'Electric Bill',
      amount: 95.00,
      expenseDate: yesterday,
      notes: 'Monthly electric bill - Bank Transfer',
    },
    {
      userId: MOCK_USER_ID,
      categoryId: categories.find(c => c.name === 'Food & Dining')?.id,
      item: 'Pizza Hut Dinner',
      amount: 28.50,
      expenseDate: yesterday,
      notes: 'Family dinner - Visa •••• 4242',
    },

    // 3 days ago
    {
      userId: MOCK_USER_ID,
      categoryId: categories.find(c => c.name === 'Entertainment')?.id,
      item: 'Netflix Subscription',
      amount: 12.99,
      expenseDate: threeDaysAgo,
      notes: 'Monthly subscription - Visa •••• 4242',
    },
    {
      userId: MOCK_USER_ID,
      categoryId: categories.find(c => c.name === 'Coffee & Cafe')?.id,
      item: 'Dunkin Donuts',
      amount: 8.25,
      expenseDate: threeDaysAgo,
      notes: 'Coffee and donuts - Cash',
    },

    // 5 days ago
    {
      userId: MOCK_USER_ID,
      categoryId: categories.find(c => c.name === 'Shopping')?.id,
      item: 'Amazon Purchase',
      amount: 45.99,
      expenseDate: fiveDaysAgo,
      notes: 'Books and office supplies - Visa •••• 4242',
    },
    {
      userId: MOCK_USER_ID,
      categoryId: categories.find(c => c.name === 'Transportation')?.id,
      item: 'Gas Station',
      amount: 52.00,
      expenseDate: fiveDaysAgo,
      notes: 'Shell gas station - Visa •••• 4242',
    },
    {
      userId: MOCK_USER_ID,
      categoryId: categories.find(c => c.name === 'Food & Dining')?.id,
      item: 'Sushi Restaurant',
      amount: 65.00,
      expenseDate: fiveDaysAgo,
      notes: 'Dinner for two - MasterCard •••• 8812',
    },

    // 1 week ago
    {
      userId: MOCK_USER_ID,
      categoryId: categories.find(c => c.name === 'Healthcare')?.id,
      item: 'Pharmacy - CVS',
      amount: 23.50,
      expenseDate: oneWeekAgo,
      notes: 'Prescription medication - Visa •••• 4242',
    },
    {
      userId: MOCK_USER_ID,
      categoryId: categories.find(c => c.name === 'Groceries')?.id,
      item: 'Walmart Groceries',
      amount: 78.25,
      expenseDate: oneWeekAgo,
      notes: 'Weekly shopping - Debit Card',
    },
    {
      userId: MOCK_USER_ID,
      categoryId: categories.find(c => c.name === 'Entertainment')?.id,
      item: 'Movie Tickets',
      amount: 32.00,
      expenseDate: oneWeekAgo,
      notes: 'Cinema - 2 tickets - Visa •••• 4242',
    },

    // 2 weeks ago
    {
      userId: MOCK_USER_ID,
      categoryId: categories.find(c => c.name === 'Shopping')?.id,
      item: 'Target Shopping',
      amount: 125.50,
      expenseDate: twoWeeksAgo,
      notes: 'Household items - MasterCard •••• 8812',
    },
    {
      userId: MOCK_USER_ID,
      categoryId: categories.find(c => c.name === 'Food & Dining')?.id,
      item: 'Olive Garden',
      amount: 48.75,
      expenseDate: twoWeeksAgo,
      notes: 'Lunch meeting - Visa •••• 4242',
    },
    {
      userId: MOCK_USER_ID,
      categoryId: categories.find(c => c.name === 'Transportation')?.id,
      item: 'Lyft Ride',
      amount: 18.50,
      expenseDate: twoWeeksAgo,
      notes: 'Airport pickup - Apple Pay',
    },
  ];

  await prisma.expense.createMany({
    data: expenses,
  });

  console.log('✅ Created expenses');

  // Get stats
  const expenseCount = await prisma.expense.count({ where: { userId: MOCK_USER_ID } });
  const categoryCount = await prisma.category.count({ where: { userId: MOCK_USER_ID } });

  console.log(`\n📊 Seed Summary:`);
  console.log(`   Categories: ${categoryCount}`);
  console.log(`   Expenses: ${expenseCount}`);
  console.log(`\n✨ Seed completed successfully!`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
