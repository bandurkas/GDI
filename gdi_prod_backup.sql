--
-- PostgreSQL database dump
--

\restrict z3RDNBdxFh8fBjJDf3oYqAOP8KyEdWNLpABQlWTEFdyi5tUJOYgHJBrsyd5uvku

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: CashbackStatus; Type: TYPE; Schema: public; Owner: gdi_user
--

CREATE TYPE public."CashbackStatus" AS ENUM (
    'PENDING',
    'AVAILABLE',
    'PAID',
    'REVERSED'
);


ALTER TYPE public."CashbackStatus" OWNER TO gdi_user;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: gdi_user
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'COMPLETED',
    'PENDING',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."OrderStatus" OWNER TO gdi_user;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: gdi_user
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'TEST',
    'MIDTRANS'
);


ALTER TYPE public."PaymentMethod" OWNER TO gdi_user;

--
-- Name: PayoutStatus; Type: TYPE; Schema: public; Owner: gdi_user
--

CREATE TYPE public."PayoutStatus" AS ENUM (
    'REQUESTED',
    'PROCESSING',
    'PAID',
    'REFUSED',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
);


ALTER TYPE public."PayoutStatus" OWNER TO gdi_user;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: gdi_user
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN',
    'SUPER_ADMIN'
);


ALTER TYPE public."Role" OWNER TO gdi_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Cart; Type: TABLE; Schema: public; Owner: gdi_user
--

CREATE TABLE public."Cart" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Cart" OWNER TO gdi_user;

--
-- Name: CartItem; Type: TABLE; Schema: public; Owner: gdi_user
--

CREATE TABLE public."CartItem" (
    id text NOT NULL,
    "cartId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL
);


ALTER TABLE public."CartItem" OWNER TO gdi_user;

--
-- Name: CashbackTransaction; Type: TABLE; Schema: public; Owner: gdi_user
--

CREATE TABLE public."CashbackTransaction" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "orderId" text NOT NULL,
    "amountCents" integer NOT NULL,
    rate double precision DEFAULT 0.8 NOT NULL,
    status public."CashbackStatus" DEFAULT 'PENDING'::public."CashbackStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "availableAt" timestamp(3) without time zone,
    "paidAt" timestamp(3) without time zone,
    "reversedAt" timestamp(3) without time zone,
    notes text
);


ALTER TABLE public."CashbackTransaction" OWNER TO gdi_user;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: gdi_user
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "totalCents" integer NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "paymentMethod" public."PaymentMethod" DEFAULT 'TEST'::public."PaymentMethod" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Order" OWNER TO gdi_user;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: gdi_user
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    "productName" text NOT NULL,
    "priceCents" integer NOT NULL,
    quantity integer NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO gdi_user;

--
-- Name: Payout; Type: TABLE; Schema: public; Owner: gdi_user
--

CREATE TABLE public."Payout" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "amountCents" integer NOT NULL,
    status public."PayoutStatus" DEFAULT 'REQUESTED'::public."PayoutStatus" NOT NULL,
    method text,
    reference text,
    "receiptUrl" text,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "processedAt" timestamp(3) without time zone,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text
);


ALTER TABLE public."Payout" OWNER TO gdi_user;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: gdi_user
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "priceCents" integer NOT NULL,
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Product" OWNER TO gdi_user;

--
-- Name: User; Type: TABLE; Schema: public; Owner: gdi_user
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    "passwordHash" text NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "cashbackPercentage" double precision DEFAULT 80.0,
    "usdtWallet" text,
    telegram text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "mustChangePassword" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."User" OWNER TO gdi_user;

--
-- Name: Wallet; Type: TABLE; Schema: public; Owner: gdi_user
--

CREATE TABLE public."Wallet" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "availableBalanceCents" integer DEFAULT 0 NOT NULL,
    "pendingBalanceCents" integer DEFAULT 0 NOT NULL,
    "totalEarnedCents" integer DEFAULT 0 NOT NULL,
    "totalPaidOutCents" integer DEFAULT 0 NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Wallet" OWNER TO gdi_user;

--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: gdi_user
--

