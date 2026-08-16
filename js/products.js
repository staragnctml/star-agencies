let allProducts = [];
let selectedCategory = "All";
window.productVariantsMap = {}; 

const container = document.getElementById("productsContainer");
const searchInput = document.getElementById("searchInput");
const noResults = document.getElementById("noResults");

async function loadProducts() {
    try {
        const response = await fetch("data/products.json?t=" + new Date().getTime());
        if (!response.ok) throw new Error("products.json not found");
        allProducts = await response.json();
        renderProducts();
    } catch (error) {
        console.error("Product loading error:", error);
        container.innerHTML = "<p>Products could not be loaded.</p>";
    }
}

function renderProducts() {
    const term = searchInput ? searchInput.value.trim().toLowerCase() : "";
    window.productVariantsMap = {}; 

    const filtered = allProducts.filter(product => {
        const categoryMatch = selectedCategory === "All" || product.category === selectedCategory;
        const variantText = product.variants ? product.variants.map(v => v.label || "").join(" ") : "";
        const searchText = `${product.name || ""} ${product.brand || ""} ${product.category || ""} ${product.subCategory || ""} ${variantText}`.toLowerCase();
        return categoryMatch && (term === "" || searchText.includes(term));
    });

    container.innerHTML = filtered.map(product => {
        let basePrice = product.price || "Contact Us";
        let displayPrice = basePrice;
        let displayImage = product.image;
        let displayName = product.name;
        let defaultVariantLabel = "";
        let variantsHTML = "";

        if (product.variants && product.variants.length > 0) {
            let brandGroups = {};
            let hasHyphen = false;

            product.variants.forEach(v => {
                let lbl = v.label || v.name || "";
                if (lbl.includes("-")) {
                    hasHyphen = true;
                    let parts = lbl.split("-");
                    let bName = parts[0].trim();
                    let sName = parts.slice(1).join("-").trim();
                    if (!brandGroups[bName]) brandGroups[bName] = [];
                    brandGroups[bName].push({ size: sName, price: v.price, image: v.image, originalLabel: lbl });
                }
            });

            if (hasHyphen && Object.keys(brandGroups).length > 0) {
                window.productVariantsMap[product.id] = brandGroups;
                let brands = Object.keys(brandGroups);
                let firstBrand = brands[0];
                let firstSize = brandGroups[firstBrand][0];
                
                defaultVariantLabel = firstSize.originalLabel;
                if (firstSize.price) displayPrice = firstSize.price;
                if (firstSize.image) displayImage = firstSize.image;

                let brandSelectHTML = `
                <div style="position: relative; margin-bottom: 8px;">
                    <select onchange="changeBrand(this, '${product.id}', '${product.name.replace(/'/g, "\\'")}')"
                        style="appearance: none; -webkit-appearance: none; width: 100%; padding: 6px 30px 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; background-color: #f8fafc; color: #0f172a; font-size: 13px; font-weight: 600; cursor: pointer; outline: none; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                        ${brands.map(b => `<option value="${b.replace(/"/g, '&quot;')}">${b}</option>`).join('')}
                    </select>
                    <div style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                </div>`;

                let sizeButtonsHTML = `<div id="sizes-${product.id}" style="display:flex; gap:5px; flex-wrap:wrap;">`;
                brandGroups[firstBrand].forEach((sz, idx) => {
                    let bg = idx === 0 ? "#0b5ed7" : "#fff";
                    let col = idx === 0 ? "#fff" : "#475569";
                    let act = idx === 0 ? "active" : "";
                    sizeButtonsHTML += `<button class="sz-btn ${act}" onclick="selectSize(this, '${product.id}', '${sz.originalLabel.replace(/'/g, "\\'")}', '${sz.price || basePrice}', '${product.name.replace(/'/g, "\\'")}', '${sz.image || displayImage}')" style="padding: 4px 10px; border: 1px solid #cbd5e1; border-radius: 4px; background: ${bg}; color: ${col}; cursor: pointer; font-size: 11px; font-weight: 600; transition:0.2s;">${sz.size}</button>`;
                });
                sizeButtonsHTML += `</div>`;

                variantsHTML = `
                    <div class="variants" style="margin-top: 10px; margin-bottom: 15px;">
                        <span style="font-size: 10px; color: #64748b; font-weight: 700; margin-bottom:3px; display:block; letter-spacing:0.5px;">SELECT BRAND:</span>
                        ${brandSelectHTML}
                        <span style="font-size: 10px; color: #64748b; font-weight: 700; margin-top:8px; margin-bottom:4px; display:block; letter-spacing:0.5px;">SELECT SIZE:</span>
                        ${sizeButtonsHTML}
                    </div>
                `;
            } else {
                let firstV = product.variants[0];
                defaultVariantLabel = firstV.label || firstV.name;
                if (firstV.price) displayPrice = firstV.price;
                if (firstV.image) displayImage = firstV.image;

                let btns = product.variants.map((v, idx) => {
                    let lbl = v.label || v.name;
                    let bg = idx === 0 ? "#0b5ed7" : "#fff";
                    let col = idx === 0 ? "#fff" : "#475569";
                    let act = idx === 0 ? "active" : "";
                    return `<button class="sz-btn ${act}" onclick="selectSize(this, '${product.id}', '${lbl.replace(/'/g, "\\'")}', '${v.price || basePrice}', '${product.name.replace(/'/g, "\\'")}', '${v.image || displayImage}')" style="padding: 4px 10px; border: 1px solid #cbd5e1; border-radius: 4px; background: ${bg}; color: ${col}; cursor: pointer; font-size: 11px; font-weight: 600; transition:0.2s;">${lbl}</button>`;
                }).join("");

                variantsHTML = `
                    <div class="variants" style="margin-top: 10px; margin-bottom: 15px;">
                        <span style="font-size: 10px; color: #64748b; font-weight: 700; margin-bottom:4px; display:block; letter-spacing:0.5px;">SELECT OPTION:</span>
                        <div style="display:flex; gap:5px; flex-wrap:wrap;">${btns}</div>
                    </div>
                `;
            }
        }

        let finalPriceText = displayPrice;
        if (!isNaN(displayPrice) && displayPrice !== "" && displayPrice !== "Contact Us") {
            finalPriceText = `₹${displayPrice}`;
        }

        let waMessage = `Hello Star Agencies, I am interested in ${product.name}`;
        if (defaultVariantLabel) {
            waMessage += ` (Option: ${defaultVariantLabel})`;
            displayName = `${product.name} <span style="color:#0b5ed7; font-size:11px; background: #eff6ff; padding: 2px 6px; border-radius: 4px; margin-left: 5px;">${defaultVariantLabel}</span>`;
        }
        waMessage += `. Please send me details.`;

        return `
            <article class="product-card">
                <img id="img-${product.id}" class="product-image" src="${displayImage}" alt="${product.name}">
                <div class="product-info">
                    <span style="font-size: 10px; color: #0b5ed7; font-weight: 700; text-transform: uppercase; background: #e0f2fe; padding: 4px 10px; border-radius: 20px; display: inline-block; margin-bottom: 8px; width: fit-content;">
                        ${product.category || ""}
                    </span>
                    
                    <h3 id="name-${product.id}" style="margin: 0 0 5px; font-size: 15px; color: #0f172a; font-weight: 700; line-height: 1.4;">${displayName}</h3>
                    
                    <div id="price-${product.id}" style="font-size: 18px; color: #10b981; font-weight: 800; margin-bottom: 5px;">
                        ${finalPriceText}
                    </div>

                    ${variantsHTML}

                    <div style="flex-grow: 1;"></div> 

                    <div class="product-actions" style="margin-top: 15px;">
                        <a id="wa-${product.id}" href="https://wa.me/919447016013?text=${encodeURIComponent(waMessage)}" target="_blank" rel="noopener" style="display: flex; align-items: center; justify-content: center; text-decoration: none; padding: 10px; border-radius: 8px; background: linear-gradient(135deg, #25D366, #128C7E); transition: 0.3s; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.2);">
                            <span style="font-size: 13px; font-weight: 700; color: white;">Order on WhatsApp</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width: 16px; height: 16px; margin-left: 6px; fill: white;"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                        </a>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    if(noResults) noResults.hidden = filtered.length !== 0;
}

window.changeBrand = function(selectEl, productId, productName) {
    let selectedBrand = selectEl.value;
    let groups = window.productVariantsMap[productId];
    if(!groups || !groups[selectedBrand]) return;

    let sizeContainer = document.getElementById(`sizes-${productId}`);
    let sizes = groups[selectedBrand];
    
    let sizeButtonsHTML = "";
    sizes.forEach((sz, idx) => {
        let bg = idx === 0 ? "#0b5ed7" : "#fff";
        let col = idx === 0 ? "#fff" : "#475569";
        let act = idx === 0 ? "active" : "";
        sizeButtonsHTML += `<button class="sz-btn ${act}" onclick="selectSize(this, '${productId}', '${sz.originalLabel.replace(/'/g, "\\'")}', '${sz.price || ""}', '${productName.replace(/'/g, "\\'")}', '${sz.image || ""}')" style="padding: 4px 10px; border: 1px solid #cbd5e1; border-radius: 4px; background: ${bg}; color: ${col}; cursor: pointer; font-size: 11px; font-weight: 600; transition:0.2s;">${sz.size}</button>`;
    });
    sizeContainer.innerHTML = sizeButtonsHTML;

    let firstButton = sizeContainer.querySelector('button');
    if(firstButton) {
        firstButton.click();
    }
}

