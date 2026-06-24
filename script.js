document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const tableBody = document.getElementById('tableBody');
    const noResults = document.getElementById('noResults');
    const tableContainer = document.querySelector('.table-container');

    // Number formatter for price
    const formatter = new Intl.NumberFormat('ar', {
        style: 'decimal',
        minimumFractionDigits: 0
    });

    // Render table rows
    function renderTable(data) {
        tableBody.innerHTML = '';
        
        if (data.length === 0) {
            tableContainer.classList.add('hidden');
            noResults.classList.remove('hidden');
            return;
        }

        tableContainer.classList.remove('hidden');
        noResults.classList.add('hidden');

        // To improve performance if there are many rows, use DocumentFragment
        const fragment = document.createDocumentFragment();

        data.forEach(product => {
            const tr = document.createElement('tr');
            
            const num = product['رقم الصنف'] || '';
            const name = product['اسم الصنف'] || '';
            const rawPrice = product['اخر سعر شراء'];
            
            let price = rawPrice;
            if (rawPrice && !isNaN(rawPrice)) {
                price = formatter.format(parseFloat(rawPrice));
            }

            tr.innerHTML = `
                <td>${num}</td>
                <td>${name}</td>
                <td class="price">${price}</td>
            `;
            fragment.appendChild(tr);
        });

        tableBody.appendChild(fragment);
    }

    // Initial render
    renderTable(products);

    // Smart search logic
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        
        if (!query) {
            renderTable(products);
            return;
        }

        const filtered = products.filter(product => {
            const num = (product['رقم الصنف'] || '').toLowerCase();
            const name = (product['اسم الصنف'] || '').toLowerCase();
            
            // Smart search: Check if query terms are all present in the product string
            const searchTerms = query.split(' ');
            const searchableText = `${num} ${name}`;
            
            return searchTerms.every(term => searchableText.includes(term));
        });

        renderTable(filtered);
    });
});