COPY public."Cart" (id, "userId", "createdAt") FROM stdin;
cmky6i1if0002kv8l765ogiz0	cmky6i1if0000kv8lnb0qbxjd	2026-01-28 15:27:06.28
cmky6i1jz0005kv8lu8hcau5k	cmky6i1jz0003kv8lbvxjvni3	2026-01-28 15:27:06.335
cmky6i1lh0008kv8lshzpcj9g	cmky6i1lh0006kv8lf2kce9af	2026-01-28 15:27:06.39
cmky7jakr0004kv8c37ytrk98	cmky7jakp0000kv8c49oclz3l	2026-01-28 15:56:04.3
cmkz7zi320004kvggstn1t0n4	cmkz7zi2u0000kvggiya55qwz	2026-01-29 08:56:26.702
cml0ygqei0002kvlli3hnms1x	cml0ygqei0000kvllkt9riw8u	2026-01-30 14:05:26.826
cml9g25bu000fkv7ny0dsyi5u	cml9g25bu000dkv7n01utsbwl	2026-02-05 12:40:08.826
cmlfa2sxn000akvn7lrb8rypc	cmlfa2sxk0008kvn7lu3favr3	2026-02-09 14:39:18.669
\.


--
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: gdi_user
--

COPY public."CartItem" (id, "cartId", "productId", quantity) FROM stdin;
\.


--
-- Data for Name: CashbackTransaction; Type: TABLE DATA; Schema: public; Owner: gdi_user
--

COPY public."CashbackTransaction" (id, "userId", "orderId", "amountCents", rate, status, "createdAt", "availableAt", "paidAt", "reversedAt", notes) FROM stdin;
cmlclatgm0001kvx7wtoi1qmd	cml9g25bu000dkv7n01utsbwl	cml9g2mnv000jkv7n0m372wel	6800000	0.8	PAID	2026-02-07 17:30:09.959	2026-02-07 17:30:09.996	2026-02-07 17:40:38.161	\N	\N
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: gdi_user
--

