<template>
  <div class="register-page">
    <div class="register-content">
      <h2>Electronic Medical Records Registration</h2>
      <form @submit.prevent="handleRegister" class="register-form">
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

        <label for="password">Password</label>
        <input id="password" v-model="password" type="password" required />

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

function handleRegister() {
  if (firstName.value && lastName.value && email.value && password.value) {
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

.register-form label {
  text-align: left;
  font-weight: 600;
  font-size: 0.85rem;
  color: #475569;
  margin-bottom: -0.8rem; 
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.register-form input {
  padding: 0.8rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f8fafc;
  transition: all 0.2s ease;
}

.register-form input:focus {
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