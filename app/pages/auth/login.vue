<template>
  <div class="login-page">
    <!-- Page Content -->
    <div class="login-content">
      <h2>Electronic Medical Records Login</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- User Role Identifier -->
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

        <label>Username</label>
        <input v-model="username" type="text" required />

        <label>Security Credentials</label>
        <!-- Start: Unique ID inside Password Area -->
        <div class="password-wrapper">
          <input v-model="password" type="password" placeholder="Password" required />
          <div class="unique-id-section">
            <span class="id-prefix">{{ role === 'admin' ? 'Staff #' : 'MRN #' }}</span>
            <input v-model="uniqueId" type="text" placeholder="0000" class="id-input" required />
          </div>
        </div>
        <!-- End: Unique ID inside Password Area -->

        <button type="submit">Sign In</button>

        <!-- Registration Link -->
        <p class="register-text">
          Don't have an account? 
          <NuxtLink to="/auth/register">Register</NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const uniqueId = ref('') // New unique identifier ref
const role = ref('admin') // Can be 'admin' or 'patient'

async function handleLogin() {
  // Added uniqueId check to the validation
  if (username.value && password.value && uniqueId.value) {
    if (role.value === 'patient') {
      await navigateTo('/patients')
    } else {
      await navigateTo('/dashboard')
    }
  }
}
</script>

<style scoped>
.login-page {
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

.login-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center; 
  align-items: center;     
  text-align: center;
  padding: 2rem;
}

.login-content h2 {
  font-size: 2.2rem;
  margin-bottom: 2rem;
  font-weight: 800;
  color: #1e3a8a;
  letter-spacing: -0.5px;
}

.login-form {
  max-width: 360px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.role-identifier {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
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

.login-form label {
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  color: #475569;
  margin-bottom: -0.8rem;
}

/* Updated Container for Password + ID */
.password-wrapper {
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #f8fafc;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.password-wrapper:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background-color: #ffffff;
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
  text-transform: uppercase;
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

/* Original input style for standard text fields */
.login-form input[type="text"]:not(.id-input) {
  padding: 0.8rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f8fafc;
}

.login-form input:focus:not(.id-input) {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background-color: #ffffff;
}

.login-form button {
  background-color: #2563eb;
  color: white;
  padding: 0.9rem;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
}

.login-form button:hover {
  background-color: #059669; 
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.3);
}

.register-text {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #64748b;
}

.register-text a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 700;
  transition: color 0.2s ease;
}

.register-text a:hover {
  color: #1d4ed8;
  text-decoration: underline;
}
</style>