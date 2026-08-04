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
export default function ImagePage() {
  const history = useApiData<AiImage[]>("/api/ai/image?limit=12", []);
  const [result, setResult] = useState<AiImage | null>(null);
  const [loading, setLoading] = useState(false);
  const generate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const image = await apiRequest<AiImage>("/api/ai/image", {
        method: "POST",
        data: Object.fromEntries(form),
      });
      setResult(image);
      void history.retry();
      toast.success("Image created");
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
    } catch (error) {
      toast.error(getApiError(error, "Unable to regenerate image."));
    } finally {
      setLoading(false);
    }
  };
  const form = (
    <form onSubmit={generate} className="space-y-5">
      <Field label="Describe your image">
        <textarea
          name="prompt"
          required
          maxLength={8000}
          rows={7}
          className={`${formControlClass} resize-none`}
          placeholder="A serene futuristic library suspended above the clouds, cinematic light…"
        />
      </Field>
      <Field label="Category">
        <select
          name="category"
          defaultValue="general"
          className={formControlClass}
        >
          <option value="general">General</option>
          <option value="photography">Photography</option>
          <option value="illustration">Illustration</option>
          <option value="product">Product</option>
          <option value="editorial">Editorial</option>
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Size">
          <select
            name="size"
            defaultValue="1024x1024"
            className={formControlClass}
          >
            <option value="1024x1024">Square</option>
            <option value="1024x1536">Portrait</option>
            <option value="1536x1024">Landscape</option>
          </select>
        </Field>
        <Field label="Quality">
          <select
            name="quality"
            defaultValue="medium"
            className={formControlClass}
          >
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </Field>
      </div>
      <Button
        className="w-full bg-violet-500 text-white hover:bg-violet-400"
        disabled={loading}
      >
        {loading ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
        {loading ? "Creating…" : "Generate image"}
      </Button>
    </form>
  );
  const output = result ? (
    <Card className="overflow-hidden border-white/10 bg-white/[0.025]">
      <div className="relative aspect-square w-full overflow-hidden bg-black/20">
        <Image
          src={result.secureUrl}
          alt={result.prompt}
          fill
          priority
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
      </div>
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm">{result.prompt}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {result.size} · {result.quality} quality
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => void regenerate()}
          >
            <RefreshCw />
            Regenerate
          </Button>
          <Button asChild size="sm">
            <a
              href={result.secureUrl}
              download
              target="_blank"
              rel="noreferrer"
            >
              <Download />
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
    <div>
      <h2 className="mb-3 text-sm font-medium">Recent images</h2>
      {history.loading ? (
        <LoadingState />
      ) : history.error ? (
        <ErrorState message={history.error} retry={history.retry} />
      ) : history.data.length ? (
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
          {history.data.map((image) => (
            <button
              key={image.id}
              onClick={() => setResult(image)}
              className="group relative aspect-square overflow-hidden rounded-xl border border-white/10"
            >
              <Image
                src={image.secureUrl}
                alt={image.prompt}
                fill
                className="object-cover transition group-hover:scale-105"
                sizes="280px"
              />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No images yet.</p>
      )}
    </div>
  );
  return (
    <ToolLayout
      title="Image Studio"
      description="Generate original visuals for campaigns, products and ideas."
      form={form}
      result={output}
      aside={aside}
    />
  );
}
