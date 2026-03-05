import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function Page() {
  return (
    <Button asChild>
      <Link href="/login">Go to Login</Link>
    </Button>
  );
}
