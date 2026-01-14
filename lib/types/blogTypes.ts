export interface BlogPost {
    slug: string;
    title: string;
    description: string;
    author: string;
    date: string;
    tags: string[];
    image: string;
    seoKeywords: string[];
    content: string;
    isPaid?: boolean;
}

export interface BlogSearchProps {
    onSearch: (query: string) => void;
}

export interface BlogListProps {
    posts: BlogPost[];
}

export interface BlogCardProps {
    post: BlogPost;
}
