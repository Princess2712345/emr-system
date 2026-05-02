<script>
import "~/assets/styles.css";
</script>

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Welcome to Electronic Medical Records</h1>
        <p>Securely manage patient data, appointments, and medical history.</p>
        <NuxtLink to="/auth/login" class="cta-button">
          Get Started <span class="arrow-icon">➔</span>
        </NuxtLink>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="feature-card">
        <h3>Digital Records</h3>
        <p>Access patient files anytime, anywhere.</p>
      </div>
      <div class="feature-card">
        <h3>Doctor–Patient Care</h3>
        <p>Enhance consultations with accurate data.</p>
      </div>
      <div class="feature-card">
        <h3>Hospital Integration</h3>
        <p>Connect seamlessly with healthcare facilities.</p>
      </div>
      <div class="feature-card">
        <h3>Organized Files</h3>
        <p>Keep medical records structured and secure.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: linear-gradient(135deg, #4da9ff, #ffffff); 
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: #1e293b; 
}

/* Hero Section */
.hero {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
}

.hero-content h1 {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.hero-content p {
  font-size: 1.25rem;
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  color: #f0f9ff; 
}

.cta-button {
  background-color: #4f46e5;
  color: #ffffff;
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.39);
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
}

.cta-button:hover {
  background-color: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.23);
}

/* Arrow styling */
.arrow-icon {
  margin-left: 0.5rem;
  font-size: 1.2rem;
  color: #ffffff; /* default arrow color */
  transition: color 0.3s ease;
}

.cta-button:hover .arrow-icon {
  color: #ffcc00; /* arrow changes color on hover */
}

/* Features Section */
.features {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  padding: 4rem 2rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 2rem 1.5rem;
  width: 260px;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.feature-card h3 {
  font-size: 1.3rem;
  margin-bottom: 0.75rem;
  color: #1e3a8a; 
}

.feature-card p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #475569; 
}

.feature-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
</style>
