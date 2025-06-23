import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { format } from 'date-fns';
import type { JournalEntry } from '../types';
import { getAllEntries, deleteEntry } from '../services/storageService';

interface EntryListProps {
  entries?: JournalEntry[];
  onEditEntry?: (entry: JournalEntry) => void;
  onRefreshNeeded?: () => void;
}

const ListContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const EntryCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const EntryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const EntryTimestamp = styled.span`
  color: #666;
  font-size: 14px;
`;

const EntryType = styled.span`
  display: inline-block;
  background-color: #edf2f7;
  color: #4a6fa5;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
`;

const EntryContent = styled.div`
  margin-bottom: 12px;
`;

const SectionTitle = styled.h4`
  margin-top: 16px;
  margin-bottom: 8px;
  color: #333;
  font-size: 16px;
`;

const Text = styled.p`
  color: #444;
  margin: 8px 0;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button<{ danger?: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  ${({ danger }) => danger 
    ? `
      background-color: #f8d7da;
      color: #721c24;
      &:hover {
        background-color: #f5c6cb;
      }
    `
    : `
      background-color: #e0e0e0;
      color: #333;
      &:hover {
        background-color: #d0d0d0;
      }
    `}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

const EntryList: React.FC<EntryListProps> = ({ entries: propEntries, onEditEntry, onRefreshNeeded }) => {
  const [localEntries, setLocalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = async () => {
    if (propEntries) {
      setLocalEntries(propEntries);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const allEntries = await getAllEntries();
      setLocalEntries(allEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propEntries) {
      setLocalEntries(propEntries);
      setLoading(false);
    } else {
      loadEntries();
    }
  }, [propEntries]);

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteEntry(id);
        await loadEntries();
        if (onRefreshNeeded) {
          onRefreshNeeded();
        }
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };

  if (loading) {
    return <EmptyState>Loading entries...</EmptyState>;
  }

  if (localEntries.length === 0) {
    return <EmptyState>No journal entries yet. Add your first entry!</EmptyState>;
  }

  return (
    <ListContainer>
      {localEntries.map((entry) => (
        <EntryCard key={entry.id}>
          <EntryHeader>
            <EntryTimestamp>
              {format(entry.timestamp, 'MMM d, yyyy h:mm a')}
            </EntryTimestamp>
            <EntryType>{entry.distortionType}</EntryType>
          </EntryHeader>
          
          <EntryContent>
            <SectionTitle>Negative Thought</SectionTitle>
            <Text>{entry.negativeThought}</Text>
            
            <SectionTitle>Rational Response</SectionTitle>
            <Text>{entry.rationalResponse}</Text>
          </EntryContent>
          
          <ButtonGroup>
            {onEditEntry && (
              <Button onClick={() => onEditEntry(entry)}>
                Edit
              </Button>
            )}
            <Button 
              danger 
              onClick={() => handleDeleteEntry(entry.id)}
            >
              Delete
            </Button>
          </ButtonGroup>
        </EntryCard>
      ))}
    </ListContainer>
  );
};

export default EntryList;
