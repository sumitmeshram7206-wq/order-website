// ================================================================
//  app.js  —  Frontend for Order Management System Microservices
// ================================================================

// ---------------------------------------------------------------
// 1. BASE URLS — these point directly to the Spring Boot services
//    Change these if your services run on different ports/hosts
// ---------------------------------------------------------------
const API = {
  USER:    'http://localhost:8081',   // User Service
  PRODUCT: 'http://localhost:8082',   // Product Service
  ORDER:   'http://localhost:8083',   // Order Service
};


// ================================================================
//  TAB SWITCHING
// ================================================================
function switchTab(tabName, clickedBtn) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(sec => sec.classList.remove('active'));
  // Remove active class from all tab buttons
  document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));

  // Show the selected tab
  document.getElementById('tab-' + tabName).classList.add('active');
  clickedBtn.classList.add('active');
}


// ================================================================
//  TOAST NOTIFICATION (little popup at bottom-right)
// ================================================================
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => { toast.className = 'toast'; }, 3000);
}


// ================================================================
//  SERVICE STATUS CHECKER
//  Calls GET /api/users, /api/products, /api/orders on each service
//  If it responds → green dot. If it fails → red dot.
// ================================================================
async function checkAllServices() {
  checkService('user',    `${API.USER}/api/users`);
  checkService('product', `${API.PRODUCT}/api/products`);
  checkService('order',   `${API.ORDER}/api/orders`);
}

async function checkService(name, url) {
  const el = document.getElementById(`status-${name}`);
  const dot = el.querySelector('.dot');
  dot.className = 'dot';                    // reset to grey (checking)

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      dot.classList.add('online');
      showToast(`${name} service is online ✅`, 'success');
    } else {
      dot.classList.add('offline');
    }
  } catch (e) {
    dot.classList.add('offline');
    showToast(`${name} service is offline ❌`, 'error');
  }
}

// ================================================================
//  HELPER: show/hide result box
// ================================================================
function showResult(elementId, data) {
  const el = document.getElementById(elementId);
  el.textContent = JSON.stringify(data, null, 2);
  el.classList.add('visible');
}

function setMsg(elementId, text, type) {
  const el = document.getElementById(elementId);
  el.textContent = text;
  el.className = `msg ${type}`;
}


// ================================================================
//  ██╗   ██╗███████╗███████╗██████╗     ███████╗███████╗██████╗
//  ██║   ██║██╔════╝██╔════╝██╔══██╗    ██╔════╝██╔════╝██╔══██╗
//  ██║   ██║███████╗█████╗  ██████╔╝    ███████╗█████╗  ██████╔╝
//  ██║   ██║╚════██║██╔══╝  ██╔══██╗    ╚════██║██╔══╝  ██╔══██╗
//  ╚██████╔╝███████║███████╗██║  ██║    ███████║███████╗██║  ██║
//   ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝    ╚══════╝╚══════╝╚═╝  ╚═╝
// ================================================================

// ---------------------------------------------------------------
// CREATE USER
// Connects to: POST http://localhost:8081/api/users
// ---------------------------------------------------------------
document.getElementById('form-create-user').addEventListener('submit', async function (e) {
  e.preventDefault();   // stop page refresh on form submit

  // Read values from the form inputs
  const body = {
    name:  document.getElementById('user-name').value.trim(),
    email: document.getElementById('user-email').value.trim(),
    phone: document.getElementById('user-phone').value.trim(),
  };

  try {
    // fetch() sends an HTTP request to the User Service
    const res = await fetch(`${API.USER}/api/users`, {
      method: 'POST',                           // HTTP method
      headers: { 'Content-Type': 'application/json' },  // tell server we're sending JSON
      body: JSON.stringify(body),               // convert JS object → JSON string
    });

    const data = await res.json();              // parse the JSON response

    if (res.ok) {
      setMsg('user-create-msg', `✅ User created with ID: ${data.id}`, 'success');
      showToast(`User "${data.name}" created!`, 'success');
      this.reset();        // clear the form
      loadUsers();         // refresh the users table
    } else {
      setMsg('user-create-msg', `❌ Error: ${data.error || 'Failed to create user'}`, 'error');
    }
  } catch (err) {
    setMsg('user-create-msg', '❌ Cannot connect to User Service. Is it running on port 8081?', 'error');
  }
});


