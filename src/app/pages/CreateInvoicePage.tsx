import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { Plus, Trash2, AlertTriangle, ArrowLeft, Upload, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { InvoiceSchema, type InvoiceFormData } from "../schemas/invoiceSchema";

interface User {
  id: number;
  name: string;
  team: string;
}

const API_URL = "http://localhost:3001/api";

export function CreateInvoicePage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(InvoiceSchema),
    defaultValues: {
      invoiceNumber: "",
      date: new Date().toISOString().split("T")[0],
      team: "",
      userId: "",
      customerName: "",
      items: [{ id: Date.now().toString(), productName: "", quantity: 1, price: 0, bottomPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await axios.get(`${API_URL}/users`);
        setUsers(usersRes.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };
    fetchData();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: false
  });

  const handleFileUpload = (file: File) => {
    setIsProcessing(true);
    setUploadSuccess(false);

    // Simulate AI/OCR Processing of the uploaded file
    // In a real app, this would be an API call to a service like Tesseract, Google Cloud Vision, etc.
    setTimeout(() => {
      // Logic: Based on the "GLORY Interior" structure provided in the image
      setValue("invoiceNumber", "INV/26/03/000168");
      setValue("date", "2026-03-03");
      setValue("customerName", "TOKO AZFAR (H) 0857-2703-4539\nSAMBUNG GANG 10 KECAMATAN UDAAN KABUPATEN KUDUS");
      setValue("team", "Lelang");
      
      const gloryItems = [
        { 
          id: "g1", 
          productName: "LIST PLAT GOLD PEREKAT 50M - LIST PLAT GOLD PEREKAT LEBAR 2 CM PANJANG 50 M", 
          quantity: 15, 
          price: 261300, 
          bottomPrice: 150000 
        },
        { 
          id: "g2", 
          productName: "LIST PLAT GOLD PEREKAT 50M - LIST PLAT GOLD PEREKAT LEBAR 3 CM PANJANG 50 M", 
          quantity: 10, 
          price: 394400, 
          bottomPrice: 250000 
        },
        { 
          id: "g3", 
          productName: "LIST PLATBLACK PEREKAT50M(2CM) - LIST PLAT BLACK PEREKAT LEBAR 2 CM PANJANG 50 M", 
          quantity: 5, 
          price: 261300, 
          bottomPrice: 150000 
        }
      ];

      remove(); // Clear initial empty item
      gloryItems.forEach(item => append(item));
      
      setIsProcessing(false);
      setUploadSuccess(true);
    }, 2500);
  };

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

  const calculateSubtotal = (quantity: number, price: number) => quantity * price;

  const calculateTotal = () =>
    watchedItems.reduce((sum, item) => sum + calculateSubtotal(item.quantity, item.price), 0);

  const isBelowBottomPrice = (item: any) => item.price > 0 && item.price < item.bottomPrice;

  const onSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        user_id: parseInt(data.userId),
        total_amount: calculateTotal(),
        invoice_number: data.invoiceNumber,
        customer_name: data.customerName,
        items: data.items.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price
        }))
      };
      await axios.post(`${API_URL}/invoices`, payload);
      alert("Invoice saved to database successfully!");
      navigate("/invoices");
    } catch (error) {
      console.error(error);
      alert("Failed to save invoice. Please check your data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/invoices" className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Invoice</h1>
          <p className="text-muted-foreground mt-1">Manual entry or upload your Invoice PDF/Image</p>
        </div>
      </div>

      {/* Upload Zone */}
      <div 
        {...getRootProps()} 
        className={`bg-card border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        } ${uploadSuccess ? "border-green-500 bg-green-50/50" : ""}`}
      >
        <input {...getInputProps()} />
        {isProcessing ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="font-medium">AI is reading your document...</p>
            <p className="text-xs text-muted-foreground italic">Analyzing GLORY Interior structure...</p>
          </div>
        ) : uploadSuccess ? (
          <div className="flex flex-col items-center gap-2 text-green-600">
            <CheckCircle2 className="w-10 h-10" />
            <p className="font-bold text-lg">Invoice Scanned Successfully!</p>
            <p className="text-sm text-green-600/70">Data has been auto-filled below. Please review it.</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">Click to upload or drag & drop</p>
              <p className="text-sm text-muted-foreground mt-1">PDF, JPG, or PNG (GLORY Interior & Property Format)</p>
            </div>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Dynamic Form Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                General Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Invoice Number</label>
                  <input
                    {...register("invoiceNumber")}
                    className={`w-full px-4 py-2 bg-input-background border rounded-lg outline-none focus:ring-2 focus:ring-primary ${errors.invoiceNumber ? 'border-red-500' : 'border-input'}`}
                    placeholder="INV/XX/XX/XXXXX"
                  />
                  {errors.invoiceNumber && <span className="text-xs text-red-500">{errors.invoiceNumber.message}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Invoice Date</label>
                  <input
                    {...register("date")}
                    type="date"
                    className="w-full px-4 py-2 bg-input-background border border-input rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sales Team</label>
                  <select
                    {...register("team")}
                    className="w-full px-4 py-2 bg-input-background border border-input rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Team</option>
                    <option value="Lelang">Lelang</option>
                    <option value="Shopee">Shopee</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sales Person</label>
                  <select
                    {...register("userId")}
                    className="w-full px-4 py-2 bg-input-background border border-input rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select User</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium">Customer (Name & Address)</label>
                  <textarea
                    {...register("customerName")}
                    rows={2}
                    className="w-full px-4 py-2 bg-input-background border border-input rounded-lg outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter customer details..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold">Ordered Items</h2>
                <button
                  type="button"
                  onClick={() => append({ id: Date.now().toString(), productName: "", quantity: 1, price: 0, bottomPrice: 0 })}
                  className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-all flex items-center gap-1.5 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add New Line
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr className="text-left text-xs text-muted-foreground uppercase font-semibold">
                      <th className="px-6 py-4">Item Description</th>
                      <th className="px-6 py-4 w-24">Qty</th>
                      <th className="px-6 py-4 w-40">Unit Price</th>
                      <th className="px-6 py-4 w-40">Subtotal</th>
                      <th className="px-6 py-4 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {fields.map((field, index) => {
                      const item = watchedItems[index];
                      const warning = isBelowBottomPrice(item);
                      return (
                        <tr key={field.id} className={`${warning ? "bg-yellow-50/50" : ""} hover:bg-secondary/10 transition-colors`}>
                          <td className="px-6 py-4">
                            <textarea
                              {...register(`items.${index}.productName`)}
                              rows={2}
                              className="w-full text-sm bg-transparent border-none focus:ring-0 p-0 resize-none font-medium"
                              placeholder="Product Name..."
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                              type="number"
                              className="w-full bg-input-background border border-input rounded px-2 py-1 text-sm outline-none"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <input
                                {...register(`items.${index}.price`, { valueAsNumber: true })}
                                type="number"
                                className={`w-full bg-input-background border ${warning ? 'border-yellow-400' : 'border-input'} rounded px-2 py-1 text-sm outline-none`}
                              />
                              {warning && (
                                <p className="text-[10px] text-yellow-700 font-bold flex items-center gap-0.5 animate-pulse">
                                  <AlertTriangle className="w-3 h-3" /> BELOW BOTTOM
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-sm">
                            {formatRupiah(calculateSubtotal(item.quantity, item.price))}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="p-1 hover:bg-red-50 rounded text-muted-foreground hover:text-destructive transition-colors disabled:opacity-20"
                              disabled={fields.length === 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatRupiah(calculateTotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Item Discount</span>
                    <span className="font-medium">Rp 0</span>
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between items-center">
                    <span className="text-base font-bold">Total Amount</span>
                    <span className="text-xl font-bold text-primary">{formatRupiah(calculateTotal())}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl mt-6 font-bold hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Invoice"}
                </button>
                <Link
                   to="/invoices"
                   className="w-full flex items-center justify-center py-3 text-sm font-medium text-muted-foreground hover:text-foreground mt-2"
                >
                   Discard Changes
                </Link>
              </div>

              {calculateTotal() > 0 && (
                 <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                    <h4 className="text-xs font-bold text-blue-800 uppercase mb-1">Commission Note</h4>
                    <p className="text-[11px] text-blue-700 leading-relaxed">
                       This invoice will be processed for commission calculation. Ensure all prices are correct before submitting.
                    </p>
                 </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
