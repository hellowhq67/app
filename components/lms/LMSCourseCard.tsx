
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, PlayCircle } from "lucide-react";

interface LMSCourseCardProps {
    course: {
        title: string;
        slug: string;
        description: string;
        price: number;
        isFree: boolean;
        modules: any[];
    };
}

export function LMSCourseCard({ course }: LMSCourseCardProps) {
    // Calculate total lessons and duration
    const totalLessons = course.modules?.reduce((acc, module) => acc + (module.lessons?.length || 0), 0) || 0;
    const totalDuration = course.modules?.reduce((acc, module) =>
        acc + (module.lessons?.reduce((lAcc: number, lesson: any) => lAcc + (lesson.duration || 0), 0) || 0),
        0) || 0;

    return (
        <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-muted/30 pb-8">
                <div className="flex justify-between items-start mb-4">
                    <Badge variant={course.isFree ? "secondary" : "default"} className={!course.isFree ? "bg-amber-500 hover:bg-amber-600" : ""}>
                        {course.isFree ? "Free" : `$${course.price}`}
                    </Badge>
                </div>
                <CardTitle className="text-2xl mb-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span>{course.modules?.length || 0} Modules</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <PlayCircle className="w-4 h-4 text-primary" />
                        <span>{totalLessons} Lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{totalDuration} mins</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-0">
                <Button className="w-full" asChild>
                    <Link href={`/courses/${course.slug}`}>
                        {course.isFree ? "Start Learning" : "Enroll Now"}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
