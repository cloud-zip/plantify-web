import { useEffect, useMemo, useRef, useState } from 'react';
import { XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Beams from './Beams';
import PillNav from './PillNav';
import LocationMap from './LocationMap';

const LZW = {
  decompress(str) {
    if (!str) return '';
    if (!str.startsWith('LZW:')) return str;
    try {
      const compressed = str.slice(4);
      let dict = {};
      let data = compressed.split("");
      let currChar = data[0];
      let oldPhrase = currChar;
      let out = [currChar];
      let code = 256;
      let phrase;
      for (let i = 1; i < data.length; i++) {
        let currCode = data[i].charCodeAt(0);
        if (currCode < 256) {
          phrase = data[i];
        } else {
          phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
        }
        out.push(phrase);
        currChar = phrase.charAt(0);
        dict[code] = oldPhrase + currChar;
        code++;
        oldPhrase = phrase;
      }
      return out.join("");
    } catch (e) {
      console.error('LZW decompression failed:', e);
      return '';
    }
  }
};

const keyMap = {
  'plantai_settings': 'plantify_settings',
  'plantai_sensor_data_cache': 'plantify_sensor_data_cache',
  'plantai_weather_cache': 'plantify_weather_cache',
  'plantai_care_plan': 'plantify_care_plan',
  'plantai_care_plan_updated_at': 'plantify_care_plan_updated_at',
  'plantai_tasks': 'plantify_tasks',
  'plantai_chat_sessions': 'plantify_chat_sessions',
  'plantai_active_chat_session_id': 'plantify_active_chat_session_id',
  'plantai_supabase_url': 'plantify_supabase_url',
  'plantai_supabase_key': 'plantify_supabase_key',
  'plantai_session_token': 'plantify_session_token'
};

const safeStorage = {
  getItem(key) {
    try {
      const newKey = keyMap[key] || key;
      let val = window.localStorage.getItem(newKey);
      if (val === null && keyMap[key]) {
        val = window.localStorage.getItem(key);
      }
      return val ? LZW.decompress(val) : null;
    } catch (e) {
      console.error(`Error reading key ${key} from localStorage:`, e);
      return null;
    }
  },
  setItem(key, value) {
    try {
      const newKey = keyMap[key] || key;
      window.localStorage.setItem(newKey, value);
    } catch (e) {
      console.error(`Error writing key ${key} to localStorage:`, e);
    }
  },
  removeItem(key) {
    try {
      const newKey = keyMap[key] || key;
      window.localStorage.removeItem(newKey);
      if (keyMap[key]) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.error(`Error removing key ${key} from localStorage:`, e);
    }
  }
};

const localStorage = safeStorage;


const dict = {
  en: {
    dashboard: "Dashboard", history: "Sensor History", ai: "AI Plan", settings: "Settings", tasks: "Tasks", advisor: "Advisor",
    waterMotor: "Water Motor", nutrients: "Nutrient Levels", healthScore: "Overall Health Score",
    autoWatering: "Auto-Watering", offline: "Offline Mode", analysis: "Run Analysis",
    welcome: "🌱 Welcome to Plantify", printPlan: "Print/Save PDF Plan", aiReasoning: "AI Reasoning",
    weather: "Weather", directControl: "Direct Control", status: "Status",
    aiPlanTitle: "AI Care Plan", aiPlanDesc: "Generates crop schedule using real ESP32 sensors and current weather.",
    generateBtn: "Generate 7-Day Care Chart", analysisDepth: "Analysis Depth", opStyle: "Operational Style",
    summary: "Summary", chatTitle: "Plantify Advisor", chatThinking: "Thinking...", chatOnline: "Online",
    chatPlaceholder: "Ask anything about your crop...", send: "Send", newSession: "New",
    weatherRisk: "Weather Risk", wateringTarget: "Watering Target",
    carePlan7Day: "7-Day Care Plan", day: "Day", task: "Task", category: "Category", priority: "Priority",
    fertilizerRec: "Fertilizer Recommendation", plantProfile: "Field Profile", targetYield: "Target Yield",
    systemConfig: "System & History", apiIntegration: "API Integration", visualStyling: "Visual & Styling Config",
    autoWateringSettings: "Auto-Watering Settings", saveFieldSettings: "Save Settings", appSettings: "App Settings",
    activeFieldConfig: "Active Field Config", testConnection: "Test Connection", clearKey: "Clear Key",
    language: "Language (Local)", oledMode: "OLED True Black", enableOled: "Enable OLED Mode",
    accentColor: "Accent Color", aiProvider: "AI Provider", model: "Model",
    sysPlan: "System Instructions (Plan)", sysChat: "System Instructions (Chat)",
    soilMoisture: "Soil Moisture", temperature: "Temperature", humidity: "Humidity",
    menuAppearance: "Appearance & Theme", menuAIConfig: "AI Configuration", menuLocation: "Weather & Location",
    descField: "Crop type, planting date, acreage, soil types",
    descAppearance: "Modify theme styles (Light/Dark), color accents, fonts, beams",
    descSystem: "Log intervals, DB table logs, charts curve, and background rotation",
    descAIConfig: "AI Provider select, API keys, endpoint configurations",
    descLocation: "Configure city, coordinates, wind units",
    keepOn: "Keep ON Indefinitely", refresh: "Refresh", idealEnv: "Ideal Environment:",
    daysSince: "Days since planting:", visualDesc: "Customize layouts, themes, typography weights, size profiles, and customize 3D light beams.",
    headingFont: "Heading Font", bodyFont: "Body Text Font", exportCSV: "Export CSV",
    wizardSubtitle: "Let's configure your smart crop telemetry (Step {step} of 3)",
    cropFarmName: "Crop / Farm Name",
    cropType: "Crop Type",
    plantingDate: "Planting Date",
    fieldAreaSqM: "Field Area (m²)",
    soilComposition: "Soil Composition",
    supabaseUrl: "Supabase Database Endpoint",
    supabaseAnonKey: "Supabase Anon Key",
    apiKey: "API Key (Optional)",
    back: "Back",
    continueBtn: "Continue",
    getStarted: "Get Started",
    supabaseUrlHelp: "Include or omit https://, it will be formatted automatically.",
    apiKeyHelp: "Bearer key (Can be added later)",
    farmNamePlaceholder: "e.g. Tomato Greenhouse A",
    areaPlaceholder: "e.g. 250",
    dbEndpointPlaceholder: "e.g. xyz.supabase.co",
    loginTitle: "Device Authentication",
    loginSubtitle: "Enter your hardware device credentials to connect.",
    deviceId: "Device ID / Name",
    password: "Device Password",
    signIn: "Sign In",
    authenticating: "Authenticating...",
    deviceIdPlaceholder: "e.g. esp32-field-001",
    fieldProfileSettings: "Field Profile Settings",
    fieldProfileDesc: "Configure crop types, planting dates, field acreage, and soil types to calibrate agronomic formulas.",
    cropDensity: "Crop Density",
    sparse: "Sparse (Low)",
    mediumDensity: "Medium Density",
    dense: "Dense (High)",
    cropDetailsPlaceholder: "e.g. My Tomato Farm",
    areaLabel: "Area (m²)",
    targetYieldLabel: "Target Yield",
    yieldPlaceholder: "e.g. 5.5 tons/acre",
    autoWateringTitle: "Auto-Watering Configuration",
    autoWateringDesc: "Calibrate localized IoT relay actuator rules.",
    enableAutoWatering: "Enable Auto-Watering Plan",
    moistureThreshold: "Min Soil Moisture Trigger (%)",
    maxWateringDuration: "Max Watering duration (min)",
    apiSettingsTitle: "API Integration Settings",
    apiSettingsDesc: "Configure Supabase and LLM endpoints.",
    devicePasswordTitle: "Device Password Management",
    newPasswordLabel: "New Device Password",
    changePasswordBtn: "Change Password",
    weatherSettingsTitle: "Weather & Location Configuration",
    weatherSettingsDesc: "Configure local coordinates and units.",
    latitudeLabel: "Latitude",
    longitudeLabel: "Longitude",
    tempUnitLabel: "Temperature Unit",
    windUnitLabel: "Wind Speed Unit",
    appearanceSettingsTitle: "Appearance & Themes",
    appearanceSettingsDesc: "Customize layouts and 3D light beams.",
    beamWidthLabel: "Beam Width",
    beamHeightLabel: "Beam Height",
    beamNumberLabel: "Number of Beams",
    beamSpeedLabel: "Beam Movement Speed",
    beamNoiseLabel: "Beam Noise Turbulence",
    beamRotationLabel: "Background Rotation (deg)",
    googleFontsLabel: "Google Fonts Stylesheet URL",
    systemAdvancedTitle: "System & History Configuration",
    systemAdvancedDesc: "Calibrate polling intervals and database parameters.",
    logIntervalLabel: "Client Log Interval (sec)",
    historyWindowLabel: "History Window Size (hours)",
    averageMinutesLabel: "Average Calculation (minutes)",
    sensorsTableLabel: "Sensors Table Name",
    settingsTableLabel: "System Settings Table Name",
    saveConfigBtn: "Save Configuration",
    tasksTitle: "Farm Tasks & Care Plan",
    tasksDesc: "Manage your active field operations.",
    syncAiTasks: "Sync AI Tasks",
    addTaskHeader: "Add New Task",
    taskNamePlaceholder: "Task Name (e.g. Apply Fertilizer)",
    taskDescPlaceholder: "Detailed Description / Assistance notes...",
    dueLabel: "Due Date",
    pumpDurationLabel: "Pump Duration (min)",
    addTaskBtn: "Add Task to Log",
    pendingHeader: "Pending",
    completedHeader: "Completed",
    allDone: "All done! No pending tasks.",
    completeTask: "Complete Task",
    actionSyncSuccess: "AI Care Plan tasks successfully synced to log!",
    actionNoPlan: "No active AI plan found to sync."
  },
  hi: {
    dashboard: "डैशबोर्ड", history: "सेंसर इतिहास", ai: "एआई योजना", settings: "सेटिंग्स", tasks: "कार्य", advisor: "सलाहकार",
    waterMotor: "पानी की मोटर", nutrients: "पोषक तत्व स्तर", healthScore: "कुल स्वास्थ्य",
    autoWatering: "स्वचालित सिंचाई", offline: "ऑफ़लाइन मोड", analysis: "विश्लेषण करें",
    welcome: "🌱 Welcome to Plantify", printPlan: "पीडीएफ योजना प्रिंट/सेव करें", aiReasoning: "एআই का तर्क",
    weather: "मौसम", directControl: "प्रत्यक्ष नियंत्रण", status: "स्थिति",
    aiPlanTitle: "एआई केयर प्लान", aiPlanDesc: "वास्तविक सेंसर और मौसम का उपयोग करके फसल कार्यक्रम बनाता है।",
    generateBtn: "7-दिवसीय देखभाल चार्ट बनाएं", analysisDepth: "विश्लेषण की गहराई", opStyle: "परिचालन शैली",
    summary: "सारांश", chatTitle: "Plantify सलाहकार", chatThinking: "सोच रहा है...", chatOnline: "ऑनलाइन",
    chatPlaceholder: "अपनी फसल के बारे में कुछ भी पूछें...", send: "भेजें", newSession: "नया",
    weatherRisk: "मौसम जोखिम", wateringTarget: "सिंचाई लक्ष्य",
    carePlan7Day: "7-दिवसीय देखभाल योजना", day: "दिन", task: "कार्य", category: "श्रेणी", priority: "प्राथमिकता",
    fertilizerRec: "उर्वरक अनुशंसा", plantProfile: "फ़ील्ड प्रोफ़ाइल", targetYield: "लक्ष्य उपज",
    systemConfig: "सिस्टम और इतिहास", apiIntegration: "API एकीकरण", visualStyling: "दृश्य और शैली कॉन्फ़िग",
    autoWateringSettings: "स्वचालित सिंचाई सेटिंग्स", saveFieldSettings: "सेटिंग्स सहेजें", appSettings: "ऐप सेटिंग्स",
    activeFieldConfig: "सक्रिय फ़ील्ड कॉन्फ़िग", testConnection: "कनेक्शन का परीक्षण करें", clearKey: "कुंजी साफ़ करें",
    language: "भाषा (स्थानीय)", oledMode: "OLED ट्रू ब्लैक", enableOled: "OLED मोड सक्षम करें",
    accentColor: "मुख्य रंग (Accent)", aiProvider: "एआई प्रदाता", model: "मॉडल",
    sysPlan: "सिस्टम निर्देश (योजना)", sysChat: "सिस्टम निर्देश (चैट)",
    soilMoisture: "मिट्टी की नमी", temperature: "तापमान", humidity: "आर्द्रता",
    menuAppearance: "रूप और थीम", menuAIConfig: "एआई कॉन्फ़िगरेशन", menuLocation: "मौसम और स्थान",
    descField: "फसल का प्रकार, रोपण तिथि, क्षेत्रफल, मिट्टी के प्रकार",
    descAppearance: "थीम शैलियों, रंगों, फोंट और बीम को संशोधित करें",
    descSystem: "लॉग अंतराल, डीबी टेबल लॉग, चार्ट वक्र और पृष्ठभूमि रोटेशन",
    descAIConfig: "एआई प्रदाता का चयन, एपीआई कुंजियां और एंडपॉइंट कॉन्फ़िगरेशन",
    descLocation: "शहर, निर्देशांक, और हवा की इकाइयाँ कॉन्फ़िगर करें",
    keepOn: "अनिश्चित काल तक चालू रखें", refresh: "रीफ़्रेश करें", idealEnv: "आदर्श वातावरण:",
    daysSince: "बुवाई से दिन:", visualDesc: "लेआउट, थीम, टाइपोग्राफी और 3डी बीम कस्टमाइज़ करें।",
    headingFont: "हेडिंग फ़ॉन्ट", bodyFont: "बॉडी टेक्स्ट फ़ॉन्ट", exportCSV: "सीएसवी निर्यात",
    wizardSubtitle: "आइए आपके स्मार्ट फसल टेलीमेट्री को कॉन्फ़िगर करें (चरण {step}/3)",
    cropFarmName: "फसल / फार्म का नाम",
    cropType: "फसल का प्रकार",
    plantingDate: "बुवाई की तारीख",
    fieldAreaSqM: "खेत का क्षेत्रफल (m²)",
    soilComposition: "मिट्टी की संरचना",
    supabaseUrl: "Supabase डेटाबेस एंडपॉइंट",
    supabaseAnonKey: "Supabase अनाम कुंजी (Anon Key)",
    apiKey: "एपीआई कुंजी (वैकल्पिक)",
    back: "पीछे",
    continueBtn: "जारी रखें",
    getStarted: "शुरू करें",
    supabaseUrlHelp: "https:// शामिल करें या छोड़ें, यह स्वचालित रूप से स्वरूपित हो जाएगा।",
    apiKeyHelp: "बियरर कुंजी (बाद में जोड़ा जा सकता है)",
    farmNamePlaceholder: "जैसे टमाटर ग्रीनहाउस ए",
    areaPlaceholder: "जैसे 250",
    dbEndpointPlaceholder: "जैसे xyz.supabase.co",
    loginTitle: "डिवाइस प्रमाणीकरण",
    loginSubtitle: "कनेक्ट करने के लिए अपने हार्डवेयर डिवाइस क्रेडेंशियल दर्ज करें।",
    deviceId: "डिवाइस आईडी / नाम",
    password: "डिवाइस पासवर्ड",
    signIn: "साइन इन करें",
    authenticating: "प्रमाणित किया जा रहा है...",
    deviceIdPlaceholder: "जैसे esp32-field-001",
    fieldProfileSettings: "फ़ील्ड प्रोफ़ाइल सेटिंग्स",
    fieldProfileDesc: "कृषि विज्ञान सूत्रों को जांचने के लिए फसल के प्रकार, रोपण की तारीखें, खेत का रकबा और मिट्टी के प्रकारों को कॉन्फ़िगर करें।",
    cropDensity: "फसल का घनत्व",
    sparse: "विरल (कम)",
    mediumDensity: "मध्यम घनत्व",
    dense: "सघन (अधिक)",
    cropDetailsPlaceholder: "जैसे मेरा टमाटर का खेत",
    areaLabel: "क्षेत्रफल (m²)",
    targetYieldLabel: "लक्ष्य उपज",
    yieldPlaceholder: "जैसे 5.5 टन/एकड़",
    autoWateringTitle: "स्वचालित सिंचाई कॉन्फ़िगरेशन",
    autoWateringDesc: "स्थानीयकृत IoT रिले एक्चुएटर नियमों को जांचें।",
    enableAutoWatering: "स्वचालित सिंचाई योजना सक्षम करें",
    moistureThreshold: "न्यूनतम मिट्टी की नमी ट्रिगर (%)",
    maxWateringDuration: "अधिकतम सिंचाई अवधि (मिनट)",
    apiSettingsTitle: "API एकीकरण सेटिंग्स",
    apiSettingsDesc: "Supabase और LLM एंडपॉइंट कॉन्फ़िगर करें।",
    devicePasswordTitle: "डिवाइस पासवर्ड प्रबंधन",
    newPasswordLabel: "नया डिवाइस पासवर्ड",
    changePasswordBtn: "पासवर्ड बदलें",
    weatherSettingsTitle: "मौसम और स्थान कॉन्फ़िगरेशन",
    weatherSettingsDesc: "स्थानीय निर्देशांक और इकाइयाँ कॉन्फ़िगर करें।",
    latitudeLabel: "अक्षांश",
    longitudeLabel: "देशांतर",
    tempUnitLabel: "तापमान इकाई",
    windUnitLabel: "हवा की गति इकाई",
    appearanceSettingsTitle: "रूप और थीम",
    appearanceSettingsDesc: "लेआउट और 3डी लाइट बीम को कस्टमाइज़ करें।",
    beamWidthLabel: "बीम की चौड़ाई",
    beamHeightLabel: "बीम की ऊंचाई",
    beamNumberLabel: "बीम की संख्या",
    beamSpeedLabel: "बीम आंदोलन की गति",
    beamNoiseLabel: "बीम शोर अशांति",
    beamRotationLabel: "पृष्ठभूमि रोटेशन (डिग्री)",
    googleFontsLabel: "गूगल फॉन्ट्स स्टाइलशीट यूआरएल",
    systemAdvancedTitle: "सिस्टम और इतिहास कॉन्फ़िगरेशन",
    systemAdvancedDesc: "मतदान अंतराल और डेटाबेस मापदंडों को जांचें।",
    logIntervalLabel: "क्लाइंट लॉग अंतराल (सेकंड)",
    historyWindowLabel: "इतिहास विंडो आकार (घंटे)",
    averageMinutesLabel: "औसत गणना (मिनट)",
    sensorsTableLabel: "सेंसर तालिका का नाम",
    settingsTableLabel: "सिस्टम सेटिंग्स तालिका का नाम",
    saveConfigBtn: "कॉन्फ़िगरेशन सहेजें",
    tasksTitle: "फार्म कार्य और देखभाल योजना",
    tasksDesc: "अपने सक्रिय क्षेत्र संचालन प्रबंधित करें।",
    syncAiTasks: "एआई कार्यों को सिंक करें",
    addTaskHeader: "नया कार्य जोड़ें",
    taskNamePlaceholder: "कार्य का नाम (जैसे उर्वरक डालें)",
    taskDescPlaceholder: "विस्तृत विवरण / सहायता टिप्पणियाँ...",
    dueLabel: "नियत तिथि",
    pumpDurationLabel: "पंप अवधि (मिनट)",
    addTaskBtn: "कार्य लॉग में जोड़ें",
    pendingHeader: "लंबित",
    completedHeader: "पूरा किया हुआ",
    allDone: "सब हो गया! कोई लंबित कार्य नहीं है।",
    completeTask: "कार्य पूरा करें",
    actionSyncSuccess: "एआई केयर प्लान कार्यों को सफलतापूर्वक लॉग में सिंक किया गया!",
    actionNoPlan: "सिंक करने के लिए कोई सक्रिय एआई योजना नहीं मिली।"
  },
  bn: {
    dashboard: "ড্যাশবোর্ড", history: "সেন্সর ইতিহাস", ai: "এআই পরিকল্পনা", settings: "সেটিংস", tasks: "কাজ", advisor: "উপদেষ্টা",
    waterMotor: "জলের মোটর", nutrients: "পুষ্টির স্তর", healthScore: "সামগ্রিক স্বাস্থ্য",
    autoWatering: "স্বয়ংক্রিয় জল", offline: "অফলাইন মোড", analysis: "বিশ্লেষণ করুন",
    welcome: "🌱 Welcome to Plantify", printPlan: "পিডিএফ প্ল্যান প্রিন্ট/সেভ করুন", aiReasoning: "এআই-এর যুক্তি",
    weather: "আবহাওয়া", directControl: "সরাসরি নিয়ন্ত্রণ", status: "অবস্থা",
    aiPlanTitle: "এআই কেয়ার প্ল্যান", aiPlanDesc: "রিয়েল সেন্সর এবং বর্তমান আবহাওয়া ব্যবহার করে ফসলের সময়সূচী তৈরি করে।",
    generateBtn: "৭ দিনের কেয়ার চার্ট তৈরি করুন", analysisDepth: "বিশ্লেষণের গভীরতা", opStyle: "অপারেশনাল স্টাইল",
    summary: "সারাংশ", chatTitle: "Plantify উপদেষ্টা", chatThinking: "ভাবছে...", chatOnline: "অনলাইন",
    chatPlaceholder: "আপনার ফসল সম্পর্কে কিছু জিজ্ঞাসা করুন...", send: "পাঠান", newSession: "নতুন",
    weatherRisk: "আবহাওয়ার ঝুঁকি", wateringTarget: "জলের লক্ষ্য",
    carePlan7Day: "৭ দিনের কেয়ার প্ল্যান", day: "দিন", task: "কাজ", category: "বিভাগ", priority: "অগ্রাধিকার",
    fertilizerRec: "সারের সুপারিশ", plantProfile: "ক্ষেত্র প্রোফাইল", targetYield: "লক্ষ্য ফলন",
    systemConfig: "সিস্টেম এবং ইতিহাস", apiIntegration: "API ইন্টিগ্রেশন", visualStyling: "ভিজ্যুয়াল এবং স্টাইলিং কনফিগারেশন",
    autoWateringSettings: "স্বয়ংক্রিয় জলের সেটিংস", saveFieldSettings: "সেটিংস সংরক্ষণ করুন", appSettings: "অ্যাপ সেটিংস",
    activeFieldConfig: "সক্রিয় ক্ষেত্র কনফিগারেশন", testConnection: "সংযোগ পরীক্ষা করুন", clearKey: "কী মুছুন",
    language: "ভাষা (স্থানীয়)", oledMode: "OLED ট্রু ব্ল্যাক", enableOled: "OLED মোড সক্ষম করুন",
    accentColor: "অ্যাকসেন্ট কালার", aiProvider: "এআই প্রদানকারী", model: "মডেল",
    sysPlan: "সিস্টেম নির্দেশাবলী (পরিকল্পনা)", sysChat: "সিস্টেম নির্দেশাবলী (চ্যাট)",
    soilMoisture: "মাটির আর্দ্রতা", temperature: "উষ্ণতা", humidity: "আর্দ্রতা",
    menuAppearance: "চেহারা এবং থিম", menuAIConfig: "এআই কনফিগারেশন", menuLocation: "আবহাওয়া এবং অবস্থান",
    descField: "ফসলের ধরন, রোপণের তারিখ, আয়তন, মাটির ধরন",
    descAppearance: "থিম শৈলী, রং, ফন্ট এবং বিম পরিবর্তন করুন",
    descSystem: "লগ বিরতি, ডিবি টেবিল লগ, চার্ট বক্ররেখা এবং ব্যাকগ্রাউন্ড রোটেশন",
    descAIConfig: "এআই প্রদানকারী নির্বাচন, এপিআই কী এবং এন্ডপয়েন্ট কনফিগারেশন",
    descLocation: "শহর, স্থানাঙ্ক, এবং বাতাসের ইউনিট কনফিগার করুন",
    keepOn: "অনির্দিষ্টকালের জন্য চালু রাখুন", refresh: "রিফ্রেশ করুন", idealEnv: "আদর্শ পরিবেশ:",
    daysSince: "রোপণ থেকে দিন:", visualDesc: "লেআউট, থিম, টাইপোগ্রাফি এবং 3D বিম কাস্টমাইজ করুন।",
    headingFont: "শিরোনাম ফন্ট", bodyFont: "বডি টেক্সট ফন্ট", exportCSV: "সিএসভি রপ্তানি",
    wizardSubtitle: "আসুন আপনার স্মার্ট ফসলের টেলিমেট্রি কনফিগার করি (ধাপ {step} এর ৩)",
    cropFarmName: "ফসল / খামারের নাম",
    cropType: "ফসলের ধরন",
    plantingDate: "রোপণের তারিখ",
    fieldAreaSqM: "ক্ষেত্রের ক্ষেত্রফল (m²)",
    soilComposition: "মাটির গঠন",
    supabaseUrl: "Supabase ডেটাবেস এন্ডপয়েন্ট",
    supabaseAnonKey: "Supabase অ্যানন কী (Anon Key)",
    apiKey: "এপিআই কী (ঐচ্ছিক)",
    back: "ফিরে যান",
    continueBtn: "এগিয়ে যান",
    getStarted: "শুরু করুন",
    supabaseUrlHelp: "https:// অন্তর্ভুক্ত করুন বা বাদ দিন, এটি স্বয়ংক্রিয়ভাবে ফর্ম্যাট হবে।",
    apiKeyHelp: "বেরার কী (পরে যোগ করা যাবে)",
    farmNamePlaceholder: "উদাঃ টমেটো গ্রিনহাউস এ",
    areaPlaceholder: "উদাঃ ২৫০",
    dbEndpointPlaceholder: "উদাঃ xyz.supabase.co",
    loginTitle: "ডিভাইস প্রমাণীকরণ",
    loginSubtitle: "সংযোগ করতে আপনার হার্ডওয়্যার ডিভাইসের শংসাপত্রগুলি লিখুন।",
    deviceId: "ডিভাইস আইডি / নাম",
    password: "ডিভাইস পাসওয়ার্ড",
    signIn: "সাইন ইন করুন",
    authenticating: "প্রমাণীকরণ করা হচ্ছে...",
    deviceIdPlaceholder: "উদাঃ esp32-field-001",
    fieldProfileSettings: "ক্ষেত্র প্রোফাইল সেটিংস",
    fieldProfileDesc: "অ্যাগ্রোনমিক সূত্র ক্যালিব্রেট করতে ফসলের ধরন, রোপণের তারিখ, ক্ষেত্রের আয়তন এবং মাটির ধরন কনফিগার করুন।",
    cropDensity: "ফসলের ঘনত্ব",
    sparse: "পাতলা (কম)",
    mediumDensity: "মাঝারি ঘনত্ব",
    dense: "ঘন (উচ্চ)",
    cropDetailsPlaceholder: "উদাঃ আমার টমেটো খামার",
    areaLabel: "ক্ষেত্রফল (বর্গমিটার)",
    targetYieldLabel: "লক্ষ্য ফলন",
    yieldPlaceholder: "উদাঃ ৫.৫ টন/একর",
    autoWateringTitle: "স্বয়ংক্রিয় সেচ কনফিগারেশন",
    autoWateringDesc: "স্থানীয়কৃত IoT রিলে অ্যাকচুয়েটর নিয়মগুলি ক্যালিব্রেট করুন।",
    enableAutoWatering: "স্বয়ংক্রিয় সেচ পরিকল্পনা সক্ষম করুন",
    moistureThreshold: "সর্বনিম্ন মাটির আর্দ্রতা ট্রিগার (%)",
    maxWateringDuration: "সর্বোচ্চ সেচ সময়কাল (মিনিট)",
    apiSettingsTitle: "API ইন্টিগ্রেশন সেটিংস",
    apiSettingsDesc: "Supabase এবং LLM এন্ডপয়েন্ট কনফিগার করুন।",
    devicePasswordTitle: "ডিভাইসের পাসওয়ার্ড ম্যানেজমেন্ট",
    newPasswordLabel: "নতুন ডিভাইসের পাসওয়ার্ড",
    changePasswordBtn: "পাসওয়ার্ড পরিবর্তন করুন",
    weatherSettingsTitle: "আবহাওয়া এবং অবস্থান কনফিগারেশন",
    weatherSettingsDesc: "স্থানীয় স্থানাঙ্ক এবং ইউনিট কনফিগার করুন।",
    latitudeLabel: "অক্ষাংশ",
    longitudeLabel: "দ্রাঘিমাংশ",
    tempUnitLabel: "তাপমাত্রা ইউনিট",
    windUnitLabel: "বাতাসের গতি ইউনিট",
    appearanceSettingsTitle: "চেহারা এবং থিম",
    appearanceSettingsDesc: "লেআউট এবং 3D লাইট বিম কাস্টমাইজ করুন।",
    beamWidthLabel: "বিমের প্রস্থ",
    beamHeightLabel: "বিমের উচ্চতা",
    beamNumberLabel: "বিমের সংখ্যা",
    beamSpeedLabel: "বিম চলাচলের গতি",
    beamNoiseLabel: "বিম নয়েজ টার্বুলেন্স",
    beamRotationLabel: "পটভূমি ঘূর্ণন (ডিগ্রী)",
    googleFontsLabel: "গুগল ফন্ট স্টাইলশীট URL",
    systemAdvancedTitle: "সিস্টেম এবং ইতিহাস কনফিগারেশন",
    systemAdvancedDesc: "পোলিং ইন্টারভাল এবং ডেটাবেস পরামিতি ক্যালিব্রেট করুন।",
    logIntervalLabel: "ক্লায়েন্ট লগ ইন্টারভাল (সেকেন্ড)",
    historyWindowLabel: "ইতিহাস উইন্ডো আকার (ঘণ্টা)",
    averageMinutesLabel: "গড় গণনা (মিনিট)",
    sensorsTableLabel: "সেন্সর টেবিল নাম",
    settingsTableLabel: "সিস্টেম সেটিংস টেবিল নাম",
    saveConfigBtn: "কনফিগারেশন সংরক্ষণ করুন",
    tasksTitle: "খামার কাজ ও কেয়ার প্ল্যান",
    tasksDesc: "আপনার সক্রিয় ক্ষেত্র অপারেশন পরিচালনা করুন।",
    syncAiTasks: "এআই কাজ সিঙ্ক করুন",
    addTaskHeader: "নতুন কাজ যোগ করুন",
    taskNamePlaceholder: "কাজের নাম (উদাঃ সার প্রয়োগ করুন)",
    taskDescPlaceholder: "বিস্তারিত বিবরণ / সহায়তা নোট...",
    dueLabel: "নির্ধারিত তারিখ",
    pumpDurationLabel: "পাম্প সময়কাল (মিনিট)",
    addTaskBtn: "টাস্ক লগে যোগ করুন",
    pendingHeader: "অপেক্ষমান",
    completedHeader: "সম্পন্ন",
    allDone: "সব শেষ! কোন অপেক্ষমান কাজ নেই।",
    completeTask: "কাজ সম্পন্ন করুন",
    actionSyncSuccess: "এআই কেয়ার প্ল্যান কাজ সফলভাবে লগে সিঙ্ক করা হয়েছে!",
    actionNoPlan: "সিঙ্ক করার জন্য কোন এআই পরিকল্পনা পাওয়া যায়নি।"
  }
};

const logoSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23d4ff00"><path d="M13 10V3L4 14H11V21L20 10H13Z"/></svg>';


function getLocalIsoDate() {
  try {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function getRuntimeSupabaseUrl() {
  try {
    let url = JSON.parse(localStorage.getItem('plantai_settings') || '{}').supabaseUrl || localStorage.getItem('plantai_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
    url = url.trim();
    if (url && !/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    return url;
  } catch {
    let url = localStorage.getItem('plantai_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
    url = url.trim();
    if (url && !/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    return url;
  }
}

function getActiveDeviceId() {
  try {
    const raw = localStorage.getItem('plantai_settings');
    const parsed = raw ? JSON.parse(raw) : null;
    const activeId = parsed?.activeFieldId || '1';
    return `esp32-field-00${activeId}`;
  } catch {
    return 'esp32-field-001';
  }
}


const endpoint = (name) => {
  const url = getRuntimeSupabaseUrl();
  return url ? `${url.replace(/\/$/, '')}/functions/v1/${name}` : '';
};

const providers = {
  openrouter: { label: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'qwen/qwen-3.5-flash' },
  openai: { label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  gemini: { label: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.5-flash' },
  groq: { label: 'GroqCloud', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.1-8b-instant' },
  nvidia: { label: 'Nvidia NIM', baseUrl: 'https://integrate.api.nvidia.com/v1', model: 'moonshotai/kimi-k2-instruct' },
  custom: { label: 'Custom OpenAI-Compatible', baseUrl: '', model: '' },
};

const plantProfiles = {
  rice: {
    label: 'Rice / Paddy (Oryza sativa)',
    ideal: 'Warm climate 20-38°C, high water availability, humidity 60-85%, moist/flooded soil depending stage.',
    tempMin: 20, tempMax: 38,
    humidityMin: 60, humidityMax: 85,
    moistureMin: 50, moistureMax: 90,
    npk: {
      n: { min: 70, max: 150 },
      p: { min: 40, max: 100 },
      k: { min: 80, max: 160 }
    }
  },
  wheat: {
    label: 'Wheat (Triticum aestivum)',
    ideal: 'Cool growing season 12-26°C, moderate moisture 35-65%, loam/clay loam soil, balanced NPK.',
    tempMin: 12, tempMax: 26,
    humidityMin: 40, humidityMax: 70,
    moistureMin: 35, moistureMax: 65,
    npk: {
      n: { min: 80, max: 160 },
      p: { min: 35, max: 90 },
      k: { min: 70, max: 140 }
    }
  },
  millet: {
    label: 'Millet / Pearl/Finger/Foxtail',
    ideal: 'Drought-tolerant, 22-38°C, low-moderate watering 20-50%, grows well in sandy/silty soils with good drainage.',
    tempMin: 22, tempMax: 38,
    humidityMin: 30, humidityMax: 60,
    moistureMin: 20, moistureMax: 50,
    npk: {
      n: { min: 50, max: 120 },
      p: { min: 30, max: 80 },
      k: { min: 60, max: 130 }
    }
  },
  tomato: {
    label: 'Tomato (Solanum lycopersicum)',
    ideal: 'Warm climate 18-32°C, moist well-drained soil 45-75%, high potassium requirement for fruiting, 50-75% humidity.',
    tempMin: 18, tempMax: 32,
    humidityMin: 50, humidityMax: 75,
    moistureMin: 45, moistureMax: 75,
    npk: {
      n: { min: 90, max: 170 },
      p: { min: 45, max: 110 },
      k: { min: 110, max: 200 }
    }
  },
  chili: {
    label: 'Chili Pepper (Capsicum annuum)',
    ideal: 'Warm climate 20-35°C, moderate watering 40-70%, well-draining sandy loam soil, avoid waterlogging.',
    tempMin: 20, tempMax: 35,
    humidityMin: 45, humidityMax: 70,
    moistureMin: 40, moistureMax: 70,
    npk: {
      n: { min: 80, max: 150 },
      p: { min: 40, max: 100 },
      k: { min: 90, max: 160 }
    }
  },
  brinjal: {
    label: 'Brinjal / Eggplant (Solanum melongena)',
    ideal: 'Warm weather crop 22-35°C, silt loam or clay loam, high nutrient needs, regular watering 45-75%.',
    tempMin: 22, tempMax: 35,
    humidityMin: 50, humidityMax: 80,
    moistureMin: 45, moistureMax: 75,
    npk: {
      n: { min: 85, max: 160 },
      p: { min: 40, max: 100 },
      k: { min: 90, max: 170 }
    }
  },
  cucumber: {
    label: 'Cucumber (Cucumis sativus)',
    ideal: 'Warm 20-32°C, constant soil moisture 50-80%, high humidity 60-85%, nitrogen & potassium rich organic soil.',
    tempMin: 20, tempMax: 32,
    humidityMin: 60, humidityMax: 85,
    moistureMin: 50, moistureMax: 80,
    npk: {
      n: { min: 95, max: 180 },
      p: { min: 45, max: 110 },
      k: { min: 100, max: 190 }
    }
  },
  carrot: {
    label: 'Carrot (Daucus carota)',
    ideal: 'Cool temperature 12-24°C, deep loose sandy soil, constant moderate watering 35-65%, avoid heavy nitrogen.',
    tempMin: 12, tempMax: 24,
    humidityMin: 45, humidityMax: 70,
    moistureMin: 35, moistureMax: 65,
    npk: {
      n: { min: 40, max: 100 },
      p: { min: 50, max: 120 },
      k: { min: 90, max: 170 }
    }
  },
  spinach: {
    label: 'Spinach (Spinacia oleracea)',
    ideal: 'Cool weather 10-22°C, rich loam soil, high nitrogen demand, keep soil moist 40-70% but not wet.',
    tempMin: 10, tempMax: 22,
    humidityMin: 50, humidityMax: 75,
    moistureMin: 40, moistureMax: 70,
    npk: {
      n: { min: 100, max: 190 },
      p: { min: 35, max: 90 },
      k: { min: 80, max: 150 }
    }
  },
  potato: {
    label: 'Potato (Solanum tuberosum)',
    ideal: 'Cool climate 12-24°C, loose well-aerated sandy loam, moderate soil moisture 40-70%, high potassium.',
    tempMin: 12, tempMax: 24,
    humidityMin: 50, humidityMax: 75,
    moistureMin: 40, moistureMax: 70,
    npk: {
      n: { min: 80, max: 150 },
      p: { min: 40, max: 100 },
      k: { min: 100, max: 190 }
    }
  },
  onion: {
    label: 'Onion (Allium cepa)',
    ideal: '12-25°C, shallow root system requires frequent shallow watering 35-65%, well-drained sandy loam.',
    tempMin: 12, tempMax: 25,
    humidityMin: 45, humidityMax: 70,
    moistureMin: 35, moistureMax: 65,
    npk: {
      n: { min: 70, max: 140 },
      p: { min: 35, max: 90 },
      k: { min: 80, max: 150 }
    }
  },
  capsicum: {
    label: 'Capsicum / Bell Pepper',
    ideal: 'Warm 18-30°C, well-draining moist loam 45-75%, avoid excessive nitrogen to prevent flower drop.',
    tempMin: 18, tempMax: 30,
    humidityMin: 50, humidityMax: 75,
    moistureMin: 45, moistureMax: 75,
    npk: {
      n: { min: 80, max: 150 },
      p: { min: 40, max: 100 },
      k: { min: 90, max: 180 }
    }
  },
  lettuce: {
    label: 'Lettuce (Lactuca sativa)',
    ideal: 'Cool 12-20°C, moist well-drained sandy loam 45-70%, high organic matter, nitrogen responsive.',
    tempMin: 12, tempMax: 20,
    humidityMin: 50, humidityMax: 75,
    moistureMin: 45, moistureMax: 70,
    npk: {
      n: { min: 90, max: 160 },
      p: { min: 30, max: 80 },
      k: { min: 70, max: 145 }
    }
  },
  broccoli: {
    label: 'Broccoli (Brassica oleracea)',
    ideal: 'Cool season 12-22°C, fertile loam, high water requirement 50-75%, needs rich boron and nitrogen.',
    tempMin: 12, tempMax: 22,
    humidityMin: 55, humidityMax: 80,
    moistureMin: 50, moistureMax: 75,
    npk: {
      n: { min: 100, max: 180 },
      p: { min: 45, max: 110 },
      k: { min: 90, max: 170 }
    }
  },
  custom: {
    label: 'Custom Crop / Plant',
    ideal: 'Custom conditions. Adjust sensor limits according to crop guidelines.',
    tempMin: 15, tempMax: 35,
    humidityMin: 40, humidityMax: 80,
    moistureMin: 30, moistureMax: 80,
    npk: {
      n: { min: 50, max: 180 },
      p: { min: 30, max: 120 },
      k: { min: 60, max: 180 }
    }
  }
};

const weatherPlaces = {
  patna: { label: 'Patna, Bihar', city: 'Patna', country: 'India', latitude: 25.5941, longitude: 85.1376 },
  kolkata: { label: 'Kolkata, West Bengal', city: 'Kolkata', country: 'India', latitude: 22.5726, longitude: 88.3639 },
  chandpara: { label: 'Greenfield / Brooktown Region', city: 'Greenfield / Brooktown', country: 'India', latitude: 22.899, longitude: 88.761 },
  habra: { label: 'Brooktown, North County, West Bengal', city: 'Brooktown', country: 'India', latitude: 22.842, longitude: 88.656 },
  delhi: { label: 'Delhi NCR', city: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090 },
  mumbai: { label: 'Mumbai, Maharashtra', city: 'Mumbai', country: 'India', latitude: 19.0760, longitude: 72.8777 },
  custom: { label: 'Custom latitude/longitude', city: '', country: 'India', latitude: '', longitude: '' },
};

const defaultSettings = {
  // AI — Groq + Qwen pre-configured
  provider: 'groq',
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  baseUrl: providers.groq.baseUrl,
  model: 'qwen/qwen3-32b',
  mode: 'direct', depth: 'Balanced', careStyle: 'Normal', budget: 'Low-cost', glass: 42, sensorInterval: 30, maxWatering: 10, cooldown: 5,
  // Supabase — pre-configured from build env
  supabaseUrl: getRuntimeSupabaseUrl(),
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  // Farm defaults
  plantType: 'millet', plantName: 'My favorite plant', city: 'Patna', country: 'India', latitude: 25.5941, longitude: 85.1376, weatherPlace: 'patna', fieldAreaSqM: 0.1, soilType: 'Standard Soil', useVirtualSoil: false, secretUnlocked: false, showKey: false, plantingDate: '2026-06-01',
  historyAverageMinutes: 15, backgroundRotation: 0,
  // Appearance Customizations
  theme: 'dark', accent: 'lime', fontHeading: 'Nunito', fontBody: 'Nunito', googleFontsUrl: '', fontSizeHeading: 'normal', fontSizeBody: 'normal',
  beamNumber: 12, beamWidth: 2.2, beamSpeed: 3.4, beamNoise: 1.75,
  // Field Profile Details
  fieldNotes: '', cropDensity: 'medium', targetYield: '',
  // System overrides
  chartCurve: 'smooth', virtualDataMock: false, dbSensorsTable: 'sensor_readings', dbSettingsTable: 'system_settings',
  // AI prompts
  aiSystemPromptPlan: 'You are Plantify. You must output strict JSON matching the requested schema. Use sensor history, weather history, plant type ideal conditions, and safety rules. If anyone asks who made you or who created Plantify, answer exactly: Plantify was created by CLOUD 🌨️.',
  aiSystemPromptChat: 'You are Plantify, a practical plant advisor. Format answers with short headings and bullets. If anyone asks who made you or who created Plantify, answer exactly: Plantify was created by CLOUD 🌨️.',
  // Weather settings
  weatherElevation: '', weatherTempUnit: 'celsius', weatherWindUnit: 'kmh',
  // Advanced Features
  language: 'en', autoWateringEnabled: false, autoWateringMoistureThreshold: 30, autoWateringDurationMinutes: 10, isOled: false,
  mandiState: '', mandiMarket: '',
  // Setup — always complete, no wizard needed
  isSetupComplete: true,
  // Multi-Field Support
  fields: [
    { id: '1', name: 'Main Crop Field', plantType: 'millet', plantName: 'Pearl Millet', area: 0.1, soilType: 'Standard Soil' },
    { id: '2', name: 'Greenhouse', plantType: 'tomato', plantName: 'Roma Tomatoes', area: 0.05, soilType: 'Loam Soil' }
  ],
  activeFieldId: '1'
};

function loadSettings() {
  try {
    const raw = localStorage.getItem('plantai_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.isSetupComplete === undefined) {
        parsed.isSetupComplete = true;
      }
      return { ...defaultSettings, ...parsed };
    }
  } catch {}
  return defaultSettings;
}

function saveSettings(s) {
  try {
    localStorage.setItem('plantai_settings', JSON.stringify(s));
  } catch (err) {
    console.error('Error saving settings to localStorage:', err);
  }
}

function loadCachedSensorData() {
  try {
    const raw = localStorage.getItem('plantai_sensor_data_cache');
    return raw ? JSON.parse(raw) : { latest: null, readings: [], plant: null, device: null, latestCommandStatus: null };
  } catch {
    return { latest: null, readings: [], plant: null, device: null, latestCommandStatus: null };
  }
}

function saveCachedSensorData(data) {
  try {
    localStorage.setItem('plantai_sensor_data_cache', JSON.stringify(data));
  } catch {}
}

function loadCachedWeatherData() {
  try {
    const raw = localStorage.getItem('plantai_weather_cache');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCachedWeatherData(weather) {
  try {
    if (weather) {
      localStorage.setItem('plantai_weather_cache', JSON.stringify(weather));
    }
  } catch {}
}

// ── Per-plant chat history ────────────────────────────────────────────────
// Legacy per-plant chat helpers removed — sessions now managed via plantai_chat_sessions in localStorage

function setCookie(name, value, days = 30) {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${days * 86400}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  return document.cookie.split('; ').find(x => x.startsWith(`${name}=`))?.split('=')[1];
}

function fmtTime(v) {
  if (!v) return 'No update yet';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(v));
}

function ago(v) {
  if (!v) return 'unknown';
  const m = Math.round(Math.max(0, Date.now() - new Date(v).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return `${h}h ago`;
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function statusMoisture(v) {
  const n = num(v);
  if (n === null) return ['No data', 'default'];
  if (n < 30) return ['Dry', 'error'];
  if (n > 75) return ['Wet', 'warning'];
  return ['Optimal', 'primary'];
}

function statusRange(v, low, high) {
  const n = num(v);
  if (n === null) return ['No data', 'default'];
  if (n < low) return ['Low', 'warning'];
  if (n > high) return ['High', 'warning'];
  return ['Stable', 'primary'];
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function estimateVirtualSoil(data, weather, settings) {
  const rain7 = (weather?.daily?.rain_sum || []).slice(0, 7).reduce((a, b) => a + Number(b || 0), 0);
  const relayBoost = (data.readings || []).slice(0, 24).filter(r => r.relay_motor_on).length * 4;
  const soilBase = settings.soilType === 'clay' ? 50 : settings.soilType === 'sandy' ? 28 : settings.soilType === 'silt' ? 42 : 38;
  const areaPenalty = Math.min(12, Math.max(0, Number(settings.fieldAreaSqM || 10) - 10) * 0.15);
  return Math.round(clamp(soilBase + rain7 * 3.2 + relayBoost - areaPenalty, 8, 92));
}

function computeHealthScore(latest, weather, settings) {
  let score = 100;
  const activeProfile = plantProfiles[settings.plantType] || plantProfiles.millet;
  const temp = num(latest.temperature_c), hum = num(latest.humidity_percent), soil = num(latest.soil_moisture_percent);
  const n = num(latest.npk_n), p = num(latest.npk_p), k = num(latest.npk_k);
  
  if (temp !== null) {
    if (temp < activeProfile.tempMin || temp > activeProfile.tempMax) score -= 15;
    else if (temp < (activeProfile.tempMin + 3) || temp > (activeProfile.tempMax - 3)) score -= 5;
  } else score -= 8;
  
  if (hum !== null) {
    if (hum < activeProfile.humidityMin || hum > activeProfile.humidityMax) score -= 12;
    else if (hum < (activeProfile.humidityMin + 5) || hum > (activeProfile.humidityMax - 5)) score -= 5;
  } else score -= 6;
  
  if (soil !== null) {
    if (soil < activeProfile.moistureMin || soil > activeProfile.moistureMax) score -= 22;
    else if (soil < (activeProfile.moistureMin + 8) || soil > (activeProfile.moistureMax - 8)) score -= 8;
  } else score -= 10;
  
  if (n !== null) {
    if (n < activeProfile.npk.n.min || n > activeProfile.npk.n.max) score -= 7;
  } else score -= 4;
  
  if (p !== null) {
    if (p < activeProfile.npk.p.min || p > activeProfile.npk.p.max) score -= 7;
  } else score -= 4;
  
  if (k !== null) {
    if (k < activeProfile.npk.k.min || k > activeProfile.npk.k.max) score -= 7;
  } else score -= 4;

  const rainToday = num(weather?.current?.rain) || 0;
  if (rainToday > 20 && soil !== null && soil > activeProfile.moistureMax) score -= 8;
  if (settings.useVirtualSoil) score -= 3;
  return Math.round(clamp(score, 35, 99));
}

function getIrrigationDelayStatus(weather, settings) {
  if (!weather) {
    const hasCoords = settings?.latitude !== undefined && settings?.longitude !== undefined && settings?.latitude !== null && settings?.longitude !== null && settings?.latitude !== '' && settings?.longitude !== '';
    return {
      suspended: false,
      reason: hasCoords
        ? 'No weather data available. Network error or API limit reached.'
        : 'No weather data available. Set location coordinates in Settings.',
      icon: 'wb_sunny',
      color: '#4ade80'
    };
  }
  
  // 1. Current rain check
  const currentRain = Number(weather.current?.rain || weather.current?.precipitation || 0);
  if (currentRain > 0) {
    return {
      suspended: true,
      reason: `Active precipitation: ${currentRain} mm/hr. Irrigation suspended.`,
      icon: 'rainy',
      color: '#38bdf8' // Blue
    };
  }
  
  // 2. Forecast rain check (probability + volume today)
  const dailyProb = weather.daily?.precipitation_probability_max?.[0];
  const dailyRain = weather.daily?.precipitation_sum?.[0] || weather.daily?.rain_sum?.[0];
  const probVal = dailyProb !== undefined ? Number(dailyProb) : 0;
  const rainVal = dailyRain !== undefined ? Number(dailyRain) : 0;
  
  if (probVal > 40 && rainVal > 1.0) {
    return {
      suspended: true,
      reason: `High rain forecast: ${probVal}% chance (${rainVal.toFixed(1)} mm). Irrigation delayed to save water.`,
      icon: 'cloudy_snowing',
      color: '#60a5fa' // Blue
    };
  }

  // 3. Historical rain check (yesterday)
  const rainHistory = weather.daily?.precipitation_sum || weather.daily?.rain_sum || [];
  if (rainHistory.length >= 2) {
    const yesterdayRain = Number(rainHistory[rainHistory.length - 2] || 0);
    if (yesterdayRain > 10) {
      return {
        suspended: true,
        reason: `Significant rainfall yesterday (${yesterdayRain.toFixed(1)} mm). Soil remains saturated.`,
        icon: 'water_drop',
        color: '#a78bfa' // Purple
      };
    }
  }

  return {
    suspended: false,
    reason: 'Clear skies and dry soil conditions. Auto-schedules permitted.',
    icon: 'wb_sunny',
    color: '#4ade80' // Green
  };
}

function effectiveLatest(data, weather, settings) {
  const latest = { ...data.latest };
  if (settings.useVirtualSoil) {
    latest.soil_moisture_percent = estimateVirtualSoil(data, weather, settings);
  }
  return latest;
}

function aggregateReadings(readings, intervalMinutes) {
  if (!readings || readings.length === 0) return [];
  const mins = Number(intervalMinutes);
  if (!mins || mins <= 1) return readings;
  
  const intervalMs = mins * 60 * 1000;
  const groups = {};
  
  readings.forEach(r => {
    if (!r.recorded_at) return;
    const time = new Date(r.recorded_at).getTime();
    if (isNaN(time)) return;
    const bucketTime = Math.floor(time / intervalMs) * intervalMs;
    if (!groups[bucketTime]) {
      groups[bucketTime] = [];
    }
    groups[bucketTime].push(r);
  });
  
  const aggregated = Object.keys(groups).map(bucketStr => {
    const bucketTime = Number(bucketStr);
    const list = groups[bucketTime];
    
    let sumTemp = 0, countTemp = 0;
    let sumHum = 0, countHum = 0;
    let sumSoil = 0, countSoil = 0;
    let sumN = 0, countN = 0;
    let sumP = 0, countP = 0;
    let sumK = 0, countK = 0;
    let relayOnCount = 0;
    
    list.forEach(item => {
      if (item.temperature_c !== null && item.temperature_c !== undefined) {
        sumTemp += Number(item.temperature_c);
        countTemp++;
      }
      if (item.humidity_percent !== null && item.humidity_percent !== undefined) {
        sumHum += Number(item.humidity_percent);
        countHum++;
      }
      if (item.soil_moisture_percent !== null && item.soil_moisture_percent !== undefined) {
        sumSoil += Number(item.soil_moisture_percent);
        countSoil++;
      }
      if (item.npk_n !== null && item.npk_n !== undefined) {
        sumN += Number(item.npk_n);
        countN++;
      }
      if (item.npk_p !== null && item.npk_p !== undefined) {
        sumP += Number(item.npk_p);
        countP++;
      }
      if (item.npk_k !== null && item.npk_k !== undefined) {
        sumK += Number(item.npk_k);
        countK++;
      }
      if (item.relay_motor_on) {
        relayOnCount++;
      }
    });
    
    return {
      id: list[0]?.id,
      device_id: list[0]?.device_id,
      plant_id: list[0]?.plant_id,
      soil_sensor_type: list[0]?.soil_sensor_type,
      npk_source: list[0]?.npk_source,
      recorded_at: new Date(bucketTime).toISOString(),
      temperature_c: countTemp > 0 ? Math.round((sumTemp / countTemp) * 10) / 10 : null,
      humidity_percent: countHum > 0 ? Math.round(sumHum / countHum) : null,
      soil_moisture_percent: countSoil > 0 ? Math.round(sumSoil / countSoil) : null,
      npk_n: countN > 0 ? Math.round(sumN / countN) : null,
      npk_p: countP > 0 ? Math.round(sumP / countP) : null,
      npk_k: countK > 0 ? Math.round(sumK / countK) : null,
      relay_motor_on: relayOnCount > (list.length / 2),
    };
  });
  
  return aggregated.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
}

function SpeedometerGauge({ value, max, unit, label, statusText, statusColor = 'var(--accent-color)', icon }) {
  // Circumference of r=38 circle = 2π×38 ≈ 238.76
  // 240° arc = (240/360) × 238.76 ≈ 159.17; gap = remaining 120° ≈ 79.59
  const R = 38;
  const CIRC = 2 * Math.PI * R; // ≈ 238.76
  const arcFraction = 240 / 360;  // 240° span
  const arcLen = CIRC * arcFraction; // ≈ 159.17
  const gapLen = CIRC - arcLen;     // ≈ 79.59

  const p = clamp((num(value) || 0) / max, 0, 1);
  const filled = arcLen * p;
  const dashOffset = arcLen - filled; // offset from end → we subtract filled from total

  // Needle: starts at -120° (left end of arc), sweeps 240° total
  const needleDeg = -120 + p * 240;

  return (
    <div className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl border border-white/10 rounded-[36px] p-4 flex flex-col items-center justify-center relative overflow-hidden transition-all hover:scale-[1.02] shadow-2xl">
      <div className="relative flex items-center justify-center" style={{ width: 108, height: 108 }}>
        <svg width="108" height="108" viewBox="0 0 108 108" style={{ overflow: 'visible' }}>
          {/* Tick marks at 0%, 25%, 50%, 75%, 100% */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, idx) => {
            const tickDeg = -120 + t * 240;
            const rad = (tickDeg - 90) * (Math.PI / 180);
            const cx = 54, cy = 54;
            const outer = R + 2;
            const inner = R - 2;
            return (
              <line
                key={idx}
                x1={cx + inner * Math.cos(rad)}
                y1={cy + inner * Math.sin(rad)}
                x2={cx + outer * Math.cos(rad)}
                y2={cy + outer * Math.sin(rad)}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            );
          })}

          {/* Background arc track (full 240°) */}
          <circle
            cx="54" cy="54" r={R}
            fill="transparent"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="7"
            strokeDasharray={`${arcLen} ${gapLen}`}
            strokeLinecap="round"
            transform="rotate(150 54 54)"
          />

          {/* Filled color arc */}
          <circle
            cx="54" cy="54" r={R}
            fill="transparent"
            stroke={statusColor}
            strokeWidth="8"
            strokeDasharray={`${filled} ${CIRC - filled}`}
            strokeLinecap="round"
            transform="rotate(150 54 54)"
            style={{
              transition: 'stroke-dasharray 0.85s cubic-bezier(0.25, 1, 0.5, 1)',
              filter: `drop-shadow(0 0 4px ${statusColor})`,
            }}
          />

          {/* Needle — thin tapered line from center toward arc */}
          <line
            x1="54" y1="54"
            x2={54 + (R - 8) * Math.cos((needleDeg - 90) * Math.PI / 180)}
            y2={54 + (R - 8) * Math.sin((needleDeg - 90) * Math.PI / 180)}
            stroke={statusColor}
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              transition: 'x2 0.85s cubic-bezier(0.25,1,0.5,1), y2 0.85s cubic-bezier(0.25,1,0.5,1)',
              filter: `drop-shadow(0 0 3px ${statusColor})`,
            }}
          />

          {/* Needle tail (short back-line for realism) */}
          <line
            x1="54" y1="54"
            x2={54 + 6 * Math.cos((needleDeg + 90) * Math.PI / 180)}
            y2={54 + 6 * Math.sin((needleDeg + 90) * Math.PI / 180)}
            stroke={statusColor}
            strokeWidth="1.2"
            strokeLinecap="round"
            style={{ opacity: 0.4 }}
          />

          {/* Pivot cap */}
          <circle cx="54" cy="54" r="4" fill="#1c1e14" stroke={statusColor} strokeWidth="1.5" />
          <circle cx="54" cy="54" r="1.5" fill={statusColor} />
        </svg>

        {/* Value readout — centered below the gauge center, inside the arc gap */}
        <div style={{ position: 'absolute', bottom: 2, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: '#fff', fontWeight: 700, lineHeight: 1 }}>
            {value !== null && value !== undefined ? value : '--'}
          </span>
          <span style={{ fontSize: 9, color: '#9ca3af', marginTop: 2, fontFamily: 'monospace' }}>{unit}</span>
        </div>
      </div>

      <div className="text-center mt-2" style={{ lineHeight: 1.5 }}>
        <div className="flex items-center justify-center gap-1 mb-0.5">
          <span className="material-symbols-outlined" style={{ fontSize: 13, color: statusColor }}>{icon}</span>
          <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', fontWeight: 700 }}>{label}</span>
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: statusColor }}>{statusText}</div>
      </div>
    </div>
  );
}

async function fetchModels(provider, apiKey, baseUrl) {
  if (!apiKey) return [];
  const cleanUrl = baseUrl.replace(/\/$/, '');
  const url = `${cleanUrl}/models`;
  
  const headers = {};
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const res = await fetch(url, { method: 'GET', headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch models: ${res.statusText}`);
  }
  const json = await res.json();
  if (json.data && Array.isArray(json.data)) {
    return json.data.map(m => m.id);
  } else if (json.models && Array.isArray(json.models)) {
    return json.models.map(m => m.name.replace(/^models\//, ''));
  }
  return [];
}

async function fetchJson(url, options = {}) {
  const settings = (() => {
    try {
      return JSON.parse(localStorage.getItem('plantai_settings') || '{}');
    } catch {
      return {};
    }
  })();
  const anonKey = settings.supabaseAnonKey || localStorage.getItem('plantai_supabase_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const sessionToken = localStorage.getItem('plantify_user_token') || '';

  if (anonKey) {
    headers['apikey'] = anonKey;
  }

  if (sessionToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`;
  } else if (anonKey) {
    headers['Authorization'] = `Bearer ${anonKey}`;
  }

  const res = await fetch(url, {
    ...options,
    headers
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('plantify_user_token');
      window.dispatchEvent(new CustomEvent('plantify-unauthorized'));
    }
    const err = new Error(json.error || `Request failed ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

async function queueRelayCommand(action, durationMinutes, reason) {
  const url = endpoint('relay-approve');
  if (!url) throw new Error('Supabase endpoint is not set. Open Settings → Supabase Endpoint.');
  const cleanAction = action === 'off' ? 'off' : 'on';
  const durationSeconds = cleanAction === 'on' ? Math.max(1, Number(durationMinutes || 1)) * 60 : null;
  return fetchJson(url, {
    method: 'POST',
    body: JSON.stringify({
      device_id: getActiveDeviceId(),
      action: cleanAction,
      duration_seconds: durationSeconds,
      reason,
      source: 'website_dashboard',
      requested_at: new Date().toISOString(),
    }),
  });
}

function calculateStrokeOffset(value, max = 100) {
  const percent = Math.min(Math.max((num(value) || 0) / max, 0), 1);
  return 251.2 - (251.2 * percent);
}

function calculateDaysSincePlanting(plantingDate) {
  if (!plantingDate) return 0;
  const parts = plantingDate.split('-');
  if (parts.length !== 3) return 0;
  const start = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = today - start;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return isNaN(diffDays) ? 0 : Math.max(0, diffDays);
}

function mapDayToDate(dayStr) {
  const match = String(dayStr).match(/\d+/);
  const dayOffset = match ? parseInt(match[0], 10) - 1 : 0;
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0];
}

// RESTORE AI CARE PLAN HELPERS
function makeFallbackPlan(data, weather, settings) {
  const latest = data.latest || {};
  const soil = num(latest.soil_moisture_percent);
  const temp = num(latest.temperature_c);
  const days = [
    ['Day 1', 'Water Crop', 'Water in morning; recheck moisture after 30 min.', 'Watering', soil !== null && soil < 30 ? 'High' : 'Low', soil !== null && soil < 30 ? Math.min(settings.maxWatering || 5, 10) : 0],
    ['Day 2', 'Inspect crop', 'Inspect leaves for pests, spots, curling, or yellowing.', 'Inspection', 'Medium', 0],
    ['Day 3', 'NPK nutrient check', 'Review NPK trend. Confirm before adding fertilizer.', 'Nutrients', 'Medium', 0],
    ['Day 4', 'Soil drainage check', (weather?.daily?.rain_sum || []).slice(0, 7).some(x => Number(x) > 0) ? 'Adjust irrigation based on recent rain history.' : 'Light watering only if soil is dry.', 'Soil', 'Medium', 0],
    ['Day 5', 'Add shade / sun check', temp !== null && temp > 38 ? 'Add shade during peak afternoon heat.' : 'Maintain normal sunlight exposure.', 'Climate', temp !== null && temp > 38 ? 'High' : 'Low', 0],
    ['Day 6', 'Check drainage', 'Check drainage and root-zone moisture before watering.', 'Soil', 'Medium', 0],
    ['Day 7', 'Re-analyze crop health', 'Generate a fresh plan after new sensor readings.', 'Review', 'Medium', 0],
  ];
  return {
    summary: `Rule-based care plan for ${settings.plantName || 'your plant'} using current ESP32 and weather data.`,
    weatherRisk: weather?.current ? `Current weather ${weather.current.temperature_2m ?? '--'}°C; recent 7-day rain history included.` : 'Weather unavailable. Set latitude/longitude in Settings.',
    wateringPlan: soil !== null && soil < 30 ? { action: 'Water recommended', durationMinutes: Math.min(settings.maxWatering || 5, 10), confidence: 78, reason: 'Soil moisture is below threshold.' } : { action: 'No immediate watering', durationMinutes: 0, confidence: 70, reason: 'Soil moisture is not critically low.' },
    fertilizerPlan: { recommendation: 'Use NPK values as guidance only. Confirm unusual readings before fertilizer.', confidence: 62 },
    sevenDaySchedule: days.map(([day, task, description, category, priority, durationMinutes]) => ({ day, task, description, category, priority, durationMinutes })),
    relayRecommendation: soil !== null && soil < 30 ? { action: 'on', durationMinutes: Math.min(settings.maxWatering || 5, 10), safety: 'Approve only if relay and pump are tested.' } : { action: 'off', durationMinutes: 0, safety: 'No watering command needed.' },
    extraNotes: ['This fallback appears because the AI provider did not return valid JSON or key is missing.', plantProfiles[settings.plantType]?.ideal || 'Plant ideal conditions unavailable.'],
  };
}

function parseCarePlan(text, data, weather, settings) {
  try {
    let cleaned = String(text).trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    } else {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '');
    }
    const parsed = JSON.parse(cleaned);
    return {
      summary: parsed.summary || parsed.overview || 'Care plan generated.',
      weatherRisk: parsed.weatherRisk || parsed.weather_risk || parsed.weather || '',
      wateringPlan: parsed.wateringPlan || parsed.watering_plan || null,
      fertilizerPlan: parsed.fertilizerPlan || parsed.fertilizer_plan || parsed.fertilizerRecommendation || null,
      sevenDaySchedule: parsed.sevenDaySchedule || parsed.seven_day_schedule || parsed.schedule || [],
      relayRecommendation: parsed.relayRecommendation || parsed.relay_recommendation || null,
      extraNotes: parsed.extraNotes || parsed.extra_notes || parsed.notes || [],
      raw: parsed,
    };
  } catch {
    const fb = makeFallbackPlan(data, weather, settings);
    fb.extraNotes = [`AI returned non-JSON text. Showing fallback chart and preserving raw text below.`, text];
    return fb;
  }
}

function syncPlanTasksToLog(parsedPlan) {
  if (!parsedPlan || !Array.isArray(parsedPlan.sevenDaySchedule) || parsedPlan.sevenDaySchedule.length === 0) return;
  try {
    const currentTasks = loadTasks();
    const activeNonAiTasks = currentTasks.filter(t => !t.isAi || t.done);
    const newAiTasks = parsedPlan.sevenDaySchedule.map((item, idx) => {
      const dateStr = mapDayToDate(item.day || `Day ${idx + 1}`);
      const title = item.task || `AI Task ${item.day}`;
      const alreadyCompleted = activeNonAiTasks.some(t => t.isAi && t.done && t.title === title && t.due === dateStr);
      if (alreadyCompleted) return null;
      return {
        id: `ai-${Date.now()}-${idx}`,
        title,
        description: item.description || '',
        due: dateStr,
        done: false,
        category: item.category || 'Other',
        priority: item.priority || 'Medium',
        durationMinutes: Number(item.durationMinutes || 0),
        isAi: true
      };
    }).filter(Boolean);
    saveTasks([...activeNonAiTasks, ...newAiTasks]);
  } catch (e) {
    console.error('Error syncing AI tasks:', e);
  }
}

function saveCarePlan(plan) {
  try {
    const json = JSON.stringify(plan);
    localStorage.setItem('plantai_care_plan', json);
    localStorage.setItem('plantai_care_plan_updated_at', new Date().toISOString());
    syncPlanTasksToLog(plan);
  } catch (err) {
    console.error('Error saving care plan:', err);
  }
}

function loadCarePlan() {
  try {
    return JSON.parse(localStorage.getItem('plantai_care_plan') || 'null');
  } catch {
    return null;
  }
}

function aiContext(data, weather, settings, aggregatedReadings = []) {
  return {
    plant: {
      name: settings.plantName,
      type: plantProfiles[settings.plantType]?.label,
      ideal_conditions: plantProfiles[settings.plantType]?.ideal,
      location: `${settings.city}, ${settings.country}`,
      field_area_sq_m: settings.fieldAreaSqM,
      soil_type: settings.soilType
    },
    latest_sensor_data: effectiveLatest(data, weather, settings),
    raw_latest_sensor_data: data.latest,
    sensor_history: (aggregatedReadings && aggregatedReadings.length > 0 ? aggregatedReadings : data.readings || []).slice(0, 24),
    weather_current_and_7day_history: weather,
    virtual_soil_enabled: settings.useVirtualSoil,
    motor_flow_rate: '1 liter per second',
    care_preferences: { depth: settings.depth, style: settings.careStyle, budget: settings.budget }
  };
}

async function directAi(settings, messages, options = {}) {
  if (!settings.apiKey) throw new Error('Add an AI API key in Settings first.');
  const url = `${settings.baseUrl.replace(/\/$/, '')}/chat/completions`;
  const body = {
    model: settings.model,
    messages,
    temperature: options.temperature ?? .35
  };
  if (options.json) body.response_format = { type: 'json_object' };
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify(body)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error?.message || json.message || `AI request failed ${res.status}`);
  return json.choices?.[0]?.message?.content || 'No response.';
}

// RESTORE WEATHER FETCHER
async function fetchWeather(settings) {
  const { latitude, longitude } = settings;
  if (latitude === undefined || longitude === undefined || latitude === null || longitude === null || latitude === '' || longitude === '') {
    throw new Error('Coordinates missing');
  }
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,precipitation_probability_max&past_days=7&forecast_days=1&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather fetch failed');
  return res.json();
}

// ---------------- CUSTOM FIELD SELECTOR ----------------

function EnhancedFieldSelector({ settings, setSettings }) {
  const [open, setOpen] = useState(false);
  const activeProfileId = settings.activeFieldId || (settings.fields && settings.fields[0]?.id);
  const activeField = (settings.fields || []).find(f => f.id === activeProfileId) || settings.fields[0];

  return (
    <div className="relative inline-block text-left z-50">
      <div 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-[#1c1e14]/80 text-[var(--accent-color)] border border-white/10 rounded-full px-4 py-2 text-xs font-bold cursor-pointer hover:bg-white/5 hover:border-[var(--accent-color)] transition-all shadow-md"
      >
        <span className="material-symbols-outlined text-[14px]">psychiatry</span>
        <span>{activeField?.name || 'Main Field'}</span>
        <span className="material-symbols-outlined text-[14px] ml-1 opacity-70" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>expand_more</span>
      </div>
      
      {open && (
        <div className="absolute left-0 mt-2 w-48 rounded-2xl shadow-2xl bg-[#13140f] border border-white/10 overflow-hidden backdrop-blur-3xl transform opacity-100 scale-100 transition-all origin-top-left">
          <div className="py-2">
            <div className="px-4 py-2 text-[9px] uppercase tracking-widest text-gray-500 font-bold border-b border-white/5 mb-1">Select Active Zone</div>
            {(settings.fields || []).map(f => (
              <div 
                key={f.id}
                onClick={() => {
                  const next = { ...settings, activeFieldId: f.id, plantType: f.plantType || settings.plantType, plantName: f.plantName || settings.plantName, fieldAreaSqM: f.area || settings.fieldAreaSqM, soilType: f.soilType || settings.soilType };
                  setSettings(next); 
                  saveSettings(next);
                  setOpen(false);
                }}
                className={`px-4 py-3 text-xs font-bold cursor-pointer flex items-center justify-between transition-colors ${activeProfileId === f.id ? 'bg-white/5 text-[var(--accent-color)]' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">{activeProfileId === f.id ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                  {f.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- PLANT SWITCHER PILL ----------------

function PlantSwitcherPill({ settings, setSettings }) {
  const [open, setOpen] = useState(false);

  function switchPlant(type) {
    const activeFieldId = settings.activeFieldId || '1';
    const updatedFields = (settings.fields || []).map(f => {
      if (f.id === activeFieldId) {
        return { ...f, plantType: type, plantName: plantProfiles[type]?.label || type };
      }
      return f;
    });
    const next = { ...settings, plantType: type, fields: updatedFields };
    setSettings(next);
    saveSettings(next);
    setOpen(false);
  }

  const profile = plantProfiles[settings.plantType];
  const emojis = { rice:'🌾', wheat:'🌿', millet:'🌱', tomato:'🍅', chili:'🌶️', brinjal:'🍆', cucumber:'🥒', carrot:'🥕', spinach:'🥬', potato:'🥔', onion:'🧅', capsicum:'🫑', lettuce:'🥗', broccoli:'🥦', custom:'🌿' };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(212,255,0,0.08)', border: '1px solid rgba(212,255,0,0.2)',
          borderRadius: 20, padding: '5px 10px 5px 8px',
          color: 'var(--accent-color)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          maxWidth: 130, overflow: 'hidden',
        }}
      >
        <span style={{ fontSize: 15, flexShrink: 0 }}>{emojis[settings.plantType] || '🌱'}</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {settings.plantName || profile?.label || 'Select Crop'}
        </span>
        <span className="material-symbols-outlined" style={{ fontSize: 14, flexShrink: 0 }}>expand_more</span>
      </button>

      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(13,15,10,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{ background: '#1b1c17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '28px 28px 0 0', width: '100%', maxWidth: 448, maxHeight: '72vh', overflowY: 'auto', paddingBottom: 24 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#1b1c17' }}>
              <span className="font-serif" style={{ fontSize: 18, color: '#e4e3da' }}>Select Crop</span>
              <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '5px 9px', color: '#6b7a55', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Close</button>
            </div>
            {Object.entries(plantProfiles).map(([key, p]) => (
              <button
                key={key}
                onClick={() => switchPlant(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  width: '100%', padding: '12px 20px',
                  background: settings.plantType === key ? 'rgba(212,255,0,0.07)' : 'transparent',
                  border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>{emojis[key] || '🌿'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: settings.plantType === key ? 'var(--accent-color)' : '#dde0c8' }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: '#6b7a55', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.ideal.slice(0, 52)}…</div>
                </div>
                {settings.plantType === key && (
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--accent-color)', flexShrink: 0 }}>check</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ---------------- PREDICTIVE YIELD & MARKET TRACKER ----------------

function YieldPredictor({ settings, score }) {
  const area = settings.fieldAreaSqM || 1000;
  const maxYieldKg = (area * 0.85).toFixed(0); 
  const estYieldKg = (area * 0.85 * (score / 100)).toFixed(0);
  
  return (
    <section className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl rounded-[30px] p-6 border border-white/10 shadow-2xl mt-4 relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-[var(--accent-color)]/10 blur-3xl rounded-full"></div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-serif text-2xl" style={{ color: 'var(--accent-color)' }}>Yield Predictor</h3>
          <p className="text-xs text-gray-400">Based on real-time health & weather</p>
        </div>
        <span className="material-symbols-outlined text-[var(--accent-color)] text-3xl opacity-80">monitoring</span>
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-4xl font-black">{estYieldKg}</span>
        <span className="text-gray-400 font-bold mb-1">kg</span>
      </div>
      <div className="w-full bg-black/40 rounded-full h-2 mb-2 overflow-hidden">
        <div className="h-full transition-all duration-1000 ease-out" style={{ width: `${score}%`, backgroundColor: 'var(--accent-color)' }}></div>
      </div>
      <p className="text-[10px] text-gray-500 font-mono">ESTIMATED POTENTIAL: {maxYieldKg} kg ({(100 - score).toFixed(1)}% loss risk)</p>
    </section>
  );
}

const INDIAN_STATES = [
  { value: '', label: 'All States (Auto)' },
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Assam', label: 'Assam' },
  { value: 'Bihar', label: 'Bihar' },
  { value: 'Chhattisgarh', label: 'Chhattisgarh' },
  { value: 'Gujarat', label: 'Gujarat' },
  { value: 'Haryana', label: 'Haryana' },
  { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
  { value: 'Jharkhand', label: 'Jharkhand' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Keralam', label: 'Keralam (Kerala)' },
  { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Odisha', label: 'Odisha' },
  { value: 'Punjab', label: 'Punjab' },
  { value: 'Rajasthan', label: 'Rajasthan' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Telangana', label: 'Telangana' },
  { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
  { value: 'Uttarakhand', label: 'Uttarakhand' },
  { value: 'West Bengal', label: 'West Bengal' }
];

function MarketTracker({ settings }) {
  const crop = settings.plantName || 'Crop';
  const plantType = settings.plantType || 'custom';

  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lang = settings.language || 'en';

  useEffect(() => {
    const commodityMapping = {
      rice: 'Rice',
      wheat: 'Wheat',
      millet: 'Bajra',
      tomato: 'Tomato',
      chili: 'Chilli',
      brinjal: 'Brinjal',
      cucumber: 'Cucumber',
      carrot: 'Carrot',
      spinach: 'Spinach',
      potato: 'Potato',
      onion: 'Onion',
      capsicum: 'Capsicum',
      lettuce: 'Lettuce',
      broccoli: 'Broccoli'
    };

    const targetCommodity = commodityMapping[plantType] || '';
    if (!targetCommodity) {
      setLiveData(null);
      setError('');
      return;
    }

    let active = true;
    setLoading(true);
    setError('');

    const supabaseUrl = settings.supabaseUrl || localStorage.getItem('plantai_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
    let formattedUrl = supabaseUrl.trim();
    if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    if (!formattedUrl) {
      setLiveData(null);
      setError(lang === 'en' ? 'Supabase endpoint not configured. Real-time Mandi price tracker requires backend connection.' : lang === 'hi' ? 'सुपाबेस एंडपॉइंट कॉन्फ़िगर नहीं है। वास्तविक समय मंडी मूल्य ट्रैकर के लिए बैकएंड कनेक्शन की आवश्यकता होती है।' : 'Supabase এন্ডপয়েন্ট কনফিগার করা নেই। রিয়েল-টাইম মান্ডি মূল্য ট্র্যাকারের জন্য ব্যাকএন্ড সংযোগ প্রয়োজন।');
      setLoading(false);
      return;
    }

    let url = `${formattedUrl}/functions/v1/mandi-prices?commodity=${targetCommodity}`;
    if (settings.mandiState) {
      url += `&state=${encodeURIComponent(settings.mandiState)}`;
    }
    if (settings.mandiMarket) {
      url += `&market=${encodeURIComponent(settings.mandiMarket)}`;
    }

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (!active) return;
        if (json.error) {
          throw new Error(json.error.message || json.error);
        }
        const records = json.records || [];
        if (records.length > 0) {
          let sumPrice = 0;
          let count = 0;
          let minVal = Infinity;
          let maxVal = -Infinity;
          let latestRecord = records[0];

          records.forEach(r => {
            const p = Number(r.modal_price);
            const mn = Number(r.min_price);
            const mx = Number(r.max_price);
            if (!isNaN(p) && p > 0) {
              sumPrice += p;
              count++;
              if (mn < minVal) minVal = mn;
              if (mx > maxVal) maxVal = mx;
            }
          });

          if (count > 0) {
            setLiveData({
              price: (sumPrice / count) / 100, // convert ₹/quintal to ₹/kg
              min: minVal === Infinity ? null : minVal / 100,
              max: maxVal === -Infinity ? null : maxVal / 100,
              market: latestRecord.market || 'Agmarknet',
              district: latestRecord.district || '',
              state: latestRecord.state || '',
              date: latestRecord.arrival_date || ''
            });
          } else {
            setError(lang === 'en' ? 'No recent market rates found for chosen filters.' : lang === 'hi' ? 'चुने गए फ़िल्टर के लिए कोई हालिया बाजार दर नहीं मिली।' : 'নির্বাচিত ফিল্টারগুলির জন্য কোনও সাম্প্রতিক বাজার দর পাওয়া যায়নি।');
          }
        } else {
          setError(lang === 'en' ? 'No mandi records found for this crop.' : lang === 'hi' ? 'इस फसल के लिए कोई मंडी रिकॉर्ड नहीं मिला।' : 'এই ফসলের জন্য কোনো মান্ডি রেকর্ড পাওয়া যায়নি।');
        }
      })
      .catch(err => {
        if (!active) return;
        console.error('Mandi price API error:', err);
        setError(err.message || 'Failed to fetch prices');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [plantType, lang, settings.supabaseUrl, settings.mandiState, settings.mandiMarket]);

  return (
    <section className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl rounded-[30px] p-6 border border-white/10 shadow-2xl mt-4 relative">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-serif text-2xl" style={{ color: 'var(--accent-color)' }}>Market Tracker</h3>
          <p className="text-xs text-gray-400">
            {liveData ? `Live Mandi Rates (${liveData.date})` : 'Live Mandi pricing (India)'}
          </p>
        </div>
        <span className="material-symbols-outlined text-[var(--accent-color)] text-3xl opacity-80">storefront</span>
      </div>

      <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-3">
        {loading ? (
          <div className="text-xs text-[var(--accent-color)] font-mono animate-pulse py-2 flex items-center gap-2">
            <span className="animate-spin text-base">🔄</span>
            {lang === 'en' ? 'Fetching live prices securely...' : lang === 'hi' ? 'सुरक्षित रूप से लाइव दरें प्राप्त की जा रही हैं...' : 'নিরাপদভাবে লাইভ দর আনা হচ্ছে...'}
          </div>
        ) : error ? (
          <div className="text-xs text-red-400 font-mono py-2 space-y-1">
            <div className="font-bold flex items-center gap-1">⚠️ {lang === 'en' ? 'Live Price Error:' : lang === 'hi' ? 'लाइव मूल्य त्रुटि:' : 'লাইভ মূল্য ত্রুটি:'}</div>
            <p className="text-[11px] text-gray-400 leading-normal">{error}</p>
          </div>
        ) : liveData ? (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl">🌾</div>
              <div>
                <div className="font-bold">{crop}</div>
                <div className="text-[10px] text-gray-400 font-mono">
                  {`${liveData.market.toUpperCase()} Mandi (${liveData.state})`}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-black text-xl">
                ₹{liveData.price.toFixed(2)}
                <span className="text-xs text-gray-400 font-normal">/kg</span>
              </div>
              {liveData.min && liveData.max && (
                <div className="text-[9px] text-gray-400 font-mono">
                  RANGE: ₹{liveData.min.toFixed(1)} - ₹{liveData.max.toFixed(1)}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

const TASK_STORAGE_KEY = 'plantai_tasks';

function loadTasks() {
  try { return JSON.parse(localStorage.getItem(TASK_STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function saveTasks(tasks) {
  try {
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Error saving tasks:', err);
  }
}

function TasksTab({ settings, setSettings, weather, delayStatus }) {
  const t = dict[settings?.language || 'en'] || dict.en;
  const lang = settings?.language || 'en';
  const [tasks, setTasks] = useState(loadTasks);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDue, setNewDue] = useState(getLocalIsoDate());
  const [newCategory, setNewCategory] = useState('Other');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDuration, setNewDuration] = useState(5);
  const [actionMsg, setActionMsg] = useState('');
  const [busyTaskId, setBusyTaskId] = useState(null);
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const rawPlan = (() => {
    try { return JSON.parse(localStorage.getItem('plantai_care_plan')); }
    catch { return null; }
  })();

  const categories = ['Watering', 'Inspection', 'Nutrients', 'Soil', 'Climate', 'Review', 'Other'];
  const priorities = ['High', 'Medium', 'Low'];

  function addTask() {
    if (!newTitle.trim()) return;
    const next = [
      ...tasks,
      {
        id: `custom-${Date.now()}`,
        title: newTitle.trim(),
        description: newDescription.trim(),
        due: newDue || getLocalIsoDate(),
        done: false,
        category: newCategory,
        priority: newPriority,
        durationMinutes: newCategory === 'Watering' ? Number(newDuration) : 0,
        isAi: false
      }
    ];
    setTasks(next);
    saveTasks(next);
    setNewTitle('');
    setNewDescription('');
    setNewDue(getLocalIsoDate());
    setNewCategory('Other');
    setNewPriority('Medium');
    setNewDuration(5);
  }

  function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    // Block completing future tasks
    if (!task.done && task.due) {
      const todayStr = getLocalIsoDate();
      if (task.due > todayStr) {
        alert(`This task is scheduled for ${task.due}. You can only complete it on or after the due date.`);
        return;
      }
    }
    const next = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTasks(next);
    saveTasks(next);
  }

  function deleteTask(id) {
    const next = tasks.filter(t => t.id !== id);
    setTasks(next);
    saveTasks(next);
  }

  function forceSyncPlan() {
    if (rawPlan) {
      syncPlanTasksToLog(rawPlan);
      setTasks(loadTasks());
      setActionMsg(t.actionSyncSuccess);
      setTimeout(() => setActionMsg(''), 3000);
    } else {
      setActionMsg(t.actionNoPlan);
      setTimeout(() => setActionMsg(''), 3000);
    }
  }

  async function executeWatering(duration, sourceName) {
    if (delayStatus?.suspended) {
      const confirmOverride = window.confirm(`WEATHER DELAY ACTIVE:\n"${delayStatus.reason}"\n\nAre you sure you want to override this safety suspension and start the irrigation pump?`);
      if (!confirmOverride) return;
    }
    setBusyTaskId(sourceName);
    setActionMsg(`Queueing pump for ${duration} minute(s)...`);
    try {
      const result = await queueRelayCommand('on', Number(duration), `Tasks execution: ${sourceName}`);
      setActionMsg(result.message || `Motor command successfully queued for ${duration}m.`);
    } catch (e) {
      setActionMsg(`Failed to run pump: ${e.message}`);
    } finally {
      setBusyTaskId(null);
      setTimeout(() => setActionMsg(''), 4000);
    }
  }

  const pending = tasks.filter(t => !t.done);
  const completed = tasks.filter(t => t.done);

  const catTranslations = {
    Watering: lang === 'en' ? 'Watering' : lang === 'hi' ? 'सिंचाई' : 'সেচ',
    Inspection: lang === 'en' ? 'Inspection' : lang === 'hi' ? 'निरीक्षण' : 'পরিদর্শন',
    Nutrients: lang === 'en' ? 'Nutrients' : lang === 'hi' ? 'पोषक तत्व' : 'পুষ্টি',
    Soil: lang === 'en' ? 'Soil' : lang === 'hi' ? 'मिट्टी' : 'মাটি',
    Climate: lang === 'en' ? 'Climate' : lang === 'hi' ? 'जलवायु' : 'জলবায়ু',
    Review: lang === 'en' ? 'Review' : lang === 'hi' ? 'समीक्षा' : 'পর্যালোচনা',
    Other: lang === 'en' ? 'Other' : lang === 'hi' ? 'अन्य' : 'অন্যান্য'
  };

  const priorityTranslations = {
    High: lang === 'en' ? 'High' : lang === 'hi' ? 'उच्च' : 'উচ্চ',
    Medium: lang === 'en' ? 'Medium' : lang === 'hi' ? 'मध्यम' : 'মাঝারি',
    Low: lang === 'en' ? 'Low' : lang === 'hi' ? 'निम्न' : 'কম'
  };

  return (
    <div className="space-y-5 pb-32">
      <header className="mb-2 mt-2 flex justify-between items-start">
        <div>
          <h2 className="font-serif text-4xl mb-1" style={{ color: 'var(--accent-color)', lineHeight: 1.1 }}>{lang === 'en' ? 'Farm Tasks' : lang === 'hi' ? 'फार्म कार्य' : 'খামার কাজ'}<br/>{lang === 'en' ? '& Care Plan' : lang === 'hi' ? '& देखभाल योजना' : '& কেয়ার প্ল্যান'}</h2>
          <p className="text-sm text-gray-400">{t.tasksDesc}</p>
        </div>
        {rawPlan && (
          <button
            onClick={forceSyncPlan}
            className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-[var(--accent-color)] text-xs font-bold rounded-full cursor-pointer flex items-center gap-1 transition-all"
          >
            <span className="material-symbols-outlined text-xs">sync</span>
            {t.syncAiTasks}
          </button>
        )}
      </header>

      {actionMsg && (
        <div className="p-3 text-xs bg-[#1c1e14] border border-white/10 text-[var(--accent-color)] rounded-xl font-mono animate-pulse">
          {actionMsg}
        </div>
      )}

      {/* Add Task Form */}
      <div className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl border border-white/10 rounded-[30px] p-5 shadow-2xl space-y-3">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[var(--accent-color)] text-xl">add_task</span> {t.addTaskHeader}
        </h3>
        
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder={t.taskNamePlaceholder}
          className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent-color)] transition-colors"
        />

        <textarea
          value={newDescription}
          onChange={e => setNewDescription(e.target.value)}
          placeholder={t.taskDescPlaceholder}
          rows="2"
          className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[var(--accent-color)] transition-colors"
        />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-400 block mb-1 font-bold">{t.category}</label>
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:border-[var(--accent-color)]"
            >
              {categories.map(c => <option key={c} value={c} className="bg-[#13140f]">{catTranslations[c] || c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-1 font-bold">{t.priority}</label>
            <select
              value={newPriority}
              onChange={e => setNewPriority(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:border-[var(--accent-color)]"
            >
              {priorities.map(p => <option key={p} value={p} className="bg-[#13140f]">{priorityTranslations[p] || p}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-400 block mb-1 font-bold">{t.dueLabel}</label>
            <input
              type="date"
              value={newDue}
              onChange={e => setNewDue(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--accent-color)]"
            />
          </div>
          {newCategory === 'Watering' && (
            <div>
              <label className="text-[10px] text-gray-400 block mb-1 font-bold">{t.pumpDurationLabel}</label>
              <input
                type="number"
                value={newDuration}
                onChange={e => setNewDuration(e.target.value)}
                min="1"
                max="60"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--accent-color)]"
              />
            </div>
          )}
        </div>

        <button
          onClick={addTask}
          className="w-full py-2.5 text-black text-sm font-bold rounded-xl cursor-pointer transition-all hover:opacity-90 mt-2"
          style={{ backgroundColor: 'var(--accent-color)' }}
        >
          {t.addTaskBtn}
        </button>
      </div>

      {/* Pending Tasks */}
      <div className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl border border-white/10 rounded-[30px] p-5 shadow-2xl">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[var(--accent-color)] text-xl">checklist</span> {t.pendingHeader} ({pending.length})
        </h3>
        {pending.length === 0 && <p className="text-xs text-gray-500 text-center py-4">{t.allDone}</p>}
        <div className="space-y-3">
          {pending.map(t => {
            const isExpanded = expandedTaskId === t.id;
            return (
              <div key={t.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-2 transition-all">
                <div className="flex items-start gap-3">
                  <div
                    onClick={() => toggleTask(t.id)}
                    className="w-5 h-5 rounded-full border-2 border-white/30 flex-shrink-0 cursor-pointer hover:border-[var(--accent-color)] transition-colors mt-0.5"
                  />
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedTaskId(isExpanded ? null : t.id)}>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-white truncate">{t.title}</span>
                      {t.isAi && (
                        <span className="text-[8px] bg-[var(--accent-color)]/10 text-[var(--accent-color)] font-mono border border-[var(--accent-color)]/25 px-1.5 py-0.5 rounded-full font-bold">AI</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[9px] mt-1 font-mono text-gray-400">
                      <span className="text-[var(--accent-color)]">{catTranslations[t.category] || t.category}</span>
                      <span>•</span>
                      <span>{lang === 'en' ? 'Due' : lang === 'hi' ? 'देय' : 'নির্ধারিত'}: {t.due}</span>
                      <span>•</span>
                      <span className={
                        t.priority === 'High' ? 'text-red-400 font-bold' :
                        t.priority === 'Medium' ? 'text-orange-400' : 'text-gray-500'
                      }>{priorityTranslations[t.priority] || t.priority}</span>
                    </div>
                  </div>
                  <button onClick={() => deleteTask(t.id)} className="text-gray-600 hover:text-red-400 transition-colors cursor-pointer self-start">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                  </button>
                </div>

                {/* Expandable details / Task Assistance */}
                {isExpanded && (
                  <div className="pl-8 pt-1 text-xs text-gray-300 border-t border-white/5 space-y-2 animate-fade-in">
                    {t.description ? (
                      <p className="leading-relaxed whitespace-pre-wrap">{t.description}</p>
                    ) : (
                      <p className="text-gray-500 italic">{lang === 'en' ? 'No description provided. Click to add details or follow crop guidelines.' : lang === 'hi' ? 'कोई विवरण नहीं दिया गया। विवरण जोड़ने या फसल दिशानिर्देशों का पालन करने के लिए क्लिक करें।' : 'কোন বিবরণ প্রদান করা হয়নি। বিবরণ যোগ করতে বা ফসলের নির্দেশিকা অনুসরণ করতে ক্লিক করুন।'}</p>
                    )}
                    
                    {/* Inbuilt Watering execution option */}
                    {t.category === 'Watering' && (
                      <div className="space-y-2">
                        {delayStatus?.suspended && (
                          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-950/50 border border-amber-800/30">
                            <span className="material-symbols-outlined text-amber-400" style={{ fontSize: 13 }}>warning</span>
                            <p className="text-[10px] text-amber-400 leading-normal">{delayStatus.reason}</p>
                          </div>
                        )}
                        <div className="flex gap-1 flex-wrap">
                          {[2, 5, 10].map(d => (
                            <button
                              key={d}
                              onClick={() => executeWatering(d, t.title)}
                              disabled={busyTaskId !== null}
                              className="text-black font-bold text-[11px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer hover:opacity-90"
                              style={{ backgroundColor: 'var(--accent-color)' }}
                            >
                              <span className="material-symbols-outlined text-[12px]">water_drop</span>
                              {d}{lang === 'en' ? 'm' : lang === 'hi' ? 'मिनट' : 'মিঃ'}
                            </button>
                          ))}
                          {Number(t.durationMinutes) > 0 && ![2,5,10].includes(Number(t.durationMinutes)) && (
                            <button
                              onClick={() => executeWatering(t.durationMinutes, t.title)}
                              disabled={busyTaskId !== null}
                              className="text-white font-bold text-[11px] px-2.5 py-1.5 rounded-lg bg-blue-600 flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[12px]">schedule</span>
                              {t.durationMinutes}{lang === 'en' ? 'm' : lang === 'hi' ? 'मिनट' : 'মিঃ'} (AI)
                            </button>
                          )}
                        </div>
                        {busyTaskId === t.title && <p className="text-[10px] text-blue-400 font-mono">{lang === 'en' ? 'Queuing irrigation command...' : lang === 'hi' ? 'सिंचाई कमान कतारबद्ध हो रही है...' : 'সেচ কমান্ড লাইনে রাখা হচ্ছে...'}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed Tasks */}
      {completed.length > 0 && (
        <div className="bg-[rgba(30,32,26,0.3)] backdrop-blur-xl border border-white/5 rounded-[30px] p-5">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-gray-500">
            <span className="material-symbols-outlined text-xl">task_alt</span> {t.completedHeader} ({completed.length})
          </h3>
          <div className="space-y-2">
            {completed.map(t => (
              <div key={t.id} className="flex items-center gap-3 bg-black/10 p-3 rounded-2xl border border-white/5 opacity-60">
                <div
                  onClick={() => toggleTask(t.id)}
                  className="w-5 h-5 rounded-full border-2 flex-shrink-0 cursor-pointer flex items-center justify-center"
                  style={{ borderColor: 'var(--accent-color)', backgroundColor: 'var(--accent-color)' }}
                >
                  <span className="material-symbols-outlined text-black" style={{ fontSize: 12 }}>check</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm line-through text-gray-500 truncate">{t.title}</div>
                </div>
                <button onClick={() => deleteTask(t.id)} className="text-gray-700 hover:text-red-400 transition-colors cursor-pointer">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive AI Care Plan Hub */}
      {rawPlan ? (
        <div className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl border rounded-[30px] p-5 shadow-2xl relative overflow-hidden" style={{ borderColor: 'color-mix(in srgb, var(--accent-color) 30%, transparent)' }}>
          <div className="absolute top-0 right-0 w-40 h-40 blur-3xl rounded-full" style={{ backgroundColor: 'var(--accent-color)', opacity: 0.06 }}></div>
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2 relative z-10">
            <span className="material-symbols-outlined text-[var(--accent-color)] text-xl">auto_awesome</span> Active AI Plan Hub
          </h3>
          <div className="space-y-4 relative z-10">
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
              <h4 className="font-bold text-xs text-[var(--accent-color)] mb-1">AI Care Overview</h4>
              <p className="text-xs text-gray-300 leading-relaxed">{rawPlan.summary}</p>
              {rawPlan.weatherRisk && (
                <p className="text-[11px] text-orange-400 mt-2 font-mono flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">warning</span>
                  Risk: {rawPlan.weatherRisk}
                </p>
              )}
            </div>

            {rawPlan.wateringPlan && (
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex justify-between items-center flex-wrap gap-2">
                <div className="flex-1 min-w-[200px]">
                  <h4 className="font-bold text-xs text-blue-400">AI Watering Proposal</h4>
                  <p className="text-xs text-gray-300 mt-0.5">{rawPlan.wateringPlan.action} · Confidence: {rawPlan.wateringPlan.confidence}%</p>
                  <p className="text-[10px] text-gray-400 mt-1">{rawPlan.wateringPlan.reason}</p>
                </div>
                <div className="flex gap-1 flex-wrap mt-2">
                  {[2, 5, 10].map(d => (
                    <button
                      key={d}
                      onClick={() => executeWatering(d, 'AI Watering')}
                      disabled={busyTaskId !== null}
                      className="text-black font-bold text-[10px] px-2 py-1.5 rounded-lg flex items-center gap-0.5 cursor-pointer hover:opacity-90 transition-all"
                      style={{ backgroundColor: 'var(--accent-color)' }}
                    >
                      <span className="material-symbols-outlined text-[11px]">water_drop</span>{d}m
                    </button>
                  ))}
                  {rawPlan.wateringPlan.durationMinutes > 0 && ![2,5,10].includes(Number(rawPlan.wateringPlan.durationMinutes)) && (
                    <button
                      onClick={() => executeWatering(rawPlan.wateringPlan.durationMinutes, 'AI Watering')}
                      disabled={busyTaskId !== null}
                      className="text-white font-bold text-[10px] px-2 py-1.5 rounded-lg bg-blue-600 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[11px]">schedule</span>{rawPlan.wateringPlan.durationMinutes}m (AI)
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 7-Day list with description accordion */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-gray-400">7-Day Field Schedule</h4>
              <div className="grid grid-cols-1 gap-2">
                {(rawPlan.sevenDaySchedule || []).map((d, i) => (
                  <div key={i} className="bg-black/20 p-3 rounded-xl border border-white/5 flex flex-col space-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">{d.day}</span>
                        <h5 className="font-bold text-xs text-white">{d.task}</h5>
                      </div>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-lg ${
                        d.priority === 'High' ? 'bg-red-950 text-red-400 border border-red-900/30' :
                        d.priority === 'Medium' ? 'bg-orange-950 text-orange-400 border border-orange-900/30' :
                        'bg-zinc-800 text-gray-400'
                      }`}>{d.priority}</span>
                    </div>
                    {d.description && <p className="text-[11px] text-gray-400 leading-normal">{d.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl border rounded-[30px] p-5 shadow-2xl relative overflow-hidden" style={{ borderColor: 'color-mix(in srgb, var(--accent-color) 30%, transparent)' }}>
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--accent-color)] text-xl">auto_awesome</span> Active AI Plan Hub
          </h3>
          <p className="text-xs text-gray-400 leading-normal">No AI care plan generated yet. Go to the AI Plan tab to run a new analysis.</p>
        </div>
      )}
    </div>
  );
}

// ---------------- SUB-COMPONENTS ----------------

function Dashboard({ data, weather, refresh, refreshing, error, settings, setSettings, setTab }) {
  const latest = effectiveLatest(data, weather, settings);
  const delayStatus = getIrrigationDelayStatus(weather, settings);
  const [relayMsg, setRelayMsg] = useState('');
  const [relayBusy, setRelayBusy] = useState(false);
  const [relayOverride, setRelayOverride] = useState(null);
  const displayedMotorOn = relayOverride ?? Boolean(latest.relay_motor_on);

  useEffect(() => {
    if (latest && Boolean(latest.relay_motor_on) === relayOverride) {
      setRelayOverride(null);
    }
  }, [latest?.relay_motor_on, relayOverride]);

  const score = computeHealthScore(latest, weather, settings);
  const activeProfile = plantProfiles[settings.plantType] || plantProfiles.millet;
  
  const lang = settings.language || 'en';
  const t = dict[lang] || dict.en;
  
  // Custom states matching styling
  const soilMoisture = latest.soil_moisture_percent ?? null;
  const temperature = latest.temperature_c ?? null;
  const humidity = latest.humidity_percent ?? null;
  const weatherTemp = weather?.current?.temperature_2m ?? null;

  const [motorDuration, setMotorDuration] = useState(settings.maxWatering || 5);
  const [keepOnIndefinitely, setKeepOnIndefinitely] = useState(false);

  async function relay(action) {
    if (action === 'on' && delayStatus.suspended) {
      const confirmOverride = window.confirm(`WEATHER DELAY ACTIVE:\n"${delayStatus.reason}"\n\nAre you sure you want to override this safety suspension and start the irrigation pump?`);
      if (!confirmOverride) return;
    }
    setRelayBusy(true);
    setRelayMsg('');
    try {
      const duration = action === 'on' ? (keepOnIndefinitely ? 9999 : Number(motorDuration)) : 0;
      const result = await queueRelayCommand(action, duration, `Dashboard direct ${action.toUpperCase()} command`);
      setRelayOverride(action === 'on');
      setRelayMsg(result.message || `Motor ${action.toUpperCase()} command queued. ESP32 will pick it up on next poll.`);
      setTimeout(() => refresh(true), 1200);
    } catch (e) {
      setRelayMsg(`Relay error: ${e.message}`);
    } finally {
      setRelayBusy(false);
    }
  }

  // NPK ranges evaluation based on crop profile
  const nVal = latest.npk_n ?? 0;
  let nStatus = 'Optimal';
  let nColor = '#4ade80'; // Green base
  if (nVal < activeProfile.npk.n.min) {
    nStatus = 'Low';
    nColor = '#fb923c'; // Amber/Orange
  } else if (nVal > activeProfile.npk.n.max) {
    nStatus = 'High';
    nColor = '#ef4444'; // Red
  }

  const pVal = latest.npk_p ?? 0;
  let pStatus = 'Optimal';
  let pColor = '#f472b6'; // Pink base
  if (pVal < activeProfile.npk.p.min) {
    pStatus = 'Low';
    pColor = '#fb923c'; // Amber/Orange
  } else if (pVal > activeProfile.npk.p.max) {
    pStatus = 'High';
    pColor = '#ef4444'; // Red
  }

  const kVal = latest.npk_k ?? 0;
  let kStatus = 'Optimal';
  let kColor = '#38bdf8'; // Blue base
  if (kVal < activeProfile.npk.k.min) {
    kStatus = 'Low';
    kColor = '#fb923c'; // Amber/Orange
  } else if (kVal > activeProfile.npk.k.max) {
    kStatus = 'High';
    kColor = '#ef4444'; // Red
  }

  // Uniform speedometer status resolution
  const tempStatus = statusRange(temperature, activeProfile.tempMin, activeProfile.tempMax);
  const humStatus = statusRange(humidity, activeProfile.humidityMin, activeProfile.humidityMax);
  const moistureStatus = statusMoisture(soilMoisture);
  const weatherStatus = statusRange(weatherTemp, activeProfile.tempMin, activeProfile.tempMax);

  return (
    <>
      {error && <div className="p-4 mb-4 text-sm bg-red-950/40 text-red-400 rounded-2xl border border-red-900/30">{error}</div>}
      {relayMsg && <div className="p-4 mb-4 text-sm bg-[#1c1e14] rounded-2xl border border-white/5" style={{ color: 'var(--accent-color)', borderColor: 'var(--border-color)' }}>{relayMsg}</div>}
      
      {/* HERO CARD */}
      <section className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl rounded-[40px] p-8 relative overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full" style={{ backgroundColor: 'var(--accent-color)', opacity: 0.1 }}></div>
        <div className="relative z-10">
          
          <div className="mb-4">
            <EnhancedFieldSelector settings={settings} setSettings={setSettings} />
          </div>

          <h1 className="font-serif text-6xl font-black tracking-tight mt-1" style={{ lineHeight: 1.15 }}>{settings.plantName}</h1>
          
          <p className="text-gray-400 mt-3 text-sm" style={{ lineHeight: 1.5 }}>
            {activeProfile.label} · {t.daysSince} {calculateDaysSincePlanting(settings.plantingDate)}
          </p>
          <p className="text-xs text-gray-500 mt-3 border-l-2 pl-3" style={{ borderColor: 'var(--accent-color)', lineHeight: 1.6 }}>
            <strong>{t.idealEnv}</strong> {activeProfile.ideal}
          </p>
          <div className="flex items-center justify-between mt-10">
            <span className="font-mono text-sm font-bold tracking-widest uppercase" style={{ color: 'var(--accent-color)' }}>ESP32-V2.4</span>
            <button
              onClick={() => refresh()}
              disabled={refreshing}
              className="text-black px-5 py-2 rounded-full flex items-center gap-2 font-bold text-sm shadow-lg cursor-pointer"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              {t.refresh}
            </button>
          </div>
        </div>
      </section>

      {/* SENSOR GAUGES */}
      <section className="grid grid-cols-2 gap-4">
        <SpeedometerGauge
          value={temperature}
          max={50}
          unit="°C"
          label={t.temperature}
          statusText={tempStatus[0] === 'Stable' ? 'Optimal' : tempStatus[0]}
          statusColor={
            tempStatus[1] === 'warning' ? '#f43f5e' : 
            tempStatus[1] === 'default' ? '#9ca3af' : 'var(--accent-color)'
          }
          icon="thermostat"
        />

        <SpeedometerGauge
          value={humidity}
          max={100}
          unit="%"
          label={t.humidity}
          statusText={humStatus[0] === 'Stable' ? 'Optimal' : humStatus[0]}
          statusColor={
            humStatus[1] === 'warning' ? '#f43f5e' : 
            humStatus[1] === 'default' ? '#9ca3af' : 'var(--accent-color)'
          }
          icon="humidity_mid"
        />

        <SpeedometerGauge
          value={soilMoisture}
          max={100}
          unit="%"
          label={t.soilMoisture}
          statusText={moistureStatus[0]}
          statusColor={
            moistureStatus[1] === 'error' ? '#ef4444' : 
            moistureStatus[1] === 'warning' ? '#fb923c' : 
            moistureStatus[1] === 'default' ? '#9ca3af' : 'var(--accent-color)'
          }
          icon="water_drop"
        />

        <SpeedometerGauge
          value={weatherTemp}
          max={50}
          unit="°C"
          label={t.weather}
          statusText={weatherStatus[0] === 'Stable' ? 'Favorable' : weatherStatus[0]}
          statusColor={
            weatherStatus[1] === 'warning' ? '#f43f5e' : 
            weatherStatus[1] === 'default' ? '#9ca3af' : 'var(--accent-color)'
          }
          icon="partly_cloudy_day"
        />
      </section>

      {/* WATER MOTOR / RELAY CARD */}
      <section className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl rounded-[40px] p-6 border border-white/10 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-serif text-2xl" style={{ lineHeight: 1.25, marginBottom: 4 }}>{t.waterMotor}</h3>
            <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/5" style={{ color: 'var(--accent-color)' }}>{t.directControl}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t.status}</span>
            <div className="text-xl font-bold mt-1" style={{ color: displayedMotorOn ? 'var(--accent-color)' : '#9ca3af' }}>
              {displayedMotorOn ? 'ON' : 'OFF'}
            </div>
            {data?.latestCommandStatus && (
              <div className="text-[10px] text-gray-400 mt-0.5 flex items-center justify-end gap-1">
                {data.latestCommandStatus === 'pending' && (
                  <>
                    <span className="animate-spin h-2.5 w-2.5 border border-gray-400 border-t-transparent rounded-full inline-block"></span>
                    <span>Queued...</span>
                  </>
                )}
                {data.latestCommandStatus === 'sent' && (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block animate-ping"></span>
                    <span className="text-green-400 font-bold">Active</span>
                  </>
                )}
                {data.latestCommandStatus === 'failed' && (
                  <>
                    <span className="material-symbols-outlined text-red-500 text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                    <span className="text-red-400 font-bold">Error</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Duration Settings */}
        <div className="space-y-3 mb-4 pt-3 border-t border-white/5">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs text-gray-400 font-bold">{t.keepOn}</span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={keepOnIndefinitely}
                onChange={(e) => setKeepOnIndefinitely(e.target.checked)}
                className="rounded border-white/10 text-[var(--accent-color)] bg-[#1c1e14] focus:ring-[var(--accent-color)]"
              />
            </label>
          </div>
          
          {!keepOnIndefinitely && (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Watering Duration</span>
                <span className="font-mono font-bold" style={{ color: 'var(--accent-color)' }}>{motorDuration} minute(s)</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={motorDuration}
                  onChange={(e) => setMotorDuration(Number(e.target.value))}
                  className="flex-1 accent-[var(--accent-color)] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => relay('on')}
            disabled={relayBusy}
            className={`flex-1 py-3 font-bold rounded-xl text-sm transition-all cursor-pointer ${displayedMotorOn ? 'text-black shadow-lg shadow-[var(--accent-color)]/20' : 'bg-transparent border border-white/10 text-white hover:bg-white/5'}`}
            style={{ backgroundColor: displayedMotorOn ? 'var(--accent-color)' : 'transparent' }}
          >
            TURN ON
          </button>
          <button
            onClick={() => relay('off')}
            disabled={relayBusy}
            className={`flex-1 py-3 font-bold rounded-xl text-sm transition-all cursor-pointer ${!displayedMotorOn ? 'text-black shadow-lg shadow-[var(--accent-color)]/20' : 'bg-transparent border border-white/10 text-white hover:bg-white/5'}`}
            style={{ backgroundColor: !displayedMotorOn ? 'var(--accent-color)' : 'transparent' }}
          >
            TURN OFF
          </button>
        </div>
        <p className="text-[10px] text-gray-500 font-mono mt-3 leading-relaxed">
          ON command runs the water pump relay for {keepOnIndefinitely ? 'indefinitely (9999 mins)' : `${motorDuration} minute(s)`} unless manual stop is sent.
        </p>

        {/* Smart Irrigation Delay Status Widget */}
        <div className="mt-4 p-4 rounded-2xl bg-black/30 border border-white/5 flex gap-3 items-start animate-fade-in">
          <span className="material-symbols-outlined shrink-0 text-xl" style={{ color: delayStatus.color }}>
            {delayStatus.icon}
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white">Smart Delay Advisor</h4>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                delayStatus.suspended ? 'bg-amber-950 text-amber-400 border border-amber-900/30' : 'bg-green-950 text-green-400 border border-green-900/30'
              }`}>
                {delayStatus.suspended ? 'SUSPENDED' : 'PERMITTED'}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-normal">{delayStatus.reason}</p>
          </div>
        </div>
      </section>

      {/* AI INSIGHTS */}
      <section className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl rounded-[40px] p-6 flex items-center justify-between border border-white/10 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle className="text-white/5" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
              <circle
                cx="50" cy="50" fill="transparent" r="40"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={calculateStrokeOffset(score, 100)}
                strokeLinecap="round"
                style={{
                  color: 'var(--accent-color)',
                  filter: 'drop-shadow(0 0 2px var(--accent-color))'
                }}
              ></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{score}%</span>
            </div>
          </div>
          <div>
            <h3 className="font-serif text-2xl">Plantify AI</h3>
            <p className="text-gray-400 text-sm leading-tight">Overall Health<br />Summary</p>
          </div>
        </div>
        <button
          onClick={() => setTab('ai')}
          className="text-black px-5 py-3 rounded-full font-bold flex items-center gap-2 hover:opacity-90 shadow-lg cursor-pointer transition-all hover:scale-105"
          style={{ backgroundColor: 'var(--accent-color)' }}
        >
          <span className="material-symbols-outlined text-black text-xl">psychology</span>
          <span>Run Analysis</span>
        </button>
      </section>

      {/* NUTRIENT LEVELS */}
      <section className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl rounded-[40px] p-8 space-y-8 border border-white/10 shadow-2xl pb-12">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6" style={{ color: 'var(--accent-color)' }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3l8 18H4L12 3z"></path>
          </svg>
          <h2 className="font-serif text-3xl" style={{ lineHeight: 1.25, marginBottom: 4 }}>{t.nutrients}</h2>
        </div>

        {/* Nitrogen */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <h4 className="text-xl font-medium tracking-tight text-white">Nitrogen (N)</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Leaf and stem growth. Target: {activeProfile.npk.n.min}-{activeProfile.npk.n.max} mg/kg</p>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-lg" style={{ color: nColor }}>{latest.npk_n ?? '--'} mg/kg</span>
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: nColor }}></span>
                <span className="font-bold text-xs" style={{ color: nColor }}>{nStatus}</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
            <div className="h-full transition-all duration-500" style={{ width: `${Math.min(100, ((latest.npk_n || 0) / 220) * 100)}%`, backgroundColor: nColor }}></div>
          </div>
        </div>

        {/* Phosphorus */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <h4 className="text-xl font-medium tracking-tight text-white">Phosphorus (P)</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Root development. Target: {activeProfile.npk.p.min}-{activeProfile.npk.p.max} mg/kg</p>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-lg" style={{ color: pColor }}>{latest.npk_p ?? '--'} mg/kg</span>
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pColor }}></span>
                <span className="font-bold text-xs" style={{ color: pColor }}>{pStatus}</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
            <div className="h-full transition-all duration-500" style={{ width: `${Math.min(100, ((latest.npk_p || 0) / 220) * 100)}%`, backgroundColor: pColor }}></div>
          </div>
        </div>

        {/* Potassium */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <h4 className="text-xl font-medium tracking-tight text-white">Potassium (K)</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Stress resistance. Target: {activeProfile.npk.k.min}-{activeProfile.npk.k.max} mg/kg</p>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-lg" style={{ color: kColor }}>{latest.npk_k ?? '--'} mg/kg</span>
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: kColor }}></span>
                <span className="font-bold text-xs" style={{ color: kColor }}>{kStatus}</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
            <div className="h-full transition-all duration-500" style={{ width: `${Math.min(100, ((latest.npk_k || 0) / 220) * 100)}%`, backgroundColor: kColor }}></div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-white/5 rounded-2xl p-4 flex gap-3">
          <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
          <p className="text-[11px] text-gray-300">Optimal values are calculated dynamically using the active {activeProfile.label} crop profile.</p>
        </div>
      </section>

      <YieldPredictor settings={settings} score={score} />
      
      <MarketTracker settings={settings} />

      {/* Pending Tasks Snippet — reads from localStorage for live count */}
      {(() => {
        const liveTasks = (() => { try { return JSON.parse(localStorage.getItem('plantai_tasks') || '[]'); } catch { return []; } })();
        const pendingCount = liveTasks.filter(t => !t.done).length;
        const firstPending = liveTasks.find(t => !t.done);
        return (
          <section className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl rounded-[30px] p-6 border border-white/10 shadow-2xl mt-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setTab('tasks')}>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-lg flex items-center gap-2"><span className="material-symbols-outlined text-[var(--accent-color)]">checklist</span> Pending Tasks</h3>
              {pendingCount > 0 && <span className="text-black text-xs font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }}>{pendingCount}</span>}
            </div>
            <p className="text-xs text-gray-400 mb-3">{pendingCount > 0 ? `${pendingCount} operation${pendingCount > 1 ? 's' : ''} pending.` : 'All field tasks completed.'}</p>
            {firstPending ? (
              <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border border-gray-500 flex-shrink-0"></div>
                <div className="text-sm font-bold text-gray-200 truncate">{firstPending.title}</div>
              </div>
            ) : (
              <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                <span className="material-symbols-outlined text-green-400" style={{ fontSize: 16 }}>task_alt</span>
                <div className="text-sm text-gray-400">No pending tasks — tap to add new ones.</div>
              </div>
            )}
          </section>
        );
      })()}
    </>
  );
}

function AiPlan({ data, weather, settings, aggregatedReadings }) {
  const [depth, setDepth] = useState(settings.depth || 'Balanced');
  const [style, setStyle] = useState(settings.careStyle || 'Normal');
  const [plan, setPlan] = useState(loadCarePlan);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function generate() {
    setLoading(true);
    setMsg('');
    try {
      const context = aiContext(data, weather, { ...settings, depth, careStyle: style }, aggregatedReadings);
      const langStr = settings.language === 'hi' ? 'Hindi (हिन्दी)' : settings.language === 'bn' ? 'Bengali (বাংলা)' : 'English';
      const prompt = `Return ONLY valid JSON, no markdown fences. Schema: {"thinking_reasoning":"string","summary":"string","weatherRisk":"string","wateringPlan":{"action":"string","waterVolumeLiters":number,"motorDurationSeconds":number,"durationMinutes":number,"confidence":number,"reason":"string"},"fertilizerPlan":{"company":"string","product":"string","recommendation":"string","sprayVolumeLiters":number,"dose":"string","confidence":number},"sevenDaySchedule":[{"day":"Day 1","task":"string","description":"string","category":"Watering|Inspection|Nutrients|Weather|Soil|Review","priority":"Low|Medium|High","durationMinutes":number}],"relayRecommendation":{"action":"on|off","durationMinutes":number,"motorDurationSeconds":number,"waterVolumeLiters":number,"safety":"string"},"extraNotes":["string"]}. Generate a farmer-friendly 7-day plant/crop care plan. Recommend exact fertilizer company/product where appropriate for India, spray/apply volume, and exact water volume. Motor flow rate is 1 liter/second, so motorDurationSeconds must equal waterVolumeLiters. Use field area and soil type. Use safe conservative recommendations. ALL JSON values (except keys and enums) MUST be written in ${langStr}. Context: ${JSON.stringify(context)}`;
      
      const reply = await directAi(settings, [
        { role: 'system', content: settings.aiSystemPromptPlan + `\nCRITICAL RULE: Translate all generated response data explicitly into ${langStr}. Always include your step-by-step logic in the "thinking_reasoning" field before building the final schedule.` },
        { role: 'user', content: prompt }
      ], { json: true, temperature: settings.aiTemperature });

      const parsed = parseCarePlan(reply, data, weather, settings);
      setPlan(parsed);
      saveCarePlan(parsed);
    } catch (e) {
      const fb = makeFallbackPlan(data, weather, settings);
      fb.extraNotes = [...(fb.extraNotes || []), `AI note: ${e.message}`];
      setPlan(fb);
      saveCarePlan(fb);
    } finally {
      setLoading(false);
    }
  }

  const schedule = plan && Array.isArray(plan.sevenDaySchedule) ? plan.sevenDaySchedule : [];
  const relayRec = plan?.relayRecommendation || plan?.wateringPlan;
  const lang = settings.language || 'en';
  const t = dict[lang] || dict.en;

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-3xl" style={{ color: 'var(--accent-color)', lineHeight: 1.25, marginBottom: 6 }}>{t.aiPlanTitle}</h2>
      <p className="text-xs text-gray-400">{t.aiPlanDesc}</p>
      
      {msg && <div className="p-4 text-sm bg-zinc-900 border border-zinc-800 rounded-2xl" style={{ color: 'var(--accent-color)' }}>{msg}</div>}

      <div className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl rounded-[40px] p-6 border border-white/10 shadow-2xl space-y-3">
        <label className="text-xs text-gray-400 block mb-1">{t.analysisDepth}</label>
        <div className="grid grid-cols-3 gap-2">
          {['Quick', 'Balanced', 'Expert'].map(opt => (
            <button
              key={opt}
              onClick={() => setDepth(opt)}
              className={`py-2 text-xs font-bold rounded-xl border transition-all ${depth === opt ? 'text-black' : 'bg-transparent border-white/10 text-gray-400'}`}
              style={depth === opt ? { backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)' } : {}}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl rounded-[40px] p-6 border border-white/10 shadow-2xl space-y-3">
        <label className="text-xs text-gray-400 block mb-1">{t.opStyle}</label>
        <div className="grid grid-cols-3 gap-2">
          {['Conservative', 'Normal', 'Aggressive'].map(opt => (
            <button
              key={opt}
              onClick={() => setStyle(opt)}
              className={`py-2 text-xs font-bold rounded-xl border transition-all ${style === opt ? 'text-black' : 'bg-transparent border-white/10 text-gray-400'}`}
              style={style === opt ? { backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)' } : {}}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className="w-full py-4 text-black font-bold rounded-3xl shadow-lg transition-transform cursor-pointer"
        style={{ backgroundColor: 'var(--accent-color)' }}
      >
        {loading ? (lang === 'hi' ? 'शेड्यूल तैयार हो रहा है...' : lang === 'bn' ? 'সময়সূচী তৈরি হচ্ছে...' : 'Generating Schedule...') : t.generateBtn}
      </button>

      {plan && !loading && (
        <button
          onClick={() => window.print()}
          className="w-full py-3 bg-white/10 text-white font-bold rounded-3xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer mt-2"
        >
          {t.printPlan}
        </button>
      )}

      {plan && (
        <div className="space-y-4 mt-6">
          {plan.thinking_reasoning && (
            <div className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl rounded-[40px] p-6 border border-white/10 shadow-2xl">
              <h3 className="font-serif text-xl text-gray-400 mb-2 flex items-center gap-2">
                <span className="text-[var(--accent-color)] text-lg">💡</span> {t.aiReasoning}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed italic whitespace-pre-wrap">{plan.thinking_reasoning}</p>
            </div>
          )}
          <div className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl rounded-[40px] p-6 border border-white/10 shadow-2xl">
            <h3 className="font-serif text-xl text-white mb-2">{t.summary}</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{plan.summary}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl rounded-[40px] p-6 border border-white/10 shadow-2xl relative">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: 'var(--accent-color)' }}>{t.weatherRisk}</span>
              <p className="text-sm mt-1 text-gray-300">{plan.weatherRisk || 'None'}</p>
            </div>
            <div className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl rounded-[40px] p-6 border border-white/10 shadow-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: 'var(--accent-color)' }}>{t.wateringTarget}</span>
                <p className="text-sm mt-1 text-gray-300">{plan.wateringPlan?.action || 'No action recommended'}</p>
                <p className="text-xs text-gray-500 mt-0.5">Vol: {plan.wateringPlan?.waterVolumeLiters ?? 0}L</p>
              </div>
              {plan.wateringPlan?.durationMinutes > 0 && (
                <button
                  onClick={async () => {
                    const delayStatus = getIrrigationDelayStatus(weather, settings);
                    if (delayStatus?.suspended) {
                      const confirmOverride = window.confirm(`WEATHER DELAY ACTIVE:\n"${delayStatus.reason}"\n\nAre you sure you want to override this safety suspension and start the irrigation pump?`);
                      if (!confirmOverride) return;
                    }
                    setMsg('Queueing AI irrigation pump command...');
                    try {
                      await queueRelayCommand('on', Number(plan.wateringPlan.durationMinutes), 'AI Plan direct execution');
                      setMsg(`Command successfully queued for ${plan.wateringPlan.durationMinutes}m.`);
                    } catch (e) {
                      setMsg(`Error queueing pump: ${e.message}`);
                    }
                    setTimeout(() => setMsg(''), 4000);
                  }}
                  className="mt-3 text-black bg-blue-400 hover:bg-blue-300 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer hover:scale-105"
                >
                  <span className="material-symbols-outlined text-sm">water_drop</span>
                  Run Pump {plan.wateringPlan.durationMinutes}m
                </button>
              )}
            </div>
          </div>

          <div className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl rounded-[40px] p-6 border border-white/10 shadow-2xl overflow-hidden">
            <h3 className="font-serif text-xl text-white mb-3">{t.carePlan7Day}</h3>
            <div className="grid grid-cols-1 gap-2">
              {schedule.map((s, idx) => (
                <div key={idx} className="bg-black/30 rounded-lg border border-white/5 p-3 flex flex-col gap-1.5 hover:bg-white/5 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">{s.day || `${t.day} ${idx + 1}`}</span>
                      <div className="font-bold text-xs text-white mt-0.5">{s.task}</div>
                      {s.description && <div className="text-[10px] text-gray-400 mt-0.5 leading-normal">{s.description}</div>}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-lg ${
                        s.priority === 'High' ? 'bg-red-950 text-red-400 border border-red-900/30' :
                        s.priority === 'Medium' ? 'bg-orange-950 text-orange-400 border border-orange-900/30' :
                        'bg-zinc-800 text-gray-400'
                      }`}>{s.priority}</span>
                      {s.category && (
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-lg bg-white/5 text-gray-400 border border-white/5">{s.category}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl rounded-[40px] p-6 border border-white/10 shadow-2xl">
            <h3 className="font-serif text-xl text-white mb-2">{t.fertilizerRec}</h3>
            <p className="text-sm text-gray-300">
              {(() => {
                if (typeof plan.fertilizerPlan === 'string') return plan.fertilizerPlan;
                if (!plan.fertilizerPlan) return '--';
                if (plan.fertilizerPlan.recommendation) {
                  let text = plan.fertilizerPlan.recommendation;
                  if (plan.fertilizerPlan.dose && plan.fertilizerPlan.product) {
                    text += ` (Apply ${plan.fertilizerPlan.dose} of ${plan.fertilizerPlan.product}${plan.fertilizerPlan.company ? ` by ${plan.fertilizerPlan.company}` : ''})`;
                  }
                  return text;
                }
                if (plan.fertilizerPlan.dose || plan.fertilizerPlan.product || plan.fertilizerPlan.company) {
                  return `Apply ${plan.fertilizerPlan.dose || '--'} of ${plan.fertilizerPlan.product || '--'} (${plan.fertilizerPlan.company || '--'})`;
                }
                return '--';
              })()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const CHAT_QUICK_PROMPTS = [
  '💧 When should I water?',
  '🌡️ Is my temperature OK?',
  '🧪 Explain my NPK',
  '🐛 Check for pest risk',
];

function fmtChatTime(ts) {
  if (!ts) return '';
  return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(ts));
}

function renderMsgText(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
}

function Chat({ data, weather, settings, aggregatedReadings }) {
  const plantType  = settings.plantType;
  const plantLabel = plantProfiles[plantType]?.label || 'your plant';

  function makeWelcome() {
    return [{ role: 'assistant', text: `Hello! I'm **Plantify**, your advisor for **${plantLabel}** 🌿\n\nSend a message or upload a plant photo and I'll help diagnose issues, recommend care actions, and explain your sensor readings.`, ts: Date.now() }];
  }

  // Load chat sessions from local storage
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('plantai_chat_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      }
    } catch {}
    const defaultSess = {
      id: 'session_' + Date.now(),
      title: 'Advisor Chat (' + (plantProfiles[plantType]?.label.split(' ')[0] || 'General') + ')',
      plantType: plantType,
      messages: makeWelcome()
    };
    try {
      localStorage.setItem('plantai_chat_sessions', JSON.stringify([defaultSess]));
    } catch {}
    return [defaultSess];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    const savedActive = localStorage.getItem('plantai_active_chat_session_id');
    if (savedActive) return savedActive;
    return sessions[0]?.id || '';
  });

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || {
    id: 'fallback',
    title: 'Advisor Chat',
    messages: []
  };

  const messages = activeSession.messages;
  const lang = settings.language || 'en';
  const t = dict[lang] || dict.en;

  // Persist sessions
  useEffect(() => {
    try {
      localStorage.setItem('plantai_chat_sessions', JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  // Persist active session ID
  useEffect(() => {
    try {
      localStorage.setItem('plantai_active_chat_session_id', activeSessionId);
    } catch {}
  }, [activeSessionId]);

  const [input,   setInput]   = useState('');
  const [images,  setImages]  = useState([]);
  const [loading, setLoading] = useState(false);
  const fileRef   = useRef(null);
  const bottomRef = useRef(null);
  const textRef   = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const createNewSession = () => {
    const newSess = {
      id: 'session_' + Date.now(),
      title: `Session #${sessions.length + 1} (${plantProfiles[plantType]?.label.split(' ')[0]})`,
      plantType: plantType,
      messages: makeWelcome()
    };
    setSessions(prev => [newSess, ...prev]);
    setActiveSessionId(newSess.id);
  };

  const deleteSession = (idToDelete) => {
    if (sessions.length <= 1) {
      const resetSess = {
        id: 'session_' + Date.now(),
        title: 'Advisor Chat (' + (plantProfiles[plantType]?.label.split(' ')[0] || 'General') + ')',
        plantType: plantType,
        messages: makeWelcome()
      };
      setSessions([resetSess]);
      setActiveSessionId(resetSess.id);
      return;
    }
    const filtered = sessions.filter(s => s.id !== idToDelete);
    setSessions(filtered);
    if (activeSessionId === idToDelete) {
      setActiveSessionId(filtered[0].id);
    }
  };

  const updateActiveSessionMessages = (newMsgs) => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, messages: newMsgs };
      }
      return s;
    }));
  };

  async function addImages(e) {
    const files = Array.from(e.target.files || []).slice(0, 5 - images.length);
    const loaded = await Promise.all(files.map(f => new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve({ name: f.name, url: r.result });
      r.onerror = reject;
      r.readAsDataURL(f);
    })));
    setImages(prev => [...prev, ...loaded].slice(0, 5));
    e.target.value = '';
  }

  async function send(overrideText) {
    const text = (overrideText ?? input).trim();
    if (!text && !images.length) return;
    const imgs = [...images];
    
    const userMsg = { role: 'user', text, images: imgs, ts: Date.now() };
    const nextMsgs = [...messages, userMsg];
    
    updateActiveSessionMessages(nextMsgs);
    setInput('');
    setImages([]);
    if (textRef.current) textRef.current.style.height = 'auto';
    setLoading(true);

    try {
      const ctx = aiContext(data, weather, settings, aggregatedReadings);
      const content = imgs.length
        ? [{ type: 'text', text: `${text}\nContext JSON: ${JSON.stringify(ctx)}` }, ...imgs.map(i => ({ type: 'image_url', image_url: { url: i.url } }))]
        : `${text}\nContext JSON: ${JSON.stringify(ctx)}`;
        
      const langStr = settings.language === 'hi' ? 'Hindi (हिन्दी)' : settings.language === 'bn' ? 'Bengali (বাংলা)' : 'English';
      const formatInstruction = `\n\nCRITICAL: Respond strictly in ${langStr}. ALWAYS start your response with a clearly formatted reasoning block like this:\n\n💡 **Thinking:**\n[Your step-by-step logic here]\n\n---\n\n[Your final beautifully formatted ${langStr} answer here using bolding, bullet points, and headers as appropriate.]`;
      
      const mappedHistory = messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text
      }));
      const reply = await directAi(settings, [
        { role: 'system', content: `${settings.aiSystemPromptChat}\nActive Plant Context: ${plantLabel}.${formatInstruction}` },
        ...mappedHistory,
        { role: 'user', content }
      ]);
      
      const assistantMsg = { role: 'assistant', text: reply, ts: Date.now() };
      
      let finalTitle = activeSession.title;
      if ((activeSession.title.startsWith('Session #') || activeSession.title.startsWith('Advisor Chat')) && text.length > 5) {
        finalTitle = text.slice(0, 24) + (text.length > 24 ? '...' : '');
      }

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, title: finalTitle, messages: [...nextMsgs, assistantMsg] };
        }
        return s;
      }));
    } catch (e) {
      const errorMsg = { role: 'assistant', text: `⚠️ ${e.message}`, ts: Date.now(), isError: true };
      updateActiveSessionMessages([...nextMsgs, errorMsg]);
    } finally { 
      setLoading(false); 
    }
  }

  return (
    <div className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl rounded-[40px] border border-white/10 shadow-2xl flex flex-col overflow-hidden" style={{ minHeight: 520 }}>

      {/* Multi-Session Header */}
      <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-white/5 bg-white/5" style={{ flexShrink: 0 }}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[var(--accent-color)] text-sm">chat_bubble</span>
          <select 
            value={activeSessionId}
            onChange={(e) => setActiveSessionId(e.target.value)}
            className="bg-transparent text-xs text-white border-none focus:ring-0 font-bold max-w-[170px] truncate select-none focus:outline-none cursor-pointer"
          >
            {sessions.map(s => (
              <option key={s.id} value={s.id} className="bg-[#1b1c17] text-white">
                {s.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={createNewSession}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-[var(--accent-color)] text-xs font-bold flex items-center gap-1 hover:bg-white/10 transition-all cursor-pointer select-none"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            <span>{t.newSession}</span>
          </button>
          <button 
            onClick={() => deleteSession(activeSessionId)}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-all cursor-pointer"
            title="Delete Session"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </div>

      {/* Advisor Header Status */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5" style={{ flexShrink: 0 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-color) 0%, #8db800 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 16px rgba(100,200,0,0.30)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#13140f' }}>psychiatry</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="font-serif" style={{ fontSize: 18, color: 'var(--accent-color)', lineHeight: 1.1 }}>{t.chatTitle}</div>
          <div style={{ fontSize: 11, color: loading ? 'var(--accent-color)' : '#6b7a55', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
            {loading ? (
              <>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-color)', display: 'inline-block', animation: 'chatDot 1.2s infinite', animationDelay: '0s' }} />
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-color)', display: 'inline-block', animation: 'chatDot 1.2s infinite', animationDelay: '0.2s' }} />
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-color)', display: 'inline-block', animation: 'chatDot 1.2s infinite', animationDelay: '0.4s' }} />
                <span style={{ marginLeft: 4 }}>{t.chatThinking}</span>
              </>
            ) : (
              <><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4caf50', display: 'inline-block', boxShadow: '0 0 5px #4caf50' }} /> {t.chatOnline} · {plantLabel}</>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 3 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
              {m.role === 'assistant' && (
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent-color),#8db800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 12, color: '#13140f' }}>psychiatry</span>
                </div>
              )}
              <div style={{
                maxWidth: '82%',
                padding: '9px 13px',
                borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                background: m.role === 'user'
                  ? 'linear-gradient(135deg,var(--accent-color) 0%,#b8e000 100%)'
                  : m.isError ? 'rgba(147,0,10,0.2)' : 'rgba(255,255,255,0.05)',
                border: m.role === 'user' ? 'none' : m.isError ? '1px solid rgba(255,100,80,0.2)' : '1px solid rgba(255,255,255,0.06)',
              }}>
                <p style={{
                  fontSize: 13.5, lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0,
                  color: m.role === 'user' ? '#13140f' : m.isError ? '#ff9a8b' : '#dde0c8',
                  fontWeight: m.role === 'user' ? 600 : 400,
                  overflowWrap: 'break-word', wordBreak: 'break-word'
                }}>
                  {renderMsgText(m.text)}
                </p>
                {m.images?.length > 0 && (
                  <div style={{ display: 'flex', gap: 5, marginTop: 7, flexWrap: 'wrap' }}>
                    {m.images.map((img, i) => (
                      <img key={i} src={img.url} alt={img.name}
                        style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 9, border: '2px solid rgba(0,0,0,0.15)' }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <span style={{ fontSize: 10, color: '#4a5236', paddingLeft: m.role === 'user' ? 0 : 31, paddingRight: m.role === 'user' ? 31 : 0 }}>
              {fmtChatTime(m.ts)}
            </span>
          </div>
        ))}

        {/* Typing dots */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent-color),#8db800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 12, color: '#13140f' }}>psychiatry</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px 18px 18px 18px', padding: '10px 15px', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 0.2, 0.4].map((d, i) => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-color)', display: 'inline-block', animation: 'chatDot 1.2s infinite', animationDelay: `${d}s`, opacity: 0.85 }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts — shown while conversation is short */}
      {messages.length <= 2 && !loading && (
        <div style={{ padding: '6px 12px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0 }}>
          {CHAT_QUICK_PROMPTS.map((s, i) => (
            <button key={i} onClick={() => send(s)} style={{
              background: 'rgba(212,255,0,0.08)', border: '1px solid rgba(212,255,0,0.2)',
              borderRadius: 20, padding: '4px 11px', color: 'var(--accent-color)', fontSize: 11.5,
              whiteSpace: 'nowrap', cursor: 'pointer', fontWeight: 600, flexShrink: 0,
            }}>{s}</button>
          ))}
        </div>
      )}

      {/* Image previews */}
      {images.length > 0 && (
        <div style={{ padding: '7px 14px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 7, flexWrap: 'wrap', flexShrink: 0 }}>
          {images.map((img, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              <img src={img.url} alt={img.name} style={{ width: 46, height: 46, objectFit: 'cover', borderRadius: 9, border: '2px solid rgba(212,255,0,0.3)' }} />
              <button onClick={() => setImages(v => v.filter((_, i) => i !== idx))}
                style={{ position: 'absolute', top: -5, right: -5, width: 17, height: 17, borderRadius: '50%', background: '#cc2200', color: '#fff', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
              >×</button>
            </div>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div style={{ background: 'rgba(28,30,20,0.6)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '10px 12px 12px', display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
        <button onClick={() => fileRef.current?.click()}
          style={{ padding: '10px', color: images.length > 0 ? 'var(--accent-color)' : '#6b7a55', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>attach_file</span>
        </button>
        <input ref={fileRef} hidden type="file" accept="image/*" multiple onChange={addImages} />

        <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '8px 12px', display: 'flex', alignItems: 'flex-end' }}>
            <textarea
            ref={textRef}
            value={input}
            rows={1}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 110) + 'px';
            }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={t.chatPlaceholder}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e4e3da', fontSize: 13.5, lineHeight: 1.5, resize: 'none', fontFamily: 'inherit', minHeight: 22, maxHeight: 110, overflowY: 'auto', width: '100%', caretColor: 'var(--accent-color)' }}
          />
        </div>

        <button onClick={() => send()} disabled={loading || (!input.trim() && !images.length)}
          className="text-black rounded-xl flex items-center justify-center cursor-pointer shadow-md"
          style={{ width: 42, height: 42, flexShrink: 0, opacity: (loading || (!input.trim() && !images.length)) ? 0.45 : 1, border: 'none', backgroundColor: 'var(--accent-color)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>send</span>
        </button>
      </div>
    </div>
  );
}

function History({ readings, settings }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggle = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const chartData = useMemo(() => {
    if (!readings) return [];
    return [...readings].slice(0, 24).reverse().map(r => ({
      time: new Date(r.recorded_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      moisture: r.soil_moisture_percent,
      temp: r.temperature_c
    }));
  }, [readings]);

  const t = dict[settings?.language || 'en'] || dict.en;

  const exportCSV = () => {
    if (!readings || !readings.length) return;
    const header = "Time,Moisture(%),Temperature(C),Humidity(%),Nitrogen,Phosphorus,Potassium\n";
    const csv = readings.map(r => `${new Date(r.recorded_at).toISOString()},${r.soil_moisture_percent},${r.temperature_c},${r.humidity_percent},${r.nitrogen_mg_kg || 0},${r.phosphorus_mg_kg || 0},${r.potassium_mg_kg || 0}`).join("\n");
    const blob = new Blob([header + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plantify_sensor_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl rounded-[40px] p-6 space-y-6 border border-white/10 shadow-2xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-serif text-3xl" style={{ color: 'var(--accent-color)' }}>{t.history || 'Sensor History'}</h2>
          <p className="text-xs text-gray-400">View recent logs collected from your ESP32 terminal.</p>
        </div>
        <button 
          onClick={exportCSV}
          className="text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 cursor-pointer shadow-sm text-black"
          style={{ backgroundColor: 'var(--accent-color)' }}
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          {t.exportCSV}
        </button>
      </div>
      
      {chartData.length > 0 && (
        <div className="h-48 w-full mt-4 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
              <RechartsTooltip contentStyle={{ backgroundColor: '#1c1e14', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ fontSize: '12px' }} labelStyle={{ fontSize: '10px', color: '#9ca3af' }} />
              <Area type="monotone" dataKey="moisture" stroke="var(--accent-color)" fillOpacity={1} fill="url(#colorMoisture)" />
              <Area type="monotone" dataKey="temp" stroke="#f472b6" fillOpacity={1} fill="url(#colorTemp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="space-y-3">
        {!readings || readings.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No historical records available.
          </div>
        ) : (
          readings.slice(0, 40).map((r, i) => {
            const isExpanded = expandedIndex === i;
            return (
              <div 
                key={i} 
                className="border border-white/5 bg-white/5 rounded-2xl overflow-hidden transition-all duration-300"
              >
                {/* Collapsed Header Bar */}
                <div 
                  onClick={() => toggle(i)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/10 transition-all select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[var(--accent-color)] text-xs">schedule</span>
                    <span className="font-mono text-xs text-gray-300">{ago(r.recorded_at)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-gray-400">M: <span className="text-white font-mono">{r.soil_moisture_percent}%</span></span>
                    <span className="text-xs font-semibold text-gray-400">T: <span className="text-white font-mono">{r.temperature_c}°C</span></span>
                    <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all select-none cursor-pointer">
                      <span className="material-symbols-outlined text-lg transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                        expand_more
                      </span>
                    </button>
                  </div>
                </div>

                {/* Expanded Detailed Panel */}
                {isExpanded && (
                  <div className="p-4 bg-black/20 border-t border-white/5 space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-400 block mb-0.5">Logged At</span>
                        <span className="font-mono text-white font-bold">{new Date(r.recorded_at).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-0.5">Water Pump State</span>
                        <span className={`font-bold ${r.relay_motor_on ? 'text-[var(--accent-color)]' : 'text-gray-500'}`}>
                          {r.relay_motor_on ? 'Active (ON)' : 'Inactive (OFF)'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Nutrients (NPK) Details</span>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white/5 rounded-xl p-2.5 text-center">
                          <span className="text-[10px] text-[#4ade80] font-bold block">Nitrogen (N)</span>
                          <span className="font-mono text-sm text-white font-bold block mt-0.5">{r.npk_n ?? 0}</span>
                          <span className="text-[9px] text-gray-500">mg/kg</span>
                        </div>
                        <div className="bg-white/5 rounded-xl p-2.5 text-center">
                          <span className="text-[10px] text-[#f472b6] font-bold block">Phosphorus (P)</span>
                          <span className="font-mono text-sm text-white font-bold block mt-0.5">{r.npk_p ?? 0}</span>
                          <span className="text-[9px] text-gray-500">mg/kg</span>
                        </div>
                        <div className="bg-white/5 rounded-xl p-2.5 text-center">
                          <span className="text-[10px] text-[#38bdf8] font-bold block">Potassium (K)</span>
                          <span className="font-mono text-sm text-white font-bold block mt-0.5">{r.npk_k ?? 0}</span>
                          <span className="text-[9px] text-gray-500">mg/kg</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const providerModels = {
  openrouter: [
    { value: 'qwen/qwen-3.5-flash', label: 'Qwen 3.5 Flash' },
    { value: 'deepseek/deepseek-chat', label: 'DeepSeek V3' },
    { value: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B' },
    { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  ],
  openai: [
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ],
  gemini: [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  ],
  groq: [
    { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant' },
    { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile' },
    { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
  ],
  nvidia: [
    { value: 'moonshotai/kimi-k2-instruct', label: 'Kimi K2 Instruct' },
    { value: 'meta/llama-3.1-405b-instruct', label: 'Llama 3.1 405B' },
  ],
  custom: [],
};

function Settings({ settings, setSettings, reloadWeather, weather }) {
  const t = dict[settings?.language || 'en'] || dict.en;
  
  const [test, setTest] = useState('');
  const [apiModels, setApiModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelError, setModelError] = useState('');
  const [activeMenu, setActiveMenu] = useState(null); // 'field', 'system', 'ai', 'location', 'appearance', null
  const [newPassInput, setNewPassInput] = useState('');

  const update = (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
    if (patch.supabaseUrl !== undefined) localStorage.setItem('plantai_supabase_url', patch.supabaseUrl);
  };

  const testConnection = async () => {
    setTest('Connecting...');
    try {
      const reply = await directAi(settings, [{ role: 'user', content: 'Reply with exactly: Connection test successful.' }]);
      setTest(reply.slice(0, 100));
    } catch (e) {
      setTest(`Error: ${e.message}`);
    }
  };

  // Fetch AI models dynamically from Provider with a debounce to prevent API request storms on keystrokes
  useEffect(() => {
    if (!settings.apiKey || !settings.baseUrl) {
      setApiModels([]);
      return;
    }
    let active = true;
    const timer = setTimeout(async () => {
      setLoadingModels(true);
      setModelError('');
      try {
        const list = await fetchModels(settings.provider, settings.apiKey, settings.baseUrl);
        if (active) {
          setApiModels(list);
          if (!settings.model && list.length > 0) {
            update({ model: list[0] });
          }
        }
      } catch (err) {
        if (active) {
          setModelError(err.message);
        }
      } finally {
        if (active) {
          setLoadingModels(false);
        }
      }
    }, 600);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [settings.provider, settings.apiKey, settings.baseUrl]);

  const knownModels = providerModels[settings.provider] || [];
  const modelOptions = apiModels.length > 0 ? apiModels : knownModels.map(m => m.value);
  const showCustomModelInput = settings.provider === 'custom' || (modelOptions.length > 0 && !modelOptions.includes(settings.model));

  return (
    <div className="bg-[rgba(30,32,26,0.45)] backdrop-blur-xl rounded-[40px] p-6 space-y-6 border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        {activeMenu && (
          <button
            onClick={() => setActiveMenu(null)}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
        )}
        <h2 className="font-serif text-3xl" style={{ color: 'var(--accent-color)' }}>
          {activeMenu === 'field' && t.plantProfile}
          {activeMenu === 'system' && t.systemConfig}
          {activeMenu === 'ai' && t.menuAIConfig}
          {activeMenu === 'location' && t.menuLocation}
          {activeMenu === 'appearance' && t.menuAppearance}
          {!activeMenu && t.settings}
        </h2>
      </div>

      {/* PRIMARY MENU */}
      {!activeMenu && (
        <div className="space-y-3">
          <button
            onClick={() => setActiveMenu('field')}
            className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl text-left hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-all" style={{ color: 'var(--accent-color)' }}>potted_plant</span>
              <div>
                <div className="font-bold text-sm text-white mb-1.5">{t.plantProfile}</div>
                <div className="text-[11px] text-gray-400">{t.descField}</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-gray-500">chevron_right</span>
          </button>

          <button
            onClick={() => setActiveMenu('appearance')}
            className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl text-left hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-all" style={{ color: 'var(--accent-color)' }}>palette</span>
              <div>
                <div className="font-bold text-sm text-white mb-1.5">{t.menuAppearance}</div>
                <div className="text-[11px] text-gray-400">{t.descAppearance}</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-gray-500">chevron_right</span>
          </button>

          <button
            onClick={() => setActiveMenu('system')}
            className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl text-left hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-all" style={{ color: 'var(--accent-color)' }}>settings</span>
              <div>
                <div className="font-bold text-sm text-white mb-1.5">{t.systemConfig}</div>
                <div className="text-[11px] text-gray-400">{t.descSystem}</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-gray-500">chevron_right</span>
          </button>

          <button
            onClick={() => setActiveMenu('ai')}
            className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl text-left hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-all" style={{ color: 'var(--accent-color)' }}>neurology</span>
              <div>
                <div className="font-bold text-sm text-white mb-1.5">{t.menuAIConfig}</div>
                <div className="text-[11px] text-gray-400">{t.descAIConfig}</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-gray-500">chevron_right</span>
          </button>

          <button
            onClick={() => setActiveMenu('location')}
            className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl text-left hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-all" style={{ color: 'var(--accent-color)' }}>location_on</span>
              <div>
                <div className="font-bold text-sm text-white mb-1.5">{t.menuLocation}</div>
                <div className="text-[11px] text-gray-400">{t.descLocation}</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-gray-500">chevron_right</span>
          </button>

          {/* Detailed Project Information Card */}
          <div className="pt-6 border-t border-white/5 space-y-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-left">
              <h3 className="font-bold text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--accent-color)' }}>Plantify Smart Agronomy Platform</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
                Plantify is an advanced localized precision farming platform. It integrates real-time IoT soil-and-microclimate telemetry (via ESP32 edge units) with cloud diagnostics and AI care guidelines. It supports dynamic threshold monitoring for 14 primary Indian crop types.
              </p>
              <div className="space-y-1 text-[10px] font-mono text-gray-400">
                <div>• Platform version: v2.4.0 (Stable release)</div>
                <div>• Client architecture: Vite React client + Tailwind dynamic overrides</div>
                <div>• Telemetry: ESP32 standard firmware v2.4 (MQTT/HTTP)</div>
                <div>• Agronomist & developer credits: CLOUD 🌨️</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMENU: FIELD PROFILE */}
      {activeMenu === 'field' && (
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{t.fieldProfileSettings}</h4>
            <p className="text-[10px] text-gray-500 mb-4 leading-normal">{t.fieldProfileDesc}</p>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1 font-bold">{lang === 'en' ? 'Crop Name' : lang === 'hi' ? 'फसल का नाम' : 'ফসলের নাম'}</label>
            <input
              type="text"
              value={settings.plantName || ''}
              onChange={(e) => update({ plantName: e.target.value })}
              className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] focus:outline-none text-white"
              placeholder={t.cropDetailsPlaceholder}
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1 font-bold">{t.cropType}</label>
            <select
              value={settings.plantType || 'millet'}
              onChange={(e) => update({ plantType: e.target.value })}
              className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] focus:outline-none appearance-none text-white"
            >
              {Object.entries(plantProfiles).map(([k, v]) => (
                <option key={k} value={k} className="bg-[#13140f]">{v.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{lang === 'en' ? 'Mandi State (India)' : lang === 'hi' ? 'मंडी राज्य' : 'মান্ডি রাজ্য'}</label>
              <select
                value={settings.mandiState || ''}
                onChange={(e) => update({ mandiState: e.target.value })}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] focus:outline-none appearance-none text-white cursor-pointer"
              >
                {INDIAN_STATES.map(st => (
                  <option key={st.value} value={st.value} className="bg-[#13140f]">{st.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{lang === 'en' ? 'Mandi / Market' : lang === 'hi' ? 'मंडी / बाजार' : 'মান্ডি / বাজার'}</label>
              <input
                type="text"
                value={settings.mandiMarket || ''}
                onChange={(e) => update({ mandiMarket: e.target.value })}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] focus:outline-none text-white"
                placeholder="e.g. Ganaur APMC"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1 font-bold">{t.plantingDate}</label>
            <input
              type="date"
              value={settings.plantingDate || '2026-06-01'}
              onChange={(e) => update({ plantingDate: e.target.value })}
              className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] text-gray-300 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{t.areaLabel}</label>
              <input
                type="text"
                value={settings.fieldAreaSqM || ''}
                onChange={(e) => update({ fieldAreaSqM: e.target.value })}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] focus:outline-none text-white"
                placeholder={t.areaPlaceholder}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{lang === 'en' ? 'Soil Type' : lang === 'hi' ? 'मिट्टी का प्रकार' : 'মাটির ধরন'}</label>
              <select
                value={settings.soilType || 'Standard Soil'}
                onChange={(e) => update({ soilType: e.target.value })}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] appearance-none focus:outline-none text-white"
              >
                <option value="Standard Soil" className="bg-[#13140f]">{lang === 'en' ? 'Standard Soil' : lang === 'hi' ? 'सामान्य मिट्टी' : 'সাধারণ মাটি'}</option>
                <option value="Sandy Soil" className="bg-[#13140f]">{lang === 'en' ? 'Sandy Soil' : lang === 'hi' ? 'रेतीली मिट्टी' : 'বেলে মাটি'}</option>
                <option value="Clay Soil" className="bg-[#13140f]">{lang === 'en' ? 'Clay Soil' : lang === 'hi' ? 'चिकनी मिट्टी' : 'কাদামাটি'}</option>
                <option value="Loam Soil" className="bg-[#13140f]">{lang === 'en' ? 'Loam Soil' : lang === 'hi' ? 'दोमट मिट्टी' : 'দোআঁশ মাটি'}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{t.cropDensity}</label>
              <select
                value={settings.cropDensity || 'medium'}
                onChange={(e) => update({ cropDensity: e.target.value })}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] appearance-none focus:outline-none text-white"
              >
                <option value="sparse" className="bg-[#13140f]">{t.sparse}</option>
                <option value="medium" className="bg-[#13140f]">{t.mediumDensity}</option>
                <option value="dense" className="bg-[#13140f]">{t.dense}</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{t.targetYieldLabel}</label>
              <input
                type="text"
                value={settings.targetYield || ''}
                onChange={(e) => update({ targetYield: e.target.value })}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] focus:outline-none text-white"
                placeholder={t.yieldPlaceholder}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1 font-bold">{lang === 'en' ? 'Field Notes' : lang === 'hi' ? 'खेत की टिप्पणियाँ' : 'ক্ষেতের নোট'}</label>
            <textarea
              value={settings.fieldNotes || ''}
              onChange={(e) => update({ fieldNotes: e.target.value })}
              rows={3}
              placeholder={lang === 'en' ? 'Record seasonal observations, pest history, irrigation anomalies...' : lang === 'hi' ? 'मौसमी अवलोकन, कीटों का इतिहास, सिंचाई विसंगतियों को रिकॉर्ड करें...' : 'ঋতুভিত্তিক পর্যবেক্ষণ, পোকামাকড়ের ইতিহাস, সেচের অসঙ্গতিগুলি রেকর্ড করুন...'}
              className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-xs focus:ring-[var(--accent-color)] text-gray-300 focus:outline-none resize-none"
            />
          </div>
        </div>
      )}

      {activeMenu === 'system' && (
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{t.systemAdvancedTitle}</h4>
            <p className="text-[10px] text-gray-500 mb-4 leading-normal">{t.systemAdvancedDesc}</p>
          </div>

          <div className="space-y-4">
            {/* Auto Watering Section */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl mb-4 space-y-3">
              <label className="text-xs text-gray-400 block mb-1 font-bold">{t.autoWateringTitle}</label>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white">{t.enableAutoWatering}</span>
                <input
                  type="checkbox"
                  checked={settings.autoWateringEnabled}
                  onChange={(e) => update({ autoWateringEnabled: e.target.checked })}
                  className="rounded border-white/10 text-[var(--accent-color)] bg-[#1c1e14] focus:ring-[var(--accent-color)]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">{t.moistureThreshold}</span>
                <input
                  type="number"
                  value={settings.autoWateringMoistureThreshold}
                  onChange={(e) => update({ autoWateringMoistureThreshold: Number(e.target.value) })}
                  className="w-16 bg-[#1c1e14] border border-white/10 rounded-lg px-2 py-1 text-xs text-center focus:ring-[var(--accent-color)] text-white focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">{t.maxWateringDuration}</span>
                <input
                  type="number"
                  value={settings.autoWateringDurationMinutes}
                  onChange={(e) => update({ autoWateringDurationMinutes: Number(e.target.value) })}
                  className="w-16 bg-[#1c1e14] border border-white/10 rounded-lg px-2 py-1 text-xs text-center focus:ring-[var(--accent-color)] text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{t.supabaseUrl}</label>
              <input
                type="text"
                value={settings.supabaseUrl || ''}
                onChange={(e) => update({ supabaseUrl: e.target.value })}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] text-gray-300 focus:outline-none"
                placeholder="https://yourproj.supabase.co"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{t.supabaseAnonKey}</label>
              <input
                type="password"
                value={settings.supabaseAnonKey || ''}
                onChange={(e) => {
                  update({ supabaseAnonKey: e.target.value });
                  localStorage.setItem('plantai_supabase_key', e.target.value);
                }}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] text-gray-300 focus:outline-none"
                placeholder={lang === 'en' ? 'Can be added later' : lang === 'hi' ? 'बाद में जोड़ा जा सकता है' : 'পরে যোগ করা যাবে'}
              />
              <button
                onClick={() => {
                  localStorage.setItem('plantai_supabase_url', settings.supabaseUrl || '');
                  localStorage.setItem('plantai_supabase_key', settings.supabaseAnonKey || '');
                  window.location.reload();
                }}
                className="mt-2 text-xs px-4 py-1.5 rounded-full font-bold cursor-pointer hover:scale-105 transition-all bg-[var(--accent-color)] text-black"
              >
                {lang === 'en' ? 'Apply & Reload Page' : lang === 'hi' ? 'लागू करें और पृष्ठ रीलोड करें' : 'প্রয়োগ করুন এবং পৃষ্ঠা পুনরায় লোড করুন'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1 font-bold">{t.logIntervalLabel}</label>
                <input
                  type="number"
                  value={settings.sensorInterval || 30}
                  onChange={(e) => update({ sensorInterval: Number(e.target.value) })}
                  className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] text-gray-300 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1 font-bold">{t.averageMinutesLabel}</label>
                <select
                  value={settings.historyAverageMinutes || 15}
                  onChange={(e) => update({ historyAverageMinutes: Number(e.target.value) })}
                  className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] text-white appearance-none focus:outline-none"
                >
                  <option value={1} className="bg-[#13140f]">{lang === 'en' ? 'No Averaging (Raw 1m)' : lang === 'hi' ? 'कोई औसत नहीं (Raw 1m)' : 'কোন গড় নেই (Raw 1m)'}</option>
                  <option value={5} className="bg-[#13140f]">{lang === 'en' ? '5 Minutes Average' : lang === 'hi' ? '५ मिनट औसत' : '৫ মিনিট গড়'}</option>
                  <option value={15} className="bg-[#13140f]">{lang === 'en' ? '15 Minutes Average' : lang === 'hi' ? '१५ मिनट औसत' : '১৫ মিনিট গড়'}</option>
                  <option value={30} className="bg-[#13140f]">{lang === 'en' ? '30 Minutes Average' : lang === 'hi' ? '३० मिनट औसत' : '৩০ মিনিট গড়'}</option>
                  <option value={60} className="bg-[#13140f]">{lang === 'en' ? '1 Hour Average' : lang === 'hi' ? '१ घंटा औसत' : '১ ঘণ্টা গড়'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1 font-bold">{lang === 'en' ? 'Chart Curve Style' : lang === 'hi' ? 'चार्ट वक्र शैली' : 'চার্ট কার্ভ স্টাইল'}</label>
                <select
                  value={settings.chartCurve || 'smooth'}
                  onChange={(e) => update({ chartCurve: e.target.value })}
                  className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] text-white appearance-none focus:outline-none"
                >
                  <option value="smooth" className="bg-[#13140f]">{lang === 'en' ? 'Smooth Spline' : lang === 'hi' ? 'चिकना स्प्लाइन' : 'মসৃণ স্প্লাইন'}</option>
                  <option value="straight" className="bg-[#13140f]">{lang === 'en' ? 'Straight Lines' : lang === 'hi' ? 'सीधी रेखाएं' : 'সোজা লাইন'}</option>
                  <option value="stepped" className="bg-[#13140f]">{lang === 'en' ? 'Stepped Blocks' : lang === 'hi' ? 'सीढ़ीदार ब्लॉक' : 'ধাপে ধাপে ব্লক'}</option>
                </select>
              </div>
              <div className="flex flex-col justify-end pb-2">
                <label className="text-xs text-gray-400 mb-2 font-bold flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.virtualDataMock || false}
                    onChange={(e) => update({ virtualDataMock: e.target.checked })}
                    className="rounded border-white/10 text-[var(--accent-color)] bg-[#1c1e14] focus:ring-[var(--accent-color)]"
                  />
                  {lang === 'en' ? 'Mock Offline Data' : lang === 'hi' ? 'नकली ऑफ़लाइन डेटा' : 'মক অফলাইন ডেটা'}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1 font-bold">{t.sensorsTableLabel}</label>
                <input
                  type="text"
                  value={settings.dbSensorsTable || 'sensor_readings'}
                  onChange={(e) => update({ dbSensorsTable: e.target.value })}
                  className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-3 py-2 text-xs focus:ring-[var(--accent-color)] text-gray-300 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1 font-bold">{t.settingsTableLabel}</label>
                <input
                  type="text"
                  value={settings.dbSettingsTable || 'system_settings'}
                  onChange={(e) => update({ dbSettingsTable: e.target.value })}
                  className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-3 py-2 text-xs focus:ring-[var(--accent-color)] text-gray-300 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{lang === 'en' ? 'Background Animation Rotation' : lang === 'hi' ? 'पृष्ठभूमि रोटेशन (डिग्री)' : 'পটভূমি ঘূর্ণন (ডিগ্রী)'}</label>
              <div className="flex items-center gap-3 bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3">
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={settings.backgroundRotation || 0}
                  onChange={(e) => update({ backgroundRotation: Number(e.target.value) })}
                  className="flex-1 accent-[var(--accent-color)] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs font-mono text-white min-w-10 text-right">{settings.backgroundRotation || 0}°</span>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm" style={{ color: 'var(--accent-color)' }}>key</span>
                {t.devicePasswordTitle}
              </h4>
              <p className="text-[10px] text-gray-400 leading-normal">
                {lang === 'en' ? `Update the authentication password for the active controller (${getActiveDeviceId()}). The old password will be invalidated immediately.` : lang === 'hi' ? `सक्रिय कंट्रोलर (${getActiveDeviceId()}) के लिए प्रमाणीकरण पासवर्ड अपडेट करें। पुराना पासवर्ड तुरंत अमान्य हो जाएगा।` : `সক্রিয় নিয়ন্ত্রকের (${getActiveDeviceId()}) জন্য প্রমাণীকরণ পাসওয়ার্ড আপডেট করুন। পুরানো পাসওয়ার্ড অবিলম্বে বাতিল হয়ে যাবে।`}
              </p>
              <div className="space-y-2">
                <input
                  type="password"
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  placeholder={lang === 'en' ? 'New Password (min 6 characters)' : lang === 'hi' ? 'नया पासवर्ड (न्यूनतम ६ अक्षर)' : 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ টি অক্ষর)'}
                  className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-3 py-2 text-xs focus:ring-[var(--accent-color)] text-white focus:outline-none"
                />
                <button
                  onClick={async () => {
                    if (!newPassInput.trim() || newPassInput.trim().length < 6) {
                      alert(lang === 'en' ? 'Password must be at least 6 characters long' : lang === 'hi' ? 'पासवर्ड कम से कम ६ अक्षरों का होना चाहिए' : 'পাসওয়ার্ড কমপক্ষে ৬ টি অক্ষর দীর্ঘ হতে হবে');
                      return;
                    }
                    try {
                      const url = endpoint('device-change-password');
                      const res = await fetchJson(url, {
                        method: 'POST',
                        body: JSON.stringify({ new_password: newPassInput.trim() })
                      });
                      alert(res.message || (lang === 'en' ? 'Password changed successfully!' : lang === 'hi' ? 'पासवर्ड सफलतापूर्वक बदल गया!' : 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!'));
                      setNewPassInput('');
                    } catch (err) {
                      alert(`Failed to change password: ${err.message}`);
                    }
                  }}
                  className="w-full text-xs py-2 rounded-xl font-bold cursor-pointer transition-all bg-[var(--accent-color)] text-black"
                >
                  {t.changePasswordBtn}
                </button>
              </div>
            </div>

            {/* Log Out Button */}
            <button
              onClick={async () => {
                const token = localStorage.getItem('plantify_user_token');
                const url = (settings.supabaseUrl || import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
                const key = settings.supabaseAnonKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
                if (token && url) {
                  await fetch(`${url}/auth/v1/logout`, {
                    method: 'POST',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${token}` }
                  }).catch(() => {});
                }
                localStorage.removeItem('plantify_user_token');
                localStorage.removeItem('plantify_user_email');
                window.location.reload();
              }}
              className="w-full py-3 border border-red-900/30 hover:bg-red-950/20 text-red-400 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              {lang === 'en' ? 'Log Out of Controller' : lang === 'hi' ? 'कंट्रोलर से लॉग आउट करें' : 'কন্ট্রোলার থেকে লগ আউট'}
            </button>
          </div>
        </div>
      )}

      {/* SUBMENU: AI CONFIGURATION */}
      {activeMenu === 'ai' && (
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{t.apiSettingsTitle}</h4>
            <p className="text-[10px] text-gray-500 mb-4 leading-normal">{t.apiSettingsDesc}</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{t.aiProvider}</label>
              <select
                value={settings.provider}
                onChange={(e) => {
                  const p = e.target.value;
                  const defaultModel = providerModels[p]?.[0]?.value || '';
                  update({ provider: p, baseUrl: providers[p].baseUrl, model: defaultModel });
                }}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:ring-[var(--accent-color)] text-white appearance-none focus:outline-none"
              >
                {Object.entries(providers).map(([k, v]) => (
                  <option key={k} value={k} className="bg-[#13140f]">{v.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{t.apiKey}</label>
              <input
                type="password"
                value={settings.apiKey || ''}
                onChange={(e) => update({ apiKey: e.target.value })}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] text-gray-300 focus:outline-none"
                placeholder={lang === 'en' ? 'Bearer API Key' : lang === 'hi' ? 'बियरर एपीआई कुंजी' : 'বেরার API কী'}
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{lang === 'en' ? 'Endpoint Base URL' : lang === 'hi' ? 'एंडपॉइंट बेस यूआरएल' : 'এন্ডপয়েন্ট বেস URL'}</label>
              <input
                type="text"
                value={settings.baseUrl || ''}
                onChange={(e) => update({ baseUrl: e.target.value })}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] text-gray-300 focus:outline-none"
                placeholder="Endpoint Base URL"
              />
            </div>

            {loadingModels && (
              <div className="text-[11px] text-[var(--accent-color)] font-mono animate-pulse">
                {lang === 'en' ? '🔄 Fetching models list from provider...' : lang === 'hi' ? '🔄 प्रदाता से मॉडलों की सूची प्राप्त की जा रही है...' : '🔄 প্রদানকারীর থেকে মডেল তালিকা আনা হচ্ছে...'}
              </div>
            )}
            {modelError && (
              <div className="text-[10px] text-red-400 font-mono">
                {lang === 'en' ? '⚠️ API models query failed. Showing default model list.' : lang === 'hi' ? '⚠️ एपीआई मॉडल क्वेरी विफल। डिफ़ॉल्ट मॉडल सूची दिखा रहा है।' : '⚠️ API মডেল কোয়েরি ব্যর্থ। ডিফল্ট মডেল তালিকা দেখানো হচ্ছে।'}
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{t.model}</label>
              {!showCustomModelInput ? (
                <select
                  value={settings.model}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom_model_trigger') {
                      update({ model: '' });
                    } else {
                      update({ model: val });
                    }
                  }}
                  className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] text-white appearance-none focus:outline-none"
                >
                  {modelOptions.map(opt => (
                    <option key={opt} value={opt} className="bg-[#13140f]">
                      {knownModels.find(m => m.value === opt)?.label || opt}
                    </option>
                  ))}
                  <option value="custom_model_trigger" className="bg-[#13140f]">{lang === 'en' ? 'Custom Model...' : lang === 'hi' ? 'कस्टम मॉडल...' : 'কাস্টম মডেল...'}</option>
                </select>
              ) : (
                <div>
                  <input
                    type="text"
                    value={settings.model || ''}
                    onChange={(e) => update({ model: e.target.value })}
                    className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] text-gray-300 focus:outline-none"
                    placeholder="e.g. gemini-2.5-pro"
                  />
                  {settings.provider !== 'custom' && (
                    <button
                      onClick={() => update({ model: knownModels[0]?.value || '' })}
                      className="mt-1.5 text-[10px] text-[var(--accent-color)] underline"
                    >
                      {lang === 'en' ? 'Back to default models' : lang === 'hi' ? 'डिफ़ॉल्ट मॉडल पर वापस जाएं' : 'ডিফল্ট মডেলে ফিরে যান'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={testConnection}
              className="flex-1 py-3 text-xs text-black font-bold rounded-xl cursor-pointer hover:scale-[1.02] transition-all"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              {t.testConnection}
            </button>
            <button
              onClick={() => update({ apiKey: '' })}
              className="py-3 px-4 text-xs border border-white/10 rounded-xl text-white hover:bg-white/5 cursor-pointer"
            >
              {t.clearKey}
            </button>
          </div>
          
          {test && <div className="text-xs font-mono p-3 bg-white/5 rounded-xl border border-white/10">{test}</div>}
        </div>
      )}

      {/* SUBMENU: APPEARANCE & THEME */}
      {activeMenu === 'appearance' && (
        <div className="space-y-5">
          <div>
            <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">{t.visualStyling}</h4>
            <p className="text-[10px] text-gray-500 mb-6 leading-relaxed">{t.visualDesc}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{t.language}</label>
              <select
                value={settings.language || 'en'}
                onChange={(e) => update({ language: e.target.value })}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:ring-[var(--accent-color)] text-white appearance-none focus:outline-none"
              >
                <option value="en" className="bg-[#13140f]">English (US)</option>
                <option value="hi" className="bg-[#13140f]">हिन्दी (Hindi)</option>
                <option value="bn" className="bg-[#13140f]">বাংলা (Bengali)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{t.oledMode}</label>
              <div className="flex items-center mt-2">
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.isOled}
                    onChange={(e) => update({ isOled: e.target.checked })}
                    className="rounded border-white/10 text-[var(--accent-color)] bg-[#1c1e14] focus:ring-[var(--accent-color)]"
                  />
                  <span className="ml-2 text-xs font-bold text-white">{t.enableOled}</span>
                </label>
              </div>
            </div>
          </div>


          {/* Accent Color Selector */}
          <div>
            <label className="text-xs text-gray-400 block mb-3 font-bold uppercase tracking-wider">{t.accentColor}</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'lime', color: '#84cc16' },
                { id: 'emerald', color: '#10b981' },
                { id: 'cyan', color: '#06b6d4' },
                { id: 'violet', color: '#8b5cf6' },
                { id: 'fuchsia', color: '#d946ef' },
                { id: 'rose', color: '#f43f5e' },
                { id: 'amber', color: '#f59e0b' },
                { id: 'sky', color: '#0ea5e9' }
              ].map(c => {
                const isActive = settings.accent === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => update({ accent: c.id })}
                    className={`h-10 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center ${
                      isActive ? 'border-white scale-110 shadow-lg z-10' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.color }}
                  >
                    {isActive && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typography Headings Font */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{t.headingFont}</label>
              <select
                value={settings.fontHeading || 'Nunito'}
                onChange={(e) => update({ fontHeading: e.target.value })}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:ring-[var(--accent-color)] text-white appearance-none focus:outline-none"
              >
                <option value="Nunito" className="bg-[#13140f]">Nunito (Default)</option>
                <option value="Grand Hotel" className="bg-[#13140f]">Grand Hotel</option>
                <option value="Playfair Display" className="bg-[#13140f]">Playfair Display</option>
                <option value="Outfit" className="bg-[#13140f]">Outfit Sans</option>
                <option value="Lora" className="bg-[#13140f]">Lora Serif</option>
                <option value="Inter" className="bg-[#13140f]">Inter</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{t.bodyFont}</label>
              <select
                value={settings.fontBody || 'Nunito'}
                onChange={(e) => update({ fontBody: e.target.value })}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:ring-[var(--accent-color)] text-white appearance-none focus:outline-none"
              >
                <option value="Nunito" className="bg-[#13140f]">Nunito (Default)</option>
                <option value="Inter" className="bg-[#13140f]">Inter Sans</option>
                <option value="Roboto" className="bg-[#13140f]">Roboto Sans</option>
                <option value="Outfit" className="bg-[#13140f]">Outfit Sans</option>
                <option value="PT Serif" className="bg-[#13140f]">PT Serif</option>
              </select>
            </div>
          </div>

          {/* Typography Size Settings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{lang === 'en' ? 'Heading Size' : lang === 'hi' ? 'हेडिंग आकार' : 'শিরোনাম আকার'}</label>
              <select
                value={settings.fontSizeHeading || 'normal'}
                onChange={(e) => update({ fontSizeHeading: e.target.value })}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:ring-[var(--accent-color)] text-white appearance-none focus:outline-none"
              >
                <option value="small" className="bg-[#13140f]">{lang === 'en' ? 'Small' : lang === 'hi' ? 'छोटा' : 'ছোট'}</option>
                <option value="normal" className="bg-[#13140f]">{lang === 'en' ? 'Normal (Default)' : lang === 'hi' ? 'सामान्य (Default)' : 'স্বাভাবিক (Default)'}</option>
                <option value="large" className="bg-[#13140f]">{lang === 'en' ? 'Large' : lang === 'hi' ? 'बड़ा' : 'বড়'}</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{lang === 'en' ? 'Body Size' : lang === 'hi' ? 'बॉडी आकार' : 'বডি আকার'}</label>
              <select
                value={settings.fontSizeBody || 'normal'}
                onChange={(e) => update({ fontSizeBody: e.target.value })}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:ring-[var(--accent-color)] text-white appearance-none focus:outline-none"
              >
                <option value="small" className="bg-[#13140f]">{lang === 'en' ? 'Small' : lang === 'hi' ? 'छोटा' : 'ছোট'}</option>
                <option value="normal" className="bg-[#13140f]">{lang === 'en' ? 'Normal (Default)' : lang === 'hi' ? 'सामान्य (Default)' : 'স্বাভাবিক (Default)'}</option>
                <option value="large" className="bg-[#13140f]">{lang === 'en' ? 'Large' : lang === 'hi' ? 'बड़ा' : 'বড়'}</option>
              </select>
            </div>
          </div>

          {/* Google Fonts Link */}
          <div>
            <label className="text-xs text-gray-400 block mb-1 font-bold">{t.googleFontsLabel}</label>
            <input
              type="text"
              value={settings.googleFontsUrl || ''}
              onChange={(e) => update({ googleFontsUrl: e.target.value })}
              className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-xs focus:ring-[var(--accent-color)] text-gray-300 focus:outline-none"
              placeholder="e.g. https://fonts.googleapis.com/css2?family=Caveat&display=swap"
            />
            <p className="text-[10px] text-gray-500 mt-1">{lang === 'en' ? 'Paste a full Google Fonts link. Style it by typing the exact font name above.' : lang === 'hi' ? 'एक पूर्ण Google Fonts लिंक पेस्ट करें। ऊपर सटीक फ़ॉन्ट नाम टाइप करके इसे स्टाइल करें।' : 'একটি সম্পূর্ণ Google Fonts লিঙ্ক পেস্ট করুন। উপরে সঠিক ফন্টের নাম টাইপ করে স্টাইল করুন।'}</p>
          </div>

          {/* Background Beams Settings */}
          <div className="pt-4 mt-2 border-t border-white/5 space-y-5">
            <label className="text-xs text-gray-400 block font-bold uppercase tracking-wider mb-3">{t.visualStyling}</label>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{t.beamNumberLabel}</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--accent-color)' }}>{settings.beamNumber ?? 12}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={settings.beamNumber ?? 12}
                  onChange={(e) => update({ beamNumber: Number(e.target.value) })}
                  className="w-full accent-[var(--accent-color)] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer animate-transition"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{t.beamWidthLabel}</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--accent-color)' }}>{settings.beamWidth ?? 2.2}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={settings.beamWidth ?? 2.2}
                  onChange={(e) => update({ beamWidth: Number(e.target.value) })}
                  className="w-full accent-[var(--accent-color)] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer animate-transition"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{t.beamSpeedLabel}</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--accent-color)' }}>{settings.beamSpeed ?? 3.4}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="10.0"
                  step="0.2"
                  value={settings.beamSpeed ?? 3.4}
                  onChange={(e) => update({ beamSpeed: Number(e.target.value) })}
                  className="w-full accent-[var(--accent-color)] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer animate-transition"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{t.beamNoiseLabel}</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--accent-color)' }}>{settings.beamNoise ?? 1.75}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="5.0"
                  step="0.1"
                  value={settings.beamNoise ?? 1.75}
                  onChange={(e) => update({ beamNoise: Number(e.target.value) })}
                  className="w-full accent-[var(--accent-color)] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer animate-transition"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMENU: WEATHER & LOCATION */}
      {activeMenu === 'location' && (
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{t.weatherSettingsTitle}</h4>
            <p className="text-[10px] text-gray-500 mb-4 leading-normal">{t.weatherSettingsDesc}</p>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1 font-bold">{lang === 'en' ? 'Location Presets' : lang === 'hi' ? 'स्थान प्रीसेट' : 'অবস্থান প্রিসেট'}</label>
            <select
              value={settings.weatherPlace || 'patna'}
              onChange={(e) => {
                const place = weatherPlaces[e.target.value];
                if (place) {
                  update({
                    weatherPlace: e.target.value,
                    city: place.city,
                    country: place.country,
                    latitude: place.latitude,
                    longitude: place.longitude
                  });
                }
              }}
              className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] text-white appearance-none focus:outline-none"
            >
              {Object.entries(weatherPlaces).map(([k, v]) => (
                <option key={k} value={k} className="bg-[#13140f]">{v.label}</option>
              ))}
            </select>

            {settings.weatherPlace === 'custom' && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1 font-bold">{t.latitudeLabel}</label>
                  <input
                    type="number"
                    value={settings.latitude === null || settings.latitude === undefined ? '' : settings.latitude}
                    onChange={(e) => update({ latitude: e.target.value ? Number(e.target.value) : '' })}
                    step="0.0001"
                    className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-2 text-xs focus:ring-[var(--accent-color)] text-gray-300 focus:outline-none"
                    placeholder="e.g. 25.5941"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1 font-bold">{t.longitudeLabel}</label>
                  <input
                    type="number"
                    value={settings.longitude === null || settings.longitude === undefined ? '' : settings.longitude}
                    onChange={(e) => update({ longitude: e.target.value ? Number(e.target.value) : '' })}
                    step="0.0001"
                    className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-2 text-xs focus:ring-[var(--accent-color)] text-gray-300 focus:outline-none"
                    placeholder="e.g. 85.1376"
                  />
                </div>
              </div>
            )}
            
            <LocationMap 
              lat={settings.latitude} 
              lng={settings.longitude} 
              onLocationSelect={(lat, lng) => update({ latitude: lat, longitude: lng, weatherPlace: 'custom' })} 
            />
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1 font-bold">{lang === 'en' ? 'Elevation (m)' : lang === 'hi' ? 'ऊंचाई (m)' : 'উচ্চতা (মিটার)'}</label>
                <input
                  type="number"
                  value={settings.weatherElevation || ''}
                  onChange={(e) => update({ weatherElevation: e.target.value ? Number(e.target.value) : '' })}
                  className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-3 py-2 text-xs focus:ring-[var(--accent-color)] text-gray-300 focus:outline-none"
                  placeholder="Auto"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1 font-bold">{t.tempUnitLabel}</label>
                <select
                  value={settings.weatherTempUnit || 'celsius'}
                  onChange={(e) => update({ weatherTempUnit: e.target.value })}
                  className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-3 py-2 text-xs focus:ring-[var(--accent-color)] text-white appearance-none focus:outline-none"
                >
                  <option value="celsius" className="bg-[#13140f]">°C</option>
                  <option value="fahrenheit" className="bg-[#13140f]">°F</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1 font-bold">{t.windUnitLabel}</label>
                <select
                  value={settings.weatherWindUnit || 'kmh'}
                  onChange={(e) => update({ weatherWindUnit: e.target.value })}
                  className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-3 py-2 text-xs focus:ring-[var(--accent-color)] text-white appearance-none focus:outline-none"
                >
                  <option value="kmh" className="bg-[#13140f]">km/h</option>
                  <option value="ms" className="bg-[#13140f]">m/s</option>
                  <option value="mph" className="bg-[#13140f]">mph</option>
                </select>
              </div>
            </div>

            <button
              onClick={reloadWeather}
              className="mt-5 w-full py-3 text-xs bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-white font-bold cursor-pointer transition-all hover:scale-[1.01]"
            >
              {lang === 'en' ? 'Fetch OpenMeteo Data' : lang === 'hi' ? 'मौसम डेटा प्राप्त करें' : 'আবহাওয়ার তথ্য আনুন'}
            </button>
            {weather?.current && (
              <p className="text-[11px] text-gray-400 mt-2 font-mono text-center">
                {lang === 'en' ? 'Last Response' : lang === 'hi' ? 'अंतिम प्रतिक्रिया' : 'সর্বশেষ প্রতিক্রিয়া'}: {weather.current.temperature_2m}°C · Rain: {weather.current.rain}mm
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- LOGIN SCREEN ----------------
function LoginScreen({ settings, setSettings, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const supabaseUrl = (settings.supabaseUrl || import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const anonKey = settings.supabaseAnonKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Email and password are required.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': anonKey },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error_description || json.msg || 'Invalid email or password.');
      localStorage.setItem('plantify_user_token', json.access_token);
      localStorage.setItem('plantify_user_email', json.user?.email || email.trim());
      onLoginSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center shadow-2xl"
            style={{ background: 'linear-gradient(135deg, var(--accent-color) 0%, #2d5a27 100%)' }}
          >
            <span className="material-symbols-outlined text-4xl text-black" style={{ fontVariationSettings: "'FILL' 1" }}>forest</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--accent-color)' }}>Plantify</h1>
          <p className="text-xs text-gray-500 mt-1 tracking-widest uppercase">Smart Farm Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-7 shadow-2xl backdrop-blur-xl space-y-5">
          <div>
            <h2 className="text-lg font-bold text-white">Welcome back</h2>
            <p className="text-xs text-gray-500 mt-0.5">Sign in to access your dashboard</p>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 bg-red-950/50 border border-red-800/40 rounded-2xl text-xs text-red-300">
              <span className="material-symbols-outlined text-sm text-red-400 shrink-0 mt-0.5">error</span>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-[18px]">alternate_email</span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  autoComplete="email"
                  className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[var(--accent-color)]/60 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-[18px]">lock</span>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[var(--accent-color)]/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[18px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-black flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ backgroundColor: 'var(--accent-color)', opacity: loading ? 0.7 : 1 }}
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                : <span className="material-symbols-outlined text-[18px]">login</span>
              }
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-gray-600 mt-6">
          © 2026 Plantify · Built by CLOUD 🌨️
        </p>
      </div>
    </div>
  );
}

// ---------------- SETUP WIZARD FOR FIRST-TIME USERS ----------------

function SetupWizard({ settings, setSettings }) {
  const t = dict[settings?.language || 'en'] || dict.en;
  const lang = settings?.language || 'en';
  const [step, setStep] = useState(1);
  const [plantName, setPlantName] = useState(settings.plantName || '');
  const [plantType, setPlantType] = useState(settings.plantType || 'millet');
  const [plantingDate, setPlantingDate] = useState(settings.plantingDate || '2026-06-01');
  const [fieldArea, setFieldArea] = useState(settings.fieldAreaSqM || '');
  const [soilType, setSoilType] = useState(settings.soilType || 'Standard Soil');
  const [aiProvider, setAiProvider] = useState(settings.provider || 'openrouter');
  const [aiKey, setAiKey] = useState(settings.apiKey || '');
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(settings.supabaseUrl || getRuntimeSupabaseUrl());
  const [supabaseAnonKeyInput, setSupabaseAnonKeyInput] = useState(settings.supabaseAnonKey || localStorage.getItem('plantai_supabase_key') || '');
  const [mandiState, setMandiState] = useState(settings.mandiState || '');
  const [mandiMarket, setMandiMarket] = useState(settings.mandiMarket || '');

  const finish = () => {
    const defaultModels = {
      openrouter: 'qwen/qwen-3.5-flash',
      openai: 'gpt-4o-mini',
      gemini: 'gemini-2.5-flash',
      groq: 'llama-3.1-8b-instant',
      nvidia: 'moonshotai/kimi-k2-instruct',
      custom: ''
    };
    const sanitizedSupabase = supabaseUrlInput.trim().replace(/^https?:\/\//i, '');
    const next = {
      ...settings,
      plantName: plantName || 'My farm',
      plantType,
      plantingDate,
      fieldAreaSqM: fieldArea || '1.0',
      soilType,
      provider: aiProvider,
      apiKey: aiKey,
      supabaseUrl: sanitizedSupabase,
      supabaseAnonKey: supabaseAnonKeyInput.trim(),
      mandiState,
      mandiMarket,
      baseUrl: providers[aiProvider]?.baseUrl || '',
      model: defaultModels[aiProvider] || '',
      isSetupComplete: true
    };
    setSettings(next);
    saveSettings(next);
    localStorage.setItem('plantai_supabase_key', supabaseAnonKeyInput.trim());
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex items-center justify-center p-4">
      <div className="w-full bg-[rgba(30,32,26,0.45)] backdrop-blur-xl rounded-[40px] p-8 border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full bg-[var(--accent-color)]/10"></div>
        
        {/* Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center bg-white/5 border border-white/10 shadow-xl animate-toast-enter" style={{ color: 'var(--accent-color)' }}>
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22C12 17 12 12 12 10" />
              <path d="M12 14C8 14 5 11 5 7C8 7 11 9 12 12" />
              <path d="M12 12C13 9 16 7 20 7C20 11 17 14 12 14" />
            </svg>
          </div>
          <h2 className="serif-title text-3xl font-bold" style={{ color: 'var(--accent-color)' }}>{t.welcome}</h2>
          <p className="text-xs text-gray-400">{t.wizardSubtitle.replace('{step}', step)}</p>
          
          <div className="flex justify-center pt-2">
            <select
              value={settings.language || 'en'}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="bg-black/35 border border-white/10 rounded-full px-3 py-1 text-[11px] focus:ring-[var(--accent-color)] text-gray-300 appearance-none focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-[#13140f]">English</option>
              <option value="hi" className="bg-[#13140f]">हिन्दी</option>
              <option value="bn" className="bg-[#13140f]">বাংলা</option>
            </select>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
          <div className="h-full transition-all duration-300" style={{ backgroundColor: 'var(--accent-color)', width: `${(step / 3) * 100}%` }}></div>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{t.cropFarmName}</label>
              <input
                type="text"
                value={plantName}
                onChange={(e) => setPlantName(e.target.value)}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] text-white focus:outline-none"
                placeholder={t.farmNamePlaceholder}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{t.cropType}</label>
              <select
                value={plantType}
                onChange={(e) => setPlantType(e.target.value)}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] text-white appearance-none focus:outline-none"
              >
                {Object.entries(plantProfiles).map(([k, v]) => (
                  <option key={k} value={k} className="bg-[#13140f]">{v.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1 font-bold">{lang === 'en' ? 'Mandi State (India)' : lang === 'hi' ? 'मंडी राज्य' : 'মান্ডি রাজ্য'}</label>
                <select
                  value={mandiState}
                  onChange={(e) => setMandiState(e.target.value)}
                  className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] text-white appearance-none focus:outline-none cursor-pointer"
                >
                  {INDIAN_STATES.map(st => (
                    <option key={st.value} value={st.value} className="bg-[#13140f]">{st.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1 font-bold">{lang === 'en' ? 'Mandi / Market' : lang === 'hi' ? 'मंडी / बाजार' : 'মান্ডি / বাজার'}</label>
                <input
                  type="text"
                  value={mandiMarket}
                  onChange={(e) => setMandiMarket(e.target.value)}
                  className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] text-white focus:outline-none"
                  placeholder="e.g. Ganaur APMC"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{t.plantingDate}</label>
              <input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] text-gray-300 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{t.fieldAreaSqM}</label>
              <input
                type="number"
                value={fieldArea}
                onChange={(e) => setFieldArea(e.target.value)}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] text-white focus:outline-none"
                placeholder={t.areaPlaceholder}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{t.soilComposition}</label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] text-white appearance-none focus:outline-none"
              >
                <option value="Standard Soil" className="bg-[#13140f]">{lang === 'en' ? 'Standard Soil' : lang === 'hi' ? 'सामान्य मिट्टी' : 'সাধারণ মাটি'}</option>
                <option value="Sandy Soil" className="bg-[#13140f]">{lang === 'en' ? 'Sandy Soil' : lang === 'hi' ? 'रेतीली मिट्टी' : 'বেলে মাটি'}</option>
                <option value="Clay Soil" className="bg-[#13140f]">{lang === 'en' ? 'Clay Soil' : lang === 'hi' ? 'चिकनी मिट्टी' : 'কাদামাটি'}</option>
                <option value="Loam Soil" className="bg-[#13140f]">{lang === 'en' ? 'Loam Soil' : lang === 'hi' ? 'दोमट मिट्टी' : 'দোআঁশ মাটি'}</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{t.supabaseUrl}</label>
              <input
                type="text"
                value={supabaseUrlInput}
                onChange={(e) => setSupabaseUrlInput(e.target.value)}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] text-white focus:outline-none"
                placeholder={t.dbEndpointPlaceholder}
              />
              <p className="text-[10px] text-gray-500 mt-1">{t.supabaseUrlHelp}</p>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{t.supabaseAnonKey}</label>
              <input
                type="password"
                value={supabaseAnonKeyInput}
                onChange={(e) => setSupabaseAnonKeyInput(e.target.value)}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] text-white focus:outline-none"
                placeholder="eyJhbGciOi..."
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold mt-4">{t.aiProvider}</label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] text-white appearance-none focus:outline-none"
              >
                {Object.entries(providers).map(([k, v]) => (
                  <option key={k} value={k} className="bg-[#13140f]">{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-bold">{t.apiKey}</label>
              <input
                type="password"
                value={aiKey}
                onChange={(e) => setAiKey(e.target.value)}
                className="w-full bg-[#1c1e14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-[var(--accent-color)] text-white focus:outline-none"
                placeholder={t.apiKeyHelp}
              />
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="py-3 px-6 rounded-xl border border-white/10 text-white font-bold text-sm cursor-pointer hover:bg-white/5"
            >
              {t.back}
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 py-3 text-black font-bold rounded-xl text-sm cursor-pointer hover:opacity-90"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              {t.continueBtn}
            </button>
          ) : (
            <button
              onClick={finish}
              className="flex-1 py-3 text-black font-bold rounded-xl text-sm cursor-pointer hover:opacity-90 animate-pulse"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              {t.getStarted}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------- MAIN CONTAINER ----------------

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState(loadCachedSensorData);
  const [weather, setWeather] = useState(loadCachedWeatherData);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [settings, setSettings] = useState(loadSettings);
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('plantify_user_token')));
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const DEVICE_ID = getActiveDeviceId();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleUnauthorized = () => {
      setIsLoggedIn(false);
      localStorage.removeItem('plantify_user_token');
    };
    window.addEventListener('plantify-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('plantify-unauthorized', handleUnauthorized);
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const accents = useMemo(() => ({
    lime: '#84cc16',
    emerald: '#10b981',
    cyan: '#06b6d4',
    violet: '#8b5cf6',
    fuchsia: '#d946ef',
    rose: '#f43f5e',
    amber: '#f59e0b',
    sky: '#0ea5e9'
  }), []);

  const currentAccent = accents[settings.accent] || '#84cc16';

  useEffect(() => {
    const root = document.documentElement;
    
    // Font Families definitions
    const headingFonts = {
      'Nunito': "'Nunito', sans-serif",
      'Grand Hotel': "'Grand Hotel', cursive",
      'Inter': "'Inter', sans-serif",
      'Playfair Display': "'Playfair Display', serif",
      'Outfit': "'Outfit', sans-serif",
      'Lora': "'Lora', serif"
    };
    const bodyFonts = {
      'Nunito': "'Nunito', sans-serif",
      'Inter': "'Inter', sans-serif",
      'Roboto': "'Roboto', sans-serif",
      'Outfit': "'Outfit', sans-serif",
      'PT Serif': "'PT Serif', serif"
    };

    const headingFont = headingFonts[settings.fontHeading] || "'Nunito', sans-serif";
    const bodyFont = bodyFonts[settings.fontBody] || "'Nunito', sans-serif";

    // Text Sizes resolved using REM root scale triggers
    const htmlSizes = {
      small: '14px',
      normal: '16px',
      large: '18px'
    };
    const headingSizes = {
      small: '1.25rem',
      normal: '1.625rem',
      large: '2.125rem'
    };
    const htmlSz = htmlSizes[settings.fontSizeBody] || '16px';
    const headingSz = headingSizes[settings.fontSizeHeading] || '1.625rem';

    // Theme Resolution variables (OLED removed)
    const isLight = settings.theme === 'light';
    const bg = isLight ? '#f5f6f0' : (settings.isOled ? '#000000' : '#12140e');
    const text = isLight ? '#1c1e14' : '#e4e3da';
    const cardBg = isLight ? 'rgba(255, 255, 255, 0.82)' : 'rgba(30, 32, 26, 0.45)';
    const borderColor = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)';

    root.style.setProperty('--accent-color', currentAccent);
    root.style.setProperty('--bg-color', bg);
    root.style.setProperty('--text-color', text);
    root.style.setProperty('--card-bg', cardBg);
    root.style.setProperty('--border-color', borderColor);

    let styleTag = document.getElementById('plantai-appearance-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'plantai-appearance-styles';
      document.head.appendChild(styleTag);
    }

    styleTag.innerHTML = `
      :root {
        --accent-color: ${currentAccent} !important;
        --bg-color: ${bg} !important;
        --text-color: ${text} !important;
        --card-bg: ${cardBg} !important;
        --border-color: ${borderColor} !important;
      }
      
      html {
        font-size: ${htmlSz} !important;
      }
      
      body, #root, .max-w-md {
        background-color: ${bg} !important;
        color: ${text} !important;
        font-family: ${bodyFont}, sans-serif !important;
      }

      /* Bulletproof font overrides without forcing layout breaking size variables on elements */
      body, p, span, div:not(.serif-title):not(.font-serif):not(.logo-text), li, select, textarea, input, label, button, a {
        font-family: ${bodyFont}, sans-serif !important;
      }

      h1, h2, h3, h4, h5, h6, .font-serif, .serif-title {
        font-family: ${headingFont}, sans-serif !important;
      }

      /* Styled Heading Sizes overrides to respect hierarchy, ignoring elements with small text classes */
      h1, .text-5xl {
        font-size: ${headingSz} !important;
        line-height: 1.2 !important;
      }
      h2, .text-3xl:not(.text-xs):not(.text-sm):not(.text-[10px]):not(.text-[11px]):not(.text-base):not(.text-lg):not(.text-xl) {
        font-size: calc(${headingSz} * 0.8) !important;
        line-height: 1.25 !important;
      }
      h3, .text-2xl:not(.text-xs):not(.text-sm):not(.text-[10px]):not(.text-[11px]):not(.text-base):not(.text-lg):not(.text-xl) {
        font-size: calc(${headingSz} * 0.7) !important;
        line-height: 1.3 !important;
      }

      /* Avoid overriding small menu tags like h4 description titles */
      h4:not(.text-xl):not(.text-2xl):not(.text-3xl):not(.text-4xl):not(.text-5xl), h5, h6 {
        font-size: inherit;
      }

      .logo-text {
        font-family: ${headingFont}, sans-serif !important;
        font-size: 1.5rem !important;
      }

      /* Dynamic Theme overrides on card classes */
      .bg-\\[rgba\\(30\\,32\\,26\\,0\\.45\\)\\] {
        background: ${cardBg} !important;
      }
      .bg-\\[rgba\\(30\\,32\\,26\\,0\\.45\\)\\]\\/50 {
        background: ${cardBg} !important;
      }
      .border-white\\/10 {
        border-color: ${borderColor} !important;
      }
      .bg-\\[\\#1c1e14\\] {
        background-color: ${isLight ? 'rgba(0,0,0,0.03)' : '#1c1e14'} !important;
      }
      
      /* Dynamic accent colors overriding hardcoded tailwind classes */
      .text-\\[\\#d4ff00\\] {
        color: ${currentAccent} !important;
      }
      .bg-\\[\\#d4ff00\\] {
        background-color: ${currentAccent} !important;
        color: #000000 !important;
      }
      .accent-\\[var\\(--accent-color\\)\\] {
        accent-color: ${currentAccent} !important;
      }
      .border-\\[var\\(--accent-color\\)\\] {
        border-color: ${currentAccent} !important;
      }
      .material-symbols-outlined {
        font-family: 'Material Symbols Outlined' !important;
      }
    `;

    // Google font sheet loader
    if (settings.googleFontsUrl) {
      let link = document.getElementById('custom-google-fonts');
      if (!link) {
        link = document.createElement('link');
        link.id = 'custom-google-fonts';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      link.href = settings.googleFontsUrl;
    } else {
      const link = document.getElementById('custom-google-fonts');
      if (link) link.remove();
    }
  }, [
    settings.theme,
    settings.accent,
    settings.fontHeading,
    settings.fontBody,
    settings.googleFontsUrl,
    settings.fontSizeHeading,
    settings.fontSizeBody,
    settings.isOled,
    currentAccent
  ]);

  const aggregatedReadings = useMemo(() => {
    return aggregateReadings(data.readings || [], settings.historyAverageMinutes);
  }, [data.readings, settings.historyAverageMinutes]);

  async function refresh(isManual = false) {
    try {
      setRefreshing(true);
      setError('');
      const json = await fetchJson(`${endpoint('dashboard-data')}?device_id=${DEVICE_ID}`);
      const nextData = {
        latest: json.latest ?? null,
        readings: json.readings ?? [],
        plant: json.plant ?? null,
        device: json.device ?? null,
        latestCommandStatus: json.latestCommandStatus ?? null
      };
      setData(nextData);
      saveCachedSensorData(nextData);
    } catch (e) {
      setError(e.message);
      if (e.status === 401 || e.message.includes('401') || e.message.toLowerCase().includes('unauthorized') || e.message.toLowerCase().includes('jwt')) {
        setIsLoggedIn(false);
        localStorage.removeItem('plantify_user_token');
      }
    } finally {
      setRefreshing(false);
    }
  }

  async function reloadWeather() {
    try {
      const fetched = await fetchWeather(settings);
      setWeather(fetched);
      saveCachedWeatherData(fetched);
    } catch (e) {
      if (e.message === 'Coordinates missing') {
        setError('Weather update failed. Coordinates missing.');
      } else {
        setError(`Weather update failed. Using cached profile.`);
        const cached = loadCachedWeatherData();
        if (cached) {
          setWeather(cached);
        }
      }
    }
  }

  useEffect(() => {
    refresh();
    const timer = setInterval(() => refresh(), 30000);

    let ws = null;
    let heartbeatTimer = null;
    let reconnectTimeout = null;

    function connectRealtime() {
      const sbUrl = getRuntimeSupabaseUrl();
      if (!sbUrl) return;

      const currentSettings = (() => {
        try {
          return JSON.parse(localStorage.getItem('plantai_settings') || '{}');
        } catch {
          return {};
        }
      })();
      const sbKey = currentSettings.supabaseAnonKey || localStorage.getItem('plantai_supabase_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      if (!sbKey) return;

      const wsProtocol = sbUrl.startsWith('https') ? 'wss://' : 'ws://';
      const cleanHost = sbUrl.replace(/^https?:\/\//i, '').replace(/\/$/, '');
      const socketUrl = `${wsProtocol}${cleanHost}/realtime/v1/websocket?apikey=${encodeURIComponent(sbKey)}&vsn=1.0.0`;

      ws = new WebSocket(socketUrl);

      ws.onopen = () => {
        ws.send(JSON.stringify({
          topic: 'realtime:public',
          event: 'phx_join',
          payload: {
            config: {
              postgres_changes: [
                {
                  event: '*',
                  schema: 'public',
                  table: 'relay_commands',
                  filter: `device_id=eq.${DEVICE_ID}`
                },
                {
                  event: 'INSERT',
                  schema: 'public',
                  table: 'sensor_readings',
                  filter: `device_id=eq.${DEVICE_ID}`
                }
              ]
            }
          },
          ref: '1'
        }));

        heartbeatTimer = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              topic: 'phoenix',
              event: 'heartbeat',
              payload: {},
              ref: ''
            }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event === 'postgres_changes') {
            refresh();
          }
        } catch (e) {
          // ignore
        }
      };

      ws.onclose = () => {
        cleanup();
        reconnectTimeout = setTimeout(connectRealtime, 5000);
      };

      ws.onerror = () => {
        // ignore
      };
    }

    function cleanup() {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        try {
          ws.close();
        } catch {}
        ws = null;
      }
    }

    connectRealtime();

    return () => {
      clearInterval(timer);
      cleanup();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [DEVICE_ID]);

  useEffect(() => {
    const lat = String(settings.latitude || '').trim();
    const lng = String(settings.longitude || '').trim();
    if (!lat || !lng || isNaN(Number(lat)) || isNaN(Number(lng))) {
      return;
    }
    const timer = setTimeout(() => {
      reloadWeather();
    }, 800);
    return () => clearTimeout(timer);
  }, [settings.latitude, settings.longitude]);

  // Tab change scroll position reset
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [tab]);

  // Smart Auto-Watering & Toasts
  const [toastMsg, setToastMsg] = useState(null);
  useEffect(() => {
    if (!data.latest) return;
    const m = data.latest.soil_moisture_percent;
    const isMotorActive = Boolean(data.latest.relay_motor_on);
    if (m !== undefined && m < settings.autoWateringMoistureThreshold) {
      if (settings.autoWateringEnabled) {
        setToastMsg(`Auto-watering triggered (Moisture: ${m}%)`);
        if (!isMotorActive) {
          queueRelayCommand('on', settings.autoWateringDurationMinutes || 10, `Auto-watering trigger (Moisture: ${m}%)`)
            .catch(err => console.error('Auto-watering failure:', err));
        }
      } else {
        setToastMsg(`⚠️ Warning: Soil moisture critically low (${m}%)!`);
      }
      const tId = setTimeout(() => setToastMsg(null), 5000);
      return () => clearTimeout(tId);
    }
  }, [data.latest?.soil_moisture_percent, data.latest?.relay_motor_on, settings.autoWateringMoistureThreshold, settings.autoWateringEnabled, settings.autoWateringDurationMinutes]);

  if (!settings.isSetupComplete) {
    return (
      <div className="max-w-md mx-auto min-h-screen relative overflow-hidden bg-[#13140f] text-[#e4e3da] font-sans">
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <Beams
            beamWidth={settings.beamWidth ?? 2.2}
            beamHeight={15}
            beamNumber={settings.beamNumber ?? 12}
            lightColor={currentAccent}
            speed={settings.beamSpeed ?? 3.4}
            noiseIntensity={settings.beamNoise ?? 1.75}
            scale={0.2}
            rotation={settings.backgroundRotation || 0}
          />
        </div>
        <div className="relative z-10">
          <SetupWizard settings={settings} setSettings={setSettings} />
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto min-h-screen relative overflow-hidden bg-[#13140f] text-[#e4e3da] font-sans">
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <Beams
            beamWidth={settings.beamWidth ?? 2.2}
            beamHeight={15}
            beamNumber={settings.beamNumber ?? 12}
            lightColor={currentAccent}
            speed={settings.beamSpeed ?? 3.4}
            noiseIntensity={settings.beamNoise ?? 1.75}
            scale={0.2}
            rotation={settings.backgroundRotation || 0}
          />
        </div>
        <div className="relative z-10">
          <LoginScreen settings={settings} setSettings={setSettings} onLoginSuccess={() => setIsLoggedIn(true)} />
        </div>
      </div>
    );
  }

  const lang = settings.language || 'en';
  const t = dict[lang] || dict.en;

  return (
    <div className={`max-w-md mx-auto min-h-screen pb-28 relative text-[#e4e3da] font-sans ${settings.isOled ? 'bg-black' : 'bg-[#13140f]/50'}`}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div 
          className="fixed top-20 right-4 bg-[rgba(30,32,26,0.9)] backdrop-blur-xl border border-[var(--accent-color)] text-white px-5 py-3 rounded-2xl animate-toast-enter"
          style={{ zIndex: 'var(--z-toast)', boxShadow: '0 0 20px color-mix(in srgb, var(--accent-color) 30%, transparent)' }}
        >
          <p className="text-sm font-bold">{toastMsg}</p>
        </div>
      )}
      {/* Beams Background */}
      {!settings.isOled && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <Beams
            beamWidth={settings.beamWidth ?? 2.2}
            beamHeight={15}
            beamNumber={settings.beamNumber ?? 12}
            lightColor={currentAccent}
            speed={settings.beamSpeed ?? 3.4}
            noiseIntensity={settings.beamNoise ?? 1.75}
            scale={0.2}
            rotation={settings.backgroundRotation || 0}
          />
        </div>
      )}
      {/* HEADER */}
      <header className="sticky top-4 mx-4 my-2 px-5 py-3.5 flex items-center justify-between bg-[rgba(25,28,18,0.7)] backdrop-blur-xl border border-white/10 rounded-full z-50 shadow-2xl">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-color)' }}>
            <path d="M12 22C12 17 12 12 12 10" />
            <path d="M12 14C8 14 5 11 5 7C8 7 11 9 12 12" />
            <path d="M12 12C13 9 16 7 20 7C20 11 17 14 12 14" />
          </svg>
          <span className="logo-text text-xl font-bold tracking-tight" style={{ color: 'var(--accent-color)' }}>Plantify</span>
        </div>

        <div className="flex items-center gap-3">
          {!isOnline && (
            <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
              {t.offline}
            </span>
          )}
          <span className="text-xs px-2.5 py-1.5 rounded-full font-bold uppercase tracking-wider whitespace-nowrap" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--accent-color)' }}>
            {data.latest ? ago(data.latest.recorded_at) : 'No data'}
          </span>
          <PillNav
            logo={logoSvg}
            logoAlt="Plantify Logo"
            items={[
              { label: t.dashboard, href: 'dashboard' },
              { label: t.history, href: 'history' },
              { label: t.tasks, href: 'tasks' },
              { label: t.advisor, href: 'chat' },
              { label: t.ai, href: 'ai' },
              { label: t.settings, href: 'settings' }
            ]}
            activeHref={tab}
            onItemClick={(href) => setTab(href)}
            showLogo={false}
            className="flex-shrink-0"
            baseColor="#1c1e14"
            pillColor="rgba(255,255,255,0.04)"
            pillTextColor="#e4e3da"
            hoveredPillTextColor="#1c1e14"
            ease="power2.easeOut"
          />
        </div>
      </header>

      {/* CONTENT SWITCHER */}
      <main className="px-4 py-4 space-y-4 relative z-10">
        {tab === 'dashboard' && (
          <Dashboard
            data={data}
            weather={weather}
            refresh={refresh}
            refreshing={refreshing}
            error={error}
            settings={settings}
            setSettings={setSettings}
            setTab={setTab}
          />
        )}
        {tab === 'tasks' && <TasksTab settings={settings} setSettings={setSettings} weather={weather} delayStatus={getIrrigationDelayStatus(weather, settings)} />}
        {tab === 'ai' && <AiPlan data={data} weather={weather} settings={settings} aggregatedReadings={aggregatedReadings} />}
        {tab === 'chat' && <Chat data={data} weather={weather} settings={settings} aggregatedReadings={aggregatedReadings} />}
        {tab === 'history' && <History readings={aggregatedReadings} settings={settings} />}
        {tab === 'settings' && (
          <Settings
            settings={settings}
            setSettings={setSettings}
            reloadWeather={reloadWeather}
            weather={weather}
          />
        )}
      </main>

      {/* NAVIGATION BAR — 5 tabs, use smaller w-10 icons */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[94%] bg-[rgba(30,32,26,0.60)] backdrop-blur-xl border border-white/10 rounded-full h-16 flex items-center justify-around px-3 z-[100] shadow-2xl">
        {[
          { id: 'dashboard', icon: 'grid_view' },
          { id: 'history',   icon: 'history' },
          { id: 'tasks',     icon: 'checklist' },
          { id: 'chat',      icon: 'forum' },
          { id: 'ai',        icon: 'auto_awesome' },
        ].map(({ id, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
              tab === id ? 'text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}
            style={tab === id ? { backgroundColor: 'var(--accent-color)', boxShadow: '0 0 14px color-mix(in srgb, var(--accent-color) 40%, transparent)' } : {}}
          >
            <span className="material-symbols-outlined text-xl">{icon}</span>
          </button>
        ))}
      </nav>

      {/* Dynamic Legal Footer */}
      <footer className="w-full text-center pb-24 pt-4 px-6 text-[10px] text-gray-500 space-y-1 relative z-10 border-t border-white/5 mt-8">
        <div>© 2026 Plantify. All rights reserved.</div>
        <div className="flex justify-center gap-3">
          <button onClick={() => setShowTerms(true)} className="hover:underline cursor-pointer">Terms & Conditions</button>
          <span>•</span>
          <button onClick={() => setShowPrivacy(true)} className="hover:underline cursor-pointer">Privacy Policy</button>
        </div>
      </footer>

      {/* Legal Agreement Modal */}
      {(showTerms || showPrivacy) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[999] animate-fade-in">
          <div className="w-full max-w-sm bg-[rgba(30,32,26,0.95)] backdrop-blur-2xl rounded-[30px] border border-white/10 p-6 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
              <h3 className="serif-title text-xl font-bold" style={{ color: 'var(--accent-color)' }}>
                {showTerms ? 'Terms & Conditions' : 'Privacy Policy'}
              </h3>
              <button 
                onClick={() => { setShowTerms(false); setShowPrivacy(false); }} 
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            
            <div className="overflow-y-auto text-xs text-gray-300 space-y-4 pr-1 leading-relaxed text-left font-sans custom-scrollbar select-text">
              {showTerms ? (
                <>
                  <p className="font-bold text-sm" style={{ color: 'var(--accent-color)' }}>Governing Law: India</p>
                  <p>Welcome to Plantify. By using our website, device, or services, you agree to these Terms. Please read them carefully.</p>
                  
                  <h4 className="font-bold text-[#e4e3da] mt-3">1. Use of Service & AI Advice</h4>
                  <p>Plantify provides smart agronomy recommendations, care charts, and automated water schedules using local sensor telemetry and AI logic. All advice and schedules generated by Plantify are for guidance and reference purposes only. Users must manually verify physical crop and soil conditions before taking action.</p>
                  
                  <h4 className="font-bold text-[#e4e3da] mt-3">2. Agricultural Advisory Disclaimer</h4>
                  <p>We do not guarantee crop yields, pest prevention, or specific agricultural outcomes. Under no circumstances shall Plantify be liable for crop failure, hardware damage, or other operational losses resulting from the use or reliance on AI recommendations.</p>
                  
                  <h4 className="font-bold text-[#e4e3da] mt-3">3. Account & Device Security</h4>
                  <p>You are responsible for safeguarding your Supabase accounts, device identification tokens, and passwords. Any unauthorized access must be reported immediately.</p>
                  
                  <p className="text-[10px] text-gray-500 mt-4">Last Updated: July 2026</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-sm" style={{ color: 'var(--accent-color)' }}>Data Scope: Anonymous Telemetry</p>
                  <p>Your privacy is highly important to us. This policy describes how Plantify processes and stores your information.</p>
                  
                  <h4 className="font-bold text-[#e4e3da] mt-3">1. Information We Collect</h4>
                  <p>We collect hardware IoT telemetry data (including soil moisture, ambient temperature, humidity, and NPK levels) uploaded by your ESP32 controller. We also store your selected crop type, planting date, and regional Mandi preference.</p>
                  
                  <h4 className="font-bold text-[#e4e3da] mt-3">2. Location Data</h4>
                  <p>To provide relevant agricultural pricing, location data is parsed and stored only at the district level. Precise coordinates are kept strictly locally in your browser storage.</p>
                  
                  <h4 className="font-bold text-[#e4e3da] mt-3">3. Service Improvement</h4>
                  <p>Fully anonymous user data and agricultural profiles may be used to calibrate agronomy models, analyze price trends, and improve overall system intelligence.</p>
                  
                  <p className="text-[10px] text-gray-500 mt-4">Last Updated: July 2026</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
