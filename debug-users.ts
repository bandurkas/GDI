
import { UserService } from "./src/services/user.service";
import { prisma } from "./src/lib/prisma";

async function main() {
    console.log("--- Debugging UserService ---");
    try {
        const result = await UserService.getAllUsersWithStats();
        const users = result.users;
        console.log(`Found ${users.length} users`);
        if (users.length > 0) {
            console.log("Sample User:", JSON.stringify(users[0], null, 2));
        } else {
            // Check if DB is actually empty
            const count = await prisma.user.count();
            console.log(`DB User Count (Raw): ${count}`);
        }
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
