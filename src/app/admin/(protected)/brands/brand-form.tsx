"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/validation/product";
import { brandFormSchema, type BrandFormInput, type BrandFormValues } from "@/lib/validation/brand";

import { createBrandAction, updateBrandAction } from "./actions";
import { LogoUploader } from "./logo-uploader";

function BrandForm({
  mode,
  brandId,
  defaultValues,
  initialLogoUrl,
}: {
  mode: "create" | "edit";
  brandId?: string;
  defaultValues: BrandFormInput;
  initialLogoUrl?: string;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // In edit mode the slug already means something (it's used to build the
  // product form's brand list) — only auto-regenerate it from the name in
  // create mode, and only until the admin edits it directly.
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormInput, unknown, BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues,
  });

  const nameValue = useWatch({ control, name: "name" });
  const logoRefValue = useWatch({ control, name: "logoRef" });
  const slugField = register("slug");

  useEffect(() => {
    if (!slugTouched) {
      setValue("slug", slugify(nameValue ?? ""), { shouldValidate: false });
    }
  }, [nameValue, slugTouched, setValue]);

  const onSubmit: SubmitHandler<BrandFormValues> = () => {
    setFormError(null);
    // Send the raw (pre-transform) input — the server performs the real
    // parse/normalisation; the client's validation is a courtesy.
    const raw = getValues();

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createBrandAction(raw)
          : await updateBrandAction(brandId as string, raw);

      if (result.ok) {
        router.push("/admin/brands");
        return;
      }

      for (const [field, message] of Object.entries(result.errors)) {
        if (field === "form") {
          setFormError(message);
        } else {
          setError(field as Parameters<typeof setError>[0], { type: "server", message });
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...register("name")}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name ? (
          <p id="name-error" className="text-sm text-destructive">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          {...slugField}
          onChange={(event) => {
            setSlugTouched(true);
            void slugField.onChange(event);
          }}
          aria-invalid={!!errors.slug}
          aria-describedby={errors.slug ? "slug-error" : undefined}
        />
        {errors.slug ? (
          <p id="slug-error" className="text-sm text-destructive">
            {errors.slug.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={4} {...register("description")} />
      </div>

      <LogoUploader
        value={logoRefValue ?? ""}
        onChange={(ref) => setValue("logoRef", ref, { shouldValidate: true })}
        initialUrl={initialLogoUrl}
        error={errors.logoRef?.message}
      />

      {formError ? (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="h-12 px-8 text-base" disabled={isSubmitting || isPending}>
        {isPending ? "Saving…" : mode === "create" ? "Create Brand" : "Save Changes"}
      </Button>
    </form>
  );
}

export { BrandForm };
