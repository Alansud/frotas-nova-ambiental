export default function SOSButton() {
  return (
    <a
      href="https://wa.me/5511999999999?text=SOS%20-%20Veiculo%20da%20frota%20precisa%20de%20ajuda!"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#dc2626',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '50px',
        fontSize: '18px',
        fontWeight: 'bold',
        zIndex: 99999,
        textDecoration: 'none',
        boxShadow: '0 4px 20px rgba(220, 38, 38, 0.6)',
        border: '3px solid white'
      }}
    >
      🚨 SOS
    </a>
  )
}
