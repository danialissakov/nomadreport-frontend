<template>
  <div class="bg-gray-50 min-h-screen text-gray-800 font-sans antialiased">
    <div class="container mx-auto p-4 md:p-8">
      
      <header class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 pb-2">
           Диаграммы для отчетов
        </h1>
      </header>

      <main class="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
          
          <!-- Left Column: Settings -->
          <div class="space-y-8">
            <div>
              <label for="reportType" class="block font-medium mb-2">Тип отчета</label>
              <select id="reportType" v-model="selectedType" @change="loadTemplate" class="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder-gray-400">
                <option value="">-- выберите тип отчета --</option>
                <option v-for="option in Object.keys(reportTemplates)" :key="option" :value="option">
                  {{ option }}
                </option>
                <option value="custom">Другое</option>
              </select>
            </div>

            <div v-if="selectedType === 'custom'">
              <label for="customTitle" class="block font-medium mb-2">Название отчета</label>
              <input id="customTitle" v-model="customTitle" type="text" class="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder-gray-400" placeholder="Например: Спецпроект Х" />
            </div>

            <div>
              <label for="chartColor" class="block font-medium mb-2">Выбор цвета</label>
              <input id="chartColor" v-model="color" type="color" class="w-24 h-12 p-1 border border-gray-300 rounded-lg cursor-pointer" />
            </div>
          </div>

          <!-- Right Column: Table -->
          <div v-if="sectors.length > 0" class="md:col-span-1">
            <h3 class="font-medium mb-2">Секторы диаграммы</h3>
            <div
              class="bg-white rounded-lg border border-gray-200 max-h-96 overflow-y-auto table-fade"
              :class="{ 'table-fade-bottom': showFade }"
              ref="tableWrapper"
              @scroll="checkFade"
            >
              <table class="w-full">
                <thead class="sticky top-0 bg-gray-50/95 backdrop-blur-sm">
                  <tr>
                    <th class="p-3 text-left text-sm font-semibold text-gray-500">Сектор</th>
                    <th class="p-3 text-left text-sm font-semibold text-gray-500 w-28">Процент</th>
                    <th class="p-3 text-right text-sm font-semibold text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in sectors" :key="index" class="border-t border-gray-100 hover:bg-gray-50/80">
                    <td class="p-1">
                      <input v-model="row.name" class="w-full p-2 bg-transparent border-none rounded-md focus:ring-1 focus:ring-orange-500 focus:bg-white" />
                    </td>
                    <td class="p-1">
                      <input v-model.number="row.value" type="number" min="0" max="100" class="w-full p-2 bg-transparent border-none rounded-md focus:ring-1 focus:ring-orange-500 focus:bg-white" />
                    </td>
                    <td class="p-2 text-right">
                      <button @click="removeRow(index)" class="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button @click="addRow" class="mt-4 w-full bg-orange-100/80 text-orange-800 border border-orange-200/80 px-4 py-2 rounded-lg hover:bg-orange-200/70 transition-colors">
              Добавить строку
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="mt-8 pt-8 border-t border-gray-100 text-center">
           <button @click="submitForm" class="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-8 py-3 rounded-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed" :disabled="!customTitle || sectors.length === 0 || loading">
              <span v-if="loading" class="spinner mr-2"></span>
              <span v-if="!loading">Сгенерировать диаграмму</span>
              <span v-else>Генерируем...</span>
           </button>
        </div>
      </main>

      <!-- Result -->
      <div v-if="imageUrl || loading" class="mt-12 bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
        <h2 class="text-2xl font-bold mb-6">Результат</h2>
        <template v-if="loading">
          <div class="flex flex-col items-center justify-center min-h-[120px]">
            <span class="spinner mb-4"></span>
            <span class="text-gray-500">Генерируем диаграмму...</span>
          </div>
        </template>
        <template v-else>
          <img :src="imageUrl" alt="Сгенерированная диаграмма" class="max-w-full mx-auto border-2 border-gray-200 rounded-lg shadow-md" />
          <a :href="imageUrl" download="diagram.png" class="mt-6 inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
            Скачать PNG
          </a>
        </template>
      </div>

      <!-- Error -->
      <div v-if="error" class="mt-8 max-w-2xl mx-auto bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-center">
        {{ error }}
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onMounted, nextTick } from 'vue'

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
const color = ref('#f97316')
const sectors = ref<Sector[]>([])
const imageUrl = ref('')
const error = ref('')
const loading = ref(false)

// Fade effect logic for table scroll
const tableWrapper = ref<HTMLElement | null>(null)
const showFade = ref(false)

const checkFade = () => {
  if (!tableWrapper.value) return
  const el = tableWrapper.value
  showFade.value = el.scrollHeight > el.clientHeight && el.scrollTop + el.clientHeight < el.scrollHeight - 1
}

onMounted(() => {
  nextTick(() => {
    checkFade()
    if (tableWrapper.value) {
      tableWrapper.value.addEventListener('scroll', checkFade)
    }
  })
})

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
  loading.value = true

  const names = sectors.value.map((s) => s.name.trim()).filter(Boolean)
  const values = sectors.value.map((s) => Number(s.value))

  if (!customTitle.value || names.length !== values.length) {
    error.value = 'Заполните все поля перед отправкой.'
    loading.value = false
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
      loading.value = false
      return
    }

    const blob = await res.blob()
    imageUrl.value = URL.createObjectURL(blob)
  } catch (e) {
    error.value = 'Сервер недоступен'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Fade effect for table scroll */
.table-fade {
  position: relative;
}
.table-fade-bottom::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 32px;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.9));
}
.spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid #f97316;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
  vertical-align: middle;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
