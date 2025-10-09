<template>
  <div class="mt-5">
    <div class="flex justify-center">
      <BotList class="max-w-xl" />
    </div>
    <Divider />
    <div
      title="Mabhirex logo"
      class="logo-container my-5 mx-auto sm:w-[250px] sm:h-[250px] w-[150px] h-[150px] transition-all duration-300 flex justify-center items-center"
    >
      <img
        src="../assets/mabhirex-logo.png"
        alt="Mabhirex Logo"
        class="max-w-full max-h-full object-contain"
      />
    </div>
    <h1 class="font-bold text-2xl sm:text-4xl mb-4 transition-all">Welcome to Mabhirex</h1>
    <div class="mb-4">Advanced Trading Platform - Powered by Intelligence</div>
    <Divider />
    <div class="max-w-2xl mx-auto mb-6">
      <h2 class="text-xl font-semibold mb-3">About Us</h2>
      <p class="mb-4 text-gray-700 dark:text-gray-300">
        At Mabhirex, we're revolutionizing the trading landscape with cutting-edge technology and
        intelligent automation. Our platform empowers traders with sophisticated tools and real-time
        insights to make informed decisions in dynamic markets.
      </p>
      <p class="mb-4 text-gray-700 dark:text-gray-300">
        Built on a foundation of advanced algorithms and machine learning, Mabhirex provides
        seamless trading experiences with robust risk management and comprehensive analytics.
        Whether you're a seasoned professional or just starting your trading journey, our platform
        adapts to your needs.
      </p>
      <p class="text-gray-700 dark:text-gray-300">
        Join thousands of traders who trust Mabhirex for their automated trading strategies and
        portfolio management.
      </p>
    </div>
    <Divider />
    <p class="mb-5">
      <i>Empowering your trading success - The Mabhirex Team</i>
    </p>
  </div>
</template>

<style lang="css" scoped>
.logo-container {
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.dark .logo-container {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
