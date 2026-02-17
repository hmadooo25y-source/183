/***********************
 * 1. دالة تحويل الأرقام إلى هندية
 ***********************/
function toHindiNumbers(str) {
    if (str === null || str === undefined) return "";
    const hindiNumbers = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    return str.toString().replace(/[0-9]/g, d => hindiNumbers[+d]);
}

/***********************
 * 2. طلب إذن إشعارات الويب
 ***********************/
if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
}

/***********************
 * 3. إدارة الشاشات والتنقل
 ***********************/
const screens = {
    s1: document.getElementById('screen-1'),
    s2: document.getElementById('screen-2'),
    s3: document.getElementById('screen-3'),
    s4: document.getElementById('screen-4'),
    s5: document.getElementById('screen-5'),
    s6: document.getElementById('screen-6'),
    notif: document.getElementById('screen-notifications')
};

let loadingTimeout;

function showScreen(targetKey) {
    if (loadingTimeout) clearTimeout(loadingTimeout);

    Object.keys(screens).forEach(key => {
        if (screens[key]) screens[key].style.display = 'none';
    });

    if (screens[targetKey]) {
        const targetScreen = screens[targetKey];
        const blockScreens = ['s1', 's4', 's6', 'notif'];
        targetScreen.style.display = blockScreens.includes(targetKey) ? 'block' : 'flex';

        if (targetKey === 's1' || targetKey === 'notif') {
            document.body.style.overflow = 'auto';
            document.body.style.position = 'static';
        } else {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        }

        const screensWithLoading = ['s2', 's3', 's4', 's5', 's6'];
        const contentDiv = targetScreen.querySelector('.main-content');

        if (screensWithLoading.includes(targetKey) && contentDiv) {
            contentDiv.style.display = 'none';
            const oldLoader = targetScreen.querySelector('.custom-loader');
            if (oldLoader) oldLoader.remove();

            const loader = document.createElement('div');
            loader.className = 'custom-loader';
            targetScreen.appendChild(loader);

            const delay = Math.floor(Math.random() * 2001) + 4000;
            loadingTimeout = setTimeout(() => {
                loader.remove();
                contentDiv.style.display = 'block';
            }, delay);
        } else if (contentDiv) {
            contentDiv.style.display = 'block';
        }
    }
}

// أزرار التنقل
document.getElementById('to-s2')?.addEventListener('click', () => showScreen('s2'));
document.getElementById('to-s3')?.addEventListener('click', () => showScreen('s3'));
document.querySelector('.fab-btn-bright-purple')?.addEventListener('click', () => showScreen('s4'));
document.getElementById('back-from-4')?.addEventListener('click', () => showScreen('s3'));
document.getElementById('back-to-s1')?.addEventListener('click', () => showScreen('s1'));
document.getElementById('back-to-s2')?.addEventListener('click', () => showScreen('s2'));
document.getElementById('back-from-5')?.addEventListener('click', () => showScreen('s4'));
document.getElementById('back-from-notifications')?.addEventListener('click', () => showScreen('s1'));
document.getElementById('finish-button')?.addEventListener('click', () => showScreen('s1'));

/***********************
 * 4. نظام الإشعارات
 ***********************/
function updateNotificationBadge() {
    const notifBadge = document.getElementById('notif-badge');
    const list = JSON.parse(localStorage.getItem('bank_notifications')) || [];
    if (notifBadge) {
        const isRead = localStorage.getItem('notifications_read') === 'true';
        notifBadge.style.display = 'flex';
        notifBadge.innerText = (isRead || list.length === 0) ? "0" : list.length.toString();
    }
}

function renderNotificationsPage() {
    const container = document.getElementById('notifications-list');
    const list = JSON.parse(localStorage.getItem('bank_notifications')) || [];
    if (!container) return;
    if (list.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:50px; color:#888;">لا توجد إشعارات حالية</p>';
        return;
    }
    container.innerHTML = list.map(item => `
        <div class="notification-card" style="padding: 15px 20px; border-bottom: 1px solid #eee; background: white; direction: rtl;">
            <div style="display: flex; justify-content: space-between; align-items: center; color: #3b5998; font-weight: bold; font-size: 15px; margin-bottom: 4px;">
                <span>${item.title}</span>
                <span style="font-family: 'Cairo', sans-serif; font-weight: normal; font-size: 13px;">${toHindiNumbers(item.date)}</span>
            </div>
            <div style="text-align: right; font-size: 14px; color: #333; line-height: 1.4;">
                تحويل دفع لصديق: ${item.name}، بمبلغ <b>${item.amount}</b>
            </div>
        </div>`).join('');
}

