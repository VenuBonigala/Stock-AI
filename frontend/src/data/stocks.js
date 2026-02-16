// export const stocks = [
//   { name: "Apple Inc", symbol: "AAPL" },
//   { name: "Tesla", symbol: "TSLA" },
//   { name: "Microsoft", symbol: "MSFT" },
//   { name: "Google", symbol: "GOOGL" },
//   { name: "Amazon", symbol: "AMZN" },

//   { name: "Reliance Industries", symbol: "RELIANCE" },
//   { name: "Tata Consultancy Services", symbol: "TCS" },
//   { name: "Infosys", symbol: "INFY" },
//   { name: "HDFC Bank", symbol: "HDFCBANK" },

//   { name: "NIFTY 50", symbol: "NIFTY50" },
//   { name: "SENSEX", symbol: "SENSEX" },
// ];

// export const stocks = [
//   // US Stocks
//   { name: "Apple Inc", symbol: "AAPL" },
//   { name: "Tesla", symbol: "TSLA" },
//   { name: "Microsoft", symbol: "MSFT" },
//   { name: "Google", symbol: "GOOGL" },
//   { name: "Amazon", symbol: "AMZN" },
//   { name: "Meta Platforms", symbol: "META" },
//   { name: "NVIDIA", symbol: "NVDA" },
//   { name: "Netflix", symbol: "NFLX" },
//   { name: "Adobe", symbol: "ADBE" },
//   { name: "PayPal", symbol: "PYPL" },
//   { name: "JPMorgan Chase", symbol: "JPM" },
//   { name: "Visa", symbol: "V" },
//   { name: "Walmart", symbol: "WMT" },

//   // Indian Stocks
//   { name: "Reliance Industries", symbol: "RELIANCE" },
//   { name: "Tata Consultancy Services", symbol: "TCS" },
//   { name: "Infosys", symbol: "INFY" },
//   { name: "HDFC Bank", symbol: "HDFCBANK" },

//   // Indian Indices
//   { name: "NIFTY 50", symbol: "NIFTY50" },
//   { name: "SENSEX", symbol: "SENSEX" },

//   // European Stocks (UK)
//   { name: "HSBC Holdings", symbol: "HSBA.L" },
//   { name: "BP", symbol: "BP.L" },
//   { name: "Unilever", symbol: "ULVR.L" },

//   // Germany
//   { name: "SAP", symbol: "SAP.DE" },
//   { name: "Siemens", symbol: "SIE.DE" },
//   { name: "Volkswagen", symbol: "VOW3.DE" },

//   // France
//   { name: "LVMH", symbol: "MC.PA" },
//   { name: "TotalEnergies", symbol: "TTE.PA" },
//   { name: "Airbus", symbol: "AIR.PA" },

//   // Netherlands
//   { name: "ASML", symbol: "ASML.AS" },
//   { name: "Shell", symbol: "SHEL.AS" },

//   // Switzerland
//   { name: "Nestlé", symbol: "NESN.SW" },
//   { name: "Novartis", symbol: "NOVN.SW" },
//   { name: "Roche", symbol: "ROG.SW" },
// ];



