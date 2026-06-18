"use client";

import { Lock, Zap, Check, X } from "lucide-react";
import { useState, useEffect } from "react";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TokenPackage {
  id: string;
  name: string;
  token_amount: number;
  price_kes: number;
  discount_percent: number;
}

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPackages();
    }
  }, [isOpen]);

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/tokens/packages");
      const data = await res.json();
      if (data.packages && data.packages.length > 0) {
        setPackages(data.packages);
        setSelectedPackageId(data.packages[1]?.id || data.packages[0]?.id);
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackageId) return;

    setLoading(true);
    try {
      const res = await fetch("/api/tokens/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: selectedPackageId }),
      });

      const data = await res.json();
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      }
    } catch (error) {
      console.error("Failed to initiate purchase:", error);
      alert("Failed to start payment process");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedPackage = packages.find((p) => p.id === selectedPackageId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
          <Zap className="h-8 w-8" />
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-2xl font-bold text-slate-900">
          Out of Tokens
        </h2>
        <p className="mb-6 text-center text-slate-600">
          Purchase tokens to continue making profit calculations and saving products.
        </p>

        {/* Token Packages */}
        <div className="mb-6 space-y-2">
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setSelectedPackageId(pkg.id)}
              className={`w-full rounded-xl p-4 text-left transition-all ${
                selectedPackageId === pkg.id
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : "border border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-slate-900">
                      {pkg.name}
                    </span>
                    {pkg.discount_percent > 0 && (
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
                        Save {pkg.discount_percent}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    {pkg.token_amount} tokens
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">
                    KES {pkg.price_kes.toLocaleString()}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Summary */}
        {selectedPackage && (
          <div className="mb-6 rounded-xl bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">You&apos;ll get</span>
              <span className="flex items-center gap-2 font-bold text-slate-900">
                <Zap className="h-4 w-4 text-blue-600" />
                {selectedPackage.token_amount} tokens
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="text-2xl font-bold text-slate-900">
                KES {selectedPackage.price_kes.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handlePurchase}
            disabled={loading || !selectedPackageId}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Buy Tokens"}
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-slate-200 px-6 py-3 font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
