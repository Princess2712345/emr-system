<template>
  <div class="register-page">
    <div class="register-content">
      <h2>Electronic Medical Records Registration</h2>
      <form @submit.prevent="handleRegister" class="register-form">
        
        <div class="role-identifier">
          <label class="radio-container">
            <input type="radio" v-model="role" value="admin" name="role">
            <span class="checkmark"></span> Admin
          </label>
          <label class="radio-container">
            <input type="radio" v-model="role" value="patient" name="role">
            <span class="checkmark"></span> Patient
          </label>
        </div>

        <label for="firstName">First Name</label>
        <input id="firstName" v-model="firstName" type="text" required />

        <label for="middleName">Middle Name</label>
        <input id="middleName" v-model="middleName" type="text" placeholder="(Optional)" />

        <label for="lastName">Last Name</label>
        <input id="lastName" v-model="lastName" type="text" required />

        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" required />

        <label>Security Credentials</label>
        <div class="password-wrapper">
          <input v-model="password" type="password" placeholder="Password" required />
          <div class="unique-id-section">
            <span class="id-prefix">{{ role === 'admin' ? 'Staff #' : 'MRN #' }}</span>
            <input v-model="uniqueId" type="text" placeholder="0000" class="id-input" required />
          </div>
        </div>

        <button type="submit">Sign Up</button>

        <p class="login-link">
          Already have an account? 
          <router-link to="/auth/login">Login</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const firstName = ref('')
const middleName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const uniqueId = ref('') 
const role = ref('patient')

function handleRegister() {
  if (firstName.value && lastName.value && email.value && password.value && uniqueId.value) {
    // Logic for registration goes here
    router.push('/dashboard')
  }
}
</script>

<style scoped>
.register-page {
  font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-image: url("/health.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  /* Darkened blend mode to help the white text and glass elements pop */
  background-color: rgba(0, 0, 0, 0.25);
  background-blend-mode: overlay;
  color: #1e293b;
}

.register-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center; 
  align-items: center;     
  text-align: center;
  padding: 2rem;
}

.register-content h2 {
  font-size: 2.2rem;
  margin-bottom: 2rem;
  color: #ffffff; 
  font-weight: 800;
  letter-spacing: -0.5px;
  /* Stronger shadow for bright background */
  text-shadow: 0 4px 6px rgba(0,0,0,0.4);
}

.register-form {
  max-width: 380px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  
  /* --- ADVANCED GLASSMORPHISM STYLES (Ice/Premium Effect) --- */
  
  /* 1. Translucent Base with a slight cool tint */
  background: rgba(255, 255, 255, 0.5); 
  
  /* 2. Heavy Background Blur */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  
  /* 3. The 'Premium Edge' (Beveled look) */
  /* Top/Left are bright highlight; Bottom/Right are slight shadow */
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-right-color: rgba(255, 255, 255, 0.2);
  border-bottom-color: rgba(255, 255, 255, 0.2);
  
  /* 4. Rounded Corners (like polished glass) */
  border-radius: 24px;
  
  /* 5. Realistic Shadow (Diffuse + Contact shadow) */
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 25px 50px -12px rgba(0, 0, 0, 0.15),
    inset 0 0 10px rgba(255, 255, 255, 0.1); /* Subtle inner light */

  padding: 3rem; /* Slightly more padding for the premium feel */
  position: relative;
  overflow: hidden;
}

/* Glass Shine Overlay (pseudo-element) */
.register-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* Creates the iridescent surface reflections seen in the reference image */
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.0) 40%,
    rgba(100, 200, 255, 0.05) 60%, /* Subtle blue refraction */
    rgba(255, 255, 255, 0.1) 100%
  );
  pointer-events: none; /* Make sure it doesn't block inputs */
}

.role-identifier {
  display: flex;
  justify-content: space-around;
  margin-bottom: 0.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 1; /* Keep content above shine */
}

.radio-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  color: #1e3a8a;
  gap: 0.5rem;
  z-index: 1;
}

.register-form label {
  text-align: left;
  font-weight: 600;
  font-size: 0.85rem;
  color: #334155;
  margin-bottom: -0.8rem; 
  text-transform: uppercase;
  letter-spacing: 0.05em;
  z-index: 1;
}

/* Inputs that feel integrated into the glass surface */
.register-form input:not(.id-input):not([type="radio"]):not([type="password"]),
.password-wrapper {
  background-color: rgba(255, 255, 255, 0.4) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.password-wrapper {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.2s ease;
  z-index: 1;
}

.password-wrapper:focus-within {
  border-color: #2563eb;
  background-color: rgba(255, 255, 255, 0.7);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.password-wrapper input[type="password"] {
  border: none;
  background: transparent;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  outline: none;
}

.unique-id-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: rgba(226, 232, 240, 0.3);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 1;
}

.id-prefix {
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
}

.id-input {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  width: 80px;
  padding: 2px 8px;
  font-size: 0.85rem;
  font-family: monospace;
  outline: none;
  background: rgba(255, 255, 255, 0.5);
}

.register-form input:not(.id-input):not([type="radio"]):not([type="password"]) {
  padding: 0.8rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  z-index: 1;
}

.register-form input:focus:not(.id-input) {
  outline: none;
  border-color: #2563eb;
  background-color: rgba(255, 255, 255, 0.7);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.register-form button {
  background-color: #2563eb;
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  z-index: 1;
}

.register-form button:hover {
  background-color: #059669; 
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.3);
}

.register-form button:active {
  transform: translateY(0);
}

.login-link {
  margin-top: 1.2rem;
  font-size: 0.9rem;
  color: #334155;
  z-index: 1;
}

.login-link a {
  color: #1e40af;
  text-decoration: none;
  font-weight: 700;
  margin-left: 0.3rem;
  transition: color 0.2s ease;
}

.login-link a:hover {
  color: #1e3a8a;
  text-decoration: underline;
}
</style>