import { supabase } from './supabase.js';

export default async function handler(request: Request, response: Response) {
    if (request.method !== 'GET') {
        return new Response('Method not allowed', { status: 405 });
    }

    // Validate authorization here in production, e.g. via CRON_SECRET headers

    console.log('[Automation] Running daily status check...');
    try {
        const today = new Date().toISOString();

        // Find all expired histories
        const { data: expiredHistories, error } = await supabase
            .from('membership_history')
            .select('member_id, end_date')
            .lt('end_date', today);

        if (error) throw error;
        if (!expiredHistories || expiredHistories.length === 0) {
            return new Response(JSON.stringify({ message: 'No expired plans found' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const latestDates = new Map();
        expiredHistories.forEach((row: any) => {
            if (!latestDates.has(row.member_id) || new Date(row.end_date) > new Date(latestDates.get(row.member_id))) {
                latestDates.set(row.member_id, row.end_date);
            }
        });

        let updatedCount = 0;

        for (const [member_id, end_date] of latestDates.entries()) {
            // Check if there's a newer plan that is active
            const { data: activePlans, error: activeErr } = await supabase
                .from('membership_history')
                .select('id')
                .eq('member_id', member_id)
                .gte('end_date', today);

            if (!activeErr && activePlans && activePlans.length === 0) {
                // Update member status to EXPIRED
                const { error: updateErr, status } = await supabase
                    .from('members')
                    .update({ status: 'EXPIRED' })
                    .eq('id', member_id)
                    .eq('status', 'ACTIVE'); // Only update if currently active

                if (!updateErr && status === 204) {
                    updatedCount++;
                }
            }
        }

        return new Response(JSON.stringify({
            message: `Checked statuses. Transitioned EXPIRED members.`,
            updatedCount
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('[Automation] Failed to run daily status check:', error);
        return new Response(JSON.stringify({ error: 'Failed to run daily status check' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
