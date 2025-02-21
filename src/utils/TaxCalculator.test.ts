import { TaxCalculator } from './TaxCalculator';

describe('TaxCalculator', () => {
  describe('給与所得控除の計算', () => {
    test('年収162.5万円以下の場合（40%控除、上限55万円）', () => {
      // ケース1: 100万円の場合
      const result1 = TaxCalculator.calculateNetIncome(1_000_000);
      const expectedDeduction1 = 400_000; // 1,000,000 × 0.4
      expect(result1.salary).toBe(1_000_000);
      expect(1_000_000 - expectedDeduction1).toBe(600_000); // 課税所得の確認
      
      // ケース2: 上限値の162.5万円の場合
      const result2 = TaxCalculator.calculateNetIncome(1_625_000);
      const expectedDeduction2 = 550_000; // 上限額
      expect(result2.salary).toBe(1_625_000);
      expect(1_625_000 - expectedDeduction2).toBe(1_075_000); // 課税所得の確認
    });

    test('年収180万円以下の場合（30%控除+162,500円）', () => {
      // 境界値テスト: 162.5万円をわずかに超える場合
      const result1 = TaxCalculator.calculateNetIncome(1_626_000);
      const expectedDeduction1 = Math.floor(1_626_000 * 0.3 + 162_500);
      expect(expectedDeduction1).toBe(650_300); // 控除額の確認
      
      // 通常ケース: 170万円の場合
      const result2 = TaxCalculator.calculateNetIncome(1_700_000);
      const expectedDeduction2 = Math.floor(1_700_000 * 0.3 + 162_500);
      expect(expectedDeduction2).toBe(672_500); // 控除額の確認
    });

    test('年収360万円以下の場合（20%控除+342,500円）', () => {
      // 境界値テスト: 180万円をわずかに超える場合
      const result1 = TaxCalculator.calculateNetIncome(1_801_000);
      const expectedDeduction1 = Math.floor(1_801_000 * 0.2 + 342_500);
      expect(expectedDeduction1).toBe(702_700); // 控除額の確認
      
      // 通常ケース: 300万円の場合
      const result2 = TaxCalculator.calculateNetIncome(3_000_000);
      const expectedDeduction2 = Math.floor(3_000_000 * 0.2 + 342_500);
      expect(expectedDeduction2).toBe(942_500); // 控除額の確認
    });

    test('年収660万円以下の場合（10%控除+702,500円）', () => {
      // 境界値テスト: 360万円をわずかに超える場合
      const result1 = TaxCalculator.calculateNetIncome(3_601_000);
      const expectedDeduction1 = Math.floor(3_601_000 * 0.1 + 702_500);
      expect(expectedDeduction1).toBe(1_062_600); // 控除額の確認
      
      // 通常ケース: 600万円の場合
      const result2 = TaxCalculator.calculateNetIncome(6_000_000);
      const expectedDeduction2 = Math.floor(6_000_000 * 0.1 + 702_500);
      expect(expectedDeduction2).toBe(1_302_500); // 控除額の確認
    });

    test('年収850万円以下の場合（5%控除+1,032,500円）', () => {
      // 境界値テスト: 660万円をわずかに超える場合
      const result1 = TaxCalculator.calculateNetIncome(6_601_000);
      const expectedDeduction1 = Math.floor(6_601_000 * 0.05 + 1_032_500);
      expect(expectedDeduction1).toBe(1_362_550); // 控除額の確認
      
      // 通常ケース: 800万円の場合
      const result2 = TaxCalculator.calculateNetIncome(8_000_000);
      const expectedDeduction2 = Math.floor(8_000_000 * 0.05 + 1_032_500);
      expect(expectedDeduction2).toBe(1_432_500); // 控除額の確認
    });

    test('年収850万円超の場合（控除上限195万円）', () => {
      // 境界値テスト: 850万円をわずかに超える場合
      const result1 = TaxCalculator.calculateNetIncome(8_501_000);
      expect(1_950_000).toBe(1_950_000); // 控除上限額の確認
      
      // 通常ケース: 1000万円の場合
      const result2 = TaxCalculator.calculateNetIncome(10_000_000);
      expect(1_950_000).toBe(1_950_000); // 控除上限額の確認
      
      // 高額所得ケース: 2000万円の場合
      const result3 = TaxCalculator.calculateNetIncome(20_000_000);
      expect(1_950_000).toBe(1_950_000); // 控除上限額の確認
    });
  });

  describe('医療費控除の計算', () => {
    test('医療費が10万円以下の場合', () => {
      const result = TaxCalculator.calculateNetIncome(5_000_000, 80_000);
      expect(result.medicalDeduction.deduction).toBe(0);
    });

    test('医療費が所得の5%と10万円の差額を超える場合', () => {
      const result = TaxCalculator.calculateNetIncome(5_000_000, 300_000);
      const income = 5_000_000 - (5_000_000 * 0.2 + 342_500); // 給与所得控除後
      const threshold = Math.min(100_000, income * 0.05);
      expect(result.medicalDeduction.deduction).toBe(300_000 - threshold);
    });

    test('医療費控除の上限（200万円）', () => {
      const result = TaxCalculator.calculateNetIncome(5_000_000, 2_500_000);
      expect(result.medicalDeduction.deduction).toBe(2_000_000);
    });
  });

  describe('生命保険料控除の計算', () => {
    test('一般生命保険料の控除額計算（2万円以下）', () => {
      const result = TaxCalculator.calculateNetIncome(5_000_000, 0, 0, {
        generalLifeInsurance: 15_000,
        medicalLifeInsurance: 0,
        pensionInsurance: 0,
        earthquakeInsurance: 0,
        oldLongTermInsurance: 0
      });
      expect(result.insuranceDeductions.life.generalDeduction).toBe(15_000);
    });

    test('一般生命保険料の控除額計算（4万円以下）', () => {
      const result = TaxCalculator.calculateNetIncome(5_000_000, 0, 0, {
        generalLifeInsurance: 35_000,
        medicalLifeInsurance: 0,
        pensionInsurance: 0,
        earthquakeInsurance: 0,
        oldLongTermInsurance: 0
      });
      expect(result.insuranceDeductions.life.generalDeduction).toBe(27_500); // (35,000 × 0.5 + 10,000)
    });

    test('一般生命保険料の控除額計算（8万円以下）', () => {
      const result = TaxCalculator.calculateNetIncome(5_000_000, 0, 0, {
        generalLifeInsurance: 75_000,
        medicalLifeInsurance: 0,
        pensionInsurance: 0,
        earthquakeInsurance: 0,
        oldLongTermInsurance: 0
      });
      expect(result.insuranceDeductions.life.generalDeduction).toBe(38_750); // (75,000 × 0.25 + 20,000)
    });

    test('一般生命保険料の控除額計算（8万円超）', () => {
      const result = TaxCalculator.calculateNetIncome(5_000_000, 0, 0, {
        generalLifeInsurance: 100_000,
        medicalLifeInsurance: 0,
        pensionInsurance: 0,
        earthquakeInsurance: 0,
        oldLongTermInsurance: 0
      });
      expect(result.insuranceDeductions.life.generalDeduction).toBe(40_000);
    });

    test('生命保険料控除の合計上限（12万円）', () => {
      const result = TaxCalculator.calculateNetIncome(5_000_000, 0, 0, {
        generalLifeInsurance: 100_000,
        medicalLifeInsurance: 100_000,
        pensionInsurance: 100_000,
        earthquakeInsurance: 0,
        oldLongTermInsurance: 0
      });
      expect(result.insuranceDeductions.life.total).toBe(120_000);
    });
  });

  describe('地震保険料控除の計算', () => {
    test('地震保険料の控除額計算（上限5万円）', () => {
      const result = TaxCalculator.calculateNetIncome(5_000_000, 0, 0, {
        generalLifeInsurance: 0,
        medicalLifeInsurance: 0,
        pensionInsurance: 0,
        earthquakeInsurance: 60_000,
        oldLongTermInsurance: 0
      });
      expect(result.insuranceDeductions.earthquake.deduction).toBe(50_000);
    });

    test('旧長期損害保険料の控除額計算（5,000円以下）', () => {
      const result = TaxCalculator.calculateNetIncome(5_000_000, 0, 0, {
        generalLifeInsurance: 0,
        medicalLifeInsurance: 0,
        pensionInsurance: 0,
        earthquakeInsurance: 0,
        oldLongTermInsurance: 4_000
      });
      expect(result.insuranceDeductions.earthquake.deduction).toBe(4_000);
    });

    test('旧長期損害保険料の控除額計算（15,000円以下）', () => {
      const result = TaxCalculator.calculateNetIncome(5_000_000, 0, 0, {
        generalLifeInsurance: 0,
        medicalLifeInsurance: 0,
        pensionInsurance: 0,
        earthquakeInsurance: 0,
        oldLongTermInsurance: 12_000
      });
      expect(result.insuranceDeductions.earthquake.deduction).toBe(8_500); // (12,000 × 0.5 + 2,500)
    });

    test('旧長期損害保険料の控除額計算（15,000円超）', () => {
      const result = TaxCalculator.calculateNetIncome(5_000_000, 0, 0, {
        generalLifeInsurance: 0,
        medicalLifeInsurance: 0,
        pensionInsurance: 0,
        earthquakeInsurance: 0,
        oldLongTermInsurance: 20_000
      });
      expect(result.insuranceDeductions.earthquake.deduction).toBe(10_000);
    });
  });

  describe('扶養控除の計算', () => {
    test('配偶者控除（所得48万円以下）', () => {
      const result = TaxCalculator.calculateNetIncome(5_000_000, 0, 0, {
        generalLifeInsurance: 0,
        medicalLifeInsurance: 0,
        pensionInsurance: 0,
        earthquakeInsurance: 0,
        oldLongTermInsurance: 0
      }, {
        spouse: true,
        spouseIncome: 400_000,
        elderly: 0,
        specific: 0,
        general: 0
      });
      expect(result.dependentDeduction.spouse).toBe(380_000);
    });

    test('老人扶養控除（1人48万円）', () => {
      const result = TaxCalculator.calculateNetIncome(5_000_000, 0, 0, {
        generalLifeInsurance: 0,
        medicalLifeInsurance: 0,
        pensionInsurance: 0,
        earthquakeInsurance: 0,
        oldLongTermInsurance: 0
      }, {
        spouse: false,
        spouseIncome: 0,
        elderly: 2,
        specific: 0,
        general: 0
      });
      expect(result.dependentDeduction.elderly).toBe(960_000);
    });

    test('特定扶養控除（1人63万円）', () => {
      const result = TaxCalculator.calculateNetIncome(5_000_000, 0, 0, {
        generalLifeInsurance: 0,
        medicalLifeInsurance: 0,
        pensionInsurance: 0,
        earthquakeInsurance: 0,
        oldLongTermInsurance: 0
      }, {
        spouse: false,
        spouseIncome: 0,
        elderly: 0,
        specific: 1,
        general: 0
      });
      expect(result.dependentDeduction.specific).toBe(630_000);
    });

    test('一般扶養控除（1人38万円）', () => {
      const result = TaxCalculator.calculateNetIncome(5_000_000, 0, 0, {
        generalLifeInsurance: 0,
        medicalLifeInsurance: 0,
        pensionInsurance: 0,
        earthquakeInsurance: 0,
        oldLongTermInsurance: 0
      }, {
        spouse: false,
        spouseIncome: 0,
        elderly: 0,
        specific: 0,
        general: 2
      });
      expect(result.dependentDeduction.general).toBe(760_000);
    });
  });

  describe('所得金額調整控除の計算', () => {
    test('年収850万円以下の場合は控除なし', () => {
      const result = TaxCalculator.calculateNetIncome(8_000_000, 0, 0, {
        generalLifeInsurance: 0,
        medicalLifeInsurance: 0,
        pensionInsurance: 0,
        earthquakeInsurance: 0,
        oldLongTermInsurance: 0
      }, {
        spouse: false,
        spouseIncome: 0,
        elderly: 0,
        specific: 0,
        general: 0
      }, true);
      expect(result.incomeAdjustment.deduction).toBe(0);
    });

    test('年収850万円超で特別な事情がある場合', () => {
      const result = TaxCalculator.calculateNetIncome(9_000_000, 0, 0, {
        generalLifeInsurance: 0,
        medicalLifeInsurance: 0,
        pensionInsurance: 0,
        earthquakeInsurance: 0,
        oldLongTermInsurance: 0
      }, {
        spouse: false,
        spouseIncome: 0,
        elderly: 0,
        specific: 0,
        general: 0
      }, true);
      expect(result.incomeAdjustment.deduction).toBe(50_000); // (9,000,000 - 8,500,000) × 0.1
    });
  });

  describe('ふるさと納税の限度額計算', () => {
    test('年収500万円の場合の限度額計算', () => {
      const salary = 5_000_000;
      const insurances = {
        generalLifeInsurance: 50_000,  // 控除額: 32,500円
        medicalLifeInsurance: 30_000,  // 控除額: 25,000円
        pensionInsurance: 40_000,      // 控除額: 30,000円
        earthquakeInsurance: 20_000,    // 控除額: 20,000円
        oldLongTermInsurance: 0
      };
      const dependents = {
        spouse: true,
        spouseIncome: 400_000,  // 控除額: 380,000円
        elderly: 1,             // 控除額: 480,000円
        specific: 0,
        general: 1              // 控除額: 380,000円
      };
      const result = TaxCalculator.calculateNetIncome(salary, 0, 0, insurances, dependents);
      
      // 給与所得控除額の計算（年収660万円以下の場合: 給与収入 × 10% + 702,500円）
      const salaryDeduction = salary * 0.1 + 702_500;
      
      // 課税所得の計算
      const taxableIncome = salary - salaryDeduction;
      
      // 生命保険料控除額の計算
      const lifeInsuranceDeduction = 87_500;  // 32,500 + 25,000 + 30,000
      
      // 地震保険料控除額の計算
      const earthquakeInsuranceDeduction = 20_000;

      // 扶養控除額の計算
      const dependentDeduction = 1_240_000;  // 380,000 + 480,000 + 380,000
      
      // 所得税の課税所得金額（基礎控除48万円）
      const incomeTaxBase = Math.max(0, taxableIncome - 480_000 
        - lifeInsuranceDeduction 
        - earthquakeInsuranceDeduction
        - dependentDeduction);
      
      // 住民税の課税所得金額（基礎控除43万円）
      const residentTaxBase = Math.max(0, taxableIncome - 430_000 
        - lifeInsuranceDeduction 
        - earthquakeInsuranceDeduction
        - dependentDeduction);
      
      // 限度額の計算
      const expectedLimit = Math.floor((incomeTaxBase * 0.004 + residentTaxBase * 0.006) * 2);
      
      // 詳細なデバッグ情報の出力
      console.log('\n=== 年収500万円のケース（詳細） ===');
      console.log('入力値:');
      console.log(`給与収入: ${salary.toLocaleString()}円`);
      console.log('保険料情報:', insurances);
      console.log('扶養情報:', dependents);
      
      console.log('\n計算過程:');
      console.log(`1. 給与所得控除額: ${salaryDeduction.toLocaleString()}円`);
      console.log(`2. 課税所得: ${taxableIncome.toLocaleString()}円`);
      console.log(`3. 生命保険料控除額: ${lifeInsuranceDeduction.toLocaleString()}円`);
      console.log(`4. 地震保険料控除額: ${earthquakeInsuranceDeduction.toLocaleString()}円`);
      console.log(`5. 扶養控除額: ${dependentDeduction.toLocaleString()}円`);
      console.log(`6. 所得税の課税所得金額: ${incomeTaxBase.toLocaleString()}円`);
      console.log(`7. 住民税の課税所得金額: ${residentTaxBase.toLocaleString()}円`);
      
      console.log('\n期待値と実際の値:');
      console.log(`期待される限度額: ${expectedLimit.toLocaleString()}円`);
      console.log(`実際の限度額: ${result.furusatoNozei.limit.toLocaleString()}円`);
      console.log(`差額: ${(result.furusatoNozei.limit - expectedLimit).toLocaleString()}円`);
      
      console.log('\n実際の計算式:');
      console.log(result.furusatoNozei.formula);
      
      expect(result.furusatoNozei.limit).toBe(expectedLimit);
      expect(result.furusatoNozei.formula).toContain(`所得税の課税所得金額(${incomeTaxBase.toLocaleString()}円)`);
      expect(result.furusatoNozei.formula).toContain(`住民税の課税所得金額(${residentTaxBase.toLocaleString()}円)`);
    });

    test('年収1000万円の場合の限度額計算', () => {
      const salary = 10_000_000;
      const insurances = {
        generalLifeInsurance: 100_000,  // 控除額: 40,000円（上限）
        medicalLifeInsurance: 100_000,  // 控除額: 40,000円（上限）
        pensionInsurance: 100_000,      // 控除額: 40,000円（上限）
        earthquakeInsurance: 60_000,    // 控除額: 50,000円（上限）
        oldLongTermInsurance: 0
      };
      const dependents = {
        spouse: true,
        spouseIncome: 400_000,  // 控除額: 380,000円
        elderly: 0,
        specific: 1,            // 控除額: 630,000円
        general: 1              // 控除額: 380,000円
      };
      const result = TaxCalculator.calculateNetIncome(salary, 0, 0, insurances, dependents);
      
      // 給与所得控除額の計算（上限195万円）
      const salaryDeduction = 1_950_000;
      
      // 課税所得の計算
      const taxableIncome = salary - salaryDeduction;
      
      // 生命保険料控除額の計算（上限12万円）
      const lifeInsuranceDeduction = 120_000;
      
      // 地震保険料控除額の計算（上限5万円）
      const earthquakeInsuranceDeduction = 50_000;

      // 扶養控除額の計算
      const dependentDeduction = 1_390_000;  // 380,000 + 630,000 + 380,000
      
      // 所得税の課税所得金額（基礎控除48万円）
      const incomeTaxBase = Math.max(0, taxableIncome - 480_000 
        - lifeInsuranceDeduction 
        - earthquakeInsuranceDeduction
        - dependentDeduction);
      
      // 住民税の課税所得金額（基礎控除43万円）
      const residentTaxBase = Math.max(0, taxableIncome - 430_000 
        - lifeInsuranceDeduction 
        - earthquakeInsuranceDeduction
        - dependentDeduction);
      
      // 限度額の計算
      const expectedLimit = Math.floor((incomeTaxBase * 0.004 + residentTaxBase * 0.006) * 2);
      
      expect(result.furusatoNozei.limit).toBe(expectedLimit);
      expect(result.furusatoNozei.formula).toContain(`所得税の課税所得金額(${incomeTaxBase.toLocaleString()}円)`);
      expect(result.furusatoNozei.formula).toContain(`住民税の課税所得金額(${residentTaxBase.toLocaleString()}円)`);

      // 計算過程の確認
      console.log('\n年収1000万円のケース:');
      console.log(`給与所得控除額: ${salaryDeduction.toLocaleString()}円`);
      console.log(`課税所得: ${taxableIncome.toLocaleString()}円`);
      console.log(`生命保険料控除額: ${lifeInsuranceDeduction.toLocaleString()}円`);
      console.log(`地震保険料控除額: ${earthquakeInsuranceDeduction.toLocaleString()}円`);
      console.log(`扶養控除額: ${dependentDeduction.toLocaleString()}円`);
      console.log(`所得税の課税所得金額: ${incomeTaxBase.toLocaleString()}円`);
      console.log(`住民税の課税所得金額: ${residentTaxBase.toLocaleString()}円`);
      console.log(`期待される限度額: ${expectedLimit.toLocaleString()}円`);
      console.log(`実際の限度額: ${result.furusatoNozei.limit.toLocaleString()}円`);
    });

    test('医療費控除がある場合の限度額計算', () => {
      const salary = 5_000_000;
      const medicalExpenses = 300_000;
      const insurances = {
        generalLifeInsurance: 50_000,  // 控除額: 32,500円
        medicalLifeInsurance: 30_000,  // 控除額: 25,000円
        pensionInsurance: 40_000,      // 控除額: 30,000円
        earthquakeInsurance: 20_000,    // 控除額: 20,000円
        oldLongTermInsurance: 0
      };
      const dependents = {
        spouse: true,
        spouseIncome: 400_000,  // 控除額: 380,000円
        elderly: 0,
        specific: 0,
        general: 1              // 控除額: 380,000円
      };
      const result = TaxCalculator.calculateNetIncome(salary, medicalExpenses, 0, insurances, dependents);
      
      // 給与所得控除額の計算（年収660万円以下の場合: 給与収入 × 10% + 702,500円）
      const salaryDeduction = salary * 0.1 + 702_500;
      
      // 課税所得の計算
      const taxableIncome = salary - salaryDeduction;
      
      // 医療費控除額の計算
      const medicalDeductionThreshold = Math.min(100_000, taxableIncome * 0.05);
      const medicalDeduction = Math.min(2_000_000, Math.max(0, medicalExpenses - medicalDeductionThreshold));
      
      // 生命保険料控除額の計算
      const lifeInsuranceDeduction = 87_500;  // 32,500 + 25,000 + 30,000
      
      // 地震保険料控除額の計算
      const earthquakeInsuranceDeduction = 20_000;

      // 扶養控除額の計算
      const dependentDeduction = 760_000;  // 380,000 + 380,000
      
      // 所得税の課税所得金額（基礎控除48万円）
      const incomeTaxBase = Math.max(0, taxableIncome - 480_000 
        - medicalDeduction 
        - lifeInsuranceDeduction 
        - earthquakeInsuranceDeduction
        - dependentDeduction);
      
      // 住民税の課税所得金額（基礎控除43万円）
      const residentTaxBase = Math.max(0, taxableIncome - 430_000 
        - medicalDeduction 
        - lifeInsuranceDeduction 
        - earthquakeInsuranceDeduction
        - dependentDeduction);
      
      // 限度額の計算
      const expectedLimit = Math.floor((incomeTaxBase * 0.004 + residentTaxBase * 0.006) * 2);
      
      // 詳細なデバッグ情報の出力
      console.log('\n=== 医療費控除ありのケース（詳細） ===');
      console.log('入力値:');
      console.log(`給与収入: ${salary.toLocaleString()}円`);
      console.log(`医療費: ${medicalExpenses.toLocaleString()}円`);
      console.log('保険料情報:', insurances);
      console.log('扶養情報:', dependents);
      
      console.log('\n計算過程:');
      console.log(`1. 給与所得控除額: ${salaryDeduction.toLocaleString()}円`);
      console.log(`2. 課税所得: ${taxableIncome.toLocaleString()}円`);
      console.log(`3. 医療費控除額: ${medicalDeduction.toLocaleString()}円`);
      console.log(`4. 生命保険料控除額: ${lifeInsuranceDeduction.toLocaleString()}円`);
      console.log(`5. 地震保険料控除額: ${earthquakeInsuranceDeduction.toLocaleString()}円`);
      console.log(`6. 扶養控除額: ${dependentDeduction.toLocaleString()}円`);
      console.log(`7. 所得税の課税所得金額: ${incomeTaxBase.toLocaleString()}円`);
      console.log(`8. 住民税の課税所得金額: ${residentTaxBase.toLocaleString()}円`);
      
      console.log('\n期待値と実際の値:');
      console.log(`期待される限度額: ${expectedLimit.toLocaleString()}円`);
      console.log(`実際の限度額: ${result.furusatoNozei.limit.toLocaleString()}円`);
      console.log(`差額: ${(result.furusatoNozei.limit - expectedLimit).toLocaleString()}円`);
      
      console.log('\n実際の計算式:');
      console.log(result.furusatoNozei.formula);
      
      expect(result.furusatoNozei.limit).toBe(expectedLimit);
      expect(result.furusatoNozei.formula).toContain(`所得税の課税所得金額(${incomeTaxBase.toLocaleString()}円)`);
      expect(result.furusatoNozei.formula).toContain(`住民税の課税所得金額(${residentTaxBase.toLocaleString()}円)`);
    });
  });
}); 