window.selectSize = function(btn, productId, variantLabel, variantPrice, productName, variantImage) {
    const buttons = btn.parentElement.querySelectorAll("button");
    buttons.forEach(b => {
        b.classList.remove("active");
        b.style.background = "#fff";
        b.style.color = "#475569";
    });
    btn.classList.add("active");
    btn.style.background = "#0b5ed7";
    btn.style.color = "#fff";

    const priceDiv = document.getElementById(`price-${productId}`);
    if (priceDiv) {
        let displayPrice = variantPrice;
        if (!isNaN(variantPrice) && variantPrice !== "" && variantPrice !== "Contact Us" && variantPrice !== "undefined") {
            displayPrice = `₹${variantPrice}`;
        }
        priceDiv.innerHTML = displayPrice;
    }

    const nameDiv = document.getElementById(`name-${productId}`);
    if (nameDiv) {
        nameDiv.innerHTML = `${productName} <span style="color:#0b5ed7; font-size:11px; background: #eff6ff; padding: 2px 6px; border-radius: 4px; margin-left: 5px;">${variantLabel}</span>`;
    }

    const imgDiv = document.getElementById(`img-${productId}`);
    if (imgDiv && variantImage && variantImage !== 'undefined' && variantImage !== 'null') {
        imgDiv.src = variantImage;
    }

    const waBtn = document.getElementById(`wa-${productId}`);
    if (waBtn) {
        const message = encodeURIComponent(`Hello Star Agencies, I am interested in ${productName} (Option: ${variantLabel}). Please send me details.`);
        waBtn.href = `https://wa.me/919447016013?text=${message}`;
    }
}

