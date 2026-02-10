document.addEventListener('DOMContentLoaded', () => {
    // DOM Elementleri
    const startBtn = document.getElementById('start-btn');
    const homeScreen = document.getElementById('home-screen');
    const selectionScreen = document.getElementById('selection-screen');
    const bgMusic = document.getElementById('bg-music');
    const takePhotoBtn = document.getElementById('take-photo-btn');
    const cameraScreen = document.getElementById('camera-screen');
    const webcam = document.getElementById('webcam');
    const countdownOverlay = document.getElementById('countdown');
    const captureBtn = document.getElementById('capture-btn'); 
    const resultScreen = document.getElementById('result-screen');
    const canvas = document.getElementById('photo-canvas');
    const finalPhoto = document.getElementById('final-photo');
    const downloadBtn = document.getElementById('download-btn');
    const uploadPhotoBtn = document.getElementById('upload-photo-btn');
    const fileInput = document.getElementById('file-input');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const customTextInput = document.getElementById('custom-text-input'); // Yeni

    let stream = null;
    let rawImageData = new Image(); 
    let currentFilter = 'none';

    // Konfeti Efekti
    function fireCelebration() {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ff0000', '#ff69b4', '#ffffff', '#C84344'] });
        const heart = confetti.shapeFromText({ text: '❤️', scalar: 2 });
        confetti({ shapes: [heart], particleCount: 40, spread: 80, origin: { y: 0.7 } });
    }

    // Başlat butonu
    startBtn.addEventListener('click', () => {
        if (bgMusic) { bgMusic.volume = 0.3; bgMusic.play().catch(e => console.log(e)); }
        homeScreen.classList.add('hidden');
        selectionScreen.classList.remove('hidden');
    });

    // Kamera açma
    takePhotoBtn.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            webcam.srcObject = stream;
            selectionScreen.classList.add('hidden');
            cameraScreen.classList.remove('hidden');
        } catch (err) { alert("Lütfen kamera izni verin!"); }
    });

    // Dosya Yükleme
    uploadPhotoBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                rawImageData = new Image();
                rawImageData.onload = () => { 
                    renderPolaroid('none'); 
                    selectionScreen.classList.add('hidden');
                    resultScreen.classList.remove('hidden');
                    fireCelebration();
                };
                rawImageData.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Fotoğraf Çekme
    captureBtn.addEventListener('click', () => {
        captureBtn.disabled = true;
        let count = 3;
        countdownOverlay.classList.remove('hidden');
        countdownOverlay.innerText = count;

        const timer = setInterval(() => {
            count--;
            if (count > 0) { countdownOverlay.innerText = count; }
            else {
                clearInterval(timer);
                countdownOverlay.innerText = "📸";
                setTimeout(() => {
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = webcam.videoWidth;
                    tempCanvas.height = webcam.videoHeight;
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCtx.translate(tempCanvas.width, 0);
                    tempCtx.scale(-1, 1);
                    tempCtx.drawImage(webcam, 0, 0);
                    
                    rawImageData = new Image();
                    rawImageData.onload = () => { renderPolaroid('none'); };
                    rawImageData.src = tempCanvas.toDataURL('image/png');

                    if (stream) stream.getTracks().forEach(track => track.stop());
                    cameraScreen.classList.add('hidden');
                    resultScreen.classList.remove('hidden');
                    fireCelebration();
                    captureBtn.disabled = false;
                    countdownOverlay.classList.add('hidden');
                }, 500);
            }
        }, 1000);
    });

    // FİLTRELEME VE ÇERÇEVELEME FONKSİYONU
    function renderPolaroid(filterType) {
        currentFilter = filterType;
        const ctx = canvas.getContext('2d');
        const pWidth = 800;
        const pHeight = 1000;
        canvas.width = pWidth;
        canvas.height = pHeight;

        // 1. Arka Planı Temizle ve Beyaz Yap
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, pWidth, pHeight);

        const padding = 50;
        const photoSize = 700;

        // 2. Orijinal Fotoğrafı Çiz
        if (rawImageData.src) {
            let sSize = Math.min(rawImageData.width, rawImageData.height);
            let sx = (rawImageData.width - sSize) / 2;
            let sy = (rawImageData.height - sSize) / 2;
            ctx.drawImage(rawImageData, sx, sy, sSize, sSize, padding, padding, photoSize, photoSize);
        }

        // 3. EFEKTLER
        if (filterType === 'grayscale') {
            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.globalCompositeOperation = "saturation";
            ctx.fillRect(padding, padding, photoSize, photoSize);
            ctx.globalCompositeOperation = "source-over";
        } 
        else if (filterType === 'sepia') {
            ctx.fillStyle = "rgba(255, 105, 180, 0.25)";
            ctx.fillRect(padding, padding, photoSize, photoSize);
        } 
        else if (filterType === 'heart') {
            ctx.fillStyle = "rgba(255, 20, 147, 0.15)";
            ctx.fillRect(padding, padding, photoSize, photoSize);
            ctx.font = "35px Arial";
            ctx.globalAlpha = 0.3;
            for (let i = 0; i < 7; i++) {
                for (let j = 0; j < 7; j++) {
                    ctx.fillText("❤️", padding + 30 + (i * 105), padding + 60 + (j * 105));
                }
            }
            ctx.globalAlpha = 1.0;
        }

        // 4. Dinamik Metni Çiz (Yeni Bölüm)
        const userText = customTextInput.value.trim() || "Valentine 2026 ❤️";
        ctx.fillStyle = "#C84344"; 
        ctx.font = "italic bold 55px 'Poppins', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(userText, pWidth / 2, 925);

        // 5. Preview'u Yenile
        finalPhoto.src = canvas.toDataURL('image/png');
    }

    // Metin Girişi Dinleyici (Kullanıcı yazdıkça değişir)
    customTextInput.addEventListener('input', () => {
        renderPolaroid(currentFilter);
    });

    // Filtre butonları dinleyici
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderPolaroid(btn.dataset.filter);
        });
    });

    // Kaydetme
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `valentine-${currentFilter}.png`;
        link.href = finalPhoto.src;
        link.click();
    });
});