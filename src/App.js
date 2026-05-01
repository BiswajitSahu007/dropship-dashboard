import { useState, useEffect, useRef } from "react";

const AGENTS = [
  {
    id: "sourcer",
    name: "Product Sourcer",
    icon: "🔍",
    role: "Scans AliExpress, Meesho, Temu & IndiaMart for high-margin products",
    color: "#00E5FF",
    status: "active",
  },
  {
    id: "pricer",
    name: "Price Optimizer",
    icon: "📊",
    role: "Monitors competitor prices and sets optimal sell price for max margin",
    color: "#ADFF2F",
    status: "active",
  },
  {
    id: "lister",
    name: "Listing Creator",
    icon: "✍️",
    role: "Auto-generates SEO titles, descriptions & images for Amazon & Flipkart",
    color: "#FF6B6B",
    status: "idle",
  },
  {
    id: "order",
    name: "Order Manager",
    icon: "📦",
    role: "Receives orders, auto-places on supplier, tracks shipment & updates customer",
    color: "#FFD700",
    status: "active",
  },
  {
    id: "returns",
    name: "Returns Handler",
    icon: "🔄",
    role: "Processes refunds, handles disputes and claims on your behalf",
    color: "#DA70D6",
    status: "idle",
  },
  {
    id: "analytics",
    name: "Profit Tracker",
    icon: "💰",
    role: "Tracks every sale, margin, supplier cost and net profit in real-time",
    color: "#00FF9D",
    status: "active",
  },
];

const PRODUCTS = [
  { id: 1, name: "Wireless Earbuds Pro", buy: 320, sell: 1299, platform: "Amazon", margin: 75, stock: 42, orders: 17 },
  { id: 2, name: "Portable LED Ring Light", buy: 180, sell: 799, platform: "Flipkart", margin: 77, stock: 88, orders: 34 },
  { id: 3, name: "Silicone Phone Stand", buy: 45, sell: 249, platform: "Amazon", margin: 82, stock: 210, orders: 76 },
  { id: 4, name: "USB-C Fast Charger", buy: 120, sell: 549, platform: "Meesho", margin: 78, stock: 65, orders: 22 },
  { id: 5, name: "Stainless Steel Bottle", buy: 95, sell: 499, platform: "Flipkart", margin: 81, stock: 130, orders: 58 },
];

const LOGS = [
  { time: "10:42 AM", agent: "Product Sourcer", msg: "Found 3 new trending products on AliExpress with >75% margin", type: "success" },
  { time: "10:38 AM", agent: "Order Manager", msg: "Auto-placed order #AM-2847 on supplier for ₹320. Amazon payout: ₹1299", type: "success" },
  { time: "10:31 AM", agent: "Price Optimizer", msg: "Lowered 'Ring Light' by ₹50 to beat top 3 competitors on Flipkart", type: "info" },
  { time: "10:22 AM", agent: "Listing Creator", msg: "Published 2 new listings on Amazon with optimized keywords", type: "success" },
  { time: "10:15 AM", agent: "Profit Tracker", msg: "Today's profit: ₹4,820 from 7 orders. Best margin: Silicone Stand 82%", type: "success" },
  { time: "09:58 AM", agent: "Returns Handler", msg: "Processed refund for order #FK-1193. Dispute resolved in your favor.", type: "warning" },
];

const PLATFORMS = ["Amazon", "Flipkart", "Meesho", "JioMart"];
const SOURCES = ["AliExpress", "Temu", "Meesho", "IndiaMart", "1688.com"];

function AnimatedNumber({ value, prefix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{display.toLocaleString("en-IN")}</span>;
}

function AgentCard({ agent, onClick, selected }) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    if (agent.status === "active") {
      const t = setInterval(() => setPulse(p => !p), 1800 + Math.random() * 1000);
      return () => clearInterval(t);
    }
  }, [agent.status]);

  return (
    <div
      onClick={() => onClick(agent)}
      style={{
        background: selected ? `${agent.color}18` : "#0d1117",
        border: `1.5px solid ${selected ? agent.color : "#1e2a3a"}`,
        borderRadius: 14,
        padding: "18px 16px",
        cursor: "pointer",
        transition: "all 0.25s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 24 }}>{agent.icon}</span>
        <div>
          <div style={{ fontWeight: 700, color: "#f0f6ff", fontSize: 13 }}>{agent.name}</div>
          <div style={{
            fontSize: 10, fontWeight: 600, letterSpacing: 1,
            color: agent.status === "active" ? "#00ff9d" : "#888",
            textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 4
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: agent.status === "active" ? "#00ff9d" : "#555",
              display: "inline-block",
              boxShadow: pulse && agent.status === "active" ? `0 0 8px #00ff9d` : "none",
              transition: "box-shadow 0.4s"
            }} />
            {agent.status}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#8892a4", lineHeight: 1.5 }}>{agent.role}</div>
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 3, height: "100%",
        background: agent.color,
        opacity: selected ? 1 : 0.3,
        borderRadius: "0 14px 14px 0"
      }} />
    </div>
  );
}

