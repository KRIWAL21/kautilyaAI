<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Label from "@/components/ui/label/Label.vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-vue-next";
import { useBrokerTaskStore } from "@/store/BrokerTaskStore";
import { useTeamMemberStore } from "@/store/TeamMemberStore";

const taskStore = useBrokerTaskStore();
const teamStore = useTeamMemberStore();

const dialogOpen = ref(false);
const isEdit = ref(false);
const editingTaskId = ref<string | null>(null);
const deleteDialogOpen = ref(false);
const deletingTaskId = ref<string | null>(null);

// Form
const form = ref({
  title: "",
  teamMemberId: "",
  description: "",
  priority: "Medium",
  status: "Pending",
  dueDate: "",
});

const getStatusLabel = (status: string) => {
  if (status === "InProgress") return "In Progress";
  return status;
};

onMounted(async () => {
  await Promise.all([
    taskStore.fetchTasks(),
    teamStore.fetchTeamMembers()
  ]);
});

// Add OR Update Task
const saveTask = async () => {
  if (!form.value.title || !form.value.teamMemberId) return;

  try {
    if (isEdit.value && editingTaskId.value) {
      // UPDATE
      await taskStore.updateTask(editingTaskId.value, form.value);
    } else {
      // CREATE
      await taskStore.createTask(form.value);
    }
    resetForm();
  } catch(e) {
    console.error(e);
  }
};

// Edit Task
const editTask = (task: any) => {
  form.value = { 
    title: task.title,
    teamMemberId: task.teamMemberId?._id || task.teamMemberId,
    description: task.description || "",
    priority: task.priority || "Medium",
    status: task.status || "Pending",
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
  };
  editingTaskId.value = task._id;
  isEdit.value = true;
  dialogOpen.value = true;
};

// Delete Task
const deleteTask = (id: string) => {
  deletingTaskId.value = id;
  deleteDialogOpen.value = true;
};

const confirmDeleteTask = async () => {
  if (!deletingTaskId.value) return;

  await taskStore.deleteTask(deletingTaskId.value);
  deleteDialogOpen.value = false;
  deletingTaskId.value = null;
};

const startCreateTask = () => {
  form.value = {
    title: "",
    teamMemberId: "",
    description: "",
    priority: "Medium",
    status: "Pending",
    dueDate: "",
  };
  isEdit.value = false;
  editingTaskId.value = null;
  dialogOpen.value = true;
};

// Reset form
const resetForm = () => {
  form.value = {
    title: "",
    teamMemberId: "",
    description: "",
    priority: "Medium",
    status: "Pending",
    dueDate: "",
  };
  isEdit.value = false;
  editingTaskId.value = null;
  dialogOpen.value = false;
};

</script>

<template>
  <section class="space-y-4 px-6 bg-background">
    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Task Management</h1>

      <Dialog v-model:open="dialogOpen">
        <DialogTrigger as-child>
          <Button @click="startCreateTask()">
            <Plus class="size-4!" />
            Add Task</Button>
        </DialogTrigger>

        <DialogContent class="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {{ isEdit ? "Edit Task" : "Create Task" }}
            </DialogTitle>
          </DialogHeader>

          <div class="space-y-3">
            <!-- TITLE -->
            <div class="space-y-1">
              <Label>Task Title *</Label>
              <Input v-model="form.title" placeholder="Enter task title" required />
            </div>

            <!-- ASSIGN -->
            <div class="space-y-1">
              <Label>Assign To *</Label>
              <select
                v-model="form.teamMemberId"
                class="w-full rounded-md border bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Select member</option>
                <option
                  v-for="member in teamStore.teamMembers"
                  :key="member._id"
                  :value="member._id"
                >
                  {{ member.name }}
                </option>
              </select>
            </div>

            <!-- DESCRIPTION -->
            <div class="space-y-1">
              <Label>Description</Label>
              <Input v-model="form.description" placeholder="Description details" />
            </div>

            <!-- DUE DATE -->
            <div class="space-y-1">
              <Label>Due Date</Label>
              <Input type="date" v-model="form.dueDate" />
            </div>

            <!-- PRIORITY -->
            <div class="space-y-1">
              <Label>Priority</Label>
              <select
                v-model="form.priority"
                class="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <!-- STATUS -->
            <div class="space-y-1">
              <Label>Status</Label>
              <select
                v-model="form.status"
                class="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="Pending">Pending</option>
                <option value="InProgress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <Button class="w-full mt-4" @click="saveTask" :disabled="taskStore.saving">
              <Loader2 v-if="taskStore.saving" class="mr-2 h-4 w-4 animate-spin" />
              {{ isEdit ? "Update Task" : "Save Task" }}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog v-model:open="deleteDialogOpen">
        <DialogContent class="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>

          <p class="text-sm text-muted-foreground">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>

          <div class="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              @click="deleteDialogOpen = false"
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              @click="confirmDeleteTask"
              :disabled="taskStore.saving"
            >
              <Loader2
                v-if="taskStore.saving"
                class="mr-2 h-4 w-4 animate-spin"
              />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

    <!-- ERROR VIEW -->
    <div v-if="taskStore.error" class="p-4 bg-red-100 text-red-700 rounded-md">
      {{ taskStore.error }}
    </div>

    <!-- LOADING VIEW -->
    <div v-if="taskStore.loading" class="flex justify-center p-12">
      <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
    </div>

    <!-- TASK LIST -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="task in taskStore.tasks"
        :key="task._id"
        class="p-4 space-y-4 relative"
      >
        <!-- ACTIONS -->
        <div class="absolute top-2 right-2 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            @click="editTask(task)"
            :disabled="taskStore.saving"
          >
            Edit
          </Button>

          <Button
            size="sm"
            variant="destructive"
            @click="deleteTask(task._id)"
            :disabled="taskStore.saving"
          >
            Delete
          </Button>
        </div>

        <!-- INFO -->
        <div class="w-[80%] pr-4 pt-8">
          <h2 class="font-semibold text-lg leading-tight">{{ task.title }}</h2>
          <p class="text-sm text-muted-foreground mt-1 line-clamp-2" :title="task.description">
            {{ task.description || "No description provided." }}
          </p>
          <div class="mt-3 text-sm text-foreground">
            <strong>Assigned:</strong> 
            {{ task.teamMemberId?.name || "Unknown" }}
          </div>
          <div class="mt-1 text-xs text-muted-foreground" v-if="task.dueDate">
            Due: {{ new Date(task.dueDate).toLocaleDateString() }}
          </div>
        </div>

        <!-- BADGES -->
        <div class="flex gap-2 flex-wrap mt-auto">
          <span 
            class="text-xs px-2 py-1 rounded-md"
            :class="{
              'bg-red-100 text-red-800': task.priority === 'High',
              'bg-yellow-100 text-yellow-800': task.priority === 'Medium',
              'bg-blue-100 text-blue-800': task.priority === 'Low'
            }"
          >
            {{ task.priority }}
          </span>

          <span 
            class="text-xs px-2 py-1 rounded-md"
            :class="{
              'bg-green-100 text-green-800': task.status === 'Completed',
              'bg-blue-100 text-blue-800': task.status === 'In Progress' || task.status === 'InProgress',
              'bg-gray-100 text-gray-800': task.status === 'Pending'
            }"
          >
            {{ getStatusLabel(task.status) }}
          </span>
        </div>
      </Card>
      
      <div v-if="taskStore.tasks.length === 0" class="col-span-full py-12 text-center text-muted-foreground">
        No tasks assigned. Click "Add Task" to create one.
      </div>
    </div>
  </section>
</template>