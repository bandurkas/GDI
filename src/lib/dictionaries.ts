
export type Dictionary = typeof en;

const en = {
    common: {
        loading: "Loading...",
        getStarted: "Get Started",
        login: "Login",
        logout: "Logout",
        dashboard: "Dashboard",
        adminManager: "Manager",
        products: "Products",
        cart: "Cart",
        contactSales: "Contact sales",
        startNow: "Start now",
        view: "View",
        more: "more",
        cancel: "Cancel",
        pay: "Pay",
        orPayWithCard: "Or pay with card",
        email: "Email",
        cardInfo: "Card Information",
        paymentSuccessful: "Payment Successful",
        globalPayout: "Global Payout",
        sentToId: "Sent to ID",
        aboutUs: "About Us",
        ourMission: "Our Mission",
        ourCases: "Our Cases",
        keyStrengths: "Key Strengths",
        readyToTransform: "Ready to transform?",
        startTransformation: "Start AI Transformation",
        browseServices: "Browse Services",
        unknownService: "Unknown Service",
        completed: "Completed",
        profile: "Profile",
        save: "Save Changes",
        success: "Success",
        error: "Error"
    },
    nav: {
        solutions: "Solutions",
        ecosystem: "GDI Solutions Ecosystem"
    },
    home: {
        heroTitle: "AI Solutions and Data-Center Infrastructure for Growing Businesses",
        heroSubtitle: "Global Digital Informasi helps companies put AI to work and run their servers reliably: from AI strategy, automation and custom software to managed server colocation across multiple data centers in Jakarta.",
        badge: "AI + Infrastructure • Jakarta",
        trustedBy: "What we deliver",
        capabilities: ["AI consulting & roadmaps", "Process automation", "Custom AI & software", "Managed server colocation", "NVIDIA H100 / H200 / B200 / B300", "Multi-data-center Jakarta"],
        pillarsEyebrow: "Two ways we help",
        pillarsTitle: "Software that thinks. Infrastructure that holds.",
        pillarsIntro: "Most companies need both: intelligent systems that improve the business, and a reliable place to run them. GDI delivers each as a managed service with one point of responsibility.",
        pillarAi: {
            badge: "AI & Software",
            title: "AI Solutions & Custom Software",
            desc: "Packaged AI programs from a 7-day readiness assessment to a full automation platform, plus custom development around your data and processes.",
            points: ["AI readiness assessment and prioritized use cases", "Automation of document, sales and operations workflows", "Custom AI / ML solutions integrated with CRM, ERP and cloud"],
            cta: "Explore AI packages",
        },
        pillarInfra: {
            badge: "Infrastructure",
            title: "Managed Server Colocation & AI Infrastructure",
            desc: "Rack space, power, connectivity, installation and remote hands across partner data centers in Jakarta — from one 1U server to high-density NVIDIA B200 / B300 clusters.",
            points: ["Facility selection matched to power, cooling and budget", "Installation, remote hands, incidents and monthly reporting", "Instant indicative pricing with an online calculator"],
            from: "From",
            perMonth: "/ month",
            cta: "Calculate colocation cost",
        },
        aboutTitle: "Strategic Digital Partner for the Future Economy.",
        aboutText1: "Global Digital Informasi is a technology company delivering AI-driven software and managed infrastructure services for businesses in Indonesia and worldwide.",
        aboutText2: "Our expertise covers AI consulting, automation, virtual assistants and custom digital products, as well as managed server colocation across multiple partner data centers in Jakarta. Instead of generic solutions, we design systems around each client’s data, goals and operational processes.",
        aboutText3: "We work with businesses of different sizes — from growing startups to established companies — as a single accountable partner for both the software layer and the infrastructure it runs on.",
        missionQuote: "\"To make advanced AI and digital technologies practical, accessible, and measurable in real business performance.\"",
        missionLink: "Join our journey",
        strengthCustom: { title: "Custom Solutions", desc: "AI and software designed around your data, goals and processes — not templates." },
        strengthPerf: { title: "Secure & Scalable", desc: "Secure, scalable architecture from application code to rack, power and network." },
        strengthAuto: { title: "Automation Expertise", desc: "Proven experience turning manual workflows into measurable automation." },
        strengthPartner: { title: "One Point of Responsibility", desc: "One GDI team for delivery, operations, incidents and reporting." },
        strengthGlobal: { title: "Jakarta-Based, Global Reach", desc: "Local data-center presence in Jakarta, serving clients worldwide." },
        strengthFast: { title: "Fast", desc: "Optimized performance." },
        strengthInfra: { title: "Infrastructure-Ready", desc: "Multiple partner facilities, GPU-ready power and cooling planning." },
        choosingGdi: "Why companies choose GDI.",
        footerText: "Global Digital Informasi is not just a technology vendor, but a strategic digital partner helping businesses build sustainable growth in the digital economy.",
        exploreSolutions: "Explore Solutions",
        exploreInfra: "Data Center & Colocation"
    },
    products: {
        title: "Enterprise AI Infrastructure",
        subtitle: "A complete suite of intelligent tools to transform your business. From automation foundations to full-scale AI operations.",
        businessOutcomes: "Business Outcomes",
        coreCapabilities: "Core Capabilities",
        whatIncluded: "What is included",
        tierFoundation: "Foundation",
        tierExpansion: "Expansion",
        tierTransformation: "Transformation",
        tierEnterprise: "Enterprise",
        startAi: {
            name: "Start AI Pack",
            valueProp: "Essential automation for beginners.",
            outcomes: ["Reduce operational costs by 40%", "Zero-touch processing"],
            features: ["Intelligent Document Processing", "Workflow Orchestration", "Human-in-the-loop"]
        },
        middleScale: {
            name: "Middle Scale AI",
            valueProp: "Secure, context-aware GenAI for teams.",
            outcomes: ["Boost employee productivity", "Secure internal data utilization"],
            features: ["RAG Architecture", "Role-based Access Control", "Custom Knowledge Base"]
        },
        autoPlatform: {
            name: "AI Automation Platform",
            valueProp: "Turn raw data into strategic assets.",
            outcomes: ["Real-time business intelligence", "Predictive forecasting"],
            features: ["Data Lakehouse Setup", "Real-time Dashboards", "Integrations (SAP, Salesforce)"]
        },
        entAssistant: {
            name: "Enterprise AI Assistant",
            valueProp: "Scalable cloud foundations for AI.",
            outcomes: ["99.99% Uptime", "Global low-latency deployment"],
            features: ["Kubernetes Management", "Multi-cloud Strategy", "Security Compliance (SOC2)"]
        },
        cases: [
            { name: "FinTech", desc: "Automating loan approvals with 99% accuracy." },
            { name: "Education", desc: "Personalized learning paths for 50k+ students." },
            { name: "E-commerce", desc: "Dynamic pricing engines driving 30% revenue uplift." },
            { name: "Logistics", desc: "Route optimization saving 1M miles annually." }
        ]
    },
    dashboard: {
        title: "User Dashboard",
        welcome: "Welcome back,",
        cashback: "Cashback",
        totalBills: "Total Bills",
        withdrawFunds: "Withdraw Funds",
        amountLabel: "Amount (IDR)",
        minWithdraw: "Minimum withdrawal amount is Rp 10.000",
        requestPayout: "Request Payout",
        processing: "Processing...",
        payoutHistory: "Payout History",
        noPayouts: "No payout history yet.",
        purchasedServices: "Purchased Services",
        noServices: "No services purchased yet.",
        tableDate: "Date",
        tableAmount: "Amount",
        tableStatus: "Status",
        tableReceipt: "Receipt",
        page: "Page",
        of: "of",
        profileTitle: "Your Profile",
        profileSubtitle: "Manage your personal information and payout settings.",
        personalInfo: "Personal Information",
        payoutSettings: "Payout Settings",
        nameLabel: "Full Name",
        namePlaceholder: "John Doe",
        walletLabel: "USDT Wallet Address (TRC20)",
        walletPlaceholder: "T...",
        telegramLabel: "Telegram Username",
        telegramPlaceholder: "@username",
        updateSuccess: "Profile updated successfully.",
        updateError: "Failed to update profile.",
        awaitingPayment: "Awaiting payment",
        cancelled: "Cancelled",
        paymentInstructions: "Payment Instructions",
        paymentInstructionsIntro: "Transfer the order total to the account below. Put the order reference in the transfer description so we can match your payment.",
        bankName: "Bank",
        accountNumber: "Account number",
        accountHolder: "Account holder",
        swift: "SWIFT / BIC",
        orderReference: "Payment reference",
        amountToPay: "Amount to pay",
        copied: "Copied",
        copy: "Copy",
        afterTransfer: "Once we confirm the transfer (usually within 1 business day) the order is marked as completed and your cashback is credited.",
        pendingOrders: "Orders awaiting payment"
    },
    auth: {
        signInTitle: "Sign in to your account",
        createAccountTitle: "Create an account",
        or: "Or",
        createAccountLink: "create a new account",
        signInLink: "sign in to your existing account",
        emailLabel: "Email address",
        passwordLabel: "Password",
        signInButton: "Sign in",
        signingInButton: "Signing in...",
        registerButton: "Register",
        registeringButton: "Creating account...",
        emailPlaceholder: "you@example.com",
        passwordPlaceholder: "••••••••",
        minChar: "Minimum 6 characters",
        errorInvalid: "Invalid email or password",
        errorGeneric: "Something went wrong",
        guestModalTitle: "Ready to Transform?",
        guestModalMsg: "Join GDI today to add premium AI solutions to your cart and start your transformation journey.",
        guestModalRegister: "Create Account",
        guestModalLogin: "Already have an account? Sign In"
    },
    cart: {
        title: "Your Shopping Cart",
        emptyCart: "Empty Cart",
        cartEmptyTitle: "Your cart is empty",
        cartEmptyMsg: "Looks like you haven't added any AI solutions to your cart yet.",
        startShopping: "Start Shopping",
        quantity: "Quantity",
        each: "each",
        summary: "Order Summary",
        subtotal: "Subtotal",
        tax: "Tax",
        total: "Total",
        estimatedCashback: "Estimated Cashback",
        instantReward: "INSTANT REWARD",
        payNow: "Pay Now",
        placeOrder: "Place Order",
        bankTransferTitle: "Payment by bank transfer",
        bankTransferNote: "After placing the order you will receive our bank details. The service is activated as soon as we confirm your transfer.",
        processing: "Processing...",
        paymentFailed: "Payment failed",
        agreeTo: "I agree to the",
        refundPolicy: "Refund Policy"
    },
    admin: {
        title: "Admin Console",
        users: "Users",
        payouts: "Payouts",
        financials: "Financials",
        searchPlaceholder: "Search users or payouts...",
        updateStatus: "Update Payout Status",
        payoutId: "Payout ID",
        amount: "Amount",
        newStatus: "New Status",
        receiptUrl: "Receipt URL",
        comment: "Internal Comment (Private)",
        updating: "Updating...",
        updateButton: "Update Status",
        update: "Update",
        userEmail: "User",
        requested: "Requested",
        status: "Status",
        actions: "Actions",
        noPayouts: "No payouts found.",
        cashbackPercent: "Cashback %",
        totalSpent: "Total Spent",
        availableBalance: "Balance",
        role: "Role",
        joined: "Joined",
        savePercent: "Save %",
        edit: "Edit",
        allUsers: "All Users",
        statsToday: "Today's Orders",
        statsTotal: "Total Payouts Paid",
        set: "Set",
        orders: "Orders",
        order: "Order",
        method: "Method",
        confirmPayment: "Confirm payment",
        cancelOrder: "Cancel order",
        noOrders: "No orders found.",
        paymentConfirmed: "Payment confirmed, cashback credited.",
        orderCancelled: "Order cancelled.",
        confirmPaymentPrompt: "Confirm that the bank transfer for this order has been received?",
        leads: "Colocation Leads",
        lead: "Lead",
        estimate: "Estimate",
        noLeads: "No leads yet.",
        leadStatusUpdated: "Lead status updated."
    },
    footer: {
        rights: "All rights reserved.",
        solutions: "Solutions",
        company: "Company",
        support: "Support",
        privacy: "Privacy Policy",
        terms: "Terms of Service",
        refund: "Refund Policy",
        contact: "Contact Us"
    },
    privacy: {
        title: "Privacy Policy",
        lastUpdated: "Last updated: 12.10.25",
        sections: [
            {
                title: "1. Introduction",
                content: "Global Digital Informasi (“Company”, “we”, “our”, “us”) respects your privacy and is committed to protecting personal and business-related data. This policy explains how we collect and protect information."
            },
            {
                title: "2. Information We Collect",
                content: "We collect Personal & Business Information (name, email, role), Communication Data, and Payment Information. We do not store full credit or debit card details."
            },
            {
                title: "3. How We Use Information",
                content: "We use information to provide services, communicate with clients, process payments, manage onboarding, and comply with legal obligations. We do not use personal data for profiling."
            },
            {
                title: "4. Payment Processing",
                content: "Payments are processed by trusted third-party providers. We do not directly store sensitive payment data. Please refer to their respective policies for details."
            },
            {
                title: "5. Data Sharing & Disclosure",
                content: "We do not sell personal data. Information is shared only with payment processors, trusted service providers, or legal authorities when required by law."
            },
            {
                title: "6. Data Security",
                content: "We apply technical and organizational measures including access controls and secure channels. While we take protection seriously, no system is 100% secure."
            },
            {
                title: "7. Data Retention",
                content: "We retain data only as long as necessary for service delivery, legal compliance, or legitimate business purposes. Data is securely deleted when no longer required."
            },
            {
                title: "8. Your Rights",
                content: "You have the right to request access, correction, or deletion of your personal data. Requests can be submitted via email and will receive a response within a reasonable timeframe."
            },
            {
                title: "9. Cookies & Website Tracking",
                content: "Our website uses cookies to ensure functionality and analyze performance. You can control cookie settings through your browser, though disabling them may affect functionality."
            },
            {
                title: "10. International Data Use",
                content: "Services may involve international clients. Data may be processed in jurisdictions with different standards while we continue to apply reasonable safeguards."
            },
            {
                title: "11. Changes to This Policy",
                content: "We may update this policy periodically. The latest version is always available on this page. Continued use indicates acceptance of the updated policy."
            },
            {
                title: "12. Contact Information",
                content: "For questions about your data, contact us at info@gdiconsult.online | https://gdiconsult.online"
            }
        ]
    },
    terms: {
        title: "Terms & Conditions",
        lastUpdated: "Last updated: 12.10.25",
        sections: [
            {
                title: "1. Introduction",
                content: "These Terms & Conditions govern the use of the website and services provided by Global Digital Informasi. By accessing our website, you agree to be bound by these Terms."
            },
            {
                title: "2. Services",
                content: "GDI provides professional digital and consulting services (AI/ML, automation, strategy). All services are digital and service-based; no physical products are sold."
            },
            {
                title: "3. Payments & Pricing",
                content: "Payments are processed online in IDR. Full payment is generally required before service delivery. Failure to complete payment may result in delayed or cancelled services."
            },
            {
                title: "4. Service Delivery",
                content: "Confirmation and onboarding follow successful payment. Timelines are estimates and depend on client cooperation and scope."
            },
            {
                title: "5. Refund Policy",
                content: "Services are often customized and non-refundable once delivery has started. Refund eligibility is governed by our separate Refund Policy."
            },
            {
                title: "6. Client Responsibilities",
                content: "Clients must provide accurate information and cooperate during onboarding. Clients are responsible for business decisions made based on our recommendations."
            },
            {
                title: "7. Intellectual Property",
                content: "All materials remain GDI's intellectual property until full payment is received. Deliverables are for internal business use only."
            },
            {
                title: "8. Confidentiality & Data Handling",
                content: "Client information is treated as confidential. We apply reasonable technical measures to protect data. Clients remain owners of their business data."
            },
            {
                title: "9. Limitation of Liability",
                content: "GDI is not liable for indirect or consequential damages. Services are provided on an 'as is' and 'as available' basis."
            },
            {
                title: "10. Acceptable Use & Compliance",
                content: "Clients agree not to use services for illegal activities or fraud. We reserve the right to refuse services that violate these conditions."
            },
            {
                title: "11. Termination",
                content: "We may suspend or terminate services for violations or fraudulent activity. Termination does not automatically entitle the client to a refund."
            },
            {
                title: "12. Changes to Terms",
                content: "We may update these Terms at any time. Continued use of our services constitutes acceptance of the updated Terms."
            },
            {
                title: "13. Contact Information",
                content: "For questions, contact Global Digital Informasi at info@gdiconsult.online | https://gdiconsult.online"
            }
        ]
    },
    refund: {
        title: "Refund Policy",
        lastUpdated: "Last updated: 12.10.2025",
        sections: [
            {
                title: "1. Overview",
                content: "Global Digital Informasi provides professional digital consulting, AI & machine learning services, and custom technology solutions. All services are digital and service-based. This Refund Policy explains when refunds may be granted."
            },
            {
                title: "2. Eligibility for Refunds",
                content: "A refund may be considered only if the request is submitted before any service delivery has started, and no onboarding, consultation, or project setup has taken place. Payment was made in error or duplicated."
            },
            {
                title: "3. Non-Refundable Cases",
                content: "Refunds are generally not provided if service delivery has started, consultation sessions have occurred, or work has begun (including research, planning, analysis, design, or development). Delays caused by the client are also non-refundable."
            },
            {
                title: "4. Partial Refunds",
                content: "In limited cases, a partial refund may be considered if only a clearly defined portion of the service has been delivered and the remaining scope has not yet started. These are evaluated case by case."
            },
            {
                title: "5. Refund Method & Processing",
                content: "Approved refunds are issued to the original payment method. Processing takes 5–14 business days. Transaction fees charged by providers may be non-refundable."
            },
            {
                title: "6. How to Request a Refund",
                content: "Provide your full name, email, transaction ID, and clear reason. Send requests to info@gdiconsult.online."
            }
        ]
    }
};

