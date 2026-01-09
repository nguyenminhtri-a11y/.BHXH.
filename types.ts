export enum AppMode {
  RETIREMENT = 'Hưu trí',
  ONE_TIME = 'BHXH một lần',
  MATERNITY = 'Thai sản',
  SICKNESS = 'Ốm đau',
  DEATH = 'Tử tuất',
  ACCIDENT = 'TNLĐ-BNN'
}

export enum Gender {
  MALE = 'Nam',
  FEMALE = 'Nữ'
}

export enum Sector {
  PUBLIC = 'Nhà nước',
  PRIVATE = 'Tư nhân'
}

export enum WorkingCondition {
  NORMAL = 'Bình thường',
  HEAVY = 'Nặng nhọc',
  SPECIAL = 'Đặc biệt nặng nhọc'
}

export interface SalaryPeriod {
  from: string; // mm/yyyy
  to: string; // mm/yyyy
  salary: number;
}

export interface UserData {
  // Common
  full_name: string;
  gender: Gender;
  dob: string; // yyyy-mm-dd
  join_date: string; // yyyy-mm-dd
  working_condition: WorkingCondition;
  sector: Sector;
  salary_history: SalaryPeriod[];
  current_salary: number; // Simplified input for immediate calc or manual override
  calculated_avg_salary_ui?: number; // Auto-calculated field for UI display
  total_years_contribution: number;
  is_military: boolean;
  base_salary_2026: number; // Mức tham chiếu

  // Retirement Specific
  is_early_retirement?: boolean;
  disability_rate?: number;
  lump_sum_option?: boolean;
  expected_retirement_date?: string;

  // One Time Specific
  withdrawal_reason?: string;
  is_part_withdrawal?: boolean;
  unemployment_benefits_months?: number;

  // Maternity
  maternity_event?: string;
  delivery_date?: string;
  num_babies?: number;
  delivery_method?: string;
  avg_salary_6m?: number;

  // Sickness
  sickness_type?: string;
  leave_days?: number;
  work_schedule?: string;

  // Death
  death_reason?: string;
  dependents_count?: number;
  dependent_income?: boolean;
  
  // Accident / Disease
  is_occupational_disease?: boolean; // Toggle between Accident vs Disease
  accident_date?: string;
  accident_location?: string;
  accident_rate?: number; // % suy giảm
  accident_salary_prev_month?: number;
  // Disease specific
  disease_name?: string;
  disease_date_detected?: string;
  treatment_hospital?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}