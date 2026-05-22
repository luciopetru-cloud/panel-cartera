"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Conexión a Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const INITIAL_PROFILE = { total_capital_allocated: 361000.00 };

const MARKET_DATA_MOCK = {
  'MELI': { currentPrice: 1654.16, previousClose: 1594.86, dailyChangePercent: 3.72, sentiment: 'Compra' },
  'MSFT': { currentPrice: 421.45, previousClose: 417.42, dailyChangePercent: 0.96, sentiment: 'Compra Fuerte' },
  'NFLX': { currentPrice: 88.25, previousClose: 89.34, dailyChangePercent: -1.21, sentiment: 'Mantener' },
  'NVDA': { currentPrice: 223.36, previousClose: 220.61, dailyChangePercent: 1.25, sentiment: 'Compra Fuerte' },
  'QQQ': { currentPrice: 711.99, previousClose: 701.53, dailyChangePercent: 1.49, sentiment: 'Compra' },
  'SPY': { currentPrice: 740.70, previousClose: 733.73, dailyChangePercent: 0.95, sentiment: 'Compra' }
};

export default function InvestmentDashboard() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [transactions, setTransactions] = useState([]);
  const [marketData, setMarketData] = useState(MARKET_DATA_MOCK);

  const [showModal, setShowModal] = useState(false);
  const [formTicker, setFormTicker] = useState('');
  const [formType, setFormType] = useState('BUY');
  const [formAssetType, setFormAssetType] = useState('STOCK');
  const [formQty, setFormQty] = useState('');
  const [formPrice, setFormPrice] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('executed_at', { ascending: true });
    
    if (error) {
      alert("Error al LEER de la base de datos: " + error.message);
    }

    if (data && data.length > 0) {
      setTransactions(data);
    } else {
      // Cartera por defecto si la base de datos está vacía
      setTransactions([
        { ticker: 'MELI', asset_type: 'STOCK', operation_type: 'BUY', quantity: 6.00, price: 1562.73 },
        { ticker: 'MSFT', asset_type: 'STOCK', operation_type: 'BUY', quantity: 69.00, price: 400.27 },
        { ticker: 'NFLX', asset_type: 'STOCK', operation_type: 'BUY', quantity: 113.00, price: 88.60 },
        { ticker: 'NVDA', asset_type: 'STOCK', operation_type: 'BUY', quantity: 110.00, price: 182.98 },
        { ticker: 'QQQ', asset_type: 'ETF', operation_type: 'BUY', quantity: 110.00, price: 670.70 },
        { ticker: 'SPY', asset_type: 'ETF', operation_type: 'BUY', quantity: 135.00, price: 719.61 }
      ]);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    const newTx = {
      ticker: formTicker.toUpperCase(),
      asset_type: formAssetType,
      operation_type: formType,
      quantity: parseFloat(formQty),
      price: parseFloat(formPrice)
    };

    // Intentamos guardar en la nube
    const { error } = await supabase.from('transactions').insert([newTx]);
    
    if (error) {
      // Si hay un error, te lo va a mostrar en una ventana emergente en el navegador
      alert("Error al GUARDAR en Supabase: " + error.message);
      return;
    }

    // Si no hay error, actualizamos la pantalla de forma segura
    setTransactions([...transactions, newTx]);
    setShowModal(false);
    setFormTicker('');
    setFormQty('');
    setFormPrice('');
    
    alert("¡Operación guardada con éxito en la nube!");
  };

  const portfolioSummary = {};
  let totalCashSpentAndReceived = 0;

  transactions.forEach(tx => {
    const cost = Number(tx.quantity) * Number(tx.price);
    if (tx.operation_type === 'BUY') {
      totalCashSpentAndReceived += cost;
      if (!portfolioSummary[tx.ticker]) {
        portfolioSummary[tx.ticker] = { ticker: tx.ticker, type: tx.asset_type, totalQty: 0, totalCost: 0 };
      }
      portfolioSummary[tx.ticker].totalQty += Number(tx.quantity);
      portfolioSummary[tx.ticker].totalCost += cost;
    } else if (tx.operation_type === 'SELL') {
      totalCashSpentAndReceived -= cost;
      if (portfolioSummary[tx.ticker]) {
        portfolioSummary[tx.ticker].totalQty -= Number(tx.quantity);
        portfolioSummary[tx.ticker].totalCost -= (portfolioSummary[tx.ticker].totalCost / (portfolioSummary[tx.ticker].totalQty + Number(tx.quantity))) * Number(tx.quantity); 
      }
    }
  });

  const activeAssets = Object.values(portfolioSummary).filter(asset => asset.totalQty > 0);
  const cashAvailable = profile.total_capital_allocated - totalCashSpentAndReceived;

  let currentPortfolioMarketValue = 0;
  activeAssets.forEach(asset => {
    const live = marketData[asset.ticker] || { currentPrice: asset.totalCost / asset.totalQty };
    currentPortfolioMarketValue += asset.totalQty * live.currentPrice;
  });
  const totalAccountValue = currentPortfolioMarketValue + cashAvailable;

  return (
    <div style={{ padding: '20px', backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, color: '#0f172a' }}>Dashboard de Inversiones</h2>
          <span style={{ fontSize: '9pt', color: '#64748b' }}>
              Última actualización de cotizaciones: <strong>22 de mayo de 2026, 11:51 AM (ART)</strong>
          </span>
      </div>

      <div style={{ display: 'table', width: '100%', backgroundColor: '#ffffff', padding: '15px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'table-cell', width: '25%' }}>
          <span style={{ fontSize: '9pt', color: '#64748b' }}>Valor Total Cuenta</span>
          <div style={{ fontSize: '16pt', fontWeight: 'bold', color: '#0f172a' }}>${totalAccountValue.toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
        </div>
        <div style={{ display: 'table-cell', width: '25%' }}>
          <span style={{ fontSize: '9pt', color: '#64748b' }}>Efectivo Disponible (Cash)</span>
          <div style={{ fontSize: '16pt', fontWeight: 'bold', color: '#2563eb' }}>${cashAvailable.toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
        </div>
        <div style={{ display: 'table-cell', width: '25%' }}>
          <span style={{ fontSize: '9pt', color: '#64748b' }}>Capital Asignado Inicial</span>
          <div style={{ fontSize: '16pt', fontWeight: 'bold', color: '#475569' }}>${profile.total_capital_allocated.toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
        </div>
        <div style={{ display: 'table-cell', width: '25%', textAlign: 'right', verticalAlign: 'middle' }}>
          <button onClick={() => setShowModal(true)} style={{ backgroundColor: '#1e3a8a', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            + Registrar Operación
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '15px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: '0', marginBottom: '15px', color: '#0f172a' }}>Monitoreo de Activos Unificados (Precio Promedio Ponderado)</h3>
        <table style={{ width: '100%', fontSize: '10pt', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
              <th style={{ padding: '10px' }}>Ticker</th>
              <th style={{ padding: '10px' }}>Tipo</th>
              <th style={{ padding: '10px' }}>Nominales</th>
              <th style={{ padding: '10px' }}>Precio Compra (PPP)</th>
              <th style={{ padding: '10px' }}>Precio Actual</th>
              <th style={{ padding: '10px' }}>Var. Día (%)</th>
              <th style={{ padding: '10px' }}>Ganancia Día ($)</th>
              <th style={{ padding: '10px' }}>Var. Acum (%)</th>
              <th style={{ padding: '10px' }}>Ganancia Acum ($)</th>
            </tr>
          </thead>
          <tbody>
            {activeAssets.map(asset => {
              const ppp = asset.totalCost / asset.totalQty;
              const live = marketData[asset.ticker] || { currentPrice: ppp, previousClose: ppp, dailyChangePercent: 0, sentiment: 'N/A' };
              
              const dailyGainMonetary = asset.totalQty * (live.currentPrice - live.previousClose);
              const totalGainPercent = ((live.currentPrice - ppp) / ppp) * 100;
              const totalGainMonetary = asset.totalQty * (live.currentPrice - ppp);

              return (
                <tr key={asset.ticker} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{asset.ticker}</td>
                  <td style={{ padding: '10px' }}><span style={{ fontSize: '8.5pt', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>{asset.type}</span></td>
                  <td style={{ padding: '10px' }}>{asset.totalQty.toFixed(2)}</td>
                  <td style={{ padding: '10px' }}>${ppp.toFixed(2)}</td>
                  <td style={{ padding: '10px', fontWeight: '500' }}>${live.currentPrice.toFixed(2)}</td>
                  <td style={{ padding: '10px', color: live.dailyChangePercent >= 0 ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                    {live.dailyChangePercent >= 0 ? '+' : ''}{live.dailyChangePercent.toFixed(2)}%
                  </td>
                  <td style={{ padding: '10px', color: dailyGainMonetary >= 0 ? '#16a34a' : '#dc2626' }}>
                    ${dailyGainMonetary.toLocaleString('es-AR', {minimumFractionDigits:2})}
                  </td>
                  <td style={{ padding: '10px', color: totalGainPercent >= 0 ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                    {totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
                  </td>
                  <td style={{ padding: '10px', color: totalGainMonetary >= 0 ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                    ${totalGainMonetary.toLocaleString('es-AR', {minimumFractionDigits:2})}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'table', width: '100%', tableLayout: 'fixed' }}>
        <div style={{ display: 'table-cell', width: '50%', paddingRight: '10px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '15px', minHeight: '200px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: '0' }}>Distribución de Activos en Cartera (%)</h3>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '8px' }}>Activo</th>
                  <th style={{ padding: '8px' }}>Valor de Mercado</th>
                  <th style={{ padding: '8px' }}>Porcentaje (%)</th>
                </tr>
              </thead>
              <tbody>
                {activeAssets.map(asset => {
                  const live = marketData[asset.ticker] || { currentPrice: 0 };
                  const value = asset.totalQty * live.currentPrice;
                  const pct = (value / totalAccountValue) * 100;
                  return (
                    <tr key={asset.ticker} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>{asset.ticker}</td>
                      <td style={{ padding: '8px' }}>${value.toLocaleString('es-AR', {minimumFractionDigits:2})}</td>
                      <td style={{ padding: '8px', fontWeight: 'bold', color: '#2563eb' }}>{pct.toFixed(2)}%</td>
                    </tr>
                  );
                })}
                <tr>
                  <td style={{ padding: '8px', fontWeight: 'bold', color: '#475569' }}>EFECTIVO (Cash)</td>
                  <td style={{ padding: '8px' }}>${cashAvailable.toLocaleString('es-AR', {minimumFractionDigits:2})}</td>
                  <td style={{ padding: '8px', fontWeight: 'bold', color: '#2563eb' }}>{((cashAvailable / totalAccountValue) * 100).toFixed(2)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'table-cell', width: '50%', paddingLeft: '10px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '15px', minHeight: '200px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: '0' }}>Consenso y Sentimiento de Analistas</h3>
            <p style={{ fontSize: '9pt', color: '#64748b' }}>Información extraída automáticamente vía API.</p>
            {activeAssets.map(asset => {
              const live = marketData[asset.ticker] || { sentiment: 'Mantener' };
              const isBuy = live.sentiment.includes('Compra');
              return (
                <div key={asset.ticker} style={{ padding: '10px 0', borderBottom: '1px solid #e2e8f0', display: 'table', width: '100%' }}>
                  <div style={{ display: 'table-cell', fontWeight: 'bold', fontSize: '11pt' }}>{asset.ticker}</div>
                  <div style={{ display: 'table-cell', textAlign: 'right' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '20px', fontSize: '9pt', fontWeight: 'bold',
                      backgroundColor: isBuy ? '#dcfce7' : '#f1f5f9',
                      color: isBuy ? '#15803d' : '#475569'
                    }}>
                      {live.sentiment}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, color: '#0f172a' }}>Registrar Operación</h3>
            <form onSubmit={handleAddTransaction}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '9pt', marginBottom: '5px', color: '#475569' }}>Ticker</label>
                <input type="text" value={formTicker} onChange={e => setFormTicker(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ej: AAPL" />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '9pt', marginBottom: '5px', color: '#475569' }}>Tipo de Activo</label>
                <select value={formAssetType} onChange={e => setFormAssetType(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                  <option value="STOCK">Acción</option>
                  <option value="ETF">ETF</option>
                  <option value="CRYPTO">Criptomoneda</option>
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '9pt', marginBottom: '5px', color: '#475569' }}>Operación</label>
                <select value={formType} onChange={e => setFormType(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                  <option value="BUY">Compra</option>
                  <option value="SELL">Venta</option>
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '9pt', marginBottom: '5px', color: '#475569' }}>Cantidad (Nominales)</label>
                <input type="number" step="0.0001" value={formQty} onChange={e => setFormQty(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="0.00" />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '9pt', marginBottom: '5px', color: '#475569' }}>Precio de Ejecución ($)</label>
                <input type="number" step="0.01" value={formPrice} onChange={e => setFormPrice(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="0.00" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 15px', border: 'none', backgroundColor: '#e2e8f0', color: '#0f172a', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 15px', border: 'none', backgroundColor: '#1e3a8a', color: 'white', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
