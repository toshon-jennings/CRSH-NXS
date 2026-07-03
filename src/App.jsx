import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  Plus,
  Search,
  CheckCircle,
  Cpu,
  Zap,
  Activity,
  ArrowUpRight,
  Sun,
  Moon,
  GitFork,
  X,
  ExternalLink,
} from 'lucide-react';

const getEngineUrl = (node) => {
  if (node.site) return node.site;
  if (!node.repo) return '';
  const match = node.repo.match(/github\.com\/([^/]+)\/([^/]+)/i);
  if (match) {
    const owner = match[1];
    const repo = match[2].replace(/\.git$/, '');
    return `https://${owner}.github.io/${repo}/`;
  }
  return node.repo;
};

const initialNodes = [
  { 
    id: 'philadelphia', 
    name: 'PHLCRSH Engine', 
    city: 'Philadelphia', 
    admin: 'Toshon Jennings', 
    repo: 'https://github.com/toshon-jennings/PHLCRSH-V2', 
    site: 'https://toshon-jennings.github.io/PHLCRSH-V2/',
    x: 500, 
    y: 200, 
    status: 'online', 
    incidents: 1250, 
    segments: 13500, 
    region: 'US-East' 
  }
];


const initialFeed = [
  { id: 1, time: '2026-07', event: 'CRSH-NXS Deployed', desc: 'Central registry launched for tracking federated city crash risk engines.' },
  { id: 2, time: '2026-06', event: 'PHLCRSH Engine Live', desc: 'Philadelphia mapping dashboard deployed with DuckDB queries and canopy layers.' }
];

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('crsh-theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  // Load registered nodes from localStorage if they exist, fallback to Philadelphia
  const [nodes, setNodes] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('crsh-nexus-nodes');
      return saved ? JSON.parse(saved) : initialNodes;
    }
    return initialNodes;
  });

  const [feed, setFeed] = useState(initialFeed);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all | online | offline
  const [highlightedNode, setHighlightedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    city: '',
    name: '',
    admin: '',
    repo: '',
    site: '',
    region: 'US-East',
    segments: '12000',
    incidents: '450',
    x: '500',
    y: '250',
    status: 'online'
  });

  // Theme effect
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('crsh-theme', theme);
  }, [theme]);

  // Persist nodes to localStorage
  useEffect(() => {
    localStorage.setItem('crsh-nexus-nodes', JSON.stringify(nodes));
  }, [nodes]);

  // Compute Stats
  const stats = useMemo(() => {
    const onlineNodes = nodes.filter(n => n.status === 'online');
    const totalSegments = nodes.reduce((acc, curr) => acc + (curr.segments || 0), 0);
    const totalIncidents = onlineNodes.reduce((acc, curr) => acc + (curr.incidents || 0), 0);
    
    return {
      total: nodes.length,
      online: onlineNodes.length,
      segments: totalSegments,
      incidents: totalIncidents
    };
  }, [nodes]);

  // Filter Directory List
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const matchesSearch = node.city.toLowerCase().includes(search.toLowerCase()) || 
                            node.name.toLowerCase().includes(search.toLowerCase()) ||
                            node.region.toLowerCase().includes(search.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || node.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    });
  }, [nodes, search, filterStatus]);

  // Handle Form Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit Registration Form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.city || !formData.name || !formData.repo) {
      alert('Please fill out all required fields.');
      return;
    }

    let siteUrl = formData.site ? (formData.site.startsWith('http') ? formData.site : `https://${formData.site}`) : '';
    if (!siteUrl && formData.repo) {
      const match = formData.repo.match(/github\.com\/([^/]+)\/([^/]+)/i);
      if (match) {
        const owner = match[1];
        const repo = match[2].replace(/\.git$/, '');
        siteUrl = `https://${owner}.github.io/${repo}/`;
      }
    }

    const newNode = {
      id: formData.city.toLowerCase().replace(/\s+/g, '-'),
      city: formData.city,
      name: formData.name,
      admin: formData.admin || 'Anonymous',
      repo: formData.repo.startsWith('http') ? formData.repo : `https://${formData.repo}`,
      site: siteUrl,
      region: formData.region,
      segments: parseInt(formData.segments) || 0,
      incidents: formData.status === 'online' ? (parseInt(formData.incidents) || 0) : null,
      x: parseInt(formData.x) || 500,
      y: parseInt(formData.y) || 250,
      status: formData.status
    };

    setNodes(prev => [...prev, newNode]);
    
    // Add event log to top of activity list
    const newLog = {
      id: Date.now(),
      time: 'Just Now',
      event: `${newNode.name} (${newNode.city})`,
      desc: `Registered new local crash engine inside client session.`
    };
    setFeed(prev => [newLog, ...prev]);
    setFormSubmitted(true);
  };

  // Close Modal and Reset Form Success State
  const closeModal = () => {
    setIsModalOpen(false);
    setFormSubmitted(false);
    setFormData({
      city: '',
      name: '',
      admin: '',
      repo: '',
      site: '',
      region: 'US-East',
      segments: '12000',
      incidents: '450',
      x: Math.floor(Math.random() * (800 - 150) + 150).toString(),
      y: Math.floor(Math.random() * (350 - 100) + 100).toString(),
      status: 'online'
    });
  };

  // Connect registered nodes in the SVG visualizer
  const connectionPaths = useMemo(() => {
    const paths = [];
    const onlineNodes = nodes.filter(n => n.status === 'online');
    if (onlineNodes.length > 1) {
      for (let i = 0; i < onlineNodes.length; i++) {
        const start = onlineNodes[i];
        const end = onlineNodes[(i + 1) % onlineNodes.length];
        paths.push({
          id: `path-${start.id}-${end.id}`,
          x1: start.x,
          y1: start.y,
          x2: end.x,
          y2: end.y
        });
      }
    }
    return paths;
  }, [nodes]);

  return (
    <div className="nexus-root">
      {/* Top Header */}
      <header className="nexus-header">
        <div className="nexus-header-container">
          <div className="nexus-logo-group">
            <img src="./favicon.png" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '6px', flexShrink: 0 }} />
            <div className="nexus-title-block">
              <h1>CRSH-NXS</h1>
              <p>Central Registry of Localized Crash Risk Engines</p>
            </div>
          </div>
          <div className="nexus-header-actions">
            <button
              type="button"
              onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              className="nexus-theme-btn"
              title="Toggle color theme"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="nexus-btn-register"
            >
              <Plus size={14} />
              Register Engine
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="nexus-main">
        {/* Stats Matrix Grid */}
        <section className="nexus-stats-matrix">
          <div className="nexus-stat-card">
            <div className="nexus-stat-icon-wrapper">
              <Globe size={20} />
            </div>
            <div className="nexus-stat-info">
              <h3>{stats.total}</h3>
              <p>Registered City Engines</p>
            </div>
          </div>
          <div className="nexus-stat-card">
            <div className="nexus-stat-icon-wrapper" style={{ color: '#4ade80' }}>
              <Zap size={20} />
            </div>
            <div className="nexus-stat-info">
              <h3>{stats.online} <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 400 }}>active</span></h3>
              <p>Connected Instances</p>
            </div>
          </div>
          <div className="nexus-stat-card">
            <div className="nexus-stat-icon-wrapper" style={{ color: '#5a9cf5' }}>
              <Cpu size={20} />
            </div>
            <div className="nexus-stat-info">
              <h3>{stats.segments.toLocaleString()}</h3>
              <p>Tracked Road Segments</p>
            </div>
          </div>
          <div className="nexus-stat-card">
            <div className="nexus-stat-icon-wrapper" style={{ color: '#f87171' }}>
              <Activity size={20} />
            </div>
            <div className="nexus-stat-info">
              <h3>{stats.incidents.toLocaleString()}</h3>
              <p>KSI Accidents Mapped</p>
            </div>
          </div>
        </section>

        {/* Map Visualization & Activity Feed Panel */}
        <section className="nexus-layout-grid">
          {/* SVG Connection Topology Map */}
          <div className="nexus-panel">
            <div className="nexus-panel-title">
              <h2>Federation Topology</h2>
              <p>Spatial mapping registry showing active city crash risk nodes. Hover dots to identify nodes.</p>
            </div>
            <div className="nexus-map-container">
              <svg viewBox="0 0 1000 500" className="nexus-map-svg">
                {/* Background Grid Pattern */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
                  </pattern>
                </defs>
                <rect width="1000" height="500" fill="url(#grid)" />

                {/* Draw connection pathways (if more than 1 engine exists) */}
                {connectionPaths.map((path) => (
                  <line
                    key={path.id}
                    x1={path.x1}
                    y1={path.y1}
                    x2={path.x2}
                    y2={path.y2}
                    stroke="var(--accent)"
                    strokeWidth="1.5"
                    opacity="0.35"
                    className="network-line"
                  />
                ))}

                {/* Draw node markers */}
                {nodes.map((node) => {
                  const isHovered = highlightedNode === node.id;
                  const isOnline = node.status === 'online';
                  return (
                    <g
                      key={node.id}
                      className="map-node-hitbox"
                      onMouseEnter={() => setHighlightedNode(node.id)}
                      onMouseLeave={() => setHighlightedNode(null)}
                      onClick={() => {
                        const targetUrl = getEngineUrl(node);
                        if (targetUrl) {
                          window.open(targetUrl, '_blank', 'noopener,noreferrer');
                        }
                      }}
                    >
                      {/* Pulse Outer Rings */}
                      {isOnline && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={isHovered ? 18 : 12}
                          fill="none"
                          stroke={isHovered ? 'var(--accent)' : 'var(--accent)'}
                          strokeWidth="1"
                          className="glow-dot-outer"
                        />
                      )}
                      
                      {/* Inner Dot */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isHovered ? 6 : 4.5}
                        fill={isOnline ? 'var(--success)' : 'var(--error)'}
                        stroke="var(--bg-secondary)"
                        strokeWidth="1"
                      />

                      {/* City Text Label */}
                      <g transform={`translate(${node.x}, ${node.y - 18})`}>
                        <rect
                          x={-node.city.length * 3.5 - 6}
                          y="-9"
                          width={node.city.length * 7 + 12}
                          height="16"
                          className="map-node-label-bg"
                        />
                        <text className="map-node-label" y="2">
                          {node.city}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Activity Log Feed */}
          <div className="nexus-panel">
            <div className="nexus-panel-title">
              <h2>Recent Project Milestones</h2>
              <p>Log stream of platform deploys, new feature merges, and directory registrations.</p>
            </div>
            <div className="nexus-feed-list">
              {feed.map((item) => (
                <div key={item.id} className="nexus-feed-item">
                  <span className="nexus-feed-time">{item.time}</span>
                  <div className="nexus-feed-desc">
                    <strong>{item.event}</strong>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Directory Header Filters */}
        <section className="nexus-directory-header">
          <div className="nexus-panel-title" style={{ marginBottom: 0 }}>
            <h2>Federated City Engines</h2>
            <p>Directory of all custom city mapping layers built on the PHLCRSH-V2 platform.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="nexus-search-input">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search city, engine, or region..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="nexus-filter-group">
              <button
                type="button"
                className={`nexus-filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`nexus-filter-btn ${filterStatus === 'online' ? 'active' : ''}`}
                onClick={() => setFilterStatus('online')}
              >
                Online
              </button>
              <button
                type="button"
                className={`nexus-filter-btn ${filterStatus === 'offline' ? 'active' : ''}`}
                onClick={() => setFilterStatus('offline')}
              >
                Offline
              </button>
            </div>
          </div>
        </section>

        {/* Node Cards Grid Directory */}
        <section className="nexus-card-grid">
          {filteredNodes.length > 0 ? (
            filteredNodes.map((node) => (
              <div
                key={node.id}
                className={`nexus-node-card ${highlightedNode === node.id ? 'highlighted' : ''}`}
                onMouseEnter={() => setHighlightedNode(node.id)}
                onMouseLeave={() => setHighlightedNode(null)}
                onClick={() => {
                  const targetUrl = getEngineUrl(node);
                  if (targetUrl) {
                    window.open(targetUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
                title={`Launch ${node.city} Crash Risk Engine`}
              >
                <div className="nexus-card-top">
                  <div className="nexus-card-meta">
                    <h3>{node.city} ({node.region})</h3>
                    <span>{node.name}</span>
                  </div>
                  <span className={`nexus-badge-status ${node.status}`}>
                    {node.status}
                  </span>
                </div>

                <div className="nexus-card-stats">
                  <div className="nexus-card-stat-item">
                    <span>Mapped Road Segments</span>
                    <span>{node.segments.toLocaleString()}</span>
                  </div>
                  <div className="nexus-card-stat-item">
                    <span>KSI Incidents</span>
                    <span>{node.incidents ? node.incidents.toLocaleString() : '—'}</span>
                  </div>
                </div>

                <div className="nexus-card-bottom">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Maintainer:</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{node.admin}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', width: '100%' }}>
                    <a
                      href={getEngineUrl(node)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nexus-card-action-btn primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={13} />
                      <span>Launch Engine</span>
                    </a>
                    <a
                      href={node.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nexus-card-action-btn secondary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GitFork size={13} />
                      <span>View GitHub Repository</span>
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
              No city engines found matching the search criteria.
            </div>
          )}
        </section>

        {/* Stepper Guide (How to Fork) */}
        <section className="nexus-steps-card">
          <div className="nexus-panel-title">
            <h2>Building a City Engine</h2>
            <p>Three quick steps to spin up a custom crash risk map and register it in the nexus.</p>
          </div>
          <div className="nexus-steps-grid">
            <div className="nexus-step-item">
              <div className="nexus-step-num">1</div>
              <h4>Fork the Repository</h4>
              <p>Fork the main PHLCRSH-V2 mapping template to your own GitHub workspace.</p>
              <code>git clone https://github.com/toshon-jennings/PHLCRSH-V2.git</code>
            </div>
            <div className="nexus-step-item">
              <div className="nexus-step-num">2</div>
              <h4>Customize City Data & Map</h4>
              <p>Replace Philadelphia geographic layers, crash GeoParquet files, canopy boundaries, and custom filter metrics with your local city data.</p>
              <code>data_prep/</code>
            </div>
            <div className="nexus-step-item">
              <div className="nexus-step-num">3</div>
              <h4>Register on CRSH-NXS</h4>
              <p>Register your engine details, custom coordinate center, and segments mapped on the CRSH-NXS registry.</p>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(true)}
                className="nexus-card-link" 
                style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
              >
                <span>Register City Engine</span>
                <ArrowUpRight size={12} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Node Registration Modal Form */}
      {isModalOpen && (
        <div className="nexus-modal-overlay">
          <div className="nexus-modal">
            <div className="nexus-modal-head">
              <h3>Register Local Crash Engine</h3>
              <button type="button" onClick={closeModal} className="nexus-modal-close">
                <X size={18} />
              </button>
            </div>

            {!formSubmitted ? (
              <form onSubmit={handleSubmit} className="nexus-form">
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: '1.4', marginBottom: '8px' }}>
                  <p>
                    <strong>Note:</strong> Submitting this form registers the engine in your local browser session cache (saved to localStorage). To list your city permanently in the global directory, submit a Pull Request adding your configuration details to <code>src/App.jsx</code>.
                  </p>
                </div>

                <div className="nexus-form-row">
                  <div className="nexus-form-group">
                    <label htmlFor="form-city">City Name *</label>
                    <input
                      id="form-city"
                      type="text"
                      name="city"
                      required
                      placeholder="e.g. Paris"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="nexus-form-group">
                    <label htmlFor="form-name">Engine Name *</label>
                    <input
                      id="form-name"
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. PAR-CRSH Engine"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="nexus-form-group">
                  <label htmlFor="form-repo">GitHub Fork URL *</label>
                  <input
                    id="form-repo"
                    type="text"
                    name="repo"
                    required
                    placeholder="e.g. github.com/user/PHLCRSH-V2"
                    value={formData.repo}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="nexus-form-group">
                  <label htmlFor="form-site">Engine Deployment URL (Optional)</label>
                  <input
                    id="form-site"
                    type="text"
                    name="site"
                    placeholder="e.g. user.github.io/PHLCRSH-V2 (Auto-derived if left blank)"
                    value={formData.site}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="nexus-form-row">
                  <div className="nexus-form-group">
                    <label htmlFor="form-admin">Admin Name</label>
                    <input
                      id="form-admin"
                      type="text"
                      name="admin"
                      placeholder="e.g. Jean"
                      value={formData.admin}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="nexus-form-group">
                    <label htmlFor="form-region">Region</label>
                    <select
                      id="form-region"
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                    >
                      <option value="US-East">US-East</option>
                      <option value="US-West">US-West</option>
                      <option value="EU-West">EU-West</option>
                      <option value="EU-Central">EU-Central</option>
                      <option value="AP-Northeast">AP-Northeast</option>
                      <option value="AP-Southeast">AP-Southeast</option>
                    </select>
                  </div>
                </div>

                <div className="nexus-form-row">
                  <div className="nexus-form-group">
                    <label htmlFor="form-segments">Tracked Segments</label>
                    <input
                      id="form-segments"
                      type="number"
                      name="segments"
                      min="1"
                      placeholder="12000"
                      value={formData.segments}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="nexus-form-group">
                    <label htmlFor="form-incidents">KSI Incidents Mapped</label>
                    <input
                      id="form-incidents"
                      type="number"
                      name="incidents"
                      min="1"
                      placeholder="450"
                      value={formData.incidents}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="nexus-form-row">
                  <div className="nexus-form-group">
                    <label htmlFor="form-x">Map coordinate X (100-900)</label>
                    <input
                      id="form-x"
                      type="number"
                      name="x"
                      min="50"
                      max="950"
                      value={formData.x}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="nexus-form-group">
                    <label htmlFor="form-y">Map coordinate Y (50-450)</label>
                    <input
                      id="form-y"
                      type="number"
                      name="y"
                      min="30"
                      max="470"
                      value={formData.y}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <button type="submit" className="nexus-form-btn-submit">
                  Register City Engine
                </button>
              </form>
            ) : (
              <div className="nexus-form-success">
                <div className="nexus-success-icon">
                  <CheckCircle size={32} />
                </div>
                <div>
                  <h4>Registered Locally!</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
                    {formData.name} ({formData.city}) is now active in your browser. To finalize this registration in the global registry, click below to submit a Pull Request to the repository.
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '12px' }}>
                  <a
                    href="https://github.com/toshon-jennings/CRSH-NXS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nexus-btn-register"
                    style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center' }}
                  >
                    <GitFork size={14} />
                    Submit Pull Request
                  </a>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="nexus-btn-register"
                    style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', boxShadow: 'none', display: 'flex', justifyContent: 'center' }}
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="nexus-footer">
        <p>&copy; 2026 CRSH Federation. Federated street safety models. Hosted on GitHub Pages.</p>
      </footer>
    </div>
  );
}
