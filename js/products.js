let allProducts = [];
let selectedCategory = "All";

const container = document.getElementById("productsContainer");
const searchInput = document.getElementById("searchInput");
const noResults = document.getElementById("noResults");

async function loadProducts() {
    try {
        const response = await fetch("data/products.json");

        if (!response.ok) {
            throw new Error("products.json not found");
        }

        allProducts = await response.json();

        renderProducts();

    } catch (error) {
        console.error("Product loading error:", error);

        container.innerHTML = "<p>Products could not be loaded.</p>";
    }
}

function renderVariants(product) {
  if (!product.variants || product.variants.length === 0) {
    return "";
  }

  return `
    <div class="variants">
      <span class="variant-title">Options:</span>

      ${product.variants.map((v, index) => `
        <button
          class="variant-btn ${index === 0 ? "active" : ""}"
          onclick="selectVariant(this, '${v.label}')">
          ${v.label}
        </button>
      `).join("")}
    </div>
  `;
}

function selectVariant(button, value) {
  const buttons = button.parentElement.querySelectorAll(".variant-btn");

  buttons.forEach(btn => {
    btn.classList.remove("active");
  });

  button.classList.add("active");

  console.log("Selected option:", value);
}

function renderProducts() {
    const term = searchInput.value.trim().toLowerCase();

    const filtered = allProducts.filter(product => {
        // Category Matching (Flexible comparison to ignore case or minor spelling space differences)
        const prodCategory = (product.category || "").trim().toLowerCase();
        const selCategory = selectedCategory.trim().toLowerCase();

        const categoryMatch =
            selectedCategory === "All" ||
            prodCategory === selCategory ||
            (selCategory.includes("stationer") && prodCategory.includes("stationer"));

        // Variants text extracting for search
        const variantLabels = product.variants 
            ? product.variants.map(v => v.label).join(" ") 
            : "";

        // Combine all searchable text
        const searchText = `
            ${product.name || ""}
            ${product.brand || ""}
            ${product.category || ""}
            ${product.subcategory || ""}
            ${product.description || ""}
            ${variantLabels}
        `.toLowerCase();

        const searchMatch = term === "" || searchText.includes(term);

        return categoryMatch && searchMatch;
    });

    container.innerHTML = filtered.map(product => {

        const price = product.price
            ? (product.price.startsWith("₹") || isNaN(product.price.charAt(0)) ? product.price : `₹${product.price}`)
            : "Contact Us";

        const message = encodeURIComponent(
            `Hello Star Agencies, I am interested in ${product.name}. Please send me details.`
        );

        return `
            <article class="product-card">

                <img
                    class="product-image"
                    src="${product.image}"
                    alt="${product.name}"
                >

                <div class="product-info">

                    <span class="product-category">
                        ${product.category || ""}
                    </span>

                    <h3>
                        ${product.name}
                    </h3>

                    <div class="brand">
                        ${product.brand || ""}
                        ${
                            product.subcategory
                            ? " • " + product.subcategory
                            : ""
                        }
                    </div>

                    <div class="price">
                        Price: ${price}
                    </div>

                    ${renderVariants(product)}

                    <div class="stock">
                        ${product.stock || ""}
                    </div>

                    <div class="product-actions">
                        <a href="https://wa.me/919447016013?text=${message}" target="_blank" rel="noopener" class="modern-wa-btn">
                            <span class="wa-text">For more details contact</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="wa-svg"><path fill="#25D366" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                        </a>
                    </div>

                </div>

            </article>
        `;

    }).join("");

    noResults.hidden = filtered.length !== 0;
}

/* SEARCH */
searchInput.addEventListener("input", () => {
    renderProducts();
});

/* CATEGORY FILTER */
document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        document
            .querySelectorAll(".filter-btn")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        selectedCategory = button.dataset.category;

        renderProducts();
    });
});

/* START */
loadProducts();