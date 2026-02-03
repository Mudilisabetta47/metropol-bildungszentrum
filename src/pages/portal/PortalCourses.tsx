import { PortalLayout } from "@/components/portal/PortalLayout";
import { useParticipantCourses } from "@/hooks/usePortal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Calendar, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function PortalCourses() {
  const { data: courses, isLoading } = useParticipantCourses();

  const activeCourses = courses?.filter(c => c.status === "confirmed" || c.status === "pending") || [];
  const completedCourses = courses?.filter(c => c.status === "completed") || [];
  const cancelledCourses = courses?.filter(c => c.status === "cancelled") || [];

  const formatDate = (date: string) => {
    return format(new Date(date), "dd.MM.yyyy", { locale: de });
  };

  const formatTime = (time: string | null) => {
    if (!time) return null;
    return time.slice(0, 5);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Bestätigt</Badge>;
      case "pending":
        return <Badge variant="secondary">Ausstehend</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Abgeschlossen</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Storniert</Badge>;
      case "waitlist":
        return <Badge variant="outline">Warteliste</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const CourseCard = ({ course }: { course: typeof courses extends (infer T)[] | undefined ? T : never }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <div>
                <h3 className="font-semibold text-lg">
                  {course.course_dates?.courses?.title || "Kurs"}
                </h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {course.course_dates?.courses?.category}
                </p>
              </div>

              <div className="space-y-1">
                {course.course_dates?.start_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatDate(course.course_dates.start_date)}
                      {course.course_dates.end_date && course.course_dates.end_date !== course.course_dates.start_date && (
                        <> – {formatDate(course.course_dates.end_date)}</>
                      )}
                    </span>
                  </div>
                )}

                {course.course_dates?.start_time && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatTime(course.course_dates.start_time)}
                      {course.course_dates.end_time && (
                        <> – {formatTime(course.course_dates.end_time)} Uhr</>
                      )}
                    </span>
                  </div>
                )}

                {course.course_dates?.locations && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {course.course_dates.locations.name}
                      {course.course_dates.locations.address && (
                        <span className="text-muted-foreground">
                          {" "}• {course.course_dates.locations.address}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(course.status)}
            <span className="text-xs text-muted-foreground">
              Angemeldet: {formatDate(course.created_at)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12">
      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meine Kurse</h1>
          <p className="text-muted-foreground mt-1">
            Übersicht Ihrer gebuchten und abgeschlossenen Kurse
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList>
              <TabsTrigger value="active">
                Aktiv ({activeCourses.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Abgeschlossen ({completedCourses.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Storniert ({cancelledCourses.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              {activeCourses.length === 0 ? (
                <EmptyState message="Keine aktiven Kurse vorhanden" />
              ) : (
                <div className="space-y-4">
                  {activeCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              {completedCourses.length === 0 ? (
                <EmptyState message="Keine abgeschlossenen Kurse vorhanden" />
              ) : (
                <div className="space-y-4">
                  {completedCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="mt-6">
              {cancelledCourses.length === 0 ? (
                <EmptyState message="Keine stornierten Kurse vorhanden" />
              ) : (
                <div className="space-y-4">
                  {cancelledCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PortalLayout>
  );
}
