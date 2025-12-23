import './SharePage.css';

interface SharePageProps {
  onClose: () => void;
}

export function SharePage({ onClose }: SharePageProps) {
  const appUrl = 'https://studieplanner.havun.nl';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(appUrl)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appUrl);
    alert('Link gekopieerd!');
  };

  return (
    <div className="modal-overlay">
      <div className="share-page">
        <header className="share-header">
          <h2>Deel StudiePlanner</h2>
          <button onClick={onClose} className="btn-close">×</button>
        </header>

        <div className="share-content">
          <p className="share-intro">
            Scan de QR code of deel de link met klasgenoten!
          </p>

          <div className="qr-container">
            <img src={qrCodeUrl} alt="QR Code voor StudiePlanner" className="qr-code" />
          </div>

          <div className="share-link">
            <input type="text" value={appUrl} readOnly />
            <button onClick={copyToClipboard} className="btn-copy">
              Kopieer
            </button>
          </div>

          <div className="share-tips">
            <h3>Tips voor delen:</h3>
            <ul>
              <li>Screenshot de QR code en deel via WhatsApp/Instagram</li>
              <li>Stuur de link in je klassengroep</li>
              <li>Print de QR code voor in de klas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