// ==========================================
// പുതിയ മാറ്റങ്ങൾ ഇവിടെയാണ് (Filter & Dropdown Fix)
// ==========================================

// ഡ്രോപ്പ്ഡൗണിലെ ഐറ്റം (ഉദാ: Bucket) ക്ലിക്ക് ചെയ്യുമ്പോൾ വർക്ക് ആവാൻ
window.selectPlasticSub = function(subName) {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = subName;
    
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    const plasticBtn = document.querySelector('[data-category="Plastic Products"]');
    if (plasticBtn) plasticBtn.classList.add("active");
    
    selectedCategory = "Plastic Products";
    renderProducts();
}

if (searchInput) searchInput.addEventListener("input", renderProducts);

// ഫിൽറ്റർ ബട്ടണുകൾ ക്ലിക്ക് ചെയ്യുമ്പോൾ വർക്ക് ആവാൻ
document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        selectedCategory = button.dataset.category || "All";
        
        // വേറെ കാറ്റഗറി ക്ലിക്ക് ചെയ്യുമ്പോൾ സെർച്ച് ബോക്സ് ക്ലിയർ ആക്കാൻ
        const searchInput = document.getElementById("searchInput");
        if (searchInput) searchInput.value = "";
        
        renderProducts();
    });
});

loadProducts();