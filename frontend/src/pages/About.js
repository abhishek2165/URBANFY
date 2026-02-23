import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import {
  FiAward, FiHeart, FiShield, FiTruck,
  FiStar, FiTarget, FiDroplet, FiUsers,
  FiArrowRight, FiCheckCircle, FiMapPin,
  FiPhone, FiMail, FiInstagram
} from 'react-icons/fi';
import './About.css';

// ============================================
// HERO SECTION
// ============================================
const AboutHero = () => {
  return (
    <section className="about-hero">
      <Container>
        <Row className="align-items-center about-hero-row">
          <Col lg={6}>
            <motion.div
              className="about-hero-text"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <motion.span
                className="hero-subtitle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                OUR STORY
              </motion.span>

              <motion.h1
                className="about-hero-title"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="accent-text">Fragrance</span> Has No Gender
              </motion.h1>

              <motion.p
                className="about-hero-description"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Welcome to the fragrance world of <strong>URBANFY PERFUMES</strong>.
                We believe scent is for everyone — and every fragrance should reflect
                your personality, your confidence, and your culture.
              </motion.p>

              <motion.div
                className="about-hero-btns"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link to="/perfumes" className="hero-cta-btn">
                  Explore Collection <FiArrowRight className="cta-arrow" />
                </Link>
              </motion.div>
            </motion.div>
          </Col>

          <Col lg={6}>
            <motion.div
              className="about-hero-image-wrapper"
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="about-hero-image-glow"></div>
              <img
                src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=700&fit=crop"
                alt="URBANFY Perfumes"
                className="about-hero-image"
              />
              {/* Floating Badge */}
              <motion.div
                className="about-floating-badge"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="badge-number">100%</span>
                <span className="badge-text">Authentic</span>
              </motion.div>
            </motion.div>
          </Col>
        </Row>
      </Container>

      {/* Decorations */}
      <div className="hero-decoration hero-dec-1"></div>
      <div className="hero-decoration hero-dec-2"></div>
    </section>
  );
};

