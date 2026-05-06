<template>
  <div class="register-page">
    <div class="register-content">
      <h2>Electronic Medical Records Registration</h2>
      <form @submit.prevent="handleRegister" class="register-form">
        
        <!-- Role Selection (Added to match login logic) -->
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

        <!-- Name Fields -->
        <label for="firstName">First Name</label>
        <input id="firstName" v-model="firstName" type="text" required />

        <label for="middleName">Middle Name</label>
        <input id="middleName" v-model="middleName" type="text" placeholder="(Optional)" />

        <label for="lastName">Last Name</label>
        <input id="lastName" v-model="lastName" type="text" required />

        <!-- Contact & Security -->
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" required />

        <label>Security Credentials</label>
        <!-- Start: Unique ID inside Password Area (Updated to match login) -->
        <div class="password-wrapper">
          <input v-model="password" type="password" placeholder="Password" required />
          <div class="unique-id-section">
            <span class="id-prefix">{{ role === 'admin' ? 'Staff #' : 'MRN #' }}</span>
            <input v-model="uniqueId" type="text" placeholder="0000" class="id-input" required />
          </div>
        </div>
        <!-- End: Unique ID inside Password Area -->

        <button type="submit">Sign Up</button>
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
const uniqueId = ref('') // Added to match login
const role = ref('patient') // Added to match login

function handleRegister() {
  if (firstName.value && lastName.value && email.value && password.value && uniqueId.value) {
    // Logic for registration goes here
    router.push('/dashboard')
  }
}
</script>

<style scoped>
/* Keeping your original layout styles */
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
  color: #1e3a8a; 
  font-weight: 800;
  letter-spacing: -0.5px;
}

.register-form {
  max-width: 380px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  background: rgba(255, 255, 255, 0.95); 
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Role Identifier (Same as Login) */
.role-identifier {
  display: flex;
  justify-content: space-around;
  margin-bottom: 0.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.radio-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  color: #1e3a8a;
  gap: 0.5rem;
}

.register-form label {
  text-align: left;
  font-weight: 600;
  font-size: 0.85rem;
  color: #475569;
  margin-bottom: -0.8rem; 
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Updated Password + ID Container (Same as Login) */
.password-wrapper {
  display: flex;
  flex-direction: column;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background-color: #f8fafc;
  overflow: hidden;
  transition: all 0.2s ease;
}

.password-wrapper:focus-within {
  border-color: #2563eb;
  background-color: #ffffff;
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
  border-top: 1px solid #e2e8f0;
}

.id-prefix {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
}

.id-input {
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  width: 80px;
  padding: 2px 8px;
  font-size: 0.85rem;
  font-family: monospace;
  outline: none;
}

/* Original input styles for standard fields */
.register-form input:not(.id-input):not([type="radio"]):not([type="password"]) {
  padding: 0.8rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f8fafc;
  transition: all 0.2s ease;
}

.register-form input:focus:not(.id-input) {
  outline: none;
  border-color: #2563eb;
  background-color: #ffffff;
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
}

.register-form button:hover {
  background-color: #059669; 
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.3);
}

.register-form button:active {
  transform: translateY(0);
}
</style>