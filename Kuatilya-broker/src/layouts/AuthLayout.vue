<script setup>
import { RouterView } from 'vue-router';
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
    <main class="">
        <RouterView/>
        <Toaster position="top-right"/>
    </main>
</template>

