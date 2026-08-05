<script setup lang="ts">
import { ref } from 'vue';
import { Copy, UserPlus } from '@lucide/vue';
import { toast } from 'vue-sonner';
import Button from '@/components/ui/Button.vue';
import { Card, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/layout/PageHeader.vue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuditLogList from '@/components/household/AuditLogList.vue';
import InviteDialog from '@/components/household/InviteDialog.vue';
import InvitesList from '@/components/household/InvitesList.vue';
import MemberList from '@/components/household/MemberList.vue';
import { useCurrentHousehold } from '@/composables/useCurrentHousehold';

const { household, householdId } = useCurrentHousehold();
const inviteOpen = ref(false);

function copyInviteCode() {
  if (!household.value) return;
  navigator.clipboard.writeText(household.value.inviteCode);
  toast.success('Código de convite copiado');
}
</script>

<template>
  <div v-if="household && householdId">
    <PageHeader :title="household.name" :description="household.description || 'Gerencie os moradores da casa'">
      <template #actions>
        <Button variant="outline" @click="copyInviteCode">
          <Copy class="h-4 w-4" />
          Código: {{ household.inviteCode }}
        </Button>
        <Button @click="inviteOpen = true">
          <UserPlus class="h-4 w-4" />
          Convidar
        </Button>
      </template>
    </PageHeader>

    <Tabs default-value="members">
      <TabsList>
        <TabsTrigger value="members">Moradores</TabsTrigger>
        <TabsTrigger value="invites">Convites</TabsTrigger>
        <TabsTrigger value="audit">Auditoria</TabsTrigger>
      </TabsList>
      <TabsContent value="members">
        <Card>
          <CardContent class="pt-6">
            <MemberList :household-id="householdId" :owner-id="household.ownerId" />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="invites">
        <Card>
          <CardContent class="pt-6">
            <InvitesList :household-id="householdId" />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="audit">
        <Card>
          <CardContent class="pt-6">
            <AuditLogList :household-id="householdId" />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <InviteDialog v-model:open="inviteOpen" :household-id="householdId" />
  </div>
</template>
