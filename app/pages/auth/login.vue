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

        <label for="login-password">Password</label>
        <div class="password-box">
          <input
            id="login-password"
            v-model="loginData.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Password"
            required
            autocomplete="current-password"
          />
          <button
            type="button"
            class="password-toggle"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            :aria-pressed="showPassword"
            @click.prevent="showPassword = !showPassword"
          >
            <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" />
          </button>
        </div>

        <label for="login-unique-id">{{ loginData.role === 'admin' ? 'Staff #' : 'MRN #' }}</label>
        <input
          id="login-unique-id"
          v-model="loginData.uniqueId"
          type="text"
          name="uniqueId"
          :placeholder="loginData.role === 'admin' ? 'STAFF-2026-000001' : 'MRN-2026-000001'"
          required
          autocomplete="off"
          spellcheck="false"
        />
        <p class="id-login-hint">
          Enter the {{ loginData.role === 'admin' ? 'Staff #' : 'MRN #' }} you received at registration.
          <button type="button" class="forgot-id-link" @click="openForgotModal">
            Forgot your {{ loginData.role === 'admin' ? 'Staff #' : 'MRN #' }}?
          </button>
        </p>
        <button type="submit">Sign In</button>

        <p class="register-text">
          Don't have an account? 
          <NuxtLink to="/auth/register">Register</NuxtLink>
        </p>
      </form>
    </div>

    <div v-if="isForgotOpen" class="forgot-overlay" @click.self="isForgotOpen = false">
      <div class="forgot-modal">
        <div class="forgot-header">
          <h3>Recover your {{ loginData.role === 'admin' ? 'Staff #' : 'MRN #' }}</h3>
          <button type="button" class="forgot-close" @click="isForgotOpen = false">
            <Icon name="lucide:x" />
          </button>
        </div>
        <p class="forgot-desc">
          Confirm your identity and an administrator will be notified to relay your
          {{ loginData.role === 'admin' ? 'Staff #' : 'MRN #' }}.
        </p>
        <form @submit.prevent="submitForgot" class="forgot-form">
          <label>Username or Email</label>
          <input v-model="forgotData.identifier" type="text" required placeholder="you@example.com" />

          <label>Last Name <span class="optional-tag">(optional)</span></label>
          <input v-model="forgotData.lastName" type="text" placeholder="Surname on record" />

          <p v-if="forgotMessage" class="forgot-feedback">{{ forgotMessage }}</p>

          <div class="forgot-actions">
            <button type="button" class="forgot-cancel" @click="isForgotOpen = false">Close</button>
            <button type="submit" class="forgot-submit" :disabled="forgotSending">
              {{ forgotSending ? 'Sending…' : 'Send request' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getHomeRouteForRole } from '~/utils/authSession'

const showPassword = ref(false)

const loginData = ref({
  username: '',
  password: '',
  uniqueId: '',
  role: 'patient' // Toggles between 'admin' and 'patient' via UI radio buttons
})

const isForgotOpen = ref(false)
const forgotSending = ref(false)
const forgotMessage = ref('')
const forgotData = ref({ identifier: '', lastName: '' })

const openForgotModal = () => {
  forgotMessage.value = ''
  forgotData.value = { identifier: '', lastName: '' }
  isForgotOpen.value = true
}

const submitForgot = async () => {
  forgotSending.value = true
  forgotMessage.value = ''
  try {
    const response = await $fetch('/api/auth/request-id', {
      method: 'POST',
      body: {
        identifier: forgotData.value.identifier.trim(),
        lastName: forgotData.value.lastName.trim(),
        role: loginData.value.role.toUpperCase()
      }
    })
    forgotMessage.value = response.message || 'Request sent to the administrator.'
  } catch (error) {
    forgotMessage.value = error.data?.statusMessage || 'Could not send your request. Please try again.'
  } finally {
    forgotSending.value = false
  }
}

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

    if (response.authenticated && response.user?.id && response.user?.role) {
      // Save session metadata globally
      localStorage.setItem('user_data', JSON.stringify(response.user))
      
      // Read the exact uppercase role returned directly from the successful database row
      const userRole = response.user.role.toUpperCase()
      await navigateTo(getHomeRouteForRole(userRole))
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
  max-width: 420px;
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
  overflow: visible;
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

.login-form > input:not([type="radio"]),
.password-box {
  width: 100%;
  box-sizing: border-box;
  background-color: rgba(255, 255, 255, 0.4);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
  z-index: 2;
  transition: all 0.2s ease;
}

.login-form > input:not([type="radio"]) {
  padding: 0.8rem 1rem;
  font-size: 1rem;
}

#login-unique-id {
  font-family: ui-monospace, 'Cascadia Code', 'Segoe UI Mono', monospace;
  letter-spacing: 0.02em;
}

.login-form > input:not([type="radio"]):focus,
.password-box:focus-within {
  outline: none;
  border-color: #3b82f6;
  background-color: rgba(255, 255, 255, 0.7);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.password-box {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0;
  overflow: hidden;
}

.password-box input {
  flex: 1;
  min-width: 0;
  width: 100%;
  border: none;
  background: transparent;
  padding: 0.8rem 2.75rem 0.8rem 1rem;
  font-size: 1rem;
  outline: none;
  box-sizing: border-box;
}

/* Hide browser built-in password reveal (stops double eye icon) */
.password-box input::-ms-reveal,
.password-box input::-ms-clear {
  display: none;
}

.password-box input::-webkit-credentials-auto-fill-button,
.password-box input::-webkit-textfield-decoration-container {
  visibility: hidden;
  pointer-events: none;
}

.password-toggle {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #475569;
  cursor: pointer;
  z-index: 3;
}

.password-toggle:hover {
  color: #1e40af;
  background: rgba(59, 130, 246, 0.1);
}

.id-login-hint {
  margin: -0.6rem 0 0;
  font-size: 0.75rem;
  color: #64748b;
  z-index: 1;
  text-align: left;
}

.forgot-id-link {
  display: inline;
  background: none;
  border: none;
  padding: 0;
  margin-left: 0.25rem;
  color: #1e40af;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
}

.forgot-id-link:hover {
  color: #1d4ed8;
}

/* Forgot ID modal */
.forgot-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}

.forgot-modal {
  background: #fff;
  width: 100%;
  max-width: 420px;
  border-radius: 18px;
  padding: 1.75rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  text-align: left;
}

.forgot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.forgot-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #1e3a8a;
}

.forgot-close {
  border: none;
  background: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  padding: 4px;
}

.forgot-desc {
  margin: 0 0 1.25rem;
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.5;
}

.forgot-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.forgot-form label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: -0.75rem;
}

.optional-tag {
  font-weight: 500;
  color: #94a3b8;
  font-size: 0.75rem;
}

.forgot-form input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.7rem 0.9rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
}

.forgot-form input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.forgot-feedback {
  margin: 0;
  font-size: 0.82rem;
  color: #047857;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
}

.forgot-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.25rem;
}

.forgot-cancel {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.forgot-submit {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 0.6rem 1.1rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.forgot-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-form button[type="submit"] {
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

.login-form button[type="submit"]:hover {
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

  .login-form button[type="submit"] {
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