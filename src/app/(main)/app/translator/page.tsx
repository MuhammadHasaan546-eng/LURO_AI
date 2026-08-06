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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      toast.success("Translation complete!");
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
    <DashboardPage className="space-y-6">
      <PageHeader
        title="Translator"
        description="Translate naturally across languages while preserving intent and nuance."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Source Box */}
        <Card className="border-white/10 bg-white/[0.02] shadow-2xl backdrop-blur">
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="flex items-end gap-2.5">
              <div className="flex-1">
                <Field label="From">
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger className={`${formControlClass} bg-white/[0.03] border-white/10 w-full`}>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-background">
                      {languages.map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={swap}
                disabled={source === "Auto-detect"}
                aria-label="Swap languages"
                className="border-white/10 hover:bg-white/5 shrink-0"
              >
                <ArrowRightLeft className="size-4" />
              </Button>
            </div>
            
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={50000}
              rows={12}
              placeholder="Enter text to translate…"
              className={`${formControlClass} resize-none border-0 bg-transparent text-base focus:ring-0 p-0 text-foreground/90`}
            />

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-xs text-muted-foreground font-mono">
                {text.length.toLocaleString()} / 50,000
              </span>
              <Button
                onClick={() => void translate()}
                disabled={!text.trim() || loading}
                className="bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20 px-5"
              >
                {loading ? (
                  <LoaderCircle className="animate-spin size-4" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {loading ? "Translating…" : "Translate"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Target Box */}
        <Card className="border-white/10 bg-white/[0.02] shadow-2xl backdrop-blur">
          <CardContent className="space-y-4 p-5 sm:p-6 flex flex-col h-full justify-between">
            <div className="space-y-4">
              <Field label="To">
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger className={`${formControlClass} bg-white/[0.03] border-white/10 w-full`}>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-background">
                    {languages.slice(1).map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {result ? (
                <div className="min-h-[280px] whitespace-pre-wrap text-base leading-8 text-foreground/90 pt-2">
                  {result.translatedText}
                </div>
              ) : (
                <div className="py-12">
                  <EmptyState
                    icon={Languages}
                    title="Translation appears here"
                    description="Select your languages and enter the text you want to translate."
                  />
                </div>
              )}
            </div>

            {result && (
              <div className="pt-4 border-t border-white/10 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 hover:bg-white/5"
                  onClick={() =>
                    void copyText(result.translatedText).then(() =>
                      toast.success("Copied to clipboard"),
                    )
                  }
                >
                  <Copy className="size-4 mr-1.5" />
                  Copy translation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </DashboardPage>
  );
}