import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Search,
  Download,
  Eye,
  Euro,
  CreditCard,
  Receipt,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Payment {
  id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  invoice_number: string | null;
  invoice_url: string | null;
  notes: string | null;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  registration_id: string | null;
  participant_id: string | null;
  registrations?: {
    first_name: string;
    last_name: string;
    email: string;
    course_dates: {
      courses: { title: string };
      locations: { name: string };
    };
  };
}

const statusOptions = [
  { value: "all", label: "Alle Status" },
  { value: "pending", label: "Offen" },
  { value: "paid", label: "Bezahlt" },
  { value: "partial", label: "Teilbezahlt" },
  { value: "refunded", label: "Erstattet" },
  { value: "cancelled", label: "Storniert" },
];

const statusLabels: Record<string, string> = {
  pending: "Offen",
  paid: "Bezahlt",
  partial: "Teilbezahlt",
  refunded: "Erstattet",
  cancelled: "Storniert",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  partial: "bg-blue-100 text-blue-800",
  refunded: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  paid: <CheckCircle className="h-4 w-4" />,
  partial: <AlertCircle className="h-4 w-4" />,
  refunded: <Receipt className="h-4 w-4" />,
  cancelled: <AlertCircle className="h-4 w-4" />,
};

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    paidThisMonth: 0,
    overdueCount: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          registrations (
            first_name,
            last_name,
            email,
            course_dates (
              courses (title),
              locations (name)
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data || []);

      // Calculate stats
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalRevenue = (data || [])
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const pendingAmount = (data || [])
        .filter((p) => p.status === "pending" || p.status === "partial")
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const paidThisMonth = (data || [])
        .filter((p) => p.status === "paid" && p.paid_at && new Date(p.paid_at) >= monthStart)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const overdueCount = (data || []).filter(
        (p) =>
          (p.status === "pending" || p.status === "partial") &&
          p.due_date &&
          new Date(p.due_date) < now
      ).length;

      setStats({ totalRevenue, pendingAmount, paidThisMonth, overdueCount });
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Zahlungen konnten nicht geladen werden.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const updates: Record<string, unknown> = { status: newStatus };
      if (newStatus === "paid") {
        updates.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("payments")
        .update(updates)
        .eq("id", paymentId);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Zahlungsstatus wurde aktualisiert.",
      });

      fetchPayments();
      setSelectedPayment(null);
    } catch (error) {
      console.error("Error updating payment:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Rechnungsnr.",
      "Teilnehmer",
      "E-Mail",
      "Kurs",
      "Betrag",
      "Status",
      "Zahlungsart",
      "Fällig am",
      "Bezahlt am",
      "Erstellt am",
    ];

    const filteredData = getFilteredPayments();
    const csvContent = [
      headers.join(";"),
      ...filteredData.map((p) =>
        [
          p.invoice_number || "",
          p.registrations
            ? `${p.registrations.first_name} ${p.registrations.last_name}`
            : "",
          p.registrations?.email || "",
          p.registrations?.course_dates?.courses?.title || "",
          p.amount.toFixed(2).replace(".", ","),
          statusLabels[p.status] || p.status,
          p.payment_method || "",
          p.due_date ? format(new Date(p.due_date), "dd.MM.yyyy") : "",
          p.paid_at ? format(new Date(p.paid_at), "dd.MM.yyyy") : "",
          format(new Date(p.created_at), "dd.MM.yyyy"),
        ].join(";")
      ),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `zahlungen_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const getFilteredPayments = () => {
    return payments.filter((p) => {
      const name = p.registrations
        ? `${p.registrations.first_name} ${p.registrations.last_name}`
        : "";
      const matchesSearch =
        searchQuery === "" ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.invoice_number || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const filteredPayments = getFilteredPayments();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Zahlungen</h1>
          <p className="text-muted-foreground">
            {filteredPayments.length} von {payments.length} Zahlungen
          </p>
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gesamtumsatz
            </CardTitle>
            <Euro className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Offene Zahlungen
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.pendingAmount)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Diesen Monat
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.paidThisMonth)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Überfällig
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdueCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Name oder Rechnungsnr. suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status filtern" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teilnehmer</TableHead>
                <TableHead>Kurs</TableHead>
                <TableHead>Betrag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fällig</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Keine Zahlungen gefunden
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {payment.registrations
                            ? `${payment.registrations.first_name} ${payment.registrations.last_name}`
                            : "-"}
                        </div>
                        {payment.invoice_number && (
                          <div className="text-sm text-muted-foreground">
                            #{payment.invoice_number}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {payment.registrations?.course_dates?.courses?.title || "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[payment.status]} flex items-center gap-1 w-fit`}>
                        {statusIcons[payment.status]}
                        {statusLabels[payment.status] || payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.due_date
                        ? format(new Date(payment.due_date), "dd.MM.yyyy", { locale: de })
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zahlungsdetails</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4 pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Teilnehmer</Label>
                  <p className="font-medium">
                    {selectedPayment.registrations
                      ? `${selectedPayment.registrations.first_name} ${selectedPayment.registrations.last_name}`
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">E-Mail</Label>
                  <p className="font-medium">
                    {selectedPayment.registrations?.email || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Kurs</Label>
                  <p className="font-medium">
                    {selectedPayment.registrations?.course_dates?.courses?.title || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Betrag</Label>
                  <p className="font-medium text-lg">
                    {formatCurrency(selectedPayment.amount)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-muted-foreground mb-2 block">Status ändern</Label>
                <div className="flex gap-2 flex-wrap">
                  {["pending", "paid", "partial", "cancelled"].map((status) => (
                    <Button
                      key={status}
                      variant={selectedPayment.status === status ? "default" : "outline"}
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => updatePaymentStatus(selectedPayment.id, status)}
                    >
                      {statusLabels[status]}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedPayment.notes && (
                <div className="border-t pt-4">
                  <Label className="text-muted-foreground">Notizen</Label>
                  <p className="text-sm">{selectedPayment.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
