"use client";

import "./Contact.css";
import React, { useEffect, useState } from "react";
import { db } from "../../Context/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import {
  Mail,
  Phone,
  Clock,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Send,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Target,
  BarChart3,
  Zap,
  Rocket,
  Crown,
  Star,
} from "lucide-react";

function ContactUs() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const docRef = doc(db, "contact", "9YknLHusmTjsVxZgZa5P");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setInfo(docSnap.data());
        } else {
          if (process.env.NODE_ENV !== "production") {
            console.error("No such document!");
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Error fetching company info:", error);
        }
      } finally {
        setLoading(false);
        setIsVisible(true);
      }
    };

    fetchCompanyInfo();
  }, []);

  if (loading) return (
    <div className="adstra-contact-loading">
      <div className="adstra-loading-orb">
        <div className="adstra-orb-inner"></div>
        <Rocket className="adstra-rocket-icon" />
      </div>
      <p className="adstra-loading-text">Preparing your marketing connection...</p>
    </div>
  );
  
  if (!info)
    return (
      <p className="adstra-error-text">
        Failed to load company information.
      </p>
    );

  return (
    <section id="contact" className={`adstra-contact-hero ${isVisible ? 'adstra-visible' : ''}`}>
      {/* Premium Background Elements */}
      <div className="adstra-cosmic-bg">
        <div className="adstra-nebula-1"></div>
        <div className="adstra-nebula-2"></div>
        <div className="adstra-stars"></div>
      </div>

      {/* Floating Particles */}
      <div className="adstra-particle-field">
        {[...Array(15)].map((_, i) => (
          <div key={i} className={`adstra-particle adstra-particle-${i + 1}`}></div>
        ))}
      </div>

      <div className="adstra-container">
        <div className="adstra-hero-header">
          <div className="adstra-title-glory">
            <div className="adstra-crown-wrapper">
              <Crown className="adstra-crown-icon" />
            </div>
            <h2 className="adstra-main-title">
              <span className="adstra-title-glow">Ignite Your</span>
              <span className="adstra-title-gradient">Digital Growth</span>
            </h2>
            <div className="adstra-star-burst">
              <Star className="adstra-star-icon" />
            </div>
          </div>
          <p className="adstra-hero-subtitle">Where Vision Meets Viral Results</p>
          <div className="adstra-title-aurora"></div>
        </div>

        <div className="adstra-contact-matrix">
          {/* Premium Contact Nexus */}
          <div className="adstra-nexus-column">
            <div className="adstra-nexus-card">
              <div className="adstra-nexus-header">
                <div className="adstra-nexus-glow"></div>
                <Zap className="adstra-nexus-icon" />
                <div>
                  <h3 className="adstra-nexus-title">Digital Command Center</h3>
                  <p className="adstra-nexus-subtitle">Your Gateway to Market Domination</p>
                </div>
              </div>

              <div className="adstra-nexus-grid">
                <div className="adstra-nexus-node">
                  <div className="adstra-node-orb">
                    <Mail className="adstra-node-icon" />
                  </div>
                  <div className="adstra-node-content">
                    <h4>Strategic Email Hub</h4>
                    <a href={`mailto:${info.email}`} className="adstra-node-link">
                      {info.email}
                    </a>
                    <div className="adstra-node-badge">Lightning Response</div>
                  </div>
                </div>

                <div className="adstra-nexus-node">
                  <div className="adstra-node-orb">
                    <Phone className="adstra-node-icon" />
                  </div>
                  <div className="adstra-node-content">
                    <h4>Elite Hotline</h4>
                    <a href="tel:+919744779574" className="adstra-node-link">
                      +91 9744779574
                    </a>
                    <div className="adstra-node-badge">Direct to Strategist</div>
                  </div>
                </div>

                <div className="adstra-nexus-node">
                  <div className="adstra-node-orb">
                    <Clock className="adstra-node-icon" />
                  </div>
                  <div className="adstra-node-content">
                    <h4>Victory Hours</h4>
                    <p>Mon – Sat: 9:30 AM – 6:00 PM</p>
                    <div className="adstra-node-badge">Always Winning</div>
                  </div>
                </div>

                <div className="adstra-nexus-node">
                  <div className="adstra-node-orb">
                    <MapPin className="adstra-node-icon" />
                  </div>
                  <div className="adstra-node-content">
                    <h4>War Rooms</h4>
                    <div className="adstra-warroom-list">
                      <div className="adstra-warroom-item">
                        <span>{info.address_3}</span>
                        <a
                          href="https://www.google.com/maps/place/ADSTRA+DIGITAL/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="adstra-map-portal"
                        >
                          <Rocket size={14} />
                          Launch Map
                        </a>
                      </div>
                      <div className="adstra-warroom-item">
                        <span>{info.address_2}</span>
                        <a
                          href="https://www.google.com/maps/search/?api=1&query=ADSTRA+DIGITAL"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="adstra-map-portal"
                        >
                          <Rocket size={14} />
                          Launch Map
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Victory Metrics */}
              <div className="adstra-victory-metrics">
                <div className="adstra-metric-crystal">
                  <div className="adstra-metric-value">500%</div>
                  <div className="adstra-metric-label">ROI Boost</div>
                </div>
                <div className="adstra-metric-crystal">
                  <div className="adstra-metric-value">24/7</div>
                  <div className="adstra-metric-label">Campaign Watch</div>
                </div>
                <div className="adstra-metric-crystal">
                  <div className="adstra-metric-value">#1</div>
                  <div className="adstra-metric-label">Results Rank</div>
                </div>
              </div>

              {/* Social Galaxy */}
              <div className="adstra-social-galaxy">
                <h4>Join Our Digital Universe</h4>
                <div className="adstra-galaxy-links">
                  <a href="https://www.facebook.com/adstradigital/" target="_blank" className="adstra-galaxy-link adstra-facebook-orbit">
                    <Facebook className="adstra-galaxy-icon" />
                    <span>Facebook Orbit</span>
                  </a>
                  <a href="https://www.instagram.com/adstradigital/" target="_blank" className="adstra-galaxy-link adstra-instagram-orbit">
                    <Instagram className="adstra-galaxy-icon" />
                    <span>Instagram Galaxy</span>
                  </a>
                  <a href="https://x.com/adstradigital" target="_blank" className="adstra-galaxy-link adstra-twitter-orbit">
                    <Twitter className="adstra-galaxy-icon" />
                    <span>Twitter Nebula</span>
                  </a>
                  <a href="https://www.linkedin.com/company/adstra-digital/about/" target="_blank" className="adstra-galaxy-link adstra-linkedin-orbit">
                    <Linkedin className="adstra-galaxy-icon" />
                    <span>LinkedIn Cluster</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Cosmic Map Terminal */}
          <div className="adstra-terminal-column">
            <div className="adstra-terminal-card">
              <div className="adstra-terminal-header">
                <div className="adstra-terminal-glow"></div>
                <Rocket className="adstra-terminal-icon" />
                <div>
                  <h3>Mission Control Center</h3>
                  <p>Where Strategies Launch to Success</p>
                </div>
              </div>
              <div className="adstra-cosmic-map">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3907.348642322409!2d75.7744375!3d11.2749186!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba607f2554bfa57%3A0xf47e913680e3620a!2sADSTRA%20DIGITAL!5e0!3m2!1sen!2sin!4v1694600000000!5m2!1sen!2sin"
                  allowFullScreen
                  loading="lazy"
                  title="AdstraDigital Mission Control"
                ></iframe>
                <div className="adstra-map-hologram">
                  <div className="adstra-hologram-grid"></div>
                  <div className="adstra-map-overlay">
                    <Zap className="adstra-overlay-icon" />
                    <span>Engage Navigation System</span>
                  </div>
                </div>
              </div>
              <div className="adstra-terminal-features">
                <div className="adstra-feature-comet">
                  <div className="adstra-comet-icon">⚡</div>
                  <span>Strategy Sessions</span>
                </div>
                <div className="adstra-feature-comet">
                  <div className="adstra-comet-icon">🚀</div>
                  <span>Launch Planning</span>
                </div>
                <div className="adstra-feature-comet">
                  <div className="adstra-comet-icon">🌌</div>
                  <span>Creative Brainstorming</span>
                </div>
              </div>

              <div className="adstra-terminal-brief">
                <div className="adstra-terminal-brief__intro">
                  <span className="adstra-terminal-brief__eyebrow">What happens when you visit</span>
                  <h4>From first conversation to launch plan, we keep it direct and actionable.</h4>
                  <p>
                    Walk in with a business goal and leave with a clearer roadmap for
                    content, media, web, and growth execution.
                  </p>
                </div>

                <div className="adstra-terminal-brief__grid">
                  <article className="adstra-terminal-mini-card">
                    <div className="adstra-terminal-mini-card__icon">
                      <MessageCircle size={18} />
                    </div>
                    <div>
                      <h5>Discovery Call</h5>
                      <p>We unpack your goals, blockers, audience, and current momentum.</p>
                    </div>
                  </article>

                  <article className="adstra-terminal-mini-card">
                    <div className="adstra-terminal-mini-card__icon">
                      <Target size={18} />
                    </div>
                    <div>
                      <h5>Strategy Mapping</h5>
                      <p>We align the right channels, creative direction, and conversion path.</p>
                    </div>
                  </article>

                  <article className="adstra-terminal-mini-card">
                    <div className="adstra-terminal-mini-card__icon">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <h5>Growth Action Plan</h5>
                      <p>Get practical next steps, timelines, and execution priorities.</p>
                    </div>
                  </article>
                </div>

                <div className="adstra-terminal-note">
                  <Sparkles size={16} />
                  <span>Prefer remote? We can turn the same session into a quick online strategy meet.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ultimate CTA Constellation */}
        <div className="adstra-cta-constellation">
          <div className="adstra-constellation-core">
            <div className="adstra-constellation-glow"></div>
            <div className="adstra-cta-crown">
              <Crown className="adstra-cta-crown-icon" />
            </div>
            <Send className="adstra-cta-beacon" />
            <h3 className="adstra-cta-title">
              Begin Your <span className="adstra-cta-empire">Digital Empire</span>
            </h3>
            <p className="adstra-cta-prophecy">
              Claim your throne in the digital realm. Our elite strategists await to craft your 
              dominion with data-driven campaigns that conquer markets and crown champions.
            </p>
            <div className="adstra-victory-manifest">
              <div className="adstra-manifest-item">🎯 Market Domination Blueprint</div>
              <div className="adstra-manifest-item">⚡ Viral Velocity Engine</div>
              <div className="adstra-manifest-item">🏆 Conversion Crown Jewel</div>
              <div className="adstra-manifest-item">🌐 Digital Kingdom Expansion</div>
            </div>
            <div className="adstra-cta-portals">
              <a href={`mailto:${info.email}?subject=Digital Empire Consultation - Crown My Business`} className="adstra-portal adstra-portal-royal">
                <Crown size={18} />
                Claim Your Throne
              </a>
              <a href="tel:+919744779574" className="adstra-portal adstra-portal-imperial">
                <Zap size={18} />
                Instant Command
              </a>
            </div>
            <div className="adstra-cta-edict">
              <Star className="adstra-edict-icon" />
              <span>Limited Imperial Seats Available - Destiny Awaits Your Call</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactUs;
