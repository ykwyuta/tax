/**
 * 給与所得税・住民税計算クラス
 */
export class TaxCalculator {
  /**
   * 給与所得控除額を計算
   * @param salary 年間給与収入
   * @returns 給与所得控除額
   */
  private static calculateSalaryDeduction(salary: number): number {
    if (salary <= 1_625_000) {
      return Math.min(550_000, salary * 0.4);
    } else if (salary <= 1_800_000) {
      return salary * 0.3 + 162_500;
    } else if (salary <= 3_600_000) {
      return salary * 0.2 + 342_500;
    } else if (salary <= 6_600_000) {
      return salary * 0.1 + 702_500;
    } else if (salary <= 8_500_000) {
      return salary * 0.05 + 1_032_500;
    } else {
      return 1_950_000; // 給与所得控除の上限
    }
  }

  /**
   * 医療費控除額を計算
   * @param medicalExpenses 年間医療費
   * @param income 所得金額
   * @returns 医療費控除額
   */
  private static calculateMedicalDeduction(medicalExpenses: number, income: number): {
    deduction: number;
    threshold: number;
    formula: string;
  } {
    if (medicalExpenses <= 0) {
      return {
        deduction: 0,
        threshold: 0,
        formula: "医療費控除 = 0（医療費の支払いなし）"
      };
    }

    // 所得の5%と10万円のいずれか少ない方を計算
    const incomeThreshold = Math.floor(income * 0.05);
    const threshold = Math.min(100_000, incomeThreshold);
    
    // 控除額を計算（上限200万円）
    const deduction = Math.min(2_000_000, Math.max(0, medicalExpenses - threshold));

    return {
      deduction,
      threshold,
      formula: `医療費控除 = min(2,000,000, max(0, ${medicalExpenses.toLocaleString()}円 - ${threshold.toLocaleString()}円)) = ${deduction.toLocaleString()}円`
    };
  }

  /**
   * 住宅ローン控除を計算
   * @param loanBalance 住宅ローン残高
   * @returns 住宅ローン控除額の内訳
   */
  private static calculateHousingLoanDeduction(loanBalance: number): {
    totalDeduction: number;
    incomeTaxDeduction: number;
    residentTaxDeduction: number;
    formula: string;
  } {
    if (loanBalance <= 0) {
      return {
        totalDeduction: 0,
        incomeTaxDeduction: 0,
        residentTaxDeduction: 0,
        formula: "住宅ローン控除 = 0（住宅ローンなし）"
      };
    }

    // 控除額の計算（住宅ローン残高の1%、上限40万円）
    const totalDeduction = Math.min(400_000, Math.floor(loanBalance * 0.01));
    
    return {
      totalDeduction,
      incomeTaxDeduction: totalDeduction,  // 所得税からの控除額（実際の適用は所得税額を上限とする）
      residentTaxDeduction: Math.min(136_500, totalDeduction),  // 住民税からの控除可能額（上限13.65万円）
      formula: `住宅ローン控除額 = min(400,000, ${loanBalance.toLocaleString()}円 × 1%) = ${totalDeduction.toLocaleString()}円`
    };
  }

