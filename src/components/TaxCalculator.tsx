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

const CalculationProcess = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ProcessTitle = styled.h3`
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.1rem;
`;

const ProcessStep = styled.div`
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: white;
  border-radius: 4px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Formula = styled.div`
  font-family: monospace;
  margin: 0.5rem 0;
  padding: 0.5rem;
  background-color: #f0f2f5;
  border-radius: 4px;
`;

const InsuranceDetails = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f0f2f5;
  border-radius: 4px;
`;

const InsuranceItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.9rem;
  
  &:not(:last-child) {
    border-bottom: 1px solid #ddd;
  }
`;

export const TaxCalculator: React.FC = () => {
  const [annualSalary, setAnnualSalary] = useState<number>(0);

  const calculateDeduction = (salary: number): { 
    deduction: number, 
    formula: string 
  } => {
    if (salary <= 1_625_000) {
      const deduction = Math.min(550_000, salary * 0.4);
      return {
        deduction,
        formula: `給与所得控除額 = min(550,000, ${formatCurrency(salary)} × 40%) = ${formatCurrency(deduction)}`
      };
    } else if (salary <= 1_800_000) {
      const deduction = salary * 0.3 + 162_500;
      return {
        deduction,
        formula: `給与所得控除額 = ${formatCurrency(salary)} × 30% + 162,500 = ${formatCurrency(deduction)}`
      };
    } else if (salary <= 3_600_000) {
      const deduction = salary * 0.2 + 342_500;
      return {
        deduction,
        formula: `給与所得控除額 = ${formatCurrency(salary)} × 20% + 342,500 = ${formatCurrency(deduction)}`
      };
    } else if (salary <= 6_600_000) {
      const deduction = salary * 0.1 + 702_500;
      return {
        deduction,
        formula: `給与所得控除額 = ${formatCurrency(salary)} × 10% + 702,500 = ${formatCurrency(deduction)}`
      };
    } else if (salary <= 8_500_000) {
      const deduction = salary * 0.05 + 1_032_500;
      return {
        deduction,
        formula: `給与所得控除額 = ${formatCurrency(salary)} × 5% + 1,032,500 = ${formatCurrency(deduction)}`
      };
    } else {
      return {
        deduction: 1_950_000,
        formula: "給与所得控除額 = 1,950,000（上限額）"
      };
    }
  };

  const result = annualSalary > 0 ? TaxCalculatorUtil.calculateNetIncome(annualSalary) : null;
  const deductionCalc = annualSalary > 0 ? calculateDeduction(annualSalary) : null;

  const getIncomeTaxRate = (taxableIncome: number): {
    rate: number;
    deduction: number;
    formula: string;
  } => {
    if (taxableIncome <= 1_950_000) {
      return { rate: 0.05, deduction: 0, formula: "税率5%" };
    } else if (taxableIncome <= 3_300_000) {
      return { rate: 0.1, deduction: 97_500, formula: "税率10% - 97,500円" };
    } else if (taxableIncome <= 6_950_000) {
      return { rate: 0.2, deduction: 427_500, formula: "税率20% - 427,500円" };
    } else if (taxableIncome <= 9_000_000) {
      return { rate: 0.23, deduction: 636_000, formula: "税率23% - 636,000円" };
    } else if (taxableIncome <= 18_000_000) {
      return { rate: 0.33, deduction: 1_536_000, formula: "税率33% - 1,536,000円" };
    } else if (taxableIncome <= 40_000_000) {
      return { rate: 0.4, deduction: 2_796_000, formula: "税率40% - 2,796,000円" };
    } else {
      return { rate: 0.45, deduction: 4_796_000, formula: "税率45% - 4,796,000円" };
    }
  };

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

      {result && deductionCalc && (
        <>
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
              <ResultItem>
                <span>社会保険料（合計）:</span>
                <Value>{formatCurrency(result.insurance.total)}</Value>
              </ResultItem>
              <InsuranceDetails>
                <InsuranceItem>
                  <span>健康保険料（労働者負担分）:</span>
                  <Value>{formatCurrency(result.insurance.healthInsurance)}</Value>
                </InsuranceItem>
                <InsuranceItem>
                  <span>厚生年金保険料（労働者負担分）:</span>
                  <Value>{formatCurrency(result.insurance.pensionInsurance)}</Value>
                </InsuranceItem>
                <InsuranceItem>
                  <span>雇用保険料:</span>
                  <Value>{formatCurrency(result.insurance.employmentInsurance)}</Value>
                </InsuranceItem>
                <InsuranceItem>
                  <span>標準報酬月額:</span>
                  <Value>{formatCurrency(result.insurance.standardMonthlyRemuneration)}</Value>
                </InsuranceItem>
              </InsuranceDetails>
              <ResultItem isTotal>
                <span>手取り額:</span>
                <Value>{formatCurrency(result.netIncome)}</Value>
              </ResultItem>
            </ResultGrid>
          </ResultSection>

          <CalculationProcess>
            <ProcessTitle>計算過程の詳細</ProcessTitle>
            
            <ProcessStep>
              <h4>1. 給与所得控除の計算</h4>
              <Formula>{deductionCalc.formula}</Formula>
            </ProcessStep>

            <ProcessStep>
              <h4>2. 給与所得の計算</h4>
              <Formula>
                給与所得 = 年収 - 給与所得控除額
                <br />
                {formatCurrency(annualSalary)} - {formatCurrency(deductionCalc.deduction)} = {formatCurrency(annualSalary - deductionCalc.deduction)}
              </Formula>
            </ProcessStep>

            <ProcessStep>
              <h4>3. 課税所得金額の計算</h4>
              <Formula>
                課税所得金額 = 給与所得 - 基礎控除（48万円）
                <br />
                {formatCurrency(annualSalary - deductionCalc.deduction)} - ¥480,000 = {formatCurrency(Math.max(0, annualSalary - deductionCalc.deduction - 480_000))}
              </Formula>
            </ProcessStep>

            <ProcessStep>
              <h4>4. 所得税額の計算</h4>
              {(() => {
                const taxableIncome = Math.max(0, annualSalary - deductionCalc.deduction - 480_000);
                const taxRate = getIncomeTaxRate(taxableIncome);
                const baseTax = Math.floor(taxableIncome * taxRate.rate - taxRate.deduction);
                return (
                  <Formula>
                    適用税率: {taxRate.formula}
                    <br />
                    所得税額 = 課税所得金額 × 税率 - 控除額
                    <br />
                    {formatCurrency(taxableIncome)} × {taxRate.rate * 100}% - {formatCurrency(taxRate.deduction)} = {formatCurrency(baseTax)}
                    <br />
                    復興特別所得税を含む所得税額 = 所得税額 × 1.021
                    <br />
                    {formatCurrency(baseTax)} × 1.021 = {formatCurrency(Math.floor(baseTax * 1.021))}
                  </Formula>
                );
              })()}
            </ProcessStep>

            <ProcessStep>
              <h4>5. 住民税額の計算</h4>
              <Formula>
                課税所得金額 × 10%（都道府県民税4% + 市町村民税6%）+ 均等割額5,000円
                <br />
                {formatCurrency(Math.max(0, annualSalary - deductionCalc.deduction - 430_000))} × 10% + ¥5,000 = {formatCurrency(result.residentTax)}
              </Formula>
            </ProcessStep>

            <ProcessStep>
              <h4>6. 社会保険料の計算</h4>
              <Formula>
                標準報酬月額: {formatCurrency(result.insurance.standardMonthlyRemuneration)}
                <br />
                健康保険料（労働者負担分 4.905%）= {formatCurrency(result.insurance.standardMonthlyRemuneration)} × 4.905% × 12 = {formatCurrency(result.insurance.healthInsurance)}
                <br />
                厚生年金保険料（労働者負担分 9.15%）= {formatCurrency(result.insurance.standardMonthlyRemuneration)} × 9.15% × 12 = {formatCurrency(result.insurance.pensionInsurance)}
                <br />
                雇用保険料（0.9%）= {formatCurrency(annualSalary)} × 0.9% = {formatCurrency(result.insurance.employmentInsurance)}
                <br />
                社会保険料合計 = {formatCurrency(result.insurance.total)}
              </Formula>
            </ProcessStep>

            <ProcessStep>
              <h4>7. 手取り額の計算</h4>
              <Formula>
                手取り額 = 年収 - 所得税 - 住民税 - 社会保険料合計
                <br />
                {formatCurrency(annualSalary)} - {formatCurrency(result.incomeTax)} - {formatCurrency(result.residentTax)} - {formatCurrency(result.insurance.total)} = {formatCurrency(result.netIncome)}
              </Formula>
            </ProcessStep>
          </CalculationProcess>

          <Note>
            ※ この計算は以下を前提としています：
            <br />・給与所得のみの独身者
            <br />・扶養控除なし
            <br />・東京都在住（健康保険料率：9.81%）
            <br />・厚生年金保険料率：18.3%
            <br />・雇用保険料率：0.9%（一般の事業の場合）
            <br />・特別な控除や減税は考慮していません
          </Note>
        </>
      )}
    </Container>
  );
};

export default TaxCalculator; 