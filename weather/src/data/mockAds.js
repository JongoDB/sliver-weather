// Mock advertisements

export const mockAds = [
  {
    id: 1,
    title: "Premium Weather Alerts",
    description: "Get severe weather notifications delivered instantly to your phone",
    image: "https://images.unsplash.com/photo-1562155847-c05f7386b204?w=300&h=250&fit=crop",
    type: "product",
    price: "$4.99/mo",
    rating: 4.7,
    features: [
      "Real-time push notifications for severe weather in your area",
      "Customizable alert zones — set up to 10 locations",
      "NWS-sourced warnings for tornadoes, floods, hurricanes, and winter storms",
      "Lightning proximity alerts within a 15-mile radius",
      "Daily forecast briefing delivered each morning at your preferred time",
      "7-day outlook with hourly breakdowns and precipitation probability",
      "Widget support for iOS and Android home screens"
    ],
    content: `Stay one step ahead of dangerous weather with Premium Weather Alerts — the most trusted severe weather notification service used by over 2 million people nationwide.

Our system monitors the National Weather Service, Storm Prediction Center, and National Hurricane Center in real-time, delivering critical warnings directly to your phone within seconds of issuance. No more checking apps or watching TV — you'll know about severe weather before most people even look outside.

**How it works:**

Set your alert zones by dropping pins on a map or entering addresses. You can monitor up to 10 locations simultaneously — perfect for keeping tabs on your home, office, kids' school, and vacation spots. Each zone can be customized with different alert thresholds so you're not woken up at 3 AM for a frost advisory.

**Alert types include:**
- Tornado Warnings and Watches
- Severe Thunderstorm Warnings (with hail size and wind speed)
- Flash Flood Warnings and Flood Watches
- Hurricane and Tropical Storm alerts
- Winter Storm Warnings, Ice Storm Warnings, and Blizzard Warnings
- Excessive Heat and Wind Chill advisories
- Lightning proximity alerts (15-mile, 10-mile, and 5-mile thresholds)

**Daily briefing:**

Each morning, you'll receive a personalized forecast briefing that includes current conditions, the day's high and low, precipitation chances by hour, and any active watches or advisories. The briefing adapts to your schedule — set delivery for 6 AM on weekdays and 8 AM on weekends.

**What our users say:**

"Premium Weather Alerts saved my family during the April tornado outbreak. We had 12 minutes of warning before the tornado hit our neighborhood — enough time to get to our safe room." — James K., Oklahoma City

"As a farmer, I need to know about frost, hail, and heavy rain before it happens. This app pays for itself every single growing season." — Linda M., Central Iowa

Premium Weather Alerts is available on iOS and Android. Start your 14-day free trial today — no credit card required.`
  },
  {
    id: 2,
    title: "AtmosVision Pro",
    description: "Download our advanced meteorological forecasting platform",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=250&fit=crop",
    link: "/api/download/latest",
    type: "download",
    special: true
  },
  {
    id: 3,
    title: "Storm Preparation Kit",
    description: "Essential supplies for emergency weather situations",
    image: "https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?w=300&h=250&fit=crop",
    type: "product",
    price: "$89.99",
    rating: 4.8,
    features: [
      "NOAA Weather Radio with hand-crank and solar charging",
      "72-hour emergency food supply (2,400 calories/day)",
      "Water purification tablets (50-count, treats up to 25 gallons)",
      "LED flashlight with 3 modes and 200-hour battery life",
      "First aid kit with 120 medical-grade items",
      "Emergency thermal blankets (4-pack)",
      "Waterproof document bag for insurance papers and IDs"
    ],
    content: `When severe weather strikes, the difference between safety and catastrophe often comes down to preparation. The Storm Preparation Kit is a comprehensive, grab-and-go emergency supply package designed by FEMA-certified emergency managers to keep a family of four safe for 72 hours.

Every component has been tested in real disaster scenarios and selected for reliability, shelf life, and ease of use under stress. The kit ships in a durable, water-resistant backpack that's ready to go at a moment's notice.

**What's inside:**

**Communication & Power**
The centerpiece is a NOAA All-Hazards Weather Radio with S.A.M.E. technology, which automatically filters alerts to your specific county. The radio features hand-crank dynamo charging, a solar panel, USB output for charging devices, and a built-in LED flashlight. Even if the power grid and cell towers are down, you'll have access to emergency broadcasts.

**Food & Water**
The kit includes a 72-hour emergency food supply providing 2,400 calories per day — enough for one adult or to supplement a family's existing supplies. Meals are lightweight, require no cooking, and have a 25-year shelf life. Water purification tablets can treat up to 25 gallons of water from any freshwater source.

**Medical**
A 120-piece first aid kit covers everything from minor cuts to more serious injuries. Contents include adhesive bandages, gauze rolls, antiseptic wipes, burn cream, medical tape, scissors, tweezers, an instant cold pack, and a CPR face shield. A laminated quick-reference card guides untrained users through common emergency medical procedures.

**Protection**
Four emergency thermal blankets retain up to 90% of body heat and can also serve as ground covers, rain ponchos, or signal reflectors. Each blanket is compact enough to fit in a pocket but opens to a full 52" x 82".

**Documents**
A waterproof document bag protects insurance policies, identification, medical records, and other critical papers from water damage. A checklist card inside reminds you which documents to include.

**Who it's for:**

Whether you live in Tornado Alley, along the hurricane coast, in wildfire country, or in a region prone to winter storms, every household should have basic emergency supplies ready. FEMA recommends that all Americans maintain a minimum 72-hour supply kit — this kit meets and exceeds those guidelines.

Ships within 2 business days. 30-day satisfaction guarantee.`
  },
  {
    id: 4,
    title: "Home Weather Station",
    description: "Professional-grade equipment for accurate local readings",
    image: "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=300&h=250&fit=crop",
    type: "product",
    price: "$249.99",
    rating: 4.6,
    features: [
      "Indoor/outdoor temperature and humidity sensors",
      "Wind speed and direction with ultrasonic anemometer",
      "Rain gauge with 0.01-inch resolution",
      "Barometric pressure with trend indicator and storm alert",
      "UV index and solar radiation sensor",
      "Wi-Fi connected with free cloud dashboard and API access",
      "Compatible with Weather Underground and Ambient Weather Network"
    ],
    content: `Take weather observation into your own hands with the Home Weather Station — a professional-grade personal weather system that delivers hyper-local data you won't find on any forecast app. While official weather stations may be miles from your location, your Home Weather Station measures conditions right where you live.

**Why local data matters:**

Official weather stations are typically located at airports, which can be miles from your home and at different elevations. Temperature, wind, and rainfall can vary dramatically over short distances — especially in hilly terrain, near bodies of water, or in urban heat islands. Your personal station captures the microclimate that actually affects your daily life.

**Sensor suite:**

**Temperature & Humidity:** Dual indoor/outdoor sensors update every 10 seconds with ±0.2°F accuracy. The outdoor sensor is housed in a radiation shield to prevent solar heating bias — a common problem with cheaper stations.

**Wind:** An ultrasonic anemometer measures wind speed (0–100 mph) and direction with no moving parts. Unlike traditional cup-and-vane systems, ultrasonic sensors have no bearings to wear out and work reliably in freezing rain and ice — conditions where mechanical sensors often fail.

**Rain:** A self-emptying tipping-bucket rain gauge measures precipitation to 0.01-inch resolution. Daily, weekly, monthly, and yearly totals are tracked automatically. A built-in heater prevents freezing in cold climates, enabling accurate measurement of snow water equivalent.

**Pressure:** A high-precision barometric pressure sensor tracks atmospheric pressure trends and alerts you to rapid drops that often precede storms. The 24-hour pressure graph is one of the most reliable short-term forecasting tools available.

**UV & Solar:** A dedicated UV index sensor and pyranometer measure ultraviolet radiation and total solar energy. Know when UV levels are dangerously high and track solar radiation for gardening, solar panel optimization, or health awareness.

**Connectivity:**

The station connects to your home Wi-Fi network and uploads data to a free cloud dashboard accessible from any browser or smartphone. View current conditions, historical data, charts, and trends from anywhere in the world.

An open API lets you integrate your station's data with home automation systems, custom dashboards, or agricultural management software. Share your data with Weather Underground or the Ambient Weather Network to contribute to community weather monitoring.

**Installation:**

The outdoor sensor array mounts on any standard 1-inch pole or mast (included). The indoor console displays all readings on a color LCD and connects to Wi-Fi during initial setup. Most users complete installation in under 30 minutes.

Includes 2-year warranty and free firmware updates. Sensor accuracy is NIST-traceable.`
  }
];
