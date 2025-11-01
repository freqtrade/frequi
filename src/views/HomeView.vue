<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-container">
        <div class="hero-content">
          <div class="logo-section">
            <img
              src="../assets/mabhirex-logo.png"
              alt="MabhirexAI Logo"
              class="logo"
            />
          </div>

          <h2 class="hero-title">
            AI-Powered Trading<br>
            <span class="highlight">Unmatched Performance</span>
          </h2>

          <p class="hero-description">
            Leverage our advanced algorithms and machine learning to automate your strategies, and maximize your returns
          </p>

          <div class="cta-buttons">
            <Button
              class="btn-primary"
              size="large"
              @click="$router.push('/trade')"
            >
              Get Started Now
            </Button>
            <Button
              class="btn-secondary"
              variant="outlined"
              size="large"
              @click="scrollToHowItWorks"
            >
              How It Works
            </Button>
          </div>

          <!-- Bot Management Section -->
          <div class="bot-management-section">
            <h3 class="bot-section-title">Manage Your Bots</h3>
            <div class="bot-management-container">
              <BotList />
              <div class="bot-add-section">
                <LoginModal login-text="Add New Bot" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">An All-in-One Trading Co-pilot</h2>
        
        <div class="features-grid">
          <div class="feature">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
              </svg>
            </div>
            <h3 class="feature-title">Intelligent Automation</h3>
            <p class="feature-description">
              Deploy our pre-built AI strategies or design your own. Let our bots trade any market 24/7
            </p>
          </div>
          
          <div class="feature">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.1 16,12.7V16.2C16,16.8 15.4,17.3 14.8,17.3H9.2C8.6,17.3 8,16.8 8,16.2V12.7C8,12.1 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,8.7 10.4,10V11.5H13.6V10C13.6,8.7 12.8,8.2 12,8.2Z"/>
              </svg>
            </div>
            <h3 class="feature-title">Robust Risk Management</h3>
            <p class="feature-description">
              Protect your capital with advanced stop-loss, real-time drawdown data feeds and constant risk analytics
            </p>
          </div>
          
          <div class="feature">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
              </svg>
            </div>
            <h3 class="feature-title">Real-Time Insights</h3>
            <p class="feature-description">
              Select informed capital with AI-command stop-loss, or build your own elite and comprehensive back testing
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" class="how-it-works">
      <div class="container">
        <h2 class="section-title how-it-works-title">How It Works</h2>
        
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3 class="step-title">Connect Your Exchange via API</h3>
              <p class="step-description">Ready to trade easy</p>
            </div>
          </div>
          
          <div class="step-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
            </svg>
          </div>
          
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3 class="step-title">Choose Your Strategy</h3>
              <p class="step-description">Fine-tune strategy editor</p>
            </div>
          </div>
          
          <div class="step-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
            </svg>
          </div>
          
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3 class="step-title">Deploy AI in Action</h3>
              <p class="step-description">Display & Monitor</p>
            </div>
          </div>
        </div>
      </div>
    </section>


    <!-- Footer Section -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
      <img
        src="../assets/mabhirex-logo.png"
              alt="MabhirexAI Logo"
              class="footer-logo"
            />
            <h3 class="footer-title">MabhirexAI</h3>
            <p class="footer-tagline">AI-Powered Trading Platform</p>
          </div>
          
          <div class="footer-links">
            <div class="footer-column">
              <h4 class="footer-heading">Platform</h4>
              <ul class="footer-list">
                <li><a href="/trade" class="footer-link">Trading</a></li>
                <li><a href="/dashboard" class="footer-link">Dashboard</a></li>
                <li><a href="/graph" class="footer-link">Charts</a></li>
                <li><a href="/logs" class="footer-link">Logs</a></li>
              </ul>
            </div>
            
            
            <div class="footer-column">
              <h4 class="footer-heading">Support</h4>
              <ul class="footer-list">
                <li><a href="#" class="footer-link">Documentation</a></li>
                <li><a href="#" class="footer-link">API Reference</a></li>
                <li><a href="#" class="footer-link">Community</a></li>
                <li><a href="#" class="footer-link">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <div class="footer-bottom-content">
            <p class="footer-copyright">© 2025 MabhirexAI. All rights reserved.</p>
            <div class="footer-social">
              <a href="#" class="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" class="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.36-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" class="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
    </div>
    </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import BotList from '@/components/BotList.vue';
import LoginModal from '@/components/LoginModal.vue';

const scrollToHowItWorks = () => {
  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
};
</script>

