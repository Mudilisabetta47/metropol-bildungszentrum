import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Loader2,
  Ban,
} from "lucide-react";

interface InvoiceCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceNumber: string;
  onConfirm: (reason: string) => Promise<void>;
  isPending: boolean;
}

export function InvoiceCancelDialog({
  open,
  onOpenChange,
  invoiceNumber,
  onConfirm,
  isPending,
}: InvoiceCancelDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    await onConfirm(reason);
    setReason("");
    onOpenChange(false);
  };

  const handleClose = () => {
    if (!isPending) {
      setReason("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Rechnung stornieren
          </DialogTitle>
          <DialogDescription>
            Sie sind dabei, die Rechnung <strong>{invoiceNumber}</strong> zu stornieren.
            Diese Aktion wird GoBD-konform protokolliert und kann nicht rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cancelReason">Stornierungsgrund *</Label>
            <Textarea
              id="cancelReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Bitte geben Sie den Grund für die Stornierung an..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Der Stornierungsgrund wird dauerhaft in der Rechnungshistorie gespeichert.
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <h4 className="font-medium text-amber-800 dark:text-amber-200 text-sm mb-1">
              Hinweis zur Stornierung
            </h4>
            <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
              <li>• Die Rechnung wird als "Storniert" markiert</li>
              <li>• Der Betrag wird nicht mehr als offen gezählt</li>
              <li>• Die Stornierung wird revisionssicher protokolliert</li>
              <li>• Der Kunde erhält ggf. eine Stornorechnung</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird storniert...
              </>
            ) : (
              <>
                <Ban className="mr-2 h-4 w-4" />
                Rechnung stornieren
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