document.getElementById('open-notifications').onclick = () => {
    localStorage.setItem('notifications_read', 'true'); 
    updateNotificationBadge(); 
    showScreen('notif'); 
    renderNotificationsPage(); 
};

/***********************
 * 5. العمليات المالية
 ***********************/
const balanceEl = document.querySelector('.amount-number-system');
let currentBalance = parseFloat(localStorage.getItem('user_balance')) || 44.91;

const amountInput = document.querySelector('.amount-input');
const recipientNameEl = document.getElementById('recipientName');
const recipientPhoneEl = document.getElementById('recipientPhone');
const recipientIcon = document.getElementById('recipientIcon');

amountInput?.addEventListener('input', () => {
    const val = parseFloat(amountInput.value) || 0;
    const comm = val * 0.01;
    document.getElementById('amount-s5').textContent = val.toFixed(2) + ' ILS';
    document.getElementById('commission-s5').textContent = comm.toFixed(2) + ' ILS';
    document.getElementById('total-s5').textContent = (val + comm).toFixed(2) + ' ILS';
});

document.getElementById('confirmBtn')?.addEventListener('click', function() {
    const val = parseFloat(amountInput.value) || 0;
    const total = val + (val * 0.01);
    if (total > currentBalance) return alert('الرصيد غير كافٍ');

    currentBalance -= total;
    localStorage.setItem('user_balance', currentBalance.toFixed(2));
    if(balanceEl) balanceEl.textContent = currentBalance.toFixed(2);

    const newNotif = {
        title: "الدفع لصديق",
        date: new Date().toLocaleDateString('en-GB'),
        name: recipientNameEl.textContent,
        amount: total.toFixed(2) + " ILS"
    };
    
    const list = JSON.parse(localStorage.getItem('bank_notifications')) || [];
    list.unshift(newNotif);
    localStorage.setItem('bank_notifications', JSON.stringify(list));
    localStorage.setItem('notifications_read', 'false');

    document.getElementById('display-name').textContent = recipientNameEl.textContent;
    document.getElementById('display-phone').textContent = recipientPhoneEl.textContent || '---';
    document.getElementById('display-amount').textContent = total.toFixed(2) + ' ILS';
    document.getElementById('display-code').textContent = Math.floor(1000 + Math.random() * 9000);

    showScreen('s6');
    updateNotificationBadge();
});

/***********************
 * 6. اختيار البنك والتحقق التلقائي من الذاكرة
 ***********************/
const bottomSheet = document.getElementById('bottomSheet');
const overlay = document.getElementById('overlay');
const phoneInput = document.querySelector('#screen-4 .input-field');

document.getElementById('openSheetBtn')?.addEventListener('click', () => {
    bottomSheet.style.bottom = "0";
    overlay.style.display = "block";
});

const closeSheet = () => {
    bottomSheet.style.bottom = "-100%";
    overlay.style.display = "none";
};

document.querySelector('.close-text')?.addEventListener('click', closeSheet);
overlay?.addEventListener('click', closeSheet);

document.querySelectorAll('.bank-item').forEach(item => {
    item.addEventListener('click', () => {
        closeSheet();
        const bankType = item.dataset.target;
        if (recipientIcon) {
            if (bankType === 'palpay') {
                recipientIcon.innerHTML = `<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsBGlRu3lHxzkgUR-nnflMv6GdZCm3UooakEJDQAXXAnIy2cNjCbc6h1Qo&s=10" width="48">`;
            } else if (bankType === 'palpay-wallet') {
                recipientIcon.innerHTML = `<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRo-2NOar_qcerlGh166EDRRqtax-y9FOS0Kc3sIEkBk078sxawPAvRbAV7&s=10" width="48">`;
            }
        }

        const phoneVal = phoneInput.value.trim();
        const savedPhone = localStorage.getItem('recipient_phone') || "0599267682";
        const savedName = localStorage.getItem('recipient_name') || "اسم غير مسجل";

        // منطق الذاكرة: إذا طابق الرقم المدخل الرقم المخزن، اجلب الاسم واكمل العملية
        if (phoneVal === savedPhone) {
            recipientNameEl.textContent = savedName;
            recipientPhoneEl.textContent = savedPhone;
            showScreen('s5');
        } else {
            document.getElementById('verifyModal').style.display = 'flex';
        }
    });
});

