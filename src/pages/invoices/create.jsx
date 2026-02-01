import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  ChevronLeft, 
  Eye, 
  PlusCircle, 
  Upload, 
  Save,
  X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCreateSaleInvoiceMutation } from "@/features/invoice/saleInvoiceApiSlice";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { Settings } from "lucide-react";

const CreateInvoicePage = () => {
  const navigate = useNavigate();
  
  // Form State
  const [items, setItems] = useState([
    { id: 1, name: "Nike Jordon", type: "product", quantity: 1, unit: "Pcs", rate: 1360, discount: 0, discountType: "%", tax: 18, amount: 1358 },
    { id: 2, name: "", type: "product", quantity: 0, unit: "Unit", rate: 0, discount: 0, discountType: "%", tax: 0, amount: 0 }
  ]);

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "1254569",
    referenceNumber: "1254569",
    invoiceDate: "2025-03-25",
    dueDate: "",
    recurring: false,
    recurringInterval: "Monthly",
    recurringDuration: "1 Month",
    enableTax: true,
    billFrom: "",
    billTo: "",
    notes: "",
    terms: "",
    signatureName: "Adrian",
    roundOff: true,
    discountTotal: 0,
    discountType: "%"
  });

  const authUser = useSelector((state) => state.auth.user);
  const [createSaleInvoice, { isLoading }] = useCreateSaleInvoiceMutation();

  // Calculations
  const subTotal = items.reduce((acc, item) => acc + item.amount, 0);
  const cgst = subTotal * 0.09;
  const sgst = subTotal * 0.09;
  const discountTotalCalc = subTotal * (invoiceData.discountTotal / 100);
  const total = subTotal + cgst + sgst - discountTotalCalc;

  const handleSave = async () => {
    try {
      const payload = {
        ...invoiceData,
        companyId: authUser?.companyId,
        subTotal,
        taxTotal: cgst + sgst,
        discountTotal: discountTotalCalc,
        totalAmount: total,
        items
      };
      
      await createSaleInvoice(payload).unwrap();
      toast.success("Invoice created successfully");
      navigate("/invoices");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create invoice");
    }
  };

  const addItem = () => {
    setItems([...items, { 
      id: Date.now(), 
      name: "", 
      type: "product", 
      quantity: 0, 
      unit: "Unit", 
      rate: 0, 
      discount: 0, 
      discountType: "%", 
      tax: 0, 
      amount: 0 
    }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f14] p-4 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full bg-white dark:bg-[#1a1f26] shadow-sm border border-gray-100 dark:border-gray-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Invoice</h1>
        </div>
        <Button variant="outline" className="bg-white dark:bg-[#1a1f26] border-gray-200 dark:border-gray-800">
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
      </div>

      <div className="bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 lg:p-10 space-y-10">
          
          {/* Invoice Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Invoice Number</label>
                  <input 
                    value={invoiceData.invoiceNumber} 
                    className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:bg-black/20 dark:border-gray-800" 
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Reference Number</label>
                  <input 
                    placeholder="Enter Reference Number" 
                    value={invoiceData.referenceNumber}
                    className="flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800"
                    onChange={(e) => setInvoiceData({...invoiceData, referenceNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Invoice Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 font-bold" />
                    <input 
                      type="date" 
                      value={invoiceData.invoiceDate}
                      className="flex h-10 w-full rounded-md border border-gray-200 bg-transparent pl-10 pr-3 py-2 text-sm dark:border-gray-800"
                      onChange={(e) => setInvoiceData({...invoiceData, invoiceDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-8">
                  <PlusCircle className="w-4 h-4 text-[#7c3aed]" />
                  <span className="text-sm font-medium text-[#7c3aed] cursor-pointer">Add Due Date</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-8 pt-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="recurring" 
                    checked={invoiceData.recurring} 
                    onCheckedChange={(val) => setInvoiceData({...invoiceData, recurring: val})}
                  />
                  <label htmlFor="recurring" className="text-sm font-medium leading-none">Recurring</label>
                </div>
                {invoiceData.recurring && (
                  <div className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                    <select 
                      className="flex h-10 w-[140px] rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800"
                      value={invoiceData.recurringInterval}
                      onChange={(e) => setInvoiceData({...invoiceData, recurringInterval: e.target.value})}
                    >
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                    <select 
                      className="flex h-10 w-[140px] rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800"
                      value={invoiceData.recurringDuration}
                      onChange={(e) => setInvoiceData({...invoiceData, recurringDuration: e.target.value})}
                    >
                      <option value="1 Month">1 Month</option>
                      <option value="3 Months">3 Months</option>
                      <option value="6 Months">6 Months</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-end space-y-6">
               <div className="w-full max-w-[240px] p-6 rounded-xl bg-gray-50 dark:bg-black/20 border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1a1f26] flex items-center justify-center text-[#7c3aed] shadow-sm">
                    <span className="text-xl font-bold">K</span>
                  </div>
                  <span className="text-xl font-bold dark:text-white">Kanakku</span>
               </div>
               <div className="w-full space-y-4">
                  <select 
                    defaultValue="status" 
                    className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-800 bg-transparent text-sm"
                  >
                    <option value="status">Select Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                  <select 
                    defaultValue="currency" 
                    className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-800 bg-transparent text-sm"
                  >
                    <option value="currency">Currency</option>
                    <option value="usd">USD</option>
                    <option value="bdt">BDT</option>
                  </select>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="tax" 
                        checked={invoiceData.enableTax} 
                        onCheckedChange={(val) => setInvoiceData({...invoiceData, enableTax: val})} 
                      />
                      <label htmlFor="tax" className="text-xs">Enable tax</label>
                    </div>
                    <Settings className="w-4 h-4 text-gray-400" />
                  </div>
               </div>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Bill Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white underline decoration-[#7c3aed] decoration-2 underline-offset-8 mb-6">Bill From</h3>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-medium">Billed By</label>
                <select className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-800 bg-transparent text-sm">
                  <option value="">Select</option>
                  <option value="self">My Company</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white underline decoration-[#7c3aed] decoration-2 underline-offset-8">Bill To</h3>
                <Button variant="link" className="text-[#7c3aed] h-auto p-0 flex items-center gap-1">
                  <PlusCircle className="w-3 h-3" />
                  Add New
                </Button>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-medium">Customer Name</label>
                <select className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-800 bg-transparent text-sm">
                  <option value="">Select</option>
                  <option value="cust1">John Doe</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Items Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Items & Details</h2>
            
            <div className="space-y-4">
               <div className="flex items-center gap-6">
                  <span className="text-sm font-medium">Item Type</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="itemType" value="product" id="product" defaultChecked className="w-4 h-4 accent-[#7c3aed]" />
                      <label htmlFor="product" className="text-xs font-medium">Product</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="itemType" value="service" id="service" className="w-4 h-4 accent-[#7c3aed]" />
                      <label htmlFor="service" className="text-xs font-medium">Service</label>
                    </div>
                  </div>
               </div>
               
               <div className="p-4 bg-gray-50/50 dark:bg-black/10 rounded-xl border border-gray-100 dark:border-gray-800 lg:w-1/3">
                  <label className="text-xs text-gray-500 mb-1 block font-medium">Products/Services</label>
                  <select className="w-full h-8 bg-transparent border-none focus:ring-0 text-sm">
                    <option value="">Select</option>
                    <option value="p1">Nike Jordon</option>
                  </select>
               </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[1000px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-900 dark:bg-black py-4">
                      <th className="text-left py-3 px-4 text-white text-xs font-semibold rounded-tl-xl w-1/4">Product/Service</th>
                      <th className="text-left py-3 px-4 text-white text-xs font-semibold">Quantity</th>
                      <th className="text-left py-3 px-4 text-white text-xs font-semibold">Unit</th>
                      <th className="text-left py-3 px-4 text-white text-xs font-semibold">Rate</th>
                      <th className="text-left py-3 px-4 text-white text-xs font-semibold w-1/6">Discount</th>
                      <th className="text-left py-3 px-4 text-white text-xs font-semibold">Tax (%)</th>
                      <th className="text-left py-3 px-4 text-white text-xs font-semibold">Amount</th>
                      <th className="text-right py-3 px-4 text-white text-xs font-semibold rounded-tr-xl"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {items.map((item) => (
                      <tr key={item.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4">
                          <input 
                            value={item.name} 
                            placeholder="Enter Product Name" 
                            className="flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800"
                            onChange={(e) => {
                              const newItems = items.map(i => i.id === item.id ? {...i, name: e.target.value} : i);
                              setItems(newItems);
                            }}
                          />
                        </td>
                        <td className="py-4 px-4 w-[100px]">
                          <input 
                            type="number" 
                            value={item.quantity} 
                            className="flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800 text-center"
                            onChange={(e) => {
                              const newItems = items.map(i => i.id === item.id ? {...i, quantity: parseInt(e.target.value) || 0} : i);
                              setItems(newItems);
                            }}
                          />
                        </td>
                        <td className="py-4 px-4 w-[120px]">
                          <input 
                            value={item.unit} 
                            className="flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800" 
                            onChange={(e) => {
                              const newItems = items.map(i => i.id === item.id ? {...i, unit: e.target.value} : i);
                              setItems(newItems);
                            }}
                          />
                        </td>
                        <td className="py-4 px-4 w-[150px]">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                            <input 
                              type="number"
                              value={item.rate} 
                              className="flex h-10 w-full rounded-md border border-gray-200 bg-transparent pl-6 pr-3 py-2 text-sm dark:border-gray-800" 
                              onChange={(e) => {
                                const newItems = items.map(i => i.id === item.id ? {...i, rate: parseFloat(e.target.value) || 0} : i);
                                setItems(newItems);
                              }}
                            />
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                             <input 
                               type="number"
                               value={item.discount} 
                               className="flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800 text-center" 
                               onChange={(e) => {
                                 const newItems = items.map(i => i.id === item.id ? {...i, discount: parseFloat(e.target.value) || 0} : i);
                                 setItems(newItems);
                               }}
                             />
                             <select 
                               className="w-[60px] h-10 rounded-md border border-gray-200 bg-transparent text-sm dark:border-gray-800"
                               value={item.discountType}
                               onChange={(e) => {
                                 const newItems = items.map(i => i.id === item.id ? {...i, discountType: e.target.value} : i);
                                 setItems(newItems);
                               }}
                             >
                               <option value="%">%</option>
                               <option value="fixed">$</option>
                             </select>
                          </div>
                        </td>
                        <td className="py-4 px-4 w-[80px]">
                          <input 
                            type="number"
                            value={item.tax} 
                            className="flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800 text-center" 
                            onChange={(e) => {
                              const newItems = items.map(i => i.id === item.id ? {...i, tax: parseFloat(e.target.value) || 0} : i);
                              setItems(newItems);
                            }}
                          />
                        </td>
                        <td className="py-4 px-4 w-[150px]">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                            <input 
                              value={item.amount.toFixed(2)} 
                              className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-6 py-2 text-sm dark:bg-black/20 dark:border-gray-800" 
                              readOnly 
                            />
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Button 
               variant="outline" 
               onClick={addItem}
               className="text-[#7c3aed] border-[#7c3aed]/20 hover:bg-[#7c3aed]/5 font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Bottom Section: Notes & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 dark:text-white underline decoration-[#7c3aed] decoration-2 underline-offset-8 mb-6">Extra Information</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" className="bg-[#7c3aed] text-white hover:bg-[#6d28d9]">Add Notes</Button>
                      <Button variant="outline" size="sm" className="border-gray-200 dark:border-gray-800">Add Terms & Conditions</Button>
                      <Button variant="outline" size="sm" className="border-gray-200 dark:border-gray-800">Add Bank Details</Button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500 font-medium">Additional Notes</label>
                      <textarea 
                        className="w-full h-32 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
                        placeholder="Add any additional information..."
                        value={invoiceData.notes}
                        onChange={(e) => setInvoiceData({...invoiceData, notes: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500 font-medium">Terms & Conditions</label>
                      <textarea 
                        className="w-full h-32 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
                        placeholder="Add terms and conditions..."
                        value={invoiceData.terms}
                        onChange={(e) => setInvoiceData({...invoiceData, terms: e.target.value})}
                      />
                    </div>
                  </div>
            </div>

            <div className="space-y-6">
               <div className="p-8 rounded-2xl bg-gray-50/50 dark:bg-black/10 border border-gray-100 dark:border-gray-800 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-bold">${subTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">CGST (9%)</span>
                    <span className="font-bold">${cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">SGST (9%)</span>
                    <span className="font-bold">${sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 text-[#7c3aed] cursor-pointer">
                    <PlusCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Add Additional Charges</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">Discount</span>
                      <div className="flex bg-white dark:bg-[#1a1f26] border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden h-8">
                        <input 
                          type="number"
                          className="w-12 h-full border-none focus:ring-0 text-center text-xs p-0 bg-transparent" 
                          value={invoiceData.discountTotal} 
                          onChange={(e) => setInvoiceData({...invoiceData, discountTotal: parseFloat(e.target.value) || 0})}
                        />
                        <div className="w-px h-full bg-gray-200 dark:bg-gray-800" />
                        <select 
                          className="w-12 h-full border-none focus:ring-0 text-xs p-0 px-2 bg-transparent"
                          value={invoiceData.discountType}
                          onChange={(e) => setInvoiceData({...invoiceData, discountType: e.target.value})}
                        >
                          <option value="%">%</option>
                          <option value="fixed">$</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Switch checked />
                        <span className="text-xs font-medium text-gray-500">Round Off Total</span>
                     </div>
                     <span className="font-bold text-lg">${Math.round(total).toLocaleString()}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-end">
                    <div>
                      <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Total (USD)</h4>
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-black text-[#7c3aed]">${Math.round(total).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="pt-2 text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total In Words</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium italic">Five Hundred & Ninety Six Dollars</p>
                  </div>
               </div>

                <div className="space-y-4">
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-800 bg-transparent text-sm"
                    value={invoiceData.signatureName}
                    onChange={(e) => setInvoiceData({...invoiceData, signatureName: e.target.value})}
                  >
                    <option value="adrian">Adrian</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="text-center py-2 text-xs text-gray-400 font-bold">OR</div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500 font-medium">Signature Name</label>
                      <input 
                        value={invoiceData.signatureName} 
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800" 
                        onChange={(e) => setInvoiceData({...invoiceData, signatureName: e.target.value})}
                      />
                    </div>
                    <div className="w-full h-24 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center gap-2 bg-gray-50/30">
                       <Upload className="w-4 h-4 text-gray-400" />
                       <span className="text-xs text-[#7c3aed] font-semibold">Upload Signature</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-10 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" className="px-10 border-gray-200 dark:border-gray-700" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button 
              className="px-10 bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoicePage;
