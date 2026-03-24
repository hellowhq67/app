
import { getAllCoursesFromSanity } from "@/sanity/lib/fetch";
import { LMSCourseCard } from "@/components/lms/LMSCourseCard";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Courses | Pedagogists PTE",
    description: "Master PTE Academic with our structured video courses and practice modules.",
};

export default async function CoursesPage() {
    let courses: any[] = [];
    try {
        courses = await getAllCoursesFromSanity();
    } catch {
        // Sanity unavailable — render empty state gracefully
    }

    return (
        <div className="min-h-screen bg-background pt-32 pb-20">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        PTE Mastery Courses
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Structured learning paths designed to help you achieve your target score.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.length > 0 ? (
                        courses.map((course: any) => (
                            <LMSCourseCard key={course.slug} course={course} />
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-20 text-muted-foreground border border-dashed rounded-lg">
                            <p>No courses available at the moment. Check back soon!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
