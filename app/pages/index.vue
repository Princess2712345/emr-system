<script setup>
import "~/assets/styles.css";
</script>

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="glitter-text">Welcome to Electronic Medical Records</h1>
        <p class="sub-hero">Securely manage patient data, appointments, and medical history.</p>
        <NuxtLink to="/auth/login" class="cta-button">
          Get Started 
          <Icon name="lucide:arrow-right" class="arrow-icon" />
        </NuxtLink>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="feature-card">
        <div class="icon-wrapper">
          <Icon name="lucide:folder-heart" class="feature-icon" />
        </div>
        <h3>Digital Records</h3>
        <p>Access patient files anytime, anywhere with cloud-sync technology.</p>
      </div>

      <div class="feature-card">
        <div class="icon-wrapper">
          <Icon name="lucide:stethoscope" class="feature-icon" />
        </div>
        <h3>Doctor–Patient Care</h3>
        <p>Enhance consultations with precision data and real-time history.</p>
      </div>

      <div class="feature-card">
        <div class="icon-wrapper">
          <Icon name="lucide:hospital" class="feature-icon" />
        </div>
        <h3>Hospital Integration</h3>
        <p>Connect seamlessly with modern healthcare facility networks.</p>
      </div>

      <div class="feature-card">
        <div class="icon-wrapper">
          <Icon name="lucide:shield-check" class="feature-icon" />
        </div>
        <h3>Organized Files</h3>
        <p>Keep medical records structured within a secure, encrypted vault.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  font-family: 'Inter', 'Segoe UI', Roboto, sans-serif;
  background-image: url("/health.jpg");
  background-size: cover; 
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.hero {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
}

.hero-content h1 {
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 1.5rem;
  color: #ffffff; 
  letter-spacing: -0.02em;
  /* Glowing effect to match image_6b220e.jpg */
  text-shadow: 0 0 30px rgba(129, 171, 240, 0.6);
}

.sub-hero {
  font-size: 1.4rem;
  margin-bottom: 3rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  line-height: 1.5;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.cta-button {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  padding: 1.1rem 2.2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cta-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 30px -5px rgba(37, 99, 235, 0.6);
}

.arrow-icon {
  margin-left: 0.8rem;
  font-size: 1.4rem;
  transition: transform 0.3s ease;
}

.cta-button:hover .arrow-icon {
  transform: translateX(5px);
}

.features {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  padding: 6rem 2rem;
  /* Dark fade at bottom to help cards pop */
  background: linear-gradient(to top, rgba(15, 23, 42, 0.9), transparent); 
}

.feature-card {
  background: rgba(255, 255, 255, 0.08); 
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 3rem 1.5rem;
  width: 280px;
  text-align: center;
  transition: all 0.4s ease;
}

.icon-wrapper {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.feature-icon {
  font-size: 3rem;
  color: #60a5fa; 
  /* Realistic glow effect */
  filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.8));
}

.feature-card h3 {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: #ffffff;
  font-weight: 700;
}

.feature-card p {
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
}

.feature-card:hover {
  transform: translateY(-12px);
  background: rgba(255, 255, 255, 0.12);
  border-color: #3b82f6;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}
</style>