<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, MessageSquare } from "lucide-vue-next";
import { useMarketingStore } from "@/store/MarketingStore";
import { toast } from "vue-sonner";

const marketingStore = useMarketingStore();

const open = ref(false);

const form = ref({
  projectName: "",
  offer: "",
  configuration: "",
  location: "",
});

const submit = async () => {
  try {
    const response = await marketingStore.generateWhatsapp(form.value);

    if (response.status == 201) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }

    open.value = false;
  } catch (error) {
    console.error(error);
  }
};
</script>

<template>
  <!-- CARD -->
  <div
    class="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-primary/50 transition-all duration-300 group shadow-lg"
  >
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="p-3 rounded-lg bg-primary/10">
          <MessageSquare class="w-6 h-6 text-primary" />
        </div>

        <span
          class="text-[10px] font-bold tracking-widest text-muted-foreground bg-muted px-2.5 py-1 rounded"
        >
          NLP TEMPLATES
        </span>
      </div>

      <div class="space-y-2">
        <h3 class="text-xl font-semibold text-foreground">WhatsApp Messages</h3>
        <p class="text-muted-foreground text-sm leading-relaxed">
          Craft lead nurture scripts and automated follow-up templates that
          sound personal and professional.
        </p>
      </div>
    </div>

    <Button class="flex items-center" @click="open = true">
      Create Now
      <ArrowRight
        class="w-4 h-4 transition-transform group-hover:translate-x-1"
      />
    </Button>
  </div>

  <!-- DIALOG -->
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-120">
      <DialogHeader>
        <DialogTitle>Generate WhatsApp Message</DialogTitle>
        <DialogDescription>
          Fill in the details to generate a WhatsApp marketing message.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <div class="space-y-1">
          <Label>Project Name</Label>
          <Input
            v-model="form.projectName"
            class="mt-2"
            placeholder="Lodha Bellissimo"
          />
        </div>

        <div class="space-y-1">
          <Label>Offer</Label>
          <Input
            v-model="form.offer"
            class="mt-2"
            placeholder="Limited Time Offer - Book Now and Get 20% Off!"
          />
        </div>

        <div class="space-y-1">
          <Label>Configuration</Label>
          <Input
            v-model="form.configuration"
            class="mt-2"
            placeholder="3BHK, 4BHK"
          />
        </div>

        <div class="space-y-1">
          <Label>Location</Label>
          <Input
            v-model="form.location"
            class="mt-2"
            placeholder="Mahalaxmi, Mumbai"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="open = false"> Cancel </Button>
        <Button @click="submit"> Generate Message </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
