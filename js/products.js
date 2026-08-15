let allProducts = [];
let activeCategory = "All";

document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
    setupFiltersAndSearch();
});

// GitHub-ൽ നിന്ന് പ്രൊഡക്റ്റുകൾ ലോഡ് ചെയ്യുന്നു
async function fetchProducts() {
    try {
        const response = await fetch("data/products.json");
        if (!response.ok) throw new Error("Failed to load products");
        allProducts = await response.json();
        filterAndRenderProducts();
    } catch (error) {
        console.error("Error fetching products:", error);
        const container = document.getElementById("productsContainer");
        if (container) {
            container.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: red;'>Products load ചെയ്യാൻ സാധിച്ചില്ല.</p>";
        }
    }
}

// ഫിൽറ്ററും സെർച്ചും സെറ്റ് ചെയ്യുന്നു
function setupFiltersAndSearch() {
    const searchInput = document.getElementById("searchInput");
    const filterButtons = document.querySelectorAll(".filter-btn");

    if (searchInput) {
        searchInput.addEventListener("input", filterAndRenderProducts);
    }

    filterButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            // Dropdown കുറിച്ച് പ്രശ്നം വരാതിരിക്കാൻ
            if (btn.classList.contains('filter-dropdown-btn')) {
                // plastic button click (തുടർനടപടികൾ ആവശ്യമില്ല)
            }
            
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            activeCategory = btn.getAttribute("data-category") || "All";
            filterAndRenderProducts();
        });
    });
}

// പ്രൊഡക്റ്റുകൾ ഫിൽറ്റർ ചെയ്ത് കാണിക്കുന്നു (Name, Brand, Sub-Category എന്നിവ സെർച്ച് ചെയ്യും)
function filterAndRenderProducts() {
    const searchInput = document.getElementById("searchInput");
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";

    const filtered = allProducts.filter(product => {
        // 1. Category Matching
        const matchCategory = (activeCategory === "All") || (product.category === activeCategory);

        // 2. Search Matching (Name, Brand, and Sub-Category)
        const nameMatch = product.name && product.name.toLowerCase().includes(searchTerm);
        const brandMatch = product.brand && product.brand.toLowerCase().includes(searchTerm);
        const subCatMatch = product.subCategory && product.subCategory.toLowerCase().includes(searchTerm);

        const matchSearch = !searchTerm || nameMatch || brandMatch || subCatMatch;

        return matchCategory && matchSearch;
    });

    renderProducts(filtered);
}

// പ്രൊഡക്റ്റ് കാർഡുകൾ സ്ക്രീനിൽ കാണിക്കുന്നു
function renderProducts(products) {
    const container = document.getElementById("productsContainer");
    const noResults = document.getElementById("noResults");

    if (!container) return;
    container.innerHTML = "";

    if (!products || products.length === 0) {
        if (noResults) noResults.hidden = false;
        return;
    }

    if (noResults) noResults.hidden = true;

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        // Variants/Options handling
        let optionsHTML = "";
        let initialPrice = product.price || "";
        let initialImage = product.image || "images/logo.jpg";

        if (product.variants && product.variants.length > 0) {
            if (product.variants[0].price) initialPrice = product.variants[0].price;
            if (product.variants[0].image) initialImage = product.variants[0].image;

            optionsHTML = `
                <div class="product-options">
                    <label style="font-size:12px; font-weight:bold; color:#475569; display:block; margin-bottom:5px;">Select Option:</label>
                    <div class="option-buttons" style="display:flex; gap:6px; flex-wrap:wrap;">
                        ${product.variants.map((v, idx) => `
                            <button class="opt-btn ${idx === 0 ? 'active' : ''}" 
                                    data-price="${v.price || product.price}" 
                                    data-image="${v.image || product.image}"
                                    onclick="changeVariant(this, '${product.id}')"
                                    style="padding:5px 10px; border:1px solid #cbd5e1; background:${idx === 0 ? '#0b5ed7' : '#fff'}; color:${idx === 0 ? '#fff' : '#1e293b'}; border-radius:6px; cursor:pointer; font-size:13px; font-weight:bold;">
                                ${v.label}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        const whatsappMsg = encodeURIComponent(`Hello Star Agencies, I am interested in ${product.name}. Please send me details.`);
        const whatsappLink = `https://wa.me/919447016013?text=${whatsappMsg}`;

        card.innerHTML = `
            <div class="product-image-box" style="height:220px; text-align:center; padding:10px;">
                <img id="img-${product.id}" src="${initialImage}" alt="${product.name}" style="max-height:100%; max-width:100%; object-fit:contain;">
            </div>
            <div class="product-info" style="padding:15px;">
                <span class="category-badge" style="font-size:11px; font-weight:bold; color:#0b5ed7; text-transform:uppercase;">${product.category || ''}</span>
                <h3 style="margin:8px 0 4px; font-size:18px; color:#0f172a;">${product.name}</h3>
                <p style="color:#64748b; font-size:13px; margin-bottom:10px;">${product.brand || ''}</p>
                
                <div class="price-box" style="margin-bottom:12px;">
                    <span id="price-${product.id}" style="font-size:18px; font-weight:bold; color:#10b981;">₹${initialPrice}</span>
                </div>

                ${optionsHTML}

                <a href="${whatsappLink}" target="_blank" class="btn-whatsapp" style="display:block; text-align:center; margin-top:15px; background:#e8f5e9; color:#2e7d32; padding:10px; border-radius:8px; text-decoration:none; font-weight:bold; font-size:13px;">
                    For more details contact 💬
                </a>
            </div>
        `;

        container.appendChild(card);
    });
}

// Option/Size മാറുമ്പോൾ വിലയും ഇമേജും മാറാൻ
window.changeVariant = function(btn, productId) {
    const parent = btn.parentElement;
    parent.querySelectorAll('.opt-btn').forEach(b => {
        b.style.background = '#fff';
        b.style.color = '#1e293b';
    });
    btn.style.background = '#0b5ed7';
    btn.style.color = '#fff';

    const newPrice = btn.getAttribute('data-price');
    const newImage = btn.getAttribute('data-image');

    if (newPrice) document.getElementById(`price-${productId}`).innerText = `₹${newPrice}`;
    if (newImage && newImage !== '') document.getElementById(`img-${productId}`).src = newImage;
};