// ---------------------------------------------------------------
// GET ALL USERS  — load and render users table
// Connects to: GET http://localhost:8081/api/users
// ---------------------------------------------------------------
async function loadUsers() {
  const container = document.getElementById('users-table-container');
  container.innerHTML = '<p class="hint">Loading...</p>';

  try {
    const res  = await fetch(`${API.USER}/api/users`);   // GET request to User Service
    const data = await res.json();

    if (!data.length) {
      container.innerHTML = '<p class="hint">No users found. Create one above.</p>';
      return;
    }

    // Build an HTML table dynamically from the response array
    let html = `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Email</th><th>Phone</th>
            </tr>
          </thead>
          <tbody>
    `;
    data.forEach(u => {
      html += `
        <tr>
          <td>${u.id}</td>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.phone}</td>
        </tr>
      `;
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;

  } catch (err) {
    container.innerHTML = '<p class="hint" style="color:#e53e3e">❌ Could not reach User Service (port 8081).</p>';
  }
}


// ---------------------------------------------------------------
// GET USER BY ID
// Connects to: GET http://localhost:8081/api/users/{id}
// ---------------------------------------------------------------
async function getUserById() {
  const id = document.getElementById('get-user-id').value;
  if (!id) return;

  try {
    const res  = await fetch(`${API.USER}/api/users/${id}`);
    const data = await res.json();

    if (res.ok) {
      showResult('single-user-result', data);
    } else {
      showResult('single-user-result', { error: `User with ID ${id} not found` });
    }
  } catch (err) {
    showResult('single-user-result', { error: 'Cannot connect to User Service' });
  }
}


// ---------------------------------------------------------------
// DELETE USER
// Connects to: DELETE http://localhost:8081/api/users/{id}
// ---------------------------------------------------------------
async function deleteUser() {
  const id = document.getElementById('delete-user-id').value;
  if (!id) return;

  if (!confirm(`Are you sure you want to delete user ID ${id}?`)) return;

  try {
    const res = await fetch(`${API.USER}/api/users/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setMsg('delete-user-msg', `✅ User ID ${id} deleted.`, 'success');
      showToast(`User ${id} deleted`, 'info');
      loadUsers();
    } else {
      setMsg('delete-user-msg', `❌ Could not delete user ID ${id}.`, 'error');
    }
  } catch (err) {
    setMsg('delete-user-msg', '❌ Cannot connect to User Service.', 'error');
  }
}


// ================================================================
//  ██████╗ ██████╗  ██████╗ ██████╗ ██╗   ██╗ ██████╗████████╗
//  ██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██║   ██║██╔════╝╚══██╔══╝
//  ██████╔╝██████╔╝██║   ██║██║  ██║██║   ██║██║        ██║
//  ██╔═══╝ ██╔══██╗██║   ██║██║  ██║██║   ██║██║        ██║
//  ██║     ██║  ██║╚██████╔╝██████╔╝╚██████╔╝╚██████╗   ██║
//  ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝  ╚═════╝   ╚═╝
// ================================================================

// ---------------------------------------------------------------
// CREATE PRODUCT
// Connects to: POST http://localhost:8082/api/products
// ---------------------------------------------------------------
document.getElementById('form-create-product').addEventListener('submit', async function (e) {
  e.preventDefault();

  const body = {
    name:        document.getElementById('product-name').value.trim(),
    description: document.getElementById('product-description').value.trim(),
    price:       parseFloat(document.getElementById('product-price').value),
    stock:       parseInt(document.getElementById('product-stock').value),
  };

  try {
    const res  = await fetch(`${API.PRODUCT}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (res.ok) {
      setMsg('product-create-msg', `✅ Product created with ID: ${data.id}`, 'success');
      showToast(`Product "${data.name}" created!`, 'success');
      this.reset();
      loadProducts();
    } else {
      setMsg('product-create-msg', `❌ Error: ${data.error || 'Failed'}`, 'error');
    }
  } catch (err) {
    setMsg('product-create-msg', '❌ Cannot connect to Product Service (port 8082).', 'error');
  }
});


// ---------------------------------------------------------------
// GET ALL PRODUCTS
// Connects to: GET http://localhost:8082/api/products
// ---------------------------------------------------------------
async function loadProducts() {
  const container = document.getElementById('products-table-container');
  container.innerHTML = '<p class="hint">Loading...</p>';

  try {
    const res  = await fetch(`${API.PRODUCT}/api/products`);
    const data = await res.json();

    if (!data.length) {
      container.innerHTML = '<p class="hint">No products found. Create one above.</p>';
      return;
    }

    let html = `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Description</th><th>Price (₹)</th><th>Stock</th>
            </tr>
          </thead>
          <tbody>
    `;
    data.forEach(p => {
      html += `
        <tr>
          <td>${p.id}</td>
          <td>${p.name}</td>
          <td>${p.description}</td>
          <td>₹${p.price.toLocaleString('en-IN')}</td>
          <td>${p.stock}</td>
        </tr>
      `;
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;

  } catch (err) {
    container.innerHTML = '<p class="hint" style="color:#e53e3e">❌ Could not reach Product Service (port 8082).</p>';
  }
}


// ---------------------------------------------------------------
// GET PRODUCT BY ID
// Connects to: GET http://localhost:8082/api/products/{id}
// ---------------------------------------------------------------
async function getProductById() {
  const id = document.getElementById('get-product-id').value;
  if (!id) return;

  try {
    const res  = await fetch(`${API.PRODUCT}/api/products/${id}`);
    const data = await res.json();
    showResult('single-product-result', res.ok ? data : { error: `Product ${id} not found` });
  } catch (err) {
    showResult('single-product-result', { error: 'Cannot connect to Product Service' });
  }
}


// ---------------------------------------------------------------
// DELETE PRODUCT
// Connects to: DELETE http://localhost:8082/api/products/{id}
// ---------------------------------------------------------------
async function deleteProduct() {
  const id = document.getElementById('delete-product-id').value;
  if (!id) return;

  if (!confirm(`Delete product ID ${id}?`)) return;

  try {
    const res = await fetch(`${API.PRODUCT}/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMsg('delete-product-msg', `✅ Product ID ${id} deleted.`, 'success');
      showToast(`Product ${id} deleted`, 'info');
      loadProducts();
    } else {
      setMsg('delete-product-msg', `❌ Could not delete product ID ${id}.`, 'error');
    }
  } catch (err) {
    setMsg('delete-product-msg', '❌ Cannot connect to Product Service.', 'error');
  }
}


// ================================================================
//   ██████╗ ██████╗ ██████╗ ███████╗██████╗
//  ██╔═══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗
//  ██║   ██║██████╔╝██║  ██║█████╗  ██████╔╝
//  ██║   ██║██╔══██╗██║  ██║██╔══╝  ██╔══██╗
//  ╚██████╔╝██║  ██║██████╔╝███████╗██║  ██║
//   ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝
// ================================================================

// ---------------------------------------------------------------
// PLACE ORDER  ← THE KEY CALL: Order Service internally calls
//                User Service + Product Service
// Connects to: POST http://localhost:8083/api/orders
// ---------------------------------------------------------------
document.getElementById('form-place-order').addEventListener('submit', async function (e) {
  e.preventDefault();

  const body = {
    userId:    parseInt(document.getElementById('order-user-id').value),
    productId: parseInt(document.getElementById('order-product-id').value),
    quantity:  parseInt(document.getElementById('order-quantity').value),
  };

  // Clear previous response card
  const card = document.getElementById('order-response-card');
  card.style.display = 'none';
  setMsg('order-place-msg', '⏳ Placing order...', '');

  try {
    // This single call to Order Service triggers:
    //   Order Service → GET User Service /api/users/{userId}
    //   Order Service → GET Product Service /api/products/{productId}
    //   Order Service → saves order → returns merged response
    const res  = await fetch(`${API.ORDER}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      setMsg('order-place-msg', '✅ Order placed successfully!', 'success');
      showToast('Order placed! 🎉', 'success');
      this.reset();
      renderOrderResponseCard(data);   // show the rich merged response
      loadOrders();

    } else {
      setMsg('order-place-msg', `❌ ${data.error || 'Failed to place order'}`, 'error');
    }

  } catch (err) {
    setMsg('order-place-msg', '❌ Cannot connect to Order Service (port 8083).', 'error');
  }
});


// ---------------------------------------------------------------
// Renders the beautiful order confirmation card
// ---------------------------------------------------------------
function renderOrderResponseCard(d) {
  const card = document.getElementById('order-response-card');
  card.style.display = 'block';
  card.innerHTML = `
    <h3>✅ Order Confirmed — #${d.orderId}</h3>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Customer</span>
        <span class="info-value">${d.userName}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Email</span>
        <span class="info-value">${d.userEmail}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Product</span>
        <span class="info-value">${d.productName}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Unit Price</span>
        <span class="info-value">₹${d.productPrice.toLocaleString('en-IN')}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Quantity</span>
        <span class="info-value">${d.quantity}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Status</span>
        <span class="info-value">${d.status}</span>
      </div>
    </div>
    <div class="total-row">
      <span class="total-label">💰 Total Amount</span>
      <span class="total-value">₹${d.totalAmount.toLocaleString('en-IN')}</span>
    </div>
  `;
}


// ---------------------------------------------------------------
// GET ALL ORDERS
// Connects to: GET http://localhost:8083/api/orders
// ---------------------------------------------------------------
async function loadOrders() {
  const container = document.getElementById('orders-table-container');
  container.innerHTML = '<p class="hint">Loading...</p>';

  try {
    const res  = await fetch(`${API.ORDER}/api/orders`);
    const data = await res.json();

    if (!data.length) {
      container.innerHTML = '<p class="hint">No orders yet. Place one above.</p>';
      return;
    }

    let html = `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User ID</th>
              <th>Product ID</th>
              <th>Qty</th>
              <th>Total (₹)</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
    `;
    data.forEach(o => {
      const badgeClass = `badge badge-${o.status.toLowerCase()}`;
      const date = new Date(o.createdAt).toLocaleString('en-IN');
      html += `
        <tr>
          <td>#${o.id}</td>
          <td>${o.userId}</td>
          <td>${o.productId}</td>
          <td>${o.quantity}</td>
          <td>₹${o.totalAmount.toLocaleString('en-IN')}</td>
          <td><span class="${badgeClass}">${o.status}</span></td>
          <td>${date}</td>
        </tr>
      `;
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;

  } catch (err) {
    container.innerHTML = '<p class="hint" style="color:#e53e3e">❌ Could not reach Order Service (port 8083).</p>';
  }
}


// ---------------------------------------------------------------
// GET ORDER BY ID
// Connects to: GET http://localhost:8083/api/orders/{id}
// ---------------------------------------------------------------
async function getOrderById() {
  const id = document.getElementById('get-order-id').value;
  if (!id) return;

  try {
    const res  = await fetch(`${API.ORDER}/api/orders/${id}`);
    const data = await res.json();
    showResult('single-order-result', res.ok ? data : { error: `Order ${id} not found` });
  } catch (err) {
    showResult('single-order-result', { error: 'Cannot connect to Order Service' });
  }
}


// ---------------------------------------------------------------
// GET ORDERS BY USER
// Connects to: GET http://localhost:8083/api/orders/user/{userId}
// ---------------------------------------------------------------
async function getOrdersByUser() {
  const userId = document.getElementById('orders-by-user-id').value;
  if (!userId) return;

  try {
    const res  = await fetch(`${API.ORDER}/api/orders/user/${userId}`);
    const data = await res.json();
    showResult('orders-by-user-result', data);
  } catch (err) {
    showResult('orders-by-user-result', { error: 'Cannot connect to Order Service' });
  }
}


// ---------------------------------------------------------------
// UPDATE ORDER STATUS
// Connects to: PATCH http://localhost:8083/api/orders/{id}/status
// ---------------------------------------------------------------
async function updateOrderStatus() {
  const id     = document.getElementById('update-order-id').value;
  const status = document.getElementById('update-order-status').value;
  if (!id) return;

  try {
    const res = await fetch(`${API.ORDER}/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),       // send { "status": "CONFIRMED" }
    });
    const data = await res.json();

    if (res.ok) {
      setMsg('update-order-msg', `✅ Order #${id} updated to ${status}`, 'success');
      showToast(`Order #${id} → ${status}`, 'success');
      loadOrders();
    } else {
      setMsg('update-order-msg', `❌ ${data.error || 'Update failed'}`, 'error');
    }
  } catch (err) {
    setMsg('update-order-msg', '❌ Cannot connect to Order Service.', 'error');
  }
}


// ================================================================
//  INIT — runs when page loads
// ================================================================
window.addEventListener('load', () => {
  checkAllServices();   // check all 3 services on startup
});
