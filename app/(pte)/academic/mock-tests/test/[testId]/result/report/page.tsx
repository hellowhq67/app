export const dynamic = 'force-dynamic';


import { db } from '@/lib/db';
import { pteMockTests, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { PteScoreReport } from '@/components/pte/report/PteScoreReport';
import { PrintButton } from '@/components/pte/report/PrintButton';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

export default async function ReportPage({
    params
}: {
    params: Promise<{ testId: string }>
}) {
    const { testId } = await params;

    const test = await db.query.pteMockTests.findFirst({
        where: eq(pteMockTests.id, testId),
        with: {
            user: true
        }
    });

    if (!test || !test.user) return notFound();

    // Mapping Data
    const userData = {
        name: test.user.name || 'Candidate',
        photoUrl: test.user.image || undefined,
        candidateId: `PLT00${test.userId.substring(0, 6).toUpperCase()}`, // Mock ID generation
        registrationId: test.userId.substring(0, 9).toUpperCase().replace(/[^0-9]/g, '0') || '000000000',
        dob: '01 Jan 2000', // Placeholder as DOB is likely not in public user schema
        gender: 'Unknown',
        country: 'Global',
        residence: 'Global'
    };

    const testData = {
        date: test.completedAt ? format(test.completedAt, 'dd MMM yyyy') : format(test.createdAt, 'dd MMM yyyy'),
        centerId: '83829', // Mock
        centerName: 'PTE Official Test Centre',
        reportCode: `${test.id.substring(0, 8).toUpperCase()}S`,
        validUntil: test.completedAt
            ? format(new Date(test.completedAt.getTime() + 1000 * 60 * 60 * 24 * 365 * 2), 'dd MMM yyyy') // 2 years validity
            : 'N/A'
    };

    const scores = {
        overall: test.overallScore || 10,
        listening: test.listeningScore || 10,
        reading: test.readingScore || 10,
        speaking: test.speakingScore || 10,
        writing: test.writingScore || 10
    };

    return (
        <div className="flex flex-col items-center py-8 bg-gray-100 min-h-screen">
            <div className="mb-4 no-print flex gap-4">
                <PrintButton />
            </div>

            <PteScoreReport
                user={userData}
                test={testData}
                scores={scores}
            />

            <style>{`
                @media print {
                    .no-print { display: none; }
                    body { background: white; }
                }
            `}</style>
        </div>
    );
}
