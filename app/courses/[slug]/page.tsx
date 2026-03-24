
import { getCourseBySlugFromSanity } from "@/sanity/lib/fetch";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, PlayCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function CoursePage({ params }: PageProps) {
    const { slug } = await params;
    let course: any = null;
    try {
        course = await getCourseBySlugFromSanity(slug);
    } catch {
        // Sanity unavailable
    }

    if (!course) {
        notFound();
    }

    const totalLessons = course.modules?.reduce((acc: number, module: any) => acc + (module.lessons?.length || 0), 0) || 0;
    const totalDuration = course.modules?.reduce((acc: number, module: any) =>
        acc + (module.lessons?.reduce((lAcc: number, lesson: any) => lAcc + (lesson.duration || 0), 0) || 0),
        0) || 0;

    return (
        <div className="min-h-screen bg-background pt-32 pb-20">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Course Sidebar / Info */}
                    <div className="lg:w-1/3 order-2 lg:order-1">
                        <div className="sticky top-32 p-6 rounded-xl border bg-card shadow-sm">
                            <Badge variant={course.isFree ? "secondary" : "default"} className="mb-4">
                                {course.isFree ? "Free" : `$${course.price}`}
                            </Badge>
                            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                            <p className="text-muted-foreground mb-8">
                                {course.description}
                            </p>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-sm">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                    <span>{course.modules?.length || 0} Modules</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <PlayCircle className="w-5 h-5 text-primary" />
                                    <span>{totalLessons} Lessons</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Clock className="w-5 h-5 text-primary" />
                                    <span>{totalDuration} mins total content</span>
                                </div>
                            </div>

                            <Button className="w-full text-lg py-6" size="lg">
                                {course.isFree ? "Start Learning Now" : "Enroll in Course"}
                            </Button>
                        </div>
                    </div>

                    {/* Course Content / Modules */}
                    <div className="lg:w-2/3 order-1 lg:order-2">
                        <h2 className="text-2xl font-bold mb-8">Course Curriculum</h2>
                        <div className="space-y-6">
                            {course.modules?.map((module: any, index: number) => (
                                <div key={index} className="rounded-xl border bg-card overflow-hidden">
                                    <div className="bg-muted/30 px-6 py-4 border-b">
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            <span className="text-primary">Module {index + 1}:</span>
                                            {module.title}
                                        </h3>
                                    </div>
                                    <div className="divide-y">
                                        {module.lessons?.map((lesson: any, lIndex: number) => (
                                            <div key={lIndex} className="px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                                                        {lIndex + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{lesson.title}</p>
                                                        <p className="text-xs text-muted-foreground">{lesson.duration} mins</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {lesson.isFree && (
                                                        <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">Preview</Badge>
                                                    )}
                                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
