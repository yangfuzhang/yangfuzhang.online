<template>
  <ul class="site-menu">
    <li class="toggle-theme" @click="toggleTheme" v-if="isDark">
      <svg xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 32 32">
            <path :fill="svgColor" d="M14.98 3a1.002 1.002 0 0 0-.175.016a13.096 13.096 0 0 0 1.825 25.981c.164.006.328 0 .49 0a13.072 13.072 0 0 0 10.703-5.555a1.01 1.01 0 0 0-.783-1.565A13.08 13.08 0 0 1 15.89 4.38A1.015 1.015 0 0 0 14.98 3Z"/>
      </svg>
    </li>
    <li class="toggle-theme" @click="toggleTheme" v-else>
      <svg xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 32 32">
           <path :fill="svgColor" d="M15 2h2v5h-2zm6.688 6.9l3.506-3.506l1.414 1.414l-3.506 3.506zM25 15h5v2h-5zm-3.312 8.1l1.414-1.413l3.506 3.506l-1.414 1.414zM15 25h2v5h-2zm-9.606.192L8.9 21.686l1.414 1.414l-3.505 3.506zM2 15h5v2H2zm3.395-8.192l1.414-1.414L10.315 8.9L8.9 10.314zM16 12a4 4 0 1 1-4 4a4.005 4.005 0 0 1 4-4m0-2a6 6 0 1 0 6 6a6 6 0 0 0-6-6Z"/>
      </svg>
    </li>
    <li>
      <a href="https://github.com/yangfuzhang" target="_blank">
        <svg xmlns="http://www.w3.org/2000/svg"
             width="20"
             height="20"
             viewBox="0 0 32 32">
             <path :fill="svgColor" fill-rule="evenodd" d="M16 2a14 14 0 0 0-4.43 27.28c.7.13 1-.3 1-.67v-2.38c-3.89.84-4.71-1.88-4.71-1.88a3.71 3.71 0 0 0-1.62-2.05c-1.27-.86.1-.85.1-.85a2.94 2.94 0 0 1 2.14 1.45a3 3 0 0 0 4.08 1.16a2.93 2.93 0 0 1 .88-1.87c-3.1-.36-6.37-1.56-6.37-6.92a5.4 5.4 0 0 1 1.44-3.76a5 5 0 0 1 .14-3.7s1.17-.38 3.85 1.43a13.3 13.3 0 0 1 7 0c2.67-1.81 3.84-1.43 3.84-1.43a5 5 0 0 1 .14 3.7a5.4 5.4 0 0 1 1.44 3.76c0 5.38-3.27 6.56-6.39 6.91a3.33 3.33 0 0 1 .95 2.59v3.84c0 .46.25.81 1 .67A14 14 0 0 0 16 2Z"/>
        </svg>
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