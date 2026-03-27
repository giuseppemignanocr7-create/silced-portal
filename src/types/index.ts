export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  slug: string;
  popular?: boolean;
}

export interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  services: Service[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  price: string;
  image?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  slug: string;
}
