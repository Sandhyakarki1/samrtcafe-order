import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QRCodePage = () => {
  
  const productionUrl = "https://samrtcafe-order-5zdf.vercel.app/menu";
  
  const tables = [1, 2, 3, 4, 5];

  const downloadQR = (tableNum) => {
    const canvas = document.getElementById(`qr-table-${tableNum}`);
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `Table_${tableNum}_QR.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const copyLink = (tableNum) => {
   
    const fullUrl = `${productionUrl}/${tableNum}`; 
    navigator.clipboard.writeText(fullUrl).then(() => {
      alert(`Link copied for Table ${tableNum}: \n${fullUrl}`);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div style={{ padding: '30px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#1a202c', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Generate Table QR Codes</h2>
        <p style={{ color: '#718096', marginTop: '5px' }}>Scan these to open the menu for a specific table.</p>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
        gap: '25px' 
      }}>
        {tables.map((num) => (
          <div key={num} style={{
            background: 'white',
            padding: '25px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #edf2f7'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '18px' }}>Table {num}</h3>
            
            <div style={{ 
              display: 'inline-block', 
              padding: '10px', 
              background: '#f7fafc', 
              borderRadius: '12px',
              border: '1px solid #e2e8f0' 
            }}>
              <QRCodeCanvas 
                id={`qr-table-${num}`}
                
                value={`${productionUrl}/${num}`} 
                size={160}
                level={"H"}
                includeMargin={false}
              />
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => downloadQR(num)}
                style={{
                  padding: '10px', backgroundColor: '#00D161', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
                }}
              >
                Download PNG
              </button>

              <button 
                onClick={() => copyLink(num)}
                style={{
                  padding: '10px', backgroundColor: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
                }}
              >
                Copy Link Address
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QRCodePage;