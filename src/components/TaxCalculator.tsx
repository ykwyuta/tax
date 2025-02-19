import React, { useState } from 'react';
import styled from 'styled-components';
import { TaxCalculator as TaxCalculatorUtil } from '../utils/TaxCalculator';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0
  }).format(value);
};

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
`;

const InputSection = styled.div`
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: bold;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  font-size: 1.1rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #42b983;
  }
`;

const Currency = styled.span`
  font-size: 1.1rem;
  color: #2c3e50;
`;

const ResultSection = styled.div`
  background-color: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ResultTitle = styled.h2`
  color: #2c3e50;
  margin-bottom: 1.5rem;
`;

const ResultGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const ResultItem = styled.div<{ isTotal?: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background-color: ${props => props.isTotal ? '#42b983' : 'white'};
  color: ${props => props.isTotal ? 'white' : 'inherit'};
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: ${props => props.isTotal ? '1rem' : '0'};
  font-weight: ${props => props.isTotal ? 'bold' : 'normal'};
`;

const Value = styled.span`
  font-weight: bold;
`;

const Note = styled.p`
  margin-top: 2rem;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.6;
`;

export const TaxCalculator: React.FC = () => {
  const [annualSalary, setAnnualSalary] = useState<number>(0);
  const result = annualSalary > 0 ? TaxCalculatorUtil.calculateNetIncome(annualSalary) : null;

  return (
    <Container>
      <Title>給与所得の税金計算</Title>
      <InputSection>
        <Label htmlFor="salary">年収</Label>
        <InputWrapper>
          <Input
            id="salary"
            type="number"
            value={annualSalary}
            onChange={(e) => setAnnualSalary(Number(e.target.value))}
            min={0}
            step={10000}
            placeholder="年収を入力してください"
          />
          <Currency>円</Currency>
        </InputWrapper>
      </InputSection>

      {result && (
        <ResultSection>
          <ResultTitle>計算結果</ResultTitle>
          <ResultGrid>
            <ResultItem>
              <span>年収:</span>
              <Value>{formatCurrency(result.salary)}</Value>
            </ResultItem>
            <ResultItem>
              <span>所得税（復興特別所得税込）:</span>
              <Value>{formatCurrency(result.incomeTax)}</Value>
            </ResultItem>
            <ResultItem>
              <span>住民税（均等割含む）:</span>
              <Value>{formatCurrency(result.residentTax)}</Value>
            </ResultItem>
            <ResultItem isTotal>
              <span>手取り額（概算）:</span>
              <Value>{formatCurrency(result.netIncome)}</Value>
            </ResultItem>
          </ResultGrid>
          <Note>
            ※ この計算は以下を前提としています：
            <br />・給与所得のみの独身者
            <br />・扶養控除なし
            <br />・社会保険料は給与の約15%と概算
            <br />・特別な控除や減税は考慮していません
          </Note>
        </ResultSection>
      )}
    </Container>
  );
};

export default TaxCalculator; 