function AgentChat({ agent }) {
  const [messages, setMessages] = useState([
    { role: "agent", text: `Hi! I'm your ${agent.name}. I'm currently ${agent.status === "active" ? "actively working" : "on standby"}. Ask me anything or give me a task!` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const systemPrompt = `You are "${agent.name}", an autonomous AI agent for a dropshipping business. Your role: ${agent.role}. 
You help the business owner manage their dropshipping operations between cheap sourcing sites (AliExpress, Temu, Meesho, IndiaMart) and selling platforms (Amazon India, Flipkart, Meesho, JioMart).
Be concise, actionable, and specific. Use ₹ for prices. Give real steps, product ideas, margin calculations, and strategies. Sound like an expert business AI agent.
Keep replies under 120 words. Be direct and practical.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            ...messages.filter(m => m.role !== "agent" || messages.indexOf(m) > 0).map(m => ({
              role: m.role === "agent" ? "assistant" : "user",
              content: m.text
            })),
            { role: "user", content: userMsg }
          ]
        })
      });
      const data = await res.json();
      const reply = data.content?.map(c => c.text || "").join("") || "I'm processing your request...";
      setMessages(m => [...m, { role: "agent", text: reply }]);
    } catch {
      setMessages(m => [...m, { role: "agent", text: "Connection issue. Please retry." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 12, borderBottom: "1px solid #1e2a3a" }}>
        <span style={{ fontSize: 28 }}>{agent.icon}</span>
        <div>
          <div style={{ fontWeight: 800, color: "#f0f6ff", fontSize: 15 }}>{agent.name}</div>
          <div style={{ fontSize: 11, color: agent.color }}>{agent.role.slice(0, 60)}...</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start"
          }}>
            <div style={{
              maxWidth: "80%",
              background: m.role === "user" ? `${agent.color}22` : "#131c27",
              border: `1px solid ${m.role === "user" ? agent.color + "55" : "#1e2a3a"}`,
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              padding: "10px 14px",
              fontSize: 12.5,
              color: "#d4e4f7",
              lineHeight: 1.6
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 4, padding: "10px 14px" }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: "50%", background: agent.color,
                animation: `bounce 0.9s ${i * 0.2}s infinite`
              }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder={`Ask ${agent.name}...`}
          style={{
            flex: 1, background: "#0d1117", border: `1px solid ${agent.color}44`,
            borderRadius: 10, padding: "10px 14px", color: "#f0f6ff",
            fontSize: 13, outline: "none",
          }}
        />
        <button onClick={sendMessage} style={{
          background: agent.color, border: "none", borderRadius: 10,
          width: 42, cursor: "pointer", fontSize: 16,
          color: "#000", fontWeight: 700
        }}>→</button>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentStatuses, setAgentStatuses] = useState(
    Object.fromEntries(AGENTS.map(a => [a.id, a.status]))
  );

  const toggleAgent = (id) => {
    setAgentStatuses(s => ({ ...s, [id]: s[id] === "active" ? "idle" : "active" }));
  };

  const stats = [
    { label: "Today's Revenue", value: 14820, prefix: "₹", color: "#00FF9D" },
    { label: "Today's Profit", value: 9240, prefix: "₹", color: "#ADFF2F" },
    { label: "Active Listings", value: 47, prefix: "", color: "#00E5FF" },
    { label: "Orders Today", value: 23, prefix: "", color: "#FFD700" },
  ];

  const TABS = ["dashboard", "agents", "products", "logs"];

  return (
    <div style={{
      minHeight: "100vh", background: "#060d18",
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      color: "#c9d8ea",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Space+Grotesk:wght@400;600;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0d1117; } ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 4px; }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
      `}</style>

      {/* Header */}
      <div style={{
        background: "#080f1a", borderBottom: "1px solid #1e2a3a",
        padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #00E5FF, #00FF9D)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900, color: "#000"
          }}>D</div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 16, color: "#f0f6ff" }}>DropShip AI</div>
            <div style={{ fontSize: 10, color: "#4a6580", letterSpacing: 1.5, textTransform: "uppercase" }}>Autonomous Agent Platform</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {AGENTS.filter(a => agentStatuses[a.id] === "active").length} / {AGENTS.length}
          <span style={{ color: "#00ff9d", fontSize: 11 }}> agents active</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, background: "#080f1a", borderBottom: "1px solid #1e2a3a", padding: "0 24px" }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setSelectedAgent(null); }} style={{
            background: "none", border: "none", padding: "12px 20px",
            cursor: "pointer", fontSize: 12, fontWeight: 600,
            color: activeTab === tab ? "#00E5FF" : "#4a6580",
            borderBottom: activeTab === tab ? "2px solid #00E5FF" : "2px solid transparent",
            textTransform: "capitalize", letterSpacing: 0.5,
            fontFamily: "inherit", transition: "all 0.2s"
          }}>{tab}</button>
        ))}
      </div>

      <div style={{ padding: "20px 24px", maxWidth: 1100, margin: "0 auto" }}>

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
              {stats.map((s, i) => (
                <div key={i} style={{
                  background: "#0d1117", border: "1px solid #1e2a3a",
                  borderRadius: 14, padding: "18px 20px",
                  borderTop: `3px solid ${s.color}`
                }}>
                  <div style={{ fontSize: 10, color: "#4a6580", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                    <AnimatedNumber value={s.value} prefix={s.prefix} />
                  </div>
                </div>
              ))}
            </div>

            {/* How It Works */}
            <div style={{ background: "#0d1117", border: "1px solid #1e2a3a", borderRadius: 14, padding: 20, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, color: "#f0f6ff", marginBottom: 14, fontSize: 13 }}>🤖 How Your AI Agents Work (CARE Framework)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                {[
                  { step: "C — Collect", desc: "Sourcer Agent scans AliExpress, Temu & Meesho every hour for trending products with >70% potential margin", color: "#00E5FF" },
                  { step: "A — Analyze", desc: "Price Optimizer compares 50+ competitors on Amazon & Flipkart and computes your sweet-spot sell price", color: "#ADFF2F" },
                  { step: "R — React", desc: "Listing Creator auto-publishes SEO-optimized product pages. Order Manager auto-fulfills every sale instantly", color: "#FF6B6B" },
                  { step: "E — Evaluate", desc: "Profit Tracker logs every ₹ in and out. Returns Handler resolves disputes. Full autopilot 24/7", color: "#00FF9D" },
                ].map((c, i) => (
                  <div key={i} style={{
                    background: "#060d18", borderRadius: 10, padding: 14,
                    borderLeft: `3px solid ${c.color}`
                  }}>
                    <div style={{ fontWeight: 700, color: c.color, fontSize: 12, marginBottom: 5 }}>{c.step}</div>
                    <div style={{ fontSize: 11.5, color: "#8892a4", lineHeight: 1.6 }}>{c.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Flow Diagram */}
            <div style={{ background: "#0d1117", border: "1px solid #1e2a3a", borderRadius: 14, padding: 20 }}>
              <div style={{ fontWeight: 700, color: "#f0f6ff", marginBottom: 16, fontSize: 13 }}>⚡ Automated Flow</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                {[
                  { label: "AliExpress\nTemu\nMeesho", icon: "🛒", color: "#00E5FF" },
                  { label: "→", icon: "", color: "#333" },
                  { label: "AI Sourcer\n+ Pricer", icon: "🤖", color: "#ADFF2F" },
                  { label: "→", icon: "", color: "#333" },
                  { label: "Amazon\nFlipkart\nMeesho", icon: "🏪", color: "#FF6B6B" },
                  { label: "→", icon: "", color: "#333" },
                  { label: "Order\nFulfilled", icon: "📦", color: "#FFD700" },
                  { label: "→", icon: "", color: "#333" },
                  { label: "₹ Profit\nTo You", icon: "💰", color: "#00FF9D" },
                ].map((f, i) => f.label === "→" ? (
                  <div key={i} style={{ color: "#334", fontSize: 20 }}>→</div>
                ) : (
                  <div key={i} style={{
                    background: "#060d18", border: `1px solid ${f.color}44`,
                    borderRadius: 10, padding: "12px 16px", textAlign: "center", minWidth: 80
                  }}>
                    <div style={{ fontSize: 20 }}>{f.icon}</div>
                    <div style={{ fontSize: 10, color: f.color, lineHeight: 1.6, marginTop: 4, whiteSpace: "pre" }}>{f.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AGENTS TAB */}
        {activeTab === "agents" && (
          <div style={{ display: "grid", gridTemplateColumns: selectedAgent ? "1fr 1fr" : "repeat(3,1fr)", gap: 16, animation: "fadeUp 0.4s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: selectedAgent ? "1fr" : "repeat(3,1fr)", gap: 12, gridColumn: selectedAgent ? "1" : "1/-1" }}>
              {AGENTS.map(agent => (
                <AgentCard
                  key={agent.id}
                  agent={{ ...agent, status: agentStatuses[agent.id] }}
                  onClick={a => setSelectedAgent(prev => prev?.id === a.id ? null : a)}
                  selected={selectedAgent?.id === agent.id}
                />
              ))}
            </div>
            {selectedAgent && (
              <div style={{
                background: "#0d1117", border: "1px solid #1e2a3a",
                borderRadius: 14, padding: 20, height: 520, display: "flex", flexDirection: "column"
              }}>
                <AgentChat agent={selectedAgent} />
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: "#f0f6ff" }}>Active Products</div>
              <button style={{
                background: "linear-gradient(90deg, #00E5FF, #00FF9D)",
                border: "none", borderRadius: 8, padding: "8px 16px",
                fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#000"
              }}>+ Add Product</button>
            </div>
            <div style={{ background: "#0d1117", border: "1px solid #1e2a3a", borderRadius: 14, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#080f1a" }}>
                    {["Product", "Buy Price", "Sell Price", "Margin", "Platform", "Stock", "Orders"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", fontSize: 10, color: "#4a6580", textAlign: "left", textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PRODUCTS.map((p, i) => (
                    <tr key={p.id} style={{ borderTop: "1px solid #1e2a3a", background: i % 2 ? "#0a1220" : "transparent" }}>
                      <td style={{ padding: "14px 16px", color: "#f0f6ff", fontWeight: 600, fontSize: 13 }}>{p.name}</td>
                      <td style={{ padding: "14px 16px", color: "#FF6B6B", fontSize: 13 }}>₹{p.buy}</td>
                      <td style={{ padding: "14px 16px", color: "#00FF9D", fontSize: 13 }}>₹{p.sell}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          background: "#00FF9D22", color: "#00FF9D",
                          padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700
                        }}>{p.margin}%</span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          background: "#00E5FF22", color: "#00E5FF",
                          padding: "3px 8px", borderRadius: 6, fontSize: 11
                        }}>{p.platform}</span>
                      </td>
                      <td style={{ padding: "14px 16px", color: "#8892a4", fontSize: 13 }}>{p.stock}</td>
                      <td style={{ padding: "14px 16px", color: "#FFD700", fontSize: 13 }}>{p.orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LOGS TAB */}
        {activeTab === "logs" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ fontWeight: 700, color: "#f0f6ff", marginBottom: 14 }}>Agent Activity Log</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {LOGS.map((log, i) => (
                <div key={i} style={{
                  background: "#0d1117", border: "1px solid #1e2a3a",
                  borderRadius: 10, padding: "12px 16px",
                  display: "flex", alignItems: "flex-start", gap: 14,
                  borderLeft: `3px solid ${log.type === "success" ? "#00FF9D" : log.type === "warning" ? "#FFD700" : "#00E5FF"}`
                }}>
                  <div style={{ fontSize: 10, color: "#4a6580", minWidth: 65 }}>{log.time}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#8892a4", marginBottom: 3 }}>{log.agent}</div>
                    <div style={{ fontSize: 12.5, color: "#c9d8ea" }}>{log.msg}</div>
                  </div>
                  <div style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 4,
                    background: log.type === "success" ? "#00FF9D22" : log.type === "warning" ? "#FFD70022" : "#00E5FF22",
                    color: log.type === "success" ? "#00FF9D" : log.type === "warning" ? "#FFD700" : "#00E5FF",
                    textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700
                  }}>{log.type}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
