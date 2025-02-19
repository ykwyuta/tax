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
   * 所得税額を計算
   * @param salary 年間給与収入
   * @returns 所得税額（復興特別所得税を含む）
   */
  public static calculateIncomeTax(salary: number): number {
    // 給与所得控除を適用
    const salaryDeduction = this.calculateSalaryDeduction(salary);
    // 給与所得
    const taxableIncome = salary - salaryDeduction;
    // 基礎控除（48万円）を適用
    const taxableIncomeAfterBasicDeduction = Math.max(0, taxableIncome - 480_000);

    // 税率による所得税額の計算
    let tax = 0;
    if (taxableIncomeAfterBasicDeduction <= 1_950_000) {
      tax = taxableIncomeAfterBasicDeduction * 0.05;
    } else if (taxableIncomeAfterBasicDeduction <= 3_300_000) {
      tax = taxableIncomeAfterBasicDeduction * 0.1 - 97_500;
    } else if (taxableIncomeAfterBasicDeduction <= 6_950_000) {
      tax = taxableIncomeAfterBasicDeduction * 0.2 - 427_500;
    } else if (taxableIncomeAfterBasicDeduction <= 9_000_000) {
      tax = taxableIncomeAfterBasicDeduction * 0.23 - 636_000;
    } else if (taxableIncomeAfterBasicDeduction <= 18_000_000) {
      tax = taxableIncomeAfterBasicDeduction * 0.33 - 1_536_000;
    } else if (taxableIncomeAfterBasicDeduction <= 40_000_000) {
      tax = taxableIncomeAfterBasicDeduction * 0.4 - 2_796_000;
    } else {
      tax = taxableIncomeAfterBasicDeduction * 0.45 - 4_796_000;
    }

    // 復興特別所得税を加算（所得税額の2.1%）
    return Math.floor(tax * 1.021);
  }

  /**
   * 住民税額を計算（均等割含む）
   * @param salary 年間給与収入
   * @returns 住民税額
   */
  public static calculateResidentTax(salary: number): number {
    // 給与所得控除を適用
    const salaryDeduction = this.calculateSalaryDeduction(salary);
    // 給与所得
    const taxableIncome = salary - salaryDeduction;
    // 基礎控除（43万円）を適用
    const taxableIncomeAfterBasicDeduction = Math.max(0, taxableIncome - 430_000);

    // 所得割の計算（標準税率：都道府県民税4%、市町村民税6%の合計10%）
    const incomeTax = taxableIncomeAfterBasicDeduction * 0.1;

    // 均等割額を加算（標準額：都道府県民税1,500円、市町村民税3,500円の合計5,000円）
    return Math.floor(incomeTax + 5_000);
  }

  /**
   * 年収から手取り額を計算
   * @param salary 年間給与収入
   * @returns 手取り額（概算）
   */
  public static calculateNetIncome(salary: number): {
    salary: number;
    incomeTax: number;
    residentTax: number;
    netIncome: number;
  } {
    const incomeTax = this.calculateIncomeTax(salary);
    const residentTax = this.calculateResidentTax(salary);
    
    // 社会保険料は簡易計算（給与の約15%と仮定）
    const insurancePremium = Math.floor(salary * 0.15);
    
    return {
      salary,
      incomeTax,
      residentTax,
      netIncome: salary - incomeTax - residentTax - insurancePremium
    };
  }
} 