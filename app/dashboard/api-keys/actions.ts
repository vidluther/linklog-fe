"use server";

import { createHash, randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function generateApiKey(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  const rawKey = `lb_${randomBytes(32).toString("hex")}`;
  const keyHash = createHash("sha256").update(rawKey).digest("hex");

  const { error } = await supabase.from("api_keys").insert({
    user_id: user.id,
    name: name || null,
    key_hash: keyHash,
  });

  if (error) throw new Error("Failed to create API key");

  // Encode raw key in search params — shown once, never stored
  revalidatePath("/dashboard/api-keys");
  redirect(`/dashboard/api-keys?new_key=${rawKey}`);
}

export async function revokeApiKey(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const keyId = formData.get("key_id") as string;

  const { error } = await supabase
    .from("api_keys")
    .delete()
    .eq("id", keyId)
    .eq("user_id", user.id); // belt-and-suspenders: RLS already enforces this

  if (error) throw new Error("Failed to revoke API key");

  revalidatePath("/dashboard/api-keys");
}
