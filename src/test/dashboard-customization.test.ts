import { describe, it, expect, beforeEach } from 'vitest';
import { useDashboardConfigStore } from '@/store/useDashboardConfigStore';
import { DashboardConfigExport } from '@/types/dashboard';

describe('Dashboard Customization & Schema-Driven Store', () => {
  beforeEach(async () => {
    await useDashboardConfigStore.getState().resetToDefault();
  });

  it('initializes with default balanced 4 hub cards and 4 KPI cards', () => {
    const { cards, kpis, bottomWidgets, activePreset } = useDashboardConfigStore.getState();
    expect(cards).toHaveLength(4);
    expect(kpis).toHaveLength(4);
    expect(bottomWidgets).toHaveLength(4);
    expect(activePreset).toBe('default');

    // Hubs exist
    expect(cards.some((c) => c.id === 'card-engineering')).toBe(true);
    expect(cards.some((c) => c.id === 'card-client-ops')).toBe(true);
    expect(cards.some((c) => c.id === 'card-creative')).toBe(true);
    expect(cards.some((c) => c.id === 'card-personal')).toBe(true);
  });

  it('switches between presets and adapts layout rhythm', async () => {
    const { setPreset } = useDashboardConfigStore.getState();

    // Switch to Engineering & AI preset
    await setPreset('engineering');
    let state = useDashboardConfigStore.getState();
    expect(state.activePreset).toBe('engineering');
    const engCard = state.cards.find((c) => c.id === 'card-engineering');
    expect(engCard?.colSpan).toBe(2);
    expect(engCard?.sideWidget).toBe('quick-tools');

    // Switch to Client & Agency preset
    await setPreset('client-ops');
    state = useDashboardConfigStore.getState();
    expect(state.activePreset).toBe('client-ops');
    const clientCard = state.cards.find((c) => c.id === 'card-client-ops');
    expect(clientCard?.colSpan).toBe(2);
    expect(clientCard?.sideWidget).toBe('quick-stats');

    // Switch to Creative preset
    await setPreset('creative');
    state = useDashboardConfigStore.getState();
    expect(state.activePreset).toBe('creative');
    const creativeCard = state.cards.find((c) => c.id === 'card-creative');
    expect(creativeCard?.colSpan).toBe(2);
    expect(creativeCard?.sideWidget).toBe('quick-tools');

    // Switch to Personal preset
    await setPreset('personal');
    state = useDashboardConfigStore.getState();
    expect(state.activePreset).toBe('personal');
    const personalCard = state.cards.find((c) => c.id === 'card-personal');
    expect(personalCard?.colSpan).toBe(2);
    expect(personalCard?.sideWidget).toBe('todo-notes');
  });

  it('toggles card visibility and adjusts column spans', async () => {
    const { toggleCardVisibility, setCardColSpan } = useDashboardConfigStore.getState();

    await toggleCardVisibility('card-engineering');
    let engCard = useDashboardConfigStore.getState().cards.find((c) => c.id === 'card-engineering');
    expect(engCard?.visible).toBe(false);

    await toggleCardVisibility('card-engineering');
    engCard = useDashboardConfigStore.getState().cards.find((c) => c.id === 'card-engineering');
    expect(engCard?.visible).toBe(true);

    await setCardColSpan('card-engineering', 2);
    engCard = useDashboardConfigStore.getState().cards.find((c) => c.id === 'card-engineering');
    expect(engCard?.colSpan).toBe(2);
  });

  it('swaps embedded side widgets between cards', async () => {
    const { setCardSideWidget } = useDashboardConfigStore.getState();

    await setCardSideWidget('card-engineering', 'todo-notes');
    let engCard = useDashboardConfigStore.getState().cards.find((c) => c.id === 'card-engineering');
    expect(engCard?.sideWidget).toBe('todo-notes');

    await setCardSideWidget('card-engineering', 'none');
    engCard = useDashboardConfigStore.getState().cards.find((c) => c.id === 'card-engineering');
    expect(engCard?.sideWidget).toBe('none');
  });

  it('reorders cards with moveCard', async () => {
    const { moveCard } = useDashboardConfigStore.getState();
    const initialFirstId = useDashboardConfigStore.getState().cards[0].id;

    await moveCard(initialFirstId, 'down');
    const updatedCards = useDashboardConfigStore.getState().cards;
    expect(updatedCards[1].id).toBe(initialFirstId);
  });

  it('manages KPI metrics (update, add, delete, reorder)', async () => {
    const { updateKPI, addKPI, deleteKPI, moveKPI } = useDashboardConfigStore.getState();

    // Update
    await updateKPI('kpi-1', { label: 'Custom Cluster Deployments', value: '10/10' });
    let kpi1 = useDashboardConfigStore.getState().kpis.find((k) => k.id === 'kpi-1');
    expect(kpi1?.label).toBe('Custom Cluster Deployments');
    expect(kpi1?.value).toBe('10/10');

    // Add
    const created = await addKPI({
      label: 'API Gateway Ping',
      value: '24ms',
      icon: 'zap',
      color: 'green',
      badge: 'Fast',
      dataMode: 'manual',
      visible: true,
    });
    expect(created.id).toBeDefined();
    expect(useDashboardConfigStore.getState().kpis.some((k) => k.id === created.id)).toBe(true);

    // Reorder
    await moveKPI(created.id, 'left');
    expect(useDashboardConfigStore.getState().kpis.length).toBe(5);

    // Delete
    await deleteKPI(created.id);
    expect(useDashboardConfigStore.getState().kpis.some((k) => k.id === created.id)).toBe(false);
  });

  it('exports and imports JSON configuration cleanly', async () => {
    const { exportConfig, importConfig, setCardColSpan } = useDashboardConfigStore.getState();

    await setCardColSpan('card-creative', 2);
    const exported: DashboardConfigExport = exportConfig();
    expect(exported.appName).toBe('ZH Labs Command Center');
    expect(exported.cards).toHaveLength(4);
    expect(exported.cards.find((c) => c.id === 'card-creative')?.colSpan).toBe(2);

    // Reset
    await useDashboardConfigStore.getState().resetToDefault();
    expect(useDashboardConfigStore.getState().cards.find((c) => c.id === 'card-creative')?.colSpan).toBe(1);

    // Import back
    const result = await importConfig(exported);
    expect(result.success).toBe(true);
    expect(useDashboardConfigStore.getState().cards.find((c) => c.id === 'card-creative')?.colSpan).toBe(2);
  });

  it('toggles utility strip position between top and bottom', async () => {
    const { setUtilityStripPosition } = useDashboardConfigStore.getState();
    expect(useDashboardConfigStore.getState().utilityStripPosition).toBe('top');

    await setUtilityStripPosition('bottom');
    expect(useDashboardConfigStore.getState().utilityStripPosition).toBe('bottom');

    await setUtilityStripPosition('top');
    expect(useDashboardConfigStore.getState().utilityStripPosition).toBe('top');
  });

  it('rejects invalid JSON import data gracefully', async () => {
    const { importConfig } = useDashboardConfigStore.getState();
    const result = await importConfig({} as any);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid configuration');
  });
});