<style lang="css" scoped>
/* Clean, Professional Design System with Crypto Font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

.landing-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #1a1a1a;
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 4rem 0;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%),
    linear-gradient(0deg, transparent 0%, rgba(251, 191, 36, 0.05) 50%, transparent 100%);
  animation: tradingPulse 8s ease-in-out infinite;
}

@keyframes tradingPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;
}

.hero-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.logo-section {
  margin-bottom: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  width: 250px;
  height: 250px;
  object-fit: contain;
  margin-bottom: 1rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.company-name {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e40af;
  margin: 0;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: #ffffff;
  letter-spacing: -0.03em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.highlight {
  color: #f59e0b;
}

.hero-description {
  font-size: 1.25rem;
  color: #cbd5e1;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%) !important;
  border: none !important;
  color: white !important;
  padding: 1rem 2rem !important;
  font-size: 1.1rem !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3) !important;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 20px rgba(30, 64, 175, 0.4) !important;
}

.btn-secondary {
  background: transparent !important;
  border: 2px solid #f59e0b !important;
  color: #f59e0b !important;
  padding: 1rem 2rem !important;
  font-size: 1.1rem !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.btn-secondary:hover {
  background: #f59e0b !important;
  color: #0f172a !important;
  transform: translateY(-2px) !important;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Features Section */
.features {
  padding: 6rem 0;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
}

.features::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(251, 191, 36, 0.05) 0%, transparent 50%);
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 4rem;
  color: #1a1a1a;
  letter-spacing: -0.02em;
  position: relative;
  z-index: 1;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  position: relative;
  z-index: 1;
}

.feature {
  text-align: center;
  padding: 2rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.feature::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  transition: left 0.5s ease;
}

.feature:hover::before {
  left: 100%;
}

.feature:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-color: #1e40af;
  background: rgba(255, 255, 255, 0.95);
}

.feature-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
  transition: all 0.3s ease;
}

.feature:hover .feature-icon {
  transform: scale(1.1);
  box-shadow: 0 8px 20px rgba(30, 64, 175, 0.4);
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.feature-description {
  color: #64748b;
  line-height: 1.6;
}

/* How It Works Section */
.how-it-works {
  padding: 6rem 0;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  position: relative;
}

.how-it-works::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(45deg, transparent 0%, rgba(59, 130, 246, 0.05) 50%, transparent 100%),
    linear-gradient(-45deg, transparent 0%, rgba(251, 191, 36, 0.05) 50%, transparent 100%);
}

.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 3rem;
  position: relative;
  z-index: 1;
}

.step-arrow {
  color: #f59e0b;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 1rem;
}

.step-arrow svg {
  width: 32px;
  height: 32px;
}

.how-it-works-title {
  color: #ffffff !important;
}

.step {
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  width: 280px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.step::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #1e40af, #3b82f6, #f59e0b);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.step:hover::before {
  transform: scaleX(1);
}

.step:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-color: #1e40af;
}

.step-number {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: #0f172a;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  transition: all 0.3s ease;
}

.step:hover .step-number {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
}

.step-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
}

.step-description {
  color: #64748b;
  font-size: 0.9rem;
}


/* Footer Section */
.footer {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #1a1a1a;
  padding: 4rem 0 2rem;
  position: relative;
}

.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(45deg, transparent 0%, rgba(59, 130, 246, 0.03) 50%, transparent 100%),
    linear-gradient(-45deg, transparent 0%, rgba(251, 191, 36, 0.03) 50%, transparent 100%);
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 3rem;
  margin-bottom: 3rem;
  position: relative;
  z-index: 1;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.footer-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-bottom: 1rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.footer-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  letter-spacing: -0.01em;
}

.footer-tagline {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.footer-column {
  display: flex;
  flex-direction: column;
}

.footer-heading {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.footer-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-list li {
  margin-bottom: 0.5rem;
}

.footer-link {
  color: #64748b;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #f59e0b;
}

.footer-bottom {
  border-top: 1px solid rgba(59, 130, 246, 0.1);
  padding-top: 2rem;
  position: relative;
  z-index: 1;
}

.footer-bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-copyright {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

.footer-social {
  display: flex;
  gap: 1rem;
}

.social-link {
  color: #64748b;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.social-link:hover {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .company-name {
    font-size: 2rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .steps {
    flex-direction: column;
  }
  
  .step-arrow {
    transform: rotate(90deg);
    margin: 1rem 0;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .footer-links {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .footer-bottom-content {
    flex-direction: column;
    text-align: center;
  }
}

/* Bot Management Section */
.bot-management-section {
  margin-top: 3rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  transition: all 0.3s ease;
}

.bot-management-section:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.3);
}

.bot-section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1.5rem;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.bot-management-container {
  background: rgba(0, 0, 0, 0.3);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.bot-management-container :deep(.p-button) {
  margin-top: 1rem;
}

.bot-add-section {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

.bot-add-section :deep(.p-button) {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%) !important;
  border: none !important;
  color: #0f172a !important;
  font-weight: 600 !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3) !important;
}

.bot-add-section :deep(.p-button:hover) {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4) !important;
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .logo {
    width: 80px;
    height: 80px;
  }

  .container {
    padding: 0 1rem;
  }

  .hero {
    padding: 2rem 0;
  }

  .bot-management-section {
    padding: 1rem;
    margin-top: 2rem;
  }
}
</style>
