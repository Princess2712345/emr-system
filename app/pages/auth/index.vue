<template>
  <div class="auth-index">
    <h1>Electronic Medical Records</h1>
    <div class="auth-links">
      <NuxtLink to="/auth/login" class="auth-btn">Login</NuxtLink>
      <span class="divider">or</span>
      <NuxtLink to="/auth/register" class="auth-btn outline">Register</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.auth-index {
  background: linear-gradient(135deg, #4da9ff, #ffffff);
  min-height: 100vh;
  display: flex;
  flex-direction: column;   
  justify-content: center;
  align-items: center;
  text-align: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.auth-index h1 {
  font-size: 2.8rem;
  margin-bottom: 2rem;
  color: #1e3a8a;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.auth-links {
  display: flex;            
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.4);
  padding: 1.5rem 2.5rem;
  border-radius: 50px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.auth-btn {
  font-size: 1.1rem;
  padding: 0.6rem 1.5rem;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  /* Primary Action Color */
  background-color: #2563eb;
  color: #ffffff;
}

.auth-btn:hover {
  background-color: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.auth-btn.outline {
  background-color: transparent;
  border: 2px solid #2563eb;
  color: #2563eb;
}

.auth-btn.outline:hover {
  background-color: #2563eb;
  color: #ffffff;
}

.divider {
  font-size: 1rem;
  color: #64748b; 
  font-weight: 400;
  margin: 0 0.5rem;
}

.black-header {
  background-color: #ffffff;
  padding: 0.8rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.black-header a {
  color: #1e293b; /* Deep slate */
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
}

.black-header a:hover {
  color: #2563eb;
}
</style>