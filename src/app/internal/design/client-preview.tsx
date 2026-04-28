"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

export function ClientPreview() {
  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h3
            className="mb-3 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--ink-mute)" }}
          >
            Dialog
          </h3>
          <Dialog>
            <DialogTrigger
              render={
                <Button variant="outline" type="button">
                  Open Dialog
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Voorbeeld Dialog</DialogTitle>
                <DialogDescription>
                  shadcn Dialog gebruikt globals.css aliases voor achtergrond + tekstkleur.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        <div>
          <h3
            className="mb-3 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--ink-mute)" }}
          >
            DropdownMenu
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" type="button">
                  Open Menu
                </Button>
              }
            />
            <DropdownMenuContent>
              <DropdownMenuItem>Eerste actie</DropdownMenuItem>
              <DropdownMenuItem>Tweede actie</DropdownMenuItem>
              <DropdownMenuItem>Derde actie</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <h3
            className="mb-3 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--ink-mute)" }}
          >
            Tabs
          </h3>
          <Tabs defaultValue="overzicht" className="max-w-md">
            <TabsList>
              <TabsTrigger value="overzicht">Overzicht</TabsTrigger>
              <TabsTrigger value="prognose">Prognose</TabsTrigger>
              <TabsTrigger value="trust">Trust</TabsTrigger>
            </TabsList>
            <TabsContent value="overzicht">Tab content for overzicht.</TabsContent>
            <TabsContent value="prognose">Tab content for prognose.</TabsContent>
            <TabsContent value="trust">Tab content for trust.</TabsContent>
          </Tabs>
        </div>

        <div>
          <h3
            className="mb-3 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--ink-mute)" }}
          >
            Tooltip
          </h3>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="outline" type="button">
                  Hover voor tooltip
                </Button>
              }
            />
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </div>

        <div>
          <h3
            className="mb-3 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--ink-mute)" }}
          >
            Toast (sonner)
          </h3>
          <Button
            variant="outline"
            type="button"
            onClick={() =>
              toast.success("Opgeslagen — sonner draait via <Toaster /> in layout.tsx")
            }
          >
            Trigger toast
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