COPY public."Order" (id, "userId", "totalCents", status, "paymentMethod", "createdAt") FROM stdin;
cmky96nsv000kkv8cvme4ff5w	cmky7jakp0000kv8c49oclz3l	42500000	PENDING	MIDTRANS	2026-01-28 16:42:14.144
cmkyb5sjs0003kvztb9imx3hb	cmky7jakp0000kv8c49oclz3l	8500000	PENDING	MIDTRANS	2026-01-28 17:37:32.872
cmkz800h20008kvggwh6taf8n	cmkz7zi2u0000kvggiya55qwz	8500000	PENDING	MIDTRANS	2026-01-29 08:56:50.534
cml0yic8l0001kvj0lvreq87w	cmky7jakp0000kv8c49oclz3l	8500000	PENDING	MIDTRANS	2026-01-30 14:06:41.782
cml107t2j0007kvj03t7pfns7	cmky6i1if0000kv8lnb0qbxjd	8500000	PENDING	MIDTRANS	2026-01-30 14:54:29.611
cml1nve9i000fkvj04ywar02j	cmky6i1if0000kv8lnb0qbxjd	8500000	PENDING	MIDTRANS	2026-01-31 01:56:41.334
cml1yeugd000lkvj0kg3zzhk2	cmky7jakp0000kv8c49oclz3l	8500000	PENDING	MIDTRANS	2026-01-31 06:51:44.942
cml38q3v3000qkvj0xnl6x71f	cml38q3uw000okvj0q9zigydq	8500000	PENDING	MIDTRANS	2026-02-01 04:28:12.687
cml3xj91z0002kv8lbpz4e23o	cml3xj91u0000kv8ls6ci5ru7	8500000	PENDING	MIDTRANS	2026-02-01 16:02:43.224
cml4srtbb0002kvze37vtjd2y	cml4srtb00000kvzeccrvlxgl	8500000	PENDING	MIDTRANS	2026-02-02 06:37:10.823
cml4yciz30006kvzex4ypgd2i	cmky6i1if0000kv8lnb0qbxjd	17000000	PENDING	MIDTRANS	2026-02-02 09:13:15.279
cml4yfiyo000bkvzemtnnjtji	cml4yfiya0009kvze7j1nsjgh	25500000	PENDING	MIDTRANS	2026-02-02 09:15:35.233
cml4yt814000fkvze1zxzcj98	cml4yfiya0009kvze7j1nsjgh	25500000	PENDING	MIDTRANS	2026-02-02 09:26:14.248
cml4zc6uv000jkvze751ufw31	cml4yfiya0009kvze7j1nsjgh	25500000	PENDING	MIDTRANS	2026-02-02 09:40:59.192
cml4znyoi000okvzenhpqqrme	cml4znyof000mkvze6e3xlm8a	25500000	PENDING	MIDTRANS	2026-02-02 09:50:08.466
cml557h7t000skvzev482jwy5	cml4srtb00000kvzeccrvlxgl	8500000	PENDING	MIDTRANS	2026-02-02 12:25:17.033
cml619qcq000wkvzem430p8qc	cml4yfiya0009kvze7j1nsjgh	26000000	PENDING	MIDTRANS	2026-02-03 03:22:49.897
cml633mdn0003kvj7fhlxi3tn	cmky7jakp0000kv8c49oclz3l	8500000	PENDING	MIDTRANS	2026-02-03 04:14:04.044
cml7pnvo7000akvj778bslf02	cml7pnvnk0008kvj7e5nkx47j	26000000	PENDING	MIDTRANS	2026-02-04 07:33:26.935
cml7q3tad000ekvj776vsl2xc	cml7pnvnk0008kvj7e5nkx47j	26000000	PENDING	MIDTRANS	2026-02-04 07:45:50.341
cml7x1bv8000kkvj7mgf208np	cmky7jakp0000kv8c49oclz3l	8500000	PENDING	MIDTRANS	2026-02-04 10:59:51.764
cml802pcd000pkvj7wjuwdln5	cml802pca000nkvj74iqi6zqa	8500000	PENDING	MIDTRANS	2026-02-04 12:24:54.734
cml8vy9eq0001kvo0bm0n9b99	cml4srtb00000kvzeccrvlxgl	8500000	PENDING	MIDTRANS	2026-02-05 03:17:15.17
cml8wano00001kv7nnr8hakfj	cmky7jakp0000kv8c49oclz3l	17000000	PENDING	MIDTRANS	2026-02-05 03:26:53.52
cml9fyqbw0007kv7n51pnc064	cml0ygqei0000kvllkt9riw8u	8500000	PENDING	MIDTRANS	2026-02-05 12:37:29.421
cmlcj7pbm0003kvp7s4j6cpp6	cmky7jakp0000kv8c49oclz3l	8500000	PENDING	MIDTRANS	2026-02-07 16:31:45.394
cml9g2mnv000jkv7n0m372wel	cml9g25bu000dkv7n01utsbwl	8500000	COMPLETED	MIDTRANS	2026-02-05 12:40:31.291
cmlewmrq00005kvn7w35u1igh	cml9g25bu000dkv7n01utsbwl	8500000	PENDING	MIDTRANS	2026-02-09 08:22:55.704
cmlfa4fix000ekvn7h1cscmjb	cmlfa2sxk0008kvn7lu3favr3	34000000	PENDING	MIDTRANS	2026-02-09 14:40:34.713
cmlfa5dsr000kkvn7ay0msan6	cmlfa2sxk0008kvn7lu3favr3	17500000	PENDING	MIDTRANS	2026-02-09 14:41:19.131
cmlfd3awv0002kvk44h19jjk8	cmlfd3awq0000kvk4uq42asig	8500000	PENDING	MIDTRANS	2026-02-09 16:03:40.927
cmlfdnltq0001kvkulbh6dbsu	cml38q3uw000okvj0q9zigydq	17500000	PENDING	MIDTRANS	2026-02-09 16:19:28.191
cmlfg9jg20002kvbbl3sba1ot	cmlfg9jfw0000kvbbjy9nlt89	8500000	PENDING	MIDTRANS	2026-02-09 17:32:30.771
cmlfgx3ef0003kvrg7jc8qi27	cml9g25bu000dkv7n01utsbwl	8500000	PENDING	MIDTRANS	2026-02-09 17:50:49.719
cmlg8wzbe0009kvrg7mf1ghbg	cml9g25bu000dkv7n01utsbwl	8500000	PENDING	MIDTRANS	2026-02-10 06:54:33.674
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: gdi_user
--

