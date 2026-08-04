"use client";

import { useState } from "react";
import {
  ArrowRightLeft,
  Copy,
  Languages,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  DashboardPage,
  EmptyState,
  Field,
  PageHeader,
  formControlClass,
} from "@/components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, getApiError } from "@/store/api";
import { copyText } from "@/lib/dashboard-client";

type Translation = {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceText: string;
  translatedText: string;
};
const languages = [
  "Auto-detect",
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Arabic",
  "Urdu",
  "Hindi",
  "Chinese",
  "Japanese",
  "Korean",
  "Turkish",
];
export default function TranslatorPage() {
  const [source, setSource] = useState("Auto-detect");
  const [target, setTarget] = useState("English");
  const [text, setText] = useState("");
  const [result, setResult] = useState<Translation | null>(null);
  const [loading, setLoading] = useState(false);
  const translate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      setResult(
        await apiRequest<Translation>("/api/ai/translation", {
          method: "POST",
          data: { sourceLanguage: source, targetLanguage: target, text },
        }),
      );
    } catch (error) {
      toast.error(getApiError(error, "Unable to translate text."));
    } finally {
      setLoading(false);
    }
  };
  const swap = () => {
    if (source === "Auto-detect") return;
    setSource(target);
    setTarget(source);
    setText(result?.translatedText ?? text);
    setResult(null);
  };
  return (
    <DashboardPage>
      <PageHeader
        title="Translator"
        description="Translate naturally across languages while preserving intent and nuance."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-white/10 bg-white/[0.025]">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-end gap-2">
              <Field label="From">
                <select
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                  className={formControlClass}
                >
                  {languages.map((language) => (
                    <option key={language}>{language}</option>
                  ))}
                </select>
              </Field>
              <Button
                variant="outline"
                size="icon"
                onClick={swap}
                disabled={source === "Auto-detect"}
                aria-label="Swap languages"
              >
                <ArrowRightLeft />
              </Button>
            </div>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={50000}
              rows={15}
              placeholder="Enter text to translate…"
              className={`${formControlClass} resize-none border-0 bg-transparent text-base focus:ring-0`}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {text.length.toLocaleString()} / 50,000
              </span>
              <Button
                onClick={() => void translate()}
                disabled={!text.trim() || loading}
                className="bg-violet-500 text-white hover:bg-violet-400"
              >
                {loading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Sparkles />
                )}
                {loading ? "Translating…" : "Translate"}
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.025]">
          <CardContent className="space-y-4 p-5">
            <Field label="To">
              <select
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                className={formControlClass}
              >
                {languages.slice(1).map((language) => (
                  <option key={language}>{language}</option>
                ))}
              </select>
            </Field>
            {result ? (
              <>
                <div className="min-h-[320px] whitespace-pre-wrap text-base leading-8">
                  {result.translatedText}
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    void copyText(result.translatedText).then(() =>
                      toast.success("Copied"),
                    )
                  }
                >
                  <Copy />
                  Copy translation
                </Button>
              </>
            ) : (
              <EmptyState
                icon={Languages}
                title="Translation appears here"
                description="Select your languages and enter the text you want to translate."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardPage>
  );
}
