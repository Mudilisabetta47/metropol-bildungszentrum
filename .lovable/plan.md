
## Google-Bewertung in den Footer integrieren

Du möchtest die Google-Bewertung (4.8 Sterne, 127 Bewertungen) im Footer der Website anzeigen, damit sie auf jeder Seite sichtbar ist.

### Was wird gemacht

**1. Google-Bewertungs-Badge im Footer hinzufügen**
- Ein kompaktes Bewertungs-Widget wird im Footer neben dem Logo oder im Kontakt-Bereich eingebunden
- Anzeige: Google-Logo + 4.8 Sterne + "127 Bewertungen" 
- Klick öffnet das Google Maps Profil

**2. Platzierung**
Das Badge wird im oberen Footer-Bereich unter dem Logo eingefügt, sodass es prominent sichtbar ist, aber nicht aufdringlich wirkt.

### Technische Umsetzung

| Datei | Änderung |
|-------|----------|
| `src/components/layout/Footer.tsx` | Google-Bewertungs-Badge hinzufügen |

Das Badge nutzt dieselben Daten wie bereits in der Features-Sektion (4.8 Sterne, 127 Bewertungen) und verlinkt direkt zum Google Maps Profil von METROPOL Bildungszentrum.

### Ergebnis
Die Google-Bewertung wird auf **jeder Seite** im Footer sichtbar sein - nicht nur auf der Startseite - und stärkt so das Vertrauen der Besucher.