COPY public."OrderItem" (id, "orderId", "productId", "productName", "priceCents", quantity) FROM stdin;
cmky96nsw000mkv8ch9iaa3of	cmky96nsv000kkv8cvme4ff5w	ent-assistant	Enterprise AI Assistant	34000000	1
cmky96nsw000nkv8c5w32b49n	cmky96nsv000kkv8cvme4ff5w	start-ai	Start AI Pack	8500000	1
cmkyb5sjs0005kvztwmopdxyc	cmkyb5sjs0003kvztb9imx3hb	start-ai	Start AI Pack	8500000	1
cmkz800h2000akvgg9d0tp7mk	cmkz800h20008kvggwh6taf8n	start-ai	Start AI Pack	8500000	1
cml0yic8l0003kvj0hv53z3vb	cml0yic8l0001kvj0lvreq87w	start-ai	Start AI Pack	8500000	1
cml107t2j0009kvj094ch5oe4	cml107t2j0007kvj03t7pfns7	start-ai	Start AI Pack	8500000	1
cml1nve9i000hkvj093y7s55q	cml1nve9i000fkvj04ywar02j	start-ai	Start AI Pack	8500000	1
cml1yeugd000nkvj0punhibq5	cml1yeugd000lkvj0kg3zzhk2	start-ai	Start AI Pack	8500000	1
cml38q3v3000skvj0mtx0nknn	cml38q3v3000qkvj0xnl6x71f	start-ai	Start AI Pack	8500000	1
cml3xj91z0004kv8l17o7efih	cml3xj91z0002kv8lbpz4e23o	start-ai	Start AI Pack	8500000	1
cml4srtbb0004kvzeb6tpbn3i	cml4srtbb0002kvze37vtjd2y	start-ai	Start AI Pack	8500000	1
cml4yciz30008kvzebevvur7u	cml4yciz30006kvzex4ypgd2i	start-ai	Start AI Pack	8500000	2
cml4yfiyo000dkvzeee9uy3g3	cml4yfiyo000bkvzemtnnjtji	start-ai	Start AI Pack	8500000	3
cml4yt814000hkvzewqhs1bug	cml4yt814000fkvze1zxzcj98	start-ai	Start AI Pack	8500000	3
cml4zc6uv000lkvzeialzgy7b	cml4zc6uv000jkvze751ufw31	start-ai	Start AI Pack	8500000	3
cml4znyoi000qkvzez627ib3y	cml4znyoi000okvzenhpqqrme	start-ai	Start AI Pack	8500000	3
cml557h7t000ukvzer0j9e90y	cml557h7t000skvzev482jwy5	start-ai	Start AI Pack	8500000	1
cml619qcq000ykvzexxm6briq	cml619qcq000wkvzem430p8qc	automation-platform	AI Automation Platform	26000000	1
cml633mdn0005kvj7vihiaxx0	cml633mdn0003kvj7fhlxi3tn	start-ai	Start AI Pack	8500000	1
cml7pnvo8000ckvj7fak1s31m	cml7pnvo7000akvj778bslf02	automation-platform	AI Automation Platform	26000000	1
cml7q3tad000gkvj75tv0y48v	cml7q3tad000ekvj776vsl2xc	automation-platform	AI Automation Platform	26000000	1
cml7x1bv8000mkvj7hxi67k0n	cml7x1bv8000kkvj7mgf208np	start-ai	Start AI Pack	8500000	1
cml802pcd000rkvj7s7ksohvr	cml802pcd000pkvj7wjuwdln5	start-ai	Start AI Pack	8500000	1
cml8vy9eq0003kvo0regxv3pd	cml8vy9eq0001kvo0bm0n9b99	start-ai	Start AI Pack	8500000	1
cml8wano00003kv7n0dqrnk51	cml8wano00001kv7nnr8hakfj	start-ai	Start AI Pack	8500000	2
cml9fyqbx0009kv7nbh8q83nt	cml9fyqbw0007kv7n51pnc064	start-ai	Start AI Pack	8500000	1
cml9g2mnv000lkv7nl753fgwj	cml9g2mnv000jkv7n0m372wel	start-ai	Start AI Pack	8500000	1
cmlcj7pbm0005kvp7uni1hb3d	cmlcj7pbm0003kvp7s4j6cpp6	start-ai	Start AI Pack	8500000	1
cmlewmrq00007kvn7nrotnup9	cmlewmrq00005kvn7w35u1igh	start-ai	Start AI Pack	8500000	1
cmlfa4fix000gkvn7xwe37wxc	cmlfa4fix000ekvn7h1cscmjb	ent-assistant	Enterprise AI Assistant	34000000	1
cmlfa5dsr000mkvn7mvn0g4z5	cmlfa5dsr000kkvn7ay0msan6	middle-scale	Middle Scale AI	17500000	1
cmlfd3awv0004kvk4xw5vg6l8	cmlfd3awv0002kvk44h19jjk8	start-ai	Start AI Pack	8500000	1
cmlfdnltq0003kvkullvok5cx	cmlfdnltq0001kvkulbh6dbsu	middle-scale	Middle Scale AI	17500000	1
cmlfg9jg20004kvbbimlt92pk	cmlfg9jg20002kvbbl3sba1ot	start-ai	Start AI Pack	8500000	1
cmlfgx3ef0005kvrg5bf260a4	cmlfgx3ef0003kvrg7jc8qi27	start-ai	Start AI Pack	8500000	1
cmlg8wzbf000bkvrgtqcgoh4q	cmlg8wzbe0009kvrg7mf1ghbg	start-ai	Start AI Pack	8500000	1
\.


