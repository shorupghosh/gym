import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface GymContextType {
    members: any[];
    plans: any[];
    attendance: any[];
    loading: boolean;
    refreshData: () => Promise<void>;
    updateMember: (id: string, updates: any) => void;
    deleteMember: (id: string) => void;
    addMember: (member: any) => void;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export function GymProvider({ children }: { children: React.ReactNode }) {
    const [members, setMembers] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        // Keep internal loading separate from global loading
        // to avoid layout shifts on background refresh
        try {
            const [membersRes, plansRes, attendanceRes] = await Promise.all([
                supabase.from('members').select('*').order('created_at', { ascending: false }),
                supabase.from('plans').select('*').order('price', { ascending: true }),
                supabase.from('attendance').select('*, members(full_name, phone)').order('check_in_time', { ascending: false }).limit(50)
            ]);

            if (membersRes.data) setMembers(membersRes.data);
            if (plansRes.data) setPlans(plansRes.data);
            if (attendanceRes.data) setAttendance(attendanceRes.data);
        } catch (err) {
            console.error('Failed to sync gym data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();

        // Subscribe to everything for real-time updates!
        const membersChannel = supabase.channel('member-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => refreshData())
            .subscribe();

        const attendanceChannel = supabase.channel('attendance-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => refreshData())
            .subscribe();

        const plansChannel = supabase.channel('plan-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'plans' }, () => refreshData())
            .subscribe();

        return () => {
            supabase.removeChannel(membersChannel);
            supabase.removeChannel(attendanceChannel);
            supabase.removeChannel(plansChannel);
        };
    }, []);

    const updateMember = (id: string, updates: any) => {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    };

    const deleteMember = (id: string) => {
        setMembers(prev => prev.filter(m => m.id !== id));
    };

    const addMember = (member: any) => {
        setMembers(prev => [member, ...prev]);
    };

    return (
        <GymContext.Provider value={{
            members,
            plans,
            attendance,
            loading,
            refreshData,
            updateMember,
            deleteMember,
            addMember
        }}>
            {children}
        </GymContext.Provider>
    );
}

export function useGym() {
    const context = useContext(GymContext);
    if (context === undefined) {
        throw new Error('useGym must be used within a GymProvider');
    }
    return context;
}
