/*
 * Omniscience Intel - seed dataset.
 * Real, geolocated top stories captured 2026-05-29, plus the seed interest
 * profile. Bundled so the app works fully offline / with no API key.
 * Live refresh (when configured) is layered on top via /api/news.
 * Tags are kept specific (subject-level) so SUPPRESS blocks a real topic,
 * not a broad umbrella; category-level muting is handled by the filter chips.
 */
window.OMNI_SEED = {
  generated_at: "2026-05-29",
  interests: [
    "quant finance", "markets", "finance", "trading", "hedge funds",
    "investment banks", "macro economics", "monetary policy", "central banks",
    "artificial intelligence", "machine learning", "big tech", "technology",
    "semiconductors", "cybersecurity", "startups", "venture capital",
    "tech founders", "physics", "particle physics", "quantum computing",
    "mathematics", "space", "spaceflight", "science", "scientific research",
    "geopolitics", "national security", "defense", "energy", "health",
    "UK politics", "elections", "powerlifting", "strength sport", "chess"
  ],
  stories: [
    {
      id: "s01", title: "US strikes Iran again as ceasefire talks continue",
      summary: "US forces hit Iranian boats and missile launch sites while envoys negotiate to end the three-month war.",
      detailed_intel: "The US says it struck Iran again even as peace talks press on to end the conflict. Targets included Iranian fast boats and missile launch sites. Crude oil rose on the escalation; a deal would formally end the three-month war.",
      category: "geopolitics", source: "NPR / Al Jazeera", location_name: "Tehran, Iran",
      lat: 35.6892, lng: 51.389, priority: "critical",
      tags: ["Iran", "US strikes", "oil", "Hormuz"], published_date: "2026-05-28"
    },
    {
      id: "s02", title: "Israel intensifies strikes on Hezbollah; Tyre surveys destruction",
      summary: "Residents of Lebanon's historic city of Tyre survey widespread damage after Israeli strikes.",
      detailed_intel: "Fighting with Hezbollah has intensified despite a ceasefire announced in April. Tyre saw widespread destruction on 28 May. Israel says it will further intensify attacks in Lebanon.",
      category: "geopolitics", source: "Al Jazeera", location_name: "Tyre, Lebanon",
      lat: 33.2705, lng: 35.1944, priority: "critical",
      tags: ["Lebanon", "Hezbollah", "Israel", "Tyre"], published_date: "2026-05-28"
    },
    {
      id: "s03", title: "Israeli army expands Gaza control past 'Yellow Line'",
      summary: "Israel has expanded control of Gaza by 11% beyond the Yellow Line, past ceasefire terms.",
      detailed_intel: "The Israeli army has extended its control of Gaza by 11 percent over the agreed Yellow Line, beyond the terms of the ceasefire. The move raises tension around the truce.",
      category: "geopolitics", source: "Al Jazeera", location_name: "Gaza City",
      lat: 31.5017, lng: 34.4668, priority: "high",
      tags: ["Gaza", "Israel", "ceasefire"], published_date: "2026-05-28"
    },
    {
      id: "s04", title: "Iran restores internet after monthslong shutdown",
      summary: "Iranians regain limited internet access; service is slow and YouTube and Instagram stay restricted.",
      detailed_intel: "Authorities ended a monthslong internet shutdown. Users report slow, spotty service in some areas, with apps such as YouTube and Instagram heavily restricted.",
      category: "geopolitics", source: "NPR", location_name: "Tehran, Iran",
      lat: 35.7219, lng: 51.3347, priority: "medium",
      tags: ["Iran", "internet", "censorship"], published_date: "2026-05-28"
    },
    {
      id: "s05", title: "Fed holds rates at 3.50-3.75% as PCE cools",
      summary: "Markets flat after April PCE came in below expectations; GDP estimate revised down.",
      detailed_intel: "Core PCE was 0.2% vs 0.3% consensus and headline 0.4% vs 0.5%. The Fed has held the target range at 3.50-3.75% across its first three 2026 meetings. CME FedWatch shows about 70% odds of a hike by year-end, heaviest on one quarter-point move.",
      category: "markets", source: "Schwab / Morningstar", location_name: "Federal Reserve, Washington DC",
      lat: 38.8921, lng: -77.0455, priority: "high",
      tags: ["Fed", "interest rates", "PCE", "inflation"], published_date: "2026-05-28"
    },
    {
      id: "s06", title: "Kevin Warsh sworn in as Fed chair; bond traders bet on hike",
      summary: "Traders bet Warsh's first move is a rate rise, not the cut Trump has demanded.",
      detailed_intel: "President Trump swore in Kevin Warsh as Fed chair. Bond markets are positioning for a hike rather than a cut. The committee is visibly divided between members eyeing cuts and those wary of persistent inflation.",
      category: "markets", source: "CNBC", location_name: "Washington DC",
      lat: 38.887, lng: -77.0047, priority: "high",
      tags: ["Fed", "Warsh", "interest rates", "bonds"], published_date: "2026-05-22"
    },
    {
      id: "s07", title: "Crude jumps as US-Iran strikes rattle Hormuz",
      summary: "Tit-for-tat US and Iran strikes sent crude oil higher.",
      detailed_intel: "Energy markets reacted to escalation around the Strait of Hormuz, a chokepoint for global oil flows. The strikes lifted crude and briefly pressured equities before they clawed back.",
      category: "markets", source: "Schwab", location_name: "Strait of Hormuz",
      lat: 26.5667, lng: 56.25, priority: "high",
      tags: ["oil", "Hormuz", "energy", "commodities"], published_date: "2026-05-28"
    },
    {
      id: "s08", title: "Dimon issues vague credit recession warning",
      summary: "JPMorgan's Jamie Dimon flags credit risk, but the bond market has more pressing issues.",
      detailed_intel: "Jamie Dimon issued a vague credit recession warning. Analysts note the bond market's nearer-term concerns center on Fed leadership and the rate path under Warsh.",
      category: "markets", source: "CNBC", location_name: "New York, USA",
      lat: 40.7557, lng: -73.9787, priority: "medium",
      tags: ["JPMorgan", "Dimon", "credit", "banks"], published_date: "2026-05-02"
    },
    {
      id: "s09", title: "Google I/O 2026: Gemini becomes a cross-platform agent",
      summary: "Gemini reframed as an AI that acts and automates across Search, Android, Chrome, Workspace and YouTube.",
      detailed_intel: "At Google I/O 2026, Google unveiled Gemini as a cross-platform intelligence layer that can act and automate tasks across its ecosystem, spanning Search, Android, Chrome, Workspace and YouTube.",
      category: "technology", source: "Google I/O", location_name: "Mountain View, CA",
      lat: 37.422, lng: -122.0841, priority: "high",
      tags: ["Google", "Gemini", "AI agents", "big tech"], published_date: "2026-05-20"
    },
    {
      id: "s10", title: "Apple to allow third-party AI in iOS 27",
      summary: "Users could pick Google or Anthropic to power Apple Intelligence via 'Extensions'.",
      detailed_intel: "Apple is reportedly preparing a platform shift letting users select third-party AI providers such as Google and Anthropic across iOS 27, iPadOS 27 and macOS 27. The capability is internally called Extensions.",
      category: "technology", source: "AI News", location_name: "Cupertino, CA",
      lat: 37.3349, lng: -122.009, priority: "high",
      tags: ["Apple", "AI", "iOS", "Anthropic"], published_date: "2026-05-18"
    },
    {
      id: "s11", title: "Anthropic and Gates Foundation launch $200M AI partnership",
      summary: "Four-year effort to build AI tools for health, education and agriculture in underserved regions.",
      detailed_intel: "Anthropic and the Gates Foundation announced a $200 million, four-year partnership to develop AI tools for healthcare, education, agriculture and economic development in underserved regions.",
      category: "technology", source: "AI News", location_name: "San Francisco, CA",
      lat: 37.7749, lng: -122.4194, priority: "medium",
      tags: ["Anthropic", "Gates Foundation", "AI", "global health"], published_date: "2026-05-15"
    },
    {
      id: "s12", title: "US pushes pre-release testing of AI models",
      summary: "Microsoft and xAI agree to give regulators early access to frontier models.",
      detailed_intel: "Washington is pressing AI firms to allow testing of models before public release. Microsoft and xAI have reportedly agreed to provide regulators early access, a notable shift in US AI oversight.",
      category: "technology", source: "AI News", location_name: "Washington DC",
      lat: 38.8977, lng: -77.0365, priority: "high",
      tags: ["AI regulation", "Microsoft", "xAI", "policy"], published_date: "2026-05-12"
    },
    {
      id: "s13", title: "Snap and Perplexity end $400M AI deal",
      summary: "The previously announced partnership was scrapped before broad rollout.",
      detailed_intel: "Snap and Perplexity ended their previously announced $400 million AI partnership before a broad rollout occurred, a sign of a tougher phase for AI commercial deals.",
      category: "technology", source: "AI News", location_name: "Santa Monica, CA",
      lat: 34.0089, lng: -118.4973, priority: "low",
      tags: ["Snap", "Perplexity", "AI deals", "startups"], published_date: "2026-05-10"
    },
    {
      id: "s14", title: "Blue Origin New Glenn explodes in prelaunch test",
      summary: "The fourth New Glenn blew up during a prelaunch engine test, a setback for NASA's moon plans.",
      detailed_intel: "Blue Origin's fourth New Glenn rocket exploded during a prelaunch engine test on the night of 28 May. The failure could set back the company and NASA's lunar ambitions.",
      category: "science", source: "Space.com", location_name: "Cape Canaveral, FL",
      lat: 28.4922, lng: -80.568, priority: "high",
      tags: ["Blue Origin", "New Glenn", "rockets", "NASA"], published_date: "2026-05-28"
    },
    {
      id: "s15", title: "CERN sees strongest hints yet of physics beyond Standard Model",
      summary: "LHC data may point to new physics past the Standard Model.",
      detailed_intel: "Scientists at CERN's Large Hadron Collider may be seeing the strongest hints yet of physics beyond the Standard Model. If confirmed, it would be a landmark in particle physics.",
      category: "science", source: "Scientific American", location_name: "CERN, Geneva",
      lat: 46.2339, lng: 6.0557, priority: "high",
      tags: ["CERN", "particle physics", "LHC", "Standard Model"], published_date: "2026-05-25"
    },
    {
      id: "s16", title: "JWST finds a black hole older than its galaxy",
      summary: "Webb spots a supermassive black hole that seems to predate its host galaxy.",
      detailed_intel: "Astronomers using JWST found a black hole that appears to have formed before its galaxy did. It adds to a pattern of early-universe black holes far more massive than models predict.",
      category: "science", source: "Universe Today", location_name: "STScI, Baltimore",
      lat: 39.3299, lng: -76.6205, priority: "medium",
      tags: ["JWST", "black holes", "astronomy", "cosmology"], published_date: "2026-05-24"
    },
    {
      id: "s17", title: "Pentagon releases second batch of UAP footage",
      summary: "Newly declassified photos and videos show unexplained flying objects.",
      detailed_intel: "On 22 May 2026 the Pentagon released a second batch of previously classified photos and videos showing what appear to be unexplained aerial phenomena.",
      category: "science", source: "SciTechDaily", location_name: "The Pentagon, Arlington VA",
      lat: 38.8719, lng: -77.0563, priority: "medium",
      tags: ["UAP", "Pentagon", "declassified"], published_date: "2026-05-22"
    },
    {
      id: "s18", title: "NASA Psyche slingshots past Mars toward metal asteroid",
      summary: "Psyche used Mars gravity to continue toward a metal-rich asteroid.",
      detailed_intel: "NASA's Psyche spacecraft used Mars as a gravitational slingshot to continue its journey toward a strange metal-rich asteroid.",
      category: "science", source: "phys.org", location_name: "NASA JPL, Pasadena",
      lat: 34.2013, lng: -118.1714, priority: "medium",
      tags: ["NASA", "Psyche", "asteroid", "Mars"], published_date: "2026-05-23"
    },
    {
      id: "s19", title: "Ebola outbreak centers on Congo gold-mining town",
      summary: "Mongbwalu, a town of 130,000 in Ituri province, is the epicenter of a new Ebola outbreak.",
      detailed_intel: "The epicenter of the Ebola outbreak is Mongbwalu, a poor gold-mining town of 130,000 in Ituri province, eastern DR Congo.",
      category: "science", source: "NPR", location_name: "Mongbwalu, DR Congo",
      lat: 1.95, lng: 30.03, priority: "high",
      tags: ["Ebola", "DR Congo", "outbreak", "public health"], published_date: "2026-05-28"
    },
    {
      id: "s20", title: "Chinese chipmaker targets TSMC and Intel parity by 2031",
      summary: "A Chinese firm unveiled a chip approach it says could match TSMC and Intel within five years.",
      detailed_intel: "A Chinese technology company revealed a new chip approach it claims could let it match TSMC and Intel by 2031, as China's supply chain rides a data-center buildout that is sparking shortages and price hikes.",
      category: "technology", source: "Nikkei Asia", location_name: "Beijing, China",
      lat: 39.9042, lng: 116.4074, priority: "high",
      tags: ["China", "semiconductors", "TSMC", "chips"], published_date: "2026-05-27"
    },
    {
      id: "s21", title: "China 2026 growth seen slowing to 4.4% as tariffs bite",
      summary: "Export momentum fades under US tariffs and a high base, cooling China's growth from 5%.",
      detailed_intel: "China's economy is projected to grow 4.4% in 2026, down from 5% in 2025, as export momentum fades under the weight of US import tariffs and a high comparison base.",
      category: "markets", source: "South China Morning Post", location_name: "Shanghai, China",
      lat: 31.2304, lng: 121.4737, priority: "medium",
      tags: ["China", "GDP", "tariffs", "trade"], published_date: "2026-05-26"
    },
    {
      id: "s22", title: "AI capex lifts Korea, Taiwan and Japan chip supply chains",
      summary: "Data-center buildout drives a late-May surge in Asian semiconductor demand.",
      detailed_intel: "Strong AI capital expenditure is lifting Korea, Taiwan and Japan, with a data-center buildout sparking component shortages and price hikes across the regional chip supply chain.",
      category: "technology", source: "Nikkei Asia", location_name: "Taipei, Taiwan",
      lat: 25.033, lng: 121.5654, priority: "high",
      tags: ["semiconductors", "Taiwan", "AI capex", "data centers"], published_date: "2026-05-27"
    },
    {
      id: "s23", title: "Japan passes record fiscal 2026 budget",
      summary: "A record budget backs private investment amid labour shortages.",
      detailed_intel: "Japan is set to receive support from a record-high fiscal 2026 budget, alongside private investment driven by machinery-order backlogs and equipment spending to offset labour shortages.",
      category: "markets", source: "Nikkei Asia", location_name: "Tokyo, Japan",
      lat: 35.6895, lng: 139.6917, priority: "medium",
      tags: ["Japan", "budget", "fiscal", "investment"], published_date: "2026-05-25"
    },
    {
      id: "s24", title: "UK local elections trigger Labour leadership crisis",
      summary: "A poor May showing exposes fragile factional balance inside Labour.",
      detailed_intel: "Labour's weak performance in the May local elections has triggered a leadership crisis, exposing the fragile balance between the party's internal factions.",
      category: "geopolitics", source: "ECFR", location_name: "London, UK",
      lat: 51.5074, lng: -0.1278, priority: "high",
      tags: ["UK", "Labour", "elections", "Westminster"], published_date: "2026-05-24"
    },
    {
      id: "s25", title: "France: Lecornu government collapses",
      summary: "PM Sebastien Lecornu's government falls under pressure from left and right.",
      detailed_intel: "Prime Minister Sebastien Lecornu's government has collapsed under pressure from both the left and the right, deepening France's political instability.",
      category: "geopolitics", source: "Euronews", location_name: "Paris, France",
      lat: 48.8566, lng: 2.3522, priority: "high",
      tags: ["France", "Lecornu", "government", "politics"], published_date: "2026-05-23"
    },
    {
      id: "s26", title: "AfD wins outright majority in Saxony-Anhalt",
      summary: "The far-right AfD secures a state majority, raising pressure on Berlin.",
      detailed_intel: "Support for the Alternative for Germany surged across state elections, with the AfD winning an outright majority in Saxony-Anhalt and intensifying pressure on the federal government.",
      category: "geopolitics", source: "SFG Media", location_name: "Magdeburg, Germany",
      lat: 52.1205, lng: 11.6276, priority: "high",
      tags: ["Germany", "AfD", "elections", "far-right"], published_date: "2026-05-22"
    },
    {
      id: "s27", title: "German economy posts weak recovery amid structural strain",
      summary: "Merz government struggles to push reforms through ideological divides.",
      detailed_intel: "Germany's economy is posting only a weak recovery that does little to resolve structural problems, as Chancellor Friedrich Merz's government struggles with internal divisions.",
      category: "markets", source: "SFG Media", location_name: "Frankfurt, Germany",
      lat: 50.1109, lng: 8.6821, priority: "medium",
      tags: ["Germany", "economy", "Merz", "reforms"], published_date: "2026-05-21"
    },
    {
      id: "s28", title: "BRICS foreign ministers meet in New Delhi",
      summary: "Ministers warn of instability from conflicts, trade and tech competition.",
      detailed_intel: "Foreign ministers of BRICS nations met in New Delhi; India's S. Jaishankar said the international system faces significant instability from conflicts, trade disruptions, technological competition and climate challenges.",
      category: "geopolitics", source: "Al Jazeera", location_name: "New Delhi, India",
      lat: 28.6139, lng: 77.209, priority: "high",
      tags: ["BRICS", "India", "diplomacy", "Jaishankar"], published_date: "2026-05-26"
    },
    {
      id: "s29", title: "Deadly storms kill more than 20 in Bihar, India",
      summary: "Storms, heavy rain and lightning strike across the Indian state of Bihar.",
      detailed_intel: "More than twenty people were killed by storms, heavy rainfall and lightning strikes across Bihar, India.",
      category: "science", source: "Al Jazeera", location_name: "Patna, Bihar, India",
      lat: 25.5941, lng: 85.1376, priority: "medium",
      tags: ["India", "storms", "weather", "Bihar"], published_date: "2026-05-25"
    },
    {
      id: "s30", title: "Lula creates Ministry of Public Security in Brazil",
      summary: "Brazil formally re-establishes a dedicated public security ministry.",
      detailed_intel: "Brazilian President Lula da Silva announced the formal creation of the Ministry of Public Security, reversing its 2019 absorption into the Ministry of Justice.",
      category: "geopolitics", source: "Wikipedia Current Events", location_name: "Brasilia, Brazil",
      lat: -15.7939, lng: -47.8828, priority: "medium",
      tags: ["Brazil", "Lula", "public security", "government"], published_date: "2026-05-24"
    },
    {
      id: "s31", title: "Mali army strikes rebel-held Kidal",
      summary: "Airstrikes follow Tuareg and JNIM gains in northern Mali.",
      detailed_intel: "Mali's army launched fresh airstrikes on rebel-held Kidal after Tuareg separatists and JNIM militants captured strategic positions in the north.",
      category: "geopolitics", source: "VIF / Al Jazeera", location_name: "Kidal, Mali",
      lat: 18.4411, lng: 1.4078, priority: "high",
      tags: ["Mali", "JNIM", "Sahel", "insurgency"], published_date: "2026-05-26"
    },
    {
      id: "s32", title: "Uganda's Museveni re-inaugurated for 7th term",
      summary: "President Yoweri Museveni begins a seventh term in office.",
      detailed_intel: "Ugandan President Yoweri Museveni was re-inaugurated for a seventh term.",
      category: "geopolitics", source: "VIF", location_name: "Kampala, Uganda",
      lat: 0.3476, lng: 32.5825, priority: "medium",
      tags: ["Uganda", "Museveni", "inauguration", "Africa"], published_date: "2026-05-23"
    },
    {
      id: "s33", title: "Nvidia posts $81.6B quarter, announces $80B buyback",
      summary: "Q1 revenue up 85% to $81.6B; guidance near $91B; data center now 90%+ of sales.",
      detailed_intel: "Nvidia posted quarterly revenue of $81.62 billion, up 85% year over year and above estimates, guided to about $91 billion, and announced an $80 billion buyback and a higher dividend. Data Center is now over 90% of revenue.",
      category: "markets", source: "CoinDesk / SEC", location_name: "Santa Clara, CA",
      lat: 37.3541, lng: -121.9552, priority: "high",
      tags: ["Nvidia", "earnings", "semiconductors", "buyback"], published_date: "2026-05-20"
    },
    {
      id: "s34", title: "Bitcoin miners rise on Nvidia AI demand",
      summary: "AI and HPC-exposed miners like Core Scientific and Cipher tick higher post-earnings.",
      detailed_intel: "Bitcoin miners with AI and high-performance computing exposure traded higher after Nvidia's earnings, with Core Scientific and Cipher Mining rising as investors saw them benefiting from data-center and AI compute demand.",
      category: "markets", source: "CoinDesk", location_name: "New York, USA",
      lat: 40.7069, lng: -74.0113, priority: "low",
      tags: ["Bitcoin", "crypto", "mining", "AI infrastructure"], published_date: "2026-05-20"
    },
    {
      id: "s35", title: "China and India ramp Brazilian crude amid Hormuz disruption",
      summary: "Buyers shift to Brazilian crude as Strait of Hormuz flows are disrupted.",
      detailed_intel: "China and India are among those ramping up imports of Brazilian crude amid Strait of Hormuz disruptions, reshaping global oil trade flows.",
      category: "markets", source: "VIF", location_name: "Rio de Janeiro, Brazil",
      lat: -22.9068, lng: -43.1729, priority: "medium",
      tags: ["Brazil", "crude", "trade", "energy"], published_date: "2026-05-27"
    }
  ]
};
