import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            cashbackPercentage: number;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        role: string;
        cashbackPercentage: number;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        cashbackPercentage: number;
    }
}
