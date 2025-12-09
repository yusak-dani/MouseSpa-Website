// ===== Configuration =====
const API_BASE_URL = 'http://localhost:8080/api';

// ===== DOM Elements =====
const orderForm = document.getElementById('orderForm');
const submitBtn = document.getElementById('submitBtn');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const addressSection = document.getElementById('address-section');
const toast = document.getElementById('toast');
const themeToggle = document.getElementById('themeToggle');
const scrollProgress = document.getElementById('scrollProgress');

// ===== Service Prices =====
const servicePrices = {
    'Deep Cleaning': 20000,
    'Express Cleaning': 25000,
    'Stain Removal': 30000,
    'Premium Care': 35000
};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initFormListeners();
    initQuantityButtons();
    initSummaryUpdates();
    initThemeToggle();
    initScrollProgress();
    initScrollReveal();
});

// ===== Theme Toggle =====
function initThemeToggle() {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'light' || (!savedTheme && !systemPrefersDark)) {
        document.body.classList.add('light-theme');
    }

    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');

        // Save preference
        const isLight = document.body.classList.contains('light-theme');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');

        // Add rotation animation
        themeToggle.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            themeToggle.style.transform = '';
        }, 300);
    });
}

// ===== Scroll Progress Bar =====
function initScrollProgress() {
    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress(); // Initial call
}

function updateScrollProgress() {
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    scrollProgress.style.width = `${Math.min(scrolled, 100)}%`;
}

// ===== Scroll Reveal Animation =====
function initScrollReveal() {
    const revealElements = document.querySelectorAll('[data-reveal]');

    // Check if element is in viewport
    const isInViewport = (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85
        );
    };

    // Reveal visible elements
    const revealOnScroll = () => {
        revealElements.forEach(element => {
            if (isInViewport(element) && !element.classList.contains('revealed')) {
                element.classList.add('revealed');
            }
        });
    };

    // Listen for scroll events
    window.addEventListener('scroll', revealOnScroll, { passive: true });

    // Initial check (reveal elements already in viewport)
    setTimeout(revealOnScroll, 100);
}

// ===== Navigation =====
function initNavigation() {
    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ===== Form Listeners =====
function initFormListeners() {
    // Show/hide address field based on pickup method
    const pickupRadios = document.querySelectorAll('input[name="metode_pengambilan"]');
    pickupRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'pickup') {
                addressSection.style.display = 'block';
                addressSection.querySelector('textarea').setAttribute('required', '');
            } else {
                addressSection.style.display = 'none';
                addressSection.querySelector('textarea').removeAttribute('required');
            }
            updateSummary();
        });
    });

    // Form submission
    orderForm.addEventListener('submit', handleFormSubmit);

    // Real-time validation
    const inputs = orderForm.querySelectorAll('input[required], textarea[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearError(input));
    });
}

// ===== Quantity Buttons =====
function initQuantityButtons() {
    const minusBtn = document.querySelector('.qty-btn.minus');
    const plusBtn = document.querySelector('.qty-btn.plus');
    const qtyInput = document.getElementById('jumlah_mousepad');

    minusBtn.addEventListener('click', () => {
        const currentValue = parseInt(qtyInput.value) || 1;
        if (currentValue > 1) {
            qtyInput.value = currentValue - 1;
            updateSummary();
        }
    });

    plusBtn.addEventListener('click', () => {
        const currentValue = parseInt(qtyInput.value) || 1;
        if (currentValue < 20) {
            qtyInput.value = currentValue + 1;
            updateSummary();
        }
    });

    qtyInput.addEventListener('change', () => {
        let value = parseInt(qtyInput.value) || 1;
        value = Math.max(1, Math.min(20, value));
        qtyInput.value = value;
        updateSummary();
    });
}

