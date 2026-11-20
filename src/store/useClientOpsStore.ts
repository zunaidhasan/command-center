import { create } from 'zustand';
import { ClientLead, PortfolioReference, PipelineStage } from '@/types/client-ops';
import { INITIAL_CLIENT_LEADS, INITIAL_REFERENCES } from '@/services/initial-data';
import { getDatabase } from '@/db/idb';

interface ClientOpsState {
  leads: ClientLead[];
  references: PortfolioReference[];
  selectedCategory: string;
  referenceSearchQuery: string;
  isLoading: boolean;

  initClientOps: () => Promise<void>;
  
  // Leads
  addLead: (lead: Omit<ClientLead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ClientLead>;
  updateLead: (id: string, updates: Partial<ClientLead>) => Promise<void>;
  moveLeadStage: (id: string, newStage: PipelineStage) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;

  // Portfolio Reference Engine
  addReference: (ref: Omit<PortfolioReference, 'id'>) => Promise<PortfolioReference>;
  updateReference: (id: string, updates: Partial<PortfolioReference>) => Promise<void>;
  deleteReference: (id: string) => Promise<void>;
  setSelectedCategory: (category: string) => void;
  setReferenceSearchQuery: (query: string) => void;
}

export const useClientOpsStore = create<ClientOpsState>((set, get) => ({
  leads: [],
  references: [],
  selectedCategory: 'All',
  referenceSearchQuery: '',
  isLoading: true,

  initClientOps: async () => {
    try {
      const db = await getDatabase();
      const savedLeads = await db.getAll('clientLeads');
      const savedRefs = await db.getAll('portfolioReferences');

      if (savedLeads.length === 0) {
        const tx = db.transaction('clientLeads', 'readwrite');
        for (const l of INITIAL_CLIENT_LEADS) {
          await tx.store.put(l);
        }
        await tx.done;
      }

      if (savedRefs.length === 0) {
        const tx = db.transaction('portfolioReferences', 'readwrite');
        for (const r of INITIAL_REFERENCES) {
          await tx.store.put(r);
        }
        await tx.done;
      }

      const leadsToUse = savedLeads.length > 0 ? savedLeads : INITIAL_CLIENT_LEADS;
      const refsToUse = savedRefs.length > 0 ? savedRefs : INITIAL_REFERENCES;

      set({
        leads: leadsToUse,
        references: refsToUse,
        isLoading: false,
      });
    } catch (err) {
      console.error('[ClientOpsStore] Failed to load data:', err);
      set({
        leads: INITIAL_CLIENT_LEADS,
        references: INITIAL_REFERENCES,
        isLoading: false,
      });
    }
  },

  addLead: async (leadData) => {
    const newLead: ClientLead = {
      ...leadData,
      id: `lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updated = [newLead, ...get().leads];
    set({ leads: updated });

    try {
      const db = await getDatabase();
      await db.put('clientLeads', newLead);
    } catch (err) {
      console.error('[ClientOpsStore] Failed to persist lead:', err);
    }

    return newLead;
  },

  updateLead: async (id, updates) => {
    const updated = get().leads.map((l) =>
      l.id === id ? { ...l, ...updates, updatedAt: Date.now() } : l
    );
    set({ leads: updated });

    try {
      const db = await getDatabase();
      const existing = await db.get('clientLeads', id);
      if (existing) {
        await db.put('clientLeads', { ...existing, ...updates, updatedAt: Date.now() });
      }
    } catch (err) {
      console.error('[ClientOpsStore] Failed to update lead:', err);
    }
  },

  moveLeadStage: async (id, newStage) => {
    await get().updateLead(id, { stage: newStage });
  },

  deleteLead: async (id) => {
    const updated = get().leads.filter((l) => l.id !== id);
    set({ leads: updated });

    try {
      const db = await getDatabase();
      await db.delete('clientLeads', id);
    } catch (err) {
      console.error('[ClientOpsStore] Failed to delete lead:', err);
    }
  },

  addReference: async (refData) => {
    const newRef: PortfolioReference = {
      ...refData,
      id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    const updated = [newRef, ...get().references];
    set({ references: updated });

    try {
      const db = await getDatabase();
      await db.put('portfolioReferences', newRef);
    } catch (err) {
      console.error('[ClientOpsStore] Failed to persist reference:', err);
    }

    return newRef;
  },

  updateReference: async (id, updates) => {
    const updated = get().references.map((r) => (r.id === id ? { ...r, ...updates } : r));
    set({ references: updated });

    try {
      const db = await getDatabase();
      const existing = await db.get('portfolioReferences', id);
      if (existing) {
        await db.put('portfolioReferences', { ...existing, ...updates });
      }
    } catch (err) {
      console.error('[ClientOpsStore] Failed to update reference:', err);
    }
  },

  deleteReference: async (id) => {
    const updated = get().references.filter((r) => r.id !== id);
    set({ references: updated });

    try {
      const db = await getDatabase();
      await db.delete('portfolioReferences', id);
    } catch (err) {
      console.error('[ClientOpsStore] Failed to delete reference:', err);
    }
  },

  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setReferenceSearchQuery: (referenceSearchQuery) => set({ referenceSearchQuery }),
}));