// ============================================
// STATS SECTION
// ============================================
const StatsSection = () => {
  const stats = [
    { number: "17+", label: "Premium Products", icon: <FiDroplet /> },
    { number: "1000+", label: "Happy Customers", icon: <FiUsers /> },
    { number: "4.8★", label: "Average Rating", icon: <FiStar /> },
    { number: "100%", label: "Authentic Products", icon: <FiShield /> }
  ];

  return (
    <section className="stats-section">
      <Container>
        <Row>
          {stats.map((stat, index) => (
            <Col lg={3} md={6} key={index}>
              <motion.div
                className="stat-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
              >
                <div className="stat-icon">{stat.icon}</div>
                <h3 className="stat-number">{stat.number}</h3>
                <p className="stat-label">{stat.label}</p>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

// ============================================
// OUR STORY SECTION
// ============================================
const OurStory = () => {
  return (
    <section className="story-section section-padding">
      <Container>
        <Row className="align-items-center">
          <Col lg={6}>
            <motion.div
              className="story-image-wrapper"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=500&fit=crop"
                alt="URBANFY Story"
                className="story-image"
              />
              <div className="story-image-accent"></div>

              {/* Experience Badge */}
              <motion.div
                className="experience-badge"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <FiAward className="exp-icon" />
                <span className="exp-text">Maharashtrian Scent & Culture</span>
              </motion.div>
            </motion.div>
          </Col>

          <Col lg={6}>
            <motion.div
              className="story-content"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-tag">WHO WE ARE</span>
              <h2 className="section-title">History of URBANFY</h2>
              <div className="section-divider-left"></div>

              <p className="story-text">
                We started a perfume brand after dropping my <strong>M.Tech</strong> and
                <strong> Prajwal</strong> joined URBANFY with his existing job.
              </p>

              <p className="story-text">
                We started this brand because there is no Maharashtrian brand in the
                perfume industry who is ruling — and we want to rule the perfume industry
                with <strong>Maharashtrian scent & culture</strong>.
              </p>

              <p className="story-text">
                <strong>The story of 2 Civil Engineers becoming perfumers</strong> —
                <strong> Sameer & Prajwal</strong>.
              </p>

              <div className="story-highlights">
                <div className="story-highlight-item">
                  <FiCheckCircle className="highlight-icon" />
                  <span>Fragrance Has No Gender</span>
                </div>
                <div className="story-highlight-item">
                  <FiCheckCircle className="highlight-icon" />
                  <span>Inspired by Maharashtrian Scent & Culture</span>
                </div>
                <div className="story-highlight-item">
                  <FiCheckCircle className="highlight-icon" />
                  <span>Authentic & Premium Collection</span>
                </div>
                <div className="story-highlight-item">
                  <FiCheckCircle className="highlight-icon" />
                  <span>Built with Passion & Dedication</span>
                </div>
              </div>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

// ============================================
// OUR MISSION & VISION
// ============================================
const MissionVision = () => {
  return (
    <section className="mission-section section-padding">
      <Container>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">WHAT DRIVES US</span>
          <h2 className="section-title">Mission & Vision</h2>
          <div className="section-divider"></div>
        </motion.div>

        <Row className="g-4 mt-3">
          <Col lg={6}>
            <motion.div
              className="mission-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -8 }}
            >
              <div className="mission-icon-wrapper">
                <FiTarget className="mission-icon" />
              </div>
              <h3 className="mission-title">Our Mission</h3>
              <p className="mission-text">
                To build a fragrance brand that represents Maharashtra in the perfume industry —
                premium, authentic, and proudly rooted in our scent culture. We want every customer
                to feel confident and unique through our fragrances.
              </p>
              <div className="mission-features">
                <span><FiCheckCircle /> Authentic Fragrances</span>
                <span><FiCheckCircle /> Culture Inspired</span>
                <span><FiCheckCircle /> Customer First</span>
              </div>
            </motion.div>
          </Col>

          <Col lg={6}>
            <motion.div
              className="mission-card vision-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              whileHover={{ y: -8 }}
            >
              <div className="mission-icon-wrapper">
                <FiHeart className="mission-icon" />
              </div>
              <h3 className="mission-title">Our Vision</h3>
              <p className="mission-text">
                To become the most loved Maharashtrian fragrance brand and create a strong identity
                in the perfume industry. We aim to grow URBANFY as a trusted name across India while
                staying connected to our roots.
              </p>
              <div className="mission-features">
                <span><FiCheckCircle /> Trusted Brand</span>
                <span><FiCheckCircle /> Pan-India Reach</span>
                <span><FiCheckCircle /> Strong Identity</span>
              </div>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

// ============================================
// WHY CHOOSE US
// ============================================
const WhyChooseUs = () => {
  const features = [
    {
      icon: <FiAward />,
      title: "Premium Quality",
      description: "We focus on premium quality fragrances that feel luxurious and leave a strong lasting impression."
    },
    {
      icon: <FiTruck />,
      title: "Fast Delivery",
      description: "Quick and safe delivery across India so your fragrance reaches you fresh and secure."
    },
    {
      icon: <FiShield />,
      title: "Authentic Products",
      description: "Every product is carefully selected to ensure authenticity, quality, and trust."
    },
    {
      icon: <FiStar />,
      title: "Customer Satisfaction",
      description: "We build URBANFY with customer love, feedback, and long-term satisfaction in mind."
    },
    {
      icon: <FiDroplet />,
      title: "Long Lasting",
      description: "Fragrances designed for longevity — perfect for daily wear and special occasions."
    },
    {
      icon: <FiHeart />,
      title: "Made With Passion",
      description: "Built by Sameer & Prajwal — two civil engineers turned perfumers with a big dream."
    }
  ];

  return (
    <section className="about-why-section section-padding">
      <Container>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">WHY URBANFY</span>
          <h2 className="section-title">Why Choose Us</h2>
          <div className="section-divider"></div>
          <p className="section-subtitle">What makes URBANFY different</p>
        </motion.div>

        <Row className="g-4 mt-3">
          {features.map((feature, index) => (
            <Col lg={4} md={6} key={index}>
              <motion.div
                className="about-why-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
              >
                <div className="about-why-icon">{feature.icon}</div>
                <h4 className="about-why-title">{feature.title}</h4>
                <p className="about-why-description">{feature.description}</p>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

// ============================================
// OUR CATEGORIES
// ============================================
const OurCategories = () => {
  const categories = [
    {
      name: "Perfumes",
      description: "Premium perfumes made for long-lasting performance and a luxury feel.",
      image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&h=400&fit=crop",
      link: "/perfumes",
      count: "Explore Collection"
    },
    {
      name: "Attars",
      description: "Traditional attars inspired by rich Indian fragrance heritage.",
      image: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=500&h=400&fit=crop",
      link: "/attars",
      count: "Explore Collection"
    },
    {
      name: "Body Mists",
      description: "Fresh body mists for daily use — light, clean, and refreshing.",
      image: "https://images.unsplash.com/photo-1608528577891-eb055944f2e7?w=500&h=400&fit=crop",
      link: "/bodymists",
      count: "Explore Collection"
    }
  ];

  return (
    <section className="about-categories-section section-padding">
      <Container>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">WHAT WE OFFER</span>
          <h2 className="section-title">Our Categories</h2>
          <div className="section-divider"></div>
        </motion.div>

        <Row className="g-4 mt-3">
          {categories.map((cat, index) => (
            <Col lg={4} md={6} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
              >
                <Link to={cat.link} className="about-category-card">
                  <div className="about-category-image">
                    <img src={cat.image} alt={cat.name} />
                    <div className="about-category-overlay">
                      <span className="about-category-explore">
                        Explore <FiArrowRight />
                      </span>
                    </div>
                  </div>
                  <div className="about-category-info">
                    <h3>{cat.name}</h3>
                    <p>{cat.description}</p>
                    <span className="about-category-count">{cat.count}</span>
                  </div>
                </Link>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

// ============================================
// CTA BANNER
// ============================================
const CTABanner = () => {
  return (
    <section className="about-cta-section">
      <Container>
        <motion.div
          className="about-cta-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="banner-tag">WELCOME TO THE FRAGRANCE WORLD</span>
          <h2 className="about-cta-title">Ready to Find Your Signature Scent?</h2>
          <p className="about-cta-text">
            Explore URBANFY’s premium collection of perfumes, attars, and body mists.
            <strong> Fragrance has no gender</strong> — it’s for everyone.
          </p>
          <div className="about-cta-btns">
            <Link to="/perfumes" className="hero-cta-btn">
              Shop Now <FiArrowRight className="cta-arrow" />
            </Link>
            <Link to="/" className="btn-secondary-light">
              Back to Home
            </Link>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};

// ============================================
// CONTACT INFO SECTION
// ============================================
const ContactInfo = () => {
  return (
    <section className="about-contact-section section-padding">
      <Container>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-tag">GET IN TOUCH</span>
          <h2 className="section-title">Contact Us</h2>
          <div className="section-divider"></div>
          <p className="section-subtitle">We'd love to hear from you</p>
        </motion.div>

        <Row className="g-4 mt-3 justify-content-center">
          <Col lg={4} md={6}>
            <motion.div
              className="contact-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
            >
              <div className="contact-card-icon">
                <FiMapPin />
              </div>
              <h4>Visit Us</h4>
              <p>Sr.no 21, Sai Siddhi Chowk,<br />Ambegaon Pathar, Dhankwadi,<br />Pune - 411046</p>
            </motion.div>
          </Col>

          <Col lg={4} md={6}>
            <motion.div
              className="contact-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              whileHover={{ y: -8 }}
            >
              <div className="contact-card-icon">
                <FiPhone />
              </div>
              <h4>Call Us</h4>
              <p>
                <a href="tel:8999323926" className="contact-link">8999323926</a>
              </p>
              <p className="contact-timing">Mon - Sat, 10AM - 7PM</p>
            </motion.div>
          </Col>

          <Col lg={4} md={6}>
            <motion.div
              className="contact-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              whileHover={{ y: -8 }}
            >
              <div className="contact-card-icon">
                <FiMail />
              </div>
              <h4>Email Us</h4>
              <p>
                <a href="mailto:urbanfy.05@gmail.com" className="contact-link">urbanfy.05@gmail.com</a>
              </p>
              <a
                href="https://www.instagram.com/_urbanfyperfumes?igsh=eXhrZHZoY3FlZGcy"
                className="contact-social"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiInstagram /> Follow on Instagram
              </a>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

// ============================================
// MAIN ABOUT COMPONENT
// ============================================
const About = () => {
  useEffect(() => {
    document.title = "About Us - URBANFY PERFUMES";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page">
      <AboutHero />
      <StatsSection />
      <OurStory />
      <MissionVision />
      <WhyChooseUs />
      <OurCategories />
      <CTABanner />
      <ContactInfo />
    </div>
  );
};

export default About;
