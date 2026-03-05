import express from 'express';
import db from './db.js';
import { randomUUID } from 'crypto';

const app = express();
app.use(express.json());

// Get all members
app.get('/api/members', (req, res) => {
    try {
        const list = db.prepare(`SELECT * FROM members ORDER BY created_at DESC`).all();
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve members' });
    }
});

// Search members
app.get('/api/members/search', (req, res) => {
    const { q } = req.query;
    try {
        const list = db.prepare(`
      SELECT * FROM members 
      WHERE full_name LIKE ? OR email LIKE ? OR phone LIKE ? 
      ORDER BY created_at DESC
    `).all(`%${q}%`, `%${q}%`, `%${q}%`);
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
});

// Get member by ID
app.get('/api/members/:id', (req, res) => {
    try {
        const member = db.prepare(`SELECT * FROM members WHERE id = ?`).get(req.params.id);
        if (!member) return res.status(404).json({ error: 'Member not found' });
        res.json(member);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve member' });
    }
});

// Create member
app.post('/api/members', (req, res) => {
    const { full_name, phone, email, date_of_birth, gender, plan, notes } = req.body;

    if (!full_name || !phone) {
        return res.status(400).json({ error: 'Full name and phone are required' });
    }

    const id = randomUUID();
    try {
        const stmt = db.prepare(`
      INSERT INTO members (id, full_name, phone, email, date_of_birth, gender, plan, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, full_name, phone, email || null, date_of_birth || null, gender || null, plan || 'Basic', notes || null);

        const newMember = db.prepare(`SELECT * FROM members WHERE id = ?`).get(id);
        res.status(201).json(newMember);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create member' });
    }
});

// Update member
app.put('/api/members/:id', (req, res) => {
    const { full_name, phone, email, date_of_birth, gender, plan, status, notes } = req.body;
    const { id } = req.params;

    try {
        const member = db.prepare(`SELECT * FROM members WHERE id = ?`).get(id);
        if (!member) return res.status(404).json({ error: 'Member not found' });

        const stmt = db.prepare(`
      UPDATE members 
      SET full_name = ?, phone = ?, email = ?, date_of_birth = ?, gender = ?, plan = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
        stmt.run(
            full_name ?? member.full_name,
            phone ?? member.phone,
            email ?? member.email,
            date_of_birth ?? member.date_of_birth,
            gender ?? member.gender,
            plan ?? member.plan,
            status ?? member.status,
            notes ?? member.notes,
            id
        );

        const updatedMember = db.prepare(`SELECT * FROM members WHERE id = ?`).get(id);
        res.json(updatedMember);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update member' });
    }
});

// Delete member
app.delete('/api/members/:id', (req, res) => {
    try {
        const result = db.prepare(`DELETE FROM members WHERE id = ?`).run(req.params.id);
        if (result.changes === 0) return res.status(404).json({ error: 'Member not found' });
        res.json({ message: 'Member deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete member' });
    }
});

// --- PLAN MANAGEMENT ---

// Get all plans
app.get('/api/plans', (req, res) => {
    try {
        const list = db.prepare(`SELECT * FROM plans ORDER BY price ASC`).all();
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve plans' });
    }
});

// Create plan
app.post('/api/plans', (req, res) => {
    const { name, price, duration_days, duration_type, description } = req.body;
    if (!name || price === undefined || !duration_days) {
        return res.status(400).json({ error: 'Name, price, and duration are required' });
    }
    const id = randomUUID();
    try {
        const stmt = db.prepare(`
            INSERT INTO plans (id, name, price, duration_days, duration_type, description)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(id, name, price, duration_days, duration_type || 'Monthly', description || null);
        const newPlan = db.prepare(`SELECT * FROM plans WHERE id = ?`).get(id);
        res.status(201).json(newPlan);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create plan' });
    }
});

// Update plan
app.put('/api/plans/:id', (req, res) => {
    const { name, price, duration_days, duration_type, description } = req.body;
    const { id } = req.params;
    try {
        const plan = db.prepare(`SELECT * FROM plans WHERE id = ?`).get(id);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        const stmt = db.prepare(`
            UPDATE plans 
            SET name = ?, price = ?, duration_days = ?, duration_type = ?, description = ?
            WHERE id = ?
        `);
        stmt.run(
            name ?? plan.name,
            price ?? plan.price,
            duration_days ?? plan.duration_days,
            duration_type ?? plan.duration_type,
            description ?? plan.description,
            id
        );
        const updatedPlan = db.prepare(`SELECT * FROM plans WHERE id = ?`).get(id);
        res.json(updatedPlan);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update plan' });
    }
});

// Delete plan
app.delete('/api/plans/:id', (req, res) => {
    try {
        const result = db.prepare(`DELETE FROM plans WHERE id = ?`).run(req.params.id);
        if (result.changes === 0) return res.status(404).json({ error: 'Plan not found' });
        res.json({ message: 'Plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete plan' });
    }
});

// --- PLAN ASSIGNMENT & RENEWAL ---

app.post('/api/members/:id/assign-plan', (req, res) => {
    const { plan_id, start_date } = req.body;
    const member_id = req.params.id;

    try {
        const plan = db.prepare(`SELECT * FROM plans WHERE id = ?`).get(plan_id);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        const member = db.prepare(`SELECT * FROM members WHERE id = ?`).get(member_id);
        if (!member) return res.status(404).json({ error: 'Member not found' });

        const startDate = start_date ? new Date(start_date) : new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + (plan.duration_days || 30));

        const historyId = randomUUID();

        // Execute inside a transaction
        const assignTransaction = db.transaction(() => {
            // Update member's current plan and status
            db.prepare(`UPDATE members SET plan = ?, status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
                .run(plan.name, member_id);

            // Log in history
            db.prepare(`
                INSERT INTO membership_history (id, member_id, plan_id, start_date, end_date, price_paid)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(historyId, member_id, plan_id, startDate.toISOString(), endDate.toISOString(), plan.price);
        });

        assignTransaction();
        res.json({ message: 'Plan assigned successfully', end_date: endDate.toISOString() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to assign plan' });
    }
});

app.post('/api/members/:id/renew', (req, res) => {
    const member_id = req.params.id;
    try {
        // Find latest plan assigned to user
        const latestHistory = db.prepare(`
            SELECT * FROM membership_history 
            WHERE member_id = ? 
            ORDER BY end_date DESC LIMIT 1
        `).get(member_id);

        if (!latestHistory || !latestHistory.plan_id) {
            return res.status(400).json({ error: 'No existing plan to renew. Please assign a plan first.' });
        }

        const plan = db.prepare(`SELECT * FROM plans WHERE id = ?`).get(latestHistory.plan_id);
        if (!plan) return res.status(404).json({ error: 'Plan no longer exists' });

        // Calculate new dates
        const currentEndDate = new Date(latestHistory.end_date);
        const today = new Date();
        // If expired, start from today. If active, append to current end date
        const startDate = currentEndDate > today ? currentEndDate : today;
        const newEndDate = new Date(startDate);
        newEndDate.setDate(newEndDate.getDate() + (plan.duration_days || 30));

        const historyId = randomUUID();
        const renewTransaction = db.transaction(() => {
            db.prepare(`UPDATE members SET status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
                .run(member_id);

            db.prepare(`
                INSERT INTO membership_history (id, member_id, plan_id, start_date, end_date, price_paid)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(historyId, member_id, plan.id, startDate.toISOString(), newEndDate.toISOString(), plan.price);
        });

        renewTransaction();
        res.json({ message: 'Membership renewed successfully', end_date: newEndDate.toISOString() });
    } catch (error) {
        res.status(500).json({ error: 'Failed to renew membership' });
    }
});

// --- AUTOMATION ENGINE ---
const runDailyStatusCheck = () => {
    console.log('[Automation] Running daily status check...');
    try {
        const today = new Date().toISOString();
        const expiredHistories = db.prepare(`
            SELECT member_id, end_date FROM membership_history 
            WHERE end_date < ?
        `).all(today);

        // Map to quickly find latest date for a member
        const latestDates = new Map();
        expiredHistories.forEach((row: any) => {
            if (!latestDates.has(row.member_id) || new Date(row.end_date) > new Date(latestDates.get(row.member_id))) {
                latestDates.set(row.member_id, row.end_date);
            }
        });

        let updatedCount = 0;
        const updateStatusTransaction = db.transaction(() => {
            const stmt = db.prepare(`UPDATE members SET status = 'EXPIRED' WHERE id = ? AND status = 'ACTIVE'`);
            for (const [member_id, end_date] of latestDates.entries()) {
                // Verify they don't have a future or valid plan
                const activePlans = db.prepare(`SELECT count(*) as count FROM membership_history WHERE member_id = ? AND end_date >= ?`).get(member_id, today) as any;
                if (activePlans.count === 0) {
                    const info = stmt.run(member_id);
                    updatedCount += info.changes;
                }
            }
        });

        updateStatusTransaction();
        console.log(`[Automation] Checked statuses. Transitioned ${updatedCount} members to EXPIRED.`);
    } catch (error) {
        console.error('[Automation] Failed to run daily status check:', error);
    }
};

// Run on startup
runDailyStatusCheck();
// Run every 24 hours
setInterval(runDailyStatusCheck, 1000 * 60 * 60 * 24);

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Backend API running on http://localhost:${PORT}`);
});
