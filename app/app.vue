<template>
  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Создание диаграммы по отчёту</h1>

    <!-- Тип отчета -->
    <div class="mb-4">
      <label class="block font-medium mb-1">Тип отчета:</label>
      <select v-model="selectedType" class="w-full p-2 border rounded" @change="loadTemplate">
        <option value="">-- выберите тип отчета --</option>
        <option v-for="option in Object.keys(reportTemplates)" :key="option" :value="option">
          {{ option }}
        </option>
        <option value="custom">Другое</option>
      </select>
    </div>

    <!-- Название отчета (если Другое) -->
    <div v-if="selectedType === 'custom'" class="mb-4">
      <label class="block font-medium mb-1">Название отчета:</label>
      <input v-model="customTitle" type="text" class="w-full p-2 border rounded" placeholder="Например: Спецпроект Х" />
    </div>

    <!-- Цвет -->
    <div class="mb-4">
      <label class="block font-medium mb-1">Цвет диаграммы:</label>
      <input v-model="color" type="color" class="w-16 h-10 border rounded" />
    </div>

    <!-- Таблица -->
    <div v-if="sectors.length > 0" class="mb-6">
      <table class="w-full border border-collapse">
        <thead>
          <tr class="bg-gray-200 text-left">
            <th class="p-2">Сектор</th>
            <th class="p-2">Процент</th>
            <th class="p-2">Действие</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in sectors" :key="index" class="border-t">
            <td class="p-2">
              <input v-model="row.name" class="w-full p-1 border rounded" />
            </td>
            <td class="p-2">
              <input v-model.number="row.value" type="number" min="0" max="100" class="w-full p-1 border rounded" />
            </td>
            <td class="p-2 text-center">
              <button @click="removeRow(index)" class="text-red-600 hover:underline">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
      <button @click="addRow" class="mt-2 bg-gray-200 px-4 py-1 rounded hover:bg-gray-300">
        Добавить строку
      </button>
    </div>

    <!-- Отправка -->
    <button
      @click="submitForm"
      class="bg-orange-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Сгенерировать диаграмму
    </button>

    <!-- Результат -->
    <div v-if="imageUrl" class="mt-6">
      <img :src="imageUrl" alt="График" class="max-w-full border rounded" />
      <a
  :href="imageUrl"
  download="diagram.png"
  class="mt-4 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-white shadow-md transition hover:bg-green-700 hover:shadow-lg"
>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
  </svg>
  Скачать PNG
</a>
    </div>

    <div v-if="error" class="text-red-600 mt-4">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Sector {
  name: string
  value: number
}

const reportTemplates: Record<string, string[]> = {
  'Модуль ОСРНС': ['UI Модуля', 'Сервисы', 'Калькуляторы в АИС', 'BPMN', 'Выпуск доп.соглашений', 'IT for IT', 'Печатные формы', 'Выпуск договора ', 'Транши', 'Филиалы', 'Автоандеррайтинг', 'Выпуск ЭСФ/АВР'],
  'ДПА': ['UI Модуля', 'Сервисы', 'ВНД дивиденды', 'АИС', 'BPMN', 'UI Дивиденды', 'Печатки дивиденды', 'Печатка доля участия', 'Печатка удержание', 'Интеграция с 1С дивиденды', 'Модуль выплат дивиденды'],
  'Заемщики': ['анализ БП', 'передача в Модуль актуариев', 'BPMN заключение', 'переход с НС на СЖ', 'мокап формы запроса', 'новые печатки', 'пролонгация'],
  'Пул перестрахования': ['Входящее бордеро (старый модуль)', 'Исходящее бордеро (старый модуль)', 'Перестрахование в УСС ', 'Входящее бордеро (новый модуль)', 'Исходящее бордеро (новый модуль)', 'ЕСБД', 'Печатные формы', 'BPMN', 'Проверка квазигос'],
  'ГОНС': ['UI', 'Сервисы', 'Калькуляторы в АИС', 'BPMN', 'Выпуск доп.соглашений', 'Печатные формы', 'Выпуск полиса/заявления онлайн', 'Оплата', 'Андеррайтинг'],
  'Madanes': ['Калькуляторы в АИС', 'UI', 'Сервисы', 'BPMN', 'Печатные формы', 'Оплата'],
  'CRM + Camunda(GONS) MVP': ['Docker', 'Front', 'UI/UX', 'MVP', 'Backend', 'Camunda', 'BPMN'],
  'Реинжиниринг интеграции между АИС и 1С': ['Дополнительный типа контрагента', 'Переход из XML на Json', 'Сервис по обмену контрагентов', 'Передача полиса и договоров в 1С'],
  'Рефакторинг 1С ': ['Предпроектное обследование', 'Анализ КП', 'Анализ блоков рефакторинга'],
  'Оптимизация банковского процессинга ': ['Сбор и анализ', 'Анализ тех. документаций FINAPI', 'Переговоры с BCC', 'Переход с банк-клиента на API']
}

const selectedType = ref('')
const customTitle = ref('')
const color = ref('#9b5de5')
const sectors = ref<Sector[]>([])
const imageUrl = ref('')
const error = ref('')

const loadTemplate = () => {
  if (selectedType.value === 'custom') {
    sectors.value = [{ name: '', value: 0 }]
    customTitle.value = ''
  } else {
    const names = reportTemplates[selectedType.value] ?? []
    sectors.value = names.map((name) => ({ name, value: 0 }))
    customTitle.value = selectedType.value
  }
}

const addRow = () => {
  sectors.value.push({ name: '', value: 0 })
}

const removeRow = (index: number) => {
  sectors.value.splice(index, 1)
}

const submitForm = async () => {
  error.value = ''
  imageUrl.value = ''

  const names = sectors.value.map((s) => s.name.trim()).filter(Boolean)
  const values = sectors.value.map((s) => Number(s.value))

  if (!customTitle.value || names.length !== values.length) {
    error.value = 'Заполните все поля перед отправкой.'
    return
  }

  const form = new FormData()
  form.append('sectors', JSON.stringify(names))
  form.append('values', JSON.stringify(values))
  form.append('color', color.value)
  form.append('title', customTitle.value)

  try {
    const res = await fetch('http://localhost:8000/generate-report', {
      method: 'POST',
      body: form
    })

    if (!res.ok) {
      const err = await res.json()
      error.value = err.error || 'Ошибка генерации'
      return
    }

    const blob = await res.blob()
    imageUrl.value = URL.createObjectURL(blob)
  } catch (e) {
    error.value = 'Сервер недоступен'
  }
}
</script>
