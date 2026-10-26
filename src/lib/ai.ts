// AI Helper service supporting real API calls or local high-fidelity predictive modeling.

export interface AIServiceResponse {
  success: boolean;
  content: string;
  data?: any;
}

// Generate context-aware prompts or local predictions based on input
export async function getAICopilotResponse(page: string, customQuery?: string): Promise<AIServiceResponse> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (GEMINI_API_KEY) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert enterprise construction AI assistant playing the role for the page: "${page}". 
              The user asks: "${customQuery || 'Give me the latest dashboard overview updates'}".
              Provide direct, sharp, professional enterprise construction recommendations in markdown. 
              Mention metrics, risk mitigation, resource optimization, and action items.`
            }]
          }]
        })
      });
      const resData = await response.json();
      const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return { success: true, content: text };
      }
    } catch (e) {
      console.error("Gemini API error, falling back to simulator:", e);
    }
  }

  // Fallback high-fidelity construction simulation engine
  return new Promise((resolve) => {
    setTimeout(() => {
      let responseText = '';
      if (page.includes('dashboard')) {
        responseText = `### EHS & Operations Executive Alert:
* **Tower A Alignment**: Structure matches design parameters by **99.8%** based on this morning's drone LIDAR scan.
* **Supply Chain Alert**: Ready-Mix Concrete M40 is critically low (**65 m³**). Suggested action: dispatch supplier order \`po-102\` immediately to avoid a 48-hour slab framing bottleneck.
* **Risk Heatmap**: Excavation segment 2 shows moderate water accumulation after yesterday's thunder showers. Recommend initiating drainage pump sub-routines.`;
      } else if (page.includes('materials')) {
        responseText = `### Materials & Supply Chain Intelligence:
* **Steel Procurement**: Fe550 steel rebars are adequate but waste ratios on Floor 12 are pacing at **4.8%** (target: <3.0%). Recommend checking rebar bending machine offsets.
* **Cost Saving Opportunity**: Spot market prices for Portland Cement show a **4.2% dip** this week. Recommend bulk-buying 1,500 bags to unlock a projected **$9,300 discount**.
* **Concrete Deficit**: Urgent. Delivery ` + '`po-102` (250 m³)' + ` is still pending. Estimated arrival is 3 hours. Monitor truck telemetry.`;
      } else if (page.includes('workers')) {
        responseText = `### HR Workforce Analytics:
* **Productivity Drift**: Worksite attendance rate is at **93%**. Formwork teams are running 4 men short.
* **Training Gaps**: Identifying 3 ironworkers lacking active Scaffold Safety training certificates. Recommend blocking gate access until they complete the 15-minute digital briefing.
* **Biometric Drift**: Biometrics confidence average is **97.8%**. CCTV feed resolved Arjun Das check-in at 08:04 with 96.2% confidence.`;
      } else if (page.includes('equipment')) {
        responseText = `### Machinery Telematics Diagnostics:
* **Excavator CAT 320 Alert**: IoT sensor node \`EX-320-HYD\` reports hydraulic temperature spikes under load. High breakdown probability of **58.5%** within next 48 operating hours. Action: schedule maintenance immediately.
* **Crane Utilization**: Tower Crane 1 was active for **8.2 hours** yesterday, but experienced **1.8 hours** of high wind standby. Fuel consumption remains at 16.5 L/hr.
* **Idle Mitigation**: Concrete mixer is idling 22% longer than target. Recommend configuring auto-shutdown parameters.`;
      } else if (page.includes('budget')) {
        responseText = `### Corporate Financial Intelligence:
* **Steel Cost Variance**: Rebar overrun has triggered a **+$820,000 variance** (+1.8% of global project budget).
* **Profitability Runway**: Cash flow remains positive with **$16.5M cash on hand**. Recommending invoice adjustments to lock in subcontractors early.
* **Expense Forecasting**: August is forecasted to require **$5.2M in outlays**. Retain 10% contingency reserves due to monsoon weather delay factors.`;
      } else if (page.includes('3d-twin')) {
        responseText = `### BIM Structural Audit:
* **Clash Detections**: 3D Digital Twin shows a resolved clash between Floor 12 fire sprinklers and structural steel girders. Re-routed via revised CAD layout.
* **Green Building Index**: Helios Tower A scoring **84/110 LEED points**. Installing low-emissivity glass on south facade can push score to **87 points** and reduce annual cooling bills by **$22,000**.
* **Ventilation/HVAC**: Core duct pressure normal. Space optimization audit suggests re-orienting partition walls on Floor 10 to increase natural air drafts by **14%**.`;
      } else if (page.includes('safety')) {
        responseText = `### Safety & Compliance Dashboard:
* **PPE Alerts**: Smart camera feed detected Arjun Das climbing scaffolding without his hardhat. Alarm dispatched; resolved in 2 mins.
* **Exclusion Zone Watch**: Excavation perimeter breach detected by AI cameras. Horn sounded. Site layout updated to expand physical fencing by 5 meters.
* **Hazard index**: Global safety risk score is **88/100 (Excellent)**. Maintain daily safety standdowns.`;
      } else if (page.includes('analytics')) {
        responseText = `### Operations Data Science Report:
* **Predictive Deflections**: Time-series forecast on crane sensors shows zero structural drift.
* **Monsoon Delay Risk**: Machine learning model projects a **78% probability of a 4-day weather delay** in mid-August. Suggested mitigation: accelerate concrete pours on exterior slabs by 3 days.
* **Executive Summary**: Overall platform health is **Risk (Amber)** due strictly to supply chain concrete deficits. Personnel and machinery performance remain exceptional.`;
      } else {
        responseText = `### Global AI Assistant Context:
Ready to process global construction data queries. Enter custom commands like: "Calculate rebar needs" or "Audit safety logs".`;
      }
      resolve({ success: true, content: responseText });
    }, 400);
  });
}

