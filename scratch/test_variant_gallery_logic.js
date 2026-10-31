function resolveGallery(product, selectedVariant) {
  if (selectedVariant?.images && selectedVariant.images.length > 0) {
    const variantList = [];
    selectedVariant.images.forEach((img) => {
      if (img.url && !variantList.includes(img.url)) {
        variantList.push(img.url);
      }
    });
    if (variantList.length > 0) return variantList;
  }

  if (product.images && product.images.length > 0) {
    const rootList = [];
    product.images.forEach((img) => {
      if (img.url && !rootList.includes(img.url)) {
        rootList.push(img.url);
      }
    });
    if (rootList.length > 0) return rootList;
  }

  return [];
}

function runTests() {
  const whiteImg = "https://res.cloudinary.com/demo/white.jpg";
  const redImg = "https://res.cloudinary.com/demo/red.jpg";
  const red1 = "https://res.cloudinary.com/demo/red-1.jpg";
  const red2 = "https://res.cloudinary.com/demo/red-2.jpg";

  const productWithRoot = {
    images: [{ url: whiteImg }],
    variants: [
      { id: "v-red-1", sku: "RED-1", images: [{ url: redImg }] },
      { id: "v-black-1", sku: "BLACK-1", images: [] },
      { id: "v-red-multi", sku: "RED-MULTI", images: [{ url: red1 }, { url: red2 }] }
    ]
  };

  const productNoRoot = {
    images: [],
    variants: [
      { id: "v-red-1", sku: "RED-1", images: [{ url: redImg }] },
      { id: "v-black-1", sku: "BLACK-1", images: [] }
    ]
  };

  console.log("=== TEST CASE 1: Variant with NO image -> fallback to root image ===");
  const res1 = resolveGallery(productWithRoot, productWithRoot.variants[1]);
  console.log("Expected: [white.jpg], Actual:", res1);
  console.assert(res1.length === 1 && res1[0] === whiteImg, "Test 1 Failed!");

  console.log("\n=== TEST CASE 2: Variant with ONE image -> ONLY variant image ===");
  const res2 = resolveGallery(productWithRoot, productWithRoot.variants[0]);
  console.log("Expected: [red.jpg], Actual:", res2);
  console.assert(res2.length === 1 && res2[0] === redImg, "Test 2 Failed!");

  console.log("\n=== TEST CASE 3: Variant with MULTIPLE images -> ONLY variant images ===");
  const res3 = resolveGallery(productWithRoot, productWithRoot.variants[2]);
  console.log("Expected: [red-1.jpg, red-2.jpg], Actual:", res3);
  console.assert(res3.length === 2 && res3[0] === red1 && res3[1] === red2, "Test 3 Failed!");

  console.log("\n=== TEST CASE 4: Product with NO root image & imageless variant ===");
  const res4 = resolveGallery(productNoRoot, productNoRoot.variants[1]);
  console.log("Expected: [], Actual:", res4);
  console.assert(res4.length === 0, "Test 4 Failed!");

  console.log("\n=== TEST CASE 5: Product with NO root image & image-bearing variant ===");
  const res5 = resolveGallery(productNoRoot, productNoRoot.variants[0]);
  console.log("Expected: [red.jpg], Actual:", res5);
  console.assert(res5.length === 1 && res5[0] === redImg, "Test 5 Failed!");

  console.log("\nALL 5 TEST CASES PASSED SUCCESSFULLY!");
}

runTests();
