/**
 * Keyword-based auto-categorization for truck parts.
 * Parses part names/descriptions to infer the most appropriate category.
 * Categories match those used in the HGreg Trucks Parts catalog.
 */

export type PartCategory =
  | "Tires"
  | "Engine"
  | "Brake"
  | "Suspension"
  | "Electrical"
  | "Cooling"
  | "Air System"
  | "Transmission"
  | "Exhaust"
  | "Steering"
  | "Fuel System"
  | "HVAC"
  | "Lighting"
  | "Body"
  | "Cab"
  | "Axle"
  | "Drivetrain"
  | "Emissions"
  | "Lubrication"
  | "Chassis"
  | "Hardware"
  | "General";

interface CategoryRule {
  category: PartCategory;
  keywords: string[];
  priority: number; // Higher = checked first
}

// Keyword rules for categorization
// Priority determines check order — more specific categories first
const CATEGORY_RULES: CategoryRule[] = [
  // Tires (user specifically mentioned this)
  {
    category: "Tires",
    keywords: [
      "tire", "tires", "tyre", "tyres", "falken", "michelin", "bridgestone",
      "goodyear", "continental", "pirelli", "yokohama", "bfgoodrich", "cooper",
      "firestone", "general tire", "hankook", "kumho", "toyo", "uniroyal",
      "double coin", "gt radial", "laufenn", "nexen", "nitto", "sumitomo",
      "avon", "dunlop", "sailun", "triangle", "windpower", "aeolus",
      "all-position", "steer", "drive tire", "trailer tire", "lug",
      "rib", "tread", "retread", "recap", "casings", "casing",
      "inner liner", "sidewall", "bead", "rim", "wheel", "alcoa",
      "accu-shield", "radius", "all weather", "all-weather", "all season",
      "all-season", "winter tire", "snow tire", "drive axle", "trailer axle",
      "mixed service", "on/off", "on off", "regional", "long haul",
      "line haul", "urban", "smartway", "低滚阻", "otr", "off road",
      "off-road",
    ],
    priority: 100,
  },

  // Electrical
  {
    category: "Electrical",
    keywords: [
      "alternator", "starter", "battery", "solenoid", "relay", "switch",
      "sensor", "actuator", "ignition", "coil", "distributor", "capacitor",
      "resistor", "diode", "transistor", "circuit", "breaker", "fuse",
      "wiring", "harness", "connector", "plug", "terminal", "bulb",
      "led", "headlight", "taillight", "marker", "flasher", "hazard",
      "turn signal", "horn", "compressor clutch", "ecu", "ecm", "pcm",
      "control module", " Voltage", "volt ", "amp ", "amperage",
      "ground cable", "power cable", "thermostat sensor", "pressure sensor",
      "speed sensor", "position sensor", "oxygen sensor", "o2 sensor",
      "abs sensor", "wheel speed", "camshaft position", "crankshaft position",
      "map sensor", "maf sensor", "knock sensor", "coolant sensor",
      "temp sensor", "temperature sensor", "oil pressure sensor",
      "fuel level sensor", "parking sensor", "backup sensor",
      "wiper motor", "window motor", "fan motor", "blower motor",
      "fuel pump", "lift pump", "transfer pump",
    ],
    priority: 90,
  },

  // Lighting
  {
    category: "Lighting",
    keywords: [
      "light", "lamp", "lens", "reflector", "housing", "bezel",
      "headlamp", "fog light", "driving light", "work light", "cab light",
      "dome light", "map light", "step light", "clearance light",
      "side marker", "reflector", "light bar", "strobe", "beacon",
      "warning light", "emergency light", "flashlight",
    ],
    priority: 88,
  },

  // Brake
  {
    category: "Brake",
    keywords: [
      "brake", "braking", "brake pad", "brake shoe", "brake lining",
      "brake drum", "brake rotor", "brake disc", "brake chamber",
      "brake valve", "brake cam", "brake slack", "slack adjuster",
      "brake shoe kit", "brake hardware", "brake cable", "brake hose",
      "brake line", "brake fluid", "hydraulic brake", "air brake",
      "abs ", "anti-lock", "antilock", "brake booster", "master cylinder",
      "wheel cylinder", "calipe", "brake lever", "brake pedal",
      "brake switch", "brake light switch", "s-cam", "scam",
      "foundation brake", "park brake", "parking brake", "emergency brake",
      "brake accumulator", "brake compressor",
    ],
    priority: 85,
  },

  // Suspension
  {
    category: "Suspension",
    keywords: [
      "suspension", "shock", "shock absorber", "strut", "spring",
      "air spring", "air bag", "airbag", "coil spring", "leaf spring",
      "torsion", "control arm", "radius rod", "torque rod", "panhard",
      "track bar", "sway bar", "stabilizer", "bushing", "bushing kit",
      "mount", " isolator", "cushion", "pad", "bump stop", "jounce",
      "rebound", "ride height", "leveling valve", "height control",
      "cab mount", "engine mount", "transmission mount", "motor mount",
      "rubber mount", "polyurethane", "u-bolt", "u bolt", "spring pin",
      "spring hanger", "equalizer", "balancer", "axle seat",
      "trunnion", "saddle", "wear pad", "slipper",
    ],
    priority: 80,
  },

  // Steering
  {
    category: "Steering",
    keywords: [
      "steering", "steer ", "steer axle", "power steering", "steering gear",
      "steering box", "rack and pinion", "steering pump", "steering column",
      "steering shaft", "steering knuckle", "spindle", "king pin",
      "tie rod", "drag link", "pitman arm", "idler arm", "center link",
      "steering arm", "ball joint", "wheel bearing", "hub assembly",
      "hub unit", "steering cylinder", "steering valve", "orbital",
      "steering hose", "steering line", "steering fluid",
      "turn cylinder", "steer tire",
    ],
    priority: 78,
  },

  // Cooling
  {
    category: "Cooling",
    keywords: [
      "cooling", "radiator", "radiator hose", "coolant", "antifreeze",
      "water pump", "thermostat", "fan clutch", "fan blade", "fan shroud",
      "cooling fan", "electric fan", "intercooler", "charge air cooler",
      "cac", "aftercooler", "oil cooler", "transmission cooler",
      "cooler line", "heater core", "expansion tank", "overflow",
      "recovery tank", "degas bottle", "surge tank", "coolant reservoir",
      "hose clamp", "radiator cap", "pressure cap", "degas",
    ],
    priority: 75,
  },

  // HVAC
  {
    category: "HVAC",
    keywords: [
      "hvac", "a/c", "ac ", "air conditioning", "air cond", "compressor",
      "condenser", "evaporator", "expansion valve", "orifice tube",
      "receiver drier", "accumulator", "freon", "refrigerant", "r134a",
      "r-134a", "climate control", "cab heater", "defrost", "defogger",
      "vent", "ventilation", "air filter", "cabin filter", "pollen filter",
      "blower ", "blend door", "actuator door", "temperature control",
      "thermo king", "carrier", "apu ", "auxiliary power",
    ],
    priority: 73,
  },

  // Engine
  {
    category: "Engine",
    keywords: [
      "engine", "cylinder head", "head gasket", "piston", "ring set",
      "connecting rod", "crankshaft", "camshaft", "valve", "valve spring",
      "valve seal", "valve guide", "valve cover", "rocker arm",
      "push rod", "lifter", "tappet", "timing belt", "timing chain",
      "timing gear", "timing cover", "oil pan", "oil pump", "oil filter",
      "oil cooler", "oil line", "gasket set", "overhaul kit",
      "rebuild kit", "inframe kit", "out of frame", "cylinder kit",
      "liner kit", "piston kit", "rod bearing", "main bearing",
      "cam bearing", "thrust washer", "crank seal", "rear main",
      "front cover", "vibration damper", "harmonic balancer",
      "flywheel", "flexplate", "ring gear", "intake manifold",
      "exhaust manifold", "turbocharger", "turbo ", "supercharger",
      "blower ", "intercooler", "aftercooler", "egr ", "egr valve",
      "egr cooler", "block heater", "engine brake", "jake brake",
      "compression brake", "cummins", "detroit", "paccar", "cat",
      "caterpillar", "mack", "volvo", "international", "navistar",
      "isx", "isx15", "isx12", "x15", "dd13", "dd15", "dd16",
      "mp7", "mp8", "mp10", "d11", "d13", "d16", "mx11", "mx13",
      "isc", "isl", "ism", "isf", "isb", "qsb", "qsm", "ism",
      "c7", "c9", "c13", "c15", "c16", "3406", "c11", "c12",
    ],
    priority: 70,
  },

  // Transmission
  {
    category: "Transmission",
    keywords: [
      "transmission", "trans ", "gearbox", "gear box", "clutch",
      "clutch kit", "clutch disc", "clutch plate", "pressure plate",
      "throwout bearing", "release bearing", "flywheel", "input shaft",
      "output shaft", "counter shaft", "main shaft", "gear set",
      "synchronizer", "syncro", "shift fork", "slider", "transmission pump",
      "torque converter", "converter ", "planetary", "sun gear",
      "ring gear", "carrier ", "pump ", "valve body", "solenoid pack",
      "transmission filter", "transmission cooler", "pto ", "power take off",
      "power take-off", "differential", "diff ", "rear end", "carrier",
      "ring and pinion", "pinion", "spider gear", "side gear",
      "axle shaft", "wheel seal", "wheel hub", "hub cap", "bearing",
      "eaton", "fuller", "allison", "meritor", "rockwell", "dana",
      "spicer", "zf ", "detroit transmission",
    ],
    priority: 68,
  },

  // Exhaust
  {
    category: "Exhaust",
    keywords: [
      "exhaust", "muffler", "silencer", "tailpipe", "tail pipe",
      "downpipe", "down pipe", "flex pipe", "bellow", "expansion joint",
      "clamps", "hanger", "bracket", "exhaust manifold", "header",
      "turbo pipe", "charge pipe", "dpf ", "diesel particulate",
      "particulate filter", "scr ", "selective catalytic",
      "catalytic converter", "doc ", "diesel oxidation",
      "urea", "def ", "diesel exhaust fluid", "nozzle", "injector",
      "doser", "aftertreatment", "emissions", "emission",
      "egr cooler", "egr valve", "egr pipe",
    ],
    priority: 65,
  },

  // Fuel System
  {
    category: "Fuel System",
    keywords: [
      "fuel", "fuel pump", "fuel injector", "injection", "injector",
      "fuel line", "fuel hose", "fuel filter", "fuel water separator",
      "fuel heater", "fuel cooler", "fuel tank", "fuel cap",
      "fuel sender", "fuel level", "fuel rail", "common rail",
      "high pressure", "hpfp", "cp3", "cp4", " injection pump",
      "transfer pump", "lift pump", "feed pump", "primer pump",
      "hand primer", "fuel dosing", "fuel metering", "throttle body",
      "air control valve", "fuel shutoff", "solenoid",
    ],
    priority: 63,
  },

  // Air System
  {
    category: "Air System",
    keywords: [
      "air dryer", "air compressor", "air tank", "air governor",
      "air regulator", "air valve", "air hose", "air line",
      "air fitting", "air coupler", "gladhand", "glad hand",
      "quick disconnect", "quick connect", "air filter",
      "air cleaner", "air intake", "intake hose", "intake tube",
      "air box", "pre-cleaner", "dust ejector", "rain cap",
      "vacuum booster", "brake chamber", "spring brake",
      "air disc", "air drum", "air line", "pushrod", "push rod",
      "clevis", "cotter pin", "air system",
    ],
    priority: 60,
  },

  // Axle
  {
    category: "Axle",
    keywords: [
      "axle", "axle shaft", "axle seal", "axle bearing", "axle nut",
      "axle housing", "axle cover", "axle breather", "axle vent",
      "axle flange", "axle assembly", "axle beam", "axle spindle",
      "axle hitch", "axle support", "axle bumper", "axle strap",
      "drive axle", "trailer axle", "tag axle", "pusher axle",
      "lift axle", "drop axle", "steer axle",
    ],
    priority: 58,
  },

  // Drivetrain
  {
    category: "Drivetrain",
    keywords: [
      "driveshaft", "drive shaft", "prop shaft", "propeller shaft",
      "carrier bearing", "center bearing", "u-joint", "universal joint",
      "cv joint", "constant velocity", "yoke", "slip yoke",
      "end yoke", "flange yoke", "welded yoke", "tube shaft",
      "splined shaft", "drive line", "driveline",
    ],
    priority: 56,
  },

  // Body
  {
    category: "Body",
    keywords: [
      "bumper", "bumper cover", "grille", "hood", "fender",
      "fender liner", "door ", "door skin", "door handle",
      "mirror", "side mirror", "hood mirror", "mirror arm",
      "cab ", "cab assembly", "sleeper", "sleeper panel",
      "cab corner", "cab mount", "roof ", "roof cap",
      "fairing", "wind deflector", "side skirt", "tank fairing",
      "bumper filler", "step ", "step box", "tool box",
      "deck plate", "catwalk", "fifth wheel", "5th wheel",
      "kingpin", "plate ", "mud flap", "mudflap", "quarter panel",
      "rocker panel", "cowling", "bezel", "trim ", "molding",
      "chrome ", "stainless", "polished",
    ],
    priority: 55,
  },

  // Cab
  {
    category: "Cab",
    keywords: [
      "seat", "air seat", "seat base", "seat belt", "seat cover",
      "seat cushion", "seat switch", "dash ", "dashboard",
      "instrument panel", "gauge ", "gauge cluster", "speedometer",
      "tachometer", "fuel gauge", "temp gauge", "pressure gauge",
      "voltmeter", "ammeter", "hour meter", "odometer",
      "radio", "stereo", "speaker", "antenna", "bluetooth",
      "gps ", "navigation", "camera", "backup camera",
      "dash cam", "telematics", "eld ", "elog",
      "window ", "windshield", "glass ", "vent window",
      "door glass", "window seal", "window regulator",
      "window switch", "door lock", "latch", "handle",
      "interior", "floor mat", "cab mat", "insulation",
      "sound dampening", "sleeper", "bunk ", "mattress",
      "cabinet", "refrigerator", "microwave", "apu ",
      "sun visor", "storage", "cup holder", "ash tray",
    ],
    priority: 53,
  },

  // Lubrication
  {
    category: "Lubrication",
    keywords: [
      "grease", "lubricant", "lube ", "oil ", "engine oil",
      "gear oil", "transmission fluid", "hydraulic fluid",
      "power steering fluid", "brake fluid", "coolant",
      "grease gun", "grease fitting", "zerk", "grease nipple",
      "oil filter", "fuel filter", "air filter", "hydraulic filter",
      "filter kit", "breather", "vent ", "dipstick",
      "oil cap", "filler cap", "drain plug", "magnetic plug",
    ],
    priority: 50,
  },

  // Chassis
  {
    category: "Chassis",
    keywords: [
      "frame ", "frame rail", "crossmember", "cross member",
      "fishplate", "rivet ", "bolt ", "fastener", "washer",
      "nut ", "screw ", "clip ", "clamp", "bracket",
      "hanger", "mount ", "support", "strap", "tie down",
      "anchor", " pintle", "hitch", "receiver", "tow bar",
      "tow hook", "recovery", "winch", "winch mount",
      "mud flap", "mudflap", "flap hanger", "chain",
      "binder", "boomer", "ratchet", "strap", "cargo",
      "load bar", "shoring", "decking", "beam ", "trailer",
      "landing gear", "legs ", "suspension",
    ],
    priority: 45,
  },

  // Hardware
  {
    category: "Hardware",
    keywords: [
      "bolt", "nut ", "screw", "washer", "rivet", "pin ",
      "cotter pin", "clevis pin", "spring pin", "roll pin",
      "dowel pin", "hitch pin", "lynch pin", "snap ring",
      "retaining ring", "circlip", "e-clip", "c-clip",
      "clamp", "clip ", "tie wrap", "zip tie", "cable tie",
      "hose clamp", "worm gear", "t-bolt", "t bolt",
      "band clamp", "exhaust clamp", "pipe clamp",
      "u-bolt", "u bolt", "j-bolt", "eye bolt",
      "threaded rod", "stud ", "nutplate", "insert",
      "helicoil", "thread repair", "loctite", "sealant",
      "adhesive", "gasket maker", "rtv", "silicone",
      "grease fitting", "zerk fitting", "fitting",
      "coupling", "adapter", "reducer", "union",
      "tee ", "elbow", "nipple", "cap ", "plug ",
      "bushing", "spacer", "shim", "key ", "woodruff",
    ],
    priority: 40,
  },

  // Emissions
  {
    category: "Emissions",
    keywords: [
      "emission", "egr ", "dpf ", "scr ", "doc ",
      "def ", "urea", "nox sensor", "particulate",
      "catalytic", "aftertreatment", "diesel exhaust",
      "diesel emission", "clean idle", "certified",
      "epa ", "carb ", "greenhouse", "diesel oxidation",
      "selective catalytic reduction",
    ],
    priority: 35,
  },
];

