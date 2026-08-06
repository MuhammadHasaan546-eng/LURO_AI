"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Download,
  ImageIcon,
  LoaderCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  ToolLayout,
  formControlClass,
} from "@/components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, getApiError } from "@/store/api";
import { useApiData } from "@/lib/dashboard-client";

type AiImage = {
  id: string;
  prompt: string;
  enhancedPrompt?: string;
  category: string;
  size: string;
  quality: string;
  secureUrl: string;
  width: number;
  height: number;
  createdAt: string;
};

const CATEGORIES = [
  { id: "general", label: "General" },
  { id: "photography", label: "Photography" },
  { id: "illustration", label: "Illustration" },
  { id: "product", label: "Product" },
  { id: "editorial", label: "Editorial" },
];

export default function ImagePage() {
  const history = useApiData<AiImage[]>("/api/ai/image?limit=12", []);
  const [result, setResult] = useState<AiImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("general");

  const generate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    form.set("category", selectedCategory); // Append selected category from state

    try {
      const image = await apiRequest<AiImage>("/api/ai/image", {
        method: "POST",
        data: Object.fromEntries(form),
      });
      setResult(image);
      void history.retry();
      toast.success("Image created successfully!");
    } catch (error) {
      toast.error(getApiError(error, "Unable to create image."));
    } finally {
      setLoading(false);
    }
  };

  const regenerate = async () => {
    if (!result) return;
    setLoading(true);
    try {
      const image = await apiRequest<AiImage>("/api/ai/image/regenerate", {
        method: "POST",
        data: { imageId: result.id },
      });
      setResult(image);
      void history.retry();
      toast.success("Image regenerated!");
    } catch (error) {
      toast.error(getApiError(error, "Unable to regenerate image."));
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={generate} className="space-y-6">
      <Field label="Describe your image">
        <textarea
          name="prompt"
          required
          maxLength={8000}
          rows={5}
          className={`${formControlClass} resize-none bg-white/[0.03] border-white/10 focus:border-violet-500/50`}
          placeholder="A serene futuristic library suspended above the clouds, cinematic light…"
        />
      </Field>

      {/* Shadcn UI Style Category Selector */}
      <Field label="Category">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-all border ${
                  isSelected
                    ? "bg-violet-500/20 border-violet-500 text-violet-200 shadow-sm"
                    : "bg-white/[0.02] border-white/10 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Size">
          <select
            name="size"
            defaultValue="1024x1024"
            className={`${formControlClass} bg-white/[0.03] border-white/10`}
          >
            <option value="1024x1024" className="bg-background">Square (1:1)</option>
            <option value="1024x1536" className="bg-background">Portrait (2:3)</option>
            <option value="1536x1024" className="bg-background">Landscape (3:2)</option>
          </select>
        </Field>
        <Field label="Quality">
          <select
            name="quality"
            defaultValue="medium"
            className={`${formControlClass} bg-white/[0.03] border-white/10`}
          >
            <option value="medium" className="bg-background">Medium</option>
            <option value="high" className="bg-background">High</option>
          </select>
        </Field>
      </div>

      <Button
        className="w-full bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20 py-5 transition-all"
        disabled={loading}
      >
        {loading ? <LoaderCircle className="animate-spin size-4" /> : <Sparkles className="size-4" />}
        {loading ? "Creating visual…" : "Generate image"}
      </Button>
    </form>
  );

  const output = result ? (
    <Card className="overflow-hidden border-white/10 bg-white/[0.02] shadow-2xl backdrop-blur">
      <div className="relative aspect-square w-full overflow-hidden bg-black/40 flex items-center justify-center">
        <Image
          src={result.secureUrl}
          alt={result.prompt}
          fill
          priority
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
      </div>
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border-t border-white/10">
        <div className="space-y-1 min-w-0 flex-1 pr-2">
          <p className="text-sm font-medium leading-snug text-foreground/90 truncate">{result.prompt}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {result.category} · {result.size} · {result.quality} quality
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => void regenerate()}
            className="border-white/10 hover:bg-white/5"
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            Regenerate
          </Button>
          <Button asChild size="sm" className="bg-white text-black hover:bg-white/90">
            <a
              href={result.secureUrl}
              download
              target="_blank"
              rel="noreferrer"
            >
              <Download className="size-3.5 mr-1.5" />
              Download
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  ) : (
    <EmptyState
      icon={ImageIcon}
      title="Your canvas is ready"
      description="Describe the visual you need, choose a format and Luro will bring it to life."
    />
  );

  const aside = (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">Recent creations</h2>
      {history.loading ? (
        <LoadingState />
      ) : history.error ? (
        <ErrorState message={history.error} retry={history.retry} />
      ) : history.data.length ? (
        <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-1">
          {history.data.map((image) => (
            <button
              key={image.id}
              onClick={() => setResult(image)}
              className={`group relative aspect-square overflow-hidden rounded-xl border transition-all ${
                result?.id === image.id
                  ? "border-violet-500 ring-2 ring-violet-500/30"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <Image
                src={image.secureUrl}
                alt={image.prompt}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
                sizes="280px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                <p className="text-[11px] text-white truncate w-full font-medium">{image.prompt}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No images generated yet.</p>
      )}
    </div>
  );

  return (
    <ToolLayout
      title="Image Studio"
      description="Generate original visuals for campaigns, products and ideas."
      form={formContent}
      result={output}
      aside={aside}
    />
  );
}