  /**
   * 所得税額を計算
   * @param salary 年間給与収入
   * @param medicalExpenses 年間医療費
   * @param loanBalance 住宅ローン残高
   * @returns 所得税額（復興特別所得税を含む）
   */
  public static calculateIncomeTax(salary: number, medicalExpenses: number = 0, loanBalance: number = 0): {
    tax: number;
    medicalDeduction: {
      deduction: number;
      threshold: number;
      formula: string;
    };
    housingLoanDeduction: {
      totalDeduction: number;
      incomeTaxDeduction: number;
      residentTaxDeduction: number;
      formula: string;
    };
  } {
    // 給与所得控除を適用
    const salaryDeduction = this.calculateSalaryDeduction(salary);
    // 給与所得
    const taxableIncome = salary - salaryDeduction;

    // 医療費控除を計算
    const medicalDeduction = this.calculateMedicalDeduction(medicalExpenses, taxableIncome);

    // 基礎控除（48万円）と医療費控除を適用
    const taxableIncomeAfterDeductions = Math.max(0, taxableIncome - 480_000 - medicalDeduction.deduction);

    // 税率による所得税額の計算
    let tax = 0;
    if (taxableIncomeAfterDeductions <= 1_950_000) {
      tax = taxableIncomeAfterDeductions * 0.05;
    } else if (taxableIncomeAfterDeductions <= 3_300_000) {
      tax = taxableIncomeAfterDeductions * 0.1 - 97_500;
    } else if (taxableIncomeAfterDeductions <= 6_950_000) {
      tax = taxableIncomeAfterDeductions * 0.2 - 427_500;
    } else if (taxableIncomeAfterDeductions <= 9_000_000) {
      tax = taxableIncomeAfterDeductions * 0.23 - 636_000;
    } else if (taxableIncomeAfterDeductions <= 18_000_000) {
      tax = taxableIncomeAfterDeductions * 0.33 - 1_536_000;
    } else if (taxableIncomeAfterDeductions <= 40_000_000) {
      tax = taxableIncomeAfterDeductions * 0.4 - 2_796_000;
    } else {
      tax = taxableIncomeAfterDeductions * 0.45 - 4_796_000;
    }

    // 住宅ローン控除を計算
    const housingLoanDeduction = this.calculateHousingLoanDeduction(loanBalance);
    
    // 所得税から控除（控除額は所得税額が上限）
    const finalTax = Math.max(0, Math.floor(tax * 1.021) - housingLoanDeduction.incomeTaxDeduction);
    
    return {
      tax: finalTax,
      medicalDeduction,
      housingLoanDeduction
    };
  }

  /**
   * 住民税額を計算（均等割含む）
   * @param salary 年間給与収入
   * @param medicalExpenses 年間医療費
   * @param loanBalance 住宅ローン残高
   * @param incomeTaxDeduction 所得税で控除された住宅ローン控除額
   * @returns 住民税額
   */
  public static calculateResidentTax(
    salary: number, 
    medicalExpenses: number = 0, 
    loanBalance: number = 0,
    incomeTaxDeduction: number = 0
  ): {
    tax: number;
    housingLoanDeduction: number;
  } {
    // 給与所得控除を適用
    const salaryDeduction = this.calculateSalaryDeduction(salary);
    // 給与所得
    const taxableIncome = salary - salaryDeduction;
    // 医療費控除を計算
    const medicalDeduction = this.calculateMedicalDeduction(medicalExpenses, taxableIncome);
    // 基礎控除（43万円）と医療費控除を適用
    const taxableIncomeAfterDeductions = Math.max(0, taxableIncome - 430_000 - medicalDeduction.deduction);

    // 所得割の計算（標準税率：都道府県民税4%、市町村民税6%の合計10%）
    const incomeTax = taxableIncomeAfterDeductions * 0.1;

    // 住宅ローン控除の住民税への振り替え
    const housingLoanDeduction = this.calculateHousingLoanDeduction(loanBalance);
    const remainingDeduction = Math.max(0, housingLoanDeduction.totalDeduction - incomeTaxDeduction);
    const residentTaxDeduction = Math.min(housingLoanDeduction.residentTaxDeduction, remainingDeduction);

    return {
      tax: Math.max(0, Math.floor(incomeTax + 5_000) - residentTaxDeduction),
      housingLoanDeduction: residentTaxDeduction
    };
  }

