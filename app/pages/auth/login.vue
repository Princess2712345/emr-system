<template>
  <div class="login-page">
    <div class="login-content">
      <h2>Electronic Medical Records Login</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="role-identifier">
          <label class="radio-container">
            <input type="radio" v-model="loginData.role" value="admin" name="role">
            <span class="checkmark"></span> Admin
          </label>
          <label class="radio-container">
            <input type="radio" v-model="loginData.role" value="patient" name="role">
            <span class="checkmark"></span> Patient
          </label>
        </div>

        <label>Username</label>
        <input v-model="loginData.username" type="text" required />

        <label>Security Credentials</label>
        <div class="password-wrapper">
          <input v-model="loginData.password" type="password" placeholder="Password" required />
          <div class="unique-id-section">
            <span class="id-prefix">{{ loginData.role === 'admin' ? 'Staff #' : 'MRN #' }}</span>
            <input v-model="loginData.uniqueId" type="text" placeholder="0000" class="id-input" required />
          </div>
        </div>
        <button type="submit">Sign In</button>

        <p class="register-text">
          Don't have an account? 
          <NuxtLink to="/auth/register">Register</NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const loginData = ref({
  username: '',
  password: '',
  uniqueId: '',
  role: 'patient' // Toggles between 'admin' and 'patient' via UI radio buttons
})

const handleLogin = async () => {
  try {
    // Clean up inputs and explicitly map to match backend expectations
    const payload = {
      username: loginData.value.username.trim(),
      password: loginData.value.password,
      uniqueId: loginData.value.uniqueId.trim(),
      // Force uppercase ('ADMIN' or 'PATIENT') to match database rules perfectly
      role: loginData.value.role.toUpperCase() 
    }

    // Relative path call prevents connection refusal errors safely
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: payload
    })

    if (response.authenticated && response.user) {
      // Save session metadata globally
      localStorage.setItem('user_data', JSON.stringify(response.user))
      
      // Read the exact uppercase role returned directly from the successful database row
      const userRole = response.user.role ? response.user.role.toUpperCase() : 'PATIENT'

      // Clean role-based routing layout
      if (userRole === 'PATIENT') {
        await navigateTo('/patient') 
      } else if (['ADMIN', 'HR', 'REGISTRAR'].includes(userRole)) {
        await navigateTo('/dashboard')
      } else {
        await navigateTo('/dashboard')
      }
    }
  } catch (error) {
    console.error('Authentication processing failure:', error)
    // Safely reads the custom error status message thrown from your backend handler
    alert(error.data?.statusMessage || 'Invalid Username, Password, or ID.')
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
  /* Use dvh for better mobile browser support */
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.25);
  background-blend-mode: overlay;
  color: #1e293b;
  overflow-y: auto;
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
  color: #ffffff;
  letter-spacing: -0.5px;
  text-shadow: 0 4px 6px rgba(0,0,0,0.4);
}

.login-form {
  max-width: 360px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  background: rgba(255, 255, 255, 0.5); 
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-right-color: rgba(255, 255, 255, 0.2);
  border-bottom-color: rgba(255, 255, 255, 0.2);
  padding: 2.5rem;
  border-radius: 24px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.login-form::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.0) 40%, rgba(100, 200, 255, 0.05) 60%, rgba(255, 255, 255, 0.1) 100%);
  pointer-events: none;
}

.role-identifier {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 1;
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

.login-form label {
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  color: #334155;
  margin-bottom: -0.8rem;
  z-index: 1;
}

.password-wrapper,
.login-form input[type="text"]:not(.id-input) {
  background-color: rgba(255, 255, 255, 0.4) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  z-index: 1;
}

.password-wrapper {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.2s ease;
}

.password-wrapper:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background-color: rgba(255, 255, 255, 0.7) !important;
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
}

.id-prefix {
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
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

.login-form input[type="text"]:not(.id-input) {
  padding: 0.8rem 1rem;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.login-form input:focus:not(.id-input) {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background-color: rgba(255, 255, 255, 0.7) !important;
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
  z-index: 1;
}

.login-form button:hover {
  background-color: #059669; 
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.3);
}

.register-text {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #334155;
  z-index: 1;
}

.register-text a {
  color: #1e40af;
  text-decoration: none;
  font-weight: 700;
}

.register-text a:hover {
  text-decoration: underline;
}

/* --- Responsive Media Queries --- */

@media (max-width: 768px) {
  .login-content {
    padding: 1.25rem;
    align-items: center;
  }
  .login-form {
    width: 100%;
    max-width: 420px;
  }
}

@media (max-width: 480px) {
  .login-content {
    padding: 1rem;
    justify-content: flex-start;
    padding-top: 10vh;
  }

  .login-content h2 {
    font-size: 1.6rem;
    margin-bottom: 1.5rem;
  }

  .login-form {
    width: 95%;
    padding: 1.5rem;
    gap: 1rem;
    border-radius: 18px;
  }

  .role-identifier {
    margin-bottom: 0.5rem;
    padding-bottom: 0.8rem;
  }

  .radio-container {
    font-size: 0.85rem;
  }

  .id-input {
    width: 65px;
  }

  .login-form button {
    padding: 0.75rem;
  }
}

/* Landscape/Short Screen handling */
@media (max-height: 650px) {
  .login-content {
    padding-top: 2rem;
    justify-content: flex-start;
  }
  .login-content h2 {
    margin-bottom: 1rem;
    font-size: 1.4rem;
  }
  .login-form {
    padding: 1.2rem 1.5rem;
  }
}
</style>