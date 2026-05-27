export default async function handler(req, res) {
  const { ticker } = req.query;
  
  if (!ticker) {
    return res.status(400).json({ error: 'Falta el Ticker' });
  }

  try {
    // Consultamos la API pública de Yahoo Finance
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`);
    const data = await response.json();
    
    // Extraemos los datos exactos que necesitamos
    const meta = data.chart.result[0].meta;
    const currentPrice = meta.regularMarketPrice;
    const previousClose = meta.chartPreviousClose;
    
    // Calculamos la variación y el sentimiento
    const dailyChangePercent = ((currentPrice - previousClose) / previousClose) * 100;
    const sentiment = dailyChangePercent > 0.5 ? 'Compra Fuerte' : (dailyChangePercent > 0 ? 'Compra' : 'Mantener');

    res.status(200).json({
      currentPrice,
      previousClose,
      dailyChangePercent,
      sentiment
    });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener el precio' });
  }
}