--
-- Data for Name: Payout; Type: TABLE DATA; Schema: public; Owner: gdi_user
--

COPY public."Payout" (id, "userId", "amountCents", status, method, reference, "receiptUrl", "requestedAt", "processedAt", "updatedAt", notes) FROM stdin;
cmlclmzrk0001kvkcarzrskro	cml9g25bu000dkv7n01utsbwl	500000	PAID	bank_transfer	\N	https://www.canva.com/design/DAHAV7jPa6w/8VY3BkjWtnnueluBEe59ew/edit?ui=e30	2026-02-07 17:39:38.001	2026-02-07 17:40:38.157	2026-02-07 17:40:38.157	test21
cmlcmor1e0001kvn7r42q9afy	cml9g25bu000dkv7n01utsbwl	1200000	PROCESSING	bank_transfer	\N	\N	2026-02-07 18:08:59.618	\N	2026-02-07 18:09:39.823	test processing
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: gdi_user
--

COPY public."Product" (id, name, description, "priceCents", active) FROM stdin;
start-ai	Start AI Pack	Essential automation for beginners.	8500000	t
middle-scale	Middle Scale AI	Secure, context-aware GenAI for teams.	17500000	t
automation-platform	AI Automation Platform	Turn raw data into strategic assets.	26000000	t
ent-assistant	Enterprise AI Assistant	Scalable cloud foundations for AI.	34000000	t
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: gdi_user
--

