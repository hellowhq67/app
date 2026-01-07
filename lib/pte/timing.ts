export function formatLabel(section: string, questionType?: string): string {
    if (questionType) return questionType.replace(/_/g, ' ')
    return section
}
