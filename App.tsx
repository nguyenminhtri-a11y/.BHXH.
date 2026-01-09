import React, { useState, useEffect, useRef } from 'react';
import LayoutHeader from './components/LayoutHeader';
import ChatAssistant from './components/ChatAssistant';
import MarkdownRenderer from './components/MarkdownRenderer';
import Tooltip from './components/Tooltip';
import { calculateBenefit } from './services/geminiService';
import { AppMode, UserData, Gender, Sector, WorkingCondition, SalaryPeriod } from './types';

// Redesigned "Beautiful" Icons for Sidebar
const TabIcons: Record<AppMode, React.ReactNode> = {
  [AppMode.RETIREMENT]: (
    <div className="bg-blue-100 p-1.5 rounded-lg text-blue-700">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
        <path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
      </svg>
    </div>
  ),
  [AppMode.ONE_TIME]: (
    <div className="bg-green-100 p-1.5 rounded-lg text-green-700">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M10.464 8.746c.927-1.27 2.228-2.377 3.81-3.237a.75.75 0 011.08.732v1.033c0 .84-.375 1.622-1.016 2.145l-4.706 3.85a.75.75 0 00-.012 1.157l2.193 2.287c.75.782 1.932.782 2.682 0l2.365-2.466a.75.75 0 011.084 1.039l-2.365 2.466a3.75 3.75 0 01-5.388 0l-2.193-2.288a2.25 2.25 0 01.035-3.47l3.826-3.131z" />
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.125 4.5a4.125 4.125 0 102.338 7.524l2.007 2.006a.75.75 0 101.06-1.06l-2.006-2.007a4.125 4.125 0 00-3.399-6.463z" clipRule="evenodd" />
      </svg>
    </div>
  ),
  [AppMode.MATERNITY]: (
    <div className="bg-pink-100 p-1.5 rounded-lg text-pink-600">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
    </div>
  ),
  [AppMode.SICKNESS]: (
    <div className="bg-yellow-100 p-1.5 rounded-lg text-yellow-700">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
      </svg>
    </div>
  ),
  [AppMode.DEATH]: (
    <div className="bg-gray-200 p-1.5 rounded-lg text-gray-700">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
         <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-6 9a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
      </svg>
    </div>
  ),
  [AppMode.ACCIDENT]: (
    <div className="bg-red-100 p-1.5 rounded-lg text-red-700">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path fillRule="evenodd" d="M11.484 2.17a.75.75 0 011.032 0 11.209 11.209 0 007.877 3.08.75.75 0 01.722.515 12.74 12.74 0 01.635 3.985c0 5.942-4.064 10.933-9.563 12.348a.749.749 0 01-.374 0C6.314 20.683 2.25 15.692 2.25 9.75c0-1.39.223-2.73.635-3.985a.75.75 0 01.722-.516 11.208 11.208 0 007.877-3.08zM12 6.972a.75.75 0 01.75.75v2.06h2.06a.75.75 0 010 1.5h-2.06v2.06a.75.75 0 01-1.5 0v-2.06h-2.06a.75.75 0 010-1.5h2.06v-2.06a.75.75 0 01.75-.75z" clipRule="evenodd" />
      </svg>
    </div>
  ),
};

