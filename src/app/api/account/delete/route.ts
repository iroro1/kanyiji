            import { NextResponse } from "next/server";
            import { supabaseAdmin } from "@/lib/supabaseAdmin";

            export async function POST(req: Request) {
            try {
                const { userId } = await req.json();

                if (!userId) {
                return NextResponse.json(
                    { error: "Missing userId" },
                    { status: 400 }
                );
                }

                // Optional: delete profile first
                await supabaseAdmin
                .from("profiles")
                .delete()
                .eq("id", userId);

                // 🔥 Delete auth user
                const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

                if (error) {
                console.error("Delete user error:", error);
                return NextResponse.json(
                    { error: "Failed to delete account" },
                    { status: 500 }
                );
                }

                return NextResponse.json({ success: true });
            } catch (err) {
                console.error(err);
                return NextResponse.json(
                { error: "Server error" },
                { status: 500 }
                );
            }
            }
