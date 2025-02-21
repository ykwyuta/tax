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
  max-width: 1600px;
  margin: 0 auto;
  padding: 1rem;
  color: #2c3e50;
  background-color: #ffffff;

  @media (min-width: 1024px) {
    padding: 2rem;
  }
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
  color: #2c3e50;
  background-color: #ffffff;

  &:focus {
    outline: none;
    border-color: #42b983;
  }

  &::placeholder {
    color: #999;
  }
`;

const Currency = styled.span`
  font-size: 1.1rem;
  color: #2c3e50;
`;

const ResultSection = styled.div`
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    padding: 2rem;
  }
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
  color: ${props => props.isTotal ? '#ffffff' : '#2c3e50'};
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
  background-color: #ffffff;
  border-radius: 4px;
  color: #2c3e50;
  
  &:last-child {
    margin-bottom: 0;
  }

  h4 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }
`;

const Formula = styled.div`
  font-family: monospace;
  margin: 0.5rem 0;
  padding: 0.5rem;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  color: #2c3e50;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
`;

const InsuranceDetails = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const InsuranceItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.9rem;
  color: #2c3e50;
  
  &:not(:last-child) {
    border-bottom: 1px solid #ddd;
  }
`;

const Description = styled.p`
  margin: 0.25rem 0 0.75rem;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
`;

const ContentWrapper = styled.div`
  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 1rem;

  @media (min-width: 1024px) {
    display: none;
  }
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 0.75rem;
  background-color: ${props => props.active ? '#42b983' : '#f8f9fa'};
  color: ${props => props.active ? '#ffffff' : '#2c3e50'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#42b983' : '#ddd'};
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: ${props => props.active ? '#42b983' : '#e9ecef'};
  }
`;

const Section = styled.div<{ active: boolean }>`
  display: ${props => props.active ? 'block' : 'none'};

  @media (min-width: 1024px) {
    display: block;
  }
`;

