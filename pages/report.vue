<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Генерация диаграммы</h1>

    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label class="block font-medium">Названия секторов (через запятую):</label>
        <textarea v-model="sectorInput" class="w-full p-2 border rounded" rows="3" placeholder="UI Модуля, Сервисы, АИС"></textarea>
      </div>

      <div>
        <label class="block font-medium">Значения (через запятую):</label>
        <input v-model="valueInput" class="w-full p-2 border rounded" placeholder="100,80,60" />
      </div>

      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Сгенерировать диаграмму
      </button>
    </form>

    <div v-if="imageUrl" class="mt-6">
      <img :src="imageUrl" alt="График" class="max-w-full border rounded" />
      <a :href="imageUrl" download="diagram.png" class="mt-2 inline-block text-blue-600 underline">Скачать PNG</a>
    </div>

    <div v-if="error" class="text-red-600 mt-4">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const sectorInput = ref('')
const valueInput = ref('')
const imageUrl = ref('')
const error = ref('')

const submitForm = async () => {
  error.value = ''
  imageUrl.value = ''

  const sectors = sectorInput.value.split(',').map(s => s.trim())
  const values = valueInput.value.split(',').map(v => parseInt(v.trim()))

  const form = new FormData()
  form.append('sectors', JSON.stringify(sectors))
  form.append('values', JSON.stringify(values))

  try {
    const res = await fetch('http://localhost:8000/generate-report', {
      method: 'POST',
      body: form
    })

    if (!res.ok) {
      const err = await res.json()
      error.value = err.error || 'Ошибка при генерации отчета'
      return
    }

    const blob = await res.blob()
    imageUrl.value = URL.createObjectURL(blob)
  } catch (e) {
    error.value = 'Сервер недоступен'
  }
}
</script>