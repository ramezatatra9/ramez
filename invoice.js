document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const customerNameInput = document.getElementById('customerNameInput');
    const invoiceDateInput = document.getElementById('invoiceDateInput');
    const productSearch = document.getElementById('productSearch');
    const autocompleteResults = document.getElementById('autocompleteResults');
    const itemQuantity = document.getElementById('itemQuantity');
    const addItemBtn = document.getElementById('addItemBtn');
    
    // Display Elements
    const displayCustomerName = document.getElementById('displayCustomerName');
    const displayDate = document.getElementById('displayDate');
    const invoiceTableBody = document.getElementById('invoiceTableBody');
    const grandTotalEl = document.getElementById('grandTotal');
    const exportPdfBtn = document.getElementById('exportPdfBtn');

    // State
    let selectedProduct = null;
    let invoiceItems = [];

    // Formatter
    const formatter = new Intl.NumberFormat('ar', {
        style: 'decimal',
        minimumFractionDigits: 0
    });

    // Initialize Date
    const today = new Date().toISOString().split('T')[0];
    invoiceDateInput.value = today;
    displayDate.textContent = today;

    // Sync Customer Name & Date
    customerNameInput.addEventListener('input', (e) => {
        displayCustomerName.textContent = e.target.value || '-';
    });

    invoiceDateInput.addEventListener('change', (e) => {
        displayDate.textContent = e.target.value || '-';
    });

    // Autocomplete Logic
    productSearch.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        selectedProduct = null;
        
        if (!query) {
            autocompleteResults.style.display = 'none';
            return;
        }

        const filtered = products.filter(product => {
            const num = (product['رقم الصنف'] || '').toLowerCase();
            const name = (product['اسم الصنف'] || '').toLowerCase();
            const searchTerms = query.split(' ');
            const searchableText = `${num} ${name}`;
            return searchTerms.every(term => searchableText.includes(term));
        }).slice(0, 50); // Limit results for performance

        if (filtered.length > 0) {
            autocompleteResults.innerHTML = '';
            filtered.forEach(product => {
                const div = document.createElement('div');
                div.className = 'autocomplete-item';
                div.textContent = `${product['رقم الصنف']} - ${product['اسم الصنف']} (${product['اخر سعر شراء']})`;
                
                div.addEventListener('click', () => {
                    selectedProduct = product;
                    productSearch.value = `${product['اسم الصنف']}`;
                    autocompleteResults.style.display = 'none';
                });
                
                autocompleteResults.appendChild(div);
            });
            autocompleteResults.style.display = 'block';
        } else {
            autocompleteResults.style.display = 'none';
        }
    });

    // Hide autocomplete when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.form-group')) {
            autocompleteResults.style.display = 'none';
        }
    });

    // Render Invoice Table
    function renderInvoiceTable() {
        invoiceTableBody.innerHTML = '';
        let total = 0;

        invoiceItems.forEach((item, index) => {
            const tr = document.createElement('tr');
            
            const num = item.product['رقم الصنف'] || '';
            const name = item.product['اسم الصنف'] || '';
            const qty = item.quantity;
            const unitPrice = parseFloat(item.product['اخر سعر شراء']) || 0;
            const rowTotal = unitPrice * qty;
            total += rowTotal;

            tr.innerHTML = `
                <td>${num}</td>
                <td>${name}</td>
                <td>${qty}</td>
                <td>${formatter.format(unitPrice)}</td>
                <td>${formatter.format(rowTotal)}</td>
                <td class="action-cell" data-html2canvas-ignore="true">
                    <button class="btn btn-danger" style="padding: 0.4rem 0.8rem; font-size: 0.9rem;" onclick="removeInvoiceItem(${index})">حذف</button>
                </td>
            `;
            invoiceTableBody.appendChild(tr);
        });

        grandTotalEl.textContent = formatter.format(total);
    }

    // Global remove function for inline onclick
    window.removeInvoiceItem = function(index) {
        invoiceItems.splice(index, 1);
        renderInvoiceTable();
    };

    // Add Item to Invoice
    addItemBtn.addEventListener('click', () => {
        const qty = parseInt(itemQuantity.value);
        
        if (!selectedProduct) {
            alert('الرجاء اختيار صنف من القائمة أولاً');
            return;
        }
        
        if (isNaN(qty) || qty <= 0) {
            alert('الرجاء إدخال كمية صحيحة');
            return;
        }

        invoiceItems.push({
            product: selectedProduct,
            quantity: qty
        });

        // Reset inputs
        selectedProduct = null;
        productSearch.value = '';
        itemQuantity.value = 1;

        renderInvoiceTable();
    });

    // Export PDF Logic
    exportPdfBtn.addEventListener('click', () => {
        const element = document.getElementById('invoice-document');
        const customerName = displayCustomerName.textContent !== '-' ? displayCustomerName.textContent : 'زبون';
        const date = displayDate.textContent;
        
        const opt = {
            margin:       10,
            filename:     `فاتورة_${customerName}_${date}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // New Promise-based usage:
        html2pdf().set(opt).from(element).save();
    });
});
