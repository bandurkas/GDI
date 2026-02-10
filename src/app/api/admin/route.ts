import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserService } from "@/services/user.service";
import { OrderService } from "@/services/order.service";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const role = searchParams.get("role") || undefined;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortDir = (searchParams.get("sortDir") === "asc" ? "asc" : "desc");

    try {
        if (type === "users") {
            const { users, total } = await UserService.getAllUsersWithStats(page, limit, search, role, sortBy, sortDir);
            return NextResponse.json({
                data: users,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                }
            });
        } else if (type === "orders") {
            // Orders pagination not requested yet, leaving as is or could update later
            const orders = await OrderService.getAllOrders();
            return NextResponse.json(orders);
        } else {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
    }
}
