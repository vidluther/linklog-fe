import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { generateApiKey, revokeApiKey } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyApiKeyBanner } from "./copy-api-key-banner";

export default async function ApiKeysPage({
  searchParams,
}: {
  searchParams: Promise<{ new_key?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { new_key } = await searchParams;

  const { data: apiKeys } = await supabase
    .from("api_keys")
    .select("id, name, created_at, last_used_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">API Keys</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Use these keys to authenticate requests to api.linklog.app
        </p>
      </div>

      {/* New key banner — shown exactly once */}
      {new_key && <CopyApiKeyBanner apiKey={new_key} />}

      {/* Generate new key */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generate a new key</CardTitle>
          <CardDescription>
            Give it a name so you remember where it's used.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={generateApiKey} className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="name">Key name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. iOS Shortcut, Home Mac"
              />
            </div>
            <Button type="submit">Generate</Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing keys */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active keys</CardTitle>
        </CardHeader>
        <CardContent>
          {!apiKeys?.length ? (
            <p className="text-sm text-muted-foreground">No API keys yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      {key.name ?? (
                        <span className="text-muted-foreground italic">
                          Unnamed
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(key.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {key.last_used_at ? (
                        <Badge variant="outline">
                          {new Date(key.last_used_at).toLocaleDateString()}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Never
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <form action={revokeApiKey}>
                        <input type="hidden" name="key_id" value={key.id} />
                        <Button variant="destructive" size="sm" type="submit">
                          Revoke
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