/**
 * Categorize a part based on its name/description.
 * Uses keyword matching with priority ordering.
 */
export function categorizePart(description: string): PartCategory {
  if (!description) return "General";

  const text = description.toLowerCase();

  // Sort by priority (highest first)
  const sorted = [...CATEGORY_RULES].sort((a, b) => b.priority - a.priority);

  for (const rule of sorted) {
    for (const keyword of rule.keywords) {
      const kw = keyword.toLowerCase();
      // Use word boundary matching for short keywords, includes for longer ones
      if (kw.length <= 4) {
        // Short keywords: check as whole words
        const regex = new RegExp(`\\b${kw}\\b`, "i");
        if (regex.test(text)) return rule.category;
      } else {
        // Longer keywords: simple includes
        if (text.includes(kw)) return rule.category;
      }
    }
  }

  return "General";
}

/**
 * Batch categorize multiple parts at once.
 */
export function categorizeParts(
  items: { description: string; partNumber?: string }[]
): Map<number, PartCategory> {
  const results = new Map<number, PartCategory>();
  items.forEach((item, index) => {
    results.set(index, categorizePart(item.description));
  });
  return results;
}

/**
 * Get all available categories as a sorted list.
 */
export function getAllCategories(): PartCategory[] {
  const cats = new Set<PartCategory>();
  CATEGORY_RULES.forEach((r) => cats.add(r.category));
  cats.add("General");
  return Array.from(cats).sort();
}
