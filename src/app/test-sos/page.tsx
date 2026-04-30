export default function TestSOSPage() {
  return (
    <div style={{ padding: '20px', background: '#f0f4fa', minHeight: '100vh' }}>
      <h1>Teste SOS</h1>
      <button
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'red',
          color: 'white',
          padding: '20px',
          borderRadius: '50%',
          fontSize: '20px',
          fontWeight: 'bold',
          zIndex: 99999,
          border: '4px solid white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}
        onClick={() => alert('SOS clicado!')}
      >
        SOS
      </button>
    </div>
  )
}