  /**
   * 標準報酬月額を計算
   * @param monthlyIncome 月収
   * @returns 標準報酬月額
   */
  private static calculateStandardMonthlyRemuneration(monthlyIncome: number): number {
    const ranges = [
      { min: 0, max: 63_000, standard: 58_000 },
      { min: 63_000, max: 73_000, standard: 68_000 },
      { min: 73_000, max: 83_000, standard: 78_000 },
      { min: 83_000, max: 93_000, standard: 88_000 },
      { min: 93_000, max: 101_000, standard: 98_000 },
      { min: 101_000, max: 107_000, standard: 104_000 },
      { min: 107_000, max: 114_000, standard: 110_000 },
      { min: 114_000, max: 122_000, standard: 118_000 },
      { min: 122_000, max: 130_000, standard: 126_000 },
      { min: 130_000, max: 138_000, standard: 134_000 },
      { min: 138_000, max: 146_000, standard: 142_000 },
      { min: 146_000, max: 155_000, standard: 150_000 },
      { min: 155_000, max: 165_000, standard: 160_000 },
      { min: 165_000, max: 175_000, standard: 170_000 },
      { min: 175_000, max: 185_000, standard: 180_000 },
      { min: 185_000, max: 195_000, standard: 190_000 },
      { min: 195_000, max: 210_000, standard: 200_000 },
      { min: 210_000, max: 230_000, standard: 220_000 },
      { min: 230_000, max: 250_000, standard: 240_000 },
      { min: 250_000, max: 270_000, standard: 260_000 },
      { min: 270_000, max: 290_000, standard: 280_000 },
      { min: 290_000, max: 310_000, standard: 300_000 },
      { min: 310_000, max: 330_000, standard: 320_000 },
      { min: 330_000, max: 350_000, standard: 340_000 },
      { min: 350_000, max: 370_000, standard: 360_000 },
      { min: 370_000, max: 395_000, standard: 380_000 },
      { min: 395_000, max: 425_000, standard: 410_000 },
      { min: 425_000, max: 455_000, standard: 440_000 },
      { min: 455_000, max: 485_000, standard: 470_000 },
      { min: 485_000, max: 515_000, standard: 500_000 },
      { min: 515_000, max: 545_000, standard: 530_000 },
      { min: 545_000, max: 575_000, standard: 560_000 },
      { min: 575_000, max: 605_000, standard: 590_000 },
      { min: 605_000, max: 635_000, standard: 620_000 },
      { min: 635_000, max: 665_000, standard: 650_000 },
      { min: 665_000, max: 695_000, standard: 680_000 },
      { min: 695_000, max: 730_000, standard: 710_000 },
      { min: 730_000, max: 770_000, standard: 750_000 },
      { min: 770_000, max: 810_000, standard: 790_000 },
      { min: 810_000, max: 855_000, standard: 830_000 },
      { min: 855_000, max: 905_000, standard: 880_000 },
      { min: 905_000, max: 955_000, standard: 930_000 },
      { min: 955_000, max: 1_005_000, standard: 980_000 },
      { min: 1_005_000, max: 1_055_000, standard: 1_030_000 },
      { min: 1_055_000, max: 1_115_000, standard: 1_090_000 },
      { min: 1_115_000, max: 1_175_000, standard: 1_150_000 },
      { min: 1_175_000, max: Infinity, standard: 1_210_000 }
    ];

    for (const range of ranges) {
      if (monthlyIncome >= range.min && monthlyIncome < range.max) {
        return range.standard;
      }
    }
    return ranges[ranges.length - 1].standard;
  }

  /**
   * 社会保険料を計算
   * @param salary 年間給与収入
   * @returns 社会保険料の内訳と合計
   */
  public static calculateInsurance(salary: number): {
    healthInsurance: number;
    pensionInsurance: number;
    employmentInsurance: number;
    total: number;
    standardMonthlyRemuneration: number;
  } {
    // 月収の概算（賞与を含まない場合の単純な12分の1）
    const monthlyIncome = Math.floor(salary / 12);
    
    // 標準報酬月額の決定
    const standardMonthlyRemuneration = this.calculateStandardMonthlyRemuneration(monthlyIncome);

    // 健康保険料（東京都の場合：9.81%）
    // 労働者負担分は折半で4.905%
    const healthInsuranceRate = 0.04905;
    const healthInsurance = Math.floor(standardMonthlyRemuneration * healthInsuranceRate * 12);

    // 厚生年金保険料（18.3%）
    // 労働者負担分は折半で9.15%
    const pensionInsuranceRate = 0.0915;
    const pensionInsurance = Math.floor(standardMonthlyRemuneration * pensionInsuranceRate * 12);

    // 雇用保険料（一般の事業の場合：0.9%）
    const employmentInsuranceRate = 0.009;
    const employmentInsurance = Math.floor(salary * employmentInsuranceRate);

    // 合計
    const total = healthInsurance + pensionInsurance + employmentInsurance;

    return {
      healthInsurance,
      pensionInsurance,
      employmentInsurance,
      total,
      standardMonthlyRemuneration
    };
  }