function App() {
  const [activeTab, setActiveTab] = useState<AppMode>(AppMode.RETIREMENT);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Form State
  const [userData, setUserData] = useState<UserData>({
    full_name: '',
    gender: Gender.FEMALE,
    dob: '',
    join_date: '',
    working_condition: WorkingCondition.NORMAL,
    sector: Sector.PRIVATE,
    salary_history: [],
    current_salary: 0,
    calculated_avg_salary_ui: 0,
    total_years_contribution: 0,
    is_military: false,
    base_salary_2026: 2430000, 
    is_occupational_disease: false, 
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setUserData(prev => ({ ...prev, [name]: val }));
  };

  // Handler for Salary History (handles type="month")
  const handleSalaryHistoryChange = (index: number, field: keyof SalaryPeriod, value: any) => {
    const newHistory = [...userData.salary_history];
    newHistory[index] = { ...newHistory[index], [field]: value };
    setUserData(prev => ({ ...prev, salary_history: newHistory }));
  };

  const addSalaryPeriod = () => {
    setUserData(prev => ({
      ...prev,
      salary_history: [...prev.salary_history, { from: '', to: '', salary: 0 }]
    }));
  };

  const removeSalaryPeriod = (index: number) => {
    const newHistory = userData.salary_history.filter((_, i) => i !== index);
    setUserData(prev => ({ ...prev, salary_history: newHistory }));
  };

  useEffect(() => {
    if (userData.salary_history.length > 0) {
      const totalSalary = userData.salary_history.reduce((sum, item) => sum + Number(item.salary), 0);
      const avg = totalSalary / userData.salary_history.length;
      
      let totalMonths = 0;
      userData.salary_history.forEach(period => {
          if (period.from && period.to) {
              // Parse yyyy-mm from HTML5 month input
              const partsFrom = period.from.split('-');
              const partsTo = period.to.split('-');
              
              if (partsFrom.length === 2 && partsTo.length === 2) {
                  const fYear = parseInt(partsFrom[0]);
                  const fMonth = parseInt(partsFrom[1]);
                  const tYear = parseInt(partsTo[0]);
                  const tMonth = parseInt(partsTo[1]);
                  
                  if (!isNaN(fYear) && !isNaN(fMonth) && !isNaN(tYear) && !isNaN(tMonth)) {
                      const months = (tYear - fYear) * 12 + (tMonth - fMonth) + 1;
                      if (months > 0) totalMonths += months;
                  }
              }
          }
      });
      
      const years = Math.floor(totalMonths / 12);
      const remainingMonths = totalMonths % 12;
      
      setUserData(prev => ({ 
          ...prev, 
          calculated_avg_salary_ui: avg,
          total_years_contribution: years + (remainingMonths / 12) 
      }));

    } else {
        setUserData(prev => ({ ...prev, calculated_avg_salary_ui: 0, total_years_contribution: 0 }));
    }
  }, [userData.salary_history]);

  const handleCalculate = async () => {
    setLoading(true);
    setResult(null);
    try {
      // Helper to convert yyyy-mm-dd to dd/mm/yyyy for AI friendliness
      const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
      };
      
      // Helper to convert yyyy-mm to mm/yyyy for AI friendliness
      const formatMonth = (monthStr: string) => {
        if (!monthStr) return '';
        const [y, m] = monthStr.split('-');
        return `${m}/${y}`;
      };

      const formattedUserData = { 
        ...userData,
        dob: formatDate(userData.dob),
        join_date: formatDate(userData.join_date),
        delivery_date: formatDate(userData.delivery_date),
        accident_date: formatDate(userData.accident_date),
        disease_date_detected: formatDate(userData.disease_date_detected),
        salary_history: userData.salary_history.map(p => ({
            ...p,
            from: formatMonth(p.from),
            to: formatMonth(p.to)
        }))
      };

      const response = await calculateBenefit(formattedUserData, activeTab);
      setResult(response);
      
      // Auto-scroll to result on mobile after calculation
      setTimeout(() => {
        if (window.innerWidth < 768 && resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

    } catch (error) {
      setResult("Đã xảy ra lỗi trong quá trình tính toán. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = Object.values(AppMode);

  const displayTotalTime = () => {
      const val = userData.total_years_contribution || 0;
      const years = Math.floor(val);
      const months = Math.round((val - years) * 12);
      if (years === 0 && months === 0) return "0 năm";
      return `${years} năm ${months > 0 ? months + ' tháng' : ''}`;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <LayoutHeader />

      {/* Main Container - Mobile: Scrollable Vertical Stack | Desktop: Fixed Split Pane */}
      <main className="flex-1 flex flex-col md:flex-row relative md:overflow-hidden overflow-y-auto scroll-smooth">
        
        {/* COLUMN 1: NAVIGATION SIDEBAR */}
        <div className="w-full md:w-48 bg-white border-r border-gray-200 flex flex-col shadow-sm z-30 flex-none md:h-full h-auto sticky top-0 md:static">
          <div className="p-3 md:p-4 bg-pro-blue text-white font-bold text-center text-xs uppercase tracking-wider">
            Các chế độ BHXH
          </div>
          <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto scrollbar-hide bg-white">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setResult(null); }}
                className={`p-3 text-left whitespace-nowrap md:whitespace-normal transition-all text-xs flex items-center gap-2 md:gap-3 border-b border-gray-100 ${
                  activeTab === tab 
                    ? 'bg-blue-50 text-pro-blue font-bold border-b-4 md:border-b-0 md:border-l-4 border-pro-blue' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-pro-blue md:border-l-4 md:border-l-transparent'
                }`}
              >
                <span className="flex-shrink-0">
                    {TabIcons[tab]}
                </span>
                <span>{tab}</span>
              </button>
            ))}
          </div>
          <div className="mt-auto p-4 text-[9px] text-center text-gray-400 bg-gray-50 border-t border-gray-200 hidden md:block leading-tight">
             © 2026 Thầy Trí - AGVC <br/>
             Email: nmtri@agvc.edu.vn
          </div>
        </div>

        {/* COLUMN 2: INPUT FORM */}
        <div className="w-full md:w-[280px] lg:w-[320px] bg-white border-r border-gray-200 flex flex-col shadow-lg z-20 flex-none md:h-full h-auto">
          <div className="md:flex-1 md:overflow-y-auto p-4 bg-gray-50 custom-scrollbar">
            <h2 className="text-lg font-bold text-pro-blue mb-4 border-b border-gray-200 pb-2 flex items-center bg-gray-50 z-10">
              <span className="mr-2">📝</span> Nhập liệu
            </h2>

            <div className="space-y-4">
              {/* Common Fields */}
              <div>
                <label className="flex items-center text-xs font-bold text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500 ml-1">*</span>
                </label>
                <input type="text" name="full_name" value={userData.full_name} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-pro-blue outline-none" placeholder="Nguyễn Văn A" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center text-xs font-bold text-gray-700 mb-1">
                    Giới tính <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select name="gender" value={userData.gender} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-pro-blue outline-none">
                    <option value={Gender.MALE}>Nam</option>
                    <option value={Gender.FEMALE}>Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center text-xs font-bold text-gray-700 mb-1">
                    Ngày sinh <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input 
                    type="date" 
                    name="dob" 
                    value={userData.dob} 
                    onChange={handleInputChange} 
                    className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-pro-blue outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center text-xs font-bold text-gray-700 mb-1">
                  Bắt đầu đóng BHXH <span className="text-red-500 ml-1">*</span>
                  <Tooltip text="Xác định quyền lợi BHXH 1 lần (Trước/Sau 1/7/2025)." />
                </label>
                <input 
                  type="date" 
                  name="join_date" 
                  value={userData.join_date} 
                  onChange={handleInputChange} 
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-pro-blue outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="flex items-center text-xs font-bold text-gray-700 mb-1">
                      Khu vực
                    </label>
                    <select name="sector" value={userData.sector} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-sm">
                      <option value={Sector.PRIVATE}>Tư nhân</option>
                      <option value={Sector.PUBLIC}>Nhà nước</option>
                    </select>
                 </div>
                 <div>
                    <label className="flex items-center text-xs font-bold text-gray-700 mb-1">
                      Điều kiện
                    </label>
                    <select name="working_condition" value={userData.working_condition} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-sm">
                      <option value={WorkingCondition.NORMAL}>Bình thường</option>
                      <option value={WorkingCondition.HEAVY}>Nặng nhọc</option>
                      <option value={WorkingCondition.SPECIAL}>Đặc biệt nặng nhọc</option>
                    </select>
                 </div>
              </div>

              {/* SALARY HISTORY SECTION */}
              <div className="border border-pro-blue-light/20 bg-blue-50/50 rounded p-2">
                <div className="flex justify-between items-center mb-2">
                   <label className="flex items-center text-xs font-bold text-pro-blue uppercase">
                     Quá trình đóng (Bắt buộc)
                     <Tooltip text="Nhập chi tiết từng giai đoạn." />
                   </label>
                   <button onClick={addSalaryPeriod} className="text-[10px] bg-white border border-gray-300 hover:bg-gray-50 px-2 py-1 rounded text-pro-blue font-bold transition shadow-sm">
                     + Thêm giai đoạn
                   </button>
                </div>
                
                {userData.salary_history.length === 0 && (
                   <div className="text-xs text-gray-400 italic mb-2 text-center py-2 border border-dashed border-gray-300 rounded bg-white">
                       Chưa có dữ liệu. Nhấn "Thêm giai đoạn" để nhập.
                   </div>
                )}

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {userData.salary_history.map((period, idx) => (
                    <div key={idx} className="flex flex-col bg-white border border-gray-200 rounded p-2 text-xs relative group shadow-sm">
                       <button onClick={() => removeSalaryPeriod(idx)} className="absolute top-1 right-1 text-red-400 hover:text-red-600 z-10">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                       </button>
                       <div className="grid grid-cols-2 gap-2 mb-1">
                          <div className="relative">
                              <label className="text-[10px] text-gray-500 absolute -top-1.5 left-2 bg-white px-1">Từ tháng</label>
                              <input 
                                type="month"
                                value={period.from} 
                                onChange={(e) => handleSalaryHistoryChange(idx, 'from', e.target.value)}
                                className="border rounded px-2 py-1.5 w-full text-xs focus:ring-1 focus:ring-pro-blue outline-none"
                              />
                          </div>
                          <div className="relative">
                               <label className="text-[10px] text-gray-500 absolute -top-1.5 left-2 bg-white px-1">Đến tháng</label>
                              <input 
                                type="month"
                                value={period.to} 
                                onChange={(e) => handleSalaryHistoryChange(idx, 'to', e.target.value)}
                                className="border rounded px-2 py-1.5 w-full text-xs focus:ring-1 focus:ring-pro-blue outline-none"
                              />
                          </div>
                       </div>
                       <div className="flex items-center gap-1">
                         <span className="font-bold text-gray-600">Lương:</span>
                         <input 
                            type="number" 
                            placeholder="Nhập số tiền (VNĐ)"
                            value={period.salary} 
                            onChange={(e) => handleSalaryHistoryChange(idx, 'salary', e.target.value)}
                            className="border rounded px-2 py-1 w-full font-bold text-gray-800"
                          />
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AUTO-CALCULATED FIELDS (Displayed Below History) */}
              <div className="grid grid-cols-1 gap-2">
                  <div className="bg-green-50 border border-green-200 rounded p-2 flex justify-between items-center">
                    <label className="flex items-center text-xs font-bold text-green-800">
                      Tổng năm đóng (Tự động)
                    </label>
                    <div className="font-bold text-green-700">
                        {displayTotalTime()}
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 flex justify-between items-center">
                    <label className="flex items-center text-xs font-bold text-yellow-800">
                      Lương BQ (Tạm tính)
                    </label>
                    <div className="font-mono font-bold text-yellow-700">
                        {userData.calculated_avg_salary_ui ? userData.calculated_avg_salary_ui.toLocaleString('vi-VN') : 0} <span className="text-[10px] text-gray-500 font-sans">đồng</span>
                    </div>
                  </div>
              </div>

              {/* Dynamic Fields based on Active Tab */}
              
              {activeTab === AppMode.RETIREMENT && (
                <div className="bg-white border-t-2 border-pro-blue pt-3 space-y-3">
                   <p className="text-sm font-bold text-pro-blue uppercase">Thông tin Hưu trí</p>
                   {/* Note: Total years is now calculated above, but user can assume it's used here */}
                   <div className="flex items-center gap-2">
                      <input type="checkbox" name="lump_sum_option" checked={userData.lump_sum_option || false} onChange={handleInputChange} className="rounded text-pro-blue" />
                      <label className="flex items-center text-xs text-gray-700">
                        Tính trợ cấp một lần (nếu đóng dư)
                      </label>
                   </div>
                   <div className="flex items-center gap-2">
                      <input type="checkbox" name="is_early_retirement" checked={userData.is_early_retirement || false} onChange={handleInputChange} className="rounded text-pro-blue" />
                      <label className="flex items-center text-xs text-gray-700">
                        Nghỉ hưu sớm (Suy giảm KNLĐ)
                      </label>
                   </div>
                   {userData.is_early_retirement && (
                      <div>
                        <label className="flex items-center text-xs font-bold text-gray-700 mb-1">
                          % Suy giảm (Từ 61%)
                        </label>
                        <input type="number" name="disability_rate" value={userData.disability_rate || 0} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-sm" />
                      </div>
                   )}
                </div>
              )}

              {activeTab === AppMode.ONE_TIME && (
                 <div className="bg-white border-t-2 border-pro-blue pt-3 space-y-3">
                    <p className="text-sm font-bold text-pro-blue uppercase">Thông tin Rút 1 Lần</p>
                    <div>
                      <label className="flex items-center text-xs font-bold text-gray-700 mb-1">
                        Lý do rút <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select name="withdrawal_reason" value={userData.withdrawal_reason || ''} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-sm">
                        <option value="">-- Chọn lý do --</option>
                        <option value="after_12_months">Nghỉ việc sau 12 tháng</option>
                        <option value="abroad">Định cư nước ngoài</option>
                        <option value="sickness">Bệnh hiểm nghèo</option>
                        <option value="age_low_years">Đủ tuổi nhưng thiếu năm đóng</option>
                      </select>
                    </div>
                 </div>
              )}

              {activeTab === AppMode.MATERNITY && (
                  <div className="bg-white border-t-2 border-pro-blue pt-3 space-y-3">
                    <p className="text-sm font-bold text-pro-blue uppercase">Thông tin Thai sản</p>
                    <div>
                      <label className="flex items-center text-xs font-bold text-gray-700 mb-1">
                        Sự kiện <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select name="maternity_event" value={userData.maternity_event || 'sinh_con'} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-sm">
                        <option value="kham_thai">Khám thai</option>
                        <option value="say_thai">Sẩy thai</option>
                        <option value="sinh_con">Sinh con</option>
                        <option value="nhan_con_nuoi">Nhận con nuôi</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center text-xs font-bold text-gray-700 mb-1">
                        Ngày sinh/Dự sinh <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input 
                        type="date" 
                        name="delivery_date" 
                        value={userData.delivery_date || ''} 
                        onChange={handleInputChange} 
                        className="w-full border rounded px-3 py-2 text-sm" 
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-xs font-bold text-gray-700 mb-1">
                        Số con
                      </label>
                      <input type="number" name="num_babies" value={userData.num_babies || 1} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-sm" />
                    </div>
                  </div>
              )}

              {activeTab === AppMode.SICKNESS && (
                  <div className="bg-white border-t-2 border-pro-blue pt-3 space-y-3">
                     <p className="text-sm font-bold text-pro-blue uppercase">Thông tin Ốm đau</p>
                     <div>
                      <label className="flex items-center text-xs font-bold text-gray-700 mb-1">
                        Loại ốm đau
                      </label>
                      <select name="sickness_type" value={userData.sickness_type || 'ngan_ngay'} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-sm">
                        <option value="ngan_ngay">Ốm ngắn ngày</option>
                        <option value="dai_ngay">Ốm dài ngày (Danh mục BYT)</option>
                        <option value="con_om">Con ốm</option>
                      </select>
                    </div>
                    <div>
                       <label className="flex items-center text-xs font-bold text-gray-700 mb-1">
                         Số ngày nghỉ thực tế
                       </label>
                       <input type="number" name="leave_days" value={userData.leave_days || 0} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-sm" />
                    </div>
                  </div>
              )}

              {activeTab === AppMode.DEATH && (
                  <div className="bg-white border-t-2 border-pro-blue pt-3 space-y-3">
                     <p className="text-sm font-bold text-pro-blue uppercase">Thông tin Tử tuất</p>
                     <div>
                       <label className="flex items-center text-xs font-bold text-gray-700 mb-1">
                         Nguyên nhân mất
                       </label>
                       <select name="death_reason" value={userData.death_reason || 'benh_thuong'} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-sm">
                         <option value="benh_thuong">Bệnh thông thường/Tai nạn rủi ro</option>
                         <option value="tnld">Tai nạn lao động/Bệnh nghề nghiệp</option>
                       </select>
                     </div>
                     <div>
                       <label className="flex items-center text-xs font-bold text-gray-700 mb-1">
                         Số thân nhân hưởng tuất
                       </label>
                       <input type="number" name="dependents_count" value={userData.dependents_count || 0} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-sm" placeholder="VD: 2" />
                     </div>
                  </div>
              )}

              {activeTab === AppMode.ACCIDENT && (
                <div className="bg-white border-t-2 border-pro-blue pt-3 space-y-3">
                   <p className="text-sm font-bold text-pro-blue uppercase">Thông tin TNLĐ - BNN</p>
                   
                   <div className="flex p-1 bg-gray-100 rounded mb-2">
                      <button 
                        onClick={() => setUserData(prev => ({...prev, is_occupational_disease: false}))}
                        className={`flex-1 py-1 text-xs rounded font-bold ${!userData.is_occupational_disease ? 'bg-white shadow text-pro-blue' : 'text-gray-500'}`}
                      >
                        Tai nạn lao động
                      </button>
                      <button 
                         onClick={() => setUserData(prev => ({...prev, is_occupational_disease: true}))}
                         className={`flex-1 py-1 text-xs rounded font-bold ${userData.is_occupational_disease ? 'bg-white shadow text-pro-blue' : 'text-gray-500'}`}
                      >
                        Bệnh nghề nghiệp
                      </button>
                   </div>

                   {/* Conditional Fields for Disease vs Accident */}
                   {userData.is_occupational_disease ? (
                      // Disease Fields
                      <>
                        <div>
                          <label className="flex items-center text-xs font-bold text-gray-700 mb-1">Tên bệnh nghề nghiệp</label>
                          <input type="text" name="disease_name" value={userData.disease_name || ''} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-sm" placeholder="VD: Bệnh điếc nghề nghiệp" />
                        </div>
                        <div>
                          <label className="flex items-center text-xs font-bold text-gray-700 mb-1">Ngày phát hiện/Giám định</label>
                          <input 
                            type="date" 
                            name="disease_date_detected" 
                            value={userData.disease_date_detected || ''} 
                            onChange={handleInputChange} 
                            className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-pro-blue outline-none" 
                          />
                        </div>
                      </>
                   ) : (
                      // Accident Fields
                      <>
                         <div>
                            <label className="flex items-center text-xs font-bold text-gray-700 mb-1">
                              Thời điểm tai nạn
                            </label>
                            <input 
                              type="date" 
                              name="accident_date" 
                              value={userData.accident_date || ''} 
                              onChange={handleInputChange}
                              className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-pro-blue outline-none" 
                            />
                         </div>
                         <div>
                            <label className="flex items-center text-xs font-bold text-gray-700 mb-1">
                              Địa điểm
                            </label>
                             <select name="accident_location" value={userData.accident_location || 'workplace'} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-sm">
                               <option value="workplace">Tại nơi làm việc</option>
                               <option value="commute">Trên tuyến đường đi về</option>
                               <option value="outside">Ngoài nơi làm việc (nhiệm vụ)</option>
                             </select>
                         </div>
                      </>
                   )}

                   <div>
                       <label className="flex items-center text-xs font-bold text-gray-700 mb-1">
                         Tỷ lệ suy giảm lao động (%) <span className="text-red-500 ml-1">*</span>
                       </label>
                       <input type="number" name="accident_rate" value={userData.accident_rate || 0} onChange={handleInputChange} className="w-full border rounded px-3 py-2 text-sm" />
                   </div>
                </div>
              )}

              <div className="pt-2 pb-6">
                 <label className="flex items-center text-xs font-bold text-gray-500 mb-1">
                   Mức tham chiếu năm 2026
                 </label>
                 <input type="number" name="base_salary_2026" value={userData.base_salary_2026} onChange={handleInputChange} className="w-full border border-gray-300 bg-gray-100 text-gray-500 rounded px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
          
           {/* Calculate Button Fixed at Bottom of Input Column on Desktop, Sticky on Mobile */}
           <div className="p-4 bg-white border-t border-gray-200 sticky bottom-0 md:static z-40 md:z-auto shadow-md md:shadow-none">
              <button 
                onClick={handleCalculate} 
                disabled={loading}
                className="w-full bg-pro-blue hover:bg-pro-blue-light text-white font-bold py-3 rounded shadow-lg transform transition active:scale-95 disabled:opacity-50 flex justify-center items-center"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tính toán...
                  </span>
                ) : `Tính Dự Toán`}
              </button>
           </div>
        </div>

        {/* COLUMN 3: RESULTS DISPLAY */}
        <div ref={resultRef} className="flex-1 bg-gray-100 flex flex-col relative md:h-full h-auto min-h-[50vh] overflow-hidden">
           {/* Beautiful Watermark - Adjusted Position and Size - Larger and lower */}
           <div className="absolute inset-0 flex items-start justify-center pt-40 md:pt-60 pointer-events-none z-0 overflow-hidden select-none">
                <h1 className="text-8xl md:text-[12rem] font-black text-transparent opacity-10" 
                    style={{ 
                      WebkitTextStroke: '1.2px #003366',
                      fontFamily: 'Arial, sans-serif',
                      letterSpacing: '0.05em'
                    }}>
                  AGVC
                </h1>
           </div>

           <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
              {!result && !loading && (
                <div className="flex flex-col items-center justify-center h-full select-none pointer-events-none text-center pt-0 pb-20">
                  <p className="text-lg text-gray-400 font-medium">
                    Vui lòng nhập thông tin <br className="md:hidden" /> và nhấn "Tính Dự Toán"
                  </p>
                </div>
              )}

              {result && (
                <div className="max-w-4xl mx-auto animate-fade-in bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="flex items-center mb-6 border-b border-gray-100 pb-4">
                     <div className="h-12 w-12 bg-pro-blue text-white rounded-full flex items-center justify-center font-bold text-xl mr-4 shadow-lg shrink-0">
                       KQ
                     </div>
                     <div>
                        <h2 className="text-2xl font-bold text-pro-blue">Kết Quả Dự Toán</h2>
                        <p className="text-sm text-gray-500">Chế độ: <span className="font-semibold text-pro-blue-light">{activeTab}</span></p>
                     </div>
                  </div>
                  <MarkdownRenderer content={result} />
                </div>
              )}
           </div>
        </div>

        {/* Floating Chat */}
        <ChatAssistant />
      </main>
    </div>
  );
}

export default App;