import { describe, it, expect, beforeEach } from 'vitest';
import { useBookmarkStore } from '@/store/useBookmarkStore';
import { INITIAL_FOLDERS, INITIAL_BOOKMARKS } from '@/services/initial-data';

describe('Bookmark Management System', () => {
  beforeEach(() => {
    useBookmarkStore.setState({
      folders: INITIAL_FOLDERS,
      bookmarks: INITIAL_BOOKMARKS,
      syncMode: 'independent',
      searchQuery: '',
      isLoading: false,
    });
  });

  it('preserves all five initial bookmark folders', () => {
    const { folders } = useBookmarkStore.getState();
    expect(folders).toHaveLength(5);
    expect(folders[0].name).toContain('AI Research & Agents');
    expect(folders[1].name).toContain('Software Dev & Coding');
    expect(folders[2].name).toContain('Client Ops & Agency');
    expect(folders[3].name).toContain('Design & Creative AI');
    expect(folders[4].name).toContain('Learning & Utilities');
  });

  it('contains preconfigured essential bookmarks across folders', () => {
    const { bookmarks } = useBookmarkStore.getState();
    expect(bookmarks.length).toBeGreaterThanOrEqual(25);
    
    // Perplexity, Grok, ChatGPT in Folder 1
    const f1Bookmarks = bookmarks.filter((b) => b.folderId === 'folder-1');
    expect(f1Bookmarks.some((b) => b.title === 'Perplexity AI')).toBe(true);
    expect(f1Bookmarks.some((b) => b.title === 'Grok')).toBe(true);
    expect(f1Bookmarks.some((b) => b.title === 'ChatGPT')).toBe(true);

    // GitHub, Vercel in Folder 2
    const f2Bookmarks = bookmarks.filter((b) => b.folderId === 'folder-2');
    expect(f2Bookmarks.some((b) => b.title === 'GitHub')).toBe(true);
    expect(f2Bookmarks.some((b) => b.title === 'Vercel & KodeCupid')).toBe(true);

    // Fiverr, Sardar IT in Folder 3
    const f3Bookmarks = bookmarks.filter((b) => b.folderId === 'folder-3');
    expect(f3Bookmarks.some((b) => b.title === 'Fiverr')).toBe(true);
    expect(f3Bookmarks.some((b) => b.title === 'Sardar IT Slack')).toBe(true);

    // Fal.ai, Figma in Folder 4
    const f4Bookmarks = bookmarks.filter((b) => b.folderId === 'folder-4');
    expect(f4Bookmarks.some((b) => b.title === 'Fal.ai')).toBe(true);
    expect(f4Bookmarks.some((b) => b.title === 'Figma')).toBe(true);

    // YouTube, Grammarly in Folder 5
    const f5Bookmarks = bookmarks.filter((b) => b.folderId === 'folder-5');
    expect(f5Bookmarks.some((b) => b.title === 'YouTube')).toBe(true);
    expect(f5Bookmarks.some((b) => b.title === 'Grammarly')).toBe(true);
  });

  it('adds a new bookmark correctly', async () => {
    const { addBookmark } = useBookmarkStore.getState();
    const created = await addBookmark({
      title: 'Anthropic Claude',
      url: 'https://claude.ai',
      folderId: 'folder-1',
      description: 'Frontier AI model',
    });

    expect(created.id).toBeDefined();
    expect(created.title).toBe('Anthropic Claude');
    expect(created.icon).toContain('claude.ai');

    const updatedList = useBookmarkStore.getState().bookmarks;
    expect(updatedList.some((b) => b.id === created.id)).toBe(true);
  });

  it('updates an existing bookmark', async () => {
    const { bookmarks, updateBookmark } = useBookmarkStore.getState();
    const first = bookmarks[0];
    await updateBookmark(first.id, { title: 'Perplexity Pro Research' });

    const updated = useBookmarkStore.getState().bookmarks.find((b) => b.id === first.id);
    expect(updated?.title).toBe('Perplexity Pro Research');
  });

  it('toggles pinned status of a bookmark', async () => {
    const { bookmarks, togglePinBookmark } = useBookmarkStore.getState();
    const target = bookmarks[0];
    const initialPin = !!target.isPinned;

    await togglePinBookmark(target.id);
    const updated = useBookmarkStore.getState().bookmarks.find((b) => b.id === target.id);
    expect(updated?.isPinned).toBe(!initialPin);
  });

  it('deletes a bookmark', async () => {
    const { bookmarks, deleteBookmark } = useBookmarkStore.getState();
    const target = bookmarks[0];
    await deleteBookmark(target.id);

    const remaining = useBookmarkStore.getState().bookmarks;
    expect(remaining.some((b) => b.id === target.id)).toBe(false);
  });
});
