--
-- PostgreSQL database dump
--

\restrict YUZLzCEaqYjS93YcoCuNWp0igmRdoIJWTTk7Qwmx57Fl1pJbcNPjjYco0JpuaqT

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
    'ADMIN'
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
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
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
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: gdi_user
--

COPY public."Order" (id, "userId", "totalCents", status, "paymentMethod", "createdAt") FROM stdin;
cmky96nsv000kkv8cvme4ff5w	cmky7jakp0000kv8c49oclz3l	42500000	PENDING	MIDTRANS	2026-01-28 16:42:14.144
cmkyb5sjs0003kvztb9imx3hb	cmky7jakp0000kv8c49oclz3l	8500000	PENDING	MIDTRANS	2026-01-28 17:37:32.872
cmkz800h20008kvggwh6taf8n	cmkz7zi2u0000kvggiya55qwz	8500000	PENDING	MIDTRANS	2026-01-29 08:56:50.534
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: gdi_user
--

COPY public."OrderItem" (id, "orderId", "productId", "productName", "priceCents", quantity) FROM stdin;
cmky96nsw000mkv8ch9iaa3of	cmky96nsv000kkv8cvme4ff5w	ent-assistant	Enterprise AI Assistant	34000000	1
cmky96nsw000nkv8c5w32b49n	cmky96nsv000kkv8cvme4ff5w	start-ai	Start AI Pack	8500000	1
cmkyb5sjs0005kvztwmopdxyc	cmkyb5sjs0003kvztb9imx3hb	start-ai	Start AI Pack	8500000	1
cmkz800h2000akvgg9d0tp7mk	cmkz800h20008kvggwh6taf8n	start-ai	Start AI Pack	8500000	1
\.


--
-- Data for Name: Payout; Type: TABLE DATA; Schema: public; Owner: gdi_user
--

COPY public."Payout" (id, "userId", "amountCents", status, method, reference, "receiptUrl", "requestedAt", "processedAt", "updatedAt", notes) FROM stdin;
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

COPY public."User" (id, email, name, "passwordHash", role, "cashbackPercentage", "usdtWallet", telegram, "createdAt", "updatedAt") FROM stdin;
cmky6i1if0000kv8lnb0qbxjd	admin@admin.com	\N	$2b$10$2Yp1FB5xrG4PBVVcOibKX.dzkai47wVr7AUKc/qAEVAEmFqilKMEm	ADMIN	80	\N	\N	2026-01-28 15:27:06.28	2026-01-28 15:27:06.28
cmky6i1jz0003kv8lbvxjvni3	user1@example.com	\N	$2b$10$S8NR3.g0X9tdYphV5ojXa.X4mTKK.sCm/K4yu4tawQBmDXYNkPR/e	USER	80	\N	\N	2026-01-28 15:27:06.335	2026-01-28 15:27:06.335
cmky6i1lh0006kv8lf2kce9af	user2@example.com	\N	$2b$10$dIQzMnT9MmeOrTYuyZ7I0.cU6XvCbkrbURmvGblP7om/0HXoFRe2y	USER	80	\N	\N	2026-01-28 15:27:06.39	2026-01-28 15:27:06.39
cmky7jakp0000kv8c49oclz3l	bandurkas@gmail.com	\N	$2b$10$rQ8YQEMcH5c6yWp3bp3qyug74UINZ70XV3rXQAblKMJusPB5z5ram	USER	80	\N	\N	2026-01-28 15:56:04.297	2026-01-28 15:56:04.297
cmkz7zi2u0000kvggiya55qwz	obertydev@gmail.com	\N	$2b$10$mhVwySkD37kLayUEHENX4e5ublVqU4xx9p6EGCx16RBH04l/kC6Ei	USER	80	\N	\N	2026-01-29 08:56:26.695	2026-01-29 08:56:26.695
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

\unrestrict YUZLzCEaqYjS93YcoCuNWp0igmRdoIJWTTk7Qwmx57Fl1pJbcNPjjYco0JpuaqT

