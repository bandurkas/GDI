"use client";

import { CheckCircle2, Zap, Shield, Brain, Globe, ChevronRight, ArrowRight, Server, Layout, Database, Activity, Code, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { Dictionary } from "@/lib/dictionaries";
import ProductDrawer from "@/components/ui/ProductDrawer";
import CaseModal from "@/components/ui/CaseModal";


// Product data moved to @/lib/product-data.ts and loaded lazily
import { START_AI_PACK_DETAILS, MIDDLE_SCALE_DETAILS, AUTOMATION_PLATFORM_DETAILS, ENT_ASSISTANT_DETAILS } from "@/lib/product-data";




// --- data/structure ---
// Renamed and Repriced as requested
const getSolutions = (dict: Dictionary) => [
  {
    id: "start-ai",
    name: dict.products.startAi.name,
    price: "Rp 8.500.000",
    valueProp: dict.products.startAi.valueProp,
    outcomes: dict.products.startAi.outcomes,
    features: dict.products.startAi.features,
    icon: <Zap className="text-amber-500" />,
    tier: dict.products.tierFoundation
  },
  {
    id: "middle-scale",
    name: dict.products.middleScale.name,
    price: "Rp 17.500.000",
    valueProp: dict.products.middleScale.valueProp,
    outcomes: dict.products.middleScale.outcomes,
    features: dict.products.middleScale.features,
    icon: <Brain className="text-purple-500" />,
    tier: dict.products.tierExpansion
  },
  {
    id: "automation-platform",
    name: dict.products.autoPlatform.name,
    price: "Rp 26.000.000",
    valueProp: dict.products.autoPlatform.valueProp,
    outcomes: dict.products.autoPlatform.outcomes,
    features: dict.products.autoPlatform.features,
    icon: <Activity className="text-emerald-500" />,
    tier: dict.products.tierTransformation
  },
  {
    id: "ent-assistant",
    name: dict.products.entAssistant.name,
    price: "Rp 34.000.000",
    valueProp: dict.products.entAssistant.valueProp,
    outcomes: dict.products.entAssistant.outcomes,
    features: dict.products.entAssistant.features,
    icon: <Server className="text-blue-500" />,
    tier: dict.products.tierEnterprise
  }
];

const getCases = (dict: Dictionary) => dict.products.cases; // Mapped in renderer



export default function ProductsPage() {
  const { addToCart } = useCart();
  const { dictionary } = useLanguage();
  const solutions = getSolutions(dictionary);
  const cases = getCases(dictionary);

  const [activeTab, setActiveTab] = useState('solutions');
  const [loading, setLoading] = useState<string | null>(null);
  const [activeProduct, setActiveProduct] = useState<any | null>(null);
  const [activeCase, setActiveCase] = useState<any | null>(null);
  const router = useRouter();

  const handleAddToCart = async (productId: string) => {
    setLoading(productId);
    try {
      const success = await addToCart(productId);
      if (success) {
        // router.refresh(); 
      }
    } finally {
      setLoading(null);
    }
  };

  const openDrawer = async (productId: string) => {
    // Use static data for stability
    // const { START_AI_PACK_DETAILS, MIDDLE_SCALE_DETAILS, AUTOMATION_PLATFORM_DETAILS, ENT_ASSISTANT_DETAILS } = await import("@/lib/product-data");


    if (productId === "start-ai") {
      setActiveProduct(START_AI_PACK_DETAILS);
    } else if (productId === "middle-scale") {
      setActiveProduct(MIDDLE_SCALE_DETAILS);
    } else if (productId === "automation-platform") {
      setActiveProduct(AUTOMATION_PLATFORM_DETAILS);
    } else if (productId === "ent-assistant") {
      setActiveProduct(ENT_ASSISTANT_DETAILS);
    } else {
      toast.info("Detailed scope coming soon for this plan.");
    }
  };



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30 transition-colors duration-300">

      {/* Product Drawer - Conditional Rendering for Lazy Loading code chunk */}
      {activeProduct && (
        <ProductDrawer
          isOpen={!!activeProduct}
          onClose={() => setActiveProduct(null)}
          product={activeProduct}
          onBuy={handleAddToCart}
          loading={!!loading}
        />
      )}

      {/* Case Study Modal - Conditional Rendering for Lazy Loading code chunk */}
      {activeCase && (
        <CaseModal
          isOpen={!!activeCase}
          onClose={() => setActiveCase(null)}
          caseStudy={activeCase}
        />
      )}

      {/* --- Catalog --- */}
      <div className="container mx-auto px-4 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {solutions.map((item) => (
            <div key={item.id} className="group relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30">
              {/* Tier Label */}
              <div className="absolute top-8 right-8 text-xs font-mono text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-white/10 px-2 py-1 rounded">
                {item.tier}
              </div>

              <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-6 border border-slate-100 dark:border-white/10 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{item.name}</h3>
              <p className="text-indigo-600 dark:text-indigo-200 font-medium mb-6 text-lg">{item.valueProp}</p>

              {/* Outcomes */}
              <div className="mb-8 space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{dictionary.products.businessOutcomes}</div>
                {item.outcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    {outcome}
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="mb-8 pt-6 border-t border-slate-100 dark:border-white/5 space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{dictionary.products.coreCapabilities}</div>
                <ul className="space-y-1">
                  {item.features.map((feat, idx) => (
                    <li key={idx} className="text-slate-600 dark:text-slate-400 text-sm flex gap-2">
                      <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600 mt-2"></span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2 md:gap-3 pt-4">
                <button
                  onClick={() => handleAddToCart(item.id)}
                  disabled={loading === item.id}
                  className="flex-1 py-3 px-2.5 md:px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed tracking-tight tabular-nums"
                >
                  {loading === item.id ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    item.price
                  )}
                </button>

                {/* Renamed 'Architecture' to 'What is included' */}
                <button
                  onClick={() => openDrawer(item.id)}
                  className="flex-1 py-3 px-2.5 md:px-4 bg-transparent border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white font-bold text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors whitespace-nowrap"
                >
                  {dictionary.products.whatIncluded}
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* --- Our Cases --- */}
      <div className="border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">{dictionary.common.ourCases}</h2>
            <p className="text-slate-500 dark:text-slate-400">Strategic implementation success stories across industries.</p>
          </div>

          {/* Mobile: Horizontal Scroll Snap | Desktop: Grid */}
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible pb-8 md:pb-0 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
            {cases.map((caseStudy, idx) => (
              <div key={idx} className="min-w-[85vw] md:min-w-0 snap-center md:snap-align-none p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 hover:border-indigo-500/50 transition-colors flex flex-col">
                <div className="text-sm font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-2">{caseStudy.name}</div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-1 min-h-[40px]">{caseStudy.desc}</p>

                <button
                  onClick={() => setActiveCase(caseStudy)}
                  className="w-full py-3 rounded-lg border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2 group"
                >
                  {dictionary.common.view} Case
                  <ArrowRight size={14} className="opacity-50 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Final CTA --- */}
      <section className="py-32 text-center bg-white dark:bg-slate-950">
        <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-slate-900 dark:text-white">
          {dictionary.common.readyToTransform}
        </h2>
        <div className="flex justify-center gap-6">
          <Link href="/auth/register" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-indigo-500/25">
            {dictionary.common.startTransformation}
          </Link>
        </div>
      </section>

    </div>
  );
}
