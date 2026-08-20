"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch, type SubmitHandler } from "react-hook-form";

import { submitCustomRequest } from "@/app/request/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  REQUEST_OCCASIONS,
  requestFormSchema,
  type RequestFormInput,
  type RequestFormValues,
} from "@/lib/validation/request";

function RequestForm({
  productSlug,
  availableSizes = [],
}: {
  productSlug?: string;
  availableSizes?: string[];
}) {
  const hasProduct = Boolean(productSlug);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormInput, unknown, RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      whatsappSame: true,
      whatsapp: "",
      productSlug: productSlug ?? "",
      description: "",
      size: "",
      budgetMin: "",
      budgetMax: "",
      occasion: "",
    },
  });

  const whatsappSame = useWatch({ control, name: "whatsappSame" });

  const onSubmit: SubmitHandler<RequestFormValues> = () => {
    setFormError(null);
    // The server performs the real parse/normalisation; send the raw
    // (pre-transform) input rather than the client's already-transformed
    // output — the client's validation is a courtesy, not the control.
    const raw = getValues();

    startTransition(async () => {
      const result = await submitCustomRequest(raw);

      if (result.ok) {
        setSubmitted(true);
        return;
      }

      for (const [field, message] of Object.entries(result.errors)) {
        if (field === "form") {
          setFormError(message);
        } else {
          setError(field as keyof RequestFormInput, { type: "server", message });
        }
      }
    });
  };

  if (submitted) {
    return (
      <div className="space-y-4 py-8">
        <h2 className="font-heading text-3xl text-foreground">Request sent.</h2>
        <p className="text-base text-muted-foreground">
          We&apos;ll be in touch on WhatsApp within a day.
        </p>
        <Link
          href="/suits"
          className="inline-block text-sm font-medium text-foreground underline underline-offset-4 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Back to all suits
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <input type="hidden" {...register("productSlug")} />

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          autoComplete="name"
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
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="0977123456"
          {...register("phone")}
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "phone-error" : undefined}
        />
        {errors.phone ? (
          <p id="phone-error" className="text-sm text-destructive">
            {errors.phone.message}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name="whatsappSame"
          render={({ field }) => (
            <Checkbox
              id="whatsappSame"
              checked={field.value ?? true}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="whatsappSame">WhatsApp number is the same as my phone number</Label>
      </div>

      {whatsappSame ? null : (
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp number</Label>
          <Input
            id="whatsapp"
            type="tel"
            autoComplete="tel"
            placeholder="0977123456"
            {...register("whatsapp")}
            aria-invalid={!!errors.whatsapp}
            aria-describedby={errors.whatsapp ? "whatsapp-error" : undefined}
          />
          {errors.whatsapp ? (
            <p id="whatsapp-error" className="text-sm text-destructive">
              {errors.whatsapp.message}
            </p>
          ) : null}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">What are you looking for?</Label>
        <Textarea
          id="description"
          rows={5}
          {...register("description")}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? "description-error" : undefined}
        />
        {errors.description ? (
          <p id="description-error" className="text-sm text-destructive">
            {errors.description.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="size">{hasProduct ? "Size" : "Size (optional)"}</Label>
        {hasProduct ? (
          <Controller
            control={control}
            name="size"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger
                  id="size"
                  className="w-full"
                  aria-invalid={!!errors.size}
                  aria-describedby={errors.size ? "size-error" : undefined}
                >
                  <SelectValue placeholder="Select a size" />
                </SelectTrigger>
                <SelectContent>
                  {availableSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        ) : (
          <Input
            id="size"
            placeholder="e.g. 40R"
            {...register("size")}
            aria-invalid={!!errors.size}
            aria-describedby={errors.size ? "size-error" : undefined}
          />
        )}
        {errors.size ? (
          <p id="size-error" className="text-sm text-destructive">
            {errors.size.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label id="budget-label">Budget (ZMW, optional)</Label>
        <div className="flex gap-3" role="group" aria-labelledby="budget-label">
          <div className="flex-1 space-y-1">
            <Label htmlFor="budgetMin" className="text-xs font-normal text-muted-foreground">
              Minimum
            </Label>
            <Input
              id="budgetMin"
              type="number"
              inputMode="numeric"
              min={0}
              {...register("budgetMin")}
              aria-invalid={!!errors.budgetMin}
              aria-describedby={errors.budgetMin ? "budgetMin-error" : undefined}
            />
          </div>
          <div className="flex-1 space-y-1">
            <Label htmlFor="budgetMax" className="text-xs font-normal text-muted-foreground">
              Maximum
            </Label>
            <Input
              id="budgetMax"
              type="number"
              inputMode="numeric"
              min={0}
              {...register("budgetMax")}
              aria-invalid={!!errors.budgetMax}
              aria-describedby={errors.budgetMax ? "budgetMax-error" : undefined}
            />
          </div>
        </div>
        {errors.budgetMin ? (
          <p id="budgetMin-error" className="text-sm text-destructive">
            {errors.budgetMin.message}
          </p>
        ) : null}
        {errors.budgetMax ? (
          <p id="budgetMax-error" className="text-sm text-destructive">
            {errors.budgetMax.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="occasion">Occasion (optional)</Label>
        <Controller
          control={control}
          name="occasion"
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger id="occasion" className="w-full">
                <SelectValue placeholder="Select an occasion" />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_OCCASIONS.map((occasion) => (
                  <SelectItem key={occasion} value={occasion}>
                    {occasion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {formError ? (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full px-8 text-base sm:w-auto"
        disabled={isSubmitting || isPending}
      >
        {isPending ? "Sending…" : "Send Request"}
      </Button>
    </form>
  );
}

export { RequestForm };
