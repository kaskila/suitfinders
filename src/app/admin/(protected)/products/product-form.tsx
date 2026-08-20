"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, XIcon } from "lucide-react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type SubmitHandler,
} from "react-hook-form";

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
  PRODUCT_STATUSES,
  productFormSchema,
  slugify,
  type ProductFormInput,
  type ProductFormValues,
} from "@/lib/validation/product";

import { createProductAction, updateProductAction } from "./actions";
import { ProductImageUploader } from "./image-uploader";

const STATUS_LABELS: Record<(typeof PRODUCT_STATUSES)[number], string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

function ProductForm({
  mode,
  productId,
  defaultValues,
  brands,
  vendors,
  categories,
  initialImageUrls,
}: {
  mode: "create" | "edit";
  productId?: string;
  defaultValues: ProductFormInput;
  brands: { id: string; name: string }[];
  vendors: { id: string; businessName: string }[];
  categories: { id: string; name: string }[];
  initialImageUrls: Record<string, string>;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // In edit mode the slug already means something (it's the live URL) —
  // only auto-regenerate it from the name in create mode, and only until
  // the admin edits it directly.
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  const nameValue = useWatch({ control, name: "name" });
  const slugField = register("slug");

  useEffect(() => {
    if (!slugTouched) {
      setValue("slug", slugify(nameValue ?? ""), { shouldValidate: false });
    }
  }, [nameValue, slugTouched, setValue]);

  const {
    fields: categoryFields,
    append: appendCategory,
    remove: removeCategory,
    update: updateCategory,
  } = useFieldArray({ control, name: "categories" });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({ control, name: "variants" });

  function toggleCategory(categoryId: string, checked: boolean) {
    const index = categoryFields.findIndex((field) => field.categoryId === categoryId);
    if (checked && index === -1) {
      appendCategory({ categoryId, isPrimary: categoryFields.length === 0 });
    } else if (!checked && index !== -1) {
      removeCategory(index);
    }
  }

  function setPrimaryCategory(categoryId: string) {
    categoryFields.forEach((field, index) => {
      const shouldBePrimary = field.categoryId === categoryId;
      if (field.isPrimary !== shouldBePrimary) {
        updateCategory(index, { categoryId: field.categoryId, isPrimary: shouldBePrimary });
      }
    });
  }

  const onSubmit: SubmitHandler<ProductFormValues> = () => {
    setFormError(null);
    // Send the raw (pre-transform) input — the server performs the real
    // parse/normalisation; the client's validation is a courtesy.
    const raw = getValues();

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProductAction(raw)
          : await updateProductAction(productId as string, raw);

      if (result.ok) {
        router.push("/admin/products");
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-10">
      <div className="space-y-6">
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

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="brandId">Brand</Label>
            <Controller
              control={control}
              name="brandId"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="brandId"
                    className="w-full"
                    aria-invalid={!!errors.brandId}
                  >
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.brandId ? (
              <p className="text-sm text-destructive">{errors.brandId.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendorId">Vendor</Label>
            <Controller
              control={control}
              name="vendorId"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="vendorId"
                    className="w-full"
                    aria-invalid={!!errors.vendorId}
                  >
                    <SelectValue placeholder="Select a vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.businessName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.vendorId ? (
              <p className="text-sm text-destructive">{errors.vendorId.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Categories</Label>
        <ul className="space-y-2">
          {categories.map((category) => {
            const index = categoryFields.findIndex((field) => field.categoryId === category.id);
            const selected = index !== -1;
            const isPrimary = selected ? categoryFields[index].isPrimary : false;

            return (
              <li key={category.id} className="flex items-center gap-3">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selected}
                  onCheckedChange={(checked) => toggleCategory(category.id, checked === true)}
                />
                <Label htmlFor={`category-${category.id}`} className="font-normal">
                  {category.name}
                </Label>
                {selected ? (
                  <label className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                    <input
                      type="radio"
                      name="primaryCategory"
                      checked={isPrimary}
                      onChange={() => setPrimaryCategory(category.id)}
                    />
                    Primary
                  </label>
                ) : null}
              </li>
            );
          })}
        </ul>
        {errors.categories ? (
          <p role="alert" className="text-sm text-destructive">
            {(errors.categories as { message?: string }).message ?? "Check the categories above."}
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Variants</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendVariant({ size: "", color: "", sku: "", price: "", stock: "" })
            }
          >
            <PlusIcon /> Add variant
          </Button>
        </div>

        {errors.variants?.message ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.variants.message}
          </p>
        ) : null}

        <div className="space-y-4">
          {variantFields.map((field, index) => {
            const variantErrors = errors.variants?.[index];
            return (
              <div
                key={field.id}
                className="grid grid-cols-2 gap-3 border border-border p-4 sm:grid-cols-5 sm:items-start"
              >
                <div className="space-y-1">
                  <Label className="text-xs font-normal text-muted-foreground">Size</Label>
                  <Input {...register(`variants.${index}.size` as `variants.${number}.size`)} />
                  {variantErrors?.size ? (
                    <p className="text-xs text-destructive">{variantErrors.size.message}</p>
                  ) : null}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-normal text-muted-foreground">Colour</Label>
                  <Input {...register(`variants.${index}.color` as `variants.${number}.color`)} />
                  {variantErrors?.color ? (
                    <p className="text-xs text-destructive">{variantErrors.color.message}</p>
                  ) : null}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-normal text-muted-foreground">SKU</Label>
                  <Input {...register(`variants.${index}.sku` as `variants.${number}.sku`)} />
                  {variantErrors?.sku ? (
                    <p className="text-xs text-destructive">{variantErrors.sku.message}</p>
                  ) : null}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-normal text-muted-foreground">
                    Price (ZMW)
                  </Label>
                  <Input
                    inputMode="decimal"
                    {...register(`variants.${index}.price` as `variants.${number}.price`)}
                  />
                  {variantErrors?.price ? (
                    <p className="text-xs text-destructive">{variantErrors.price.message}</p>
                  ) : null}
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs font-normal text-muted-foreground">Stock</Label>
                    <Input
                      inputMode="numeric"
                      {...register(`variants.${index}.stock` as `variants.${number}.stock`)}
                    />
                    {variantErrors?.stock ? (
                      <p className="text-xs text-destructive">{variantErrors.stock.message}</p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove variant"
                    onClick={() => removeVariant(index)}
                    disabled={variantFields.length <= 1}
                  >
                    <XIcon />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ProductImageUploader
        control={control}
        register={register}
        initialUrls={initialImageUrls}
        error={errors.images?.message}
      />

      {formError ? (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="h-12 px-8 text-base" disabled={isSubmitting || isPending}>
        {isPending ? "Saving…" : mode === "create" ? "Create Product" : "Save Changes"}
      </Button>
    </form>
  );
}

export { ProductForm };
