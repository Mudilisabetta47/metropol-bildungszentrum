import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-28 sm:pt-32 pb-16">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-8">
              Datenschutzerklärung
            </h1>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  1. Datenschutz auf einen Blick
                </h2>
                
                <h3 className="font-semibold text-foreground mt-6 mb-2">Allgemeine Hinweise</h3>
                <p className="text-muted-foreground">
                  Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren 
                  personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene 
                  Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
                </p>

                <h3 className="font-semibold text-foreground mt-6 mb-2">Datenerfassung auf dieser Website</h3>
                <p className="text-muted-foreground">
                  <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
                  Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen 
                  Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
                </p>
                <p className="text-muted-foreground mt-4">
                  <strong>Wie erfassen wir Ihre Daten?</strong><br />
                  Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann 
                  es sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben. Andere Daten 
                  werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere 
                  IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, 
                  Betriebssystem oder Uhrzeit des Seitenaufrufs).
                </p>
                <p className="text-muted-foreground mt-4">
                  <strong>Wofür nutzen wir Ihre Daten?</strong><br />
                  Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu 
                  gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
                </p>
                <p className="text-muted-foreground mt-4">
                  <strong>Welche Rechte haben Sie bezüglich Ihrer Daten?</strong><br />
                  Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck 
                  Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, 
                  die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur 
                  Datenverarbeitung erteilt haben, können Sie diese Einwilligung jederzeit für die Zukunft 
                  widerrufen. Außerdem haben Sie das Recht, unter bestimmten Umständen die Einschränkung 
                  der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  2. Verantwortliche Stelle
                </h2>
                <p className="text-muted-foreground">
                  Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
                </p>
                <p className="text-muted-foreground mt-4">
                  Metropol Bildungszentrum GmbH<br />
                  Vahrenwalder Str. 213<br />
                  30165 Hannover<br /><br />
                  Telefon: 0511 123 456<br />
                  E-Mail: info@mep-agentur.de
                </p>
                <p className="text-muted-foreground mt-4">
                  Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder 
                  gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen 
                  Daten entscheidet.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  3. Datenerfassung auf dieser Website
                </h2>

                <h3 className="font-semibold text-foreground mt-6 mb-2">Cookies</h3>
                <p className="text-muted-foreground">
                  Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine Datenpakete 
                  und richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für 
                  die Dauer einer Sitzung (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem 
                  Endgerät gespeichert. Session-Cookies werden nach Ende Ihres Besuchs automatisch 
                  gelöscht. Permanente Cookies bleiben auf Ihrem Endgerät gespeichert, bis Sie diese 
                  selbst löschen oder eine automatische Löschung durch Ihren Webbrowser erfolgt.
                </p>

                <h3 className="font-semibold text-foreground mt-6 mb-2">Kontaktformular</h3>
                <p className="text-muted-foreground">
                  Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem 
                  Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung 
                  der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben 
                  wir nicht ohne Ihre Einwilligung weiter.
                </p>
                <p className="text-muted-foreground mt-4">
                  Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, 
                  sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung 
                  vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die 
                  Verarbeitung auf unserem berechtigten Interesse an der effektiven Bearbeitung der an uns 
                  gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO) oder auf Ihrer Einwilligung (Art. 6 
                  Abs. 1 lit. a DSGVO) sofern diese abgefragt wurde.
                </p>

                <h3 className="font-semibold text-foreground mt-6 mb-2">Anfrage per E-Mail oder Telefon</h3>
                <p className="text-muted-foreground">
                  Wenn Sie uns per E-Mail oder Telefon kontaktieren, wird Ihre Anfrage inklusive aller 
                  daraus hervorgehenden personenbezogenen Daten (Name, Anfrage) zum Zwecke der Bearbeitung 
                  Ihres Anliegens bei uns gespeichert und verarbeitet.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  4. Kursanmeldung und Registrierung
                </h2>
                <p className="text-muted-foreground">
                  Wenn Sie sich für einen unserer Kurse anmelden, erheben wir folgende Daten:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                  <li>Vor- und Nachname</li>
                  <li>E-Mail-Adresse</li>
                  <li>Telefonnummer</li>
                  <li>Anschrift</li>
                  <li>Geburtsdatum</li>
                  <li>Gewünschter Kurs und Standort</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Diese Daten werden zur Durchführung des Kurses, zur Kommunikation mit Ihnen und zur 
                  Erfüllung gesetzlicher Aufbewahrungspflichten verwendet. Die Rechtsgrundlage für die 
                  Verarbeitung ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  5. Ihre Rechte
                </h2>
                <p className="text-muted-foreground">
                  Sie haben folgende Rechte hinsichtlich Ihrer personenbezogenen Daten:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                  <li><strong>Auskunftsrecht:</strong> Sie können Auskunft über Ihre von uns verarbeiteten personenbezogenen Daten verlangen.</li>
                  <li><strong>Berichtigungsrecht:</strong> Sie können die Berichtigung unrichtiger Daten verlangen.</li>
                  <li><strong>Löschungsrecht:</strong> Sie können die Löschung Ihrer Daten verlangen.</li>
                  <li><strong>Einschränkung der Verarbeitung:</strong> Sie können die Einschränkung der Verarbeitung Ihrer Daten verlangen.</li>
                  <li><strong>Datenübertragbarkeit:</strong> Sie können verlangen, Ihre Daten in einem strukturierten Format zu erhalten.</li>
                  <li><strong>Widerspruchsrecht:</strong> Sie können der Verarbeitung Ihrer Daten widersprechen.</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  6. SSL- bzw. TLS-Verschlüsselung
                </h2>
                <p className="text-muted-foreground">
                  Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher 
                  Inhalte, wie zum Beispiel Bestellungen oder Anfragen, die Sie an uns als Seitenbetreiber 
                  senden, eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie 
                  daran, dass die Adresszeile des Browsers von „http://" auf „https://" wechselt und an dem 
                  Schloss-Symbol in Ihrer Browserzeile.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  7. Speicherdauer
                </h2>
                <p className="text-muted-foreground">
                  Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt 
                  wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die 
                  Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen oder 
                  eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern 
                  wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer personenbezogenen 
                  Daten haben (z.B. steuer- oder handelsrechtliche Aufbewahrungsfristen); im letztgenannten 
                  Fall erfolgt die Löschung nach Fortfall dieser Gründe.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  8. Änderung dieser Datenschutzerklärung
                </h2>
                <p className="text-muted-foreground">
                  Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den 
                  aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in 
                  der Datenschutzerklärung umzusetzen. Für Ihren erneuten Besuch gilt dann die neue 
                  Datenschutzerklärung.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  9. Fragen zum Datenschutz
                </h2>
                <p className="text-muted-foreground">
                  Wenn Sie Fragen zum Datenschutz haben, schreiben Sie uns bitte eine E-Mail an:{" "}
                  <a href="mailto:info@mep-agentur.de" className="text-primary hover:underline">
                    info@mep-agentur.de
                  </a>
                </p>
              </section>

              <p className="text-sm text-muted-foreground mt-12">
                Stand: {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
