import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
    ],
});

/**
 * Test script to verify database index performance
 * Run with: npx tsx src/scripts/verify-indexes.ts
 */

async function testQueryPerformance() {
    console.log('🔍 Testing Database Index Performance\n');
    console.log('='.repeat(60));

    // Enable query logging
    let queryCount = 0;
    let totalQueryTime = 0;

    prisma.$on('query' as any, (e: any) => {
        queryCount++;
        totalQueryTime += parseFloat(e.duration);
        console.log(`Query ${queryCount}: ${e.duration}ms`);
    });

    try {
        // Test 1: Submission query with status filter (should use index)
        console.log('\n📊 Test 1: Submissions by Status');
        console.log('-'.repeat(60));
        const startTime1 = Date.now();
        const submissions = await prisma.submission.findMany({
            where: {
                status: 'SUBMITTED',
            },
            orderBy: {
                submittedAt: 'desc',
            },
            take: 10,
            include: {
                author: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        const endTime1 = Date.now();
        console.log(`✅ Found ${submissions.length} submissions`);
        console.log(`⏱️  Total time: ${endTime1 - startTime1}ms`);
        console.log(`📈 Expected: <100ms (with indexes), >300ms (without)`);

        // Test 2: User notifications (should use composite index)
        console.log('\n📊 Test 2: Unread Notifications');
        console.log('-'.repeat(60));
        const users = await prisma.user.findMany({ take: 1 });
        if (users.length > 0) {
            const startTime2 = Date.now();
            const notifications = await prisma.notification.findMany({
                where: {
                    userId: users[0].id,
                    isRead: false,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 20,
            });
            const endTime2 = Date.now();
            console.log(`✅ Found ${notifications.length} unread notifications`);
            console.log(`⏱️  Total time: ${endTime2 - startTime2}ms`);
            console.log(`📈 Expected: <50ms (with indexes), >200ms (without)`);
        }

        // Test 3: Reviews by reviewer (should use index)
        console.log('\n📊 Test 3: Reviews by Reviewer');
        console.log('-'.repeat(60));
        const reviewers = await prisma.user.findMany({
            where: { role: 'REVIEWER' },
            take: 1,
        });
        if (reviewers.length > 0) {
            const startTime3 = Date.now();
            const reviews = await prisma.review.findMany({
                where: {
                    reviewerId: reviewers[0].id,
                    status: 'PENDING',
                },
                include: {
                    submission: {
                        select: {
                            title: true,
                            status: true,
                        },
                    },
                },
            });
            const endTime3 = Date.now();
            console.log(`✅ Found ${reviews.length} pending reviews`);
            console.log(`⏱️  Total time: ${endTime3 - startTime3}ms`);
            console.log(`📈 Expected: <50ms (with indexes), >200ms (without)`);
        }

        // Test 4: Payments by status (should use index)
        console.log('\n📊 Test 4: Pending Payments');
        console.log('-'.repeat(60));
        const startTime4 = Date.now();
        const payments = await prisma.payment.findMany({
            where: {
                status: 'PENDING',
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                submission: {
                    select: {
                        title: true,
                    },
                },
            },
        });
        const endTime4 = Date.now();
        console.log(`✅ Found ${payments.length} pending payments`);
        console.log(`⏱️  Total time: ${endTime4 - startTime4}ms`);
        console.log(`📈 Expected: <80ms (with indexes), >300ms (without)`);

        // Test 5: Issues with filters (should use indexes)
        console.log('\n📊 Test 5: Featured Issues');
        console.log('-'.repeat(60));
        const startTime5 = Date.now();
        const issues = await prisma.issue.findMany({
            where: {
                featured: true,
                visible: true,
            },
            orderBy: {
                displayOrder: 'desc',
            },
            include: {
                articles: {
                    take: 5,
                },
            },
        });
        const endTime5 = Date.now();
        console.log(`✅ Found ${issues.length} featured issues`);
        console.log(`⏱️  Total time: ${endTime5 - startTime5}ms`);
        console.log(`📈 Expected: <60ms (with indexes), >250ms (without)`);

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📈 Performance Summary');
        console.log('='.repeat(60));
        console.log(`Total queries executed: ${queryCount}`);
        console.log(`Average query time: ${(totalQueryTime / queryCount).toFixed(2)}ms`);
        console.log(`\n✅ If average query time is <100ms, indexes are working well!`);
        console.log(`⚠️  If average query time is >200ms, indexes may not be used.`);

        console.log('\n💡 Tips:');
        console.log('  - Run EXPLAIN ANALYZE on slow queries to verify index usage');
        console.log('  - Check pg_stat_user_indexes to see index scan counts');
        console.log('  - Monitor query performance in production');

    } catch (error) {
        console.error('❌ Error testing queries:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the tests
testQueryPerformance()
    .then(() => {
        console.log('\n✅ Index verification complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Test failed:', error);
        process.exit(1);
    });
