from typing import List, Dict, Any

AGRICULTURAL_RESOURCES_DATA: List[Dict[str, Any]] = [
    {
        "id": 1,
        "title": "Krishi Vigyan Kendra (KVK), Yashwantrao Chavan Open University",
        "category": "Krishi Vigyan Kendra",
        "state": "Maharashtra",
        "district": "Nashik",
        "phone": "0253-2231714 / 0253-2231715",
        "email": "kvknashik@gmail.com",
        "address": "Dnyangangotri, Near Gangapur Dam, Nashik - 422222",
        "website": "https://kvk.icar.gov.in",
        "description": "On-farm testing, frontline demonstrations, farmer soil health testing, and crop protection advisories.",
        "distance_km": 8.4
    },
    {
        "id": 2,
        "title": "Kisan Call Center (All India Toll-Free)",
        "category": "Helpline",
        "state": "National",
        "district": "All Districts",
        "phone": "1800-180-1551",
        "email": "agri-callcenter@nic.in",
        "address": "Department of Agriculture and Farmers Welfare, New Delhi",
        "website": "https://dacc.gov.in",
        "description": "24x7 free voice advisory service in Marathi, Hindi, and regional languages answering farmer queries.",
        "distance_km": 0.0
    },
    {
        "id": 3,
        "title": "Mahatma Phule Krishi Vidyapeeth (MPKV)",
        "category": "Agricultural University",
        "state": "Maharashtra",
        "district": "Ahmednagar / Nashik",
        "phone": "02426-243208",
        "email": "registrar.mpkv@gov.in",
        "address": "Rahuri, Ahmednagar District, Maharashtra - 413722",
        "website": "https://mpkv.ac.in",
        "description": "Premier state agricultural research university specializing in sugarcane, onion, pomegranate, and vegetable crops.",
        "distance_km": 72.0
    },
    {
        "id": 4,
        "title": "District Soil and Water Testing Laboratory, Nashik",
        "category": "Soil Testing",
        "state": "Maharashtra",
        "district": "Nashik",
        "phone": "0253-2574421",
        "email": "soillab.nashik@maharashtra.gov.in",
        "address": "Department of Agriculture Complex, Trimbak Road, Nashik",
        "website": "https://soilhealth.dac.gov.in",
        "description": "Issues official Soil Health Cards (SHC) with detailed NPK, micro-nutrients, EC, and pH testing.",
        "distance_km": 6.2
    },
    {
        "id": 5,
        "title": "ICAR - Central Soil Salinity Research Institute (CSSRI)",
        "category": "Research Institute",
        "state": "Haryana",
        "district": "Karnal",
        "phone": "0184-2290501",
        "email": "director.cssri@icar.gov.in",
        "address": "Zarifa Farm, Kachhwa Road, Karnal - 132001",
        "website": "https://cssri.icar.gov.in",
        "description": "Pioneering saline and alkaline soil management, wheat salinity tolerance, and canal water conservation.",
        "distance_km": 12.5
    },
    {
        "id": 6,
        "title": "MahaDBT Farmer Welfare & Scheme Portal",
        "category": "Government Schemes",
        "state": "Maharashtra",
        "district": "Statewide",
        "phone": "022-49150800",
        "email": "helpdesk@mahadbtmahait.gov.in",
        "address": "Government of Maharashtra Agriculture Department",
        "website": "https://mahadbt.maharashtra.gov.in",
        "description": "Direct benefit transfer for drip irrigation, farm ponds (Shet Tale), tractors, and power tillers.",
        "distance_km": 0.0
    }
]

MANDI_SPOT_RATES_DATA: List[Dict[str, Any]] = [
    {
        "id": 1,
        "market_name": "Nashik APMC (Panchavati Yard)",
        "state": "Maharashtra",
        "district": "Nashik",
        "commodity": "Tomato (टोमॅटो)",
        "variety": "Hybrid Red (Abhinav / US-1506)",
        "min_price": 1400.0,
        "max_price": 2250.0,
        "modal_price": 1850.0,
        "change_pct": 4.5,
        "trend": "up",
        "arrival_quintals": 1850,
        "optimal_window": "Strong export demand to Delhi and Gujarat; hold for peak evening bidding."
    },
    {
        "id": 2,
        "market_name": "Karnal APMC Yard",
        "state": "Haryana",
        "district": "Karnal",
        "commodity": "Wheat (गेहूं)",
        "variety": "HD-2967 (Sharbati)",
        "min_price": 2350.0,
        "max_price": 2510.0,
        "modal_price": 2425.0,
        "change_pct": 2.8,
        "trend": "up",
        "arrival_quintals": 1420,
        "optimal_window": "Optimal window: Sell within 72 hrs. Regional supply surges by Friday."
    },
    {
        "id": 3,
        "market_name": "Lasalgaon APMC",
        "state": "Maharashtra",
        "district": "Nashik",
        "commodity": "Onion (कांदा)",
        "variety": "Garva Red (गावरान लाल)",
        "min_price": 1650.0,
        "max_price": 2800.0,
        "modal_price": 2350.0,
        "change_pct": 3.1,
        "trend": "up",
        "arrival_quintals": 3200,
        "optimal_window": "Asia's largest onion market: Quality dry bulbs fetching premium above ₹2,600/qtl."
    },
    {
        "id": 4,
        "market_name": "Karnal APMC Yard",
        "state": "Haryana",
        "district": "Karnal",
        "commodity": "Mustard (सरसों)",
        "variety": "Oil 42% High Density",
        "min_price": 5200.0,
        "max_price": 5600.0,
        "modal_price": 5450.0,
        "change_pct": 1.2,
        "trend": "up",
        "arrival_quintals": 640,
        "optimal_window": "Firm crushing demand from edible oil mills."
    }
]

class ResourcesService:
    def get_nearby_resources(self, state: str = "Maharashtra", district: str = "Nashik", category: str = None) -> List[Dict[str, Any]]:
        results = []
        for r in AGRICULTURAL_RESOURCES_DATA:
            if category and r["category"].lower() != category.lower():
                continue
            results.append(r)
        return results

    def get_mandi_prices(self, district: str = None) -> List[Dict[str, Any]]:
        return MANDI_SPOT_RATES_DATA

resources_service = ResourcesService()
