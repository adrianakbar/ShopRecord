import Navigation from "@/components/Navigation";

export default function QuickAdd() {
  return (
    <>
      <Navigation currentPage="quick-add" />

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Column: Input Area (Span 7) */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="mb-8">
                <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4">
                  Track spending at the{" "}
                  <span className="text-primary">speed of thought</span>
                </h2>
                <p className="text-gray-600 dark:text-[#a2c398] text-lg">
                  Just type what you bought. Our AI extracts the merchant, date,
                  category, and amount automatically.
                </p>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-green-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />

                <div className="relative bg-surface-light dark:bg-surface-dark rounded-xl p-1 shadow-xl border border-gray-200 dark:border-[#2e4328]">
                  <label className="sr-only" htmlFor="expense-input">
                    Expense Input
                  </label>
                  <textarea
                    autoFocus
                    className="w-full bg-transparent border-0 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#5a7053] text-xl md:text-2xl font-medium leading-relaxed p-6 min-h-[280px] focus:ring-0 resize-none rounded-lg"
                    id="expense-input"
                    placeholder="Example: Lunch $12.50, Taxi $24 to airport, Grocery run $85 at Whole Foods yesterday..."
                  />

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-100 dark:border-[#2e4328]">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#a2c398]">
                      <span className="material-symbols-outlined text-lg">
                        keyboard_command_key
                      </span>
                      <span>+</span>
                      <span className="material-symbols-outlined text-lg">
                        keyboard_return
                      </span>
                      <span className="hidden sm:inline">
                        to submit instantly
                      </span>
                    </div>

                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-[#45b025] text-[#162013] font-bold py-3 px-8 rounded-full transition-all transform active:scale-95 shadow-lg shadow-primary/25">
                      <span className="material-symbols-outlined">
                        auto_awesome
                      </span>
                      <span>Process AI Expenses</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar (Span 5) */}
            <div className="lg:col-span-5 flex flex-col gap-6 mt-8 lg:mt-0">
              {/* Tips Card */}
              <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-[#2e4328]">
                <div className="flex items-center gap-3 mb-4 text-primary">
                  <span className="material-symbols-outlined">lightbulb</span>
                  <h3 className="font-bold text-lg">Smart Tips</h3>
                </div>

                <ul className="space-y-4">
                  <li className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <span className="material-symbols-outlined text-[#a2c398] shrink-0 text-base mt-0.5">
                      check_circle
                    </span>
                    <span>
                      <strong>Split items:</strong> Use commas or new lines to
                      separate different transactions.
                    </span>
                  </li>
                  <li className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <span className="material-symbols-outlined text-[#a2c398] shrink-0 text-base mt-0.5">
                      check_circle
                    </span>
                    <span>
                      <strong>Dates:</strong> &quot;Yesterday&quot;, &quot;Last
                      Friday&quot;, or specific dates work great.
                    </span>
                  </li>
                  <li className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <span className="material-symbols-outlined text-[#a2c398] shrink-0 text-base mt-0.5">
                      check_circle
                    </span>
                    <span>
                      <strong>Categorization:</strong> Mention &quot;for
                      office&quot; or &quot;personal&quot; to help the AI tag it
                      correctly.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Recent Processed */}
              <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-[#2e4328] flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg dark:text-white">
                    Just Added
                  </h3>
                  <a
                    className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
                    href="#"
                  >
                    View All
                  </a>
                </div>

                <div className="space-y-4">
                  {/* Item 1 */}
                  <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <span className="material-symbols-outlined">
                          local_cafe
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm dark:text-gray-200">
                          Starbucks Coffee
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Food &amp; Drink • Today
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      -$5.40
                    </span>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center">
                        <span className="material-symbols-outlined">
                          local_taxi
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm dark:text-gray-200">
                          Uber Trip
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Transport • Yesterday
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      -$24.50
                    </span>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
                        <span className="material-symbols-outlined">
                          shopping_bag
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm dark:text-gray-200">
                          Apple Store
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Electronics • Oct 24
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      -$129.00
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
