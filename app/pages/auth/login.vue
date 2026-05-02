<template>
  <div class="login-page">
    <!-- Back Button -->
    <div class="back-button">
      <NuxtLink to="/">←</NuxtLink>
    </div>

    <!-- Page Content -->
    <div class="login-content">
      <h2>Electronic Medical Records Login</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <label>Username</label>
        <input v-model="username" type="text" required />

        <label>Password</label>
        <input v-model="password" type="password" required />

        <button type="submit">Sign In</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')

function handleLogin() {
  if (username.value && password.value) {
    router.push('/dashboard')
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
.back-button {
  padding: 1.5rem;
  align-self: flex-start;
}
.back-button a {
  font-size: 1.8rem;
  color: #1e3a8a;
  text-decoration: none;
  transition: transform 0.2s ease;
  display: inline-block;
}
.back-button a:hover {
  transform: translateX(-5px);
  color: #2563eb;
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

.login-form label {
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  color: #475569;
  margin-bottom: -0.8rem;
}

.login-form input {
  padding: 0.8rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f8fafc;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.login-form input:focus {
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
  background-color: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
}

.login-form button:active {
  transform: translateY(0);
}
</style>
