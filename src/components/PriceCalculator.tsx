import React, { useState, useEffect } from "react";
import { useOrders } from "@/context/OrderContext";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

interface PriceCalculatorProps {
  file: File;
  pageCount: {
    color: number;
    bw: number;
  };
  onReset: () => void;
}

const PriceCalculator: React.FC<PriceCalculatorProps> = ({ file, pageCount, onReset }) => {
  const { addOrder, inventory } = useOrders();
  const [customer, setCustomer] = useState({ name: "", whatsapp: "" });
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [options, setOptions] = useState({
    binding: "none",
    cover: "none",
    laminating: false,
  });

  const [totalPrice, setTotalPrice] = useState(0);

  // Load prices from context instead of constants
  const PRICING = {
    binding: {
      none: 0,
      spiral: 15000,
      lakban: 5000,
      hardcover: 35000,
    },
    cover: {
      none: 0,
      soft: 5000,
      hard: 15000,
    },
    laminating: 10000,
  };

  useEffect(() => {
    let price = 0;
    const totalPages = pageCount.bw + pageCount.color;
    const isBulk = totalPages >= inventory.bulkThreshold;

    // Apply bulk or standard pricing
    const currentPriceBw = isBulk ? inventory.bulkPriceBw : inventory.priceBw;
    const currentPriceColor = isBulk ? inventory.bulkPriceColor : inventory.priceColor;

    price += pageCount.bw * currentPriceBw;
    price += pageCount.color * currentPriceColor;

    price += PRICING.binding[options.binding as keyof typeof PRICING.binding];
    price += PRICING.cover[options.cover as keyof typeof PRICING.cover];
    if (options.laminating) price += PRICING.laminating;
    setTotalPrice(price);
  }, [pageCount, options, inventory]);

  const handleSubmit = async () => {
    if (!customer.name || !customer.whatsapp) {
      alert("Please fill in your name and WhatsApp number.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Upload File to Firebase Storage
      const storageRef = ref(storage, `orders/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      const fileUrl = await new Promise<string>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => reject(error),
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });

      // 2. Add Order to Firestore
      await addOrder({
        customerName: customer.name,
        whatsapp: customer.whatsapp,
        fileName: file.name,
        fileSize: file.size,
        pageCount,
        options,
        totalPrice,
        fileUrl,
      });

      alert("Order submitted successfully! We will contact you via WhatsApp.");
      onReset();
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Submission failed. Please check your connection.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };


  return (
    <div className="premium-card p-8 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold">Price Calculation</h2>
          <p className="text-muted-foreground text-sm">Real-time quote based on your document</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-primary">Rp {totalPrice.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Estimated Total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Analysis Summary */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase text-muted-foreground">Document Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between p-3 glass rounded-lg">
              <span>B&W Pages ({pageCount.bw})</span>
              <span className="font-bold">
                Rp {((pageCount.bw + pageCount.color >= inventory.bulkThreshold ? inventory.bulkPriceBw : inventory.priceBw) * pageCount.bw).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between p-3 glass rounded-lg border-l-4 border-l-primary">
              <span>Color Pages ({pageCount.color})</span>
              <span className="font-bold">
                Rp {((pageCount.bw + pageCount.color >= inventory.bulkThreshold ? inventory.bulkPriceColor : inventory.priceColor) * pageCount.color).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Upsell Options */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase text-muted-foreground">Layanan Tambahan (Upsell)</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold mb-2 block">Jilid (Binding)</label>
              <select
                className="w-full bg-secondary border border-border p-2 rounded-md text-sm"
                value={options.binding}
                onChange={(e) => setOptions({ ...options, binding: e.target.value })}
              >
                <option value="none">Tanpa Jilid</option>
                <option value="lakban">Lakban (+ Rp 5k)</option>
                <option value="spiral">Spiral (+ Rp 15k)</option>
                <option value="hardcover">Hard Cover (+ Rp 35k)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-2 block">Cover Type</label>
              <div className="flex space-x-2">
                {["none", "soft", "hard"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setOptions({ ...options, cover: c })}
                    className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${
                      options.cover === c ? "bg-primary text-black" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="laminating"
                className="w-4 h-4 accent-primary"
                checked={options.laminating}
                onChange={(e) => setOptions({ ...options, laminating: e.target.checked })}
              />
              <label htmlFor="laminating" className="text-sm font-medium">Laminating (+ Rp 10k)</label>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-border flex flex-col md:flex-row gap-4 items-center justify-between">
        <p className="text-xs text-muted-foreground max-w-sm italic">
          *Note: Final price may vary slightly after physical inspection of the document.
        </p>
        <div className="flex space-x-4 w-full md:w-auto">
          <button onClick={onReset} className="px-6 py-3 text-sm font-bold text-muted-foreground hover:text-foreground">
            Cancel
          </button>
          <button 
            onClick={() => setShowCheckout(!showCheckout)} 
            className="btn-primary flex-1 md:flex-none px-10"
          >
            {showCheckout ? "Hide Checkout" : "Confirm & Checkout"}
          </button>
        </div>
      </div>

      {showCheckout && (
        <div className="pt-6 border-t border-border animate-in slide-in-from-top-4 duration-500">
          <h3 className="text-lg font-bold mb-4">Finalize Your Order</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs font-semibold mb-2 block">Your Name</label>
              <input 
                type="text"
                placeholder="Ex: John Doe"
                className="w-full bg-secondary border border-border p-3 rounded-lg text-sm"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-2 block">WhatsApp Number</label>
              <input 
                type="text"
                placeholder="Ex: 08123456789"
                className="w-full bg-secondary border border-border p-3 rounded-lg text-sm"
                value={customer.whatsapp}
                onChange={(e) => setCustomer({ ...customer, whatsapp: e.target.value })}
              />
            </div>
          </div>
          <button 
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="w-full bg-foreground text-background py-4 rounded-xl font-black text-lg hover:bg-foreground/90 transition-all flex items-center justify-center space-x-3"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-bold">{Math.round(uploadProgress)}% Uploading...</span>
              </div>
            ) : (
              <>
                <span>Submit Order via WhatsApp</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.174.198-.298.297-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </>
            )}

          </button>
        </div>
      )}
    </div>
  );
};

export default PriceCalculator;
