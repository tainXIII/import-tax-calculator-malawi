import { useState, useEffect } from "react";
import {
  Calculator,
  DollarSign,
  History,
  Download,
  RefreshCw,
  Car,
  Package,
  Globe,
  Settings,
  FileText,
  BarChart3,
  MapPin,
} from "lucide-react";
import { productCategories } from "./data/taxCategories";

interface CalculationResult {
  valueMWK: number;
  importDuty?: number;
  exciseTax?: number;
  surcharge?: number;
  vat: number;
  ait: number;
  dif: number;
  extra: number;
  totalTaxes: number;
  landedCost: number;
  usdInput: number;
  rate: number;
  timestamp: Date;
  type: "general" | "car";
  details?: CarImportDetails;
  categoryName?: string;
}

interface CarImportDetails {
  vehicleType: string;
  engineSize: number;
  vehicleAge: number;
  isSADC: boolean;
  dutyRate: number;
  exciseRate: number;
  registrationFee: number;
  inspectionFee: number;
  exciseTax: number;
  importDuty: number;
  carbonTax: number;
}

interface TaxRates {
  vat: number;
  ait: number;
  dif: number;
  extra: number;
}

interface CarDutyRates {
  sadcUnder1000cc: number;
  sadcOver1000cc: number;
  nonSadcUnder1000cc: number;
  nonSadcOver1000cc: number;
  exciseUnder1500cc: number;
  exciseOver1500cc: number;
  registrationFee: number;
  inspectionFee: number;
  carbonTaxRate: number;
}

type CalculatorMode = "general" | "car" | "compare" | "bulk";