// ===== Summary Updates =====
function initSummaryUpdates() {
    // Service checkboxes
    const serviceCheckboxes = document.querySelectorAll('input[name="layanan"]');
    serviceCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSummary);
    });

    // Quantity input
    document.getElementById('jumlah_mousepad').addEventListener('input', updateSummary);

    // Pickup method
    document.querySelectorAll('input[name="metode_pengambilan"]').forEach(radio => {
        radio.addEventListener('change', updateSummary);
    });

    // Initial update
    updateSummary();
}

function updateSummary() {
    // Selected services
    const selectedServices = [];
    document.querySelectorAll('input[name="layanan"]:checked').forEach(checkbox => {
        selectedServices.push(checkbox.value);
    });
    document.getElementById('summary-services').textContent =
        selectedServices.length > 0 ? selectedServices.join(', ') : '-';

    // Quantity
    const quantity = parseInt(document.getElementById('jumlah_mousepad').value) || 1;
    document.getElementById('summary-quantity').textContent = quantity;

    // Method
    const selectedMethod = document.querySelector('input[name="metode_pengambilan"]:checked');
    document.getElementById('summary-method').textContent =
        selectedMethod ? (selectedMethod.value === 'pickup' ? 'Pickup' : 'Antar Sendiri') : '-';

    // Calculate total
    let total = 0;
    selectedServices.forEach(service => {
        total += servicePrices[service] || 0;
    });
    total *= quantity;

    document.getElementById('summary-total').textContent = formatCurrency(total);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// ===== Form Validation =====
function validateField(input) {
    const errorSpan = input.parentElement.querySelector('.error-message');
    let isValid = true;
    let errorMessage = '';

    // Clear previous error
    input.classList.remove('error');
    if (errorSpan) errorSpan.textContent = '';

    // Required check
    if (input.hasAttribute('required') && !input.value.trim()) {
        isValid = false;
        errorMessage = 'Field ini wajib diisi';
    }

    // Email validation
    if (input.type === 'email' && input.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value)) {
            isValid = false;
            errorMessage = 'Format email tidak valid';
        }
    }

    // Phone validation
    if (input.name === 'nomor_telepon' && input.value) {
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(input.value.replace(/\D/g, ''))) {
            isValid = false;
            errorMessage = 'Nomor telepon tidak valid (10-15 digit)';
        }
    }

    if (!isValid) {
        input.classList.add('error');
        if (errorSpan) errorSpan.textContent = errorMessage;
    }

    return isValid;
}

function clearError(input) {
    const errorSpan = input.parentElement.querySelector('.error-message');
    input.classList.remove('error');
    if (errorSpan) errorSpan.textContent = '';
}

function validateForm() {
    let isValid = true;

    // Validate required inputs
    const requiredInputs = orderForm.querySelectorAll('input[required], textarea[required]');
    requiredInputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    // Validate services (at least one selected)
    const selectedServices = document.querySelectorAll('input[name="layanan"]:checked');
    const serviceError = document.getElementById('layanan-error');
    if (selectedServices.length === 0) {
        isValid = false;
        serviceError.textContent = 'Pilih minimal satu layanan';
    } else {
        serviceError.textContent = '';
    }

    // Validate pickup method
    const selectedMethod = document.querySelector('input[name="metode_pengambilan"]:checked');
    if (!selectedMethod) {
        isValid = false;
    }

    return isValid;
}

// ===== Form Submission =====
async function handleFormSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
        showToast('error', 'Form Tidak Lengkap', 'Mohon lengkapi semua field yang wajib diisi');
        return;
    }

    // Get form data
    const formData = {
        nama_lengkap: document.getElementById('nama_lengkap').value.trim(),
        nomor_telepon: document.getElementById('nomor_telepon').value.trim(),
        email: document.getElementById('email').value.trim(),
        layanan: Array.from(document.querySelectorAll('input[name="layanan"]:checked')).map(cb => cb.value),
        jumlah_mousepad: parseInt(document.getElementById('jumlah_mousepad').value),
        metode_pengambilan: document.querySelector('input[name="metode_pengambilan"]:checked').value,
        alamat_pickup: document.getElementById('alamat_pickup').value.trim(),
        catatan_tambahan: document.getElementById('catatan_tambahan').value.trim()
    };

    // Show loading state
    setLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showToast('success', 'Pesanan Berhasil!', 'Terima kasih! Pesanan Anda telah kami terima.');
            orderForm.reset();
            addressSection.style.display = 'none';
            updateSummary();
        } else {
            throw new Error(result.message || 'Terjadi kesalahan saat mengirim pesanan');
        }
    } catch (error) {
        console.error('Error submitting order:', error);
        showToast('error', 'Gagal Mengirim Pesanan', error.message || 'Silakan coba lagi atau hubungi kami melalui WhatsApp');
    } finally {
        setLoading(false);
    }
}

