document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const generateBtn = document.getElementById('generateBtn');
    const qrContainer = document.getElementById('qrContainer');
    const shortUrlSpan = document.getElementById('shortUrl');
    const downloadBtn = document.getElementById('downloadBtn');
    const shareBtn = document.getElementById('shareBtn');
    let qrCodeInstance;
    let shortUrl; // To store the shortened URL

    generateBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        if (!url || !isValidUrl(url)) {
            alert('Please enter a valid URL');
            return;
        }

        try {
            // Shorten the URL via API
            const response = await fetch('/api/shorten', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                throw new Error('Shortening failed');
            }

            const data = await response.json();
            shortUrl = data.shortUrl;
            shortUrlSpan.textContent = shortUrl;

            // Clear previous QR
            document.getElementById('qrcode').innerHTML = '';

            // Generate QR for short URL
            qrCodeInstance = new QRCode('qrcode', {
                text: shortUrl,
                width: 200,
                height: 200,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });

            qrContainer.classList.remove('hidden');
        } catch (err) {
            alert('Error shortening URL: ' + err.message);
        }
    });

    downloadBtn.addEventListener('click', () => {
        if (!qrCodeInstance) return;
        const canvas = document.getElementById('qrcode').querySelector('canvas');
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = 'qrkodli.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    shareBtn.addEventListener('click', async () => {
        if (!qrCodeInstance) return;
        const canvas = document.getElementById('qrcode').querySelector('canvas');
        if (!canvas) return;
        canvas.toBlob(async (blob) => {
            if (!blob) return;
            const file = new File([blob], 'qrkodli.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'QRkodli - QR Code',
                        text: `Short URL: ${shortUrl}\nCheck out this QR code!`
                    });
                } catch (err) {
                    console.error('Share failed:', err);
                    alert('Sharing not supported or failed. Try downloading.');
                }
            } else {
                alert('Sharing not supported. Try downloading.');
            }
        }, 'image/png');
    });

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
});