export default function App() {
  const [mode, setMode] = useState<CalculatorMode>("general");
  const [usdPrice, setUsdPrice] = useState<string>("");
  const [rate, setRate] = useState<number | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [history, setHistory] = useState<CalculationResult[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRates>({
    vat: 16.5,
    ait: 10,
    dif: 45000,
    extra: 30000,
  });
  const [carDutyRates, setCarDutyRates] = useState<CarDutyRates>({
    sadcUnder1000cc: 15,
    sadcOver1000cc: 25,
    nonSadcUnder1000cc: 25,
    nonSadcOver1000cc: 35,
    exciseUnder1500cc: 10,
    exciseOver1500cc: 20,
    registrationFee: 50000,
    inspectionFee: 25000,
    carbonTaxRate: 2,
  });

  // Car-specific inputs
  const [vehicleType, setVehicleType] = useState<string>("Internal Combustion");
  const [engineSize, setEngineSize] = useState<string>("");
  const [vehicleAge, setVehicleAge] = useState<string>("");
  const [isSADC, setIsSADC] = useState<boolean>(false);
  const [countryOfOrigin, setCountryOfOrigin] = useState<string>("");

  // General category
  const [generalCategory, setGeneralCategory] = useState<string>("gen");

  // Bulk calculator
  const [bulkItems, setBulkItems] = useState<
    Array<{ id: number; name: string; usdPrice: number; categoryId: string }>
  >([{ id: 1, name: "", usdPrice: 0, categoryId: "gen" }]);

  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "calculator" | "history" | "analytics"
  >("calculator");

  const sadcCountries = [
    "Angola",
    "Botswana",
    "Comoros",
    "Democratic Republic of Congo",
    "Eswatini",
    "Lesotho",
    "Madagascar",
    "Malawi",
    "Mauritius",
    "Mozambique",
    "Namibia",
    "Seychelles",
    "South Africa",
    "Tanzania",
    "Zambia",
    "Zimbabwe",
  ];

  // Load data from session storage
  useEffect(() => {
    const savedHistory = JSON.parse(
      sessionStorage.getItem("mra-history") || "[]"
    );
    const savedRates = JSON.parse(
      sessionStorage.getItem("mra-rates") || "null"
    );
    const savedCarRates = JSON.parse(
      sessionStorage.getItem("mra-car-rates") || "null"
    );

    if (savedRates) setTaxRates(savedRates);
    if (savedCarRates) setCarDutyRates(savedCarRates);

    setHistory(
      savedHistory.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }))
    );
  }, []);

  const saveToStorage = (key: string, data: any) => {
    sessionStorage.setItem(key, JSON.stringify(data));
  };

  const fetchRate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      const data = await res.json();
      if (data && data.rates && data.rates.MWK) {
        setRate(data.rates.MWK);
        setLastUpdated(new Date());
      } else {
        throw new Error("Invalid API response");
      }
    } catch (err) {
      setError(
        "Failed to fetch exchange rate. Using cached rate if available."
      );
      console.error("Failed to fetch rate", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
  }, []);

  const calculateGeneral = () => {
    if (!rate) {
      setError("Exchange rate is not loaded yet. Please wait or refresh the rate.");
      return;
    }

    if (!usdPrice) {
      setError("Please enter the item price in USD");
      return;
    }

    const usdValue = parseFloat(usdPrice);
    if (isNaN(usdValue) || usdValue <= 0) {
      setError("Please enter a valid price in USD greater than 0");
      return;
    }

    const valueMWK = usdValue * rate;
    const category = productCategories.find(c => c.id === generalCategory) || productCategories[0];

    const importDuty = valueMWK * (category.importDuty / 100);
    const exciseTax = valueMWK * (category.exciseTax / 100);
    const surcharge = valueMWK * (category.surcharge / 100);
    const taxableAmount = valueMWK + importDuty + exciseTax + surcharge;
    
    const vat = taxableAmount * (category.vat / 100);
    const ait = valueMWK * (taxRates.ait / 100);
    const dif = taxRates.dif;
    const extra = taxRates.extra;

    const totalTaxes = importDuty + exciseTax + surcharge + vat + ait + dif + extra;
    const landedCost = valueMWK + totalTaxes;

    const newResult: CalculationResult = {
      valueMWK,
      importDuty,
      exciseTax,
      surcharge,
      vat,
      ait,
      dif,
      extra,
      totalTaxes,
      landedCost,
      usdInput: usdValue,
      rate,
      timestamp: new Date(),
      type: "general",
      categoryName: category.name
    };

    setResult(newResult);
    addToHistory(newResult);
    setError("");
  };

  const calculateCar = () => {
    if (!rate) {
      setError("Exchange rate is not loaded yet. Please wait or refresh the rate.");
      return;
    }

    if (!usdPrice) {
      setError("Please enter the vehicle price in USD");
      return;
    }

    const usdValue = parseFloat(usdPrice);
    if (isNaN(usdValue) || usdValue <= 0) {
      setError("Please enter a valid vehicle price greater than 0");
      return;
    }

    if (vehicleType !== "Electric" && (!engineSize || parseFloat(engineSize) <= 0)) {
      setError("Please enter a valid engine size in cc (e.g. 1500)");
      return;
    }

    if (!vehicleAge || isNaN(parseInt(vehicleAge)) || parseInt(vehicleAge) < 0) {
      setError("Please enter a valid vehicle age in years (0 or more)");
      return;
    }

    if (!countryOfOrigin) {
      setError("Please select the country of origin");
      return;
    }

    const engine = vehicleType === "Electric" ? 0 : parseFloat(engineSize);
    const age = parseInt(vehicleAge);

    const valueMWK = usdValue * rate;

    // Determine duty and excise rates based on vehicle type
    let dutyRate: number = 0;
    let exciseRate: number = 0;
    let customVatRate: number = taxRates.vat;
    let carbonTax: number = 0;

    if (vehicleType === "Electric") {
      dutyRate = 0;
      exciseRate = 0;
      customVatRate = 8;
      carbonTax = 0;
    } else if (vehicleType.startsWith("Hybrid")) {
      dutyRate = 30; // Standard customs duty for hybrids
      exciseRate = engine <= 1500 ? 17.5 : engine <= 2500 ? 10 : 20;
      carbonTax = engine * carDutyRates.carbonTaxRate * (age > 10 ? 1.5 : 1);
      const agePenalty = age > 5 ? Math.min((age - 5) * 2, 15) : 0;
      dutyRate += agePenalty;
    } else {
      dutyRate = isSADC
        ? engine <= 1000
          ? carDutyRates.sadcUnder1000cc
          : carDutyRates.sadcOver1000cc
        : engine <= 1000
        ? carDutyRates.nonSadcUnder1000cc
        : carDutyRates.nonSadcOver1000cc;
      exciseRate =
        engine <= 1500
          ? carDutyRates.exciseUnder1500cc
          : carDutyRates.exciseOver1500cc;
      carbonTax = engine * carDutyRates.carbonTaxRate * (age > 10 ? 1.5 : 1);
      const agePenalty = age > 5 ? Math.min((age - 5) * 2, 15) : 0;
      dutyRate += agePenalty;
    }

    const importDuty = valueMWK * (dutyRate / 100);
    const exciseTax = valueMWK * (exciseRate / 100);

    // VAT on (value + duty + excise)
    const taxableAmount = valueMWK + importDuty + exciseTax;
    const vat = taxableAmount * (customVatRate / 100);

    // AIT
    const ait = valueMWK * (taxRates.ait / 100);

    // Fixed fees
    const registrationFee = carDutyRates.registrationFee;
    const inspectionFee = carDutyRates.inspectionFee;
    const dif = taxRates.dif;
    const extra = taxRates.extra;

    const totalTaxes =
      importDuty +
      exciseTax +
      carbonTax +
      vat +
      ait +
      registrationFee +
      inspectionFee +
      dif +
      extra;
    const landedCost = valueMWK + totalTaxes;

    const carDetails: CarImportDetails = {
      vehicleType,
      engineSize: engine,
      vehicleAge: age,
      isSADC,
      dutyRate,
      exciseRate,
      registrationFee,
      inspectionFee,
      exciseTax,
      importDuty,
      carbonTax,
    };

    const newResult: CalculationResult = {
      valueMWK,
      vat,
      ait,
      dif,
      extra,
      totalTaxes,
      landedCost,
      usdInput: usdValue,
      rate,
      timestamp: new Date(),
      type: "car",
      details: carDetails,
    };

    setResult(newResult);
    addToHistory(newResult);
    setError("");
  };

  const calculateBulk = () => {
    if (!rate) {
      setError("Exchange rate is not loaded yet. Please wait or refresh the rate.");
      return;
    }

    const validItems = bulkItems.filter(
      (item) => item.name && item.usdPrice > 0
    );
    if (validItems.length === 0) {
      setError("Please add at least one valid item with a name and price");
      return;
    }

    let totalImportDuty = 0, totalExcise = 0, totalSurcharge = 0, totalVat = 0, totalAit = 0;
    let totalMWK = 0, totalUSD = 0;

    validItems.forEach(item => {
      const valueUSD = item.usdPrice;
      const valueMWK = valueUSD * rate;
      const cat = productCategories.find(c => c.id === item.categoryId) || productCategories[0];
      
      const itemImportDuty = valueMWK * (cat.importDuty / 100);
      const itemExcise = valueMWK * (cat.exciseTax / 100);
      const itemSurcharge = valueMWK * (cat.surcharge / 100);
      const itemTaxableAmount = valueMWK + itemImportDuty + itemExcise + itemSurcharge;
      const itemVat = itemTaxableAmount * (cat.vat / 100);
      const itemAit = valueMWK * (taxRates.ait / 100);

      totalUSD += valueUSD;
      totalMWK += valueMWK;
      totalImportDuty += itemImportDuty;
      totalExcise += itemExcise;
      totalSurcharge += itemSurcharge;
      totalVat += itemVat;
      totalAit += itemAit;
    });

    const dif = taxRates.dif * validItems.length;
    const extra = taxRates.extra;

    const totalTaxes = totalImportDuty + totalExcise + totalSurcharge + totalVat + totalAit + dif + extra;
    const landedCost = totalMWK + totalTaxes;

    const newResult: CalculationResult = {
      valueMWK: totalMWK,
      importDuty: totalImportDuty,
      exciseTax: totalExcise,
      surcharge: totalSurcharge,
      vat: totalVat,
      ait: totalAit,
      dif,
      extra,
      totalTaxes,
      landedCost,
      usdInput: totalUSD,
      rate,
      timestamp: new Date(),
      type: "general",
      categoryName: "Bulk Items"
    };

    setResult(newResult);
    addToHistory(newResult);
    setError("");
  };

  const addToHistory = (newResult: CalculationResult) => {
    const newHistory = [newResult, ...history].slice(0, 20); // Keep last 20
    setHistory(newHistory);
    saveToStorage("mra-history", newHistory);
  };

  const exportResults = () => {
    if (!result) return;

    let data = `MRA Import Tax Calculation
Date: ${result.timestamp.toLocaleString()}
Type: ${result.type === "car" ? "Vehicle Import" : "General Import"}
USD Amount: $${result.usdInput.toFixed(2)}
Exchange Rate: ${result.rate.toFixed(2)} MWK/USD

Item Value (MWK): ${result.valueMWK.toLocaleString()}`;

    if (result.type === "car" && result.details) {
      data += `
Vehicle Details:
Engine Size: ${result.details.engineSize}cc
Vehicle Age: ${result.details.vehicleAge} years
SADC Country: ${result.details.isSADC ? "Yes" : "No"}

Import Duty (${
        result.details.dutyRate
      }%): ${result.details.importDuty.toLocaleString()}
Excise Tax (${
        result.details.exciseRate
      }%): ${result.details.exciseTax.toLocaleString()}
Carbon Tax: ${result.details.carbonTax.toLocaleString()}
Registration Fee: ${result.details.registrationFee.toLocaleString()}
Inspection Fee: ${result.details.inspectionFee.toLocaleString()}`;
    }

    data += `
VAT (${taxRates.vat}%): ${result.vat.toLocaleString()}
AIT (${taxRates.ait}%): ${result.ait.toLocaleString()}
DIF (fixed): ${result.dif.toLocaleString()}
Extra Charge: ${result.extra.toLocaleString()}
Total Taxes: ${result.totalTaxes.toLocaleString()}
Landed Cost: ${result.landedCost.toLocaleString()}`;

    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mra-calculation-${result.type}-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const addBulkItem = () => {
    setBulkItems([...bulkItems, { id: Date.now(), name: "", usdPrice: 0, categoryId: "gen" }]);
  };

  const removeBulkItem = (id: number) => {
    setBulkItems(bulkItems.filter((item) => item.id !== id));
  };

  const updateBulkItem = (
    id: number,
    field: "name" | "usdPrice" | "categoryId",
    value: string | number
  ) => {
    setBulkItems(
      bulkItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const formatMWK = (amount: number) => {
    return `MWK ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
    })}`;
  };

  const getAnalytics = () => {
    const carImports = history.filter((h) => h.type === "car");
    const generalImports = history.filter((h) => h.type === "general");
    const totalValue = history.reduce((sum, h) => sum + h.landedCost, 0);
    const avgTaxRate =
      history.length > 0
        ? history.reduce(
            (sum, h) => sum + (h.totalTaxes / h.valueMWK) * 100,
            0
          ) / history.length
        : 0;

    return {
      totalCalculations: history.length,
      carImports: carImports.length,
      generalImports: generalImports.length,
      totalValue,
      avgTaxRate,
      sadcImports: carImports.filter((c) => c.details?.isSADC).length,
      nonSadcImports: carImports.filter((c) => !c.details?.isSADC).length,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  MRA Import Tax Calculator
                </h1>
                <p className="text-sm text-gray-600">
                  Comprehensive import duty calculator for Malawi
                </p>
              </div>
            </div>

            {/* Mode Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { mode: "general", icon: Package, label: "General" },
                { mode: "car", icon: Car, label: "Vehicle" },
                { mode: "compare", icon: BarChart3, label: "Compare" },
                { mode: "bulk", icon: FileText, label: "Bulk" },
              ].map(({ mode: m, icon: Icon, label }) => (
                <button
                  key={m}
                  onClick={() => setMode(m as CalculatorMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                    mode === m
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Calculator Area */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white shadow-xl rounded-2xl p-6">
              {/* Exchange Rate Display */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      Current USD→MWK rate:
                    </p>
                    <p className="text-xl font-bold text-blue-600">
                      {rate ? `${rate.toFixed(2)} MWK` : "Loading..."}
                    </p>
                    {lastUpdated && (
                      <p className="text-xs text-gray-500">
                        Updated: {lastUpdated.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={fetchRate}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`h-6 w-6 ${loading ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>
              </div>

              {/* Calculator Forms */}
              {mode === "general" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    General Import Calculator
                  </h2>
                  <div className="space-y-4">
                    <select
                      value={generalCategory}
                      onChange={(e) => setGeneralCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    >
                      {productCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        placeholder="Enter price in USD"
                        value={usdPrice}
                        onChange={(e) => setUsdPrice(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        step="0.01"
                      />
                    </div>
                    <button
                      onClick={calculateGeneral}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 font-semibold"
                    >
                      Calculate Import Costs
                    </button>
                  </div>
                </div>
              )}

              {mode === "car" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Vehicle Import Calculator
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        placeholder="Vehicle price in USD"
                        value={usdPrice}
                        onChange={(e) => setUsdPrice(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        step="0.01"
                      />
                    </div>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="Internal Combustion">Internal Combustion (Petrol/Diesel)</option>
                      <option value="Hybrid (Petrol/Electric)">Hybrid (Petrol/Electric)</option>
                      <option value="Hybrid (Diesel/Electric)">Hybrid (Diesel/Electric)</option>
                      <option value="Electric">Pure Electric (EV)</option>
                    </select>
                    {vehicleType !== "Electric" && (
                      <input
                        type="number"
                        placeholder="Engine size (cc)"
                        value={engineSize}
                        onChange={(e) => setEngineSize(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                      />
                    )}
                    <input
                      type="number"
                      placeholder="Vehicle age (years)"
                      value={vehicleAge}
                      onChange={(e) => setVehicleAge(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                    <select
                      value={countryOfOrigin}
                      onChange={(e) => {
                        setCountryOfOrigin(e.target.value);
                        setIsSADC(sadcCountries.includes(e.target.value));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Select country of origin</option>
                      {sadcCountries.map((country) => (
                        <option key={country} value={country}>
                          {country} (SADC)
                        </option>
                      ))}
                      <option value="Other">Other (Non-SADC)</option>
                    </select>
                  </div>

                  {countryOfOrigin && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <p className="text-sm font-medium text-blue-800">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        {isSADC ? "SADC Country" : "Non-SADC Country"} -
                        {isSADC
                          ? " Preferential duty rates apply"
                          : " Standard duty rates apply"}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={calculateCar}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 font-semibold"
                  >
                    Calculate Vehicle Import Costs
                  </button>
                </div>
              )}

              {mode === "bulk" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Bulk Import Calculator
                  </h2>
                  <div className="space-y-3 mb-4">
                    {bulkItems.map((item) => (
                      <div key={item.id} className="flex gap-3 items-center">
                        <input
                          type="text"
                          placeholder="Item name"
                          value={item.name}
                          onChange={(e) =>
                            updateBulkItem(item.id, "name", e.target.value)
                          }
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
                          <input
                            type="number"
                            placeholder="USD price"
                            value={item.usdPrice || ""}
                            onChange={(e) =>
                              updateBulkItem(
                                item.id,
                                "usdPrice",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-32 pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                            step="0.01"
                          />
                        </div>
                        <select
                          value={item.categoryId}
                          onChange={(e) =>
                            updateBulkItem(item.id, "categoryId", e.target.value)
                          }
                          className="w-48 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        >
                          {productCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        {bulkItems.length > 1 && (
                          <button
                            onClick={() => removeBulkItem(item.id)}
                            className="text-red-500 hover:text-red-700 px-2"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={addBulkItem}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
                    >
                      + Add Item
                    </button>
                    <button
                      onClick={calculateBulk}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 font-semibold"
                    >
                      Calculate Bulk Import
                    </button>
                  </div>
                </div>
              )}

              {mode === "compare" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    SADC vs Non-SADC Comparison
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Enter vehicle details to compare import costs from SADC vs
                    Non-SADC countries:
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        placeholder="Vehicle price in USD"
                        value={usdPrice}
                        onChange={(e) => setUsdPrice(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        step="0.01"
                      />
                    </div>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="Internal Combustion">Internal Combustion (Petrol/Diesel)</option>
                      <option value="Hybrid (Petrol/Electric)">Hybrid (Petrol/Electric)</option>
                      <option value="Hybrid (Diesel/Electric)">Hybrid (Diesel/Electric)</option>
                      <option value="Electric">Pure Electric (EV)</option>
                    </select>
                    {vehicleType !== "Electric" && (
                      <input
                        type="number"
                        placeholder="Engine size (cc)"
                        value={engineSize}
                        onChange={(e) => setEngineSize(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                      />
                    )}
                    <input
                      type="number"
                      placeholder="Vehicle age (years)"
                      value={vehicleAge}
                      onChange={(e) => setVehicleAge(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  {usdPrice && (vehicleType === "Electric" || engineSize) && vehicleAge && rate && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {[true, false].map((sadcStatus) => {
                        const engine = vehicleType === "Electric" ? 0 : parseFloat(engineSize);
                        const age = parseInt(vehicleAge);
                        const valueMWK = parseFloat(usdPrice) * rate;

                        let dutyRate = 0;
                        let exciseRate = 0;
                        let customVatRate = taxRates.vat;
                        let carbonTax = 0;

                        if (vehicleType === "Electric") {
                          dutyRate = 0;
                          exciseRate = 0;
                          customVatRate = 8;
                          carbonTax = 0;
                        } else if (vehicleType.startsWith("Hybrid")) {
                          dutyRate = 30; // Standard customs duty for hybrids
                          exciseRate = engine <= 1500 ? 17.5 : engine <= 2500 ? 10 : 20;
                          carbonTax = engine * carDutyRates.carbonTaxRate * (age > 10 ? 1.5 : 1);
                          const agePenalty = age > 5 ? Math.min((age - 5) * 2, 15) : 0;
                          dutyRate += agePenalty;
                        } else {
                          dutyRate = sadcStatus
                            ? engine <= 1000
                              ? carDutyRates.sadcUnder1000cc
                              : carDutyRates.sadcOver1000cc
                            : engine <= 1000
                            ? carDutyRates.nonSadcUnder1000cc
                            : carDutyRates.nonSadcOver1000cc;
                          exciseRate = engine <= 1500 ? carDutyRates.exciseUnder1500cc : carDutyRates.exciseOver1500cc;
                          carbonTax = engine * carDutyRates.carbonTaxRate * (age > 10 ? 1.5 : 1);
                          const agePenalty = age > 5 ? Math.min((age - 5) * 2, 15) : 0;
                          dutyRate += agePenalty;
                        }

                        const importDuty = valueMWK * (dutyRate / 100);
                        const exciseTax = valueMWK * (exciseRate / 100);
                        const taxableAmount = valueMWK + importDuty + exciseTax;
                        const vat = taxableAmount * (customVatRate / 100);
                        const ait = valueMWK * (taxRates.ait / 100);
                        const totalTaxes =
                          importDuty +
                          exciseTax +
                          carbonTax +
                          vat +
                          ait +
                          carDutyRates.registrationFee +
                          carDutyRates.inspectionFee +
                          taxRates.dif +
                          taxRates.extra;
                        const landedCost = valueMWK + totalTaxes;

                        return (
                          <div
                            key={sadcStatus ? "sadc" : "nonsadc"}
                            className={`p-4 rounded-lg border-2 ${
                              sadcStatus
                                ? "border-green-200 bg-green-50"
                                : "border-red-200 bg-red-50"
                            }`}
                          >
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <Globe className="h-5 w-5" />
                              {sadcStatus ? "SADC Country" : "Non-SADC Country"}
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Import Duty ({dutyRate}%):</span>
                                <span className="font-medium">
                                  {formatMWK(importDuty)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total Landed Cost:</span>
                                <span className="font-bold text-lg">
                                  {formatMWK(landedCost)}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs text-gray-600">
                                <span>
                                  Savings vs {sadcStatus ? "Non-SADC" : "SADC"}:
                                </span>
                                <span
                                  className={
                                    sadcStatus
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  {sadcStatus ? "Lower cost" : "Higher cost"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mt-4">
                  {error}
                </div>
              )}

              {/* Results Display */}
              {result && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {result.type === "car"
                        ? "Vehicle Import"
                        : "General Import"}{" "}
                      Results
                    </h3>
                    <button
                      onClick={exportResults}
                      className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2"
                      title="Export results"
                    >
                      <Download className="h-5 w-5" />
                      Export
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Item Value</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {formatMWK(result.valueMWK)}
                        </p>
                      </div>

                      {result.type === "car" && result.details && (
                        <>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600">
                              Import Duty ({result.details.dutyRate}%)
                            </p>
                            <p className="font-semibold text-blue-600">
                              {formatMWK(result.details.importDuty)}
                            </p>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600">
                              Excise Tax ({result.details.exciseRate}%)
                            </p>
                            <p className="font-semibold text-orange-600">
                              {formatMWK(result.details.exciseTax)}
                            </p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600">Carbon Tax</p>
                            <p className="font-semibold text-purple-600">
                              {formatMWK(result.details.carbonTax)}
                            </p>
                          </div>
                        </>
                      )}

                      {result.type === "general" && result.importDuty !== undefined && (
                        <>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600">Import Duty</p>
                            <p className="font-semibold text-blue-600">{formatMWK(result.importDuty)}</p>
                          </div>
                          {result.exciseTax !== undefined && result.exciseTax > 0 && (
                            <div className="bg-orange-50 rounded-lg p-3">
                              <p className="text-xs text-gray-600">Excise Tax</p>
                              <p className="font-semibold text-orange-600">{formatMWK(result.exciseTax)}</p>
                            </div>
                          )}
                          {result.surcharge !== undefined && result.surcharge > 0 && (
                            <div className="bg-pink-50 rounded-lg p-3">
                              <p className="text-xs text-gray-600">Surcharge</p>
                              <p className="font-semibold text-pink-600">{formatMWK(result.surcharge)}</p>
                            </div>
                          )}
                        </>
                      )}

                      <div className="bg-red-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">
                          VAT
                        </p>
                        <p className="font-semibold text-red-600">
                          {formatMWK(result.vat)}
                        </p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">
                          AIT ({taxRates.ait}%)
                        </p>
                        <p className="font-semibold text-yellow-600">
                          {formatMWK(result.ait)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {result.type === "car" && result.details && (
                        <>
                          <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600">
                              Registration Fee
                            </p>
                            <p className="font-semibold text-green-600">
                              {formatMWK(result.details.registrationFee)}
                            </p>
                          </div>
                          <div className="bg-indigo-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600">
                              Inspection Fee
                            </p>
                            <p className="font-semibold text-indigo-600">
                              {formatMWK(result.details.inspectionFee)}
                            </p>
                          </div>
                        </>
                      )}

                      <div className="bg-pink-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">DIF (fixed)</p>
                        <p className="font-semibold text-pink-600">
                          {formatMWK(result.dif)}
                        </p>
                      </div>
                      <div className="bg-teal-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Extra Charge</p>
                        <p className="font-semibold text-teal-600">
                          {formatMWK(result.extra)}
                        </p>
                      </div>

                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Total Taxes</p>
                        <p className="text-lg font-bold text-gray-800">
                          {formatMWK(result.totalTaxes)}
                        </p>
                      </div>

                      <div className="bg-green-100 rounded-lg p-4 border-2 border-green-200">
                        <p className="text-sm text-gray-600">
                          Final Landed Cost
                        </p>
                        <p className="text-2xl font-bold text-green-700">
                          {formatMWK(result.landedCost)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Tax percentage:{" "}
                          {(
                            (result.totalTaxes / result.valueMWK) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                    </div>
                  </div>

                  {result.type === "car" && result.details && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">
                        Vehicle Import Summary
                      </h4>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Type / Engine:</span>
                          <span className="ml-2 font-medium">
                            {result.details.vehicleType}
                            {result.details.vehicleType !== "Electric" ? ` (${result.details.engineSize}cc)` : ""}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Vehicle Age:</span>
                          <span className="ml-2 font-medium">
                            {result.details.vehicleAge} years
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Origin:</span>
                          <span
                            className={`ml-2 font-medium ${
                              result.details.isSADC
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {result.details.isSADC ? "SADC" : "Non-SADC"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              {/* Tab Navigation */}
              <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                <div className="flex bg-gray-50">
                  {[
                    { tab: "calculator", icon: Calculator, label: "Tools" },
                    { tab: "history", icon: History, label: "History" },
                    { tab: "analytics", icon: BarChart3, label: "Analytics" },
                  ].map(({ tab, icon: Icon, label }) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as typeof activeTab)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-all ${
                        activeTab === tab
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {activeTab === "calculator" && (
                    <div className="space-y-4">
                      <div>
                        <button
                          onClick={() => setShowSettings(!showSettings)}
                          className="w-full flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          Tax Rate Settings
                        </button>
                      </div>

                      {showSettings && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <h4 className="font-semibold text-gray-800">
                            General Tax Rates
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                VAT (%)
                              </label>
                              <input
                                type="number"
                                value={taxRates.vat}
                                onChange={(e) =>
                                  setTaxRates({
                                    ...taxRates,
                                    vat: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-400"
                                step="0.1"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                AIT (%)
                              </label>
                              <input
                                type="number"
                                value={taxRates.ait}
                                onChange={(e) =>
                                  setTaxRates({
                                    ...taxRates,
                                    ait: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-400"
                                step="0.1"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                DIF (MWK)
                              </label>
                              <input
                                type="number"
                                value={taxRates.dif}
                                onChange={(e) =>
                                  setTaxRates({
                                    ...taxRates,
                                    dif: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-400"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Extra (MWK)
                              </label>
                              <input
                                type="number"
                                value={taxRates.extra}
                                onChange={(e) =>
                                  setTaxRates({
                                    ...taxRates,
                                    extra: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-400"
                              />
                            </div>
                          </div>

                          <h4 className="font-semibold text-gray-800 mt-4">
                            Vehicle Import Rates
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-gray-700">
                                  SADC &lt;1000cc (%)
                                </label>
                                <input
                                  type="number"
                                  value={carDutyRates.sadcUnder1000cc}
                                  onChange={(e) =>
                                    setCarDutyRates({
                                      ...carDutyRates,
                                      sadcUnder1000cc:
                                        parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="w-full px-2 py-1 border border-gray-300 rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700">
                                  SADC &gt;1000cc (%)
                                </label>
                                <input
                                  type="number"
                                  value={carDutyRates.sadcOver1000cc}
                                  onChange={(e) =>
                                    setCarDutyRates({
                                      ...carDutyRates,
                                      sadcOver1000cc:
                                        parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="w-full px-2 py-1 border border-gray-300 rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700">
                                  Non-SADC &lt;1000cc (%)
                                </label>
                                <input
                                  type="number"
                                  value={carDutyRates.nonSadcUnder1000cc}
                                  onChange={(e) =>
                                    setCarDutyRates({
                                      ...carDutyRates,
                                      nonSadcUnder1000cc:
                                        parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="w-full px-2 py-1 border border-gray-300 rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700">
                                  Non-SADC &gt;1000cc (%)
                                </label>
                                <input
                                  type="number"
                                  value={carDutyRates.nonSadcOver1000cc}
                                  onChange={(e) =>
                                    setCarDutyRates({
                                      ...carDutyRates,
                                      nonSadcOver1000cc:
                                        parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="w-full px-2 py-1 border border-gray-300 rounded"
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              saveToStorage("mra-rates", taxRates);
                              saveToStorage("mra-car-rates", carDutyRates);
                              setShowSettings(false);
                            }}
                            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Save All Settings
                          </button>
                        </div>
                      )}

                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">
                          SADC Benefits
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Lower import duty rates</li>
                          <li>• Reduced compliance costs</li>
                          <li>• Preferential treatment</li>
                          <li>• Trade facilitation measures</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === "history" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-800">
                          Recent Calculations
                        </h3>
                        {history.length > 0 && (
                          <button
                            onClick={() => {
                              setHistory([]);
                              saveToStorage("mra-history", []);
                            }}
                            className="text-red-500 hover:text-red-700 text-xs transition-colors"
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      {history.length === 0 ? (
                        <p className="text-gray-500 text-center py-8 text-sm">
                          No calculations yet
                        </p>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {history.map((calc, index) => (
                            <div
                              key={index}
                              className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  {calc.type === "car" ? (
                                    <Car className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Package className="h-4 w-4 text-blue-600" />
                                  )}
                                  <p className="font-semibold text-sm">
                                    ${calc.usdInput.toFixed(2)} {calc.categoryName ? `(${calc.categoryName})` : ""}
                                  </p>
                                </div>
                                <p className="text-xs text-gray-500">
                                  {calc.timestamp.toLocaleDateString()}
                                </p>
                              </div>
                              {calc.type === "car" && calc.details && (
                                <p className="text-xs text-gray-600 mb-1">
                                  {calc.details.vehicleType === "Electric" ? "Pure EV" : `${calc.details.engineSize}cc`},{" "}
                                  {calc.details.vehicleAge}y,{" "}
                                  {calc.details.isSADC ? "SADC" : "Non-SADC"}
                                </p>
                              )}
                              <p className="text-xs text-gray-600">
                                Rate: {calc.rate.toFixed(2)} MWK/USD
                              </p>
                              <p className="text-sm font-semibold text-green-600">
                                Total: {formatMWK(calc.landedCost)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "analytics" && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-800">
                        Import Analytics
                      </h3>
                      {(() => {
                        const analytics = getAnalytics();
                        return (
                          <div className="space-y-3">
                            <div className="bg-blue-50 rounded-lg p-3">
                              <p className="text-xs text-gray-600">
                                Total Calculations
                              </p>
                              <p className="text-lg font-bold text-blue-600">
                                {analytics.totalCalculations}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-green-50 rounded-lg p-3">
                                <p className="text-xs text-gray-600">
                                  Vehicle Imports
                                </p>
                                <p className="font-bold text-green-600">
                                  {analytics.carImports}
                                </p>
                              </div>
                              <div className="bg-purple-50 rounded-lg p-3">
                                <p className="text-xs text-gray-600">
                                  General Imports
                                </p>
                                <p className="font-bold text-purple-600">
                                  {analytics.generalImports}
                                </p>
                              </div>
                            </div>

                            {analytics.carImports > 0 && (
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-emerald-50 rounded-lg p-3">
                                  <p className="text-xs text-gray-600">
                                    SADC Vehicles
                                  </p>
                                  <p className="font-bold text-emerald-600">
                                    {analytics.sadcImports}
                                  </p>
                                </div>
                                <div className="bg-red-50 rounded-lg p-3">
                                  <p className="text-xs text-gray-600">
                                    Non-SADC Vehicles
                                  </p>
                                  <p className="font-bold text-red-600">
                                    {analytics.nonSadcImports}
                                  </p>
                                </div>
                              </div>
                            )}

                            {analytics.totalCalculations > 0 && (
                              <>
                                <div className="bg-yellow-50 rounded-lg p-3">
                                  <p className="text-xs text-gray-600">
                                    Total Import Value
                                  </p>
                                  <p className="text-sm font-bold text-yellow-700">
                                    {formatMWK(analytics.totalValue)}
                                  </p>
                                </div>

                                <div className="bg-orange-50 rounded-lg p-3">
                                  <p className="text-xs text-gray-600">
                                    Avg Tax Rate
                                  </p>
                                  <p className="font-bold text-orange-600">
                                    {analytics.avgTaxRate.toFixed(1)}%
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
