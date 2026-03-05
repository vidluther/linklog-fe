"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CopyApiKeyBanner({ apiKey }: { apiKey: string }) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support the Clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = apiKey;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Card className="border-green-500">
      <CardHeader>
        <CardTitle className="text-base">Your new API key</CardTitle>
        <CardDescription>
          Copy this now. It will not be shown again.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <code className="block bg-muted p-3 rounded text-sm break-all">
          {apiKey}
        </code>
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="gap-1.5"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy to clipboard
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
