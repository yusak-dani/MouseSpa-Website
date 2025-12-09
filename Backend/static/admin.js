// Admin Dashboard JavaScript
const API_BASE = '/api';
let currentOrderId = null;
let currentOrderName = null;

// Status labels in Indonesian
const statusLabels = {
    'pending': 'Menunggu',
    'picked_up': 'Dijemput',
    'in_progress': 'Dikerjakan',
    'done': 'Selesai',
    'delivered': 'Dikirim'
};

// Load orders on page load
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
});

// Fetch and display orders
async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE}/orders`);
        const result = await response.json();

        if (result.success) {
            displayOrders(result.data);
            updateStats(result.data);
        } else {
            showError('Gagal memuat data pesanan');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('Koneksi ke server gagal');
    }
}

// Display orders in table
function displayOrders(orders) {
    const tbody = document.getElementById('orders-table-body');
    const noOrders = document.getElementById('no-orders');

    if (!orders || orders.length === 0) {
        tbody.innerHTML = '';
        noOrders.style.display = 'block';
        return;
    }

    noOrders.style.display = 'none';

    tbody.innerHTML = orders.map(order => {
        const layanan = parseLayanan(order.layanan);
        const date = new Date(order.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        return `
            <tr>
                <td><strong>#${order.id}</strong></td>
                <td>${escapeHtml(order.nama_lengkap)}</td>
                <td>${escapeHtml(order.nomor_telepon)}</td>
                <td>
                    <div class="layanan-list">
                        ${layanan.map(l => `<span class="layanan-pill">${escapeHtml(l)}</span>`).join('')}
                    </div>
                </td>
                <td>${order.jumlah_mousepad}</td>
                <td>${escapeHtml(order.metode_pengambilan)}</td>
                <td>
                    <span class="status-badge ${order.status || 'pending'}">
                        ${statusLabels[order.status] || 'Menunggu'}
                    </span>
                </td>
                <td>${date}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-action btn-status" onclick="openStatusModal(${order.id}, '${escapeHtml(order.nama_lengkap)}')">
                            ✏️ Status
                        </button>
                        <button class="btn-action btn-delete" onclick="openDeleteModal(${order.id})">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Parse layanan JSON string
function parseLayanan(layananStr) {
    try {
        if (typeof layananStr === 'string') {
            return JSON.parse(layananStr);
        }
        return layananStr || [];
    } catch {
        return [layananStr];
    }
}

// Update stats cards
function updateStats(orders) {
    const total = orders.length;
    const pending = orders.filter(o => !o.status || o.status === 'pending').length;
    const inProgress = orders.filter(o => o.status === 'picked_up' || o.status === 'in_progress').length;
    const completed = orders.filter(o => o.status === 'done' || o.status === 'delivered').length;

    document.getElementById('total-orders').textContent = total;
    document.getElementById('pending-orders').textContent = pending;
    document.getElementById('inprogress-orders').textContent = inProgress;
    document.getElementById('completed-orders').textContent = completed;
}

// Open status update modal
function openStatusModal(orderId, customerName) {
    currentOrderId = orderId;
    currentOrderName = customerName;

    document.getElementById('modal-order-id').textContent = `#${orderId}`;
    document.getElementById('modal-customer-name').textContent = customerName;
    document.getElementById('status-modal').style.display = 'flex';
}

// Close status modal
function closeModal() {
    document.getElementById('status-modal').style.display = 'none';
    currentOrderId = null;
    currentOrderName = null;
}

// Update order status
async function updateStatus(status) {
    if (!currentOrderId) return;

    try {
        const response = await fetch(`${API_BASE}/orders/${currentOrderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        const result = await response.json();

        if (result.success) {
            closeModal();
            loadOrders();
            showSuccess(`Status berhasil diupdate ke "${statusLabels[status]}"`);
        } else {
            showError(result.message || 'Gagal mengupdate status');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showError('Koneksi ke server gagal');
    }
}

// Open delete confirmation modal
function openDeleteModal(orderId) {
    currentOrderId = orderId;
    document.getElementById('delete-order-id').textContent = `#${orderId}`;
    document.getElementById('delete-modal').style.display = 'flex';
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
    currentOrderId = null;
}

// Confirm delete order
async function confirmDelete() {
    if (!currentOrderId) return;

    try {
        const response = await fetch(`${API_BASE}/orders/${currentOrderId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            closeDeleteModal();
            loadOrders();
            showSuccess('Pesanan berhasil dihapus');
        } else {
            showError(result.message || 'Gagal menghapus pesanan');
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        showError('Koneksi ke server gagal');
    }
}

// Utility: Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show success toast
function showSuccess(message) {
    showToast(message, 'success');
}

// Show error toast
function showError(message) {
    showToast(message, 'error');
}

// Toast notification
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✅' : '❌'}</span>
        <span>${message}</span>
    `;

    // Add toast styles
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease;
        z-index: 2000;
    `;

    document.body.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Close modals on background click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal();
        closeDeleteModal();
    }
});
