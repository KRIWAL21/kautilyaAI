<script setup lang="ts">
import { ref } from "vue"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowRight, Presentation } from "lucide-vue-next"
import { useMarketingStore } from "@/store/MarketingStore"
import {toast} from "vue-sonner"

const marketingStore = useMarketingStore()

const open = ref(false)

const configurationOptions = ["2BHK", "3BHK", "4BHK"]

const form = ref<{
  projectName: string
  location: string
  configuration: string[]
  description: string
}>({
  projectName: "",
  location: "",
  configuration: [],
  description: "",
})

const toggleConfig = (value: string) => {
  const index = form.value.configuration.indexOf(value)
  if (index === -1) {
    form.value.configuration.push(value)
  } else {
    form.value.configuration.splice(index, 1)
  }
}

const submit = async () => {
  try {
    const response = await marketingStore.generatePpt(form.value)

     if(response.status == 201){
      toast.success(response.message)
    }else{
      toast.error(response.message)
    }
    open.value = false
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <!-- CARD -->
  <div
    class="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-primary/50 transition-all duration-300 group shadow-lg"
  >
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="p-3 rounded-lg bg-primary/10">
          <Presentation class="w-6 h-6 text-primary" />
        </div>

        <span
          class="text-[10px] font-bold tracking-widest text-muted-foreground bg-muted px-2.5 py-1 rounded"
        >
          GPT-4O + PPTX
        </span>
      </div>

      <div class="space-y-2">
        <h3 class="text-xl font-semibold text-foreground">
          Presentations (PPT)
        </h3>
        <p class="text-muted-foreground text-sm leading-relaxed">
          Create comprehensive listing presentations, market reports,
          and investor decks in seconds.
        </p>
      </div>
    </div>

    <Button class="flex items-center" @click="open = true">
      Create Now
      <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
    </Button>
  </div>

  <!-- DIALOG -->
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle>Generate Presentation</DialogTitle>
        <DialogDescription>
          Provide project details to generate a professional PPT.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <!-- Project Name -->
        <div class="space-y-1">
          <Label>Project Name</Label>
          <Input v-model="form.projectName" placeholder="Lodha Bellissimo" />
        </div>

        <!-- Location -->
        <div class="space-y-1">
          <Label>Location</Label>
          <Input v-model="form.location" placeholder="Mahalaxmi, Mumbai" />
        </div>

        <!-- Configuration Multi Select -->
        <div class="space-y-1">
          <Label>Configuration</Label>

          <Select>
            <SelectTrigger>
              <SelectValue
                :placeholder="
                  form.configuration.length
                    ? form.configuration.join(', ')
                    : 'Select configurations'
                "
              />
            </SelectTrigger>

            <SelectContent>
              <SelectItem
                v-for="option in configurationOptions"
                :key="option"
                :value="option"
                @click="toggleConfig(option)"
              >
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    class="accent-primary"
                    :checked="form.configuration.includes(option)"
                    readonly
                  />
                  <span>{{ option }}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Description -->
        <div class="space-y-1">
          <Label>Description</Label>
          <Textarea
            v-model="form.description"
            placeholder="Luxury residential project in South Mumbai"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="open = false">
          Cancel
        </Button>
        <Button @click="submit">
          Generate PPT
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
