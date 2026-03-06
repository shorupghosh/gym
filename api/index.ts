import express from 'express';
import { supabase } from './supabase.js';

const app = express();
app.use(express.json());

// Get all members
app.get('/api/members', async (req, res) => {
    try {
        const { data: list, error } = await supabase
            .from('members')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve members' });
    }
});

// Search members
app.get('/api/members/search', async (req, res) => {
    const { q } = req.query;
    try {
        const { data: list, error } = await supabase
            .from('members')
            .select('*')
            .or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
});

// Get member by ID
app.get('/api/members/:id', async (req, res) => {
    try {
        const { data: member, error } = await supabase
            .from('members')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !member) return res.status(404).json({ error: 'Member not found' });
        res.json(member);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve member' });
    }
});

// Create member
app.post('/api/members', async (req, res) => {
    const { full_name, phone, email, date_of_birth, gender, plan, notes } = req.body;

    if (!full_name || !phone) {
        return res.status(400).json({ error: 'Full name and phone are required' });
    }

    try {
        const { data: newMember, error } = await supabase
            .from('members')
            .insert([{
                full_name,
                phone,
                email: email || null,
                date_of_birth: date_of_birth || null,
                gender: gender || null,
                plan: plan || 'Basic',
                notes: notes || null
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(newMember);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create member' });
    }
});

// Update member
app.put('/api/members/:id', async (req, res) => {
    const { full_name, phone, email, date_of_birth, gender, plan, status, notes } = req.body;
    const { id } = req.params;

    try {
        const updates: any = {};
        if (full_name !== undefined) updates.full_name = full_name;
        if (phone !== undefined) updates.phone = phone;
        if (email !== undefined) updates.email = email;
        if (date_of_birth !== undefined) updates.date_of_birth = date_of_birth;
        if (gender !== undefined) updates.gender = gender;
        if (plan !== undefined) updates.plan = plan;
        if (status !== undefined) updates.status = status;
        if (notes !== undefined) updates.notes = notes;
        updates.updated_at = new Date().toISOString();

        const { data: updatedMember, error } = await supabase
            .from('members')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(updatedMember);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update member' });
    }
});

// Delete member
app.delete('/api/members/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('members')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Member deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete member' });
    }
});

// --- PLAN MANAGEMENT ---

// Get all plans
app.get('/api/plans', async (req, res) => {
    try {
        const { data: list, error } = await supabase
            .from('plans')
            .select('*')
            .order('price', { ascending: true });

        if (error) throw error;
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve plans' });
    }
});

// Create plan
app.post('/api/plans', async (req, res) => {
    const { name, price, duration_days, duration_type, description } = req.body;
    if (!name || price === undefined || !duration_days) {
        return res.status(400).json({ error: 'Name, price, and duration are required' });
    }

    try {
        const { data: newPlan, error } = await supabase
            .from('plans')
            .insert([{
                name,
                price,
                duration_days,
                duration_type: duration_type || 'Monthly',
                description: description || null
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(newPlan);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create plan' });
    }
});

// Update plan
app.put('/api/plans/:id', async (req, res) => {
    const { name, price, duration_days, duration_type, description } = req.body;
    const { id } = req.params;

    try {
        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (price !== undefined) updates.price = price;
        if (duration_days !== undefined) updates.duration_days = duration_days;
        if (duration_type !== undefined) updates.duration_type = duration_type;
        if (description !== undefined) updates.description = description;

        const { data: updatedPlan, error } = await supabase
            .from('plans')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(updatedPlan);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update plan' });
    }
});

// Delete plan
app.delete('/api/plans/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('plans')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete plan' });
    }
});

// --- PLAN ASSIGNMENT & RENEWAL ---

app.post('/api/members/:id/assign-plan', async (req, res) => {
    const { plan_id, start_date } = req.body;
    const member_id = req.params.id;

    try {
        const { data: plan, error: planError } = await supabase
            .from('plans')
            .select('*')
            .eq('id', plan_id)
            .single();

        if (planError || !plan) return res.status(404).json({ error: 'Plan not found' });

        const startDate = start_date ? new Date(start_date) : new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + (plan.duration_days || 30));

        const { error: memberError } = await supabase
            .from('members')
            .update({
                plan: plan.name,
                status: 'ACTIVE',
                updated_at: new Date().toISOString()
            })
            .eq('id', member_id);

        if (memberError) throw memberError;

        const { error: historyError } = await supabase
            .from('membership_history')
            .insert([{
                member_id,
                plan_id,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                price_paid: plan.price
            }]);

        if (historyError) throw historyError;

        res.json({ message: 'Plan assigned successfully', end_date: endDate.toISOString() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to assign plan' });
    }
});

app.post('/api/members/:id/renew', async (req, res) => {
    const member_id = req.params.id;
    try {
        const { data: historyList, error: historyError } = await supabase
            .from('membership_history')
            .select('*')
            .eq('member_id', member_id)
            .order('end_date', { ascending: false })
            .limit(1);

        if (historyError || !historyList || historyList.length === 0) {
            return res.status(400).json({ error: 'No existing plan to renew. Please assign a plan first.' });
        }

        const latestHistory = historyList[0];

        const { data: plan, error: planError } = await supabase
            .from('plans')
            .select('*')
            .eq('id', latestHistory.plan_id)
            .single();

        if (planError || !plan) return res.status(404).json({ error: 'Plan no longer exists' });

        const currentEndDate = new Date(latestHistory.end_date);
        const today = new Date();
        const startDate = currentEndDate > today ? currentEndDate : today;
        const newEndDate = new Date(startDate);
        newEndDate.setDate(newEndDate.getDate() + (plan.duration_days || 30));

        const { error: memberError } = await supabase
            .from('members')
            .update({
                status: 'ACTIVE',
                updated_at: new Date().toISOString()
            })
            .eq('id', member_id);

        if (memberError) throw memberError;

        const { error: newHistoryError } = await supabase
            .from('membership_history')
            .insert([{
                member_id,
                plan_id: plan.id,
                start_date: startDate.toISOString(),
                end_date: newEndDate.toISOString(),
                price_paid: plan.price
            }]);

        if (newHistoryError) throw newHistoryError;

        res.json({ message: 'Membership renewed successfully', end_date: newEndDate.toISOString() });
    } catch (error) {
        res.status(500).json({ error: 'Failed to renew membership' });
    }
});

// Important: Listen only in non-production environments to avoid Vercel Serverless Function conflicts.
if (process.env.NODE_ENV !== 'production') {
    const PORT = 3001;
    app.listen(PORT, () => {
        console.log(`Backend API running on http://localhost:${PORT}`);
    });
}

export default app;
