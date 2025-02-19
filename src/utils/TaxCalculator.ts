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
   * 所得税額を計算
   * @param salary 年間給与収入
   * @param medicalExpenses 年間医療費
   * @returns 所得税額（復興特別所得税を含む）
   */
  public static calculateIncomeTax(salary: number, medicalExpenses: number = 0): {
    tax: number;
    medicalDeduction: {
      deduction: number;
      threshold: number;
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

    // 復興特別所得税を加算（所得税額の2.1%）
    return {
      tax: Math.floor(tax * 1.021),
      medicalDeduction
    };
  }

  /**
   * 住民税額を計算（均等割含む）
   * @param salary 年間給与収入
   * @param medicalExpenses 年間医療費
   * @returns 住民税額
   */
  public static calculateResidentTax(salary: number, medicalExpenses: number = 0): number {
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

    // 均等割額を加算（標準額：都道府県民税1,500円、市町村民税3,500円の合計5,000円）
    return Math.floor(incomeTax + 5_000);
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
   * 年収から手取り額を計算
   * @param salary 年間給与収入
   * @param medicalExpenses 年間医療費
   * @returns 手取り額（概算）
   */
  public static calculateNetIncome(salary: number, medicalExpenses: number = 0): {
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
    netIncome: number;
  } {
    const { tax: incomeTax, medicalDeduction } = this.calculateIncomeTax(salary, medicalExpenses);
    const residentTax = this.calculateResidentTax(salary, medicalExpenses);
    const insurance = this.calculateInsurance(salary);
    
    return {
      salary,
      incomeTax,
      residentTax,
      insurance,
      medicalExpenses,
      medicalDeduction,
      netIncome: salary - incomeTax - residentTax - insurance.total
    };
  }
} 