COPY public."User" (id, email, name, "passwordHash", role, "cashbackPercentage", "usdtWallet", telegram, "createdAt", "updatedAt", "mustChangePassword") FROM stdin;
cmky6i1jz0003kv8lbvxjvni3	user1@example.com	\N	$2b$10$S8NR3.g0X9tdYphV5ojXa.X4mTKK.sCm/K4yu4tawQBmDXYNkPR/e	USER	80	\N	\N	2026-01-28 15:27:06.335	2026-01-28 15:27:06.335	f
cmky6i1lh0006kv8lf2kce9af	user2@example.com	\N	$2b$10$dIQzMnT9MmeOrTYuyZ7I0.cU6XvCbkrbURmvGblP7om/0HXoFRe2y	USER	80	\N	\N	2026-01-28 15:27:06.39	2026-01-28 15:27:06.39	f
cmky7jakp0000kv8c49oclz3l	bandurkas@gmail.com	\N	$2b$10$rQ8YQEMcH5c6yWp3bp3qyug74UINZ70XV3rXQAblKMJusPB5z5ram	USER	80	\N	\N	2026-01-28 15:56:04.297	2026-01-28 15:56:04.297	f
cml0ygqei0000kvllkt9riw8u	superadmin@gdiconsult.online	\N	$2b$10$/6FPzflak.LsA6Xtqi20y.BpLXjd8wwPZ0XOLPhcj/1eTQRFgvIZC	SUPER_ADMIN	80	\N	\N	2026-01-30 14:05:26.826	2026-01-30 14:05:26.826	f
cmky6i1if0000kv8lnb0qbxjd	admin@admin.com	\N	$2b$10$b.e/OELKSZ.lVRHi3XNmUed0wwlB.PG8pX4zuRrS5YO9L78Jm6cs2	ADMIN	80	\N	\N	2026-01-28 15:27:06.28	2026-01-30 14:05:26.882	f
cml38q3uw000okvj0q9zigydq	test@test.com	test		USER	80	\N	\N	2026-02-01 04:28:12.68	2026-02-01 04:28:12.68	t
cml3xj91u0000kv8ls6ci5ru7	hopeso@gmail.com	HopeSo		USER	80	\N	\N	2026-02-01 16:02:43.218	2026-02-01 16:02:43.218	t
cml4srtb00000kvzeccrvlxgl	badurkas@gmail.com	test		USER	80	\N	\N	2026-02-02 06:37:10.813	2026-02-02 06:37:10.813	t
cml4yfiya0009kvze7j1nsjgh	mimamnuro@gmail.com	Imam		USER	80	\N	\N	2026-02-02 09:15:35.218	2026-02-02 09:15:35.218	t
cml4znyof000mkvze6e3xlm8a	imam@nexoratech.co	Nexora Test		USER	80	\N	\N	2026-02-02 09:50:08.463	2026-02-02 09:50:08.463	t
cml7pnvnk0008kvj7e5nkx47j	demotes05@gmail.com	demotes		USER	80	\N	\N	2026-02-04 07:33:26.911	2026-02-04 07:33:26.911	t
cml802pca000nkvj74iqi6zqa	test04@gmail.com	Test for test		USER	80	\N	\N	2026-02-04 12:24:54.73	2026-02-04 12:24:54.73	t
cml9g25bu000dkv7n01utsbwl	bandurkass@gmail.com	\N	$2b$10$L0vHajuCvoJwr8Aeq/.3Q.W7frm6lOSg4PNEcfXJXHYoGk/4JjOTy	USER	80	\N	\N	2026-02-05 12:40:08.826	2026-02-05 12:40:08.826	f
cmlfa2sxk0008kvn7lu3favr3	gumyby76@temptami.com	\N	$2b$10$EZV4BMmN3o1cSHC06vWBB.CcsVrrBGnZOdcdnz93BIktI.0AxcEBO	USER	80	\N	\N	2026-02-09 14:39:18.669	2026-02-09 14:39:18.669	f
cmlfd3awq0000kvk4uq42asig	test-09@gmail.com	New09test		USER	80	\N	\N	2026-02-09 16:03:40.922	2026-02-09 16:03:40.922	t
cmkz7zi2u0000kvggiya55qwz	obertydev@gmail.com	\N	$2b$10$mhVwySkD37kLayUEHENX4e5ublVqU4xx9p6EGCx16RBH04l/kC6Ei	ADMIN	18.5	\N	\N	2026-01-29 08:56:26.695	2026-02-09 17:22:42.653	f
cmlfg9jfw0000kvbbjy9nlt89	badurkassss@gmail.com	test81		USER	80	\N	\N	2026-02-09 17:32:30.765	2026-02-09 17:32:30.765	t
\.


--
-- Data for Name: Wallet; Type: TABLE DATA; Schema: public; Owner: gdi_user
--

