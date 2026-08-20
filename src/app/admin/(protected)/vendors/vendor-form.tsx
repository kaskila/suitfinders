"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  VENDOR_STATUSES,
  vendorFormSchema,
  type VendorFormInput,
  type VendorFormValues,
} from "@/lib/validation/vendor";

import { createVendorAction, updateVendorAction } from "./actions";

const STATUS_LABELS: Record<(typeof VENDOR_STATUSES)[number], string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

function VendorForm({
  mode,
  vendorId,
  defaultValues,
}: {
  mode: "create" | "edit";
  vendorId?: string;
  defaultValues: VendorFormInput;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VendorFormInput, unknown, VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues,
  });

  const onSubmit: SubmitHandler<VendorFormValues> = () => {
    setFormError(null);
    // Send the raw (pre-transform) input — the server performs the real
    // parse/normalisation; the client's validation is a courtesy.
    const raw = getValues();

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createVendorAction(raw)
          : await updateVendorAction(vendorId as string, raw);

      if (result.ok) {
        router.push("/admin/vendors");
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
        <Label htmlFor="businessName">Business name</Label>
        <Input
          id="businessName"
          {...register("businessName")}
          aria-invalid={!!errors.businessName}
          aria-describedby={errors.businessName ? "businessName-error" : undefined}
        />
        {errors.businessName ? (
          <p id="businessName-error" className="text-sm text-destructive">
            {errors.businessName.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactInfo">Contact info</Label>
        <Input
          id="contactInfo"
          placeholder="Phone number or email"
          {...register("contactInfo")}
          aria-invalid={!!errors.contactInfo}
          aria-describedby={errors.contactInfo ? "contactInfo-error" : undefined}
        />
        {errors.contactInfo ? (
          <p id="contactInfo-error" className="text-sm text-destructive">
            {errors.contactInfo.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="status" className="w-full sm:w-48">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {VENDOR_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
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

      <Button type="submit" size="lg" className="h-12 px-8 text-base" disabled={isSubmitting || isPending}>
        {isPending ? "Saving…" : mode === "create" ? "Create Vendor" : "Save Changes"}
      </Button>
    </form>
  );
}

export { VendorForm };