  /**
   * ふるさと納税の限度額を計算
   * @param salary 年間給与収入
   * @param medicalExpenses 年間医療費
   * @returns ふるさと納税の限度額と計算式
   */
  public static calculateFurusatoNozeiLimit(salary: number, medicalExpenses: number = 0): {
    limit: number;
    formula: string;
  } {
    // 給与所得控除を適用
    const salaryDeduction = this.calculateSalaryDeduction(salary);
    // 給与所得
    const taxableIncome = salary - salaryDeduction;
    // 医療費控除を計算
    const medicalDeduction = this.calculateMedicalDeduction(medicalExpenses, taxableIncome);

    // 所得税の課税所得金額（基礎控除48万円）
    const incomeTaxBase = Math.max(0, taxableIncome - 480_000 - medicalDeduction.deduction);
    // 住民税の課税所得金額（基礎控除43万円）
    const residentTaxBase = Math.max(0, taxableIncome - 430_000 - medicalDeduction.deduction);

    // 限度額の計算
    const incomeTaxPortion = incomeTaxBase * 0.2;
    const residentTaxPortion = residentTaxBase * 0.016;
    const limit = Math.floor((incomeTaxPortion + residentTaxPortion) * 5);

    return {
      limit,
      formula: `ふるさと納税の限度額 = (所得税の課税所得金額(${incomeTaxBase.toLocaleString()}円) × 20% + 住民税の課税所得金額(${residentTaxBase.toLocaleString()}円) × 1.6%) × 5 = ${limit.toLocaleString()}円`
    };
  }

  /**
   * 年収から手取り額を計算
   * @param salary 年間給与収入
   * @param medicalExpenses 年間医療費
   * @param loanBalance 住宅ローン残高
   * @returns 手取り額（概算）
   */
  public static calculateNetIncome(
    salary: number, 
    medicalExpenses: number = 0,
    loanBalance: number = 0
  ): {
    salary: number;
    incomeTax: number;
    residentTax: number;
    insurance: {
      healthInsurance: number;
      pensionInsurance: number;
      employmentInsurance: number;
      total: number;
      standardMonthlyRemuneration: number;
    };
    medicalExpenses: number;
    medicalDeduction: {
      deduction: number;
      threshold: number;
      formula: string;
    };
    housingLoan: {
      balance: number;
      deduction: {
        total: number;
        incomeTax: number;
        residentTax: number;
        formula: string;
      };
    };
    furusatoNozei: {
      limit: number;
      formula: string;
    };
    netIncome: number;
  } {
    const { tax: incomeTax, medicalDeduction, housingLoanDeduction } = 
      this.calculateIncomeTax(salary, medicalExpenses, loanBalance);
    const { tax: residentTax, housingLoanDeduction: residentTaxDeduction } = 
      this.calculateResidentTax(salary, medicalExpenses, loanBalance, housingLoanDeduction.incomeTaxDeduction);
    const insurance = this.calculateInsurance(salary);
    const furusatoNozei = this.calculateFurusatoNozeiLimit(salary, medicalExpenses);
    
    return {
      salary,
      incomeTax,
      residentTax,
      insurance,
      medicalExpenses,
      medicalDeduction,
      housingLoan: {
        balance: loanBalance,
        deduction: {
          total: housingLoanDeduction.totalDeduction,
          incomeTax: housingLoanDeduction.incomeTaxDeduction,
          residentTax: residentTaxDeduction,
          formula: housingLoanDeduction.formula
        }
      },
      furusatoNozei,
      netIncome: salary - incomeTax - residentTax - insurance.total
    };
  }
} 