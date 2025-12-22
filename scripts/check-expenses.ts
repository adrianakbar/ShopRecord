import prisma from '../lib/prisma';

async function checkData() {
  const expenses = await prisma.expense.findMany({ 
    where: { userId: '00000000-0000-0000-0000-000000000001' },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { category: true }
  });
  
  console.log(`Total expenses: ${expenses.length}`);
  expenses.forEach(e => {
    console.log(`${e.item} - Rp ${e.amount} - ${e.category.name} - ${e.createdAt.toISOString().split('T')[0]}`);
  });
}

checkData().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
