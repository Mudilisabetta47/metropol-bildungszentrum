
## Ziel

Drei zusammenhängende Erweiterungen im Admin-Bereich:

1. **Kostenvoranschläge** als eigenständiges Modul (eigene Tabelle + Menüpunkt, PDF im gleichen Layout wie Rechnungen).
2. **Leistungskatalog** mit Kategorien, damit Positionen einmal gepflegt und in Rechnungen/Kostenvoranschlägen ausgewählt werden können.
3. **Umsatzsteuerbefreiung** nach §4 Nr. 21 UStG global umsetzen (0 % MwSt., klarer Hinweistext auf allen Dokumenten).

---

## 1. Datenbank (Migration)

**Neue Tabelle `service_catalog_categories`**
- `name`, `sort_order`, `is_active`
- Vorbefüllt mit: BKF-Weiterbildung, Führerscheinausbildung, Prüfungsgebühren, Sonstiges

**Neue Tabelle `service_catalog_items`**
- `category_id` (FK), `name`, `description`, `unit` (Stück/Stunde/Pauschal), `unit_price`, `is_active`, `sort_order`

**Neue Tabelle `quotes`** (Struktur analog zu `invoices`)
- `quote_number` (eigener Zähler `quote_number_prefix` / `quote_number_counter` in `site_settings`, Format `KV-2026-00001`)
- Empfängerdaten, Beträge, `status` (draft/sent/accepted/declined/expired/converted)
- `valid_until` (Gültigkeitsdatum), `notes`
- `converted_to_invoice_id` (FK, nullable) für spätere Umwandlung → Rechnung
- Soft-Delete + Version wie bei Rechnungen

**Neue Tabelle `quote_items`** – identisch aufgebaut wie `invoice_items`.

**Site-Settings-Erweiterungen**
- `vat_exemption_active` = `true`
- `vat_exemption_note` = „Umsatzsteuerbefreit gemäß §4 Nr. 21 UStG (Bildungsleistung)."
- Standard-MwSt.-Satz für neue Belege auf `0` setzen.

**RLS / Grants** für alle vier neuen Tabellen: Zugriff nur für `admin`/`employee` via `is_staff(auth.uid())`, plus `service_role` full. Trigger `update_updated_at_column` und History-Trigger analog zu Rechnungen für `quotes`.

---

## 2. Admin-Menü und Seiten

Neue Routen in `AdminLayout` + `App.tsx`:

- `/admin/quotes` — Übersicht Kostenvoranschläge (Liste, Filter, Statistik-Karten analog Rechnungen)
- `/admin/quotes/:id` — Detail mit PDF-Download, „In Rechnung umwandeln"-Button
- `/admin/service-catalog` — Leistungskatalog: Kategorien-Sidebar links, Positionen rechts, CRUD

Formular `QuoteForm.tsx` (Struktur von `InvoiceForm` übernommen) mit einem zusätzlichen **Positions-Auswahldialog**: Kategorie-Filter oben, Suche, Klick fügt Position übernommen (Bezeichnung, Einheit, Preis) hinzu. Der gleiche Dialog wird in `InvoiceForm` integriert.

**Umwandlung KV → Rechnung**: Button erzeugt Rechnung mit allen Positionen, setzt `quotes.status='converted'` und `quotes.converted_to_invoice_id`.

---

## 3. USt-Befreiung

- MwSt.-Satz default `0`, MwSt.-Betrag = 0.
- PDF-Generator (`invoice-pdf.ts` und neuer `quote-pdf.ts`) zeigt:
  - Betragsblock ohne MwSt.-Zeile, statt „zzgl. MwSt." erscheint der Hinweistext aus `site_settings.vat_exemption_note` direkt unter der Summenzeile.
  - Zusätzlicher Fußnotenhinweis im Textblock „Rechnungsbetrag ist umsatzsteuerbefreit gemäß §4 Nr. 21 UStG."
- Rechnungs-/KV-Formular blendet MwSt.-Feld aus, solange `vat_exemption_active=true` (in Einstellungen umschaltbar).
- Anzeige des Hinweistexts auch in der Detailansicht (Admin + Portal).

---

## 4. PDF-Vorlage

`quote-pdf.ts` wird als Kopie von `invoice-pdf.ts` erstellt (gleiche schwarze Kopfleiste, Logo, Absenderzeile, Fußzeile). Änderungen:

- Titel „Kostenvoranschlag" statt „Rechnung"
- Metadatenblock: „Kostenvoranschlag Nr.", „Gültig bis"
- Einleitungstext: „gerne unterbreiten wir Ihnen folgenden Kostenvoranschlag:"
- Schlusstext: Hinweis zur Bindungsfrist und §4 Nr. 21 UStG
- Keine Zahlungsaufforderung / Bankverbindung optional (nur Info)

Gleiches Cleanup (0 % MwSt.-Hinweis) in `invoice-pdf.ts`.

---

## 5. Portal (kleine Ergänzung)

Portal zeigt Kostenvoranschläge nur, wenn später gewünscht — in diesem Schritt **nicht** einbauen (kein User-Request).

---

## Technische Details

- Neue Hooks: `useQuotes`, `useServiceCatalog` (React Query, gleicher Stil wie `useInvoices`).
- Types werden nach Migration automatisch regeneriert (`src/integrations/supabase/types.ts`).
- Bestehende History-Funktion `log_invoice_changes` wird geklont zu `log_quote_changes`.
- Der Leistungskatalog-Dialog wird als wiederverwendbare Komponente `ServiceItemPicker.tsx` gebaut und in `InvoiceForm` + `QuoteForm` eingebunden.

---

## Nicht enthalten (bitte melden, falls doch gewünscht)

- Öffentliche KV-Anfrage über Kontaktformular
- Digitale Zustimmung („Akzeptieren"-Link für Kunden)
- Portal-Ansicht für Teilnehmer
