"use client";

import { CheckCircle2, Zap, Shield, Brain, Globe, ChevronRight, ArrowRight, Server, Layout, Database, Activity, Code, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";

// --- data/structure ---
// Renamed and Repriced as requested
const SOLUTIONS = [
  {
    id: "start-ai",
    name: "Start AI Pack",
    price: "Rp 8.500.000",
    valueProp: "Essential automation for beginners.",
    outcomes: ["Reduce operational costs by 40%", "Zero-touch processing"],
    features: ["Intelligent Document Processing", "Workflow Orchestration", "Human-in-the-loop"],
    icon: <Zap className="text-amber-500" />,
    tier: "Foundation"
  },
  {
    id: "middle-scale",
    name: "Middle Scale AI",
    price: "Rp 17.500.000",
    valueProp: "Secure, context-aware GenAI for teams.",
    outcomes: ["Boost employee productivity", "Secure internal data utilization"],
    features: ["RAG Architecture", "Role-based Access Control", "Custom Knowledge Base"],
    icon: <Brain className="text-purple-500" />,
    tier: "Expansion"
  },
  {
    id: "automation-platform",
    name: "AI Automation Platform",
    price: "Rp 26.000.000",
    valueProp: "Turn raw data into strategic assets.",
    outcomes: ["Real-time business intelligence", "Predictive forecasting"],
    features: ["Data Lakehouse Setup", "Real-time Dashboards", "Integrations (SAP, Salesforce)"],
    icon: <Activity className="text-emerald-500" />,
    tier: "Transformation"
  },
  {
    id: "ent-assistant",
    name: "Enterprise AI Assistant",
    price: "Rp 34.000.000",
    valueProp: "Scalable cloud foundations for AI.",
    outcomes: ["99.99% Uptime", "Global low-latency deployment"],
    features: ["Kubernetes Management", "Multi-cloud Strategy", "Security Compliance (SOC2)"],
    icon: <Server className="text-blue-500" />,
    tier: "Enterprise"
  }
];

// Plans section now "Our cases"
const CASES = [
  { name: "FinTech", price: "Case Study", desc: "Automating loan approvals with 99% accuracy." },
  { name: "Education", price: "Case Study", desc: "Personalized learning paths for 50k+ students." },
  { name: "E-commerce", price: "Case Study", desc: "Dynamic pricing engines driving 30% revenue uplift." },
  { name: "Logistics", price: "Case Study", desc: "Route optimization saving 1M miles annually." },
];

import ProductDrawer from "@/components/ui/ProductDrawer";

// ... existing imports

const START_AI_PACK_DETAILS = {
  id: "start-ai",
  title: "Start AI Pack — Full Scope",
  name: "Start AI Pack",
  tagline: "AI readiness assessment and automation strategy in 7 days",
  highlights: [
    "AI readiness score and insights",
    "4–6 prioritized AI use cases with ROI logic",
    "Clear 6-month implementation roadmap"
  ],
  scope: [
    {
      title: "Business Process Review",
      details: [
        "Review of 1–2 key departments",
        "Workflow and bottleneck analysis",
        "Automation potential mapping"
      ]
    },
    {
      title: "AI & Automation Audit",
      details: [
        "Review of existing tools and systems",
        "Identification of inefficiencies and gaps",
        "AI readiness evaluation"
      ]
    },
    {
      title: "AI Use Case Identification",
      details: [
        "4–6 high-impact AI use cases",
        "ROI-based prioritization",
        "Business justification for each case"
      ]
    },
    {
      title: "Data & Infrastructure Assessment",
      details: [
        "Data sources review",
        "Data quality and accessibility check",
        "Infrastructure readiness evaluation"
      ]
    },
    {
      title: "Strategy & Recommendations",
      details: [
        "Detailed PDF report",
        "Practical implementation guidance"
      ]
    }
  ],
  deliverables: [
    "AI readiness assessment report (PDF)",
    "Prioritized AI use case list",
    "Step-by-step roadmap",
    "Optional online presentation"
  ],
  timeline: [
    { day: "Day 1", activity: "Kickoff & alignment" },
    { day: "Day 2–4", activity: "Analysis & audit" },
    { day: "Day 5–6", activity: "Use case mapping & strategy" },
    { day: "Day 7", activity: "Final report & walkthrough" }
  ],
  bestFor: [
    "Companies starting AI adoption",
    "Businesses assessing AI readiness",
    "Teams before AI investment"
  ],
  value: [
    "Reduced implementation risk",
    "Better investment decisions",
    "Faster transition from strategy to execution"
  ]
};

const MIDDLE_SCALE_DETAILS = {
  id: "middle-scale",
  title: "Middle Scale AI — Growth",
  name: "Middle Scale AI",
  tagline: "AI becomes a core operational capability",
  highlights: [
    "12-Month AI Roadmap & Strategy",
    "1–2 Custom AI/Automation Solutions",
    "Team Training & Risk Framework"
  ],
  scope: [
    {
      title: "AI Strategy & 12-Month Roadmap",
      details: ["AI opportunity assessment", "Prioritization of high-impact use cases", "Clear 12-month implementation roadmap"]
    },
    {
      title: "1–2 AI or Automation Solutions",
      details: ["Design and implementation", "Process automation", "Internal AI tools", "Workflow optimization"]
    },
    {
      title: "Training for Management & Teams",
      details: ["Executive-level AI overview", "Practical training for operational teams", "Adoption and change-management guidance"]
    },
    {
      title: "AI Policies & Risk Framework",
      details: ["AI usage policies", "Risk and compliance considerations", "Responsible AI guidelines"]
    },
    {
      title: "KPI & ROI Tracking Model",
      details: ["Definition of success metrics", "KPI framework to track performance", "ROI model to measure business impact"]
    }
  ],
  deliverables: [
    "12-month AI roadmap",
    "1–2 implemented AI / automation solutions",
    "Training materials for management and teams",
    "AI policy and risk framework documents",
    "KPI and ROI tracking model"
  ],
  timeline: [
    { day: "Phase 1", activity: "Kick-off workshop" },
    { day: "Phase 2", activity: "Strategy and roadmap finalization" },
    { day: "Phase 3", activity: "Solution design and implementation" },
    { day: "Phase 4", activity: "Training and adoption support" },
    { day: "Phase 5", activity: "KPI and ROI setup" }
  ],
  bestFor: [
    "Scaling Companies",
    "Operations Teams",
    "Business Transformation"
  ],
  value: [
    "Faster and smarter processes",
    "Reduced operational costs",
    "Clear visibility into AI impact and ROI"
  ]
};

const AUTOMATION_PLATFORM_DETAILS = {
  id: "automation-platform",
  title: "AI Automation Platform",
  name: "AI Automation Platform",
  tagline: "Turn raw data into strategic assets",
  highlights: [
    "Custom AI/ML Solution Development",
    "Deep System Integrations (CRM, ERP)",
    "Secure Cloud Deployment"
  ],
  scope: [
    {
      title: "Custom AI / ML Solution",
      details: ["End-to-end development", "Built around business objectives", "Tailored model training"]
    },
    {
      title: "Works with Your Company Data",
      details: ["Structured and unstructured data", "Historical business data", "Secure data handling"]
    },
    {
      title: "System Integrations",
      details: ["CRM and ERP platforms", "Google services", "Meta and marketing platforms", "Internal tools via APIs"]
    },
    {
      title: "Cloud Deployment",
      details: ["Production-ready cloud deployment", "Scalable architecture", "Infrastructure alignment"]
    },
    {
      title: "Technical Documentation",
      details: ["Model architecture overview", "Data flow explanation", "Deployment and usage docs"]
    },
    {
      title: "Post-Launch Support",
      details: ["30 days of technical support", "Bug fixes and minor adjustments", "Performance monitoring"]
    }
  ],
  deliverables: [
    "Trained AI/ML model",
    "Model evaluation reports",
    "Deployment instructions",
    "Technical documentation"
  ],
  timeline: [
    { day: "Month 1-2", activity: "Data Preparation & Model Design" },
    { day: "Month 3-4", activity: "Development & Training" },
    { day: "Month 5", activity: "Integration & Deployment" },
    { day: "Month 6", activity: "Testing & Handover" }
  ],
  bestFor: [
    "Retail and e-commerce",
    "Financial services",
    "Logistics and supply chain",
    "Education networks"
  ],
  value: [
    "Reduced manual processing",
    "Faster decision-making",
    "Scalable AI foundation"
  ]
};

const ENT_ASSISTANT_DETAILS = {
  id: "ent-assistant",
  title: "Enterprise AI Assistant",
  name: "Enterprise AI Assistant",
  tagline: "Secure, scalable AI workforce",
  highlights: [
    "Multi-Department AI Assistant",
    "Role-Based Access & Security",
    "Advanced Analytics & Governance"
  ],
  scope: [
    {
      title: "Enterprise AI Assistant Platform",
      details: ["Custom AI assistant", "Aligned with internal processes"]
    },
    {
      title: "Multi-Department Use Cases",
      details: ["Customer support", "Sales & Lead Qualification", "HR & Internal Support", "Knowledge Management"]
    },
    {
      title: "Role-Based Access",
      details: ["Department-level access control", "Secure internal usage", "Policy alignment"]
    },
    {
      title: "Advanced Analytics",
      details: ["Usage analytics", "Performance tracking", "Response improvement insights"]
    },
    {
      title: "AI Governance",
      details: ["Usage guidelines", "Governance rules", "Responsible AI standards"]
    },
    {
      title: "Data Privacy",
      details: ["Privacy-first architecture", "Compliance alignment", "Secure data handling"]
    },
    {
      title: "Training & Enablement",
      details: ["Management onboarding", "Team workshops", "Usage guidelines"]
    }
  ],
  deliverables: [
    "Enterprise AI assistant platform",
    "Role-based access setup",
    "AI governance framework",
    "Analytics dashboards",
    "SLA and support setup"
  ],
  timeline: [
    { day: "Week 1-4", activity: "Discovery & Architecture" },
    { day: "Week 5-12", activity: "Development & Integration" },
    { day: "Week 13-16", activity: "Testing & Compliance" },
    { day: "Week 17-20", activity: "Rollout & Training" }
  ],
  bestFor: [
    "Large enterprises",
    "Multinational companies",
    "Multi-branch organizations"
  ],
  value: [
    "Reduced operational workload",
    "Faster response times",
    "Improved consistency"
  ]
};

export default function ProductsPage() {
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('solutions');
  const [loading, setLoading] = useState<string | null>(null);
  const [activeProduct, setActiveProduct] = useState<any | null>(null);
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

  const openDrawer = (productId: string) => {
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

      {/* Drawer */}
      <ProductDrawer
        isOpen={!!activeProduct}
        onClose={() => setActiveProduct(null)}
        product={activeProduct}
        onBuy={handleAddToCart}
        loading={!!loading}
      />

      {/* --- Header --- */}
      <div className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-indigo-600 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            GDI Solutions Ecosystem
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-slate-900 dark:text-white">
            Enterprise AI <br /> Infrastructure
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
            A complete suite of intelligent tools to transform your business.
            From automation foundations to full-scale AI operations.
          </p>
        </div>
      </div>

      {/* --- Catalog --- */}
      <div className="container mx-auto px-4 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {SOLUTIONS.map((item) => (
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
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Business Outcomes</div>
                {item.outcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    {outcome}
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="mb-8 pt-6 border-t border-slate-100 dark:border-white/5 space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Core Capabilities</div>
                <ul className="space-y-1">
                  {item.features.map((feat, idx) => (
                    <li key={idx} className="text-slate-600 dark:text-slate-400 text-sm flex gap-2">
                      <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600 mt-2"></span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="flex-1 flex gap-2">
                  <button
                    onClick={() => handleAddToCart(item.id)}
                    disabled={loading === item.id}
                    className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed tracking-tight tabular-nums"
                  >
                    {loading === item.id ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      item.price
                    )}
                  </button>
                </div>

                {/* Renamed 'Architecture' to 'What is included' */}
                <button
                  onClick={() => openDrawer(item.id)}
                  className="py-3 px-4 bg-transparent border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  What is included
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* --- Our Cases (was Plans) --- */}
      <div className="border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Our Cases</h2>
            <p className="text-slate-500 dark:text-slate-400">Strategic implementation success stories across industries.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CASES.map((plan, idx) => (
              <div key={idx} className="p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 hover:border-indigo-500/50 transition-colors">
                <div className="text-sm font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-2">{plan.name}</div>
                {/* <div className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{plan.price}</div> */}
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 h-10">{plan.desc}</p>

                {/* Renamed 'Consult' to 'more' */}
                <button className="w-full py-2 rounded border border-slate-300 dark:border-white/20 text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
                  more
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Final CTA --- */}
      <section className="py-32 text-center bg-white dark:bg-slate-950">
        <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-slate-900 dark:text-white">
          Ready to transform?
        </h2>
        <div className="flex justify-center gap-6">
          <Link href="/auth/register" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-indigo-500/25">
            Start AI Transformation
          </Link>
        </div>
      </section>

    </div>
  );
}
