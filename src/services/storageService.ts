import { get, set, del, keys, clear } from 'idb-keyval';
import type { JournalEntry, NewJournalEntry } from '../types';

const JOURNAL_ENTRY_PREFIX = 'journal_entry_';

// Helper to generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

// Save a new journal entry
export const saveEntry = async (entry: NewJournalEntry): Promise<JournalEntry> => {
  const id = generateId();
  const timestamp = entry.timestamp || Date.now();
  
  const journalEntry: JournalEntry = {
    ...entry,
    id,
    timestamp,
    createdAt: Date.now(),
  };

  const key = `${JOURNAL_ENTRY_PREFIX}${id}`;
  await set(key, journalEntry);
  return journalEntry;
};

// Get a journal entry by ID
export const getEntry = async (id: string): Promise<JournalEntry | null> => {
  try {
    const entry = await get(`${JOURNAL_ENTRY_PREFIX}${id}`);
    return entry || null;
  } catch (error) {
    console.error('Error getting journal entry:', error);
    return null;
  }
};

// Get all journal entries
export const getAllEntries = async (): Promise<JournalEntry[]> => {
  try {
    const allKeys = await keys();
    const journalKeys = allKeys.filter((key) => 
      typeof key === 'string' && key.startsWith(JOURNAL_ENTRY_PREFIX)
    );

    const entriesPromises = journalKeys.map((key) => get(key));
    const entries = await Promise.all(entriesPromises);
    
    return entries
      .filter((entry): entry is JournalEntry => entry !== undefined)
      .sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp desc
  } catch (error) {
    console.error('Error getting all journal entries:', error);
    return [];
  }
};

// Update an existing journal entry
export const updateEntry = async (entry: JournalEntry): Promise<JournalEntry> => {
  const key = `${JOURNAL_ENTRY_PREFIX}${entry.id}`;
  await set(key, entry);
  return entry;
};

// Delete a journal entry
export const deleteEntry = async (id: string): Promise<boolean> => {
  try {
    await del(`${JOURNAL_ENTRY_PREFIX}${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return false;
  }
};

// Clear all journal entries (dangerous!)
export const clearAllEntries = async (): Promise<boolean> => {
  try {
    await clear();
    return true;
  } catch (error) {
    console.error('Error clearing all journal entries:', error);
    return false;
  }
};
