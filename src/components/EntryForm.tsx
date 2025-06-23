import React, { useState } from 'react';
import styled from '@emotion/styled';
import { format } from 'date-fns';
import type { NewJournalEntry } from '../types';
import { DistortionType, distortionTypes } from '../types';
import { saveEntry } from '../services/storageService';

interface EntryFormProps {
  onSave?: (entry: NewJournalEntry) => void;
  onCancel?: () => void;
}

const FormContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const FormGroup = styled.div`
  margin-bottom: 18px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  &:focus {
    outline: none;
    border-color: #4a6fa5;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: #4a6fa5;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background-color: white;
  &:focus {
    outline: none;
    border-color: #4a6fa5;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  ${({ primary }) => primary 
    ? `
      background-color: #4a6fa5;
      color: white;
      &:hover {
        background-color: #3c5a84;
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

const DescriptionText = styled.p`
  color: #666;
  font-size: 14px;
  font-style: italic;
  margin-top: 6px;
  margin-bottom: 0;
`;

const EntryForm: React.FC<EntryFormProps> = ({ onSave, onCancel }) => {
  const [timestamp, setTimestamp] = useState<string>(
    format(new Date(), "yyyy-MM-dd'T'HH:mm")
  );
  const [negativeThought, setNegativeThought] = useState('');
  const [distortionType, setDistortionType] = useState<DistortionType | ''>('');
  const [rationalResponse, setRationalResponse] = useState('');
  const [selectedDescription, setSelectedDescription] = useState('');
  
  const handleDistortionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as DistortionType;
    setDistortionType(value);
    
    // Update the description
    const selectedType = distortionTypes.find(type => type.value === value);
    setSelectedDescription(selectedType?.description || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!negativeThought || !distortionType || !rationalResponse) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const date = new Date(timestamp);
      const newEntry: NewJournalEntry = {
        timestamp: date.getTime(),
        negativeThought,
        distortionType: distortionType as DistortionType,
        rationalResponse
      };

      await saveEntry(newEntry); // Save entry without storing the return value
      
      if (onSave) {
        onSave(newEntry);
      }
      
      // Reset form
      setTimestamp(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
      setNegativeThought('');
      setDistortionType('');
      setRationalResponse('');
      setSelectedDescription('');
      
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry. Please try again.');
    }
  };

  return (
    <FormContainer>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="timestamp">When did this happen?</Label>
          <Input
            type="datetime-local"
            id="timestamp"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="negativeThought">What was the negative thought?</Label>
          <TextArea
            id="negativeThought"
            value={negativeThought}
            onChange={(e) => setNegativeThought(e.target.value)}
            placeholder="Describe your negative thought..."
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="distortionType">What type of cognitive distortion is this?</Label>
          <Select
            id="distortionType"
            value={distortionType}
            onChange={handleDistortionChange}
            required
          >
            <option value="">Select a distortion type</option>
            {distortionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
          {selectedDescription && (
            <DescriptionText>{selectedDescription}</DescriptionText>
          )}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="rationalResponse">What's a more rational response?</Label>
          <TextArea
            id="rationalResponse"
            value={rationalResponse}
            onChange={(e) => setRationalResponse(e.target.value)}
            placeholder="What would be a more balanced perspective..."
            required
          />
        </FormGroup>
        
        <ButtonGroup>
          {onCancel && (
            <Button type="button" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" primary>
            Save Entry
          </Button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};

export default EntryForm;