const id: Dictionary = {
    common: {
        loading: "Memuat...",
        getStarted: "Mulai Sekarang",
        login: "Masuk",
        logout: "Keluar",
        dashboard: "Dasbor",
        adminManager: "Pengelola",
        products: "Produk",
        cart: "Keranjang",
        contactSales: "Hubungi Penjualan",
        startNow: "Mulai Sekarang",
        view: "Lihat",
        more: "selengkapnya",
        cancel: "Batal",
        pay: "Bayar",
        orPayWithCard: "Atau bayar dengan kartu",
        email: "Email",
        cardInfo: "Informasi Kartu",
        paymentSuccessful: "Pembayaran Berhasil",
        globalPayout: "Pembayaran Global",
        sentToId: "Dikirim ke ID",
        aboutUs: "Tentang Kami",
        ourMission: "Misi Kami",
        ourCases: "Kasus Kami",
        keyStrengths: "Kekuatan Utama",
        readyToTransform: "Siap Bertransformasi?",
        startTransformation: "Mulai Transformasi AI",
        browseServices: "Lihat Layanan",
        unknownService: "Layanan Tidak Diketahui",
        completed: "Selesai",
        profile: "Profil",
        save: "Simpan Perubahan",
        success: "Berhasil",
        error: "Kesalahan"
    },
    nav: {
        solutions: "Solusi",
        ecosystem: "Ekosistem Solusi GDI"
    },
    home: {
        heroTitle: "Solusi AI dan Infrastruktur Data Center untuk Bisnis yang Bertumbuh",
        heroSubtitle: "Global Digital Informasi membantu perusahaan memanfaatkan AI dan menjalankan server dengan andal: dari strategi AI, otomatisasi dan perangkat lunak khusus hingga colocation server terkelola di berbagai data center di Jakarta.",
        badge: "AI + Infrastruktur • Jakarta",
        trustedBy: "Yang kami berikan",
        capabilities: ["Konsultasi & roadmap AI", "Otomatisasi proses", "AI & perangkat lunak khusus", "Colocation server terkelola", "NVIDIA H100 / H200 / B200 / B300", "Multi-data-center Jakarta"],
        pillarsEyebrow: "Dua cara kami membantu",
        pillarsTitle: "Perangkat lunak yang berpikir. Infrastruktur yang andal.",
        pillarsIntro: "Sebagian besar perusahaan membutuhkan keduanya: sistem cerdas yang meningkatkan bisnis, dan tempat yang andal untuk menjalankannya. GDI menyediakan keduanya sebagai layanan terkelola dengan satu titik tanggung jawab.",
        pillarAi: {
            badge: "AI & Perangkat Lunak",
            title: "Solusi AI & Perangkat Lunak Khusus",
            desc: "Program AI terpaket mulai dari asesmen kesiapan 7 hari hingga platform otomatisasi penuh, ditambah pengembangan khusus berdasarkan data dan proses Anda.",
            points: ["Asesmen kesiapan AI dan use case prioritas", "Otomatisasi alur dokumen, penjualan dan operasional", "Solusi AI / ML khusus terintegrasi dengan CRM, ERP dan cloud"],
            cta: "Lihat paket AI",
        },
        pillarInfra: {
            badge: "Infrastruktur",
            title: "Colocation Server Terkelola & Infrastruktur AI",
            desc: "Ruang rak, daya, konektivitas, instalasi dan remote hands di data center mitra di Jakarta — dari satu server 1U hingga klaster high-density NVIDIA B200 / B300.",
            points: ["Pemilihan fasilitas sesuai daya, pendinginan dan anggaran", "Instalasi, remote hands, insiden dan laporan bulanan", "Harga indikatif seketika dengan kalkulator online"],
            from: "Mulai",
            perMonth: "/ bulan",
            cta: "Hitung biaya colocation",
        },
        aboutTitle: "Mitra Digital Strategis untuk Ekonomi Masa Depan.",
        aboutText1: "Global Digital Informasi adalah perusahaan teknologi yang menyediakan perangkat lunak berbasis AI dan layanan infrastruktur terkelola untuk bisnis di Indonesia dan dunia.",
        aboutText2: "Keahlian kami mencakup konsultasi AI, otomatisasi, asisten virtual dan produk digital khusus, serta colocation server terkelola di berbagai data center mitra di Jakarta. Alih-alih solusi umum, kami merancang sistem berdasarkan data, tujuan dan proses operasional setiap klien.",
        aboutText3: "Kami bekerja dengan bisnis dari berbagai ukuran — dari startup yang sedang berkembang hingga perusahaan mapan — sebagai satu mitra yang bertanggung jawab atas lapisan perangkat lunak maupun infrastruktur tempat ia berjalan.",
        missionQuote: "\"Menjadikan AI dan teknologi digital canggih praktis, dapat diakses, dan terukur dalam kinerja bisnis nyata.\"",
        missionLink: "Bergabung dengan perjalanan kami",
        strengthCustom: { title: "Solusi Kustom", desc: "AI dan perangkat lunak yang dirancang berdasarkan data, tujuan dan proses Anda — bukan template." },
        strengthPerf: { title: "Aman & Berskala", desc: "Arsitektur aman dan berskala dari kode aplikasi hingga rak, daya dan jaringan." },
        strengthAuto: { title: "Keahlian Otomatisasi", desc: "Pengalaman terbukti mengubah alur kerja manual menjadi otomatisasi yang terukur." },
        strengthPartner: { title: "Satu Titik Tanggung Jawab", desc: "Satu tim GDI untuk delivery, operasional, insiden dan pelaporan." },
        strengthGlobal: { title: "Berbasis Jakarta, Jangkauan Global", desc: "Kehadiran data center lokal di Jakarta, melayani klien di seluruh dunia." },
        strengthFast: { title: "Cepat", desc: "Performa yang dioptimalkan." },
        strengthInfra: { title: "Siap Infrastruktur", desc: "Banyak fasilitas mitra, perencanaan daya dan pendinginan siap GPU." },
        choosingGdi: "Mengapa perusahaan memilih GDI.",
        footerText: "Global Digital Informasi bukan hanya vendor teknologi, tetapi mitra digital strategis yang membantu bisnis membangun pertumbuhan berkelanjutan dalam ekonomi digital.",
        exploreSolutions: "Jelajahi Solusi",
        exploreInfra: "Data Center & Colocation"
    },
    products: {
        title: "Infrastruktur AI Perusahaan",
        subtitle: "Rangkaian lengkap alat cerdas untuk mengubah bisnis Anda. Dari fondasi otomatisasi hingga operasi AI skala penuh.",
        businessOutcomes: "Hasil Bisnis",
        coreCapabilities: "Kemampuan Inti",
        whatIncluded: "Apa yang termasuk",
        tierFoundation: "Fondasi",
        tierExpansion: "Ekspansi",
        tierTransformation: "Transformasi",
        tierEnterprise: "Perusahaan",
        startAi: {
            name: "Paket Mulai AI",
            valueProp: "Otomatisasi penting untuk pemula.",
            outcomes: ["Kurangi biaya operasional hingga 40%", "Pemrosesan tanpa sentuhan"],
            features: ["Pemrosesan Dokumen Cerdas", "Orkestrasi Alur Kerja", "Human-in-the-loop"]
        },
        middleScale: {
            name: "AI Skala Menengah",
            valueProp: "GenAI yang aman dan sadar konteks untuk tim.",
            outcomes: ["Tingkatkan produktivitas karyawan", "Pemanfaatan data internal yang aman"],
            features: ["Arsitektur RAG", "Kontrol Akses Berbasis Peran", "Basis Pengetahuan Kustom"]
        },
        autoPlatform: {
            name: "Platform Otomatisasi AI",
            valueProp: "Ubah data mentah menjadi aset strategis.",
            outcomes: ["Intelijen bisnis waktu nyata", "Peramalan prediktif"],
            features: ["Pengaturan Data Lakehouse", "Dasbor Waktu Nyata", "Integrasi (SAP, Salesforce)"]
        },
        entAssistant: {
            name: "Asisten AI Perusahaan",
            valueProp: "Fondasi cloud yang dapat diskalakan untuk AI.",
            outcomes: ["Uptime 99.99%", "Penyebaran latensi rendah global"],
            features: ["Manajemen Kubernetes", "Strategi Multi-cloud", "Kepatuhan Keamanan (SOC2)"]
        },
        cases: [
            { name: "FinTech", desc: "Mengotomatiskan persetujuan pinjaman dengan akurasi 99%." },
            { name: "Pendidikan", desc: "Jalur pembelajaran yang dipersonalisasi untuk 50 ribu+ siswa." },
            { name: "E-commerce", desc: "Mesin harga dinamis mendorong peningkatan pendapatan 30%." },
            { name: "Logistik", desc: "Optimalisasi rute menghemat 1 juta mil setiap tahun." }
        ]
    },
    dashboard: {
        title: "Dasbor Pengguna",
        welcome: "Selamat datang kembali,",
        cashback: "Cashback",
        totalBills: "Total Tagihan",
        withdrawFunds: "Tarik Dana",
        amountLabel: "Jumlah (IDR)",
        minWithdraw: "Jumlah penarikan minimum adalah Rp 10.000",
        requestPayout: "Minta Pembayaran",
        processing: "Memproses...",
        payoutHistory: "Riwayat Pembayaran",
        noPayouts: "Belum ada riwayat pembayaran.",
        purchasedServices: "Layanan Dibeli",
        noServices: "Belum ada layanan yang dibeli.",
        tableDate: "Tanggal",
        tableAmount: "Jumlah",
        tableStatus: "Status",
        tableReceipt: "Resi",
        page: "Halaman",
        of: "dari",
        profileTitle: "Profil Anda",
        profileSubtitle: "Kelola informasi pribadi dan pengaturan penarikan Anda.",
        personalInfo: "Informasi Pribadi",
        payoutSettings: "Pengaturan Penarikan",
        nameLabel: "Nama Lengkap",
        namePlaceholder: "Budi Santoso",
        walletLabel: "Alamat Dompet USDT (TRC20)",
        walletPlaceholder: "T...",
        telegramLabel: "Username Telegram",
        telegramPlaceholder: "@username",
        updateSuccess: "Profil berhasil diperbarui.",
        updateError: "Gagal memperbarui profil.",
        awaitingPayment: "Menunggu pembayaran",
        cancelled: "Dibatalkan",
        paymentInstructions: "Instruksi Pembayaran",
        paymentInstructionsIntro: "Transfer total pesanan ke rekening di bawah ini. Cantumkan referensi pesanan pada berita transfer agar kami dapat mencocokkan pembayaran Anda.",
        bankName: "Bank",
        accountNumber: "Nomor rekening",
        accountHolder: "Atas nama",
        swift: "SWIFT / BIC",
        orderReference: "Referensi pembayaran",
        amountToPay: "Jumlah yang harus dibayar",
        copied: "Disalin",
        copy: "Salin",
        afterTransfer: "Setelah kami mengonfirmasi transfer (biasanya dalam 1 hari kerja), pesanan ditandai selesai dan cashback Anda dikreditkan.",
        pendingOrders: "Pesanan menunggu pembayaran"
    },
    auth: {
        signInTitle: "Masuk ke akun Anda",
        createAccountTitle: "Buat akun baru",
        or: "Atau",
        createAccountLink: "buat akun baru",
        signInLink: "masuk dengan akun yang ada",
        emailLabel: "Alamat Email",
        passwordLabel: "Kata Sandi",
        signInButton: "Masuk",
        signingInButton: "Sedang masuk...",
        registerButton: "Daftar",
        registeringButton: "Membuat akun...",
        emailPlaceholder: "anda@contoh.com",
        passwordPlaceholder: "••••••••",
        minChar: "Minimal 6 karakter",
        errorInvalid: "Email atau kata sandi salah",
        errorGeneric: "Terjadi kesalahan",
        guestModalTitle: "Siap Bertransformasi?",
        guestModalMsg: "Bergabunglah dengan GDI hari ini untuk menambahkan solusi AI premium ke keranjang Anda dan mulai perjalanan transformasi Anda.",
        guestModalRegister: "Buat Akun",
        guestModalLogin: "Sudah punya akun? Masuk"
    },
    cart: {
        title: "Keranjang Belanja Anda",
        emptyCart: "Kosongkan Keranjang",
        cartEmptyTitle: "Keranjang Anda kosong",
        cartEmptyMsg: "Sepertinya Anda belum menambahkan solusi AI ke keranjang Anda.",
        startShopping: "Mulai Belanja",
        quantity: "Kuantitas",
        each: "masing-masing",
        summary: "Ringkasan Pesanan",
        subtotal: "Subtotal",
        tax: "Pajak",
        total: "Total",
        estimatedCashback: "Estimasi Cashback",
        instantReward: "HADIAH LANGSUNG",
        payNow: "Bayar Sekarang",
        placeOrder: "Buat Pesanan",
        bankTransferTitle: "Pembayaran via transfer bank",
        bankTransferNote: "Setelah pesanan dibuat Anda akan menerima rekening bank kami. Layanan diaktifkan segera setelah kami mengonfirmasi transfer Anda.",
        processing: "Memproses...",
        paymentFailed: "Pembayaran gagal",
        agreeTo: "Saya setuju dengan",
        refundPolicy: "Kebijakan Refund"
    },
    admin: {
        title: "Konsol Admin",
        users: "Pengguna",
        payouts: "Penarikan",
        financials: "Keuangan",
        searchPlaceholder: "Cari pengguna atau penarikan...",
        updateStatus: "Perbarui Status Penarikan",
        payoutId: "ID Penarikan",
        amount: "Jumlah",
        newStatus: "Status Baru",
        receiptUrl: "URL Resi",
        comment: "Komentar Internal (Privat)",
        updating: "Memperbarui...",
        updateButton: "Perbarui Status",
        update: "Perbarui",
        userEmail: "Pengguna",
        requested: "Diminta",
        status: "Status",
        actions: "Tindakan",
        noPayouts: "Penarikan tidak ditemukan.",
        cashbackPercent: "Cashback %",
        totalSpent: "Total Belanja",
        availableBalance: "Saldo",
        role: "Peran",
        joined: "Bergabung",
        savePercent: "Simpan %",
        edit: "Ubah",
        allUsers: "Semua Pengguna",
        statsToday: "Pesanan Hari Ini",
        statsTotal: "Total Penarikan Dibayar",
        set: "Atur",
        orders: "Pesanan",
        order: "Pesanan",
        method: "Metode",
        confirmPayment: "Konfirmasi pembayaran",
        cancelOrder: "Batalkan pesanan",
        noOrders: "Pesanan tidak ditemukan.",
        paymentConfirmed: "Pembayaran dikonfirmasi, cashback dikreditkan.",
        orderCancelled: "Pesanan dibatalkan.",
        confirmPaymentPrompt: "Konfirmasi bahwa transfer bank untuk pesanan ini sudah diterima?",
        leads: "Lead Colocation",
        lead: "Lead",
        estimate: "Estimasi",
        noLeads: "Belum ada lead.",
        leadStatusUpdated: "Status lead diperbarui."
    },
    footer: {
        rights: "Seluruh hak cipta.",
        solutions: "Solusi",
        company: "Perusahaan",
        support: "Dukungan",
        privacy: "Kebijakan Privasi",
        terms: "Syarat & Ketentuan",
        refund: "Kebijakan Refund",
        contact: "Hubungi Kami"
    },
    privacy: {
        title: "Kebijakan Privasi",
        lastUpdated: "Terakhir diperbarui: 12.10.25",
        sections: [
            {
                title: "1. Pendahuluan",
                content: "Global Digital Informasi (“Perusahaan”, “kami”) menghormati privasi Anda dan berkomitmen untuk melindungi data pribadi dan terkait bisnis. Kebijakan ini menjelaskan cara kami mengumpulkan dan melindungi informasi."
            },
            {
                title: "2. Informasi yang Kami Kumpulkan",
                content: "Kami mengumpulkan Informasi Pribadi & Bisnis (nama, email, peran), Data Komunikasi, dan Informasi Pembayaran. Kami tidak menyimpan detail kartu kredit atau debit lengkap."
            },
            {
                title: "3. Cara Kami Menggunakan Informasi",
                content: "Kami menggunakan informasi untuk menyediakan layanan, berkomunikasi dengan klien, memproses pembayaran, mengelola onboarding, dan mematuhi kewajiban hukum. Kami tidak menggunakan data pribadi untuk profiling."
            },
            {
                title: "4. Pemrosesan Pembayaran",
                content: "Pembayaran diproses oleh penyedia pihak ketiga tepercaya. Kami tidak secara langsung menyimpan data pembayaran sensitif. Silakan merujuk ke kebijakan masing-masing penyedia."
            },
            {
                title: "5. Pembagian & Pengungkapan Data",
                content: "Kami tidak menjual data pribadi. Informasi dibagikan hanya dengan pemroses pembayaran, penyedia layanan tepercaya, atau otoritas hukum jika diwajibkan oleh undang-undang."
            },
            {
                title: "6. Keamanan Data",
                content: "Kami menerapkan langkah-langkah teknis dan organisasinal termasuk kontrol akses dan saluran aman. Meskipun kami menangani perlindungan dengan serius, tidak ada sistem yang 100% aman."
            },
            {
                title: "7. Retensi Data",
                content: "Kami menyimpan data hanya selama diperlukan untuk pengiriman layanan, kepatuhan hukum, atau tujuan bisnis yang sah. Data dihapus dengan aman jika tidak lagi diperlukan."
            },
            {
                title: "8. Hak-Hak Anda",
                content: "Anda berhak meminta akses, koreksi, atau penghapusan data pribadi Anda. Permintaan dapat diajukan melalui email dan akan ditanggapi dalam jangka waktu yang wajar."
            },
            {
                title: "9. Cookies & Pelacakan Situs Web",
                content: "Situs web kami menggunakan cookies untuk memastikan fungsionalitas dan menganalisis kinerja. Anda dapat mengatur cookie melalui browser Anda, meskipun menonaktifkannya dapat memengaruhi fungsionalitas."
            },
            {
                title: "10. Penggunaan Data Internasional",
                content: "Layanan mungkin melibatkan klien internasional. Data dapat diproses di yurisdiksi dengan standar perlindungan yang berbeda sementara kami terus menerapkan pengamanan yang wajar."
            },
            {
                title: "11. Perubahan pada Kebijakan Ini",
                content: "Kami dapat memperbarui kebijakan ini secara berkala. Versi terbaru selalu tersedia di halaman ini. Penggunaan berkelanjutan menunjukkan penerimaan terhadap kebijakan yang diperbarui."
            },
            {
                title: "12. Informasi Kontak",
                content: "Untuk pertanyaan tentang data Anda, hubungi kami di info@gdiconsult.online | https://gdiconsult.online"
            }
        ]
    },
    terms: {
        title: "Syarat & Ketentuan",
        lastUpdated: "Terakhir diperbarui: 12.10.25",
        sections: [
            {
                title: "1. Pendahuluan",
                content: "Syarat & Ketentuan ini mengatur penggunaan situs web dan layanan yang disediakan oleh Global Digital Informasi. Dengan mengakses situs web kami, Anda setuju untuk terikat oleh Syarat ini."
            },
            {
                title: "2. Layanan",
                content: "GDI menyediakan layanan digital dan konsultasi profesional (AI/ML, otomatisasi, strategi). Semua layanan bersifat digital dan berbasis layanan; tidak ada produk fisik yang dijual."
            },
            {
                title: "3. Pembayaran & Harga",
                content: "Pembayaran diproses online dalam IDR. Pembayaran penuh umumnya diperlukan sebelum pengiriman layanan. Kegagalan untuk menyelesaikan pembayaran dapat mengakibatkan keterlambatan atau pembatalan layanan."
            },
            {
                title: "4. Pengiriman Layanan",
                content: "Konfirmasi dan onboarding mengikuti pembayaran yang berhasil. Garis waktu adalah perkiraan dan tergantung pada kerja sama klien dan cakupan."
            },
            {
                title: "5. Kebijakan Refund",
                content: "Layanan sering kali dikustomisasi dan tidak dapat di-refund setelah pengiriman dimulai. Kelayakan refund diatur oleh Kebijakan Refund terpisah kami."
            },
            {
                title: "6. Tanggung Jawab Klien",
                content: "Klien harus memberikan informasi yang akurat dan bekerja sama selama onboarding. Klien bertanggung jawab atas keputusan bisnis yang dibuat berdasarkan rekomendasi kami."
            },
            {
                title: "7. Kekayaan Intelektual",
                content: "Semua materi tetap menjadi kekayaan intelektual GDI sampai pembayaran penuh diterima. Hasil kerja hanya untuk penggunaan bisnis internal."
            },
            {
                title: "8. Kerahasiaan & Penanganan Data",
                content: "Informasi klien diperlakukan sebagai rahasia. Kami menerapkan langkah-langkah teknis yang wajar untuk melindungi data. Klien tetap menjadi pemilik data bisnis mereka."
            },
            {
                title: "9. Batasan Kewajiban",
                content: "GDI tidak bertanggung jawab atas kerusakan tidak langsung atau konsekuensi. Layanan disediakan atas dasar 'apa adanya' dan 'sebagaimana tersedia'."
            },
            {
                title: "10. Penggunaan yang Diterima & Kepatuhan",
                content: "Klien setuju untuk tidak menggunakan layanan untuk kegiatan ilegal atau penipuan. Kami berhak menolak layanan yang melanggar ketentuan ini."
            },
            {
                title: "11. Pemutusan",
                content: "Kami dapat menangguhkan atau menghentikan layanan karena pelanggaran atau aktivitas penipuan. Pemutusan tidak secara otomatis memberikan hak kepada klien untuk mendapatkan refund."
            },
            {
                title: "12. Perubahan Ketentuan",
                content: "Kami dapat memperbarui Ketentuan ini kapan saja. Penggunaan layanan kami secara berkelanjutan merupakan penerimaan terhadap Ketentuan yang diperbarui."
            },
            {
                title: "13. Informasi Kontak",
                content: "Untuk pertanyaan hubungi Global Digital Informasi di info@gdiconsult.online | https://gdiconsult.online"
            }
        ]
    },
    refund: {
        title: "Kebijakan Refund",
        lastUpdated: "Terakhir diperbarui: 12.10.2025",
        sections: [
            {
                title: "1. Ikhtisar",
                content: "Global Digital Informasi menyediakan konsultasi digital profesional, layanan AI & machine learning, dan solusi teknologi kustom. Semua layanan bersifat digital dan berbasis layanan. Kebijakan Refund ini menjelaskan kapan refund dapat diberikan."
            },
            {
                title: "2. Kelayakan Refund",
                content: "Refund dapat dipertimbangkan hanya jika permintaan diajukan sebelum pengiriman layanan dimulai, dan tidak ada onboarding, konsultasi, atau pengaturan proyek yang dilakukan. Pembayaran dilakukan karena kesalahan atau duplikasi."
            },
            {
                title: "3. Kasus Non-Refundable",
                content: "Refund umumnya tidak diberikan jika pengiriman layanan telah dimulai, sesi konsultasi telah terjadi, atau pekerjaan telah dimulai (termasuk riset, perencanaan, analisis, desain, atau pengembangan). Keterlambatan yang disebabkan oleh klien juga tidak dapat di-refund."
            },
            {
                title: "4. Refund Parsial",
                content: "Dalam kasus terbatas, refund parsial dapat dipertimbangkan jika hanya sebagian layanan yang didefinisikan dengan jelas telah dikirimkan dan sisa cakupan belum dimulai. Ini dievaluasi kasus per kasus."
            },
            {
                title: "5. Metode & Pemrosesan Refund",
                content: "Refund yang disetujui dikirim ke metode pembayaran asli. Pemrosesan memakan waktu 5–14 hari kerja. Biaya transaksi yang dikenakan oleh penyedia mungkin tidak dapat di-refund."
            },
            {
                title: "6. Cara Meminta Refund",
                content: "Berikan nama lengkap, email, ID transaksi, dan alasan yang jelas. Kirim permintaan ke info@gdiconsult.online."
            }
        ]
    }
};

export const dictionaries = { en, id };