function setLoading(isLoading) {
    if (isLoading) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
    } else {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// ===== Toast Notification =====
function showToast(type, title, message) {
    // Set content
    toast.className = `toast ${type}`;
    toast.querySelector('.toast-title').textContent = title;
    toast.querySelector('.toast-message').textContent = message;

    // Show toast
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto hide after 5 seconds
    const autoHide = setTimeout(() => hideToast(), 5000);

    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.onclick = () => {
        clearTimeout(autoHide);
        hideToast();
    };
}

function hideToast() {
    toast.classList.remove('show');
}

// ===== Navbar Scroll Effect =====
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const currentScroll = window.pageYOffset;
    const isLightTheme = document.body.classList.contains('light-theme');

    if (currentScroll > 100) {
        navbar.style.background = isLightTheme
            ? 'rgba(248, 250, 252, 0.98)'
            : 'rgba(10, 10, 15, 0.98)';
    } else {
        navbar.style.background = isLightTheme
            ? 'rgba(248, 250, 252, 0.9)'
            : 'rgba(10, 10, 15, 0.8)';
    }

    lastScroll = currentScroll;
});

// ===== Order Tracking =====
function initOrderTracking() {
    const trackBtn = document.getElementById('track-btn');
    const trackingInput = document.getElementById('tracking-order-id');

    if (trackBtn && trackingInput) {
        trackBtn.addEventListener('click', () => trackOrder());
        trackingInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                trackOrder();
            }
        });
    }
}

async function trackOrder() {
    const orderId = document.getElementById('tracking-order-id').value.trim();
    const resultDiv = document.getElementById('tracking-result');
    const errorDiv = document.getElementById('tracking-error');

    // Hide previous results
    resultDiv.style.display = 'none';
    errorDiv.style.display = 'none';

    if (!orderId) {
        showToast('error', 'Error', 'Masukkan Order ID');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/orders/track/${orderId}`);
        const result = await response.json();

        if (response.ok && result.success) {
            displayTrackingResult(result.data);
        } else {
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error tracking order:', error);
        errorDiv.style.display = 'block';
    }
}

function displayTrackingResult(order) {
    const resultDiv = document.getElementById('tracking-result');

    // Set order info
    document.getElementById('result-order-id').textContent = order.id;
    document.getElementById('result-name').textContent = order.nama_lengkap;

    // Parse layanan
    let layanan = order.layanan;
    try {
        if (typeof layanan === 'string') {
            layanan = JSON.parse(layanan);
        }
        layanan = Array.isArray(layanan) ? layanan.join(', ') : layanan;
    } catch {
        // Keep as is
    }

    document.getElementById('result-layanan').textContent = layanan;
    document.getElementById('result-qty').textContent = order.jumlah_mousepad + ' mousepad';
    document.getElementById('result-date').textContent = new Date(order.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Update progress steps
    const status = order.status || 'pending';
    const statusOrder = ['pending', 'picked_up', 'in_progress', 'done', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);

    const progressSteps = resultDiv.querySelectorAll('.progress-step');
    progressSteps.forEach((step, index) => {
        step.classList.remove('active', 'completed');

        if (index < currentIndex) {
            step.classList.add('completed');
        } else if (index === currentIndex) {
            step.classList.add('active');
        }
    });

    // Show result
    resultDiv.style.display = 'block';
}

// Add tracking initialization to DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initOrderTracking();
});