// AI Image Analysis simulation
export async function analyzeSiteImage(imageUrl: string, category: 'Site' | 'Safety' | 'Progress'): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (category === 'Safety') {
        resolve({
          reportTitle: 'AI HSE Safety Scan Report',
          timestamp: new Date().toLocaleString(),
          overallStatus: 'VIOLATION DETECTED',
          score: 65,
          detections: [
            { label: 'Missing Helmet', box: [15, 30, 25, 45], confidence: 0.94, worker: 'Arjun Das', severity: 'High' },
            { label: 'Correct Scaffold Harness', box: [40, 20, 80, 70], confidence: 0.98, worker: 'Arjun Das', severity: 'Low' },
            { label: 'Exclusion Zone Breach', box: [60, 50, 95, 90], confidence: 0.88, worker: 'Visitor', severity: 'Medium' }
          ],
          recommendation: 'Sound site horn for exclusion zone breach. Dispatch SMS warning to foreman regarding Scaffold Floor 12 PPE compliance.'
        });
      } else {
        resolve({
          reportTitle: 'AI Structural Integrity & Progress Report',
          timestamp: new Date().toLocaleString(),
          overallStatus: 'WARNING',
          score: 82,
          detections: [
            { label: 'Completed Column Pour', box: [10, 10, 90, 40], confidence: 0.99, status: 'Verified' },
            { label: 'Concrete Micro-crack', box: [45, 12, 52, 18], confidence: 0.91, status: 'Attention Required', severity: 'Medium' },
            { label: 'Exposed Rebar End', box: [5, 60, 15, 75], confidence: 0.86, status: 'Safety Hazard', severity: 'Medium' }
          ],
          recommendation: 'Epoxy inject micro-crack in Column B-12 within 72 hours to prevent core moisture ingress. Cap exposed rebar steel ends.'
        });
      }
    }, 800);
  });
}

// AI Document Analysis simulation
export async function analyzeSiteDocument(fileName: string, fileContentText?: string): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        fileName,
        fileType: fileName.split('.').pop()?.toUpperCase() || 'PDF',
        status: 'Extracted successfully',
        timestamp: new Date().toLocaleString(),
        metadata: {
          extractedRooms: 42,
          totalSlabArea: '14,250 Sq Ft',
          estimatedConcreteVolume: '480 Cubic Meters',
          estimatedSteelWeight: '78.5 Tons',
          plannedBudget: '$1,250,000',
          timelineDuration: '120 Working Days'
        },
        structuralDetails: [
          { item: 'Columns', specification: 'Fe550 Rebar reinforced, 450x450mm dimensions', qty: '48 units' },
          { item: 'Slabs', specification: 'Post-tensioned concrete, 200mm thickness', qty: '4 floors' },
          { item: 'Beams', specification: 'Primary structural steel I-Beams, ASTM A992 Grade', qty: '96 units' }
        ],
        budgetBreakdown: [
          { category: 'Structural Concrete', cost: '$420,000' },
          { category: 'Steel Framing', cost: '$480,000' },
          { category: 'Labor Force Allocation', cost: '$250,000' },
          { category: 'Contingency Margin (8%)', cost: '$100,000' }
        ]
      });
    }, 1000);
  });
}
