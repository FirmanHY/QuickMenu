export interface Recipe {
    id: string;
    image: string;
    title: string;
    duration: string;
    category: string;
    source?: string;
    isBookmarked: boolean;
}

export const dummyRecipes: Recipe[] = [
    {
        id: "1",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
        title: "Healthy Taco Salad with fresh vegetable",
        duration: "12 Min",
        category: "#FavoritAnak",
        isBookmarked: true
    },
    {
        id: "2",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
        title: "Creamy Pasta Carbonara",
        duration: "25 Min",
        category: "#DinnerIdea",
        source: "YouTube",
        isBookmarked: false
    },
    {
        id: "3",
        image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800",
        title: "Blueberry Pancakes Stack",
        duration: "15 Min",
        category: "#Breakfast",
        source: "Instagram",
        isBookmarked: true
    },
    {
        id: "4",
        image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800",
        title: "Fresh Garden Salad Bowl",
        duration: "8 Min",
        category: "#Healthy",
        isBookmarked: false
    },
    {
        id: "5",
        image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800",
        title: "Spicy Pepperoni Pizza",
        duration: "30 Min",
        category: "#DinnerIdea",
        source: "YouTube",
        isBookmarked: true
    },
    {
        id: "6",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
        title: "Asian Noodle Soup",
        duration: "20 Min",
        category: "#Lunch",
        isBookmarked: false
    }
];