document.getElementById('verifyOkBtn')?.addEventListener('click', () => {
    document.getElementById('verifyModal').style.display = 'none';
});

/***********************
 * 7. Swipe واللوحات المخفية (مع تعبئة تلقائية للذاكرة)
 ***********************/
function showHiddenPanel(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;

    // تعبئة المدخلات من الذاكرة عند الفتح
    if (panelId === 'hidden-right') {
        document.getElementById('edit-name').value = localStorage.getItem('user_name') || "";
        document.getElementById('edit-balance').value = localStorage.getItem('user_balance') || "";
    } else if (panelId === 'hidden-left') {
        document.getElementById('recipient-name-input').value = localStorage.getItem('recipient_name') || "";
        document.getElementById('recipient-phone-input').value = localStorage.getItem('recipient_phone') || "";
    }

    panel.style[panelId.includes('right') ? 'right' : 'left'] = "0px";
}

document.getElementById('save-right')?.addEventListener('click', () => {
    const name = document.getElementById('edit-name').value;
    const bal = document.getElementById('edit-balance').value;
    if(name) { 
        document.querySelector('.welcome-text').innerHTML = `مرحباً، ${name}`;
        localStorage.setItem('user_name', name);
    }
    if(bal) {
        currentBalance = parseFloat(bal);
        if(balanceEl) balanceEl.textContent = currentBalance.toFixed(2);
        localStorage.setItem('user_balance', bal);
    }
    document.getElementById('hidden-right').style.right = "-300px";
});

document.getElementById('save-left')?.addEventListener('click', () => {
    const rName = document.getElementById('recipient-name-input').value;
    const rPhone = document.getElementById('recipient-phone-input').value;
    if(rName) { recipientNameEl.textContent = rName; localStorage.setItem('recipient_name', rName); }
    if(rPhone) { recipientPhoneEl.textContent = rPhone; localStorage.setItem('recipient_phone', rPhone); }
    document.getElementById('hidden-left').style.left = "-300px";
});

let startX = 0, swipeCount = 0, lastDir = null;
document.addEventListener('touchstart', e => startX = e.touches[0].clientX);
document.addEventListener('touchend', e => {
    if (screens.s1.style.display === 'none') { swipeCount = 0; return; }
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) < 60) return;
    const dir = diff > 0 ? 'right' : 'left';
    swipeCount = (dir === lastDir) ? swipeCount + 1 : 1;
    lastDir = dir;
    if (swipeCount === 2) {
        showHiddenPanel(dir === 'right' ? 'hidden-right' : 'hidden-left');
        swipeCount = 0;
    }
});

/***********************
 * 8. تهيئة التطبيق (عند التشغيل)
 ***********************/
window.onload = () => {
    updateNotificationBadge();
    
    // استعادة الرصيد والاسم الشخصي
    const savedBal = localStorage.getItem('user_balance');
    if(savedBal) {
        currentBalance = parseFloat(savedBal);
        if(balanceEl) balanceEl.textContent = currentBalance.toFixed(2);
    }
    
    const savedName = localStorage.getItem('user_name');
    if (savedName) document.querySelector('.welcome-text').innerHTML = `مرحباً، ${savedName}`;
    
    // استعادة بيانات المستلم الافتراضية
    const savedRName = localStorage.getItem('recipient_name');
    if(savedRName) recipientNameEl.textContent = savedRName;
    
    const savedRPhone = localStorage.getItem('recipient_phone');
    if(savedRPhone) recipientPhoneEl.textContent = savedRPhone;

    const grid = document.getElementById('services-grid');
    if(grid) {
        Array.from(grid.children).forEach((item, i) => item.style.display = i < 4 ? 'flex' : 'none');
    }
};

document.getElementById('toggle-services')?.addEventListener('click', function() {
    const grid = document.getElementById('services-grid');
    const items = Array.from(grid.children);
    const isShowingMore = this.innerText.includes("أقل");
    items.forEach((item, i) => { if (i >= 4) item.style.display = isShowingMore ? 'none' : 'flex'; });
    this.innerText = isShowingMore ? `عرض الكل (${items.length})` : "عرض أقل";
});

phoneInput?.addEventListener('input', () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, '');
    const openBtn = document.getElementById('openSheetBtn');
    if(openBtn) openBtn.disabled = phoneInput.value.trim() === '';
});
