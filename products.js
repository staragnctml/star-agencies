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

            <span class="variant-title">
                Options:
            </span>

            ${product.variants.map(v => `
                <button class="variant-btn">
                    ${v.label}
                </button>
            `).join("")}

        </div>
    `;
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
                        >
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