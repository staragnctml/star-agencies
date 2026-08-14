let allProducts = [];
let selectedCategory = "All";

const container = document.getElementById("productsContainer");
const searchInput = document.getElementById("searchInput");
const noResults = document.getElementById("noResults");

async function loadProducts() {
    try {
        const response = await fetch("data/products.json");
        if (!response.ok) throw new Error("products.json not found");
        allProducts = await response.json();
        renderProducts();
    } catch (error) {
        console.error("Product loading error:", error);
        container.innerHTML = "<p>Products could not be loaded.</p>";
    }
}

function renderVariants(product, defaultPrice) {
  if (!product.variants || product.variants.length === 0) {
    return "";
  }

  return `
    <div class="variants" style="margin-top: 15px; margin-bottom: 15px;">
      <span class="variant-title" style="font-weight: 600; font-size: 14px; margin-bottom: 8px; display: block; color: #475569;">Options:</span>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      ${product.variants.map((v, index) => {
         
         /* വാരിയന്റിനും വിലയ്ക്കും ഇടയിൽ = അല്ലെങ്കിൽ : ഉണ്ടെങ്കിൽ വേർതിരിച്ചെടുക്കുന്നു */
         let label = v.label;
         let vPrice = defaultPrice;
         
         if (label.includes('=')) {
             let parts = label.split('=');
             label = parts[0].trim();
             vPrice = parts[1].trim();
         } else if (label.includes(':')) {
             let parts = label.split(':');
             label = parts[0].trim();
             vPrice = parts[1].trim();
         }

         return `
        <button
          class="variant-btn ${index === 0 ? "active" : ""}"
          style="padding: 6px 14px; border: 1px solid #cbd5e1; border-radius: 8px; background: ${index === 0 ? '#0b5ed7' : '#fff'}; color: ${index === 0 ? '#fff' : '#475569'}; cursor: pointer; font-family: 'Poppins', sans-serif; font-size: 14px; transition: 0.2s; font-weight: 500;"
          onclick="selectVariant(this, ${product.id}, '${label.replace(/'/g, "\\'")}', '${vPrice}', '${product.name.replace(/'/g, "\\'")}')">
          ${label}
        </button>
        `;
      }).join("")}
      </div>
    </div>
  `;
}

// വാരിയന്റ് സെലക്ട് ചെയ്യുമ്പോൾ വിലയും വാട്സാപ്പ് ലിങ്കും മാറ്റാനുള്ള ഫംഗ്ഷൻ
window.selectVariant = function(button, productId, variantLabel, variantPrice, productName) {
  
  // 1. ബട്ടൺ സ്റ്റൈൽ മാറ്റുന്നു
  const buttons = button.parentElement.querySelectorAll("button");
  buttons.forEach(btn => {
    btn.classList.remove("active");
    btn.style.background = "#fff";
    btn.style.color = "#475569";
  });
  button.classList.add("active");
  button.style.background = "#0b5ed7";
  button.style.color = "#fff";

  // 2. പുതിയ വില കാണിക്കുന്നു
  const priceDiv = document.getElementById(`price-${productId}`);
  if (priceDiv) {
      let displayPrice = variantPrice;
      if (!isNaN(variantPrice) && variantPrice !== "" && variantPrice !== "Contact Us") {
          displayPrice = `₹${variantPrice}`;
      }
      priceDiv.innerHTML = displayPrice;
  }

  // 3. വാട്സാപ്പ് മെസ്സേജ് അപ്ഡേറ്റ് ചെയ്യുന്നു (സെലക്ട് ചെയ്ത വാരിയന്റ് ഉൾപ്പെടെ)
  const waBtn = document.getElementById(`wa-${productId}`);
  if (waBtn) {
      const message = encodeURIComponent(`Hello Star Agencies, I am interested in ${productName} (Option: ${variantLabel}). Please send me details.`);
      waBtn.href = `https://wa.me/919447016013?text=${message}`;
  }
}

function renderProducts() {
    const term = searchInput.value.trim().toLowerCase();
    const filtered = allProducts.filter(product => {
        const categoryMatch = selectedCategory === "All" || product.category === selectedCategory;
        const searchText = `${product.name || ""} ${product.brand || ""} ${product.category || ""} ${product.description || ""}`.toLowerCase();
        return categoryMatch && (term === "" || searchText.includes(term));
    });

    container.innerHTML = filtered.map(product => {
        let basePrice = product.price || "Contact Us";
        let defaultVariantLabel = "";
        let displayPrice = basePrice;

        // ആദ്യത്തെ വാരിയന്റിൽ വില കൊടുത്തിട്ടുണ്ടോ എന്ന് പരിശോധിക്കുന്നു
        if (product.variants && product.variants.length > 0) {
            let firstV = product.variants[0].label;
            if(firstV.includes('=')) {
                let parts = firstV.split('=');
                defaultVariantLabel = parts[0].trim();
                displayPrice = parts[1].trim();
            } else if (firstV.includes(':')) {
                let parts = firstV.split(':');
                defaultVariantLabel = parts[0].trim();
                displayPrice = parts[1].trim();
            } else {
                defaultVariantLabel = firstV;
            }
        }

        let finalPriceText = displayPrice;
        if (!isNaN(displayPrice) && displayPrice !== "" && displayPrice !== "Contact Us") {
            finalPriceText = `₹${displayPrice}`;
        }

        let waMessage = `Hello Star Agencies, I am interested in ${product.name}`;
        if (defaultVariantLabel) {
            waMessage += ` (Option: ${defaultVariantLabel})`;
        }
        waMessage += `. Please send me details.`;

        return `
            <article class="product-card">
                <img class="product-image" src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <span class="product-category" style="font-size: 12px; color: #0b5ed7; font-weight: 600; text-transform: uppercase;">
                        ${product.category || ""}
                    </span>
                    
                    <h3 style="margin: 8px 0; font-size: 18px;">${product.name}</h3>
                    
                    ${product.brand ? `<div class="brand" style="font-size: 14px; color: #64748b; margin-bottom: 8px;">${product.brand}</div>` : ''}
                    
                    <div class="price" id="price-${product.id}">
                        ${finalPriceText}
                    </div>

                    ${renderVariants(product, basePrice)}

                    <div class="product-actions">
                        <a id="wa-${product.id}" href="https://wa.me/919447016013?text=${encodeURIComponent(waMessage)}" target="_blank" rel="noopener" class="modern-wa-btn" style="display: flex; align-items: center; justify-content: center; text-decoration: none; border: 1px solid #e2e8f0; padding: 10px; border-radius: 50px; background: #f8fafc; margin-top: 15px; transition: 0.3s;">
                            <span class="wa-text" style="font-size: 14px; font-weight: 600; color: #475569;">For more details contact</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width: 18px; height: 18px; margin-left: 8px;"><path fill="#25D366" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                        </a>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    noResults.hidden = filtered.length !== 0;
}

searchInput.addEventListener("input", renderProducts);

document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        selectedCategory = button.dataset.category;
        renderProducts();
    });
});

loadProducts();