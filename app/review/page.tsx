import Navigation from '@/components/Navigation';

export default function ReviewPage() {
  return (
    <div className="relative flex h-full w-full flex-col grow">
      <Navigation currentPage='review'/>

      {/* Main Content Layout */}
      <main className="flex-1 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-40 w-full">
        <div className="flex flex-col max-w-[1024px] w-full gap-8">
          {/* Page Heading & Context */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap justify-between items-end gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Review &amp; Edit</h1>
                <p className="text-[#a2c398] text-base font-normal max-w-2xl">
                  We found 3 expenses in your text. Please review and verify the details below before saving to your dashboard.
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Confidence Score</span>
                <div className="flex items-center gap-2 bg-surface-input px-3 py-1 rounded-full border border-[#426039]">
                  <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="text-white font-bold text-sm">94%</span>
                </div>
              </div>
            </div>

            {/* Collapsible Source Text */}
            <details className="group flex flex-col rounded-xl border border-[#426039] bg-surface-dark overflow-hidden transition-all duration-300 open:pb-4">
              <summary className="flex cursor-pointer items-center justify-between gap-6 px-5 py-4 bg-surface-dark hover:bg-white/5 transition-colors select-none">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">description</span>
                  <p className="text-white text-sm font-bold uppercase tracking-wider">Original Source Text</p>
                </div>
                <div className="text-[#a2c398] transition-transform duration-300 group-open:rotate-180 flex items-center">
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </summary>
              <div className="px-5 pt-2">
                <div className="p-4 rounded-lg bg-black/20 border border-white/5 font-mono text-sm text-[#a2c398] leading-relaxed">
                  &quot;Spent $5.50 at Starbucks on coffee, $120 at Target for groceries on Oct 24th, and took an Uber for $15.&quot;
                </div>
              </div>
            </details>
          </div>

          {/* Editable Data Table Card */}
          <div className="flex flex-col bg-surface-dark rounded-xl border border-[#426039] overflow-hidden shadow-2xl shadow-black/20">
            {/* Table Header */}
            <div className="overflow-x-auto custom-scrollbar pb-2 sm:pb-0">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr className="bg-[#21301c] border-b border-[#426039]">
                    <th className="p-4 w-[30%] text-xs font-bold text-[#a2c398] uppercase tracking-wider">Item Description</th>
                    <th className="p-4 w-[15%] text-xs font-bold text-[#a2c398] uppercase tracking-wider">Price</th>
                    <th className="p-4 w-[20%] text-xs font-bold text-[#a2c398] uppercase tracking-wider">Category</th>
                    <th className="p-4 w-[25%] text-xs font-bold text-[#a2c398] uppercase tracking-wider">Date</th>
                    <th className="p-4 w-[10%] text-center text-xs font-bold text-[#a2c398] uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#426039]">
                  {/* Row 1 */}
                  <tr className="group hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      <div className="relative flex items-center">
                        <input 
                          className="w-full bg-surface-input text-white text-sm font-medium px-4 py-2.5 rounded-full border border-transparent focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-[#a2c398]/50" 
                          type="text" 
                          defaultValue="Starbucks Coffee"
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-[#a2c398] text-sm">$</span>
                        <input 
                          className="w-full bg-surface-input text-white text-sm font-medium pl-6 pr-4 py-2.5 rounded-full border border-transparent focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" 
                          step="0.01" 
                          type="number" 
                          defaultValue="5.50"
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="relative">
                        <select className="w-full appearance-none bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer text-sm font-bold px-4 py-2.5 rounded-full border border-transparent focus:border-primary focus:ring-0 focus:outline-none transition-all pr-10">
                          <option value="food">Food &amp; Drink</option>
                          <option value="groceries">Groceries</option>
                          <option value="transport">Transport</option>
                          <option value="utilities">Utilities</option>
                          <option value="entertainment">Entertainment</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-primary">
                          <span className="material-symbols-outlined text-sm">expand_more</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="relative">
                        <input 
                          className="w-full bg-surface-input text-white text-sm font-medium px-4 py-2.5 rounded-full border border-transparent focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-left uppercase tracking-wide" 
                          type="date" 
                          defaultValue="2023-10-24"
                        />
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button 
                        aria-label="Delete item" 
                        className="size-9 rounded-full text-[#a2c398] hover:text-red-400 hover:bg-red-400/10 flex items-center justify-center transition-colors mx-auto"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="group hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      <div className="relative flex items-center">
                        <input 
                          className="w-full bg-surface-input text-white text-sm font-medium px-4 py-2.5 rounded-full border border-transparent focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-[#a2c398]/50" 
                          type="text" 
                          defaultValue="Target"
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-[#a2c398] text-sm">$</span>
                        <input 
                          className="w-full bg-surface-input text-white text-sm font-medium pl-6 pr-4 py-2.5 rounded-full border border-transparent focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" 
                          step="0.01" 
                          type="number" 
                          defaultValue="120.00"
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="relative">
                        <select 
                          className="w-full appearance-none bg-[#e8a95e]/20 text-[#e8a95e] hover:bg-[#e8a95e]/30 cursor-pointer text-sm font-bold px-4 py-2.5 rounded-full border border-transparent focus:border-[#e8a95e] focus:ring-0 focus:outline-none transition-all pr-10"
                          defaultValue="groceries"
                        >
                          <option value="food">Food &amp; Drink</option>
                          <option value="groceries">Groceries</option>
                          <option value="transport">Transport</option>
                          <option value="utilities">Utilities</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#e8a95e]">
                          <span className="material-symbols-outlined text-sm">expand_more</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="relative">
                        <input 
                          className="w-full bg-surface-input text-white text-sm font-medium px-4 py-2.5 rounded-full border border-transparent focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-left uppercase tracking-wide" 
                          type="date" 
                          defaultValue="2023-10-24"
                        />
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button className="size-9 rounded-full text-[#a2c398] hover:text-red-400 hover:bg-red-400/10 flex items-center justify-center transition-colors mx-auto">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="group hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      <div className="relative flex items-center">
                        <input 
                          className="w-full bg-surface-input text-white text-sm font-medium px-4 py-2.5 rounded-full border border-transparent focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-[#a2c398]/50" 
                          type="text" 
                          defaultValue="Uber Ride"
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="relative flex items-center">
                        {/* Highlighted low confidence field */}
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                        </span>
                        <span className="absolute left-3 text-[#a2c398] text-sm">$</span>
                        <input 
                          className="w-full bg-surface-input ring-1 ring-yellow-500/50 text-white text-sm font-medium pl-6 pr-4 py-2.5 rounded-full border border-transparent focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" 
                          step="0.01" 
                          type="number" 
                          defaultValue="15.00"
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="relative">
                        <select 
                          className="w-full appearance-none bg-[#5ea9e8]/20 text-[#5ea9e8] hover:bg-[#5ea9e8]/30 cursor-pointer text-sm font-bold px-4 py-2.5 rounded-full border border-transparent focus:border-[#5ea9e8] focus:ring-0 focus:outline-none transition-all pr-10"
                          defaultValue="transport"
                        >
                          <option value="food">Food &amp; Drink</option>
                          <option value="groceries">Groceries</option>
                          <option value="transport">Transport</option>
                          <option value="utilities">Utilities</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#5ea9e8]">
                          <span className="material-symbols-outlined text-sm">expand_more</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="relative">
                        <input 
                          className="w-full bg-surface-input text-white text-sm font-medium px-4 py-2.5 rounded-full border border-transparent focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-left uppercase tracking-wide" 
                          type="date" 
                          defaultValue="2023-10-24"
                        />
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button className="size-9 rounded-full text-[#a2c398] hover:text-red-400 hover:bg-red-400/10 flex items-center justify-center transition-colors mx-auto">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Table Footer / Add Action */}
            <div className="p-3 bg-[#1a2617] border-t border-[#426039]">
              <button className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed border-[#426039] hover:border-primary hover:bg-primary/5 text-[#a2c398] hover:text-primary transition-all group">
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">add_circle</span>
                <span className="text-sm font-bold">Add Missing Item</span>
              </button>
            </div>
          </div>

          {/* Summary & Action Bar */}
          <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6 p-6 rounded-2xl bg-surface-dark border border-[#426039] mb-10">
            <button className="text-[#a2c398] hover:text-white text-sm font-bold py-2 px-4 rounded-full hover:bg-white/5 transition-colors">
              Discard All
            </button>
            <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
              <div className="flex items-baseline gap-2">
                <span className="text-[#a2c398] text-sm font-medium uppercase tracking-wider">Total Amount:</span>
                <span className="text-white text-2xl font-black tracking-tight">$140.50</span>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none h-12 px-6 rounded-full border border-[#426039] text-white hover:bg-white/5 font-bold text-sm transition-colors">
                  Cancel
                </button>
                <button className="flex-1 md:flex-none h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-background-dark font-bold text-sm shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">check</span>
                  Save Expenses
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
