"use client";

import React, { useMemo } from "react";
import {
  Users,
  Eye,
  Heart,
  BarChart2,
  Send,
  Activity,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Building2,
  Share2,
  MessageCircle,
  Mail,
  AtSign,
  Star,
  Plus,
  Image,
  Inbox,
  ChevronRight,
  Zap,
  Target,
  CheckSquare,
  AlertCircle,
  FolderArchive,
} from "lucide-react";

// ─── tiny inline sparkline SVG helper ──────────────────────────────────────
function Sparkline({ data = [], color = "#4f46e5" }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 80;
  const h = 32;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Audience Growth mini bar chart ────────────────────────────────────────
function AudienceGrowthChart() {
  const labels = ["Sep 19","Sep 22","Sep 25","Sep 28","Oct 01","Oct 04","Oct 07","Oct 10","Oct 13","Oct 16","Oct 19"];
  const instagram = [120,135,128,150,165,158,172,180,168,185,195];
  const facebook  = [80,88,95,90,102,110,108,115,120,118,125];
  const linkedin  = [40,45,42,50,55,52,58,62,60,65,70];
  const maxVal = Math.max(...instagram,...facebook,...linkedin,1);
  const chartH = 140;
  return (
    <div style={{ overflowX:"auto" }}>
      <div style={{ display:"flex",alignItems:"flex-end",gap:6,minWidth:520,height:chartH+28 }}>
        {labels.map((label,i) => (
          <div key={i} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2 }}>
            <div style={{ display:"flex",alignItems:"flex-end",gap:2,height:chartH }}>
              <div style={{ width:10,background:"linear-gradient(180deg,#e879f9,#a855f7)",borderRadius:"3px 3px 0 0",height:`${(instagram[i]/maxVal)*chartH}px`,transition:"height 0.4s" }} />
              <div style={{ width:10,background:"linear-gradient(180deg,#60a5fa,#3b82f6)",borderRadius:"3px 3px 0 0",height:`${(facebook[i]/maxVal)*chartH}px`,transition:"height 0.4s" }} />
              <div style={{ width:10,background:"linear-gradient(180deg,#34d399,#10b981)",borderRadius:"3px 3px 0 0",height:`${(linkedin[i]/maxVal)*chartH}px`,transition:"height 0.4s" }} />
            </div>
            <span style={{ fontSize:"0.62rem",color:"#94a3b8",whiteSpace:"nowrap" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Platform colour dot ────────────────────────────────────────────────────
function PlatformDot({ platform }) {
  const map = {
    instagram:{ color:"#db2777",label:"IG" },
    facebook:{ color:"#2563eb",label:"FB" },
    linkedin:{ color:"#0284c7",label:"LI" },
    youtube:{ color:"#dc2626",label:"YT" },
    x:{ color:"#0f172a",label:"X" },
    twitter:{ color:"#0f172a",label:"X" },
    google_business:{ color:"#059669",label:"GB" },
    whatsapp:{ color:"#16a34a",label:"WA" },
  };
  const cfg = map[platform?.toLowerCase()] || { color:"#64748b",label:"?" };
  return (
    <span style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",width:22,height:22,borderRadius:6,background:cfg.color+"22",color:cfg.color,fontSize:"0.62rem",fontWeight:800 }}>
      {cfg.label}
    </span>
  );
}

export default function FullOverviewDashboardTab({
  dashboardData,
  clients = [],
  onNavigateTab,
  posts = [],
  campaigns = [],
  inboxMessages = [],
}) {
  const overview       = dashboardData?.overview       || {};
  const statusCounts   = dashboardData?.status_counts  || {};
  const clientsSummary = dashboardData?.clients_summary || [];
  const platforms      = dashboardData?.platforms      || [];
  const recentPosts    = dashboardData?.recent_posts   || posts.slice(0,6) || [];

  // KPI values
  const totalFollowers    = overview.total_followers   || 149610;
  const totalReach        = overview.total_reach       || 261698;
  const engagementRate    = overview.engagement_rate   || 5.87;
  const totalImpressions  = overview.total_impressions || 482340;
  const postsPublished    = statusCounts.published     || 186;

  // pipeline
  const pipeline = {
    idea:      statusCounts.idea             || 12,
    draft:     statusCounts.draft            || 8,
    review:    (statusCounts.internal_review || 0) + (statusCounts.team_review || 5),
    approved:  statusCounts.approved         || 4,
    scheduled: statusCounts.scheduled        || 154,
  };

  // approval queue
  const approvalQueue = useMemo(() => {
    const pending = recentPosts.filter(p => p.status==="client_review"||p.status==="internal_review").slice(0,5);
    if (pending.length>0) return pending;
    return [
      { id:1,client_name:"Adstra Digital",   title:"Product Launch Post",  due:"2h" },
      { id:2,client_name:"Kotak M",           title:"Festival Campaign",    due:"5h" },
      { id:3,client_name:"Vorion Nexus",      title:"Reel Video",           due:"5h" },
      { id:4,client_name:"Kitchen & Home",    title:"Product Image",        due:"1d" },
      { id:5,client_name:"LIORAA LONDON LTD", title:"Carousel Post",        due:"1d" },
    ];
  }, [recentPosts]);

  // upcoming posts
  const upcomingPosts = useMemo(() => {
    const scheduled = recentPosts.filter(p => p.status==="scheduled").slice(0,4);
    if (scheduled.length>0) return scheduled;
    return [
      { id:1,time:"10:00 AM",platform:"instagram",title:"Product Launch Post",  client_name:"Adstra Digital", status:"scheduled" },
      { id:2,time:"12:30 PM",platform:"facebook", title:"Brand Awareness",       client_name:"Vorion Nexus",   status:"scheduled" },
      { id:3,time:"03:00 PM",platform:"linkedin", title:"Industry Update",        client_name:"Kotak M",        status:"pending_approval" },
      { id:4,time:"08:30 PM",platform:"instagram",title:"Festive Offer",          client_name:"Kitchen & Home", status:"scheduled" },
    ];
  }, [recentPosts]);

  // active campaigns
  const activeCampaigns = useMemo(() => {
    if (campaigns.length>0) return campaigns.slice(0,4);
    return [
      { id:1,title:"Brand Awareness Campaign",  client_name:"Vorion Nexus",   status:"running",   reach:"52.7K",change:"+13%" },
      { id:2,title:"Product Launch Campaign",   client_name:"Adstra Digital", status:"running",   reach:"41.2K",change:"+8%"  },
      { id:3,title:"Festival Campaign",         client_name:"Kotak M",        status:"scheduled", reach:"28.6K",change:"+5%"  },
      { id:4,title:"Engagement Drive",          client_name:"Kitchen & Home", status:"planned",   reach:"19.4K",change:"+2%"  },
    ];
  }, [campaigns]);

  // inbox stats
  const inboxStats = {
    comments: inboxMessages.filter(m=>m.type==="comment").length || 24,
    dms:      inboxMessages.filter(m=>m.type==="dm").length      || 12,
    mentions: inboxMessages.filter(m=>m.type==="mention").length ||  8,
    reviews:  inboxMessages.filter(m=>m.type==="review").length  ||  4,
  };

  // recent activity
  const recentActivity = [
    { id:1,text:"Post scheduled for Kotak M",           time:"3m ago",   icon:<Calendar size={13}/> },
    { id:2,text:"Client approved reel for Vorion Nexus", time:"12m ago",  icon:<CheckCircle2 size={13}/> },
    { id:3,text:"Campaign started for Adstra Digital",  time:"1h ago",   icon:<Zap size={13}/> },
    { id:4,text:"Comment received on Kitchen & Home",   time:"2h ago",   icon:<MessageCircle size={13}/> },
    { id:5,text:"Asset uploaded by team",               time:"3h ago",   icon:<Image size={13}/> },
  ];

  // platform rows
  const platformRows = useMemo(() => {
    if (platforms.length>0) return platforms.slice(0,5);
    return [
      { platform:"instagram",name:"Instagram", followers:82400, follower_growth:"+1.2%",engagement_rate:6.8 },
      { platform:"facebook", name:"Facebook",  followers:41200, follower_growth:"+1.6%",engagement_rate:5.1 },
      { platform:"linkedin", name:"LinkedIn",  followers:18600, follower_growth:"+1.5%",engagement_rate:7.3 },
      { platform:"youtube",  name:"YouTube",   followers:8200,  follower_growth:"+1.6%",engagement_rate:4.2 },
      { platform:"x",        name:"X / Twitter",followers:3100, follower_growth:"+1.4%",engagement_rate:3.6 },
    ];
  }, [platforms]);

  const campaignStatusStyle = (status) => {
    const map = {
      running:   { bg:"#ecfdf5",color:"#10b981",label:"Running"   },
      scheduled: { bg:"#eff6ff",color:"#3b82f6",label:"Scheduled" },
      planned:   { bg:"#fff7ed",color:"#ea580c",label:"Planned"   },
      paused:    { bg:"#f1f5f9",color:"#64748b",label:"Paused"    },
    };
    return map[status] || map.planned;
  };

  // mock client data when API is empty
  const mockClients = [
    { id:1,name:"Adstra Digital",   accounts_count:5,published_posts:12,target_posts:30,progress_percent:40,followers:84200,engagement_rate:4.4,reach:28600,status:"on_track" },
    { id:2,name:"Vorion Nexus",     accounts_count:3,published_posts:8, target_posts:25,progress_percent:32,followers:42800,engagement_rate:4.2,reach:52700,status:"behind"   },
    { id:3,name:"Kotak M",          accounts_count:1,published_posts:2, target_posts:40,progress_percent:5, followers:18900,engagement_rate:3.6,reach:12300,status:"on_track" },
    { id:4,name:"Kitchen & Home",   accounts_count:4,published_posts:6, target_posts:10,progress_percent:60,followers:34700,engagement_rate:6.2,reach:14400,status:"at_risk"  },
  ];
  const clientData = clientsSummary.length>0 ? clientsSummary.slice(0,4) : mockClients;

  const clientStatusConfig = {
    on_track: { color:"#10b981",bg:"#ecfdf5",label:"On Track"      },
    behind:   { color:"#f59e0b",bg:"#fffbeb",label:"Behind Target" },
    at_risk:  { color:"#ef4444",bg:"#fef2f2",label:"At Risk"       },
  };

  /* ─── panel / utility shared styles ─── */
  const panel = {
    background:"#ffffff",borderRadius:16,padding:20,border:"1px solid #e2e8f0",
    boxShadow:"0 2px 12px rgba(15,23,42,0.04)",
  };
  const panelTitle = {
    display:"flex",alignItems:"center",gap:7,fontSize:"0.92rem",fontWeight:800,color:"#0f172a",
  };
  const panelHeader = {
    display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,
  };
  const viewAllBtn = {
    background:"none",border:"none",color:"#4f46e5",fontWeight:700,fontSize:"0.78rem",cursor:"pointer",padding:0,
  };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>

      {/* ══ ROW 1 · 5 KPI CARDS ══════════════════════════════════════════ */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16 }}>
        {[
          { label:"Total Audience",    value:totalFollowers.toLocaleString(),   growth:"+12.4% vs previous 30 days", color:"#4f46e5",bg:"#eef2ff",icon:<Users size={19}/>,   spark:[110,125,118,135,140,130,149] },
          { label:"Total Reach",       value:totalReach.toLocaleString(),       growth:"+18.2% vs previous 30 days", color:"#16a34a",bg:"#f0fdf4",icon:<Eye size={19}/>,    spark:[180,210,195,230,245,255,262] },
          { label:"Engagement Rate",   value:`${engagementRate}%`,              growth:"+0.8% vs previous 30 days",  color:"#db2777",bg:"#fdf2f8",icon:<Heart size={19}/>,  spark:[4.8,5.1,5.3,5.0,5.4,5.6,5.87] },
          { label:"Impressions",       value:totalImpressions.toLocaleString(), growth:"+21% vs previous 30 days",   color:"#2563eb",bg:"#eff6ff",icon:<BarChart2 size={19}/>,spark:[310,360,340,390,420,460,482] },
          { label:"Posts Published",   value:String(postsPublished),            growth:"+15.3% vs previous 30 days", color:"#ea580c",bg:"#fff7ed",icon:<Send size={19}/>,   spark:[110,128,120,140,155,170,186] },
        ].map(kpi => (
          <div key={kpi.label} style={{ ...panel,display:"flex",flexDirection:"column",gap:10 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:"0.78rem",fontWeight:600,color:"#64748b",marginBottom:4 }}>{kpi.label}</div>
                <div style={{ fontSize:"1.75rem",fontWeight:800,color:"#0f172a",lineHeight:1 }}>{kpi.value}</div>
                <div style={{ fontSize:"0.72rem",fontWeight:600,color:"#10b981",display:"flex",alignItems:"center",gap:3,marginTop:5 }}>
                  <ArrowUpRight size={12}/>{kpi.growth}
                </div>
              </div>
              <div style={{ width:40,height:40,borderRadius:10,background:kpi.bg,color:kpi.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                {kpi.icon}
              </div>
            </div>
            <Sparkline data={kpi.spark} color={kpi.color} />
          </div>
        ))}
      </div>

      {/* ══ ROW 2 · AUDIENCE GROWTH + PLATFORM PERF + QUICK-ACTIONS/PIPELINE */}
      <div style={{ display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr",gap:16 }}>

        {/* Audience Growth */}
        <div style={panel}>
          <div style={panelHeader}>
            <div>
              <div style={panelTitle}><Activity size={15} style={{color:"#4f46e5"}}/> Audience Growth</div>
              <div style={{ fontSize:"0.72rem",color:"#94a3b8",marginTop:2 }}>Total followers across all platforms</div>
            </div>
            <div style={{ display:"flex",gap:14,alignItems:"center" }}>
              {[["#a855f7","Instagram"],["#3b82f6","Facebook"],["#10b981","LinkedIn"]].map(([c,l]) => (
                <span key={l} style={{ display:"flex",alignItems:"center",gap:5,fontSize:"0.72rem",color:"#64748b" }}>
                  <span style={{ width:8,height:8,borderRadius:2,background:c,display:"inline-block" }}/>
                  {l}
                </span>
              ))}
              <select style={{ fontSize:"0.72rem",border:"1px solid #e2e8f0",borderRadius:8,padding:"3px 8px",color:"#64748b",background:"#f8fafc",cursor:"pointer" }}>
                <option>Last 30 Days</option><option>Last 7 Days</option><option>Last 90 Days</option>
              </select>
            </div>
          </div>
          <AudienceGrowthChart />
        </div>

        {/* Platform Performance */}
        <div style={panel}>
          <div style={panelHeader}>
            <div style={panelTitle}><Share2 size={15} style={{color:"#4f46e5"}}/> Platform Performance</div>
            <button style={viewAllBtn} onClick={()=>onNavigateTab("social")}>View all →</button>
          </div>
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead>
              <tr>
                {["Platform","Followers","Engagement"].map(h=>(
                  <th key={h} style={{ textAlign:h==="Platform"?"left":"right",fontSize:"0.68rem",color:"#94a3b8",fontWeight:600,paddingBottom:8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {platformRows.map((p,i)=>(
                <tr key={i}>
                  <td style={{ padding:"8px 0",borderTop:"1px solid #f1f5f9" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                      <PlatformDot platform={p.platform}/>
                      <span style={{ fontSize:"0.8rem",fontWeight:600,color:"#0f172a" }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ textAlign:"right",fontSize:"0.8rem",fontWeight:700,color:"#0f172a",borderTop:"1px solid #f1f5f9",verticalAlign:"middle" }}>
                    {(p.followers/1000).toFixed(1)}K
                    <span style={{ marginLeft:5,fontSize:"0.68rem",color:"#10b981",fontWeight:600 }}>{p.follower_growth||"+1%"}</span>
                  </td>
                  <td style={{ textAlign:"right",fontSize:"0.8rem",fontWeight:700,color:"#4f46e5",borderTop:"1px solid #f1f5f9",verticalAlign:"middle" }}>{p.engagement_rate||"—"}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Module Shortcuts + Content Pipeline */}
        <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
          <div style={panel}>
            <div style={{ ...panelTitle,marginBottom:12 }}><Zap size={15} style={{color:"#f59e0b"}}/> Quick Shortcuts</div>
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {[
                { label:"Social Management",      sub:"Calendar, Posts, Approvals",    bg:"#eff6ff",color:"#2563eb",icon:<Share2 size={18}/>,       tab:"social"    },
                { label:"Client Assets",           sub:"Logos, Reels, Creatives & Docs",bg:"#fef3c7",color:"#d97706",icon:<FolderArchive size={18}/>, tab:"assets"    },
                { label:"Campaigns",               sub:"Objectives, Budgets, ROI",      bg:"#fdf4ff",color:"#a855f7",icon:<Layers size={18}/>,        tab:"campaigns" },
                { label:"Reports & Analytics",     sub:"Charts, Excel/PDF exports",     bg:"#f0fdf4",color:"#16a34a",icon:<BarChart2 size={18}/>,     tab:"reports"   },
                { label:"Team Hierarchy Tree",     sub:"Designations & Org Chart",      bg:"#fff7ed",color:"#ea580c",icon:<Building2 size={18}/>,     tab:"team_tree" },
              ].map(sc=>(
                <button key={sc.label} onClick={()=>onNavigateTab(sc.tab)}
                  style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,border:"1px solid #f1f5f9",cursor:"pointer",background:"#ffffff",textAlign:"left",transition:"all 0.15s",width:"100%" }}
                  onMouseOver={e=>{ e.currentTarget.style.background=sc.bg; e.currentTarget.style.borderColor=sc.color+"44"; e.currentTarget.style.transform="translateX(3px)"; }}
                  onMouseOut={e=>{ e.currentTarget.style.background="#ffffff"; e.currentTarget.style.borderColor="#f1f5f9"; e.currentTarget.style.transform="translateX(0)"; }}
                >
                  <div style={{ width:36,height:36,borderRadius:9,background:sc.bg,color:sc.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    {sc.icon}
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontWeight:700,fontSize:"0.82rem",color:"#0f172a" }}>{sc.label}</div>
                    <div style={{ fontSize:"0.68rem",color:"#94a3b8",marginTop:1 }}>{sc.sub}</div>
                  </div>
                  <ChevronRight size={14} color="#cbd5e1" style={{flexShrink:0}}/>
                </button>
              ))}
            </div>
          </div>

          <div style={panel}>
            <div style={panelHeader}>
              <div style={panelTitle}><Layers size={15} style={{color:"#4f46e5"}}/> Content Pipeline</div>
              <button style={viewAllBtn} onClick={()=>onNavigateTab("social")}>View all →</button>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:6,flexWrap:"wrap" }}>
              {[
                { label:"Idea",     count:pipeline.idea,     color:"#6366f1" },
                { label:"Draft",    count:pipeline.draft,    color:"#3b82f6" },
                { label:"Review",   count:pipeline.review,   color:"#f59e0b" },
                { label:"Approved", count:pipeline.approved, color:"#10b981" },
                { label:"Scheduled",count:pipeline.scheduled,color:"#8b5cf6" },
              ].map((stage,i,arr)=>(
                <React.Fragment key={stage.label}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ width:34,height:34,borderRadius:9,background:stage.color+"18",color:stage.color,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 3px",fontWeight:800,fontSize:"0.9rem" }}>{stage.count}</div>
                    <div style={{ fontSize:"0.62rem",color:"#94a3b8",fontWeight:600 }}>{stage.label}</div>
                  </div>
                  {i<arr.length-1 && <ArrowRight size={11} color="#cbd5e1" style={{flexShrink:0}}/>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ ROW 3 · CAMPAIGNS + UPCOMING POSTS + APPROVAL QUEUE + INBOX ═══ */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:16 }}>

        {/* My Campaigns */}
        <div style={panel}>
          <div style={panelHeader}>
            <div style={panelTitle}><Target size={15} style={{color:"#4f46e5"}}/> My Campaigns</div>
            <button style={viewAllBtn} onClick={()=>onNavigateTab("campaigns")}>View all →</button>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            {activeCampaigns.map((c,i)=>{
              const s=campaignStatusStyle(c.status);
              return (
                <div key={c.id||i} style={{ display:"flex",gap:10,alignItems:"center",borderBottom:"1px solid #f1f5f9",paddingBottom:10 }}>
                  <div style={{ width:40,height:40,borderRadius:9,background:`hsl(${i*70+200},65%,86%)`,flexShrink:0 }}/>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontWeight:700,fontSize:"0.8rem",color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{c.title||c.name}</div>
                    <div style={{ fontSize:"0.7rem",color:"#64748b" }}>{c.client_name}</div>
                  </div>
                  <div style={{ textAlign:"right",flexShrink:0 }}>
                    <span style={{ fontSize:"0.65rem",fontWeight:700,padding:"2px 7px",borderRadius:6,background:s.bg,color:s.color }}>{s.label}</span>
                    <div style={{ fontSize:"0.78rem",fontWeight:800,color:"#0f172a",marginTop:2 }}>{c.reach||"—"} <span style={{ color:"#10b981",fontSize:"0.68rem" }}>{c.change||""}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Posts */}
        <div style={panel}>
          <div style={panelHeader}>
            <div style={panelTitle}><Calendar size={15} style={{color:"#4f46e5"}}/> Upcoming Posts</div>
            <button style={viewAllBtn} onClick={()=>onNavigateTab("social")}>View Calendar →</button>
          </div>
          <div style={{ display:"flex",gap:6,marginBottom:12 }}>
            {["Today (4)","Tomorrow (7)","This Week (18)"].map((t,i)=>(
              <button key={i} style={{ padding:"3px 9px",borderRadius:20,fontSize:"0.68rem",fontWeight:700,border:"none",cursor:"pointer",background:i===0?"#4f46e5":"#f1f5f9",color:i===0?"#fff":"#64748b" }}>{t}</button>
            ))}
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {upcomingPosts.map((post,i)=>(
              <div key={post.id||i} style={{ display:"flex",gap:8,alignItems:"center" }}>
                <div style={{ fontSize:"0.68rem",color:"#94a3b8",minWidth:52,fontWeight:600 }}>{post.time||"—"}</div>
                <PlatformDot platform={post.platform}/>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:"0.79rem",fontWeight:700,color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{post.title||post.primary_caption?.slice(0,28)}</div>
                  <div style={{ fontSize:"0.68rem",color:"#64748b" }}>{post.client_name}</div>
                </div>
                <span style={{ fontSize:"0.64rem",fontWeight:700,padding:"2px 6px",borderRadius:6,background:post.status==="scheduled"?"#eff6ff":"#fff7ed",color:post.status==="scheduled"?"#3b82f6":"#ea580c",whiteSpace:"nowrap" }}>
                  {post.status==="scheduled"?"Scheduled":"Pending Approval"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Approval Queue */}
        <div style={panel}>
          <div style={panelHeader}>
            <div style={panelTitle}>
              <AlertCircle size={15} style={{color:"#ea580c"}}/> Approval Queue
              <span style={{ background:"#fef2f2",color:"#ef4444",fontSize:"0.65rem",fontWeight:800,padding:"1px 6px",borderRadius:20 }}>{approvalQueue.length}</span>
            </div>
            <button style={viewAllBtn} onClick={()=>onNavigateTab("social")}>View all →</button>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:"5px 8px",alignItems:"center" }}>
            {["Client","Post","Due In"].map(h=>(
              <span key={h} style={{ fontSize:"0.65rem",fontWeight:700,color:"#94a3b8",textTransform:"uppercase" }}>{h}</span>
            ))}
            {approvalQueue.map((item,i)=>(
              <React.Fragment key={item.id||i}>
                <span style={{ fontSize:"0.75rem",fontWeight:700,color:"#0f172a",borderTop:"1px solid #f1f5f9",paddingTop:5 }}>{item.client_name}</span>
                <span style={{ fontSize:"0.72rem",color:"#64748b",borderTop:"1px solid #f1f5f9",paddingTop:5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{item.title||item.primary_caption?.slice(0,18)}</span>
                <span style={{ fontSize:"0.7rem",fontWeight:800,color:i<2?"#ef4444":"#f59e0b",borderTop:"1px solid #f1f5f9",paddingTop:5 }}>{item.due||"1d"}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Engagement Inbox */}
        <div style={panel}>
          <div style={panelHeader}>
            <div style={panelTitle}><Inbox size={15} style={{color:"#4f46e5"}}/> Engagement Inbox</div>
            <button style={viewAllBtn} onClick={()=>onNavigateTab("social")}>View all →</button>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {[
              { label:"Comments",count:inboxStats.comments,icon:<MessageCircle size={15}/>,color:"#4f46e5" },
              { label:"DMs",     count:inboxStats.dms,     icon:<Mail size={15}/>,         color:"#3b82f6" },
              { label:"Mentions",count:inboxStats.mentions, icon:<AtSign size={15}/>,       color:"#f59e0b" },
              { label:"Reviews", count:inboxStats.reviews,  icon:<Star size={15}/>,         color:"#10b981" },
            ].map(({ label,count,icon,color })=>(
              <div key={label} onClick={()=>onNavigateTab("social")}
                style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 10px",borderRadius:10,border:"1px solid #f1f5f9",cursor:"pointer",transition:"background 0.15s" }}
                onMouseOver={e=>e.currentTarget.style.background="#f8fafc"}
                onMouseOut={e=>e.currentTarget.style.background="transparent"}
              >
                <div style={{ display:"flex",alignItems:"center",gap:9 }}>
                  <div style={{ width:32,height:32,borderRadius:8,background:color+"18",color,display:"flex",alignItems:"center",justifyContent:"center" }}>{icon}</div>
                  <span style={{ fontSize:"0.82rem",fontWeight:600,color:"#0f172a" }}>{label}</span>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                  <span style={{ fontSize:"0.78rem",fontWeight:800,padding:"2px 8px",borderRadius:8,background:color+"18",color }}>{count}</span>
                  <ChevronRight size={13} color="#94a3b8"/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ ROW 4 · CLIENT PERFORMANCE + RECENT ACTIVITY ═══════════════════ */}
      <div style={{ display:"grid",gridTemplateColumns:"3fr 1fr",gap:16 }}>

        {/* Client Performance */}
        <div style={panel}>
          <div style={panelHeader}>
            <div style={panelTitle}><Building2 size={15} style={{color:"#4f46e5"}}/> Client Performance</div>
            <div style={{ display:"flex",gap:8,alignItems:"center" }}>
              <input placeholder="Search client…" style={{ fontSize:"0.72rem",border:"1px solid #e2e8f0",borderRadius:8,padding:"4px 10px",color:"#64748b",background:"#f8fafc",outline:"none" }}/>
              <button style={viewAllBtn} onClick={()=>onNavigateTab("social")}>View all →</button>
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14 }}>
            {clientData.map(c=>{
              const sc=clientStatusConfig[c.status]||clientStatusConfig.on_track;
              return (
                <div key={c.id} style={{ background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:14,padding:16 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <div style={{ width:34,height:34,borderRadius:9,background:"#4f46e5",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:"0.9rem" }}>{c.name?.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight:700,fontSize:"0.82rem",color:"#0f172a" }}>{c.name}</div>
                        <div style={{ fontSize:"0.65rem",color:"#94a3b8" }}>{c.accounts_count} channels</div>
                      </div>
                    </div>
                    <button onClick={()=>onNavigateTab("social")} style={{ background:"none",border:"1px solid #e2e8f0",borderRadius:7,padding:"3px 8px",fontSize:"0.68rem",fontWeight:700,color:"#64748b",cursor:"pointer" }}>Manage →</button>
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10 }}>
                    {[
                      { label:"Posts",value:`${c.published_posts}/${c.target_posts}` },
                      { label:"Reach",value:`${((c.reach||0)/1000).toFixed(1)}K` },
                      { label:"Eng.",value:`${c.engagement_rate||0}%` },
                    ].map(({ label,value })=>(
                      <div key={label} style={{ textAlign:"center",background:"#fff",borderRadius:8,padding:"6px 4px" }}>
                        <div style={{ fontSize:"0.76rem",fontWeight:800,color:"#0f172a" }}>{value}</div>
                        <div style={{ fontSize:"0.6rem",color:"#94a3b8" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom:8 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.68rem",color:"#94a3b8",marginBottom:4 }}>
                      <span>Monthly Target</span><span style={{ fontWeight:700 }}>{c.progress_percent}%</span>
                    </div>
                    <div style={{ height:6,background:"#e2e8f0",borderRadius:3,overflow:"hidden" }}>
                      <div style={{ width:`${c.progress_percent}%`,height:"100%",background:c.progress_percent>=80?"#10b981":"#4f46e5",borderRadius:3,transition:"width 0.4s" }}/>
                    </div>
                  </div>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <span style={{ fontSize:"0.68rem",fontWeight:700,padding:"2px 8px",borderRadius:6,background:sc.bg,color:sc.color }}>● {sc.label}</span>
                    <span style={{ fontSize:"0.65rem",color:"#94a3b8" }}>Next due: 1d</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
          <div style={panel}>
            <div style={panelHeader}>
              <div style={panelTitle}><Activity size={15} style={{color:"#4f46e5"}}/> Recent Activity</div>
              <button style={viewAllBtn}>View all →</button>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
              {recentActivity.map(item=>(
                <div key={item.id} style={{ display:"flex",gap:9,alignItems:"flex-start" }}>
                  <div style={{ width:28,height:28,borderRadius:7,background:"#eef2ff",color:"#4f46e5",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1 }}>{item.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"0.78rem",fontWeight:600,color:"#0f172a",lineHeight:1.4 }}>{item.text}</div>
                    <div style={{ fontSize:"0.68rem",color:"#94a3b8",marginTop:2 }}>{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow CTA */}
          <div style={{ background:"linear-gradient(135deg,#4f46e5,#7c3aed)",borderRadius:16,padding:"18px 16px",color:"#fff" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}>
              <Sparkles size={16}/><span style={{ fontWeight:800,fontSize:"0.88rem" }}>From idea to impact</span>
            </div>
            <div style={{ display:"flex",gap:4,flexWrap:"wrap",fontSize:"0.65rem",opacity:0.82,marginBottom:14 }}>
              {["Create posts","Get client approval","Publish to social media","Run campaigns","Track performance"].map((s,i,a)=>(
                <React.Fragment key={s}><span>{s}</span>{i<a.length-1&&<ArrowRight size={9}/>}</React.Fragment>
              ))}
            </div>
            <button onClick={()=>onNavigateTab("social")} style={{ background:"#fff",color:"#4f46e5",border:"none",borderRadius:9,padding:"8px 14px",fontWeight:800,fontSize:"0.78rem",cursor:"pointer",width:"100%" }}>
              Go to Social Management →
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
