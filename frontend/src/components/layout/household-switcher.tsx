'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrentHousehold } from '@/lib/hooks/use-current-household';
import { CreateHouseholdDialog } from '@/components/household/create-household-dialog';

export function HouseholdSwitcher() {
  const { households, household, setCurrentHouseholdId } = useCurrentHousehold();
  const [createOpen, setCreateOpen] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between sm:w-56">
            <span className="truncate">{household?.name ?? 'Selecione uma casa'}</span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {households.map((h) => (
            <DropdownMenuItem key={h.id} onClick={() => setCurrentHouseholdId(h.id)}>
              <Check className={`mr-2 h-4 w-4 ${h.id === household?.id ? 'opacity-100' : 'opacity-0'}`} />
              <span className="truncate">{h.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova casa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateHouseholdDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
