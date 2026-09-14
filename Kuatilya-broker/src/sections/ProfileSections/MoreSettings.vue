<script setup lang="ts">
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Lock,
  Bell,
  Shield,
  ChevronRight,
  Trash2,
} from "lucide-vue-next"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
</script>

<template>
  <section class="px-6 mt-10">
    <h2 class="text-[25px] font-semibold mb-4">
      Account & Security Settings
    </h2>

    <Card class="bg-card/80 backdrop-blur">
      <CardContent class="p-0 divide-y divide-border">

        <!-- CHANGE PASSWORD -->
        <!-- <Dialog>
          <DialogTrigger as-child>
            <div
              class="flex items-center justify-between px-6 py-4 hover:bg-muted/40 transition cursor-pointer"
            >
              <div class="flex items-start gap-4">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Lock class="h-5 w-5" />
                </div>

                <div>
                  <p class="font-medium">Change Password</p>
                  <p class="text-sm text-muted-foreground">
                    Update your account security credentials
                  </p>
                </div>
              </div>

              <ChevronRight class="h-5 w-5 text-muted-foreground" />
            </div>
          </DialogTrigger>

          <DialogContent class="sm:max-w-105">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Make sure your new password is strong and secure.
              </DialogDescription>
            </DialogHeader>

            <div class="space-y-4 py-2">
              <div class="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>

              <div class="space-y-2">
                <Label>New Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>

              <div class="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
            </div>

            <DialogFooter>
              <Button variant="secondary">Cancel</Button>
              <Button>Update Password</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog> -->

        <!-- NOTIFICATIONS (no modal yet) -->
        <!-- <div
          class="flex items-center justify-between px-6 py-4 hover:bg-muted/40 transition cursor-pointer"
        >
          <div class="flex items-start gap-4">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Bell class="h-5 w-5" />
            </div>

            <div>
              <p class="font-medium">Email & Push Notifications</p>
              <p class="text-sm text-muted-foreground">
                Configure how you want to be alerted for leads
              </p>
            </div>
          </div>

          <ChevronRight class="h-5 w-5 text-muted-foreground" />
        </div> -->

        <!-- PRIVACY -->
        <!-- <div
          class="flex items-center justify-between px-6 py-4 hover:bg-muted/40 transition cursor-pointer"
        >
          <div class="flex items-start gap-4">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Shield class="h-5 w-5" />
            </div>

            <div>
              <p class="font-medium">Privacy & Visibility</p>
              <p class="text-sm text-muted-foreground">
                Manage who can see your sales history
              </p>
            </div>
          </div>

          <ChevronRight class="h-5 w-5 text-muted-foreground" />
        </div> -->

        <!-- DELETE ACCOUNT -->
        <Dialog>
          <DialogTrigger as-child>
            <div
              class="flex items-center justify-between px-6 py-4 hover:bg-destructive/10 transition cursor-pointer"
            >
              <div class="flex items-start gap-4">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/15 text-destructive"
                >
                  <Trash2 class="h-5 w-5" />
                </div>

                <div>
                  <p class="font-medium text-destructive">Delete Account</p>
                  <p class="text-sm text-destructive/80">
                    Permanently remove your data and access
                  </p>
                </div>
              </div>

              <ChevronRight class="h-5 w-5 text-destructive" />
            </div>
          </DialogTrigger>

          <DialogContent class="sm:max-w-105">
            <DialogHeader>
              <DialogTitle class="text-destructive">
                Delete Account
              </DialogTitle>
              <DialogDescription>
                This action is irreversible. All your data will be permanently deleted.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter class="gap-2">
              <Button variant="secondary">Cancel</Button>
              <Button variant="destructive">
                Yes, delete my account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </CardContent>
    </Card>
  </section>
</template>