export const stocks = [
  // ======================
  // US Stocks (NYSE/NASDAQ)
  // ======================
  { name: "Apple", symbol: "AAPL" },
  { name: "Microsoft", symbol: "MSFT" },
  { name: "NVIDIA", symbol: "NVDA" },
  { name: "Amazon", symbol: "AMZN" },
  { name: "Alphabet (Google)", symbol: "GOOGL" },
  { name: "Tesla", symbol: "TSLA" },
  { name: "Meta Platforms", symbol: "META" },
  { name: "Netflix", symbol: "NFLX" },
  { name: "Adobe", symbol: "ADBE" },
  { name: "AMD", symbol: "AMD" },
  { name: "Intel", symbol: "INTC" },
  { name: "JPMorgan Chase", symbol: "JPM" },
  { name: "Bank of America", symbol: "BAC" },
  { name: "Goldman Sachs", symbol: "GS" },
  { name: "Visa", symbol: "V" },
  { name: "Mastercard", symbol: "MA" },
  { name: "Walmart", symbol: "WMT" },
  { name: "Coca-Cola", symbol: "KO" },
  { name: "PepsiCo", symbol: "PEP" },
  { name: "McDonald's", symbol: "MCD" },

  // ======================
  // India (NSE)
  // ======================
  { name: "Reliance Industries", symbol: "RELIANCE.NS" },
  { name: "TCS", symbol: "TCS.NS" },
  { name: "Infosys", symbol: "INFY.NS" },
  { name: "HDFC Bank", symbol: "HDFCBANK.NS" },
  { name: "ICICI Bank", symbol: "ICICIBANK.NS" },
  { name: "State Bank of India", symbol: "SBIN.NS" },
  { name: "Larsen & Toubro", symbol: "LT.NS" },
  { name: "Bharti Airtel", symbol: "BHARTIARTL.NS" },
  { name: "ITC", symbol: "ITC.NS" },
  { name: "Axis Bank", symbol: "AXISBANK.NS" },
  { name: "Kotak Mahindra Bank", symbol: "KOTAKBANK.NS" },
  { name: "Maruti Suzuki", symbol: "MARUTI.NS" },
  { name: "Asian Paints", symbol: "ASIANPAINT.NS" },
  { name: "Sun Pharma", symbol: "SUNPHARMA.NS" },
  { name: "UltraTech Cement", symbol: "ULTRACEMCO.NS" },

  // ======================
  // UK (London Stock Exchange)
  // ======================
  { name: "HSBC Holdings", symbol: "HSBA.L" },
  { name: "BP", symbol: "BP.L" },
  { name: "Shell", symbol: "SHEL.L" },
  { name: "Unilever", symbol: "ULVR.L" },
  { name: "AstraZeneca", symbol: "AZN.L" },
  { name: "GlaxoSmithKline", symbol: "GSK.L" },
  { name: "Diageo", symbol: "DGE.L" },
  { name: "Barclays", symbol: "BARC.L" },
  { name: "Lloyds Banking Group", symbol: "LLOY.L" },
  { name: "Rio Tinto", symbol: "RIO.L" },

  // ======================
  // Germany (XETRA)
  // ======================
  { name: "SAP", symbol: "SAP.DE" },
  { name: "Siemens", symbol: "SIE.DE" },
  { name: "Volkswagen", symbol: "VOW3.DE" },
  { name: "BMW", symbol: "BMW.DE" },
  { name: "Mercedes-Benz", symbol: "MBG.DE" },
  { name: "Allianz", symbol: "ALV.DE" },
  { name: "Deutsche Telekom", symbol: "DTE.DE" },
  { name: "BASF", symbol: "BAS.DE" },
  { name: "Adidas", symbol: "ADS.DE" },
  { name: "Infineon", symbol: "IFX.DE" },

  // ======================
  // Canada (TSX)
  // ======================
  { name: "Shopify", symbol: "SHOP.TO" },
  { name: "Royal Bank of Canada", symbol: "RY.TO" },
  { name: "Toronto-Dominion Bank", symbol: "TD.TO" },
  { name: "Enbridge", symbol: "ENB.TO" },
  { name: "Canadian National Railway", symbol: "CNR.TO" },
  { name: "Bank of Montreal", symbol: "BMO.TO" },
  { name: "Brookfield Corp", symbol: "BN.TO" },
  { name: "Suncor Energy", symbol: "SU.TO" },
  { name: "Canadian Pacific Kansas City", symbol: "CP.TO" },
  { name: "Manulife Financial", symbol: "MFC.TO" },

  // ======================
  // Brazil (B3)
  // ======================
  { name: "Petrobras", symbol: "PETR4.SA" },
  { name: "Vale", symbol: "VALE3.SA" },
  { name: "Itaú Unibanco", symbol: "ITUB4.SA" },
  { name: "Banco Bradesco", symbol: "BBDC4.SA" },
  { name: "Ambev", symbol: "ABEV3.SA" },
  { name: "Banco do Brasil", symbol: "BBAS3.SA" },
  { name: "WEG", symbol: "WEGE3.SA" },
  { name: "JBS", symbol: "JBSS3.SA" },
  { name: "Suzano", symbol: "SUZB3.SA" },
  { name: "Embraer", symbol: "EMBR3.SA" },

  // ======================
  // Australia (ASX) - Extended Hours Possible
  // ======================
  { name: "CSL Limited", symbol: "CSL.AX" },
  { name: "Commonwealth Bank", symbol: "CBA.AX" },
  { name: "BHP Group", symbol: "BHP.AX" },
  { name: "National Australia Bank", symbol: "NAB.AX" },
  { name: "Macquarie Group", symbol: "MQG.AX" },

  // ======================
  // Hong Kong (HKEX)
  // ======================
  { name: "Tencent Holdings", symbol: "0700.HK" },
  { name: "HSBC Holdings", symbol: "0005.HK" },
  { name: "AIA Group", symbol: "1299.HK" },
  { name: "China Construction Bank", symbol: "0939.HK" },
  { name: "Ping An Insurance", symbol: "2318.HK" },

  // ======================
  // Major Indices
  // ======================
  { name: "S&P 500", symbol: "^GSPC" },
  { name: "NASDAQ 100", symbol: "^NDX" },
  { name: "Dow Jones", symbol: "^DJI" },
  { name: "NIFTY 50", symbol: "^NSEI" },
  { name: "SENSEX", symbol: "^BSESN" },
  { name: "FTSE 100", symbol: "^FTSE" },
  { name: "DAX", symbol: "^GDAXI" },
];
