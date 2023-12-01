<template>
  <ul class="site-menu">
    <li class="toggle-theme" @click="toggleTheme" >
      <span class="i-carbon-sun color-black dark:i-carbon-moon dark:color-white"></span>
    </li>
    <li>
      <a href="https://github.com/yangfuzhang" target="_blank">
        <span class="i-carbon-logo-github color-black dark:color-white"></span>
      </a>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"

const isDark = ref(true)
const svgColor = computed(() => {
  return isDark.value ? "#ffffff" : "#000000"
})

const toggleTheme = () => {
  document.documentElement.classList.toggle("dark")
  isDark.value =!isDark.value
  localStorage.setItem("theme", isDark.value ? "dark" : "light")
}

onMounted(() => {
  const theme = (() => {
    if (typeof localStorage !== "undefined" && localStorage.getItem("theme")) {
      return localStorage.getItem("theme");
    }
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  })();

  isDark.value = theme === "dark";
})
</script>

<style lang="less">
 .site-menu {
  display: flex;
  align-items: center;
  gap: 12px;

  li {
    list-style: none;
    cursor: pointer;
    opacity: 0.8;
    transition: all 0.2s ease-in;

    &:hover {
      opacity: 1;
    }
  }
}
</style>