export const TaxCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'input' | 'result'>('input');
  const [annualSalary, setAnnualSalary] = useState<number>(0);
  const [medicalExpenses, setMedicalExpenses] = useState<number>(0);
  const [loanBalance, setLoanBalance] = useState<number>(0);
  const [insurances, setInsurances] = useState({
    generalLifeInsurance: 0,
    medicalLifeInsurance: 0,
    pensionInsurance: 0,
    earthquakeInsurance: 0,
    oldLongTermInsurance: 0
  });
  const [dependents, setDependents] = useState({
    spouse: false,
    spouseIncome: 0,
    elderly: 0,
    specific: 0,
    general: 0
  });
  const [hasSpecialCondition, setHasSpecialCondition] = useState(false);

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

  const result = annualSalary > 0 ? TaxCalculatorUtil.calculateNetIncome(
    annualSalary,
    medicalExpenses,
    loanBalance,
    insurances,
    dependents,
    hasSpecialCondition
  ) : null;
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
      
      <TabContainer>
        <Tab 
          active={activeTab === 'input'} 
          onClick={() => setActiveTab('input')}
        >
          入力
        </Tab>
        <Tab 
          active={activeTab === 'result'} 
          onClick={() => setActiveTab('result')}
        >
          計算結果
        </Tab>
      </TabContainer>

      <ContentWrapper>
        <Section active={activeTab === 'input'}>
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

            <Label htmlFor="medical" style={{ marginTop: '1rem' }}>年間医療費</Label>
            <InputWrapper>
              <Input
                id="medical"
                type="number"
                value={medicalExpenses}
                onChange={(e) => setMedicalExpenses(Number(e.target.value))}
                min={0}
                step={1000}
                placeholder="医療費を入力してください"
              />
              <Currency>円</Currency>
            </InputWrapper>

            <Label htmlFor="loan" style={{ marginTop: '1rem' }}>住宅ローン残高</Label>
            <InputWrapper>
              <Input
                id="loan"
                type="number"
                value={loanBalance}
                onChange={(e) => setLoanBalance(Number(e.target.value))}
                min={0}
                step={100000}
                placeholder="住宅ローン残高を入力してください"
              />
              <Currency>円</Currency>
            </InputWrapper>

            <Label style={{ marginTop: '2rem' }}>生命保険料控除</Label>
            <Description>
              一般生命保険料、介護医療保険料、個人年金保険料の各控除額は最大4万円（合計で最大12万円）まで控除できます。
              支払金額に応じて控除額が計算されます。
            </Description>
            <InputWrapper>
              <Input
                type="number"
                value={insurances.generalLifeInsurance}
                onChange={(e) => setInsurances({
                  ...insurances,
                  generalLifeInsurance: Number(e.target.value)
                })}
                min={0}
                step={1000}
                placeholder="一般生命保険料を入力"
              />
              <Currency>円</Currency>
            </InputWrapper>
            <Description>
              死亡保険や終身保険などの一般的な生命保険の年間支払保険料を入力してください。
            </Description>

            <InputWrapper style={{ marginTop: '0.5rem' }}>
              <Input
                type="number"
                value={insurances.medicalLifeInsurance}
                onChange={(e) => setInsurances({
                  ...insurances,
                  medicalLifeInsurance: Number(e.target.value)
                })}
                min={0}
                step={1000}
                placeholder="介護医療保険料を入力"
              />
              <Currency>円</Currency>
            </InputWrapper>
            <Description>
              医療保険や介護保険、がん保険などの医療系保険の年間支払保険料を入力してください。
            </Description>

            <InputWrapper style={{ marginTop: '0.5rem' }}>
              <Input
                type="number"
                value={insurances.pensionInsurance}
                onChange={(e) => setInsurances({
                  ...insurances,
                  pensionInsurance: Number(e.target.value)
                })}
                min={0}
                step={1000}
                placeholder="個人年金保険料を入力"
              />
              <Currency>円</Currency>
            </InputWrapper>
            <Description>
              個人年金保険の年間支払保険料を入力してください。企業年金や国民年金は含みません。
            </Description>

            <Label style={{ marginTop: '1.5rem' }}>地震保険料控除</Label>
            <Description>
              地震保険料は支払保険料の全額（上限5万円）が控除されます。
              旧長期損害保険料は契約時期により、最大1万円まで控除できます。
            </Description>
            <InputWrapper>
              <Input
                type="number"
                value={insurances.earthquakeInsurance}
                onChange={(e) => setInsurances({
                  ...insurances,
                  earthquakeInsurance: Number(e.target.value)
                })}
                min={0}
                step={1000}
                placeholder="地震保険料を入力"
              />
              <Currency>円</Currency>
            </InputWrapper>
            <Description>
              地震保険の年間支払保険料を入力してください。火災保険に付帯する地震保険も含みます。
            </Description>

            <InputWrapper style={{ marginTop: '0.5rem' }}>
              <Input
                type="number"
                value={insurances.oldLongTermInsurance}
                onChange={(e) => setInsurances({
                  ...insurances,
                  oldLongTermInsurance: Number(e.target.value)
                })}
                min={0}
                step={1000}
                placeholder="旧長期損害保険料を入力"
              />
              <Currency>円</Currency>
            </InputWrapper>
            <Description>
              2006年末までに契約した満期返戻金のある長期損害保険の年間支払保険料を入力してください。
            </Description>

            <Label style={{ marginTop: '2rem' }}>扶養控除</Label>
            <Description>
              扶養親族の情報を入力してください。特定扶養親族は19〜23歳、一般扶養親族は16〜18歳または23〜69歳、
              老人扶養親族は70歳以上の扶養親族です。
            </Description>

            <InputWrapper style={{ marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={dependents.spouse}
                  onChange={(e) => setDependents({
                    ...dependents,
                    spouse: e.target.checked
                  })}
                />
                配偶者控除対象
              </label>
            </InputWrapper>

            {dependents.spouse && (
              <InputWrapper style={{ marginTop: '0.5rem' }}>
                <Input
                  type="number"
                  value={dependents.spouseIncome}
                  onChange={(e) => setDependents({
                    ...dependents,
                    spouseIncome: Number(e.target.value)
                  })}
                  min={0}
                  step={10000}
                  placeholder="配偶者の年間所得を入力"
                />
                <Currency>円</Currency>
              </InputWrapper>
            )}
            <Description>
              配偶者の年間所得が48万円以下の場合、38万円の控除が適用されます。
            </Description>

            <InputWrapper style={{ marginTop: '1rem' }}>
              <Input
                type="number"
                value={dependents.elderly}
                onChange={(e) => setDependents({
                  ...dependents,
                  elderly: Number(e.target.value)
                })}
                min={0}
                step={1}
                placeholder="老人扶養親族の人数"
              />
              <span>人</span>
            </InputWrapper>
            <Description>
              70歳以上の扶養親族（1人につき48万円の控除）
            </Description>

            <InputWrapper style={{ marginTop: '0.5rem' }}>
              <Input
                type="number"
                value={dependents.specific}
                onChange={(e) => setDependents({
                  ...dependents,
                  specific: Number(e.target.value)
                })}
                min={0}
                step={1}
                placeholder="特定扶養親族の人数"
              />
              <span>人</span>
            </InputWrapper>
            <Description>
              19〜23歳の扶養親族（1人につき63万円の控除）
            </Description>

            <InputWrapper style={{ marginTop: '0.5rem' }}>
              <Input
                type="number"
                value={dependents.general}
                onChange={(e) => setDependents({
                  ...dependents,
                  general: Number(e.target.value)
                })}
                min={0}
                step={1}
                placeholder="一般扶養親族の人数"
              />
              <span>人</span>
            </InputWrapper>
            <Description>
              16〜18歳または23〜69歳の扶養親族（1人につき38万円の控除）
            </Description>

            <Label style={{ marginTop: '1.5rem' }}>所得金額調整控除</Label>
            <InputWrapper>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={hasSpecialCondition}
                  onChange={(e) => setHasSpecialCondition(e.target.checked)}
                />
                特別な事情あり
              </label>
            </InputWrapper>
            <Description>
              23歳未満の扶養親族がいる場合や、特別障害者である配偶者や扶養親族がいる場合などは、
              年収850万円超で所得金額調整控除が適用されます。
            </Description>
          </InputSection>
        </Section>

        <Section active={activeTab === 'result'}>
          {result && deductionCalc && (
            <>
              <ResultSection>
                <ResultTitle>計算結果</ResultTitle>
                <ResultGrid>
                  <ResultItem>
                    <span>年収:</span>
                    <Value>{formatCurrency(result.salary)}</Value>
                  </ResultItem>
                  {result.medicalExpenses > 0 && (
                    <ResultItem>
                      <span>医療費控除:</span>
                      <Value>{formatCurrency(result.medicalDeduction.deduction)}</Value>
                    </ResultItem>
                  )}
                  {result.housingLoan.balance > 0 && (
                    <ResultItem>
                      <span>住宅ローン控除（合計）:</span>
                      <Value>{formatCurrency(result.housingLoan.deduction.total)}</Value>
                    </ResultItem>
                  )}
                  <ResultItem>
                    <span>所得税（復興特別所得税込）:</span>
                    <Value>{formatCurrency(result.incomeTax)}</Value>
                  </ResultItem>
                  {result.housingLoan.balance > 0 && (
                    <ResultItem>
                      <span>（うち住宅ローン控除分）:</span>
                      <Value>{formatCurrency(result.housingLoan.deduction.incomeTax)}</Value>
                    </ResultItem>
                  )}
                  <ResultItem>
                    <span>住民税（均等割含む）:</span>
                    <Value>{formatCurrency(result.residentTax)}</Value>
                  </ResultItem>
                  {result.housingLoan.balance > 0 && (
                    <ResultItem>
                      <span>（うち住宅ローン控除分）:</span>
                      <Value>{formatCurrency(result.housingLoan.deduction.residentTax)}</Value>
                    </ResultItem>
                  )}
                  <ResultItem>
                    <span>ふるさと納税の限度額:</span>
                    <Value>{formatCurrency(result.furusatoNozei.limit)}</Value>
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

                  {(result.insuranceDeductions.life.total > 0 || result.insuranceDeductions.earthquake.deduction > 0) && (
                    <>
                      <ResultItem>
                        <span>生命保険料控除（合計）:</span>
                        <Value>{formatCurrency(result.insuranceDeductions.life.total)}</Value>
                      </ResultItem>
                      {result.insuranceDeductions.life.generalDeduction > 0 && (
                        <ResultItem>
                          <span>（一般生命保険料控除）:</span>
                          <Value>{formatCurrency(result.insuranceDeductions.life.generalDeduction)}</Value>
                        </ResultItem>
                      )}
                      {result.insuranceDeductions.life.medicalDeduction > 0 && (
                        <ResultItem>
                          <span>（介護医療保険料控除）:</span>
                          <Value>{formatCurrency(result.insuranceDeductions.life.medicalDeduction)}</Value>
                        </ResultItem>
                      )}
                      {result.insuranceDeductions.life.pensionDeduction > 0 && (
                        <ResultItem>
                          <span>（個人年金保険料控除）:</span>
                          <Value>{formatCurrency(result.insuranceDeductions.life.pensionDeduction)}</Value>
                        </ResultItem>
                      )}
                      {result.insuranceDeductions.earthquake.deduction > 0 && (
                        <ResultItem>
                          <span>地震保険料控除:</span>
                          <Value>{formatCurrency(result.insuranceDeductions.earthquake.deduction)}</Value>
                        </ResultItem>
                      )}
                    </>
                  )}

                  {(result.dependentDeduction.total > 0 || result.incomeAdjustment.deduction > 0) && (
                    <>
                      {result.dependentDeduction.total > 0 && (
                        <ResultItem>
                          <span>扶養控除（合計）:</span>
                          <Value>{formatCurrency(result.dependentDeduction.total)}</Value>
                        </ResultItem>
                      )}
                      {result.dependentDeduction.spouse > 0 && (
                        <ResultItem>
                          <span>（配偶者控除）:</span>
                          <Value>{formatCurrency(result.dependentDeduction.spouse)}</Value>
                        </ResultItem>
                      )}
                      {result.dependentDeduction.elderly > 0 && (
                        <ResultItem>
                          <span>（老人扶養控除）:</span>
                          <Value>{formatCurrency(result.dependentDeduction.elderly)}</Value>
                        </ResultItem>
                      )}
                      {result.dependentDeduction.specific > 0 && (
                        <ResultItem>
                          <span>（特定扶養控除）:</span>
                          <Value>{formatCurrency(result.dependentDeduction.specific)}</Value>
                        </ResultItem>
                      )}
                      {result.dependentDeduction.general > 0 && (
                        <ResultItem>
                          <span>（一般扶養控除）:</span>
                          <Value>{formatCurrency(result.dependentDeduction.general)}</Value>
                        </ResultItem>
                      )}
                      {result.incomeAdjustment.deduction > 0 && (
                        <ResultItem>
                          <span>所得金額調整控除:</span>
                          <Value>{formatCurrency(result.incomeAdjustment.deduction)}</Value>
                        </ResultItem>
                      )}
                    </>
                  )}
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

                {result.medicalExpenses > 0 && (
                  <ProcessStep>
                    <h4>3. 医療費控除の計算</h4>
                    <Formula>
                      {result.medicalDeduction.formula}
                      <br />
                      ※ 差引額（{formatCurrency(result.medicalDeduction.threshold)}）は所得の5%と10万円のいずれか少ない方
                    </Formula>
                  </ProcessStep>
                )}

                <ProcessStep>
                  <h4>{result.medicalExpenses > 0 ? '4' : '3'}. 課税所得金額の計算</h4>
                  <Formula>
                    課税所得金額 = 給与所得 - 基礎控除（48万円）{result.medicalExpenses > 0 ? ' - 医療費控除' : ''}
                    <br />
                    {formatCurrency(annualSalary - deductionCalc.deduction)} - ¥480,000{result.medicalExpenses > 0 ? ` - ${formatCurrency(result.medicalDeduction.deduction)}` : ''} = {formatCurrency(Math.max(0, annualSalary - deductionCalc.deduction - 480_000 - (result.medicalExpenses > 0 ? result.medicalDeduction.deduction : 0)))}
                  </Formula>
                </ProcessStep>

                <ProcessStep>
                  <h4>{result.medicalExpenses > 0 ? '5' : '4'}. 所得税額の計算</h4>
                  {(() => {
                    const taxableIncome = Math.max(0, annualSalary - deductionCalc.deduction - 480_000 - (result.medicalExpenses > 0 ? result.medicalDeduction.deduction : 0));
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
                  <h4>{result.medicalExpenses > 0 ? '6' : '5'}. 住民税額の計算</h4>
                  <Formula>
                    課税所得金額 × 10%（都道府県民税4% + 市町村民税6%）+ 均等割額5,000円
                    <br />
                    {formatCurrency(Math.max(0, annualSalary - deductionCalc.deduction - 430_000 - (result.medicalExpenses > 0 ? result.medicalDeduction.deduction : 0)))} × 10% + ¥5,000 = {formatCurrency(result.residentTax)}
                  </Formula>
                </ProcessStep>

                <ProcessStep>
                  <h4>{result.medicalExpenses > 0 ? '7' : '6'}. ふるさと納税の限度額計算</h4>
                  <Formula>
                    {result.furusatoNozei.formula}
                  </Formula>
                </ProcessStep>

                <ProcessStep>
                  <h4>{result.medicalExpenses > 0 ? '8' : '7'}. 社会保険料の計算</h4>
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
                  <h4>{result.medicalExpenses > 0 ? '9' : '8'}. 手取り額の計算</h4>
                  <Formula>
                    手取り額 = 年収 - 所得税 - 住民税 - 社会保険料合計
                    <br />
                    {formatCurrency(annualSalary)} - {formatCurrency(result.incomeTax)} - {formatCurrency(result.residentTax)} - {formatCurrency(result.insurance.total)} = {formatCurrency(result.netIncome)}
                  </Formula>
                </ProcessStep>

                {result.housingLoan.balance > 0 && (
                  <ProcessStep>
                    <h4>{result.medicalExpenses > 0 ? '4' : '3'}. 住宅ローン控除の計算</h4>
                    <Formula>
                      {result.housingLoan.deduction.formula}
                      <br />
                      所得税からの控除額: {formatCurrency(result.housingLoan.deduction.incomeTax)}
                      <br />
                      住民税からの控除額: {formatCurrency(result.housingLoan.deduction.residentTax)}
                      <br />
                      ※ 所得税から控除しきれない額を住民税から控除（上限13.65万円）
                    </Formula>
                  </ProcessStep>
                )}

                {(result.insuranceDeductions.life.total > 0 || result.insuranceDeductions.earthquake.deduction > 0) && (
                  <ProcessStep>
                    <h4>{result.medicalExpenses > 0 ? '4' : '3'}. 保険料控除の計算</h4>
                    {result.insuranceDeductions.life.total > 0 && (
                      <Formula>
                        {result.insuranceDeductions.life.formula}
                      </Formula>
                    )}
                    {result.insuranceDeductions.earthquake.deduction > 0 && (
                      <Formula>
                        {result.insuranceDeductions.earthquake.formula}
                      </Formula>
                    )}
                  </ProcessStep>
                )}

                {result && (result.dependentDeduction.total > 0 || result.incomeAdjustment.deduction > 0) && (
                  <ProcessStep>
                    <h4>扶養控除と所得金額調整控除の計算</h4>
                    {result.dependentDeduction.total > 0 && (
                      <Formula>
                        {result.dependentDeduction.formula}
                      </Formula>
                    )}
                    {result.incomeAdjustment.deduction > 0 && (
                      <Formula>
                        {result.incomeAdjustment.formula}
                      </Formula>
                    )}
                  </ProcessStep>
                )}
              </CalculationProcess>

              <Note>
                ※ この計算は以下を前提としています：
                <br />・給与所得のみの独身者
                <br />・扶養控除なし
                <br />・東京都在住（健康保険料率：9.81%）
                <br />・厚生年金保険料率：18.3%
                <br />・雇用保険料率：0.9%（一般の事業の場合）
                <br />・医療費控除は実額控除方式（セルフメディケーション税制は考慮していません）
                <br />・生命保険料控除は一般生命保険料、介護医療保険料、個人年金保険料それぞれ最大4万円（合計最大12万円）
                <br />・地震保険料控除は支払保険料の全額（上限5万円）
                <br />・住宅ローン控除は借入残高の1%（上限40万円）
                <br />・住宅ローン控除の住民税控除部分は上限13.65万円
                <br />・ふるさと納税の限度額は、所得税と住民税の課税所得金額をもとに計算しています
                <br />・特別な控除や減税は考慮していません
                <br />・扶養控除は配偶者控除（38万円）、老人扶養控除（48万円/人）、特定扶養控除（63万円/人）、一般扶養控除（38万円/人）
                <br />・所得金額調整控除は年収850万円超で特別な事情がある場合に適用
              </Note>
            </>
          )}
        </Section>
      </ContentWrapper>
    </Container>
  );
};

export default TaxCalculator; 