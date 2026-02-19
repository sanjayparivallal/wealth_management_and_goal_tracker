import { ChartIcon, TransactionIcon, MoneyIcon, TrendingUpIcon, CreditCardIcon } from "../common/Icons";

export default function TransactionForm({ formData, setFormData, onSubmit, onCancel }) {
    const isSell = formData.type === 'sell';
    
    return (
        <form onSubmit={onSubmit} className="space-y-6 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 group">
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-lg group-focus-within:from-indigo-200 group-focus-within:to-indigo-100 transition-all duration-300">
                            <ChartIcon className="w-4 h-4 text-indigo-600" />
                        </div>
                        <input
                            type="text"
                            id="symbol"
                            value={formData.symbol}
                            onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                            className="block w-full pl-16 pr-4 pt-7 pb-3 text-sm text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-indigo-500 focus:bg-white peer transition-all duration-300 placeholder-transparent hover:border-gray-300 uppercase font-mono font-bold tracking-wider"
                            placeholder="Symbol/Ticker"
                            required
                        />
                        <label
                            htmlFor="symbol"
                            className="absolute text-sm text-gray-500 duration-200 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] left-16 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-indigo-600 font-medium pointer-events-none"
                        >
                            Symbol/Ticker
                        </label>
                    </div>
                </div>

                <div className={`group ${isSell ? 'md:col-span-2' : ''}`}>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg group-focus-within:from-blue-200 group-focus-within:to-blue-100 transition-all duration-300">
                            <TransactionIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <select
                            id="type"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="block w-full pl-16 pr-10 pt-7 pb-3 text-sm text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-0 focus:border-indigo-500 focus:bg-white peer transition-all duration-300 hover:border-gray-300"
                            required
                        >
                            <option value="buy">📈 Buy</option>
                            <option value="sell">📉 Sell</option>
                            
                        </select>
                        <label
                            htmlFor="type"
                            className="absolute text-sm text-gray-500 duration-200 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] left-16 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-indigo-600 font-medium pointer-events-none"
                        >
                            Transaction Type
                        </label>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                {!isSell && (
                    <div className="group">
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg group-focus-within:from-purple-200 group-focus-within:to-purple-100 transition-all duration-300">
                                <TrendingUpIcon className="w-4 h-4 text-purple-600" />
                            </div>
                            <select
                                id="asset_type"
                                value={formData.asset_type || "stock"}
                                onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
                                className="block w-full pl-16 pr-10 pt-7 pb-3 text-sm text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-0 focus:border-indigo-500 focus:bg-white peer transition-all duration-300 hover:border-gray-300"
                                required={!isSell}
                            >
                                <option value="stock">📊 Stock</option>
                                <option value="etf">📈 ETF</option>
                                <option value="mutual_fund">🏦 Mutual Fund</option>
                                <option value="bond">📜 Bond</option>
                                <option value="cash">💵 Cash</option>
                            </select>
                            <label
                                htmlFor="asset_type"
                                className="absolute text-sm text-gray-500 duration-200 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] left-16 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-indigo-600 font-medium pointer-events-none"
                            >
                                Asset Type
                            </label>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                )}

                <div className="group">
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-lg group-focus-within:from-cyan-200 group-focus-within:to-cyan-100 transition-all duration-300">
                            <span className="text-cyan-600 font-bold text-sm">#</span>
                        </div>
                        <input
                            type="number"
                            id="quantity"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            className="block w-full pl-16 pr-4 pt-7 pb-3 text-sm text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-indigo-500 focus:bg-white peer transition-all duration-300 placeholder-transparent hover:border-gray-300"
                            placeholder="Quantity"
                            required
                            min="0"
                            step="0.0001"
                        />
                        <label
                            htmlFor="quantity"
                            className="absolute text-sm text-gray-500 duration-200 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] left-16 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-indigo-600 font-medium pointer-events-none"
                        >
                            Quantity
                        </label>
                    </div>
                </div>

                <div className="group">
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-green-100 to-green-50 rounded-lg group-focus-within:from-green-200 group-focus-within:to-green-100 transition-all duration-300">
                            <MoneyIcon className="w-4 h-4 text-green-600" />
                        </div>
                        <input
                            type="number"
                            id="price"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="block w-full pl-16 pr-4 pt-7 pb-3 text-sm text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-indigo-500 focus:bg-white peer transition-all duration-300 placeholder-transparent hover:border-gray-300"
                            placeholder="Price per Unit ($)"
                            required
                            min="0"
                            step="0.01"
                        />
                        <label
                            htmlFor="price"
                            className="absolute text-sm text-gray-500 duration-200 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] left-16 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-indigo-600 font-medium pointer-events-none"
                        >
                            Price per Unit ($)
                        </label>
                    </div>
                </div>

                <div className={`group ${isSell ? 'md:col-span-2' : ''}`}>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg group-focus-within:from-orange-200 group-focus-within:to-orange-100 transition-all duration-300">
                            <CreditCardIcon className="w-4 h-4 text-orange-600" />
                        </div>
                        <input
                            type="number"
                            id="fees"
                            value={formData.fees}
                            onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                            className="block w-full pl-16 pr-4 pt-7 pb-3 text-sm text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-indigo-500 focus:bg-white peer transition-all duration-300 placeholder-transparent hover:border-gray-300"
                            placeholder="Fees ($)"
                            required
                            min="0"
                            step="0.01"
                        />
                        <label
                            htmlFor="fees"
                            className="absolute text-sm text-gray-500 duration-200 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] left-16 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-indigo-600 font-medium pointer-events-none"
                        >
                            Fees ($)
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 border-2 border-gray-200 text-gray-600 rounded-lg font-medium text-sm hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 transition-all duration-300"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="flex-1 relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white py-2.5 px-5 rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all duration-300 shadow-md"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        <TransactionIcon className="w-4 h-4" />
                        {isSell ? 'Record Sale' : 'Record Transaction'}
                    </span>
                </button>
            </div>
        </form>
    );
}
