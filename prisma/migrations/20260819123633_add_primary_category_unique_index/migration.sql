CREATE UNIQUE INDEX product_category_one_primary
  ON "ProductCategory" ("productId")
  WHERE "isPrimary" = true;