COPY public."Wallet" (id, "userId", "availableBalanceCents", "pendingBalanceCents", "totalEarnedCents", "totalPaidOutCents", "updatedAt") FROM stdin;
cmky6i1if0001kv8ly4f0eijl	cmky6i1if0000kv8lnb0qbxjd	0	0	0	0	2026-01-28 15:27:06.28
cmky6i1jz0004kv8llneohuqg	cmky6i1jz0003kv8lbvxjvni3	0	0	0	0	2026-01-28 15:27:06.335
cmky6i1lh0007kv8lwx4gkinw	cmky6i1lh0006kv8lf2kce9af	0	0	0	0	2026-01-28 15:27:06.39
cmky7jakq0002kv8cl2wnzboc	cmky7jakp0000kv8c49oclz3l	0	0	0	0	2026-01-28 15:56:04.299
cmkz7zi2y0002kvggj76b6e77	cmkz7zi2u0000kvggiya55qwz	0	0	0	0	2026-01-29 08:56:26.699
cml0ygqei0001kvll4zvlsmra	cml0ygqei0000kvllkt9riw8u	0	0	0	0	2026-01-30 14:05:26.826
cml9g25bu000ekv7n6tw4bj5i	cml9g25bu000dkv7n01utsbwl	5100000	1200000	6800000	500000	2026-02-07 18:08:59.62
cmlfa2sxn0009kvn7qx8aqpqq	cmlfa2sxk0008kvn7lu3favr3	0	0	0	0	2026-02-09 14:39:18.669
\.


--
-- Name: CartItem CartItem_pkey; Type: CONSTRAINT; Schema: public; Owner: gdi_user
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY (id);


--
-- Name: Cart Cart_pkey; Type: CONSTRAINT; Schema: public; Owner: gdi_user
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY (id);


--
-- Name: CashbackTransaction CashbackTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: gdi_user
--

ALTER TABLE ONLY public."CashbackTransaction"
    ADD CONSTRAINT "CashbackTransaction_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: gdi_user
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: gdi_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Payout Payout_pkey; Type: CONSTRAINT; Schema: public; Owner: gdi_user
--

ALTER TABLE ONLY public."Payout"
    ADD CONSTRAINT "Payout_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: gdi_user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: gdi_user
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Wallet Wallet_pkey; Type: CONSTRAINT; Schema: public; Owner: gdi_user
--

ALTER TABLE ONLY public."Wallet"
    ADD CONSTRAINT "Wallet_pkey" PRIMARY KEY (id);


--
-- Name: Cart_userId_key; Type: INDEX; Schema: public; Owner: gdi_user
--

CREATE UNIQUE INDEX "Cart_userId_key" ON public."Cart" USING btree ("userId");


--
-- Name: CashbackTransaction_orderId_key; Type: INDEX; Schema: public; Owner: gdi_user
--

CREATE UNIQUE INDEX "CashbackTransaction_orderId_key" ON public."CashbackTransaction" USING btree ("orderId");


--
-- Name: Payout_userId_status_idx; Type: INDEX; Schema: public; Owner: gdi_user
--

CREATE INDEX "Payout_userId_status_idx" ON public."Payout" USING btree ("userId", status);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: gdi_user
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Wallet_userId_key; Type: INDEX; Schema: public; Owner: gdi_user
--

CREATE UNIQUE INDEX "Wallet_userId_key" ON public."Wallet" USING btree ("userId");


--
-- Name: CartItem CartItem_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdi_user
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public."Cart"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CartItem CartItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdi_user
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Cart Cart_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdi_user
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CashbackTransaction CashbackTransaction_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdi_user
--

ALTER TABLE ONLY public."CashbackTransaction"
    ADD CONSTRAINT "CashbackTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CashbackTransaction CashbackTransaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdi_user
--

ALTER TABLE ONLY public."CashbackTransaction"
    ADD CONSTRAINT "CashbackTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdi_user
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdi_user
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdi_user
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payout Payout_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdi_user
--

ALTER TABLE ONLY public."Payout"
    ADD CONSTRAINT "Payout_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Wallet Wallet_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gdi_user
--

ALTER TABLE ONLY public."Wallet"
    ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO gdi_user;


--
-- PostgreSQL database dump complete
--

\unrestrict z3RDNBdxFh8fBjJDf3oYqAOP8KyEdWNLpABQlWTEFdyi5tUJOYgHJBrsyd5uvku

