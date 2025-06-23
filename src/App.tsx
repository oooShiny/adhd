import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';
import EntryForm from './components/EntryForm';
import EntryList from './components/EntryList';
import type { JournalEntry } from './types';
import { DistortionType } from './types';
import { getAllEntries } from './services/storageService';
import './App.css';

const AppContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #4a6fa5;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 18px;
  margin-top: 0;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 12px 24px;
  background-color: ${({ active }) => (active ? '#4a6fa5' : 'transparent')};
  color: ${({ active }) => (active ? 'white' : '#4a6fa5')};
  border: 2px solid #4a6fa5;
  border-radius: ${({ active }) => (active ? '8px' : '8px')};
  margin: 0 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ active }) => (active ? '#3c5a84' : '#edf2f7')};
  }

  @media (max-width: 600px) {
    flex: 1;
    font-size: 14px;
    padding: 10px;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  @media (max-width: 600px) {
    width: 100%;
  }
`;

const DateInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  @media (max-width: 600px) {
    width: 100%;
  }
`;

const FilterLabel = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #666;
  font-weight: 500;
`;

function App() {
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  
  const loadEntries = async () => {
    try {
      const allEntries = await getAllEntries();
      setEntries(allEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    // Apply filters whenever entries or filter settings change
    let filtered = [...entries];
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(entry => entry.distortionType === filterType);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= startOfDay(now) && entryDate <= endOfDay(now);
          });
          break;
        case 'yesterday':
          const yesterday = subDays(now, 1);
          filtered = filtered.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= startOfDay(yesterday) && entryDate <= endOfDay(yesterday);
          });
          break;
        case 'week':
          const lastWeek = subDays(now, 7);
          filtered = filtered.filter(entry => {
            return entry.timestamp >= lastWeek.getTime();
          });
          break;
        case 'month':
          const lastMonth = subDays(now, 30);
          filtered = filtered.filter(entry => {
            return entry.timestamp >= lastMonth.getTime();
          });
          break;
        case 'custom':
          const start = startOfDay(parseISO(customStartDate)).getTime();
          const end = endOfDay(parseISO(customEndDate)).getTime();
          filtered = filtered.filter(entry => {
            return entry.timestamp >= start && entry.timestamp <= end;
          });
          break;
      }
    }
    
    setFilteredEntries(filtered);
  }, [entries, filterType, dateFilter, customStartDate, customEndDate]);

  return (
    <AppContainer>
      <Header>
        <Title>Cognitive Distortion Journal</Title>
        <Subtitle>Track and challenge negative thoughts</Subtitle>
      </Header>

      <TabContainer>
        <Tab 
          active={activeTab === 'add'} 
          onClick={() => setActiveTab('add')}
        >
          Add New Entry
        </Tab>
        <Tab 
          active={activeTab === 'list'} 
          onClick={() => setActiveTab('list')}
        >
          View Entries ({entries.length})
        </Tab>
      </TabContainer>

      {activeTab === 'add' ? (
        <EntryForm 
          onSave={() => {
            loadEntries();
            setActiveTab('list');
          }}
        />
      ) : (
        <>
          <FilterContainer>
            <FilterLabel>
              Type
              <Select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                {Object.values(DistortionType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </FilterLabel>
            
            <FilterLabel>
              Time Period
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="custom">Custom Range</option>
              </Select>
            </FilterLabel>
            
            {dateFilter === 'custom' && (
              <>
                <FilterLabel>
                  From
                  <DateInput
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </FilterLabel>
                
                <FilterLabel>
                  To
                  <DateInput
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </FilterLabel>
              </>
            )}
          </FilterContainer>
          
          <EntryList 
            onRefreshNeeded={loadEntries}
            entries={filteredEntries}
          />
        </>
      )}
    </AppContainer>
  )
}

export default App
