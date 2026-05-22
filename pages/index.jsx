// ---------------- PANTALLA DE LOGIN ----------------
  if (!session) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '350px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#0f172a', textAlign: 'center', marginTop: 0 }}>Acceso Seguro</h2>
          <p style={{ fontSize: '9pt', color: '#64748b', textAlign: 'center', marginBottom: '20px' }}>Ingresá a tu Dashboard de Inversiones</p>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '15px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            {authError && <div style={{ color: '#dc2626', fontSize: '9pt', marginBottom: '10px', textAlign: 'center' }}>{authError}</div>}
            <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Ingresar</button>
          </form>
        </div>
      </div>
    );
  }
