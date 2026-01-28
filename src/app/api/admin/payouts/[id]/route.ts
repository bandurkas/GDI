import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PayoutService } from "@/services/payout.service";

// Helper check
const checkAdmin = async () => {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }
    return session;
};

// PATCH /api/admin/payouts/[id]
// Single source of truth for Payout Status Updates
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await checkAdmin();
        const { id } = await params;
        const body = await req.json();

        const { status, receiptUrl, reason, comment } = body;

        // Map 'comment' to 'reason' for internal service consistency if needed, 
        // or prefer 'comment' if service updated. Service uses 'details' object.
        // Let's enforce 'comment' as the unified field for user input.
        const finalComment = comment || reason;



        if (!status) {
            return NextResponse.json({ error: "Status is required" }, { status: 400 });
        }

        if (!finalComment || finalComment.trim() === "") {
            return NextResponse.json({ error: "Comment is mandatory for all status updates." }, { status: 400 });
        }

        const result = await PayoutService.updatePayoutStatus(id, status, { reason: finalComment, receiptUrl });



        return NextResponse.json(result);

    } catch (error: any) {
        console.error(`[API] Error updating payout:`, error);
        if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
