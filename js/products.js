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

        container.innerHTML =
            "<p>Products could not be loaded.</p>";
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

        const categoryMatch =
            selectedCategory === "All" ||
            product.category === selectedCategory;

        const searchText = `
            ${product.name || ""}
            ${product.brand || ""}
            ${product.category || ""}
            ${product.subcategory || ""}
            ${product.description || ""}
        `.toLowerCase();

        const searchMatch =
            term === "" || searchText.includes(term);

        return categoryMatch && searchMatch;
    });


    container.innerHTML = filtered.map(product => {

        const price = product.price
            ? `₹${product.price}`
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
                    loading="lazy"
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

                        <a
    href="https://wa.me/919447016013?text=${message}"
    target="_blank"
    rel="noopener"
    class="btn-whatsapp"
>
    <svg class="whatsapp-icon" viewBox="0 0 32 32">
        <path d="M16 3C8.8 3 3 8.8 3 16c0 2.3.6 4.5 1.7 6.4L3 29l6.8-1.7C11.8 28.4 13.9 29 16 29c7.2 0 13-5.8 13-13S23.2 3 16 3zm0 23.5c-2 0-3.9-.6-5.5-1.7l-.4-.3-4 .9 1-3.9-.3-.4C5.7 19.6 5 17.8 5 16 5 10 10 5 16 5s11 5 11 11-5 10.5-11 10.5zm6-7.8c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-1.5-.7-2.5-1.3-3.5-2.9-.3-.5.3-.5.8-1.7.1-.2.1-.4 0-.6-.1-.2-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.6s1.1 3 1.2 3.2c.2.2 2.2 3.4 5.4 4.8 2 .9 2.8 1 3.8.8.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.1-1.4-.1-.2-.3-.3-.6-.4z"/>
    </svg>
    WhatsApp
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
            .forEach(btn =>
                btn.classList.remove("active")
            );

        button.classList.add("active");

        selectedCategory =
            button.dataset.category;

        renderProducts();

    });

});


/* START */

loadProducts();